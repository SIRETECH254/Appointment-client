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
import { useCallback, useMemo } from 'react';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useGetNotification, useMarkNotificationAsRead, useDeleteNotification } from '@/tanstack/useNotifications';
import { formatDateTimeWithTime, getCategoryBadgeClass, getTypeDisplayName } from '@/utils/notificationUtils';
import type { INotification } from '@/types/api.types';
```

## Context and State Management
- **Route Params:** `useLocalSearchParams()` to get the notification `id`.
- **TanStack Query:** `useGetNotification(id)` fetches single notification data.
- **Mutations:** 
  - `useMarkNotificationAsRead()` marks item as read.
  - `useDeleteNotification()` deletes item and navigates back.

## UI Structure
- **Top Bar:** Back button and page title.
- **Detail Container:** Scrollable view containing all notification info.
- **Main Info:** Large subject, badges for category and type.
- **Body:** Full message text.
- **Metadata Section:** Timestamps and technical details.
- **Actions Bar:** Fixed bottom or floating action buttons for Delete/Mark Read.

## Planned Layout
```
┌──────────────────────────────────────────┐
│ ← Notification Details            [🗑]    │
├──────────────────────────────────────────┤
│                                          │
│  [Appointment Badge] [In-App Badge]      │
│                                          │
│  Appointment Confirmed                   │
│                                          │
│  Your appointment for Haircut is         │
│  confirmed on Jan 15, 2025 at 10:30 AM.  │
│                                          │
│  --------------------------------------  │
│                                          │
│  Sent: Jan 15, 2025 10:30 AM             │
│  Read: Jan 15, 2025 10:35 AM             │
│                                          │
│  [ Mark as Read ]                        │
└──────────────────────────────────────────┘
```

## Sketch Wireframe
```
┌──────────────────────────────────────────────────┐
│ ← Details                                    [🗑] │
├──────────────────────────────────────────────────┤
│                                                  │
│ [Appointment]  [In-App]                          │
│                                                  │
│ Appointment Confirmed                            │
│                                                  │
│ Your appointment for Haircut is confirmed on     │
│ January 15, 2025 at 10:30 AM.                    │
│                                                  │
│ ──────────────────────────────────────────────── │
│                                                  │
│ Metadata:                                        │
│   appointmentId: "abc123"                        │
│                                                  │
│ Created: Jan 15, 2025 10:30 AM                   │
│ Read: —                                          │
│                                                  │
│                                                  │
│            [ Mark as Read Button ]               │
└──────────────────────────────────────────────────┘
```

## Form Inputs
- **Mark as Read Button:** Large action button at the bottom.
- **Delete Button:** Icon button in the top header.
- **Action Buttons:** Dynamic buttons if bidirectional actions are present.

## API Integration
- **Endpoint:** `GET /api/notifications/:id`.
- **Mark Read:** `PATCH /api/notifications/:id/read`.
- **Delete:** `DELETE /api/notifications/:id`.

## Components Used
- `ScrollView`: To handle long messages.
- `MaterialIcons`: For actions.
- `ActivityIndicator`: For loading states.

## Error Handling
- **Alerts:** For delete confirmation and error reporting.
- **Fallback UI:** Shown if the notification is not found.

## Navigation Flow
- **Route:** `/(authenticated)/notifications/[id]`
- **Back:** Returns to List view.
- **Delete Success:** Redirects to List view.

## Functions Involved
- `handleMarkAsRead`: Updates local cache and server.
- `handleDelete`: Triggers native `Alert` for confirmation.
- `handleActionClick`: Handles custom buttons from notification actions.

## Future Enhancements
- Support for attachments (images/PDFs).
- Direct reply interface.
- Rich text rendering for messages.
