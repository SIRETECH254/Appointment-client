# Payment Details Screen Documentation (Mobile)

## Table of Contents
- [Imports](#imports)
- [Context and State Management](#context-and-state-management)
- [UI Structure](#ui-structure)
- [Planned Layout](#planned-layout)
- [Sketch Wireframe](#sketch-wireframe)
- [API Integration](#api-integration)
- [Components Used](#components-used)
- [Error Handling](#error-handling)
- [Navigation Flow](#navigation-flow)
- [Functions Involved](#functions-involved)
- [Future Enhancements](#future-enhancements)

## Imports
```tsx
import { useMemo } from 'react';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator, SafeAreaView } from 'react-native';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import { useGetPaymentById } from '@/tanstack/usePayments';
import { formatPaymentStatus, getPaymentStatusVariant, formatPaymentMethod, formatPaymentType, formatCurrency } from '@/utils/paymentUtils';
import { formatDateTimeWithTime } from '@/utils/notificationUtils';
import type { IPayment } from '@/types/api.types';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
```

## Context and State Management
- **Route Params:** `useLocalSearchParams()` extracts `id` from URL (route: `/(authenticated)/payments/[id]`).
- **TanStack Query:** `useGetPaymentById(id)` fetches payment data.
- **Derived State:** Payment information extracted from API response.

## UI Structure
- **Safe Area & ScrollView:** Main container for mobile layout.
- **Header Card:** Payment number, status badge, amount, and payment method.
- **Details Section:** Payment information (customer, type, date, transaction references).
- **Appointment Link:** Link to related appointment if payment is for an appointment.
- **Transaction References:** Display processor references (M-Pesa checkout ID, Paystack reference).

## Planned Layout
```
┌────────────────────────────────────────────┐
│ < Back        Payment Details              │
├────────────────────────────────────────────┤
│ Payment #: PAY-2026-0029                   │
│ Status: [Success]                          │
│ Amount: KES 500                            │
├────────────────────────────────────────────┤
│ Method: M-Pesa                            │
│ Type: Full Payment                         │
│ Date: Feb 16, 2026 02:24 PM              │
│ Transaction Ref: ws_CO_160220261724555... │
├────────────────────────────────────────────┤
│ [View Appointment] [Back to History]      │
└────────────────────────────────────────────┘
```

## Sketch Wireframe
```
┌────────────────────────────────────────────────────────────┐
│ [←] Payment #PAY-2026-0029                                │
│ Status: [ SUCCESS ]                                        │
│                                                            │
│ Amount: KES 500                                            │
│ Method: M-Pesa                                             │
│ Type: Full Payment                                         │
│                                                            │
│ Payment Details:                                           │
│ • Payment Date: February 16, 2026, 02:24 PM               │
│ • Transaction Reference: ws_CO_16022026172455510757429010  │
│ • M-Pesa Checkout ID: ws_CO_160220261724555...            │
│                                                            │
│ Related Appointment:                                       │
│ • Appointment #APT-2026-0012                             │
│ • Date: February 23, 2026, 10:00 AM                       │
│ [ View Appointment ]                                       │
│                                                            │
│ [ Back to Payment History ]                                │
└────────────────────────────────────────────────────────────┘
```

## API Integration
- **Get Endpoint:** `GET /api/payments/:paymentId` via `useGetPaymentById(paymentId)`.
- **Response Structure:**
  ```json
  {
    "success": true,
    "data": {
      "payment": {
        "processorRefs": {
          "daraja": {
            "merchantRequestId": "...",
            "checkoutRequestId": "..."
          }
        },
        "_id": "...",
        "appointmentId": "...",
        "paymentNumber": "PAY-2026-0029",
        "amount": 500,
        "currency": "KES",
        "type": "FULL_PAYMENT",
        "method": "MPESA",
        "status": "SUCCESS",
        "createdAt": "...",
        "updatedAt": "..."
      }
    }
  }
  ```

## Components Used
- Expo Router: `useLocalSearchParams`, `useRouter`, `Stack`.
- TanStack Query: `useGetPaymentById` hook.
- Utility Functions: `formatPaymentStatus`, `getPaymentStatusVariant`, `formatPaymentMethod`, `formatPaymentType`, `formatCurrency` from `@/utils/paymentUtils`.
- Icons: `@expo/vector-icons/MaterialIcons`.
- Custom classes from `global.css`: `btn-primary`, `btn-secondary`, `badge`, `badge-success`, `badge-error`, `badge-soft`, `alert-error`.

## Error Handling
- **Loading State:** Show `ActivityIndicator` while fetching payment data.
- **Error State:** Display error message with a "Go Back" button if fetch fails.
- **No Payment Found:** Display error message and link back to payment list.

## Navigation Flow
- Route: `/(authenticated)/payments/[id]`.
- **View Appointment Button:** Navigate to `/(authenticated)/appointment/[id]` if payment has related appointment.
- **Back Button:** Navigate back to `/(authenticated)/payments` (payment history).

## Functions Involved
- **`formatPaymentStatus`** — Formats payment status for display.
- **`formatPaymentMethod`** — Formats payment method for display.
- **`formatPaymentType`** — Formats payment type for display.
- **`formatCurrency`** — Formats currency amount for display.

## Implementation Details
- **Native Components:** Using `View`, `Text`, and `ScrollView` for layout.
- **Status Badge:** Display payment status with color-coded badge.
- **Transaction References:** Display processor-specific references (M-Pesa checkout ID, Paystack reference).
- **Safe Area Insets:** Using `SafeAreaView` to avoid notches.

## Future Enhancements
- Payment receipt sharing/saving.
- Refund information if applicable.
- Detailed transaction timeline.
