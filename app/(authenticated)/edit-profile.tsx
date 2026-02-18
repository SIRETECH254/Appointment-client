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
  const queryClient = useQueryClient(); // Get queryClient instance
  const { data: profile, isLoading: isProfileLoading, error: profileError } = useGetProfile();
  const updateProfileMutation = useUpdateProfile();

  // Use profile data if loaded, no fallback to authUser
  const user = profile;

  const [form, setForm] = useState({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    phone: user?.phone || '',
  });
  const [avatarPreview, setAvatarPreview] = useState<string | null>(user?.avatar || null);
  const [avatarFile, setAvatarFile] = useState<ImagePicker.ImagePickerAsset | null>(null);
  const [avatarRemoved, setAvatarRemoved] = useState(false);
  const [inlineMessage, setInlineMessage] = useState<InlineMessage | null>(null);

  // Update form state when profile data changes
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

  const handleInputChange = useCallback((name: keyof typeof form, value: string) => {
    setForm((prev) => ({ ...prev, [name]: value }));
    setInlineMessage(null); // Clear messages on input change
  }, []);

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
      setAvatarPreview(selectedAsset.uri);
      setAvatarFile(selectedAsset);
      setAvatarRemoved(false);
    }
  }, []);

  const handleRemoveAvatar = useCallback(() => {
    setAvatarPreview(null);
    setAvatarFile(null);
    setAvatarRemoved(true);
  }, []);

  const canSubmit = useMemo(() => {
    // Check if form data has changed
    const formChanged =
      form.firstName !== (user?.firstName || '') ||
      form.lastName !== (user?.lastName || '') ||
      form.phone !== (user?.phone || '');

    // Check if avatar has changed
    const avatarChanged =
      (avatarFile !== null && !avatarRemoved) || // New avatar selected
      (avatarRemoved && user?.avatar !== null); // Existing avatar removed

    return (formChanged || avatarChanged) && !updateProfileMutation.isPending;
  }, [form, user, avatarFile, avatarRemoved, updateProfileMutation.isPending]);

  const handleSubmit = useCallback(async () => {
    setInlineMessage(null);

    const payload: any = {
      firstName: form.firstName,
      lastName: form.lastName,
      phone: form.phone || null,
    };

    if (avatarRemoved) {
      payload.avatar = null; // Explicitly set avatar to null if removed
    }

    try {
      if (avatarFile) {
        const formData = new FormData();
        formData.append('firstName', form.firstName);
        formData.append('lastName', form.lastName);
        formData.append('phone', form.phone || '');

        // Append image as a blob
        const response = await fetch(avatarFile.uri);
        const blob = await response.blob();
        formData.append('avatar', blob, avatarFile.fileName || 'avatar.jpg');
        await updateProfileMutation.mutateAsync(formData);
      } else {
        await updateProfileMutation.mutateAsync(payload);
      }

      setInlineMessage({ type: 'success', text: 'Profile updated successfully!' });
      queryClient.invalidateQueries({ queryKey: ['profile'] }); // Invalidate profile query
      router.replace('/(authenticated)/(tabs)/profile'); // Navigate back to profile
    } catch (err: any) {
      setInlineMessage({ type: 'error', text: err.message || 'Failed to update profile.' });
    }
  }, [form, avatarFile, avatarRemoved, updateProfileMutation, router, queryClient]);

  const bannerMessage = inlineMessage || (updateProfileMutation.error ? { type: 'error', text: updateProfileMutation.error?.response?.data?.message || updateProfileMutation.error.message || 'Failed to update profile.' } : null);

  if (isProfileLoading) {
    return (
      <View className="flex-1 items-center justify-center bg-white">
        <ActivityIndicator size="large" color="#D4AF37" />
        <Text className="mt-2 text-gray-500">Loading profile...</Text>
      </View>
    );
  }

  if (profileError) {
    return (
      <View className="flex-1 items-center justify-center bg-white">
        <Text className="text-red-500">Error: {profileError.message}</Text>
        <Link href="/(authenticated)/(tabs)/profile" asChild>
          <TouchableOpacity className="mt-4 btn-primary">
            <Text className="text-white">Go Back</Text>
          </TouchableOpacity>
        </Link>
      </View>
    );
  }

  if (!user) {
    return (
      <View className="flex-1 items-center justify-center bg-white">
        <Text className="text-gray-500 text-center">No profile data available to edit.</Text>
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
      <View className="page-container flex-1 py-6">
        <View className="mb-8">
          <Text className="font-inter text-3xl font-bold text-slate-900">Edit Profile</Text>
          <Text className="mt-2 text-sm text-slate-600">
            Keep your contact info updated.
          </Text>
        </View>

        <View className="mb-8 items-center">
          {avatarPreview ? (
            <Image source={{ uri: avatarPreview }} className="h-24 w-24 rounded-full object-cover" />
          ) : (
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

        <View className="auth-form w-full">
          <View className="auth-field">
            <Text className="label">First Name</Text>
            <TextInput
              value={form.firstName}
              onChangeText={(value) => handleInputChange('firstName', value)}
              autoCapitalize="words"
              placeholder="Enter your first name"
              className="input"
            />
          </View>

          <View className="auth-field">
            <Text className="label">Last Name</Text>
            <TextInput
              value={form.lastName}
              onChangeText={(value) => handleInputChange('lastName', value)}
              autoCapitalize="words"
              placeholder="Enter your last name"
              className="input"
            />
          </View>

          <View className="auth-field">
            <Text className="label">Email</Text>
            <TextInput
              value={user?.email || ''}
              editable={false}
              className="input-disabled"
            />
          </View>

          <View className="auth-field">
            <Text className="label">Phone</Text>
            <TextInput
              value={form.phone}
              onChangeText={(value) => handleInputChange('phone', value)}
              keyboardType="phone-pad"
              autoComplete="tel"
              placeholder="Enter your phone number"
              className="input"
            />
          </View>

          {bannerMessage ? (
            <Text className={
              bannerMessage.type === 'success'
                ? 'auth-inline-message-success'
                : 'auth-inline-message-error'
            }>
              {bannerMessage.text}
            </Text>
          ) : null}

          <View className="flex-row justify-end gap-3 mt-6">
            <Link href="/(authenticated)/(tabs)/profile" asChild>
              <TouchableOpacity className="btn-ghost">
                <Text>Cancel</Text>
              </TouchableOpacity>
            </Link>
            <TouchableOpacity
              onPress={handleSubmit}
              disabled={!canSubmit}
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