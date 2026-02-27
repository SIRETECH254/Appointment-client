# Profile Screen Documentation

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
import { useMemo } from 'react';
import { Link, useRouter } from 'expo-router';
import { Text, TouchableOpacity, View, Image, ActivityIndicator } from 'react-native';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useAuth } from '../../../contexts/AuthContext';
import { useGetProfile } from '@/tanstack/useUsers';
```

## Context and State Management
- **Auth context:** `useAuth()` supplies cached `user` for immediate UI fallback and provides `logout` function.
- **TanStack Query:** `useGetProfile()` fetches the latest profile payload.
- **Derived state:** initials, role label, and formatted timestamps are memoized from user data.

**`useGetProfile` hook (from `tanstack/useUsers.ts`):**
```tsx
export const useGetProfile = () => {
  return useQuery({
    queryKey: ['user', 'profile'],
    queryFn: async () => {
      const response = await userAPI.getProfile();
      return response.data.data.user;
    },
    staleTime: DEFAULT_STALE_TIME, // 5 minutes
    gcTime: DEFAULT_GC_TIME, // 10 minutes
  });
};
```

**`useAuth` hook (from `contexts/AuthContext.tsx`):**
```tsx
const { logout } = useAuth();
// Provides:
// - user: User | null - Cached user data from Redux
// - logout: () => Promise<void> - Logout function that clears tokens and navigates to login
```

**Local state variables:**
- `profile` - User profile data from `useGetProfile().data`
- `isLoading` - Loading state from `useGetProfile().isLoading`
- `error` - Error state from `useGetProfile().error`
- `user` - Alias for `profile` data
- `initials` - Memoized user initials calculated from `firstName` and `lastName`

## UI Structure
- **Header block:** avatar (image or initials), name, email, role pill, status.
- **Details card:** phone, email, created and updated timestamps.
- **Primary CTAs:** `Edit Profile` and `Change Password` buttons.

## Planned Layout
```
┌────────────────────────────────────────────┐
│ Avatar + Name + Role/Status                │
│ Email                                      │
├────────────────────────────────────────────┤
│ Phone / Email / Created / Updated          │
├────────────────────────────────────────────┤
│ [Edit Profile]  [Change Password]          │
└────────────────────────────────────────────┘
```

## Sketch Wireframe
```
┌────────────────────────────────────────────────────┐
│ (Avatar)  Jane Doe          [Admin] [Active]       │
│          jane@company.com                          │
│                                                    │
│ Phone: +254700000000     Created: Jan 01, 2025     │
│ Updated: Feb 01, 2026                              │
│                                                    │
│ [Edit Profile]  [Change Password]                  │
└────────────────────────────────────────────────────┘
```

## Form Inputs

- **Edit Profile Button** — Navigates to profile edit screen.
  ```tsx
  <Link href="/(authenticated)/profile/edit" asChild>
    <TouchableOpacity className="btn-primary">
      <Text className="text-white">Edit Profile</Text>
    </TouchableOpacity>
  </Link>
  ```

- **Change Password Button** — Navigates to change password screen.
  ```tsx
  <Link href="/(authenticated)/profile/change-password" asChild>
    <TouchableOpacity className="btn-secondary">
      <Text className="text-gray-700">Change Password</Text>
    </TouchableOpacity>
  </Link>
  ```

- **Logout Button** — Triggers logout process.
  ```tsx
  <TouchableOpacity className="btn bg-brand-accent" onPress={handleLogout}>
    <Text className="font-inter text-base font-semibold text-white">Logout</Text>
  </TouchableOpacity>
  ```

- **Avatar Display** — Shows user avatar or initials fallback.
  ```tsx
  <View className="relative">
    {user.avatar ? (
      <Image 
        source={{ uri: user.avatar }} 
        className="h-28 w-28 rounded-full object-cover border-4 border-brand-primary" 
      />
    ) : (
      <View className="h-28 w-28 items-center justify-center rounded-full bg-brand-primary border-4 border-brand-accent shadow-lg">
        <Text className="font-inter text-4xl font-bold text-white">{initials}</Text>
      </View>
    )}
    {/* Status indicator ring */}
    {user.isActive && (
      <View className="absolute bottom-0 right-0 h-6 w-6 rounded-full bg-green-500 border-2 border-white" />
    )}
  </View>
  ```

- **Status Badges** — Role, Verified, and Active status badges with icons.
  ```tsx
  {/* Role Badge */}
  {user.primaryRole?.displayName && (
    <View className="rounded-full px-3 py-1.5 flex-row items-center gap-1.5 bg-brand-soft">
      <MaterialIcons name="badge" size={14} color="#C5A028" />
      <Text className="text-xs font-semibold text-brand-accent uppercase">
        {user.primaryRole.displayName}
      </Text>
    </View>
  )}

  {/* Verified Badge */}
  {(user as any).isVerified !== undefined && (
    <View className={`rounded-full px-3 py-1.5 flex-row items-center gap-1.5 ${(user as any).isVerified ? 'bg-green-100' : 'bg-gray-100'}`}>
      <MaterialIcons 
        name={(user as any).isVerified ? 'verified' : 'verified-user'} 
        size={14} 
        color={(user as any).isVerified ? '#15803D' : '#6B7280'} 
      />
      <Text className={`text-xs font-semibold uppercase ${(user as any).isVerified ? 'text-green-700' : 'text-gray-700'}`}>
        {(user as any).isVerified ? 'Verified' : 'Unverified'}
      </Text>
    </View>
  )}

  {/* Active Badge */}
  <View className={`rounded-full px-3 py-1.5 flex-row items-center gap-1.5 ${user.isActive ? 'bg-green-100' : 'bg-red-100'}`}>
    <MaterialIcons 
      name={user.isActive ? 'check-circle' : 'cancel'} 
      size={14} 
      color={user.isActive ? '#15803D' : '#B91C1C'} 
    />
    <Text className={`text-xs font-semibold uppercase ${user.isActive ? 'text-green-700' : 'text-red-700'}`}>
      {user.isActive ? 'Active' : 'Inactive'}
    </Text>
  </View>
  ```

- **Details Card Fields** — Phone, Email, Created, and Updated with icons.
  ```tsx
  <View className="mb-6 rounded-xl border-2 border-brand-accent/20 bg-white p-5 shadow-md">
    <View className="flex-row items-center mb-4 pb-3 border-b border-brand-soft/30">
      <View className="h-8 w-8 rounded-full bg-brand-soft/20 items-center justify-center mr-3">
        <MaterialIcons name="phone" size={16} color="#C5A028" />
      </View>
      <View className="flex-1">
        <Text className="font-inter text-xs font-semibold text-slate-500 uppercase tracking-wide">Phone</Text>
        <Text className="font-inter text-base text-slate-900 mt-0.5">{user.phone || 'N/A'}</Text>
      </View>
    </View>
    {/* Similar structure for Email, Created, Updated */}
  </View>
  ```

## API Integration
- **HTTP client:** `axios` instance from `api/config.ts` via `userAPI.getProfile`.
- **Endpoint:** `GET /api/users/profile`.
- **Headers:** Automatically includes `Authorization: Bearer <token>` from token store.
- **Hook:** `useGetProfile()` returns `{ data, isLoading, error }` for the profile view.
- **Response contract:** `response.data.data.user` contains the user profile object.
- **Response structure:**
  ```json
  {
    "success": true,
    "data": {
      "user": {
        "_id": "...",
        "firstName": "Jane",
        "lastName": "Doe",
        "email": "jane@example.com",
        "phone": "+254700000000",
        "avatar": "https://...",
        "role": "customer",
        "isActive": true,
        "primaryRole": {
          "displayName": "Customer"
        },
        "createdAt": "2025-01-01T00:00:00.000Z",
        "updatedAt": "2026-02-01T00:00:00.000Z"
      }
    }
  }
  ```
- **Cache invalidation:** Profile query is invalidated after profile update mutations.
- **Fallback:** If query is loading, `useAuth().user` can be used as a temporary source (not currently implemented in this screen).

## Components Used
- **React Native components:**
  - `View` - Container components for layout
  - `Text` - Text display with Tailwind styling
  - `TouchableOpacity` - Interactive buttons and links
  - `Image` - User avatar display with `source={{ uri: user.avatar }}`
  - `ActivityIndicator` - Loading spinner with brand color `#D4AF37`

- **Expo Router:**
  - `Link` - Navigation links with `href` prop and `asChild` for custom styling
  - `useRouter` - Programmatic navigation via `router.replace('/')`

- **Icons:**
  - `MaterialIcons` from `@expo/vector-icons/MaterialIcons` - Badge icons (badge, verified, check-circle, cancel, phone, email, calendar-today, update)

- **Tailwind CSS utility classes:**
  - `btn-primary` - Primary button styling (gold background, white text)
  - `btn-secondary` - Secondary button styling (outline style)
  - `bg-brand-accent` - Brand accent color background
  - `bg-brand-soft` - Brand soft color background
  - `border-brand-primary` - Brand primary border color
  - `border-brand-accent` - Brand accent border color

## Error Handling
- **Loading state:** Shows `ActivityIndicator` with brand color and "Loading profile..." message while `isLoading` is true.
- **Error state:** Displays error message from `error.message` in red text with a "Go Home" button that navigates to home page.
- **Empty state:** Shows "No profile data available." message with "Go Home" button when `user` is null after loading completes.
- **Query error handling:** TanStack Query automatically handles retries and error states. Errors are surfaced via the `error` object from `useGetProfile()`.
- **Network failures:** If the API request fails, the error is caught and displayed to the user with navigation option to return home.

## Navigation Flow
- Route: `/(authenticated)/profile`.
- `Edit Profile` ➞ `router.push('/(authenticated)/profile/edit')`.
- `Change Password` ➞ `router.push('/(authenticated)/profile/change-password')`.

## Functions Involved

- **`formatDateTime`** — Normalizes timestamps for display with fallback handling.
  ```tsx
  const formatDateTime = (value?: string) => {
    if (!value) return '—';
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return '—';
    return new Intl.DateTimeFormat('en-US', {
      dateStyle: 'medium',
      timeStyle: 'short',
    }).format(date);
  };
  ```

- **`initials` (memoized)** — Calculates user initials from first and last name.
  ```tsx
  const initials = useMemo(() => {
    if (!user?.firstName && !user?.lastName) return 'U';
    return `${user.firstName?.[0] || ''}${user.lastName?.[0] || ''}`.toUpperCase();
  }, [user]);
  ```

- **`handleLogout`** — Asynchronous function that triggers logout process.
  ```tsx
  const handleLogout = async () => {
    await logout();
    // AuthContext's logout function handles:
    // - Clearing tokens from SecureStore
    // - Clearing user data from AsyncStorage
    // - Dispatching logout action to Redux
    // - Navigation to login screen automatically
  };
  ```

## Future Enhancements
- Add a dedicated profile activity panel.
- Show multiple roles with a pill list.
- Display last login and last password change metadata.

