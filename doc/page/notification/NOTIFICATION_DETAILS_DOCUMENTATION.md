# Notification Details Screen Documentation (Mobile)

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
import { useCallback } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Alert, SafeAreaView } from 'react-native';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useGetNotification, useMarkNotificationAsRead, useDeleteNotification } from '@/tanstack/useNotifications';
import { formatDateTimeWithTime, getTypeDisplayName } from '@/utils/notificationUtils';
import StatusBadge from '@/components/ui/StatusBadge';
```

## Context and State Management
- **Route Params:** `useLocalSearchParams()` to get the notification `id`.
- **TanStack Query:** `useGetNotification(id)` fetches single notification data.
- **Mutations:** 
  - `useMarkNotificationAsRead()` marks item as read.
  - `useDeleteNotification()` deletes item and navigates back.

**`useGetNotification` hook (from `tanstack/useNotifications.ts`):**
```tsx
export const useGetNotification = (notificationId: string) => {
  return useQuery({
    queryKey: ['notifications', notificationId],
    queryFn: async () => {
      const response = await notificationAPI.getNotification(notificationId);
      return response.data.data.notification;
    },
    enabled: !!notificationId,
    staleTime: DEFAULT_STALE_TIME, // 5 minutes
    gcTime: DEFAULT_GC_TIME, // 10 minutes
  });
};
```

**`useMarkNotificationAsRead` hook (from `tanstack/useNotifications.ts`):**
```tsx
export const useMarkNotificationAsRead = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (notificationId: string) => {
      const response = await notificationAPI.markAsRead(notificationId);
      return response.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      queryClient.invalidateQueries({ queryKey: ['notifications', 'unread'] });
      queryClient.invalidateQueries({ queryKey: ['notifications', 'unread-count'] });
      console.log('Notification marked as read');
    },
    onError: (error: any) => {
      console.error('Mark as read error:', error);
    },
  });
};
```

**`useDeleteNotification` hook (from `tanstack/useNotifications.ts`):**
```tsx
export const useDeleteNotification = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (notificationId: string) => {
      const response = await notificationAPI.deleteNotification(notificationId);
      return response.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      queryClient.invalidateQueries({ queryKey: ['notifications', 'unread-count'] });
      console.log('Notification deleted');
    },
    onError: (error: any) => {
      console.error('Delete notification error:', error);
    },
  });
};
```

## UI Structure
- **Top Bar:** Back button and page title (delete button removed from header).
- **Detail Container:** Scrollable view containing all notification info.
- **Main Info:** Large subject with icon, StatusBadge for category and type.
- **Body:** Full message text with icon header.
- **Metadata Section:** Timestamps and technical details with icons.
- **Actions Bar:** Fixed bottom action button for Mark as Read (only shown if unread).

## Planned Layout
```
┌──────────────────────────────────────────┐
│ ← Details                                  │
├──────────────────────────────────────────┤
│                                          │
│  [Appointment Badge] [In-App Badge]      │
│                                          │
│  📝 Appointment Confirmed                │
│                                          │
│  💬 Message                              │
│  Your appointment for Haircut is         │
│  confirmed on Jan 15, 2025 at 10:30 AM.  │
│                                          │
│  --------------------------------------  │
│                                          │
│  ⏰ Sent: Jan 15, 2025 10:30 AM          │
│  ✅ Read: Jan 15, 2025 10:35 AM          │
│                                          │
│  [ Mark as Read ]                        │
└──────────────────────────────────────────┘
```

## Sketch Wireframe
```
┌──────────────────────────────────────────────────┐
│ ← Details                                          │
├──────────────────────────────────────────────────┤
│                                                  │
│ [Appointment]  [In-App]                          │
│                                                  │
│ 📝 Appointment Confirmed                         │
│                                                  │
│ 💬 Message                                       │
│ Your appointment for Haircut is confirmed on     │
│ January 15, 2025 at 10:30 AM.                    │
│                                                  │
│ ──────────────────────────────────────────────── │
│                                                  │
│ ⏰ Sent: Jan 15, 2025 10:30 AM                  │
│                                                  │
│ ✅ Status: Read                                   │
│                                                  │
│ ℹ️ Related Information:                           │
│   appointmentId: "abc123"                        │
│                                                  │
│                                                  │
│            [ Mark as Read Button ]               │
└──────────────────────────────────────────────────┘
```

## Form Inputs
- **Mark as Read Button:** Large action button at the bottom (only shown if notification is unread).
- **Action Buttons:** Dynamic buttons if bidirectional actions are present.

## API Integration
- **HTTP client:** `axios` instance from `api/config.ts` via `notificationAPI.getNotification`, `notificationAPI.markAsRead`, and `notificationAPI.deleteNotification`.
- **Get Endpoint:** `GET /api/notifications/:id`.
- **Headers:** Automatically includes `Authorization: Bearer <token>` from token store.
- **Response contract:** `response.data.data.notification` contains the notification object.
- **Response structure:**
  ```json
  {
    "success": true,
    "data": {
      "notification": {
        "_id": "...",
        "userId": "...",
        "category": "APPOINTMENT",
        "type": "IN_APP",
        "title": "Appointment Confirmed",
        "message": "Your appointment has been confirmed",
        "read": false,
        "isUnread": true,
        "createdAt": "2026-02-16T00:00:00.000Z",
        "readAt": null
      }
    }
  }
  ```
- **Mark Read Endpoint:** `PATCH /api/notifications/:id/read`.
- **Mark Read Response:**
  ```json
  {
    "success": true,
    "message": "Notification marked as read",
    "data": {
      "notification": {
        "_id": "...",
        "read": true,
        "readAt": "2026-02-16T10:30:00.000Z"
      }
    }
  }
  ```
- **Delete Endpoint:** `DELETE /api/notifications/:id`.
- **Delete Response:**
  ```json
  {
    "success": true,
    "message": "Notification deleted successfully"
  }
  ```
- **Cache invalidation:** After mark as read or delete, queries for `['notifications']`, `['notifications', 'unread']`, and `['notifications', 'unread-count']` are invalidated.

## Components Used
- `StatusBadge`: Badge component with icons for category and type badges.
- `ScrollView`: To handle long messages.
- `MaterialIcons`: For icons throughout (subject, message, schedule, done-all, info, label).
- **Skeleton Loader:** Full-page skeleton with `animate-pulse` for loading states (replaces ActivityIndicator).

## Error Handling
- **Loading State:** Full-page skeleton loader with `animate-pulse` showing badges, subject, message, and metadata placeholders.
- **Alerts:** For error reporting.
- **Fallback UI:** Shown if the notification is not found with error icon and "Go Back" button.

## Navigation Flow
- **Route:** `/(authenticated)/notifications/[id]`
- **Back:** Returns to List view.
- **Delete Success:** Redirects to List view.

## Functions Involved

- **`handleMarkAsRead`** — Marks the current notification as read if it's unread.
  ```tsx
  const handleMarkAsRead = useCallback(async () => {
    if (!notification || !notification.isUnread) return;
    try {
      await markAsReadMutation.mutateAsync(notification._id);
    } catch (error) {
      console.error('Failed to mark as read:', error);
    }
  }, [notification, markAsReadMutation]);
  ```

- **`handleDelete`** — Handles deleting the current notification with confirmation.
  ```tsx
  const handleDelete = useCallback(() => {
    Alert.alert(
      'Delete Notification',
      'Are you sure you want to delete this notification?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteMutation.mutateAsync(id!);
              router.back();
            } catch (error) {
              console.error('Failed to delete notification:', error);
            }
          },
        },
      ]
    );
  }, [id, deleteMutation, router]);
  ```

- **Auto-mark as read effect** — Automatically marks notification as read when opened if unread.
  ```tsx
  useEffect(() => {
    if (notification && notification.isUnread) {
      handleMarkAsRead();
    }
  }, [notification, handleMarkAsRead]);
  ```
- `handleDelete`: Removed from detail page (delete functionality removed).
- `handleActionClick`: Handles custom buttons from notification actions.

## Future Enhancements
- Support for attachments (images/PDFs).
- Direct reply interface.
- Rich text rendering for messages.

## Recent Changes
- **Removed:** Delete button from header.
- **Added:** Full-page skeleton loader with `animate-pulse` for loading states.
- **Added:** Icons throughout the page (subject, message, schedule, done-all, info, label) with gold family colors.
- **Updated:** Badge consistency - both category and type use `StatusBadge` component.
- **Updated:** Improved visual hierarchy with icon circles and colored text.
