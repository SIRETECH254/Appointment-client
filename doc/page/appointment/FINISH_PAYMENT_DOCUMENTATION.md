# Finish Payment Screen Documentation

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
import { useGetAppointment } from '@/tanstack/useAppointments';
import { useServicePayment } from '@/tanstack/usePayments';
import { formatAppointmentDateTime } from '@/utils/appointmentUtils';
import { formatCurrency } from '@/utils/paymentUtils';
```

## Context and State Management
- **Route Params:** `useLocalSearchParams()` extracts `id` (appointmentId).
- **TanStack Query:** `useGetAppointment(id)` fetches details for the remaining amount.
- **Service Payment Mutation:** `useServicePayment()` handles payment initiation for remaining balance.
- **Auth Context:** `useAuth()` provides user data for autofill.
- **Local State:**
  - `method`: 'mpesa' | 'paystack' (payment method selection).
  - `phone`: String for MPESA (autofilled from user profile if authenticated).
  - `email`: String for PAYSTACK (autofilled from user profile if authenticated).
  - `phoneError`: Validation error message for phone number.
  - `emailError`: Validation error message for email address.

**`useServicePayment` hook (from `tanstack/usePayments.ts`):**
```tsx
export const useServicePayment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (paymentData: ServicePaymentPayload) => {
      const response = await paymentAPI.servicePayment(paymentData);
      return response.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['payments'] });
      queryClient.invalidateQueries({ queryKey: ['payments', 'my'] });
      console.log('Service payment initiated successfully');
    },
    onError: (error: any) => {
      console.error('Service payment error:', error);
    },
  });
};
```

## UI Structure
- **ScrollView:** Support for small mobile screens.
- **Summary Card:** Shows the remaining balance.
- **Method Selection:** Large touchable areas for selecting payment method.
- **Action Button:** Fixed at the bottom for easy reach.

## Planned Layout
```
┌────────────────────────────────────────────┐
│ < Back        Finish Payment               │
├────────────────────────────────────────────┤
│ Remaining Balance Summary:                 │
│ Amount: KES 800.00                         │
├────────────────────────────────────────────┤
│ Select Payment Method:                     │
│ [ ( ) MPESA ]    [ ( ) CARD ]              │
├────────────────────────────────────────────┤
│ [ Phone Number Input (if MPESA) ]          │
├────────────────────────────────────────────┤
│ [ Pay and Finish ]                         │
└────────────────────────────────────────────┘
```

## API Integration
- **HTTP client:** `axios` instance from `api/config.ts` via `paymentAPI.servicePayment`.
- **Endpoint:** `POST /api/payments/service-payment`.
- **Headers:** Automatically includes `Authorization: Bearer <token>` from token store.
- **Payload:**
  ```json
  {
    "appointmentId": "...",
    "method": "MPESA",
    "amount": 800,
    "phone": "254757429010"  // Required for MPESA, normalized format
  }
  ```
  OR
  ```json
  {
    "appointmentId": "...",
    "method": "PAYSTACK",
    "amount": 800,
    "email": "user@example.com"  // Required for PAYSTACK
  }
  ```
- **Response contract:** `response.data.data` contains payment and gateway information.
- **Response structure:**
  ```json
  {
    "success": true,
    "message": "Payment initiated successfully",
    "data": {
      "payment": {
        "_id": "...",
        "paymentNumber": "PAY-2026-0030",
        "amount": 800,
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
- **Cache invalidation:** After successful payment initiation, queries for `['payments']` and `['payments', 'my']` are invalidated.
- **Navigation after success:** Redirection to `/(authenticated)/payments/status?paymentId=...&checkoutId=...` with toast notification.

## Functions Involved

- **`handlePayment`** — Validates inputs based on payment method and triggers service payment mutation.
  ```tsx
  const handlePayment = useCallback(async () => {
    // Paying remaining balance for a confirmed appointment
    const payload: any = {
      appointmentId: id!,
      method: method.toUpperCase() as 'MPESA' | 'PAYSTACK',
      amount: amountToPay!,
    };

    let phoneValidation: any = null;
    if (method === 'mpesa') {
      phoneValidation = normalizePhoneNumber(phone);
      if (!phoneValidation.isValid) {
        setPhoneError(phoneValidation.error || 'Invalid phone number');
        return;
      }
      payload.phone = phoneValidation.normalized;
    } else {
      const emailValidation = validateEmail(email);
      if (!emailValidation.isValid) {
        setEmailError(emailValidation.error || 'Invalid email address');
        return;
      }
      payload.email = emailValidation.normalized;
    }

    const result = await servicePaymentMutation.mutateAsync(payload);
    
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
  }, [id, method, phone, email, amountToPay, servicePaymentMutation, router]);
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
