# Contact List Screen Documentation

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
import React, { useState, useMemo } from 'react';
import { View, Text, FlatList, RefreshControl } from 'react-native';
import { useRouter, Stack } from 'expo-router';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useGetContactMessages } from '@/tanstack/useContactMessages';
import ContactCard from '@/components/ui/ContactCard';
import ContactCardSkeleton from '@/components/ui/ContactCardSkeleton';
import type { IContact } from '@/types/api.types';
```

## Context and State Management
- **TanStack Query:** `useGetAllContactMessages(params)` to fetch a paginated list of submitted contact messages.
- **Local State:**
  - `searchTerm` - Current search input value for filtering messages by keywords.
  - `debouncedSearch` - Debounced version of searchTerm (500ms delay) to reduce API calls.
  - `filterStatus` - Currently selected filter for message status (e.g., 'all', 'new', 'read', 'replied', 'archived').
  - `page` - Current page number for pagination (default: 1).
- **Derived State:** `params` object memoized for `useGetAllContactMessages` hook, incorporating filter criteria.

**`useGetAllContactMessages` hook (from `tanstack/useContact.ts`):**
```tsx
export const useGetAllContactMessages = (params: GetContactMessagesParams = {}) => {
  return useQuery<IContact[]>({
    queryKey: ['contactMessages', params],
    queryFn: async () => {
      const response = await contactAPI.getContactMessages(params);
      return response.data.data.contacts;
    },
    staleTime: DEFAULT_STALE_TIME, // 5 minutes
    gcTime: DEFAULT_GC_TIME, // 10 minutes
  });
};
```

## UI Structure
- **Header:** Displays the screen title "Contact Messages".
- **Search Bar:** A `TextInput` with search icon for filtering messages by keywords (sender name or subject).
- **Filter Chips:** A horizontal `ScrollView` containing `TouchableOpacity` chips for filtering messages by status (e.g., "All", "New", "Read", "Replied", "Archived").
- **Message List:** A `FlatList` component to efficiently render the contact messages.
- **Contact Card:** Reusable `ContactCard` component displaying sender name with icon, subject, message preview with icon, date with icon, and StatusBadge for status.
- **Empty State:** A component to display when no messages are found after filtering or if the list is empty.
- **Loading State:** Shows `ContactCardSkeleton` components while messages are being fetched.
- **Refresh Control:** `RefreshControl` integrated with `FlatList` for pull-to-refresh functionality.

## Planned Layout
```
┌────────────────────────────────────────────┐
│ Contact Messages                           │
├────────────────────────────────────────────┤
│ [All] [New] [Read] [Archived]              │
├────────────────────────────────────────────┤
│ ┌────────────────────────────────────────┐ │
│ │ 👤 John Doe - Subject Line             │ │
│ │ 💬 Short message preview...            │ │
│ │ ⏰ Jan 25, 2025        [New]           │ │
│ └────────────────────────────────────────┘ │
│ ┌────────────────────────────────────────┐ │
│ │ 👤 Jane Smith - Another Subject        │ │
│ │ 💬 Another message preview...           │ │
│ │ ⏰ Jan 24, 2025        [Read]          │ │
│ └────────────────────────────────────────┘ │
└────────────────────────────────────────────┘
```

## Sketch Wireframe
```
┌────────────────────────────────────────────────────────────┐
│  Contact Messages                                          │
├────────────────────────────────────────────────────────────┤
│  🔍 [ Search by sender or subject...          ]             │
├────────────────────────────────────────────────────────────┤
│  (All)  (New)  (Read)  (Archived)                          │
├────────────────────────────────────────────────────────────┤
│                                                            │
│  ┌──────────────────────────────────────────────────────┐  │
│  │ John Doe                                             │  │
│  │ Subject: Inquiry about Services                      │  │
│  │ Short message preview text...                        │  │
│  │ 📅 Feb 20, 2026 10:30 AM          [ NEW ]            │  │
│  └──────────────────────────────────────────────────────┘  │
│                                                            │
│  ┌──────────────────────────────────────────────────────┐  │
│  │ Jane Smith                                           │  │
│  │ Subject: Booking Issue                               │  │
│  │ Another message preview text...                      │  │
│  │ 📅 Feb 19, 2026 02:00 PM          [ READ ]           │  │
│  └──────────────────────────────────────────────────────┘  │
│                                                            │
│          (Pull to Refresh)                                 │
└────────────────────────────────────────────────────────────┘
```

## Form Inputs
- **Search Input:** `TextInput` for free-text search.
- **Filter Chips:** `TouchableOpacity` components for status filtering.

## API Integration
- **HTTP client:** `axios` instance from `api/config.ts` via `contactAPI.getContactMessages`.
- **Endpoint:** `GET /api/contact/messages` with query parameters.
- **Headers:** Automatically includes `Authorization: Bearer <token>` from token store.
- **Query Parameters:**
  - `search` - Optional string to search by sender name or subject
  - `status` - Optional status filter ('NEW', 'READ', 'REPLIED', 'ARCHIVED')
  - `page` - Optional page number for pagination
  - `limit` - Optional items per page
- **Hook:** `useGetAllContactMessages(params)` returns `{ data, isLoading, error, refetch, isFetching }`.
- **Response contract:** `response.data.data.contacts` contains array of contact message objects.
- **Response structure:**
  ```json
  {
    "success": true,
    "data": {
      "contacts": [
        {
          "_id": "...",
          "name": "John Doe",
          "email": "john@example.com",
          "subject": "Question about services",
          "message": "I would like to know...",
          "status": "NEW",
          "createdAt": "2026-02-16T00:00:00.000Z"
        }
      ],
      "pagination": {
        "currentPage": 1,
        "totalPages": 1,
        "totalContacts": 5
      }
    }
  }
  ```
- **Cache invalidation:** Query cache is automatically managed by TanStack Query with 5-minute stale time.

## Components Used
- `ContactCard`: Reusable card component displaying contact message with StatusBadge, icons, and preview.
- `ContactCardSkeleton`: Loading skeleton component for contact cards.
- `StatusBadge`: Badge component with icons for contact status (NEW, READ, REPLIED, ARCHIVED).
- Expo Router: `useRouter`, `Stack`.
- React Native: `View`, `Text`, `FlatList`, `RefreshControl`.
- Icons: `MaterialIcons` from `@expo/vector-icons` for empty state.

## Error Handling
- **Loading State:** Shows `ContactCardSkeleton` components while data is being fetched.
- **Error State:** Placeholder to display an error message if fetching fails.
- **Empty State:** A dedicated UI component is shown if no contact messages are found or match the current filters.
- **Pull-to-Refresh:** Allows users to manually retry fetching data.

## Navigation Flow
- **Route:** `/(authenticated)/contact/index`
- **Tap Message Card:** Navigates to `/(authenticated)/contact/[id]` to view message details.
- **Back Button:** Navigates to a previous screen (e.g., authenticated dashboard).

## Functions Involved

- **`renderItem`** — Renders `ContactCard` component for each contact message item (memoized with `useCallback`).
  ```tsx
  const renderItem = useCallback(({ item }: { item: IContact }) => {
    return <ContactCard contact={item} />;
  }, []);
  ```

- **`handleStatusFilter`** — Updates the `filterStatus` state when a filter chip is pressed.
  ```tsx
  const handleStatusFilter = useCallback((status: string) => {
    setFilterStatus(status);
  }, []);
  ```

- **Search debouncing effect** — Debounces search input to avoid excessive API calls (500ms delay).
  ```tsx
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchTerm);
    }, 500);
    return () => clearTimeout(timer);
  }, [searchTerm]);
  ```

- **`params` (memoized)** — Memoizes the query parameters object to prevent unnecessary re-renders.
  ```tsx
  const params = useMemo(() => ({
    search: debouncedSearch || undefined,
    status: filterStatus === 'all' ? undefined : filterStatus.toUpperCase(),
    page: page,
    limit: 10,
  }), [debouncedSearch, filterStatus, page]);
  ```

- **`onRefresh`** — Triggers the `refetch` function from the `useGetAllContactMessages` hook for pull-to-refresh.
  ```tsx
  const onRefresh = useCallback(() => {
    refetch();
  }, [refetch]);
  ```

## Future Enhancements
- Implement infinite scrolling for `FlatList` to load more messages as the user scrolls.
- Add an action button to mark messages as read/archived directly from the list.
- Allow swipe-to-action gestures on message cards for quick management.
- Integrate push notifications for new contact messages.
- Add more advanced filtering options (e.g., by date range, sender email).

## Recent Changes
- **Added:** `ContactCard` component with consistent StatusBadge usage.
- **Added:** `ContactCardSkeleton` for loading states.
- **Updated:** Badge consistency - status uses `StatusBadge` component.
- **Updated:** Icons added throughout cards (person, message, access-time) with gold family colors.
- **Updated:** Search functionality with debouncing (500ms delay) to reduce API calls.