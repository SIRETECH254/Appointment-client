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
- **Local State:**
  - `selectedServices` - Array of selected service IDs.
  - `method` - 'MPESA' | 'PAYSTACK'.
  - `phone` - Customer phone number.
  - `inlineMessage` - Feedback message.

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
- **Endpoint:** `POST /api/payments/initiate`.
- **Payload:** `{ services: string[], method: 'MPESA' | 'PAYSTACK', phone: string }`.

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
- **`toggleService`** — Manages the selection array.
- **`calculateTotal`** — Derived state for the summary.
- **`handleSubmit`** — Validates and calls the initiation mutation.

## Implementation Details
- **Dynamic Amount:** Backend calculates the final amount based on service IDs to prevent client-side manipulation.
- **User Preference:** Auto-fills phone number from user profile if available.

## Future Enhancements
- Service categories/folders.
- Discount code support.
- Frequent services shortcut.
漫
