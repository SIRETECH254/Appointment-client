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
- **Service Payment Mutation:** `useServicePayment()` handles payment initiation.
- **Local State:**
  - `paymentMethod`: 'MPESA' | 'CARD'.
  - `phoneNumber`: String for MPESA.
  - `email`: String for CARD.
  - `isSubmitting`: Loading state for button.

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
- **Endpoint:** `POST /api/payments/service-payment`.
- **Navigation after success:** Redirection to `payments/status/[checkoutRequestId]`.

## Navigation Flow
- Route: `/appointment/[id]/payment`.
- **Success:** Navigates to the payment status tracker.
- **Cancel:** `router.back()`.
