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
- **TanStack Query:** `useGetContactMessages(params)` to fetch a paginated list of submitted contact messages.
- **Local State:**
  - `filterStatus` - Currently selected filter for message status (e.g., 'all', 'new', 'read', 'archived').
  - `page` - Current page number for pagination (default: 1).
- **Derived State:** `params` object memoized for `useGetContactMessages` hook, incorporating filter criteria.

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
- **Endpoint:** `GET /api/contact/messages` (hypothetical).
- **Hook:** `useGetContactMessages(params)` (placeholder TanStack Query hook).
- **Parameters:** `page`, `limit`, `search`, `status`.

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
- **`renderItem({ item })`:** Renders `ContactCard` component for each contact message item (memoized with `useCallback`).
- **`handleStatusFilter(status)`:** Updates the `filterStatus` state when a filter chip is pressed.
- **`useEffect` for debounce:** Debounces the search input to avoid excessive API calls (500ms delay).
- **`useMemo` for params:** Memoizes the query parameters object to prevent unnecessary re-renders.
- **`onRefresh()`:** Triggers the `refetch` function from the `useGetAllContactMessages` hook for pull-to-refresh.

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