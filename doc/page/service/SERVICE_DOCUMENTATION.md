# Service List Screen Documentation

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
import { useState, useMemo, useEffect, useCallback } from 'react';
import { View, Text, FlatList, TouchableOpacity, ActivityIndicator, RefreshControl, TextInput, ScrollView } from 'react-native';
import { useRouter, Stack } from 'expo-router';
import { useGetAllServices } from '@/tanstack/useServices';
import { formatCurrency } from '@/utils/paymentUtils';
import { formatDuration } from '@/utils/serviceUtils';
import { useAuth } from '@/contexts/AuthContext';
import type { IService } from '@/types/api.types';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
```

## Context and State Management
- **TanStack Query:** `useGetAllServices(params)` fetches all available services from the API.
- **Auth Context:** `useAuth()` provides authentication status to conditionally show service payment button.
- **Local State:**
  - `searchTerm` - Current search input value for filtering services by name/description.
  - `debouncedSearch` - Debounced version of searchTerm (500ms delay) to reduce API calls.
  - `filterStatus` - Selected status filter ('all', 'active', 'inactive').
- **Derived State:** `params` memo object combining search and status filters for API query.

## UI Structure
- **Header Section:** Page title "Our Services" with service payment button (if authenticated).
- **Search Bar:** Input field with search icon and clear button, using `input-search` class.
- **Filter Chips:** Horizontal scrollable chips for status filtering (All, Active, Inactive).
- **Service Cards List:** FlatList displaying service cards with pull-to-refresh support.
- **Service Card:** Individual card showing service name, description, duration, price, and deposit.
- **Empty State:** Visual feedback when no services match the search/filter criteria.
- **Loading State:** ActivityIndicator with brand color during data fetch.
- **Floating Action Button:** Service payment button (visible when authenticated) in bottom right corner.

## Planned Layout
```
┌────────────────────────────────────────────┐
│ Our Services                    [💳 Pay]  │
├────────────────────────────────────────────┤
│ 🔍 Search services...                      │
├────────────────────────────────────────────┤
│ [All] [Active] [Inactive]                  │
├────────────────────────────────────────────┤
│ ┌────────────────────────────────────────┐ │
│ │ Haircut & Styling                       │ │
│ │ Professional haircut with styling...    │ │
│ │ ⏱ 30 mins  💰 KES 1,500                │ │
│ │ [Book Now]                              │ │
│ └────────────────────────────────────────┘ │
│ ┌────────────────────────────────────────┐ │
│ │ Beard Trim                              │ │
│ │ Precision beard trimming and shaping... │ │
│ │ ⏱ 20 mins  💰 KES 800                  │ │
│ │ [Book Now]                              │ │
│ └────────────────────────────────────────┘ │
└────────────────────────────────────────────┘
```

## Sketch Wireframe
```
┌────────────────────────────────────────────────────────────┐
│  Our Services                                    [💳 Pay]  │
├────────────────────────────────────────────────────────────┤
│  🔍 Search services by name or description...              │
├────────────────────────────────────────────────────────────┤
│  (All)  (Active)  (Inactive)                               │
├────────────────────────────────────────────────────────────┤
│                                                            │
│  ┌──────────────────────────────────────────────────────┐  │
│  │ Haircut & Styling                                     │  │
│  │ Professional haircut with styling and finishing       │  │
│  │                                                        │  │
│  │ ⏱ Duration: 30 mins                                  │  │
│  │ 💰 Price: KES 1,500                                   │  │
│  │ 💵 Deposit: KES 500                                   │  │
│  │                                                        │  │
│  │                                    [ Book Now ]        │  │
│  └──────────────────────────────────────────────────────┘  │
│                                                            │
│  ┌──────────────────────────────────────────────────────┐  │
│  │ Beard Trim                                            │  │
│  │ Precision beard trimming and shaping for a clean look │  │
│  │                                                        │  │
│  │ ⏱ Duration: 20 mins                                  │  │
│  │ 💰 Price: KES 800                                     │  │
│  │ 💵 Deposit: KES 300                                   │  │
│  │                                                        │  │
│  │                                    [ Book Now ]        │  │
│  └──────────────────────────────────────────────────────┘  │
│                                                            │
│  ┌──────────────────────────────────────────────────────┐  │
│  │ Full Body Massage                                     │  │
│  │ Relaxing full body massage therapy session           │  │
│  │                                                        │  │
│  │ ⏱ Duration: 60 mins                                  │  │
│  │ 💰 Price: KES 3,000                                   │  │
│  │ 💵 Deposit: KES 1,000                                 │  │
│  │                                                        │  │
│  │                                    [ Book Now ]        │  │
│  └──────────────────────────────────────────────────────┘  │
│                                                            │
│                                           ┌──────────┐     │
│                                           │ 💳 Pay   │     │
│                                           └──────────┘     │
└────────────────────────────────────────────────────────────┘
```

## Form Inputs
- **Search Input:** Native `TextInput` with search icon on left, clear button on right when text is present. Uses `input-search` class from global.css.
- **Filter Chips:** Horizontal `ScrollView` with `TouchableOpacity` chips for status selection. Active chip uses `bg-brand-primary` with white text.

## API Integration
- **Endpoint:** `GET /api/services` (public endpoint, returns active services by default).
- **Hook:** `useGetAllServices(params)` from `@/tanstack/useServices`.
- **Query Parameters:**
  - `search` - Search term for filtering by name/description.
  - `status` - Filter by status: 'active' | 'inactive' (defaults to 'active' for public).
  - `page` - Pagination page number (optional).
  - `limit` - Items per page (optional).
- **Response Structure:** Returns array of services with `_id`, `name`, `description`, `duration`, `fullPrice`, `depositAmount`, `isActive`, etc.

## Components Used
- **Expo Router:** `useRouter` for navigation, `Stack.Screen` for header configuration.
- **React Native Components:** `View`, `Text`, `FlatList`, `TouchableOpacity`, `ActivityIndicator`, `RefreshControl`, `TextInput`, `ScrollView`.
- **TanStack Query:** `useGetAllServices` hook for data fetching with caching.
- **Auth Context:** `useAuth` hook for checking authentication status.
- **Icons:** `MaterialIcons` from `@expo/vector-icons/MaterialIcons`.
- **Utility Functions:** `formatCurrency` from `@/utils/paymentUtils`, `formatDuration` from `@/utils/serviceUtils`.

## Error Handling
- **Loading State:** Shows ActivityIndicator with brand color (#D4AF37) and loading message during initial fetch.
- **Error State:** Displays error message if API call fails, with retry option via pull-to-refresh.
- **Empty State:** Shows helpful message when no services match search/filter criteria.
- **Pull-to-Refresh:** Users can manually trigger a refetch by pulling down the list, useful for error recovery or checking for updates.
- **Network Errors:** Handled gracefully with user-friendly error messages.

## Navigation Flow
- **Route:** `/(public)/services`.
- **Service Payment Button:** 
  - If authenticated: Navigates to `/(authenticated)/payments/service`.
  - If not authenticated: Redirects to login page first.
- **Service Card Tap:** Can navigate to service details (if route exists) or appointment creation with pre-selected service.
- **Book Now Button:** Navigates to appointment creation flow with the selected service.

## Functions Involved

### `formatDuration(duration: number): string`
Formats duration in minutes to a human-readable string.
- Input: Duration in minutes (e.g., 30, 90, 120).
- Output: Formatted string (e.g., "30 mins", "1.5 hours", "2 hours").
- Logic: Converts minutes to hours if >= 60, otherwise displays in minutes.

### `formatCurrency(amount: number | string | undefined, currency?: string): string`
Formats monetary amounts with currency symbol and proper decimal places.
- Input: Amount (number, string, or undefined), optional currency code (default: 'KES').
- Output: Formatted currency string (e.g., "KES 1,500.00").
- Logic: Handles undefined/null values, formats with locale-specific number formatting.

### `handleServicePaymentPress()`
Handles navigation to service payment page with authentication check.
- Checks `isAuthenticated` from `useAuth()`.
- If authenticated: Navigates to `/(authenticated)/payments/service`.
- If not authenticated: Redirects to `/(public)/(auth)/login`.

### `handleSearchDebounce()`
Debounces search input to reduce API calls.
- Uses `useEffect` with 500ms timeout.
- Updates `debouncedSearch` state after user stops typing.
- Cleans up timeout on unmount or when searchTerm changes.

### `renderServiceCard({ item }: { item: IService })`
Renders individual service card component.
- Displays service name, description (truncated), duration, price, and deposit.
- Includes "Book Now" button with navigation to appointment creation.
- Uses custom classes from global.css for consistent styling.

## Future Enhancements
- Add service detail modal/screen with full description and images.
- Implement service categories/tags for better organization.
- Add service comparison feature (compare multiple services side-by-side).
- Implement favorites/bookmarks for services.
- Add service reviews and ratings display.
- Implement advanced filtering (by price range, duration, category).
- Add service images/gallery support.
- Implement pagination for large service lists.
- Add service availability calendar integration.
- Implement service recommendations based on user history.
