# Payment Status Screen Documentation (Mobile)

## Table of Contents
- [Imports](#imports)
- [Context and State Management](#context-and-state-management)
- [UI Structure](#ui-structure)
- [Planned Layout](#planned-layout)
- [Sketch Wireframe](#sketch-wireframe)
- [Socket.IO Integration](#socketio-integration)
- [API Integration](#api-integration)
- [Components Used](#components-used)
- [Error Handling](#error-handling)
- [Navigation Flow](#navigation-flow)
- [Functions Involved](#functions-involved)
- [Future Enhancements](#future-enhancements)

## Imports
```tsx
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import { View, Text, TouchableOpacity, ActivityIndicator, SafeAreaView, ScrollView } from 'react-native';
import io, { Socket } from 'socket.io-client';
import { useGetPaymentById, useQueryMpesaStatus } from '@/tanstack/usePayments';
import { API_BASE_URL } from '@/api/config';
import { formatPaymentStatus, getPaymentStatusVariant, formatCurrency } from '@/utils/paymentUtils';
import { formatDateTimeWithTime } from '@/utils/notificationUtils';
import type { IPayment } from '@/types/api.types';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
```

## Context and State Management
- **Route Params:** `useLocalSearchParams()` extracts `paymentId` and `checkoutId` from URL.
- **TanStack Query:** 
  - `useGetPaymentById(paymentId)` fetches payment data.
  - `useQueryMpesaStatus(checkoutId)` queries M-Pesa status as fallback (enabled: false, manually triggered).
- **Socket.IO:**
  - `socketRef` - Socket.IO connection reference.
  - `socketConnected` - Socket connection status.
- **Local State:**
  - `socketStatus` - Payment status from Socket.IO events.
  - `isFallbackActive` - Fallback query active state.
  - `timeoutRef` - Reference to fallback timeout (60 seconds).
  - `socketError` - Connection or result error message.

## UI Structure
- **Main Container:** Centered layout for focus on status.
- **Status Indicator:** Large animated spinner or success/error icon.
- **Details Card:** Summary of the payment being tracked.
- **Connection Status:** Subtle indicators for real-time connection.
- **Action Footer:** "View Appointment" or "Retry" buttons.

## Planned Layout
```
┌────────────────────────────────────────────┐
│ < Back        Payment Status               │
├────────────────────────────────────────────┤
│                                            │
│             [ LARGE SPINNER ]              │
│           Waiting for Payment...           │
│                                            │
├────────────────────────────────────────────┤
│ Payment #: PAY-2026-0029                   │
│ Amount: KES 500.00                         │
│ Method: M-Pesa                             │
├────────────────────────────────────────────┤
│ Connection: [Connected]                    │
│ Fallback: [Inactive]                       │
├────────────────────────────────────────────┤
│ [ View Details ]                           │
└────────────────────────────────────────────┘
```

## Sketch Wireframe
```
┌────────────────────────────────────────────────────────────┐
│ [←] Payment Status                                         │
│                                                            │
│                    [ 🔄 Processing ]                       │
│               Waiting for M-Pesa Prompt...                 │
│                                                            │
│ ┌────────────────────────────────────────────────────────┐ │
│ │ Payment Summary:                                       │ │
│ │ • Payment #: PAY-2026-0029                             │ │
│ │ • Total: KES 500.00                                    │ │
│ │ • Date: Feb 16, 2026, 02:24 PM                         │ │
│ └────────────────────────────────────────────────────────┘ │
│                                                            │
│ Real-time Connection: ● Active                             │
│                                                            │
│ [ View Payment Details ]                                   │
│ [ Back to Home ]                                           │
└────────────────────────────────────────────────────────────┘
```

## Socket.IO Integration

### Connection Setup
- Connect to `API_BASE_URL` using `socket.io-client`.
- Subscribe to payment updates: `socket.emit('subscribe-to-payment', paymentId)`.
- Listen to events: `callback.received`, `payment.updated`.

### M-Pesa Event Handling
- **`callback.received`** event:
  - Payload contains `code` and `message`.
  - Result Code `0` → Set status to 'SUCCESS'.
  - Other codes → Set status to 'FAILED'.
- **`payment.updated`** event:
  - Check if `payload.paymentId` matches.
  - Update status from `payload.status`.

### Fallback Query (M-Pesa Only)
- After 60 seconds (FALLBACK_TIMEOUT), if no callback received:
  - Set `isFallbackActive` to true.
  - Call `useQueryMpesaStatus(checkoutId)` to query Safaricom API.
  - Update status based on API result.

## API Integration
- **HTTP client:** `axios` instance from `api/config.ts` via `paymentAPI.getPayment` and `paymentAPI.queryMpesaStatus`.
- **Get Endpoint:** `GET /api/payments/:paymentId` via `useGetPaymentById(paymentId)`.
- **Headers:** Automatically includes `Authorization: Bearer <token>` from token store.
- **Response contract:** `response.data.data.payment` contains the payment object with current status.
- **Status Query Endpoint (Fallback):** `GET /api/payments/status/:checkoutId` via `useQueryMpesaStatus(checkoutId)`.
- **Fallback Query:** Only triggered after 60 seconds if no Socket.IO callback received for M-Pesa payments.
- **Fallback Response Structure:**
  ```json
  {
    "success": true,
    "data": {
      "ResultCode": 0,
      "ResultDesc": "The service request is processed successfully.",
      "CheckoutRequestID": "ws_CO_..."
    }
  }
  ```
- **Socket.IO Events:**
  - `subscribe-to-payment` - Emit to subscribe to payment updates
  - `callback.received` - Listen for M-Pesa callback with `{ paymentId, CODE, message }`
  - `payment.updated` - Listen for payment status updates with `{ paymentId, status }`
- **Cache invalidation:** Payment query is automatically refetched when status changes via Socket.IO.

## Components Used
- Expo Router: `useLocalSearchParams`, `useRouter`, `Stack`.
- Socket.IO Client: `io`.
- UI Components: `ActivityIndicator`, `View`, `Text`.
- Icons: `MaterialIcons`.

## Error Handling
- **Socket Disconnect:** Automatically attempts reconnection.
- **Timeout:** Triggers the manual fallback query after 1 minute.
- **Result Error:** Displays the M-Pesa error message (e.g., "Insufficient Funds").

## Navigation Flow
- Route: `/(authenticated)/payments/status?paymentId=...&checkoutId=...`.
- **Success:** Automatically navigate to payment details or show success with a button.
- **Back Button:** Returns to the previous screen (with confirmation if pending).

## Functions Involved

- **`startTracking`** — Initializes websocket connection and event listeners for real-time payment tracking.
  ```tsx
  const startTracking = useCallback((trackingPaymentId: string, trackingMethod: string) => {
    clearPaymentTimers();

    // Initialize Socket connection
    socketRef.current = io(API_BASE_URL, {
      transports: ['websocket'],
      forceNew: true,
      timeout: 20000,
      reconnection: true,
      reconnectionAttempts: 5,
    });

    socketRef.current.on('connect', () => {
      setSocketConnected(true);
      socketRef.current?.emit('subscribe-to-payment', trackingPaymentId);
    });

    socketRef.current.on('callback.received', (payload: any) => {
      if (payload.paymentId === trackingPaymentId) {
        handleMpesaResultCode(payload.CODE, payload.message);
      }
    });

    socketRef.current.on('payment.updated', (payload: any) => {
      if (payload.paymentId === trackingPaymentId) {
        setSocketStatus(payload.status);
        if (payload.status === 'SUCCESS' || payload.status === 'FAILED') {
          clearPaymentTimers();
        }
      }
    });

    // Fallback timeout for M-Pesa (60 seconds)
    if (trackingMethod === 'MPESA' && checkoutId) {
      timeoutRef.current = setTimeout(() => {
        setIsFallbackActive(true);
        refetchMpesaStatus();
      }, FALLBACK_TIMEOUT);
    }
  }, [clearPaymentTimers, handleMpesaResultCode, checkoutId, refetchMpesaStatus]);
  ```

- **`handleMpesaResultCode`** — Maps Daraja result codes to UI states and handles errors.
  ```tsx
  const handleMpesaResultCode = useCallback((resultCode: number | string, resultMessage: string) => {
    clearPaymentTimers();
    // Ensure we handle string codes from API (e.g., "0")
    const code = typeof resultCode === 'string' ? parseInt(resultCode, 10) : resultCode;

    if (code === 0) {
      setSocketStatus('SUCCESS');
    } else if (code === 1032) {
      setSocketStatus('CANCELLED');
      setSocketError('Payment cancelled by user');
    } else if (code === 1) {
      setSocketStatus('FAILED');
      setSocketError('Insufficient balance');
    } else {
      setSocketStatus('FAILED');
      setSocketError(resultMessage || `Transaction failed (Code: ${code})`);
    }
  }, [clearPaymentTimers]);
  ```

- **`clearPaymentTimers`** — Cleanup function for sockets and timeouts on unmount or status change.
  ```tsx
  const clearPaymentTimers = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    if (socketRef.current) {
      socketRef.current.disconnect();
      socketRef.current = null;
    }
  }, []);
  ```

- **Cleanup effect** — Ensures socket and timers are cleaned up on component unmount.
  ```tsx
  useEffect(() => {
    return () => {
      clearPaymentTimers();
    };
  }, [clearPaymentTimers]);
  ```

## Implementation Details
- **WebSocket Fallback:** Ensure `socketRef.current` is cleaned up on unmount.
- **Native Stability:** Use `transports: ['websocket']` for better compatibility in Expo.
- **Domain Alignment:** Match `IPayment` status values (`PENDING`, `SUCCESS`, `FAILED`).

## Future Enhancements
- Visual progress bar.
- Haptic feedback on status change.
- Push notification fallback if app is closed.
