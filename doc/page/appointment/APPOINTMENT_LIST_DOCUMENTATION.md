# Appointment List Screen Documentation

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
import { useCallback, useMemo, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, ActivityIndicator, RefreshControl, TextInput } from 'react-native';
import { useRouter, Stack } from 'expo-router';
import { useGetMyAppointments } from '@/tanstack/useAppointments';
import { formatAppointmentDateTime, formatAppointmentStatus, getAppointmentStatusVariant } from '@/utils/appointmentUtils';
import { formatCurrency } from '@/utils/paymentUtils';
import type { IAppointment } from '@/types/api.types';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
```

## Context and State Management
- **TanStack Query:** `useGetMyAppointments(params)` fetches the user's appointments.
- **Local State:**
  - `searchTerm` - Current search input value.
  - `filterStatus` - Selected status (PENDING, CONFIRMED, etc.).
  - `isRefreshing` - Boolean for pull-to-refresh state.
- **Derived State:** `params` memo for filtering and pagination.

## UI Structure
- **Search & Filter Bar:** Sticky header with search input and horizontal status chips.
- **FlatList:** optimized list for mobile rendering.
- **Appointment Card:** Individual items showing staff, services, date, and status.
- **Empty State:** Visual feedback when no appointments exist.

## Planned Layout
```
┌────────────────────────────────────────────┐
│ 🔍 Search Appointments                     │
├────────────────────────────────────────────┤
│ [All] [Pending] [Confirmed] [Completed]    │
├────────────────────────────────────────────┤
│ ┌────────────────────────────────────────┐ │
│ │ Jane Smith - Haircut                   │ │
│ │ Jan 25, 9:00 AM          [Confirmed]   │ │
│ └────────────────────────────────────────┘ │
│ ┌────────────────────────────────────────┐ │
│ │ John Doe - Trim                        │ │
│ │ Jan 26, 2:00 PM          [Pending]     │ │
│ └────────────────────────────────────────┘ │
└────────────────────────────────────────────┘
```

## Sketch Wireframe
```
┌────────────────────────────────────────────────────────────┐
│  My Appointments                                     [🔔]  │
├────────────────────────────────────────────────────────────┤
│  🔍 Search by staff or service...                          │
├────────────────────────────────────────────────────────────┤
│  (All)  (Pending)  (Confirmed)  (Completed)  (Cancelled)   │
├────────────────────────────────────────────────────────────┤
│                                                            │
│  ┌──────────────────────────────────────────────────────┐  │
│  │ Jane Smith                                           │  │
│  │ Haircut, Trim                                        │  │
│  │ 📅 Jan 25, 2025  🕒 09:00 AM          [ CONFIRMED ]  │  │
│  └──────────────────────────────────────────────────────┘  │
│                                                            │
│  ┌──────────────────────────────────────────────────────┐  │
│  │ John Doe                                             │  │
│  │ Beard Trim                                           │  │
│  │ 📅 Jan 26, 2025  🕒 02:00 PM          [ PENDING ]    │  │
│  └──────────────────────────────────────────────────────┘  │
│                                                            │
│  ┌──────────────────────────────────────────────────────┐  │
│  │ Bob Wilson                                           │  │
│  │ Full Massage                                         │  │

│  │ 📅 Jan 28, 2025  🕒 11:30 AM          [ COMPLETED ]  │  │
│  └──────────────────────────────────────────────────────┘  │
│                                                            │
│                                           ┌──────────┐     │
│                                           │ [+] Book │     │
│                                           └──────────┘     │
└────────────────────────────────────────────────────────────┘
```

## Form Inputs
- **Search Input:** Native `TextInput` with clear button.
- **Filter Chips:** Horizontal `ScrollView` with `TouchableOpacity` chips for status selection.

## API Integration
- **Endpoint:** `GET /api/appointments/my` with query params.
- **Hook:** `useGetMyAppointments(params)`.

## Components Used
- Expo Router: `useRouter`, `Stack`.
- UI Components: `Card`, `Badge`, `Input`, `Loading`.
- Icons: `MaterialIcons`.

## Error Handling
- **Pull-to-Refresh:** Users can manually trigger a refetch if an error occurs or to check for updates.
- **Infinite Scroll Error:** Handle failures when loading more pages.

## Navigation Flow
- Route: `/appointment/index`.
- **Tap Card:** Navigate to `/appointment/[id]`.
- **Floating Action Button:** Navigate to `/appointment/select-service` to start booking.

## Implementation Details
- **FlatList Optimization:** Uses `keyExtractor` and `renderItem` for performance.
- **RefreshControl:** Standard mobile pull-to-refresh implementation.
