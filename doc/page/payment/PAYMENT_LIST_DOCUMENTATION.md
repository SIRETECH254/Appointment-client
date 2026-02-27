# Payment History Screen Documentation (Mobile)

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
import { useState, useMemo } from 'react';
import { View, Text, FlatList, RefreshControl } from 'react-native';
import { useRouter, Stack } from 'expo-router';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useGetMyPayments } from '@/tanstack/usePayments';
import PaymentCard from '@/components/ui/PaymentCard';
import PaymentCardSkeleton from '@/components/ui/PaymentCardSkeleton';
import type { IPayment } from '@/types/api.types';
```

## Context and State Management
- **TanStack Query:** `useGetMyPayments(params)` fetches the authenticated user's payment history.
- **Local State:**
  - `searchTerm` - Current search input value for filtering by payment number.
  - `debouncedSearch` - Debounced version of searchTerm (500ms delay) to reduce API calls.
  - `filterStatus` - Selected status filter ('all', 'success', 'pending', 'failed').
- **Derived State:** `params` memo for filtering and pagination.

**`useGetMyPayments` hook (from `tanstack/usePayments.ts`):**
```tsx
export const useGetMyPayments = (params: GetMyPaymentsParams = {}) => {
  return useQuery({
    queryKey: ['payments', 'my', params],
    queryFn: async () => {
      const response = await paymentAPI.getMyPayments(params);
      return response.data.data;
    },
    staleTime: DEFAULT_STALE_TIME, // 5 minutes
    gcTime: DEFAULT_GC_TIME, // 10 minutes
  });
};
```

## UI Structure
- **Header:** Displays the screen title "Payment History".
- **Filter Bar:** Horizontal scroll for status and method chips.
- **FlatList:** Optimized mobile list for payment cards.
- **Payment Card:** Reusable `PaymentCard` component displaying payment number with icon, amount, date with icon, payment method with icon, type with icon, and StatusBadge for status.
- **Loading State:** Shows `PaymentCardSkeleton` components while payments are being fetched.

## Planned Layout
```
┌────────────────────────────────────────────┐
│ Payment History                             │
├────────────────────────────────────────────┤
│ [All] [Success] [Pending] [Failed]         │
├────────────────────────────────────────────┤
│ ┌────────────────────────────────────────┐ │
│ │ 🧾 PAY-2026-0029        [Success]     │ │
│ │ KES 500.00                             │ │
│ │ 📅 Feb 16, 2026  💳 M-Pesa             │ │
│ │ 🏷️ Type: Full Payment                  │ │
│ └────────────────────────────────────────┘ │
│ ┌────────────────────────────────────────┐ │
│ │ 🧾 PAY-2026-0030        [Pending]     │ │
│ │ KES 800.00                             │ │
│ │ 📅 Feb 17, 2026  💳 Card               │ │
│ │ 🏷️ Type: Booking Fee                   │ │
│ └────────────────────────────────────────┘ │
└────────────────────────────────────────────┘
```

## Sketch Wireframe
```
┌────────────────────────────────────────────────────────────┐
│  Payment History                                     [🔔]  │
├────────────────────────────────────────────────────────────┤
│  🔍 [ Search by payment number...             ]            │
├────────────────────────────────────────────────────────────┤
│  (All)  (Success)  (Pending)  (Failed)  (M-Pesa)  (Card)   │
├────────────────────────────────────────────────────────────┤
│                                                            │
│  ┌──────────────────────────────────────────────────────┐  │
│  │ PAY-2026-0029                            [ SUCCESS ] │  │
│  │ KES 500.00                                           │  │
│  │ 📅 Feb 16, 2026  💳 M-Pesa                       [>] │  │
│  └──────────────────────────────────────────────────────┘  │
│                                                            │
│  ┌──────────────────────────────────────────────────────┐  │
│  │ PAY-2026-0030                            [ PENDING ] │  │
│  │ KES 800.00                                           │  │
│  │ 📅 Feb 17, 2026  💳 Paystack                     [>] │  │
│  └──────────────────────────────────────────────────────┘  │
│                                                            │
│          (Pull to Refresh)                                 │
└────────────────────────────────────────────────────────────┘
```

## Form Inputs
- **Search Input:** Native `TextInput` with search icon.
- **Filter Chips:** Horizontal `ScrollView` with `TouchableOpacity` chips for status/method selection.

## API Integration
- **HTTP client:** `axios` instance from `api/config.ts` via `paymentAPI.getMyPayments`.
- **Endpoint:** `GET /api/payments/my-payments` with query parameters.
- **Headers:** Automatically includes `Authorization: Bearer <token>` from token store.
- **Query parameters:**
  - `search` - Optional string to search by payment number
  - `status` - Optional status filter ('SUCCESS', 'PENDING', 'PROCESSING', 'FAILED', 'CANCELLED')
  - `method` - Optional payment method filter ('MPESA', 'PAYSTACK')
  - `page` - Optional page number for pagination
  - `limit` - Optional items per page
- **Hook:** `useGetMyPayments(params)` returns `{ data, isLoading, error, refetch, isFetching }`.
- **Response contract:** `response.data.data` contains `{ payments: [...], pagination: {...} }`.
- **Response structure:**
  ```json
  {
    "success": true,
    "data": {
      "payments": [
        {
          "_id": "...",
          "paymentNumber": "PAY-2026-0029",
          "amount": 500,
          "currency": "KES",
          "method": "MPESA",
          "status": "SUCCESS",
          "type": "BOOKING_FEE",
          "createdAt": "2026-02-16T00:00:00.000Z"
        }
      ],
      "pagination": {
        "currentPage": 1,
        "totalPages": 1,
        "totalPayments": 1
      }
    }
  }
  ```
- **Cache invalidation:** Query is automatically invalidated when payments are created or updated via mutations.

## Components Used
- `PaymentCard`: Reusable card component displaying payment with StatusBadge, icons, and formatted information.
- `PaymentCardSkeleton`: Loading skeleton component for payment cards.
- `StatusBadge`: Badge component with icons for payment status (SUCCESS, COMPLETED, PENDING, PROCESSING, FAILED, CANCELLED).
- Expo Router: `useRouter`, `Stack`.
- UI Components: `FlatList`, `RefreshControl`.
- Icons: `MaterialIcons` for empty state.

## Error Handling
- **Pull-to-Refresh:** Users can manually refetch data.
- **Empty State:** Friendly message when no payments match filters.
- **Loading State:** Shows `PaymentCardSkeleton` components while data is being fetched.

## Navigation Flow
- Route: `/(authenticated)/payments/index`.
- **Tap Card:** Navigate to `/(authenticated)/payments/[id]`.
- **Back Button:** Navigate to Profile or Home.

## Functions Involved

- **`renderItem`** — Renders `PaymentCard` component for each payment item in the FlatList.
  ```tsx
  const renderItem = ({ item }: { item: IPayment }) => {
    return <PaymentCard payment={item} />;
  };
  ```

- **`handleStatusFilter`** — Updates the `filterStatus` state when a filter chip is pressed.
  ```tsx
  const handleStatusFilter = (status: string) => {
    setFilterStatus(status);
  };
  ```

- **`onRefresh`** — Triggers the `refetch` function from the `useGetMyPayments` hook for pull-to-refresh.
  ```tsx
  const onRefresh = () => {
    refetch();
  };
  ```

- **`params` (memoized)** — Memoizes the query parameters object to prevent unnecessary re-renders and API calls.
  ```tsx
  const params = useMemo(() => ({
    search: debouncedSearch || undefined,
    status: filterStatus === 'all' ? undefined : filterStatus.toUpperCase(),
  }), [debouncedSearch, filterStatus]);
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

## Implementation Details
- **FlatList Optimization:** Uses `keyExtractor` and `renderItem`.
- **Chip Toggles:** Visual feedback for active filters.
- **Infinite Scroll:** (Optional) Load more pages on scroll end.

## Future Enhancements
- Export payment history to PDF.
- Date range filtering.
- Visual charts for spending history.

## Recent Changes
- **Removed:** Search bar functionality.
- **Added:** `PaymentCard` component with consistent StatusBadge usage.
- **Added:** `PaymentCardSkeleton` for loading states.
- **Updated:** Badge consistency - status uses `StatusBadge` component.
- **Updated:** Icons added throughout cards (receipt, event, payment, category) with gold family colors.
