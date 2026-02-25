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
- **Endpoint:** `PATCH /api/appointments/:id/reschedule`.
- **Payload:** `startTime`, `endTime`.

## Navigation Flow
- Route: `/appointment/reschedule?id=[id]`.
- **Success:** Returns to `/appointment/[id]`.
- **Cancel:** `router.back()`.

## Implementation Details
- **Slot Selection:** Manual fetching via "Check Availability" button - slots are NOT automatically fetched when date is selected.
- **Date Selection:** Starts with no date selected (null) - user must explicitly select a date.
- **Check Availability Button:** Disabled until a date is selected. When clicked, fetches available slots and displays API messages if available.
- **API Message Display:** Shows messages from API response (e.g., "No working hours for this day") when slots array is empty.
- **Error Handling:** Displays API error messages (e.g., "Only confirmed appointments can be rescheduled") in a red error box above the footer when reschedule fails.
- **Confirmation Alert:** Native `Alert.alert` to confirm successful reschedule.
