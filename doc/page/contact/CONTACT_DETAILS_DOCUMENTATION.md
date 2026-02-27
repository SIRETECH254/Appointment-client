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
  - `useGetContactMessageById(id)` fetches the details of a specific contact message.
  - `useUpdateContactMessageStatus()` mutation to update message status (read, archived, etc.).

**`useGetContactMessageById` hook (from `tanstack/useContact.ts`):**
```tsx
export const useGetContactMessageById = (contactId: string) => {
  return useQuery<IContact>({
    queryKey: ['contactMessage', contactId],
    queryFn: async () => {
      const response = await contactAPI.getContactMessageById(contactId);
      return response.data.data.contact;
    },
    enabled: !!contactId, // Only run if contactId exists
    staleTime: DEFAULT_STALE_TIME, // 5 minutes
    gcTime: DEFAULT_GC_TIME, // 10 minutes
  });
};
```

**`useUpdateContactMessageStatus` hook (from `tanstack/useContact.ts`):**
```tsx
export const useUpdateContactMessageStatus = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ contactId, status }: { contactId: string; status: IContact['status'] }) => {
      const response = await contactAPI.updateContactMessage(contactId, { status });
      return response.data.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['contactMessages'] });
      queryClient.invalidateQueries({ queryKey: ['contactMessage', variables.contactId] });
      console.log(`Contact message ${variables.contactId} status updated to ${variables.status}`);
    },
    onError: (error: any) => {
      console.error('Failed to update contact message status:', error);
    },
  });
};
```

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
- **HTTP client:** `axios` instance from `api/config.ts` via `contactAPI.getContactMessageById` and `contactAPI.updateContactMessage`.
- **Get Endpoint:** `GET /api/contact/messages/:id` for details.
- **Headers:** Automatically includes `Authorization: Bearer <token>` from token store.
- **Response contract:** `response.data.data.contact` contains the contact message object.
- **Response structure:**
  ```json
  {
    "success": true,
    "data": {
      "contact": {
        "_id": "...",
        "name": "John Doe",
        "email": "john@example.com",
        "phone": "+254700000000",
        "subject": "Question about services",
        "message": "I would like to know more about...",
        "status": "NEW",
        "createdAt": "2026-02-16T00:00:00.000Z",
        "updatedAt": "2026-02-16T00:00:00.000Z"
      }
    }
  }
  ```
- **Update Status Endpoint:** `PATCH /api/contact/messages/:id` for updating status.
- **Update Payload:**
  ```json
  {
    "status": "READ"  // or "REPLIED", "ARCHIVED"
  }
  ```
- **Cache invalidation:** After status update, queries for `['contactMessages']` and `['contactMessage', contactId]` are invalidated.

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

- **`handleMarkAsRead`** — Marks the contact message as read using `useUpdateContactMessageStatus` mutation (only if status is 'NEW').
  ```tsx
  const handleMarkAsRead = useCallback(async () => {
    if (contact?.status === 'NEW') {
      try {
        await updateStatusMutation.mutateAsync({
          contactId: id!,
          status: 'READ',
        });
        // Toast notification can be added here if needed
      } catch {
        // Error handled by mutation
      }
    }
  }, [id, contact, updateStatusMutation]);
  ```

- **`handleArchive`** — Archives the contact message using `useUpdateContactMessageStatus` mutation.
  ```tsx
  const handleArchive = useCallback(async () => {
    Alert.alert(
      'Archive Message',
      'Are you sure you want to archive this message?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Archive',
          onPress: async () => {
            try {
              await updateStatusMutation.mutateAsync({
                contactId: id!,
                status: 'ARCHIVED',
              });
              router.back();
            } catch {
              // Error handled by mutation
            }
          },
        },
      ]
    );
  }, [id, updateStatusMutation, router]);
  ```

- **`handleReply`** — Opens email client with pre-filled recipient and subject.
  ```tsx
  const handleReply = useCallback(async () => {
    if (contact?.email) {
      const mailtoUrl = `mailto:${contact.email}?subject=Re: ${contact.subject}`;
      const canOpen = await Linking.canOpenURL(mailtoUrl);
      if (canOpen) {
        await Linking.openURL(mailtoUrl);
      } else {
        Alert.alert('Error', 'Unable to open email client');
      }
    }
  }, [contact]);
  ```
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
