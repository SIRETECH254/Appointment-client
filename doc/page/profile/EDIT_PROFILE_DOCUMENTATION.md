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
- **Auth context:** `useAuth().user` provides initial values before the query resolves.
- **TanStack Query:**
  - `useGetProfile()` fetches the latest profile data.
  - `useUpdateProfile()` submits profile changes.
- **Local form state:** `firstName`, `lastName`, `phone`.
- **Avatar helpers:** `avatarFile` (type `ImagePicker.ImagePickerAsset`), `avatarRemoved`, `avatarPreview` (string URL for display).

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
- **Endpoint:** `PUT /api/users/profile`.
- **Payload options:**
  - JSON body for text-only updates.
  - `FormData` for avatar uploads. For React Native, `FormData` needs to be constructed with `blob` for images.
- **Hook:** `useUpdateProfile()` handles the mutation and returns updated user data.

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
- Route: `/authenticated/edit-profile`.
- `Cancel` ➞ `router.replace('/(authenticated)/(tabs)/profile')`.
- On successful update, navigate back to `router.replace('/(authenticated)/(tabs)/profile')`.

## Functions Involved
- **`pickImage`** — handles image selection using `expo-image-picker` and creates preview URL.
  ```tsx
  const pickImage = useCallback(async () => {
    // Request permissions and launch image library
    let result = await ImagePicker.launchImageLibraryAsync({...});
    if (!result.canceled) {
      setAvatarPreview(result.assets[0].uri);
      setAvatarFile(result.assets[0]);
      setAvatarRemoved(false);
    }
  }, []);
  ```

- **`handleRemoveAvatar`** — clears avatar preview and marks for removal.
  ```tsx
  const handleRemoveAvatar = useCallback(() => {
    setAvatarPreview(null);
    setAvatarFile(null);
    setAvatarRemoved(true);
  }, []);
  ```

- **`handleSubmit`** — builds JSON or `FormData` payload and submits.
  ```tsx
  if (avatarFile) {
    const formData = new FormData();
    // append text fields
    const response = await fetch(avatarFile.uri);
    const blob = await response.blob();
    formData.append('avatar', blob, avatarFile.fileName || 'avatar.jpg');
    await updateProfileMutation.mutateAsync(formData);
  } else {
    // submit JSON payload for text fields or avatar removal
    await updateProfileMutation.mutateAsync(payload);
  }
  ```

## Future Enhancements
- Add image cropping + size validation.
- Add phone formatting/validation.
- Support avatar removal confirmations.

