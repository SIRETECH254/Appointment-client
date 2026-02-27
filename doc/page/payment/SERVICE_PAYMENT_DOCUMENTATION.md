# Service Payment Screen Documentation (Mobile)

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
- [Functions Involved](#functions-involved)
- [Future Enhancements](#future-enhancements)

## Imports
```tsx
import { useCallback, useEffect, useMemo, useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, TextInput, ActivityIndicator, Alert, SafeAreaView } from 'react-native';
import { useRouter, Stack } from 'expo-router';
import { useInitiatePayment } from '@/tanstack/usePayments';
import { useGetAllServices } from '@/tanstack/useServices';
import { formatCurrency } from '@/utils/paymentUtils';
import type { InitiatePaymentPayload, IService } from '@/types/api.types';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
```

## Context and State Management
- **Initiate Payment Mutation:** `useInitiatePayment()` handles service-only payment initiation.
- **Service Query:** `useGetAllServices({ status: 'active' })` fetches available services.
- **Auth Context:** `useAuth()` provides user data for autofill.
- **Local State:**
  - `selectedServices` - Array of selected service IDs.
  - `method` - 'MPESA' | 'PAYSTACK'.
  - `phone` - Customer phone number (autofilled from user profile if authenticated).
  - `email` - Customer email address (autofilled from user profile if authenticated).
  - `phoneError` - Validation error message for phone number.
  - `emailError` - Validation error message for email address.
  - `inlineMessage` - Feedback message.

**`useInitiatePayment` hook (from `tanstack/usePayments.ts`):**
```tsx
export const useInitiatePayment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (paymentData: InitiatePaymentPayload) => {
      const response = await paymentAPI.initiatePayment(paymentData);
      return response.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['payments'] });
      queryClient.invalidateQueries({ queryKey: ['payments', 'my'] });
      console.log('Payment initiated successfully');
    },
    onError: (error: any) => {
      console.error('Initiate payment error:', error);
    },
  });
};
```

## UI Structure
- **ScrollView:** Support for many services.
- **Service Selection Section:** List of toggleable service cards.
- **Summary Footer:** Sticky bar showing total amount.
- **Payment Method Section:** Large method selectors.
- **Action Button:** Initiation trigger.

## Planned Layout
```
┌────────────────────────────────────────────┐
│ < Back        Service Payment              │
├────────────────────────────────────────────┤
│ Select Services:                           │
│ [ ] Haircut (KES 300)                      │
│ [x] Trim (KES 200)                         │
├────────────────────────────────────────────┤
│ Total: KES 200.00                          │
├────────────────────────────────────────────┤
│ Method: [ MPESA ] [ PAYSTACK ]             │
├────────────────────────────────────────────┤
│ [ Pay Now ]                                │
└────────────────────────────────────────────┘
```

## Sketch Wireframe
```
┌────────────────────────────────────────────────────────────┐
│ [←] Quick Payment                                          │
│ Choose services to pay for instantly.                      │
│                                                            │
│ ┌────────────────────────────────────────────────────────┐ │
│ │ Services:                                              │ │
│ │ ☑ Haircut ............................. KES 300.00     │ │
│ │ ☐ Massage ............................. KES 500.00     │ │
│ │ ☑ Shave ............................... KES 200.00     │ │
│ └────────────────────────────────────────────────────────┘ │
│                                                            │
│ Total Amount: KES 500.00                                   │
│                                                            │
│ Payment Method:                                            │
│ (•) M-Pesa    ( ) Card/Paystack                            │
│                                                            │
│ [ Pay KES 500.00 ]                                         │
└────────────────────────────────────────────────────────────┘
```

## Form Inputs
- **Service List:** `TouchableOpacity` items with check icons.
- **Method Selector:** Radio-style buttons.
- **Phone Input:** Standard `TextInput` with `keyboardType="phone-pad"`.

## API Integration
- **HTTP client:** `axios` instance from `api/config.ts` via `paymentAPI.initiatePayment`.
- **Endpoint:** `POST /api/payments/initiate`.
- **Headers:** Automatically includes `Authorization: Bearer <token>` from token store.
- **Payload:**
  ```json
  {
    "appointmentId": "SERVICE_PAYMENT",
    "services": ["serviceId1", "serviceId2"],
    "method": "MPESA",
    "phone": "254757429010"  // Required for MPESA, normalized format
  }
  ```
  OR
  ```json
  {
    "appointmentId": "SERVICE_PAYMENT",
    "services": ["serviceId1", "serviceId2"],
    "method": "PAYSTACK",
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
        "paymentNumber": "PAY-2026-0029",
        "amount": 500,
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
- **Cache invalidation:** After successful initiation, queries for `['payments']` and `['payments', 'my']` are invalidated.

## Components Used
- Expo Router: `useRouter`, `Stack`.
- TanStack Query: `useInitiatePayment`, `useGetAllServices`.
- UI: `ActivityIndicator`, `Alert`.
- Custom classes: `btn-primary`, `label`, `input`.

## Error Handling
- **Validation:** Ensures at least one service is selected.
- **API Error:** Displays `Alert.alert` with server message.
- **Connectivity:** Handles offline states gracefully.

## Navigation Flow
- Route: `/(authenticated)/payments/service`.
- **Success:** Redirects to `/(authenticated)/payments/status?paymentId=...&checkoutId=...`.
- **Cancel:** Returns to previous screen.

## Functions Involved

- **`toggleService`** — Manages the selection array by adding or removing service IDs.
  ```tsx
  const toggleService = useCallback((serviceId: string) => {
    setSelectedServices(prev => 
      prev.includes(serviceId) 
        ? prev.filter(id => id !== serviceId)
        : [...prev, serviceId]
    );
  }, []);
  ```

- **`calculateTotal` (memoized)** — Derived state for the summary, calculates total amount from selected services.
  ```tsx
  const totalAmount = useMemo(() => {
    return selectedServices.reduce((sum, serviceId) => {
      const service = services.find(s => s._id === serviceId);
      return sum + (service?.fullPrice || 0);
    }, 0);
  }, [selectedServices, services]);
  ```

- **`handleSubmit`** — Validates inputs and calls the initiation mutation with toast notifications.
  ```tsx
  const handlePayment = useCallback(async () => {
    if (selectedServices.length === 0) {
      Alert.alert('Error', 'Please select at least one service.');
      return;
    }

    if (method === 'MPESA') {
      const phoneValidation = normalizePhoneNumber(phone);
      if (!phoneValidation.isValid) {
        setPhoneError(phoneValidation.error || 'Invalid phone number');
        return;
      }
    } else {
      const emailValidation = validateEmail(email);
      if (!emailValidation.isValid) {
        setEmailError(emailValidation.error || 'Invalid email address');
        return;
      }
    }

    try {
      const payload: any = {
        appointmentId: 'SERVICE_PAYMENT',
        method: method,
        services: selectedServices
      };

      let phoneValidation: any = null;
      if (method === 'MPESA') {
        phoneValidation = normalizePhoneNumber(phone);
        payload.phone = phoneValidation.normalized;
      } else {
        const emailValidation = validateEmail(email);
        payload.email = emailValidation.normalized;
      }

      const result = await initiateMutation.mutateAsync(payload);
      
      // Show toast notification based on payment method
      if (method === 'MPESA' && phoneValidation) {
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
    } catch {
      // Error handled by mutation
    }
  }, [selectedServices, method, phone, email, initiateMutation, router]);
  ```

- **Autofill effect** — Autofills phone and email from user profile if authenticated.
  ```tsx
  useEffect(() => {
    if (isAuthenticated && user) {
      if (user.phone && !phone) {
        setPhone(user.phone);
      }
      if (user.email && !email) {
        setEmail(user.email);
      }
    }
  }, [isAuthenticated, user]);
  ```

## Implementation Details
- **Dynamic Amount:** Backend calculates the final amount based on service IDs to prevent client-side manipulation.
- **User Preference:** Auto-fills phone number from user profile if available.

## Future Enhancements
- Service categories/folders.
- Discount code support.
- Frequent services shortcut.
漫
