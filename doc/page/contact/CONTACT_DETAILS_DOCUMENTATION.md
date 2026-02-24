# Contact Details Screen Documentation

## Table of Contents
- [Imports](#imports)
- [Context and State Management](#context-and-state-management)
- [UI Structure](#ui-structure)
- [Planned Layout](#planned-layout)
- [Sketch Wireframe](#sketch-wireframe)
- [Action Buttons](#action-buttons)
- [API Integration](#api-integration)
- [Components Used](#components-used)
- [Error Handling](#error-handling)
- [Navigation Flow](#navigation-flow)
- [Functions Involved](#functions-involved)
- [Future Enhancements](#future-enhancements)

## Imports
```tsx
import React, { useCallback } from 'react';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator, Alert, SafeAreaView } from 'react-native';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useGetContactMessageDetails, useMarkContactMessageAsRead, useArchiveContactMessage } from '@/tanstack/useContactMessages'; // Placeholder hooks
import { formatDateTimeWithTime } from '@/utils/notificationUtils'; // Re-using existing date formatter
```

## Context and State Management
- **Route Params:** `useLocalSearchParams()` extracts the `id` of the contact message from the URL (`/contact/[id]`).
- **TanStack Query:**
  - `useGetContactMessageDetails(id)` (placeholder hook) fetches the details of a specific contact message.
  - `useMarkContactMessageAsRead()` (placeholder mutation) to mark the message as read.
  - `useArchiveContactMessage()` (placeholder mutation) to archive the message.

## UI Structure
- **SafeAreaView & ScrollView:** Main container for comfortable viewing on mobile devices.
- **Header:** Displays the screen title ("Message Details") and action icons (e.g., Archive, Mark as Unread).
- **Message Header:** Displays sender's name, email, and subject.
- **Message Body:** Displays the full text of the contact message.
- **Metadata Section:** Shows details like phone number, submission date, and current status (e.g., New, Read).
- **Action Footer:** Contextual buttons based on message status (e.g., "Mark as Read", "Reply", "Archive").

## Planned Layout
```
┌────────────────────────────────────────────┐
│ < Back        Message Details      [🗑]    │
├────────────────────────────────────────────┤
│ From: John Doe <john@example.com>          │
│ Subject: Inquiry about Services            │
├────────────────────────────────────────────┤
│ Message:                                   │
│ Lorem ipsum dolor sit amet, consectetur    │
│ adipiscing elit. ...                       │
├────────────────────────────────────────────┤
│ Phone: +254 712 345 678                    │
│ Submitted On: Feb 20, 2026 10:30 AM        │
│ Status: New                                │
├────────────────────────────────────────────┤
│ [Mark as Read] [Archive]                   │
└────────────────────────────────────────────┘
```

## Sketch Wireframe
```
┌────────────────────────────────────────────────────────────┐
│ ← Details                                    [Archive] [•••] │
├────────────────────────────────────────────────────────────┤
│ From: John Doe (john@example.com)                          │
│ Subject: Inquiry about Services                            │
├────────────────────────────────────────────────────────────┤
│ Message:                                                   │
│ Hi team,                                                   │
│ I'm interested in your services and would like to know...  │
│ [Full message content]                                     │
├────────────────────────────────────────────────────────────┤
│ Metadata:                                                  │
│ Phone: +254 712 345 678                                    │
│ Submitted: Feb 20, 2026 10:30 AM                           │
│ Status: New                                                │
│                                                            │
│                                           [Mark as Read]   │
│                                                            │
└────────────────────────────────────────────────────────────┘
```

## Action Buttons
- **Mark as Read:** Button/icon to change message status to 'Read'.
- **Archive:** Button/icon to move the message to an archived state.
- **Reply:** Button to initiate an email reply (using `Linking.openURL`).
- **Delete:** Icon in header to permanently delete the message (with confirmation).

## API Integration
- **Endpoint:** `GET /api/contact/messages/:id` (hypothetical) for details.
- **Mutation Hooks:**
  - `PATCH /api/contact/messages/:id/read` (hypothetical) for marking as read.
  - `PATCH /api/contact/messages/:id/archive` (hypothetical) for archiving.
- **Hooks:** `useGetContactMessageDetails(id)`, `useMarkContactMessageAsRead()`, `useArchiveContactMessage()`.

## Components Used
- Expo Router: `useLocalSearchParams`, `useRouter`, `Stack`.
- React Native: `View`, `Text`, `ScrollView`, `TouchableOpacity`, `ActivityIndicator`, `Alert`, `SafeAreaView`.
- Icons: `MaterialIcons` from `@expo/vector-icons`.
- Utility Functions: `formatDateTimeWithTime` from `@/utils/notificationUtils` (or similar for messages).

## Error Handling
- **Loading State:** Displays an `ActivityIndicator` while message details are being fetched.
- **Error State:** Displays a user-friendly error message if fetching fails, with an option to go back.
- **Action Confirmation:** `Alert.alert` for confirming destructive actions (e.g., Delete, Archive).

## Navigation Flow
- **Route:** `/(authenticated)/contact/[id]`
- **Back Button:** Navigates back to the Contact List (`/(authenticated)/contact/index`).
- **Action Triggers:** Actions like Archive or Mark as Read may navigate back to the list or simply update the UI.

## Functions Involved
- **`handleMarkAsRead()`:** Calls the `useMarkContactMessageAsRead` mutation.
- **`handleArchive()`:** Calls the `useArchiveContactMessage` mutation, potentially navigating back to the list.
- **`handleReply()`:** Uses `Linking.openURL` to open an email client with pre-filled sender's email.

## Future Enhancements
- Implement a dedicated reply interface within the app rather than opening an email client.
- Add "Mark as Unread" functionality for messages.
- Allow categorization or tagging of messages for better organization.
- Display attachments if the contact form supports them.
- Link sender's email/phone to their user profile if they are registered users.
