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
- **Endpoint:** `GET /api/notifications/:id`.
- **Mark Read:** `PATCH /api/notifications/:id/read`.
- **Delete:** `DELETE /api/notifications/:id`.

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
- `handleMarkAsRead`: Updates local cache and server (automatically called when notification is opened if unread).
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
