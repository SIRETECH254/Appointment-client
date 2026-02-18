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
  ScrollView
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useQueryClient } from '@tanstack/react-query'; // Import useQueryClient
import { useAuth } from '../../contexts/AuthContext';
import { useUpdateProfile, useGetProfile } from '@/tanstack/useUsers';

type InlineMessage = {
  type: 'success' | 'error';
  text: string;
};

export default function EditProfileScreen() {
  const router = useRouter();
  // useQueryClient to access and invalidate TanStack Query caches.
  const queryClient = useQueryClient();
  // useGetProfile fetches the user's profile data, along with loading and error states.
  const { data: profile, isLoading: isProfileLoading, error: profileError } = useGetProfile();
  // useUpdateProfile handles the mutation for updating profile data.
  const updateProfileMutation = useUpdateProfile();

  // The 'user' variable holds the profile data fetched by useGetProfile().
  const user = profile;

  // States for form inputs (firstName, lastName, phone), avatar preview, avatar file, and removal status.
  const [form, setForm] = useState({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    phone: user?.phone || '',
  });
  const [avatarPreview, setAvatarPreview] = useState<string | null>(user?.avatar || null);
  const [avatarFile, setAvatarFile] = useState<ImagePicker.ImagePickerAsset | null>(null);
  const [avatarRemoved, setAvatarRemoved] = useState(false);
  // State for displaying inline success/error messages.
  const [inlineMessage, setInlineMessage] = useState<InlineMessage | null>(null);

  // useEffect: Synchronizes form state and avatar preview with fetched user profile data.
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

  // handleInputChange: Updates form state when TextInput components' values change.
  const handleInputChange = useCallback((name: keyof typeof form, value: string) => {
    setForm((prev) => ({ ...prev, [name]: value }));
    setInlineMessage(null); // Clear messages on input change.
  }, []);

  // pickImage: Handles opening the image library and setting the selected avatar.
  // Called when 'Upload Avatar' TouchableOpacity is pressed.
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

  // handleRemoveAvatar: Clears the avatar preview and marks avatar for removal from server.
  // Called when 'Remove' TouchableOpacity is pressed.
  const handleRemoveAvatar = useCallback(() => {
    setAvatarPreview(null);
    setAvatarFile(null);
    setAvatarRemoved(true); // Flag to indicate avatar should be removed on save.
  }, []);

  // canSubmit: Memoized value indicating if the form can be submitted.
  // This controls the 'disabled' prop of the 'Save changes' TouchableOpacity.
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

  // handleSubmit: Called when the 'Save changes' TouchableOpacity is pressed.
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
        await updateProfileMutation.mutateAsync(formData); // Calls useUpdateProfile mutation.
      } else {
        await updateProfileMutation.mutateAsync(payload); // Calls useUpdateProfile mutation.
      }

      setInlineMessage({ type: 'success', text: 'Profile updated successfully!' });
      queryClient.invalidateQueries({ queryKey: ['profile'] }); // Invalidates the 'profile' query to refetch latest data.
      router.replace('/(authenticated)/(tabs)/profile'); // Navigates back to the profile page.
    } catch (err: any) {
      setInlineMessage({ type: 'error', text: err.message || 'Failed to update profile.' }); // Displays specific API error or generic fallback.
    }
  }, [form, avatarFile, avatarRemoved, updateProfileMutation, router, queryClient]);

  // bannerMessage: Determines which error/success message to display.
  const bannerMessage = inlineMessage || (updateProfileMutation.error ? { type: 'error', text: updateProfileMutation.error?.response?.data?.message || updateProfileMutation.error.message || 'Failed to update profile.' } : null);

  // Conditional rendering for loading profile data.
  if (isProfileLoading) {
    return (
      <View className="flex-1 items-center justify-center bg-white">
        <ActivityIndicator size="large" color="#D4AF37" />
        <Text className="mt-2 text-gray-500">Loading profile...</Text>
      </View>
    );
  }

  // Conditional rendering for error loading profile data.
  if (profileError) {
    return (
      <View className="flex-1 items-center justify-center bg-white">
        <Text className="text-red-500">Error: {profileError.message}</Text>
        {/* Navigates back to the profile display page. */}
        <Link href="/(authenticated)/(tabs)/profile" asChild>
          <TouchableOpacity className="mt-4 btn-primary">
            <Text className="text-white">Go Back</Text>
          </TouchableOpacity>
        </Link>
      </View>
    );
  }

  // Conditional rendering if no user data is available after loading.
  if (!user) {
    return (
      <View className="flex-1 items-center justify-center bg-white">
        <Text className="text-gray-500 text-center">No profile data available to edit.</Text>
        {/* Navigates back to the profile display page. */}
        <Link href="/(authenticated)/(tabs)/profile" asChild>
          <TouchableOpacity className="mt-4 btn-primary">
            <Text className="text-white">Go Back</Text>
          </TouchableOpacity>
        </Link>
      </View>
    );
  }

  return (
    <ScrollView className="flex-1 bg-white">
      {/* Main container for the edit profile screen, uses page-container utility. */}
      <View className="page-container flex-1 py-6">
        <View className="mb-8">
          <Text className="font-inter text-3xl font-bold text-slate-900">Edit Profile</Text>
          <Text className="mt-2 text-sm text-slate-600">
            Keep your contact info updated.
          </Text>
        </View>

        {/* Avatar display and controls. */}
        <View className="mb-8 items-center">
          {avatarPreview ? (
            <Image source={{ uri: avatarPreview }} className="h-24 w-24 rounded-full object-cover" />
          ) : (
            // Fallback icon if no avatar is present.
            <View className="h-24 w-24 items-center justify-center rounded-full bg-gray-300">
              <MaterialIcons name="person" size={48} color="#FFF" />
            </View>
          )}
          <View className="mt-4 flex-row gap-3">
            <TouchableOpacity onPress={pickImage} className="btn-secondary">
              <Text>Upload Avatar</Text>
            </TouchableOpacity>
            {avatarPreview && (
              <TouchableOpacity onPress={handleRemoveAvatar} className="btn-ghost">
                <Text className="text-red-500">Remove</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Form for editing user details. */}
        <View className="auth-form w-full">
          {/* First Name input field. */}
          <View className="auth-field">
            <Text className="label">First Name</Text>
            <TextInput
              value={form.firstName}
              onChangeText={(value) => handleInputChange('firstName', value)} // Calls handleInputChange on text change.
              autoCapitalize="words"
              placeholder="Enter your first name"
              className="input"
            />
          </View>

          {/* Last Name input field. */}
          <View className="auth-field">
            <Text className="label">Last Name</Text>
            <TextInput
              value={form.lastName}
              onChangeText={(value) => handleInputChange('lastName', value)} // Calls handleInputChange on text change.
              autoCapitalize="words"
              placeholder="Enter your last name"
              className="input"
            />
          </View>

          {/* Email input field (read-only). */}
          <View className="auth-field">
            <Text className="label">Email</Text>
            <TextInput
              value={user?.email || ''}
              editable={false}
              className="input-disabled"
            />
          </View>

          {/* Phone input field. */}
          <View className="auth-field">
            <Text className="label">Phone</Text>
            <TextInput
              value={form.phone}
              onChangeText={(value) => handleInputChange('phone', value)} // Calls handleInputChange on text change.
              keyboardType="phone-pad"
              autoComplete="tel"
              placeholder="Enter your phone number"
              className="input"
            />
          </View>

          {/* Error/success banner displays bannerMessage if present. */}
          {bannerMessage ? (
            <Text className={
              bannerMessage.type === 'success'
                ? 'auth-inline-message-success'
                : 'auth-inline-message-error'
            }>
              {bannerMessage.text}
            </Text>
          ) : null}

          {/* Action buttons: Cancel and Save changes. */}
          <View className="flex-row justify-end gap-3 mt-6">
            {/* Navigates back to the profile page without saving changes. */}
            <Link href="/(authenticated)/(tabs)/profile" asChild>
              <TouchableOpacity className="btn-ghost">
                <Text>Cancel</Text>
              </TouchableOpacity>
            </Link>
            {/* Calls handleSubmit when pressed. */}
            <TouchableOpacity
              onPress={handleSubmit}
              disabled={!canSubmit} // Disabled state controlled by canSubmit.
              className={`btn-primary ${!canSubmit ? 'opacity-50' : ''}`}
            >
              <Text className="text-white">
                {updateProfileMutation.isPending ? 'Saving...' : 'Save changes'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </ScrollView>
  );
}