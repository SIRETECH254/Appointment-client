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
import { useCallback, useEffect, useMemo, useState } from 'react';
import { View, Text, TouchableOpacity, FlatList, TextInput, ActivityIndicator, Alert, RefreshControl } from 'react-native';
import { useRouter } from 'expo-router';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useGetNotifications, useMarkNotificationAsRead, useMarkAllNotificationsAsRead, useDeleteNotification } from '@/tanstack/useNotifications';
import { formatDateTime, getCategoryBadgeClass, getTypeDisplayName } from '@/utils/notificationUtils';
import type { INotification } from '@/types/api.types';
```

## Context and State Management
- **TanStack Query:** `useGetNotifications(params)` fetches paginated notification list.
- **Mutations:** 
  - `useMarkNotificationAsRead()` handles marking individual notifications as read.
  - `useMarkAllNotificationsAsRead()` handles marking all notifications as read.
  - `useDeleteNotification()` handles notification deletion.
- **Local State:**
  - `searchTerm` - Current search input value.
  - `filterCategory` - Selected category filter (all/general/appointment/payment).
  - `currentPage` - Current page number.
- **Refresh State:** Handled by `onRefresh` for pull-to-refresh.

## UI Structure
- **Header:** Title "Notifications" with "Mark All Read" action.
- **Search Bar:** Integrated at the top of the list.
- **Category Filter:** Horizontal scrollable chips for filtering.
- **List Area:** `FlatList` for efficient scrolling and item rendering.
- **Notification Card:** Touch-optimized card with badges, subject, and preview.

## Planned Layout
```
┌──────────────────────────────────────────┐
│  Notifications             [Mark All Read]│
├──────────────────────────────────────────┤
│  [ 🔍 Search notifications...         ]  │
├──────────────────────────────────────────┤
│  [All] [Appointment] [Payment] [General] │
├──────────────────────────────────────────┤
│  ┌────────────────────────────────────┐  │
│  │ [Badge] Subject             (•) [>] │  │
│  │ Message preview text...            │  │
│  │ Type • Jan 15, 2025 10:30 AM       │  │
│  └────────────────────────────────────┘  │
│  ┌────────────────────────────────────┐  │
│  │ [Badge] Subject                 [>] │  │
│  │ Message preview text...            │  │
│  │ Type • Jan 14, 2025 2:15 PM        │  │
│  └────────────────────────────────────┘  │
└──────────────────────────────────────────┘
```

## Sketch Wireframe
```
┌──────────────────────────────────────────────────┐
│ ← Back         Notifications      [Mark All Read] │
├──────────────────────────────────────────────────┤
│ 🔍 [ Search notifications...                  ]  │
├──────────────────────────────────────────────────┤
│ [All]  [Appointment]  [Payment]  [General]       │
├──────────────────────────────────────────────────┤
│ ┌──────────────────────────────────────────────┐ │
│ │ [Appointment] Confirmed               🔵 [>] │ │
│ │ Your appointment for Haircut is confirmed... │ │
│ │ in_app • Jan 15, 10:30 AM                    │ │
│ └──────────────────────────────────────────────┘ │
│ ┌──────────────────────────────────────────────┐ │
│ │ [Payment] Successful                     [>] │ │
│ │ Your payment of $50.00 was successful...     │ │
│ │ email • Jan 14, 02:15 PM                     │ │
│ └──────────────────────────────────────────────┘ │
│                                                  │
│          (Pull to Refresh)                       │
└──────────────────────────────────────────────────┘
```

## Form Inputs
- **Search Input:** Native `TextInput` with search icon.
- **Category Chips:** `TouchableOpacity` items in a horizontal `ScrollView`.
- **Items Per Page:** (Not applicable for infinite scroll/standard mobile list, but could be added in settings).

## API Integration
- **Endpoint:** `GET /api/notifications` with query parameters.
- **Hook:** `useGetNotifications(params)`.
- **Response:** Paginated notification data.

## Components Used
- `FlatList`: Mobile-native list rendering.
- `MaterialIcons`: Icon library.
- `RefreshControl`: Pull-to-refresh functionality.
- Custom Classes: `badge-soft`, `btn-primary`, etc., from `global.css`.

## Error Handling
- **Loading:** `ActivityIndicator` or Skeleton cards.
- **Empty State:** Friendly message when no notifications match filters.
- **Error:** Alert or inline message with retry button.

## Navigation Flow
- **Route:** `/(authenticated)/notifications/index`
- **Item Tap:** Navigates to `/(authenticated)/notifications/[id]` (Details).
- **Back Button:** Navigates to Dashboard/Previous screen.

## Functions Involved
- `handleDelete`: Uses `Alert.alert` for confirmation.
- `handleMarkAsRead`: Mutation for single item.
- `handleMarkAllAsRead`: Mutation for all.
- `onRefresh`: Refetches data via TanStack Query.

## Future Enhancements
- Swipe-to-delete actions.
- Push notification deep linking.
- Real-time updates via WebSockets.
