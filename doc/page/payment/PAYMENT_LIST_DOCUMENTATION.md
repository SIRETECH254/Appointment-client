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
import { useCallback, useEffect, useMemo, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, ActivityIndicator, RefreshControl, TextInput, ScrollView } from 'react-native';
import { useRouter, Stack } from 'expo-router';
import { useGetMyPayments } from '@/tanstack/usePayments';
import { formatPaymentStatus, getPaymentStatusVariant, formatPaymentMethod, formatCurrency } from '@/utils/paymentUtils';
import { formatDateTime } from '@/utils/notificationUtils';
import type { IPayment } from '@/types/api.types';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
```

## Context and State Management
- **TanStack Query:** `useGetMyPayments(params)` fetches the authenticated user's payment history.
- **Local State:**
  - `searchTerm` - Current search input value.
  - `filterStatus` - Selected status filter (all/pending/success/failed).
  - `filterMethod` - Selected payment method (all/mpesa/paystack).
  - `currentPage` - Current page number for pagination.
- **Derived State:** `params` memo for filtering and pagination.

## UI Structure
- **Header with Search:** Sticky search input and filter toggles.
- **Filter Bar:** Horizontal scroll for status and method chips.
- **FlatList:** Optimized mobile list for payment cards.
- **Payment Card:** Touch-optimized card showing amount, status, date, and method.

## Planned Layout
```
┌────────────────────────────────────────────┐
│ 🔍 Search Payment #                        │
├────────────────────────────────────────────┤
│ [All] [Success] [Pending] [Failed]         │
├────────────────────────────────────────────┤
│ ┌────────────────────────────────────────┐ │
│ │ PAY-2026-0029              [Success]   │ │
│ │ KES 500.00                             │ │
│ │ Feb 16, 2026 • M-Pesa                  │ │
│ └────────────────────────────────────────┘ │
│ ┌────────────────────────────────────────┐ │
│ │ PAY-2026-0030              [Pending]   │ │
│ │ KES 800.00                             │ │
│ │ Feb 17, 2026 • Card                    │ │
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
- Expo Router: `useRouter`, `Stack`.
- UI Components: `FlatList`, `RefreshControl`, `ActivityIndicator`.
- Icons: `MaterialIcons`.
- Custom classes from `global.css`: `badge`, `badge-success`, `badge-error`, `badge-soft`, `input-search`.

## Error Handling
- **Pull-to-Refresh:** Users can manually refetch data.
- **Empty State:** Friendly message when no payments match filters.
- **Loading State:** Centered `ActivityIndicator`.

## Navigation Flow
- Route: `/(authenticated)/payments/index`.
- **Tap Card:** Navigate to `/(authenticated)/payments/[id]`.
- **Back Button:** Navigate to Profile or Home.

## Functions Involved
- **`formatPaymentStatus`** — Formats status for display.
- **`getPaymentStatusVariant`** — Maps status to color classes.
- **`formatCurrency`** — Formats amount with currency symbol.

## Implementation Details
- **FlatList Optimization:** Uses `keyExtractor` and `renderItem`.
- **Chip Toggles:** Visual feedback for active filters.
- **Infinite Scroll:** (Optional) Load more pages on scroll end.

## Future Enhancements
- Export payment history to PDF.
- Date range filtering.
- Visual charts for spending history.
