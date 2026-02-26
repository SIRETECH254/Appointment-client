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
  - `filterStatus` - Selected status filter (all/pending/success/failed).
  - `filterMethod` - Selected payment method (all/mpesa/paystack).
  - `page` - Current page number for pagination (default: 1).
- **Derived State:** `params` memo for filtering and pagination.

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
- **Endpoint:** `GET /api/payments/my-payments` with query parameters.
- **Hook:** `useGetMyPayments(params)`.
- **Response Structure:**
  ```json
  {
    "success": true,
    "data": {
      "payments": [...],
      "pagination": {
        "currentPage": 1,
        "totalPages": 1,
        "totalPayments": 1
      }
    }
  }
  ```

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
- **`renderItem({ item })`:** Renders `PaymentCard` component for each payment item.
- **`handleStatusFilter(status)`:** Updates the `filterStatus` state when a filter chip is pressed.
- **`onRefresh()`:** Triggers the `refetch` function from the `useGetMyPayments` hook for pull-to-refresh.
- **`useMemo` for params:** Memoizes the query parameters object to prevent unnecessary re-renders.

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
