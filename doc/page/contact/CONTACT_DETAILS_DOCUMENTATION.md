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
import { View, Text, ScrollView, TouchableOpacity, Alert, SafeAreaView, Linking } from 'react-native';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useGetContactMessage, useMarkContactMessageAsRead } from '@/tanstack/useContactMessages';
import { formatDateTimeWithTime } from '@/utils/notificationUtils';
import StatusBadge from '@/components/ui/StatusBadge';
```

## Context and State Management
- **Route Params:** `useLocalSearchParams()` extracts the `id` of the contact message from the URL (`/contact/[id]`).
- **TanStack Query:**
  - `useGetContactMessageDetails(id)` (placeholder hook) fetches the details of a specific contact message.
  - `useMarkContactMessageAsRead()` (placeholder mutation) to mark the message as read.
  - `useArchiveContactMessage()` (placeholder mutation) to archive the message.

## UI Structure
- **SafeAreaView & ScrollView:** Main container for comfortable viewing on mobile devices.
- **Header:** Displays the screen title ("Message Details").
- **Sender Info Card:** Displays sender's name with icon, email with icon, and subject with icon.
- **Message Body Card:** Displays the full text of the contact message with icon header.
- **Metadata Section:** Shows details like phone number with icon, submission date with icon, and StatusBadge for current status.
- **Action Footer:** Contextual button "Mark as Read" (only shown if message is unread).
- **Loading State:** Full-page skeleton loader with `animate-pulse` for loading states.

## Planned Layout
```
┌────────────────────────────────────────────┐
│ < Back        Message Details               │
├────────────────────────────────────────────┤
│ 👤 John Doe                                 │
│ 📧 john@example.com                        │
│ 📝 Subject: Inquiry about Services         │
├────────────────────────────────────────────┤
│ 💬 Message                                  │
│ Lorem ipsum dolor sit amet, consectetur    │
│ adipiscing elit. ...                       │
├────────────────────────────────────────────┤
│ 📞 Phone: +254 712 345 678                  │
│ ⏰ Submitted On: Feb 20, 2026 10:30 AM     │
│ 🏷️ Status: [New]                            │
├────────────────────────────────────────────┤
│ [Mark as Read]                             │
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
- `StatusBadge`: Badge component with icons for contact status (NEW, READ, REPLIED, ARCHIVED).
- Expo Router: `useLocalSearchParams`, `useRouter`, `Stack`.
- React Native: `View`, `Text`, `ScrollView`, `TouchableOpacity`, `Alert`, `SafeAreaView`, `Linking`.
- Icons: `MaterialIcons` from `@expo/vector-icons` (person, email, subject, message, phone, flag, schedule).
- **Skeleton Loader:** Full-page skeleton with `animate-pulse` for loading states (replaces ActivityIndicator).
- Utility Functions: `formatDateTimeWithTime` from `@/utils/notificationUtils`.

## Error Handling
- **Loading State:** Full-page skeleton loader with `animate-pulse` showing sender info, message body, and metadata placeholders.
- **Error State:** Displays a user-friendly error message if fetching fails, with an option to go back.
- **Action Confirmation:** `Alert.alert` for error reporting.

## Navigation Flow
- **Route:** `/(authenticated)/contact/[id]`
- **Back Button:** Navigates back to the Contact List (`/(authenticated)/contact/index`).
- **Action Triggers:** Actions like Archive or Mark as Read may navigate back to the list or simply update the UI.

## Functions Involved
- **`handleMarkAsRead()`:** Marks the contact message as read using `useUpdateContactMessageStatus` mutation (only if status is 'NEW').
- **`handleArchive()`:** Archives the contact message using `useUpdateContactMessageStatus` mutation after user confirmation via Alert, then navigates back to list.
- **`useEffect` for auto-mark:** Automatically marks message as read when details screen is opened if message status is 'NEW'.
- **`formatDateTimeWithTime()`:** Formats the message creation timestamp for display.
- **`Linking.openURL()`:** Opens phone dialer when phone number is tapped (using `tel:` protocol).

## Future Enhancements
- Implement a dedicated reply interface within the app rather than opening an email client.
- Add "Mark as Unread" functionality for messages.
- Allow categorization or tagging of messages for better organization.
- Display attachments if the contact form supports them.
- Link sender's email/phone to their user profile if they are registered users.

## Recent Changes
- **Added:** Full-page skeleton loader with `animate-pulse` for loading states.
- **Added:** Icons throughout the page (person, email, subject, message, phone, flag, schedule) with gold family colors.
- **Updated:** Badge consistency - status uses `StatusBadge` component.
- **Updated:** Improved visual hierarchy with icon circles and colored text.
- **Updated:** Removed background colors from cards (white/gray backgrounds).
