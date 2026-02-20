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
- **Availability Hook:** `useGetSlots(params)` for new availability selection.
- **Reschedule Mutation:** `useRescheduleAppointment()` mutation.
- **Local State:**
  - `selectedDate`: Date for new slot selection.
  - `selectedSlot`: Chosen time slot.
  - `isRescheduling`: Loading state.

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
│ [ < ]   January 26, 2025   [ > ]           │
├────────────────────────────────────────────┤
│ Available Slots:                           │
│ [ 10:00 AM ]    [ 11:00 AM ]               │
│ [ 12:00 PM ]    [ 01:00 PM ]               │
├────────────────────────────────────────────┤
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
- **Slot Selection:** Real-time feedback using `useAvailability` whenever the date changes.
- **Confirmation Alert:** Native `Alert.alert` to confirm the change.
- **Error Feedback:** Uses native `Toast` or `Alert` for slot conflicts.
