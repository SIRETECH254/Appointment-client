# Change Password Screen Documentation

## Table of Contents
- [Imports](#imports)
- [Context and State Management](#context-and-management)
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
import { useCallback, useMemo, useState } from 'react';
import { Text, TextInput, TouchableOpacity, View, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';

import { useChangePassword } from '@/tanstack/useUsers';
```

## Context and State Management
- **TanStack Query:** `useChangePassword()` mutation posts password changes.
- **Local form state:** `currentPassword`, `newPassword`, `confirmPassword`.
- **UI state:** password visibility toggles and inline feedback.

## UI Structure
- **Header:** title + helper text.
- **Form:** three password fields with visibility toggles.
- **Submit:** single CTA with disabled state while submitting.
- **Feedback:** inline success/error message below inputs.

## Planned Layout
```
┌────────────────────────────────────────────┐
│ Change password                            │
│ Update your password...                    │
├────────────────────────────────────────────┤
│ Current password [___________] (👁)        │
│ New password [_______________] (👁)        │
│ Confirm password [___________] (👁)        │
├────────────────────────────────────────────┤
│ Inline success / error                     │
│ [Update password]                          │
└────────────────────────────────────────────┘
```

## Sketch Wireframe
```
┌────────────────────────────────────────────────────┐
│ Change password                                    │
│ Update your password to keep your account secure.  │
│                                                    │
│ Current password [____________________] (👁)       │
│ New password [________________________] (👁)       │
│ Confirm password [____________________] (👁)       │
│                                                    │
│ [Update password]                                  │
└────────────────────────────────────────────────────┘
```

## Form Inputs
- **Password field**
  ```tsx
  <View className="relative">
    <TextInput
      value={form.currentPassword}
      onChangeText={(value) => handleInputChange('currentPassword', value)}
      secureTextEntry={!isCurrentVisible}
      placeholder="••••••••"
      className="input-password"
      autoComplete="current-password"
    />
    <TouchableOpacity
      onPress={() => setIsCurrentVisible((prev) => !prev)}
      className="input-toggle-icon"
      accessibilityLabel={isCurrentVisible ? 'Hide password' : 'Show password'}
    >
      <MaterialIcons
        name={isCurrentVisible ? 'visibility-off' : 'visibility'}
        size={20}
        color="#6B7280"
      />
    </TouchableOpacity>
  </View>
  ```

## API Integration
- **Endpoint:** `PUT /api/users/change-password`.
- **Payload:** `{ currentPassword: string; newPassword: string }`.
- **Hook:** `useChangePassword()` mutation.

## Components Used
- `@expo/vector-icons/MaterialIcons` for visibility toggles.
- Tailwind CSS utilities: `input-password`, `auth-button`.
- React Native components: `TextInput`, `TouchableOpacity`, `View`, `Text`.

## Error Handling
- Validate required fields and password confirmation match.
- API errors use `err.message` fallback.
- Inline banner displays `success` or `error` state.

## Navigation Flow
- Route: `/authenticated/profile/change-password`.
- On success, the screen remains and clears the form.
- Uses `useRouter` from `expo-router` for navigation if needed, though this screen clears the form rather than navigating away on success.

## Functions Involved
- **`handleSubmit`** — validates and triggers mutation.
  ```tsx
  await changePasswordMutation.mutateAsync({
    currentPassword: form.currentPassword,
    newPassword: form.newPassword,
  });
  ```

## Future Enhancements
- Add password strength meter.
- Require minimum length/complexity on the client.
- Offer sign-out of other sessions after change.

