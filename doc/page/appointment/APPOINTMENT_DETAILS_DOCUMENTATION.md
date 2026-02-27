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
import { View, Text, ScrollView, TouchableOpacity, Alert, SafeAreaView } from 'react-native';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useGetAppointment, useConfirmAppointment, useRescheduleAppointment, useCancelAppointment, useCheckInAppointment, useCompleteAppointment, useMarkNoShowAppointment } from '@/tanstack/useAppointments';
import { formatAppointmentDateTime, canRescheduleAppointment, canCancelAppointment, canCheckInAppointment } from '@/utils/appointmentUtils';
import { formatCurrency } from '@/utils/paymentUtils';
import StatusBadge from '@/components/ui/StatusBadge';
import type { IAppointment } from '@/types/api.types';
```

## Context and State Management
- **Route Params:** `useLocalSearchParams()` extracts `id` from URL (route: `/appointment/[id]`).
- **TanStack Query:** `useGetAppointment(id)` fetches appointment data.
- **Mutations:**
  - `useCancelAppointment()` - Cancel appointment with confirmation
- **Local State:**
  - `appointment` - Appointment data from `useGetAppointment().data`
  - `isLoading` - Loading state from `useGetAppointment().isLoading`
  - `isError` - Error state from `useGetAppointment().isError`

**`useGetAppointment` hook (from `tanstack/useAppointments.ts`):**
```tsx
export const useGetAppointment = (appointmentId: string) => {
  return useQuery({
    queryKey: ['appointment', appointmentId],
    queryFn: async () => {
      const response = await appointmentAPI.getAppointment(appointmentId);
      return response.data.data.appointment;
    },
    enabled: !!appointmentId,
    staleTime: DEFAULT_STALE_TIME, // 5 minutes
    gcTime: DEFAULT_GC_TIME, // 10 minutes
  });
};
```

**`useCancelAppointment` hook (from `tanstack/useAppointments.ts`):**
```tsx
export const useCancelAppointment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ appointmentId, data }: { appointmentId: string; data?: CancelAppointmentPayload }) => {
      const response = await appointmentAPI.cancel(appointmentId, data);
      return response.data.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['appointments'] });
      queryClient.invalidateQueries({ queryKey: ['appointments', 'my'] });
      queryClient.invalidateQueries({ queryKey: ['appointment', variables.appointmentId] });
      Toast.show({
        type: 'success',
        text1: 'Success!',
        text2: 'Appointment cancelled successfully',
        position: 'top',
      });
    },
    onError: (error: any) => {
      console.error('Cancel appointment error:', error);
    },
  });
};
```

## UI Structure
- **Safe Area & ScrollView:** Main container for mobile layout.
- **Header Card:** Appointment ID with icon, StatusBadge for status, staff information with icons.
- **Details Section:** Appointment information with icons (date/time, booked on, services, notes).
- **Payment Section:** Booking fee, remaining amount, total price with icons.
- **Action Footer:** Contextual buttons based on appointment status.
- **Loading State:** Full-page skeleton loader with `animate-pulse` for loading states.

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
- **HTTP client:** `axios` instance from `api/config.ts` via `appointmentAPI.getAppointment` and `appointmentAPI.cancel`.
- **Get Endpoint:** `GET /api/appointments/:appointmentId` via `useGetAppointment(appointmentId)`.
- **Headers:** Automatically includes `Authorization: Bearer <token>` from token store.
- **Response contract:** `response.data.data.appointment` contains the appointment object.
- **Response structure:**
  ```json
  {
    "success": true,
    "data": {
      "appointment": {
        "_id": "...",
        "customerId": "...",
        "staffId": "...",
        "services": [...],
        "startTime": "2026-02-01T09:00:00.000Z",
        "endTime": "2026-02-01T10:30:00.000Z",
        "status": "PENDING",
        "bookingFeeAmount": 200,
        "remainingAmount": 800,
        "notes": "...",
        "createdAt": "2026-01-20T00:00:00.000Z"
      }
    }
  }
  ```
- **Cancel Endpoint:** `PATCH /api/appointments/:id/cancel` via `useCancelAppointment()` mutation.
- **Cancel Payload:**
  ```json
  {
    "reason": "Optional cancellation reason"
  }
  ```
- **Cache invalidation:** After cancel mutation, queries for `['appointments']`, `['appointments', 'my']`, and `['appointment', appointmentId]` are invalidated.

## Components Used
- `StatusBadge`: Badge component with icons for appointment status (PENDING, CONFIRMED, COMPLETED, CANCELLED, NO_SHOW).
- Expo Router: `useLocalSearchParams`, `useRouter`, `Stack`.
- TanStack Query: `useGetAppointment`, mutation hooks for appointment actions.
- UI Components: `Button`, `Card`, `Modal`.
- Icons: `@expo/vector-icons/MaterialIcons` (fingerprint, badge, work, event, access-time, content-cut, notes, payment, account-balance-wallet, pending, attach-money).
- **Skeleton Loader:** Full-page skeleton with `animate-pulse` for loading states (replaces ActivityIndicator).
- Utility Functions: `formatAppointmentDateTime`, `canRescheduleAppointment`, `canCancelAppointment`, `canCheckInAppointment` from `@/utils/appointmentUtils`.

## Error Handling
- **Loading State:** Full-page skeleton loader with `animate-pulse` showing header, details, and payment section placeholders.
- **Error State:** Display error message with a "Retry" button if fetch fails.
- **Validation:** Client-side validation for action availability (check status, time constraints).
- **Alerts:** Use `Alert.alert` for error feedback or action confirmations.

## Navigation Flow
- Route: `/appointment/[id]`.
- **Confirm Button:** Navigate to `/appointment/[id]/payment` (payment screen).
- **Reschedule Button:** Navigate to `/appointment/select-slot` (re-using booking flow with `appointmentId`).
- **Back Button:** Use `router.back()`.

## Functions Involved

- **`handleCancel`** — Uses `Alert.alert` for confirmation, then calls `useCancelAppointment` mutation to cancel the appointment.
  ```tsx
  const handleCancel = useCallback(() => {
    Alert.alert(
      'Cancel Appointment',
      'Are you sure you want to cancel this appointment?',
      [
        { text: 'No', style: 'cancel' },
        {
          text: 'Yes, Cancel',
          style: 'destructive',
          onPress: async () => {
            try {
              await cancelMutation.mutateAsync({ appointmentId: id!, data: {} });
              // Toast notification is handled in the hook's onSuccess
              refetch();
            } catch {
              // Error handled by mutation
            }
          },
        },
      ]
    );
  }, [id, cancelMutation, refetch]);
  ```

- **`formatAppointmentDateTime` utility (from `utils/appointmentUtils.ts`)** — Formats appointment date and time for mobile display.
  ```tsx
  export const formatAppointmentDateTime = (startTime: string, endTime: string): string => {
    const start = new Date(startTime);
    const end = new Date(endTime);
    const dateStr = format(start, 'MMMM d, yyyy');
    const startStr = format(start, 'h:mm a');
    const endStr = format(end, 'h:mm a');
    return `${dateStr}, ${startStr} - ${endStr}`;
  };
  ```

- **`formatCurrency` utility (from `utils/paymentUtils.ts`)** — Formats booking fee and remaining amount with currency symbol.
  ```tsx
  export const formatCurrency = (amount: number | string | undefined, currency: string = 'KES') => {
    const value = typeof amount === 'string' ? parseFloat(amount) : amount;
    if (value === undefined || isNaN(value)) return `${currency} 0.00`;
    
    return `${currency} ${value.toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  };
  ```

- **`canRescheduleAppointment` utility (from `utils/appointmentUtils.ts`)** — Checks if appointment can be rescheduled based on status and time constraints.
  ```tsx
  export const canRescheduleAppointment = (appointment: IAppointment): boolean => {
    if (appointment.status === 'COMPLETED' || appointment.status === 'CANCELLED' || appointment.status === 'NO_SHOW') {
      return false;
    }
    const startTime = new Date(appointment.startTime);
    const now = new Date();
    // Can reschedule if appointment is more than 2 hours away
    return startTime.getTime() - now.getTime() > 2 * 60 * 60 * 1000;
  };
  ```

- **`canCancelAppointment` utility (from `utils/appointmentUtils.ts`)** — Checks if appointment can be cancelled based on status and time constraints.
  ```tsx
  export const canCancelAppointment = (appointment: IAppointment): boolean => {
    if (appointment.status === 'COMPLETED' || appointment.status === 'CANCELLED' || appointment.status === 'NO_SHOW') {
      return false;
    }
    const startTime = new Date(appointment.startTime);
    const now = new Date();
    // Can cancel if appointment is more than 2 hours away
    return startTime.getTime() - now.getTime() > 2 * 60 * 60 * 1000;
  };
  ```

- **`isAppointmentPending` utility (from `utils/appointmentUtils.ts`)** — Utility function to check if appointment status is PENDING.
  ```tsx
  export const isAppointmentPending = (appointment: IAppointment): boolean => {
    return appointment.status === 'PENDING';
  };
  ```

- **`isAppointmentConfirmed` utility (from `utils/appointmentUtils.ts`)** — Utility function to check if appointment status is CONFIRMED.
  ```tsx
  export const isAppointmentConfirmed = (appointment: IAppointment): boolean => {
    return appointment.status === 'CONFIRMED';
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

## Recent Changes
- **Added:** Full-page skeleton loader with `animate-pulse` for loading states.
- **Added:** Icons throughout the page (fingerprint, badge, work, event, access-time, content-cut, notes, payment, account-balance-wallet, pending, attach-money) with gold family colors.
- **Updated:** Badge consistency - status uses `StatusBadge` component.
- **Updated:** Improved visual hierarchy with icon circles and colored text.
- **Updated:** Removed background colors from cards (white/gray backgrounds).
