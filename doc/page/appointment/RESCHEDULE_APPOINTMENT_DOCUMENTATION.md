# Reschedule Appointment Screen Documentation

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
import { useState, useCallback } from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator, Alert, ScrollView } from 'react-native';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import { useGetAppointment, useRescheduleAppointment } from '@/tanstack/useAppointments';
import { useGetSlots } from '@/tanstack/useAvailability';
import { formatAppointmentDateTime } from '@/utils/appointmentUtils';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
```

## Context and State Management
- **Route Params:** `useLocalSearchParams()` extracts `id` (appointmentId).
- **TanStack Query:** `useGetAppointment(id)` fetches details.
- **Availability Hook:** `useGetSlots(params)` for new availability selection (only fetches when manually triggered).
- **Reschedule Mutation:** `useRescheduleAppointment()` mutation.
- **Local State:**
  - `selectedDate`: Date for new slot selection (starts as null, no auto-selection).
  - `selectedSlot`: Chosen time slot or null.
  - `showDatePicker`: Boolean for date picker modal visibility.
  - `shouldFetchSlots`: Boolean to control when slots are fetched (only after clicking "Check Availability").

**`useRescheduleAppointment` hook (from `tanstack/useAppointments.ts`):**
```tsx
export const useRescheduleAppointment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ appointmentId, data }: { appointmentId: string; data: RescheduleAppointmentPayload }) => {
      const response = await appointmentAPI.reschedule(appointmentId, data);
      return response.data.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['appointments'] });
      queryClient.invalidateQueries({ queryKey: ['appointments', 'my'] });
      queryClient.invalidateQueries({ queryKey: ['appointment', variables.appointmentId] });
      Toast.show({
        type: 'success',
        text1: 'Success!',
        text2: 'Appointment rescheduled successfully',
        position: 'top',
      });
    },
    onError: (error: any) => {
      console.error('Reschedule appointment error:', error);
    },
  });
};
```

## UI Structure
- **ScrollView:** Full mobile scroll area.
- **Current Slot Banner:** Summary of existing appointment date/time.
- **New Date Picker:** Standard mobile calendar or list.
- **Slots Grid:** `FlatList` with touchable buttons for selection.
- **Action Footer:** "Confirm Reschedule" button.

## Planned Layout
```
┌────────────────────────────────────────────┐
│ < Back        Reschedule                   │
├────────────────────────────────────────────┤
│ Current Appointment:                       │
│ Jan 25, 9:00 AM                            │
├────────────────────────────────────────────┤
│ Select New Date:                           │
│ [ Select a date ]              [ Change ]   │
│                                            │
│ [ Check Availability ] (Disabled until     │
│                          date selected)    │
├────────────────────────────────────────────┤
│ (Slots only shown after clicking button)   │
│                                            │
│ Available Slots:                           │
│ [Message: "No working hours for this day"] │
│ [ 10:00 AM ]    [ 11:00 AM ]               │
│ [ 12:00 PM ]    [ 01:00 PM ]               │
├────────────────────────────────────────────┤
│ [Error Message if reschedule fails]        │
│ [ Confirm Reschedule ]                     │
└────────────────────────────────────────────┘
```

## API Integration
- **HTTP client:** `axios` instance from `api/config.ts` via `appointmentAPI.reschedule`.
- **Endpoint:** `PATCH /api/appointments/:id/reschedule`.
- **Headers:** Automatically includes `Authorization: Bearer <token>` from token store.
- **Payload:**
  ```json
  {
    "startTime": "2026-02-01T10:00:00.000Z",
    "endTime": "2026-02-01T11:00:00.000Z",
    "staffId": "optional-staff-id"  // Optional: if staff also changes
  }
  ```
- **Response contract:** `response.data.data` contains the updated appointment object.
- **Response structure:**
  ```json
  {
    "success": true,
    "message": "Appointment rescheduled successfully",
    "data": {
      "appointment": {
        "_id": "...",
        "startTime": "2026-02-01T10:00:00.000Z",
        "endTime": "2026-02-01T11:00:00.000Z",
        "status": "CONFIRMED"
      }
    }
  }
  ```
- **Cache invalidation:** After successful reschedule, queries for `['appointments']`, `['appointments', 'my']`, and `['appointment', appointmentId]` are invalidated.

## Functions Involved

- **`handleReschedule`** — Validates slot selection and triggers reschedule mutation.
  ```tsx
  const handleReschedule = useCallback(async () => {
    if (!selectedSlot) return Alert.alert('Required', 'Please select a new time slot');

    try {
      await rescheduleMutation.mutateAsync({
        appointmentId: id!,
        data: {
          startTime: selectedSlot.startTime,
          endTime: selectedSlot.endTime,
        },
      });
      
      // Toast notification is handled in the hook's onSuccess
      router.push(`/(authenticated)/appointment/${id}`);
    } catch (error: any) {
      // Error will be displayed via rescheduleMutation.isError
      // The error message is already accessible via rescheduleMutation.error
    }
  }, [id, selectedSlot, rescheduleMutation, router]);
  ```

- **`handleCheckAvailability`** — Manually triggers slot fetching when user clicks "Check Availability" button.
  ```tsx
  const handleCheckAvailability = () => {
    if (!selectedDate) {
      setErrorMessage('Please select a date first.');
      return;
    }
    setShouldFetchSlots(true);
    setSelectedSlot(null); // Reset selected slot
    refetchSlots();
  };
  ```

- **`handleConfirmDate`** — Updates selected date and resets slot selection.
  ```tsx
  const handleConfirmDate = (date: Date) => {
    setSelectedDate(date);
    setSelectedSlot(null);
    setShouldFetchSlots(false); // Reset fetch flag when date changes
    setShowDatePicker(false);
  };
  ```

## Navigation Flow
- Route: `/appointment/reschedule?id=[id]`.
- **Success:** Returns to `/appointment/[id]` with toast notification.
- **Cancel:** `router.back()`.

## Implementation Details
- **Slot Selection:** Manual fetching via "Check Availability" button - slots are NOT automatically fetched when date is selected.
- **Date Selection:** Starts with no date selected (null) - user must explicitly select a date.
- **Check Availability Button:** Disabled until a date is selected. When clicked, fetches available slots and displays API messages if available.
- **API Message Display:** Shows messages from API response (e.g., "No working hours for this day") when slots array is empty.
- **Error Handling:** Displays API error messages (e.g., "Only confirmed appointments can be rescheduled") in a red error box above the footer when reschedule fails.
- **Confirmation Alert:** Native `Alert.alert` to confirm successful reschedule.
