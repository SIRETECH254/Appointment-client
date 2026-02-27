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
  - `filterStatus` - Selected status filter ('all', 'active', 'inactive') - currently always 'active' for public page.
- **Derived State:** `params` memo object combining search and status filters for API query.

**`useGetAllServices` hook (from `tanstack/useServices.ts`):**
```tsx
export const useGetAllServices = (params: GetServicesParams = {}) => {
  return useQuery({
    queryKey: ['services', params],
    queryFn: async () => {
      const response = await serviceAPI.getAllServices(params);
      return response.data.data.services;
    },
    staleTime: DEFAULT_STALE_TIME, // 5 minutes
    gcTime: DEFAULT_GC_TIME, // 10 minutes
  });
};
```

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
- **HTTP client:** `axios` instance from `api/config.ts` via `serviceAPI.getAllServices`.
- **Endpoint:** `GET /api/services` (public endpoint, returns active services by default).
- **Headers:** No authentication required for public endpoint.
- **Query Parameters:**
  - `search` - Optional string to search by name/description
  - `status` - Optional status filter ('active', 'inactive') - defaults to 'active' for public page
  - `page` - Optional page number for pagination
  - `limit` - Optional items per page
- **Hook:** `useGetAllServices(params)` returns `{ data, isLoading, error, refetch, isFetching }`.
- **Response contract:** `response.data.data.services` contains array of service objects.
- **Response structure:**
  ```json
  {
    "success": true,
    "data": {
      "services": [
        {
          "_id": "...",
          "name": "Haircut & Styling",
          "description": "Professional haircut with styling and finishing",
          "duration": 30,
          "fullPrice": 1500,
          "depositAmount": 500,
          "isActive": true,
          "createdAt": "2026-01-01T00:00:00.000Z",
          "updatedAt": "2026-01-01T00:00:00.000Z"
        }
      ],
      "pagination": {
        "currentPage": 1,
        "totalPages": 1,
        "totalServices": 10
      }
    }
  }
  ```
- **Cache invalidation:** Query cache is automatically managed by TanStack Query with 5-minute stale time.

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

- **`params` (memoized)** — Memoizes the query parameters object to prevent unnecessary re-renders and API calls.
  ```tsx
  const params = useMemo(() => ({
    search: debouncedSearch || undefined, // Only include search if it has a value
    status: 'active' as const, // Always fetch only active services
  }), [debouncedSearch]);
  ```

- **Search debouncing effect** — Debounces search term to prevent excessive API calls while user types.
  ```tsx
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchTerm);
    }, 500);
    return () => clearTimeout(timer);
  }, [searchTerm]);
  ```

- **`handleServiceCardPress`** — Handles navigation when a service card is tapped.
  ```tsx
  const handleServiceCardPress = useCallback((service: IService) => {
    // Navigate to appointment creation with pre-selected service
    router.push({
      pathname: '/(authenticated)/appointment/create',
      params: { serviceId: service._id }
    });
  }, [router]);
  ```

- **`handleBookNowPress`** — Handles "Book Now" button press on service card.
  ```tsx
  const handleBookNowPress = useCallback((service: IService) => {
    router.push({
      pathname: '/(authenticated)/appointment/create',
      params: { serviceId: service._id }
    });
  }, [router]);
  ```

- **`handleServicePaymentPress`** — Handles navigation to service payment page with authentication check.
  ```tsx
  const handleServicePaymentPress = useCallback(() => {
    if (isAuthenticated) {
      router.push('/(authenticated)/payments/service');
    } else {
      router.push('/(public)/(auth)/login');
    }
  }, [isAuthenticated, router]);
  ```

- **`onRefresh`** — Triggers the `refetch` function from the `useGetAllServices` hook for pull-to-refresh.
  ```tsx
  const onRefresh = useCallback(() => {
    refetch();
  }, [refetch]);
  ```

- **`formatDuration` utility (from `utils/serviceUtils.ts`)** — Formats duration in minutes to a human-readable string.
  ```tsx
  export const formatDuration = (duration: number): string => {
    if (duration < 60) {
      return `${duration} mins`;
    }
    const hours = duration / 60;
    return hours === 1 ? '1 hour' : `${hours} hours`;
  };
  ```

- **`formatCurrency` utility (from `utils/paymentUtils.ts`)** — Formats monetary amounts with currency symbol and proper decimal places.
  ```tsx
  export const formatCurrency = (amount: number | string | undefined, currency: string = 'KES') => {
    const value = typeof amount === 'string' ? parseFloat(amount) : amount;
    if (value === undefined || isNaN(value)) return `${currency} 0.00`;
    
    return `${currency} ${value.toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  };
  ```

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
