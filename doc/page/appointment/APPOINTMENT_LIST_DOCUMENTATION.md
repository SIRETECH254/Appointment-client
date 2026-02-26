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
import { useState, useMemo } from 'react';
import { View, Text, FlatList, RefreshControl } from 'react-native';
import { useRouter, Stack } from 'expo-router';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useGetMyAppointments } from '@/tanstack/useAppointments';
import AppointmentCard from '@/components/ui/AppointmentCard';
import AppointmentCardSkeleton from '@/components/ui/AppointmentCardSkeleton';
import type { IAppointment } from '@/types/api.types';
```

## Context and State Management
- **TanStack Query:** `useGetMyAppointments(params)` fetches the user's appointments.
- **Local State:**
  - `filterStatus` - Selected status (all, PENDING, CONFIRMED, COMPLETED, CANCELLED, NO_SHOW).
  - `page` - Current page number for pagination (default: 1).
- **Derived State:** `params` memo for filtering and pagination.

## UI Structure
- **Header:** Displays the screen title "My Appointments".
- **Filter Bar:** Horizontal scroll for status chips.
- **FlatList:** Optimized list for mobile rendering.
- **Appointment Card:** Reusable `AppointmentCard` component displaying services, date/time with icon, booked on with icon, staff with icon, StatusBadge for status, and total amount.
- **Loading State:** Shows `AppointmentCardSkeleton` components while appointments are being fetched.
- **Empty State:** Visual feedback when no appointments exist.

## Planned Layout
```
┌────────────────────────────────────────────┐
│ My Appointments                             │
├────────────────────────────────────────────┤
│ [All] [Pending] [Confirmed] [Completed]    │
├────────────────────────────────────────────┤
│ ┌────────────────────────────────────────┐ │
│ │ Haircut, Trim              [Confirmed] │ │
│ │ 📅 Jan 25, 9:00 AM                     │ │
│ │ ⏰ Booked on: Jan 20, 2025             │ │
│ │ 👤 Staff: Jane Smith                    │ │
│ │ Total Amount: KES 1,000.00          [>] │ │
│ └────────────────────────────────────────┘ │
│ ┌────────────────────────────────────────┐ │
│ │ Beard Trim                  [Pending]  │ │
│ │ 📅 Jan 26, 2:00 PM                     │ │
│ │ ⏰ Booked on: Jan 21, 2025             │ │
│ │ 👤 Staff: John Doe                     │ │
│ │ Total Amount: KES 500.00            [>] │ │
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
- `AppointmentCard`: Reusable card component displaying appointment with StatusBadge, icons, and formatted information.
- `AppointmentCardSkeleton`: Loading skeleton component for appointment cards.
- `StatusBadge`: Badge component with icons for appointment status (PENDING, CONFIRMED, COMPLETED, CANCELLED, NO_SHOW).
- Expo Router: `useRouter`, `Stack`.
- UI Components: `FlatList`, `RefreshControl`.
- Icons: `MaterialIcons` for empty state.

## Error Handling
- **Pull-to-Refresh:** Users can manually trigger a refetch if an error occurs or to check for updates.
- **Loading State:** Shows `AppointmentCardSkeleton` components while data is being fetched.
- **Empty State:** Friendly message when no appointments match filters.
- **Infinite Scroll Error:** Handle failures when loading more pages.

## Navigation Flow
- Route: `/appointment/index`.
- **Tap Card:** Navigate to `/appointment/[id]`.
- **Floating Action Button:** Navigate to `/appointment/create` to start booking.

## Functions Involved
- **`renderItem({ item })`:** Renders `AppointmentCard` component for each appointment item.
- **`handleStatusFilter(status)`:** Updates the `filterStatus` state when a filter chip is pressed.
- **`onRefresh()`:** Triggers the `refetch` function from the `useGetMyAppointments` hook for pull-to-refresh.
- **`useMemo` for params:** Memoizes the query parameters object to prevent unnecessary re-renders.

## Implementation Details
- **FlatList Optimization:** Uses `keyExtractor` and `renderItem` for performance.
- **RefreshControl:** Standard mobile pull-to-refresh implementation.

## Recent Changes
- **Removed:** Search bar functionality.
- **Added:** `AppointmentCard` component with consistent StatusBadge usage.
- **Added:** `AppointmentCardSkeleton` for loading states.
- **Updated:** Badge consistency - status uses `StatusBadge` component.
- **Updated:** Icons added throughout cards (event, access-time, person) with gold family colors.
- **Updated:** Added detailed comments to card component sections.
