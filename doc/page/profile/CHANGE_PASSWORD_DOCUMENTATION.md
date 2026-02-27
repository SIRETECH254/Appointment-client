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
- **Query Client:** `useQueryClient()` for cache invalidation after password change.
- **Local form state:** `currentPassword`, `newPassword`, `confirmPassword`.
- **UI state:** password visibility toggles (`isCurrentVisible`, `isNewVisible`, `isConfirmVisible`) and inline feedback.

**`useChangePassword` hook (from `tanstack/useUsers.ts`):**
```tsx
export const useChangePassword = () => {
  return useMutation({
    mutationFn: async (passwordData: ChangePasswordPayload) => {
      const response = await userAPI.changePassword(passwordData);
      return response.data.data;
    },
    onSuccess: () => {
      Toast.show({
        type: 'success',
        text1: 'Success!',
        text2: 'Password changed successfully',
        position: 'top',
      });
      console.log('Password changed successfully');
    },
    onError: (error: any) => {
      console.error('Change password error:', error);
      const errorMessage = error.response?.data?.message || 'Failed to change password';
      console.error('Error:', errorMessage);
    },
  });
};
```

**Local state variables:**
- `form` - Object with `{ currentPassword: string, newPassword: string, confirmPassword: string }`
- `isCurrentVisible` - Boolean for current password visibility toggle
- `isNewVisible` - Boolean for new password visibility toggle
- `isConfirmVisible` - Boolean for confirm password visibility toggle
- `inlineMessage` - `{ type: 'success' | 'error', text: string } | null` for user feedback

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
- **HTTP client:** `axios` instance from `api/config.ts` via `userAPI.changePassword`.
- **Endpoint:** `PUT /api/users/change-password`.
- **Headers:** Automatically includes `Authorization: Bearer <token>` from token store.
- **Payload:**
  ```json
  {
    "currentPassword": "oldPassword123",
    "newPassword": "newPassword456"
  }
  ```
- **Hook:** `useChangePassword()` mutation.
- **Response contract:** `response.data.data` contains success confirmation.
- **Response structure:**
  ```json
  {
    "success": true,
    "message": "Password changed successfully",
    "data": {}
  }
  ```
- **Error responses:** API returns error message in `response.data.message`; fallback to generic message.
- **Cache invalidation:** After successful password change, `queryClient.invalidateQueries({ queryKey: ['profile'] })` is called.

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

- **`handleInputChange`** — Updates form state when TextInput values change and clears inline messages.
  ```tsx
  const handleInputChange = useCallback((name: keyof typeof form, value: string) => {
    setForm((prev) => ({ ...prev, [name]: value }));
    setInlineMessage(null); // Clear messages on input change.
  }, []);
  ```

- **`canSubmit` (memoized)** — Determines if form can be submitted based on validation rules.
  ```tsx
  const canSubmit = useMemo(() => {
    return (
      form.currentPassword.length > 0 &&
      form.newPassword.length > 0 &&
      form.confirmPassword.length > 0 &&
      form.newPassword === form.confirmPassword &&
      !changePasswordMutation.isPending
    );
  }, [form, changePasswordMutation.isPending]);
  ```

- **`handleSubmit`** — Validates password match and triggers mutation.
  ```tsx
  const handleSubmit = useCallback(async () => {
    setInlineMessage(null);

    if (form.newPassword !== form.confirmPassword) {
      setInlineMessage({ type: 'error', text: 'New passwords do not match.' });
      return;
    }

    try {
      // Calls the useChangePassword mutation to update the password.
      await changePasswordMutation.mutateAsync({
        currentPassword: form.currentPassword,
        newPassword: form.newPassword,
      });
      setInlineMessage({ type: 'success', text: 'Password changed successfully!' });
      setForm({ currentPassword: '', newPassword: '', confirmPassword: '' }); // Clear form on success.
      queryClient.invalidateQueries({ queryKey: ['profile'] }); // Invalidate 'profile' query to ensure up-to-date data if needed.
    } catch (err: any) {
      setInlineMessage({ type: 'error', text: err.message || 'Failed to change password.' });
    }
  }, [form, changePasswordMutation, queryClient]);
  ```

## Future Enhancements
- Add password strength meter.
- Require minimum length/complexity on the client.
- Offer sign-out of other sessions after change.

