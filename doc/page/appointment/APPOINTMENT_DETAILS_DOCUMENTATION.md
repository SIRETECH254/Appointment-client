# Appointment Details Screen Documentation

## Table of Contents
- [Imports](#imports)
- [Context and State Management](#context-and-state-management)
- [UI Structure](#ui-structure)
- [Planned Layout](#planned-layout)
- [Sketch Wireframe](#sketch-wireframe)
- [Action Buttons](#action-buttons)
- [API Integration](#api-integration)
- [Components Used](#components-used)
- [Error Handling](#error-handling)
- [Navigation Flow](#navigation-flow)
- [Functions Involved](#functions-involved)
- [Future Enhancements](#future-enhancements)

## Imports
```tsx
import { useCallback, useMemo, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import { useGetAppointment, useConfirmAppointment, useRescheduleAppointment, useCancelAppointment, useCheckInAppointment, useCompleteAppointment, useMarkNoShowAppointment } from '@/tanstack/useAppointments';
import { Modal } from '@/components/ui/Modal';
import { formatAppointmentDateTime, formatAppointmentStatus, getAppointmentStatusVariant, canRescheduleAppointment, canCancelAppointment, canCheckInAppointment } from '@/utils/appointmentUtils';
import { formatCurrency } from '@/utils/paymentUtils';
import type { IAppointment } from '@/types/api.types';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
```

## Context and State Management
- **Route Params:** `useLocalSearchParams()` extracts `id` from URL (route: `/appointment/[id]`).
- **TanStack Query:** `useGetAppointment(id)` fetches appointment data.
- **Mutations:**
  - `useConfirmAppointment()` - Confirm appointment with payment
  - `useRescheduleAppointment()` - Reschedule appointment
  - `useCancelAppointment()` - Cancel appointment
  - `useCheckInAppointment()` - Check in customer
  - `useCompleteAppointment()` - Mark appointment as completed
  - `useMarkNoShowAppointment()` - Mark appointment as no-show
- **Local State:**
  - `isConfirmModalVisible` - Modal visibility for destructive actions
  - `actionToConfirm` - The action to be confirmed (cancel, no-show, etc.)
  - `inlineMessage` - Success/error feedback message

## UI Structure
- **Safe Area & ScrollView:** Main container for mobile layout.
- **Header Card:** Appointment ID, status badge, customer and staff information.
- **Details Card:** Appointment information (date/time, services, amounts, notes).
- **Payment Information Card:** Booking fee, remaining amount, payment status.
- **Action Footer:** Contextual buttons based on appointment status.
- **Modals:** React Native Modals for destructive actions (cancel, no-show).

## Planned Layout
```
┌────────────────────────────────────────────┐
│ < Back        Appointment Details          │
├────────────────────────────────────────────┤
│ Status: [Pending]                          │
│ Customer: John Doe                        │
│ Staff: Jane Smith                          │
├────────────────────────────────────────────┤
│ Date/Time: Jan 25, 2025 9:00 AM - 10:30 AM│
│ Services: Haircut, Trim                   │
│ Booking Fee: KES 200                      │
│ Remaining: KES 800                        │
├────────────────────────────────────────────┤
│ [Confirm] [Reschedule] [Cancel]          │
└────────────────────────────────────────────┘
```

## Sketch Wireframe
```
┌────────────────────────────────────────────────────────────┐
│ [←] Appointment #APT-2025-0001                            │
│ Status: [Pending]                                          │
│                                                            │
│ Customer: John Doe (john@example.com)                    │
│ Staff: Jane Smith                                          │
│                                                            │
│ Date/Time: January 25, 2025, 9:00 AM - 10:30 AM           │
│ Services: Haircut (30 min), Trim (15 min)                 │
│                                                            │
│ Payment Information:                                       │
│ • Booking Fee: KES 200 (Paid)                             │
│ • Remaining Amount: KES 800 (Unpaid)                      │
│                                                            │
│ ┌────────────────────────────────────────────────────────┐ │
│ │ [Confirm Appointment] [Reschedule] [Cancel]          │ │
│ └────────────────────────────────────────────────────────┘ │
└────────────────────────────────────────────────────────────┘
```

## Action Buttons

### PENDING Status
- **Confirm Appointment** - Navigate to `/appointment/[id]/payment` (booking fee)
- **Reschedule** - Navigate to `/appointment/reschedule?id=[id]`
- **Cancel** - Open Alert.alert or Modal, then cancel appointment

### CONFIRMED Status
- **Check In** - Mark customer as checked in (staff/admin only)
- **Reschedule** - Navigate to `/appointment/reschedule?id=[id]`
- **Cancel** - Open Alert.alert, then cancel appointment (only if 2+ hours before start)
- **Finish Payment** - Navigate to `/appointment/[id]/payment` (remaining amount)

### Checked In (CONFIRMED with checkedInAt)
- **Complete** - Mark appointment as completed (staff only)
- **Mark No-Show** - Mark appointment as no-show (staff/admin only)

### COMPLETED Status
- **View Only** - No action buttons, display completed information

### CANCELLED / NO_SHOW Status
- **View Only** - No action buttons, display cancellation/no-show information

## API Integration
- **Get Endpoint:** `GET /api/appointments/:appointmentId` via `useGetAppointment(appointmentId)`.
- **Confirm Endpoint:** `POST /api/appointments/:id/confirm` via `useConfirmAppointment()` mutation.
- **Reschedule Endpoint:** `PATCH /api/appointments/:id/reschedule` via `useRescheduleAppointment()` mutation.
- **Cancel Endpoint:** `PATCH /api/appointments/:id/cancel` via `useCancelAppointment()` mutation.
- **Check In Endpoint:** `PATCH /api/appointments/:id/check-in` via `useCheckInAppointment()` mutation.
- **Complete Endpoint:** `PATCH /api/appointments/:id/complete` via `useCompleteAppointment()` mutation.
- **No-Show Endpoint:** `PATCH /api/appointments/:id/no-show` via `useMarkNoShowAppointment()` mutation.

## Components Used
- Expo Router: `useLocalSearchParams`, `useRouter`, `Stack`.
- TanStack Query: `useGetAppointment`, mutation hooks for appointment actions.
- UI Components: `Button`, `Card`, `Badge`, `Modal`, `Loading` (activity indicator).
- Icons: `@expo/vector-icons/MaterialIcons`.
- Utility Functions: `formatAppointmentDateTime`, `formatAppointmentStatus`, `getAppointmentStatusVariant`, `canRescheduleAppointment`, `canCancelAppointment`, `canCheckInAppointment` from `@/utils/appointmentUtils`.

## Error Handling
- **Loading State:** Show `ActivityIndicator` while fetching appointment data.
- **Error State:** Display error message with a "Retry" button if fetch fails.
- **Validation:** Client-side validation for action availability (check status, time constraints).
- **Alerts:** Use `Alert.alert` for error feedback or action confirmations.

## Navigation Flow
- Route: `/appointment/[id]`.
- **Confirm Button:** Navigate to `/appointment/[id]/payment` (payment screen).
- **Reschedule Button:** Navigate to `/appointment/select-slot` (re-using booking flow with `appointmentId`).
- **Back Button:** Use `router.back()`.

## Functions Involved
- **`formatAppointmentDateTime`** — Formats appointment date and time for mobile display.
- **`canRescheduleAppointment`** — Checks if appointment can be rescheduled.
- **`handleCancel`** — Uses `Alert.alert` for confirmation.
  ```tsx
  const handleCancel = () => {
    Alert.alert(
      "Cancel Appointment",
      "Are you sure you want to cancel this appointment?",
      [
        { text: "No", style: "cancel" },
        { text: "Yes, Cancel", onPress: executeCancel, style: 'destructive' }
      ]
    );
  };
  ```

## Implementation Details
- **Native Components:** Using `View`, `Text`, and `ScrollView` for layout.
- **StyleSheet/NativeWind:** Styling using NativeWind classes for consistency with the project.
- **Safe Area Insets:** Using `SafeAreaView` to avoid notches and home indicators.

## Future Enhancements
- In-app chat with staff/customer.
- Push notification settings for this specific appointment.
- Calendar integration (Add to device calendar).
- Directions to the shop (Map integration).
