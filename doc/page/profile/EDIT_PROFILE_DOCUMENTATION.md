# Edit Profile Screen Documentation

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
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Link, useRouter } from 'expo-router';
import {
  Image,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  Platform,
  ActivityIndicator,
  Alert,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';

import { useAuth } from '../../../contexts/AuthContext';
import { useUpdateProfile, useGetProfile } from '@/tanstack/useUsers';
```

## Context and State Management
- **TanStack Query:**
  - `useGetProfile()` fetches the latest profile data.
  - `useUpdateProfile()` submits profile changes.
- **Local form state:** `firstName`, `lastName`, `phone`.
- **Avatar helpers:** `avatarFile` (type `ImagePicker.ImagePickerAsset`), `avatarRemoved`, `avatarPreview` (string URL for display).
- **Query Client:** `useQueryClient()` for cache invalidation after updates.

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

**`useUpdateProfile` hook (from `tanstack/useUsers.ts`):**
```tsx
export const useUpdateProfile = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (profileData: UpdateProfilePayload | FormData) => {
      try {
        const response = await userAPI.updateProfile(profileData);
        return response.data.data;
      } catch (error: any) {
        const errorMessage = error.response?.data?.message || error.message || 'Failed to update profile.';
        throw new Error(errorMessage);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user', 'profile'] });
      Toast.show({
        type: 'success',
        text1: 'Success!',
        text2: 'Profile updated successfully',
        position: 'top',
      });
    },
    onError: (error: any) => {
      console.error('Update profile error:', error);
    },
  });
};
```

**Local state variables:**
- `form` - Object with `{ firstName: string, lastName: string, phone: string }`
- `avatarPreview` - String URL for preview display or null
- `avatarFile` - `ImagePicker.ImagePickerAsset | null` for file upload
- `avatarRemoved` - Boolean flag indicating avatar should be removed
- `inlineMessage` - `{ type: 'success' | 'error', text: string } | null` for user feedback

## UI Structure
- **Header:** avatar preview + title and guidance text.
- **Avatar controls:** upload button + remove action.
- **Form grid:** first name, last name, email (read-only), phone.
- **Actions:** cancel + save changes; inline success/error messaging.

## Planned Layout
```
┌────────────────────────────────────────────┐
│ Avatar preview     [Upload] [Remove]       │
├────────────────────────────────────────────┤
│ First Name   Last Name                     │
│ Email (read-only)   Phone                  │
├────────────────────────────────────────────┤
│ Inline success / error                     │
│ [Cancel]  [Save changes]                   │
└────────────────────────────────────────────┘
```

## Sketch Wireframe
```
┌────────────────────────────────────────────────────┐
│ (Avatar)  Edit profile                             │
│          Keep your contact info updated            │
│                                                    │
│ First Name  [__________]  Last Name [__________]   │
│ Email (disabled) [____________________________]    │
│ Phone [____________________________]               │
│                                                    │
│ [Cancel]  [Save changes]                           │
└────────────────────────────────────────────────────┘
```

## Form Inputs
- **First and last name**
  ```tsx
  <TextInput
    value={form.firstName}
    onChangeText={(value) => handleInputChange('firstName', value)}
    autoCapitalize="words"
    placeholder="Enter your first name"
    className="input"
  />
  ```

- **Email (disabled)**
  ```tsx
  <TextInput value={user?.email || ''} editable={false} className="input-disabled" />
  ```

- **Avatar upload**
  ```tsx
  <TouchableOpacity onPress={pickImage} className="btn-secondary">
    <Text>Upload Avatar</Text>
  </TouchableOpacity>
  ```
  *Note: Uses `expo-image-picker` to select images from the device's library.*

## API Integration
- **HTTP client:** `axios` instance from `api/config.ts` via `userAPI.updateProfile`.
- **Endpoint:** `PUT /api/users/profile`.
- **Headers:** Automatically includes `Authorization: Bearer <token>` from token store. For FormData uploads, sets `Content-Type: multipart/form-data`.
- **Payload options:**
  - **JSON body** for text-only updates:
    ```json
    {
      "firstName": "Jane",
      "lastName": "Doe",
      "phone": "+254700000000",
      "avatar": null  // if removing avatar
    }
    ```
  - **FormData** for avatar uploads. For React Native, `FormData` needs to be constructed with `blob` for images:
    ```tsx
    const formData = new FormData();
    formData.append('firstName', form.firstName);
    formData.append('lastName', form.lastName);
    formData.append('phone', form.phone || '');
    const response = await fetch(avatarFile.uri);
    const blob = await response.blob();
    formData.append('avatar', blob, avatarFile.fileName || 'avatar.jpg');
    ```
- **Hook:** `useUpdateProfile()` handles the mutation and returns updated user data.
- **Response contract:** `response.data.data` contains the updated user object.
- **Response structure:**
  ```json
  {
    "success": true,
    "message": "Profile updated successfully",
    "data": {
      "user": {
        "_id": "...",
        "firstName": "Jane",
        "lastName": "Doe",
        "email": "jane@example.com",
        "phone": "+254700000000",
        "avatar": "https://...",
        "updatedAt": "2026-02-01T00:00:00.000Z"
      }
    }
  }
  ```
- **Cache invalidation:** After successful update, `queryClient.invalidateQueries({ queryKey: ['profile'] })` is called to refetch latest data.

## Components Used
- React Native components: `View`, `Text`, `TextInput`, `TouchableOpacity`, `Image`, `ActivityIndicator`, `Alert`.
- Expo Router: `Link`, `useRouter`.
- Expo Vector Icons: `MaterialIcons`.
- `expo-image-picker`.
- Tailwind CSS utilities: `input`, `input-disabled`, `btn-primary`, `btn-secondary`, `btn-ghost`.

## Error Handling
- Local validation for required fields.
- API errors surface via `err.message` fallback.
- Inline feedback beneath the form.

## Navigation Flow
- Route: `/authenticated/profile/edit`.
- `Cancel` ➞ `router.replace('/(authenticated)/profile')`.
- On successful update, navigate back to `router.replace('/(authenticated)/profile')`.

## Functions Involved

- **`handleInputChange`** — Updates form state when TextInput values change and clears inline messages.
  ```tsx
  const handleInputChange = useCallback((name: keyof typeof form, value: string) => {
    setForm((prev) => ({ ...prev, [name]: value }));
    setInlineMessage(null); // Clear messages on input change.
  }, []);
  ```

- **`pickImage`** — Handles image selection using `expo-image-picker`, requests permissions, and creates preview URL.
  ```tsx
  const pickImage = useCallback(async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission required', 'Please grant media library permissions to upload an avatar.');
      return;
    }

    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1,
    });

    if (!result.canceled) {
      const selectedAsset = result.assets[0];
      setAvatarPreview(selectedAsset.uri); // Updates the Image preview.
      setAvatarFile(selectedAsset); // Stores the selected file for submission.
      setAvatarRemoved(false);
    }
  }, []);
  ```

- **`handleRemoveAvatar`** — Clears avatar preview and marks avatar for removal from server.
  ```tsx
  const handleRemoveAvatar = useCallback(() => {
    setAvatarPreview(null);
    setAvatarFile(null);
    setAvatarRemoved(true); // Flag to indicate avatar should be removed on save.
  }, []);
  ```

- **`canSubmit` (memoized)** — Determines if form can be submitted based on changes and pending state.
  ```tsx
  const canSubmit = useMemo(() => {
    // Check if form data has changed from initial user data.
    const formChanged =
      form.firstName !== (user?.firstName || '') ||
      form.lastName !== (user?.lastName || '') ||
      form.phone !== (user?.phone || '');

    // Check if avatar state has changed (newly selected or marked for removal).
    const avatarChanged =
      (avatarFile !== null && !avatarRemoved) || // New avatar selected
      (avatarRemoved && user?.avatar !== null); // Existing avatar marked for removal.

    return (formChanged || avatarChanged) && !updateProfileMutation.isPending;
  }, [form, user, avatarFile, avatarRemoved, updateProfileMutation.isPending]);
  ```

- **`handleSubmit`** — Builds JSON or `FormData` payload and submits profile update.
  ```tsx
  const handleSubmit = useCallback(async () => {
    setInlineMessage(null);

    const payload: any = {
      firstName: form.firstName,
      lastName: form.lastName,
      phone: form.phone || null,
    };

    if (avatarRemoved) {
      payload.avatar = null; // Explicitly set avatar to null if removed.
    }

    try {
      if (avatarFile) {
        // If a new avatar file is selected, construct FormData for submission.
        const formData = new FormData();
        formData.append('firstName', form.firstName);
        formData.append('lastName', form.lastName);
        formData.append('phone', form.phone || '');

        // Append image as a blob for React Native FormData.
        const response = await fetch(avatarFile.uri);
        const blob = await response.blob();
        formData.append('avatar', blob, avatarFile.fileName || 'avatar.jpg');
        await updateProfileMutation.mutateAsync(formData);
      } else {
        await updateProfileMutation.mutateAsync(payload);
      }

      setInlineMessage({ type: 'success', text: 'Profile updated successfully!' });
      queryClient.invalidateQueries({ queryKey: ['profile'] });
      router.replace('/(authenticated)/profile');
    } catch (err: any) {
      setInlineMessage({ type: 'error', text: err.message || 'Failed to update profile.' });
    }
  }, [form, avatarFile, avatarRemoved, updateProfileMutation, router, queryClient]);
  ```

- **`useEffect` for form sync** — Synchronizes form state and avatar preview with fetched user profile data.
  ```tsx
  useEffect(() => {
    if (user) {
      setForm({
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        phone: user.phone || '',
      });
      setAvatarPreview(user.avatar || null);
    }
  }, [user]);
  ```

## Future Enhancements
- Add image cropping + size validation.
- Add phone formatting/validation.
- Support avatar removal confirmations.

