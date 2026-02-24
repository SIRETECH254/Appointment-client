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
import React, { useState, useEffect, useMemo } from 'react';
import { View, Text, FlatList, TouchableOpacity, ActivityIndicator, RefreshControl, TextInput } from 'react-native';
import { useRouter, Stack } from 'expo-router';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useGetContactMessages } from '@/tanstack/useContactMessages'; // Placeholder hook
import { formatDateTime } from '@/utils/notificationUtils'; // Re-using existing date formatter
```

## Context and State Management
- **TanStack Query:** `useGetContactMessages(params)` (placeholder hook) to fetch a paginated list of submitted contact messages.
- **Local State:**
  - `searchTerm` - Current value of the search input for filtering messages.
  - `debouncedSearch` - Debounced version of `searchTerm` to reduce API calls.
  - `filterStatus` - Currently selected filter for message status (e.g., 'all', 'new', 'read', 'archived').
  - `page` - Current page number for pagination.
- **Derived State:** `params` object memoized for `useGetContactMessages` hook, incorporating search and filter criteria.

## UI Structure
- **Header:** Displays the screen title and potentially actions like "Mark All Read".
- **Search Bar:** A `TextInput` with a search icon for filtering messages by keywords.
- **Filter Chips:** A horizontal `ScrollView` containing `TouchableOpacity` chips for filtering messages by status (e.g., "All", "New", "Read").
- **Message List:** A `FlatList` component to efficiently render the contact messages.
- **Message Card:** Each item in the list is a card displaying key information about a submitted message (sender, subject, date, status).
- **Empty State:** A component to display when no messages are found after filtering or if the list is empty.
- **Loading State:** `ActivityIndicator` displayed while messages are being fetched.
- **Refresh Control:** `RefreshControl` integrated with `FlatList` for pull-to-refresh functionality.

## Planned Layout
```
┌────────────────────────────────────────────┐
│ Contact Messages                           │
├────────────────────────────────────────────┤
│ 🔍 Search messages...                      │
├────────────────────────────────────────────┤
│ [All] [New] [Read] [Archived]              │
├────────────────────────────────────────────┤
│ ┌────────────────────────────────────────┐ │
│ │ John Doe - Subject Line                │ │
│ │ Short message preview...               │ │
│ │ 📅 Jan 25, 2025        [New]           │ │
│ └────────────────────────────────────────┘ │
│ ┌────────────────────────────────────────┐ │
│ │ Jane Smith - Another Subject           │ │
│ │ Another message preview...             │ │
│ │ 📅 Jan 24, 2025        [Read]          │ │
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
- **Endpoint:** `GET /api/contact/messages` (hypothetical).
- **Hook:** `useGetContactMessages(params)` (placeholder TanStack Query hook).
- **Parameters:** `page`, `limit`, `search`, `status`.

## Components Used
- Expo Router: `useRouter`, `Stack`.
- React Native: `View`, `Text`, `FlatList`, `TouchableOpacity`, `ActivityIndicator`, `RefreshControl`, `TextInput`.
- Icons: `MaterialIcons` from `@expo/vector-icons`.
- Utility Functions: `formatDateTime` from `@/utils/notificationUtils` (or similar for messages).

## Error Handling
- **Loading State:** Displays an `ActivityIndicator` while data is being fetched.
- **Error State:** Placeholder to display an error message if fetching fails.
- **Empty State:** A dedicated UI component is shown if no contact messages are found or match the current filters.
- **Pull-to-Refresh:** Allows users to manually retry fetching data.

## Navigation Flow
- **Route:** `/(authenticated)/contact/index`
- **Tap Message Card:** Navigates to `/(authenticated)/contact/[id]` to view message details.
- **Back Button:** Navigates to a previous screen (e.g., authenticated dashboard).

## Functions Involved
- **`renderItem({ item })`:** Renders an individual contact message card within the `FlatList`. Formats message details and navigates to the detail screen on press.
- **`handleSearchChange(text)`:** Updates the `searchTerm` state, which is debounced to update `debouncedSearch`.
- **`handleStatusFilter(status)`:** Updates the `filterStatus` state.
- **`onRefresh()`:** Triggers the `refetch` function from the `useGetContactMessages` hook.

## Future Enhancements
- Implement infinite scrolling for `FlatList` to load more messages as the user scrolls.
- Add an action button to mark messages as read/archived directly from the list.
- Allow swipe-to-action gestures on message cards for quick management.
- Integrate push notifications for new contact messages.
- Add more advanced filtering options (e.g., by date range, sender email).
