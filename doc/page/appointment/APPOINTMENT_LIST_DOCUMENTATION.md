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
  - `searchTerm` - Current search input value for filtering by service name.
  - `debouncedSearch` - Debounced version of searchTerm (500ms delay) to reduce API calls.
  - `filterStatus` - Selected status filter ('all', 'pending', 'confirmed', 'completed', 'cancelled').
- **Derived State:** `params` memo for filtering and pagination.

**`useGetMyAppointments` hook (from `tanstack/useAppointments.ts`):**
```tsx
export const useGetMyAppointments = (params: GetMyAppointmentsParams = {}) => {
  return useQuery({
    queryKey: ['appointments', 'my', params],
    queryFn: async () => {
      const response = await appointmentAPI.getMyAppointments(params);
      return response.data.data.appointments;
    },
    staleTime: DEFAULT_STALE_TIME, // 5 minutes
    gcTime: DEFAULT_GC_TIME, // 10 minutes
  });
};
```

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
- **HTTP client:** `axios` instance from `api/config.ts` via `appointmentAPI.getMyAppointments`.
- **Endpoint:** `GET /api/appointments/my` with query parameters.
- **Headers:** Automatically includes `Authorization: Bearer <token>` from token store.
- **Query parameters:**
  - `search` - Optional string to search by service name
  - `status` - Optional status filter ('pending', 'confirmed', 'completed', 'cancelled', 'no_show')
  - `page` - Optional page number for pagination
  - `limit` - Optional items per page
- **Hook:** `useGetMyAppointments(params)` returns `{ data, isLoading, error, refetch, isFetching }`.
- **Response contract:** `response.data.data.appointments` contains array of appointment objects.
- **Response structure:**
  ```json
  {
    "success": true,
    "data": {
      "appointments": [
        {
          "_id": "...",
          "customerId": "...",
          "staffId": "...",
          "services": [...],
          "startTime": "2026-02-01T09:00:00.000Z",
          "endTime": "2026-02-01T10:00:00.000Z",
          "status": "CONFIRMED",
          "bookingFeeAmount": 500,
          "remainingAmount": 1000,
          "createdAt": "2026-01-20T00:00:00.000Z"
        }
      ],
      "pagination": {
        "currentPage": 1,
        "totalPages": 1,
        "totalAppointments": 5
      }
    }
  }
  ```
- **Cache invalidation:** Query is automatically invalidated when appointments are created, updated, or cancelled via mutations.

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

- **`renderItem`** — Renders `AppointmentCard` component for each appointment item in the FlatList.
  ```tsx
  const renderItem = ({ item }: { item: IAppointment }) => {
    return <AppointmentCard appointment={item} />;
  };
  ```

- **`handleStatusFilter`** — Updates the `filterStatus` state when a filter chip is pressed.
  ```tsx
  const handleStatusFilter = (status: string) => {
    setFilterStatus(status);
  };
  ```

- **`onRefresh`** — Triggers the `refetch` function from the `useGetMyAppointments` hook for pull-to-refresh.
  ```tsx
  const onRefresh = () => {
    refetch();
  };
  ```

- **`params` (memoized)** — Memoizes the query parameters object to prevent unnecessary re-renders and API calls.
  ```tsx
  const params = useMemo(() => ({
    search: debouncedSearch || undefined,
    status: filterStatus === 'all' ? undefined : filterStatus.toLowerCase(),
  }), [debouncedSearch, filterStatus]);
  ```

- **Search debouncing effect** — Debounces search term to prevent excessive API calls while user types.
  ```tsx
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchTerm);
    }, 500);
    return () => clearTimeout(timer);
  }, [searchTerm]);
  ```

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
