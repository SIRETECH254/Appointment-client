# Notification List Screen Documentation (Mobile)

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
import { useState, useCallback, useMemo } from 'react';
import { View, Text, TouchableOpacity, FlatList, RefreshControl, Alert, ScrollView } from 'react-native';
import { useRouter, Stack } from 'expo-router';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useGetNotifications, useMarkAllNotificationsAsRead } from '@/tanstack/useNotifications';
import NotificationCard from '@/components/ui/NotificationCard';
import NotificationCardSkeleton from '@/components/ui/NotificationCardSkeleton';
import type { Notification } from '@/types/api.types';
```

## Context and State Management
- **TanStack Query:** `useGetNotifications(params)` fetches paginated notification list.
- **Mutations:** 
  - `useMarkAllNotificationsAsRead()` handles marking all notifications as read.
- **Local State:**
  - `filterCategory` - Selected category filter ('all', 'appointment', 'payment', 'system', 'promotional', 'general').
  - `page` - Current page number (default: 1).
- **Refresh State:** Handled by `onRefresh` for pull-to-refresh.

**`useGetNotifications` hook (from `tanstack/useNotifications.ts`):**
```tsx
export const useGetNotifications = (params: GetNotificationsParams = {}) => {
  return useQuery({
    queryKey: ['notifications', params],
    queryFn: async () => {
      const response = await notificationAPI.getNotifications(params);
      return response.data.data;
    },
    staleTime: DEFAULT_STALE_TIME, // 5 minutes
    gcTime: DEFAULT_GC_TIME, // 10 minutes
  });
};
```

**`useMarkAllNotificationsAsRead` hook (from `tanstack/useNotifications.ts`):**
```tsx
export const useMarkAllNotificationsAsRead = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      const response = await notificationAPI.markAllAsRead();
      return response.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      queryClient.invalidateQueries({ queryKey: ['notifications', 'unread-count'] });
      console.log('All notifications marked as read');
    },
    onError: (error: any) => {
      console.error('Mark all as read error:', error);
    },
  });
};
```

## UI Structure
- **Header:** Title "Notifications" with "Mark All Read" action.
- **Category Filter:** Horizontal scrollable chips for filtering (All, Appointment, Payment, General).
- **List Area:** `FlatList` for efficient scrolling and item rendering.
- **Notification Card:** Reusable `NotificationCard` component with StatusBadge for category and type, icons, and preview.
- **Loading State:** Shows 5 `NotificationCardSkeleton` components while loading.

## Planned Layout
```
┌──────────────────────────────────────────┐
│  Notifications             [Mark All Read]│
├──────────────────────────────────────────┤
│  [All] [Appointment] [Payment] [General] │
├──────────────────────────────────────────┤
│  ┌────────────────────────────────────┐  │
│  │ [Category] [Type]          (•)      │  │
│  │ 📝 Subject                          │  │
│  │ 💬 Message preview text...          │  │
│  │ ⏰ Jan 15, 2025                     │  │
│  └────────────────────────────────────┘  │
│  ┌────────────────────────────────────┐  │
│  │ [Category] [Type]                   │  │
│  │ 📝 Subject                          │  │
│  │ 💬 Message preview text...          │  │
│  │ ⏰ Jan 14, 2025                     │  │
│  └────────────────────────────────────┘  │
└──────────────────────────────────────────┘
```

## Sketch Wireframe
```
┌──────────────────────────────────────────────────┐
│ ← Back         Notifications      [Mark All Read] │
├──────────────────────────────────────────────────┤
│ [All]  [Appointment]  [Payment]  [General]       │
├──────────────────────────────────────────────────┤
│ ┌──────────────────────────────────────────────┐ │
│ │ [Appointment] [In-App]                🔵      │ │
│ │ 📝 Appointment Confirmed                     │ │
│ │ 💬 Your appointment for Haircut is...         │ │
│ │ ⏰ Jan 15, 2025                               │ │
│ └──────────────────────────────────────────────┘ │
│ ┌──────────────────────────────────────────────┐ │
│ │ [Payment] [Email]                             │ │
│ │ 📝 Payment Successful                         │ │
│ │ 💬 Your payment of $50.00 was...             │ │
│ │ ⏰ Jan 14, 2025                                │ │
│ └──────────────────────────────────────────────┘ │
│                                                  │
│          (Pull to Refresh)                       │
└──────────────────────────────────────────────────┘
```

## Form Inputs
- **Category Chips:** `TouchableOpacity` items in a horizontal `ScrollView` for filtering by category.
- **Items Per Page:** Default limit of 20 notifications per page.

## API Integration
- **HTTP client:** `axios` instance from `api/config.ts` via `notificationAPI.getNotifications`.
- **Endpoint:** `GET /api/notifications` with query parameters.
- **Headers:** Automatically includes `Authorization: Bearer <token>` from token store.
- **Query Parameters:**
  - `category` - Optional category filter ('APPOINTMENT', 'PAYMENT', 'SYSTEM', 'PROMOTIONAL', 'GENERAL')
  - `type` - Optional type filter ('EMAIL', 'SMS', 'PUSH', 'IN_APP')
  - `read` - Optional boolean to filter by read status
  - `page` - Optional page number for pagination
  - `limit` - Optional items per page
- **Hook:** `useGetNotifications(params)` returns `{ data, isLoading, error, refetch, isFetching }`.
- **Response contract:** `response.data.data` contains `{ notifications: [...], pagination: {...} }`.
- **Response structure:**
  ```json
  {
    "success": true,
    "data": {
      "notifications": [
        {
          "_id": "...",
          "userId": "...",
          "category": "APPOINTMENT",
          "type": "IN_APP",
          "title": "Appointment Confirmed",
          "message": "Your appointment has been confirmed",
          "read": false,
          "createdAt": "2026-02-16T00:00:00.000Z"
        }
      ],
      "pagination": {
        "currentPage": 1,
        "totalPages": 1,
        "totalNotifications": 10
      }
    }
  }
  ```
- **Cache invalidation:** Query cache is automatically managed by TanStack Query with 5-minute stale time.

## Components Used
- `NotificationCard`: Reusable card component displaying notification with StatusBadge for category and type, icons, and preview.
- `NotificationCardSkeleton`: Loading skeleton component (shows 5 instances while loading).
- `StatusBadge`: Badge component with icons for category (appointment, payment, system, promotional, general) and type (email, sms, push, in_app).
- `FlatList`: Mobile-native list rendering.
- `MaterialIcons`: Icon library for empty state.
- `RefreshControl`: Pull-to-refresh functionality.

## Error Handling
- **Loading:** Shows 5 `NotificationCardSkeleton` components with `animate-pulse` effect.
- **Empty State:** Friendly message with icon when no notifications match filters.
- **Error:** Alert or inline message with retry button.

## Navigation Flow
- **Route:** `/(authenticated)/notifications/index`
- **Item Tap:** Navigates to `/(authenticated)/notifications/[id]` (Details).
- **Back Button:** Navigates to Dashboard/Previous screen.

## Functions Involved

- **`handleMarkAllAsRead`** — Uses `Alert.alert` for confirmation, then mutation to mark all as read.
  ```tsx
  const handleMarkAllAsRead = useCallback(() => {
    Alert.alert(
      'Mark All as Read',
      'Are you sure you want to mark all notifications as read?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Mark All Read',
          onPress: async () => {
            try {
              await markAllAsReadMutation.mutateAsync();
            } catch {
              // Error handled by mutation
            }
          },
        },
      ]
    );
  }, [markAllAsReadMutation]);
  ```

- **`onRefresh`** — Refetches data via TanStack Query for pull-to-refresh.
  ```tsx
  const onRefresh = useCallback(() => {
    refetch();
  }, [refetch]);
  ```

- **`renderItem`** — Renders `NotificationCard` component for each notification item.
  ```tsx
  const renderItem = useCallback(({ item }: { item: Notification }) => {
    return <NotificationCard notification={item} />;
  }, []);
  ```

- **`params` (memoized)** — Memoizes the query parameters object to prevent unnecessary re-renders.
  ```tsx
  const params = useMemo(() => ({
    category: filterCategory === 'all' ? undefined : filterCategory.toUpperCase(),
    page: page,
    limit: 20,
  }), [filterCategory, page]);
  ```

## Future Enhancements
- Push notification deep linking.
- Real-time updates via WebSockets.
- Search functionality (currently removed).
- Swipe-to-delete actions (delete button removed from cards).

## Recent Changes
- **Removed:** Search bar functionality.
- **Removed:** Delete button from notification cards.
- **Added:** `NotificationCard` component with consistent StatusBadge usage.
- **Added:** `NotificationCardSkeleton` for loading states (5 instances).
- **Updated:** Badge consistency - both category and type use `StatusBadge` component.
- **Updated:** Icons added throughout cards (subject, message, date) with gold family colors.