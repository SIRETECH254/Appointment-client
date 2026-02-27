# Confirm Appointment Screen Documentation

## Table of Contents
- [Imports](#imports)
- [Context and State Management](#context-and-state-management)
- [UI Structure](#ui-structure)
- [Planned Layout](#planned-layout)
- [Sketch Wireframe](#sketch-wireframe)
- [Form Inputs](#form-inputs)
- [API Integration](#api-integration)
- [Components Used](#components-used)
- [Error Handling](#error-handling)
- [Navigation Flow](#navigation-flow)

## Imports
```tsx
import { useState, useMemo } from 'react';
import { View, Text, TouchableOpacity, TextInput, ScrollView, ActivityIndicator } from 'react-native';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import { useGetAppointment, useConfirmAppointment } from '@/tanstack/useAppointments';
import { formatAppointmentDateTime } from '@/utils/appointmentUtils';
import { formatCurrency } from '@/utils/paymentUtils';
```

## Context and State Management
- **Route Params:** `useLocalSearchParams()` extracts `id` (appointmentId).
- **TanStack Query:** `useGetAppointment(id)` fetches details.
- **Mutations:** `useConfirmAppointment()` handles appointment confirmation with payment.
- **Auth Context:** `useAuth()` provides user data for autofill.
- **Local State:**
  - `method`: 'mpesa' | 'paystack' (payment method selection).
  - `phone`: String for MPESA (autofilled from user profile if authenticated).
  - `email`: String for PAYSTACK (autofilled from user profile if authenticated).
  - `phoneError`: Validation error message for phone number.
  - `emailError`: Validation error message for email address.

**`useConfirmAppointment` hook (from `tanstack/useAppointments.ts`):**
```tsx
export const useConfirmAppointment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ appointmentId, paymentData }: { appointmentId: string; paymentData: ConfirmAppointmentPayload }) => {
      const response = await appointmentAPI.confirm(appointmentId, paymentData);
      return response.data.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['appointments'] });
      queryClient.invalidateQueries({ queryKey: ['appointments', 'my'] });
      queryClient.invalidateQueries({ queryKey: ['appointment', variables.appointmentId] });
      console.log('Appointment confirmed successfully');
    },
    onError: (error: any) => {
      console.error('Confirm appointment error:', error);
    },
  });
};
```

## UI Structure
- **ScrollView:** Ensures all fields are accessible on smaller devices.
- **Summary Card:** Shows the booking fee amount.
- **Method Selection:** Large touchable areas for selecting payment method.
- **Action Button:** Fixed at the bottom for easy reach.

## Planned Layout
```
┌────────────────────────────────────────────┐
│ < Back        Confirm & Pay                │
├────────────────────────────────────────────┤
│ Booking Fee Summary:                       │
│ Amount: KES 200.00                         │
├────────────────────────────────────────────┤
│ Select Payment Method:                     │
│ [ ( ) MPESA ]    [ ( ) CARD ]              │
├────────────────────────────────────────────┤
│ [ Phone Number Input (if MPESA) ]          │
├────────────────────────────────────────────┤
│ [ Pay and Confirm ]                        │
└────────────────────────────────────────────┘
```

## API Integration
- **HTTP client:** `axios` instance from `api/config.ts` via `appointmentAPI.confirm`.
- **Confirm Endpoint:** `POST /api/appointments/:id/confirm`.
- **Headers:** Automatically includes `Authorization: Bearer <token>` from token store.
- **Payload:**
  ```json
  {
    "method": "MPESA",
    "phone": "254757429010"  // Required for MPESA, normalized format
  }
  ```
  OR
  ```json
  {
    "method": "PAYSTACK",
    "email": "user@example.com"  // Required for PAYSTACK
  }
  ```
- **Response contract:** `response.data.data` contains payment and gateway information.
- **Response structure:**
  ```json
  {
    "success": true,
    "message": "Appointment confirmed successfully",
    "data": {
      "appointment": {
        "_id": "...",
        "status": "CONFIRMED"
      },
      "payment": {
        "_id": "...",
        "paymentNumber": "PAY-2026-0029",
        "status": "PENDING"
      },
      "gateway": {
        "checkoutRequestId": "ws_CO_..."  // For MPESA
      },
      "paymentId": "...",
      "checkoutRequestId": "..."  // For MPESA
    }
  }
  ```
- **Cache invalidation:** After successful confirmation, queries for `['appointments']`, `['appointments', 'my']`, and `['appointment', appointmentId]` are invalidated.
- **Navigation after success:** Redirection to `/(authenticated)/payments/status?paymentId=...&checkoutId=...` with toast notification.

## Functions Involved

- **`handlePayment`** — Validates inputs based on payment method and triggers confirmation mutation.
  ```tsx
  const handlePayment = useCallback(async () => {
    if (isPending) {
      // Confirming a pending appointment (booking fee)
      const payload: any = {
        appointmentId: id!,
        paymentData: {
          method: method.toUpperCase() as 'MPESA' | 'PAYSTACK',
        },
      };

      let phoneValidation: any = null;
      if (method === 'mpesa') {
        phoneValidation = normalizePhoneNumber(phone);
        if (!phoneValidation.isValid) {
          setPhoneError(phoneValidation.error || 'Invalid phone number');
          return;
        }
        payload.paymentData.phone = phoneValidation.normalized;
      } else {
        const emailValidation = validateEmail(email);
        if (!emailValidation.isValid) {
          setEmailError(emailValidation.error || 'Invalid email address');
          return;
        }
        payload.paymentData.email = emailValidation.normalized;
      }

      const result = await confirmMutation.mutateAsync(payload);
      
      // Show toast notification based on payment method
      if (method === 'mpesa' && phoneValidation) {
        const phoneDisplay = phoneValidation.normalized.replace(/^254/, '0');
        Toast.show({
          type: 'success',
          text1: 'STK Sent!',
          text2: `STK sent to your Phone number ${phoneDisplay}`,
          position: 'top',
        });
      } else {
        Toast.show({
          type: 'success',
          text1: 'Success!',
          text2: 'Payment initiated successfully',
          position: 'top',
        });
      }
      
      const paymentId = result.payment?._id || result.paymentId;
      const checkoutId = result.gateway?.checkoutRequestId || result.checkoutRequestId;
      
      router.push({
        pathname: '/(authenticated)/payments/status',
        params: { paymentId, checkoutId }
      });
    }
  }, [id, method, phone, email, isPending, confirmMutation, router]);
  ```

- **Autofill effect** — Autofills phone and email from user profile if available.
  ```tsx
  useEffect(() => {
    if (user) {
      if (user.phone && !phone) {
        setPhone(user.phone);
      }
      if (user.email && !email) {
        setEmail(user.email);
      }
    }
  }, [user]);
  ```

## Navigation Flow
- Route: `/appointment/[id]/payment`.
- **Success:** Navigates to `/(authenticated)/payments/status?paymentId=...&checkoutId=...` with toast notification.
- **Cancel:** `router.back()`.
