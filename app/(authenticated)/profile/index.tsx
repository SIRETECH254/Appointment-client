import { useMemo } from 'react';
import { Link, useRouter } from 'expo-router';
import { Text, TouchableOpacity, View, Image, ActivityIndicator } from 'react-native';
import { useAuth } from '../../../contexts/AuthContext';
import { useGetProfile } from '@/tanstack/useUsers';

/**
 * Helper function to format date and time strings for display.
 * Used for `createdAt` and `updatedAt` fields.
 * @param value The date string to format.
 * @returns Formatted date and time, or '—' if invalid.
 */
const formatDateTime = (value?: string) => {
  if (!value) return '—';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '—';
  return new Intl.DateTimeFormat('en-US', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(date);
};

export default function ProfileScreen() {
  const router = useRouter();
  // useAuth provides the logout function.
  const { logout } = useAuth();
  // useGetProfile fetches the user's profile data, along with loading and error states.
  const { data: profile, isLoading, error } = useGetProfile();

  // The 'user' variable now solely holds the profile data fetched by useGetProfile().
  const user = profile;

  // Memoized calculation for user initials, displayed in the avatar fallback.
  const initials = useMemo(() => {
    if (!user?.firstName && !user?.lastName) return 'U';
    return `${user.firstName?.[0] || ''}${user.lastName?.[0] || ''}`.toUpperCase();
  }, [user]);

  // console.log('user', user); // Debugging line, can be removed in production.

  /**
   * handleLogout: Asynchronous function called when the 'Logout' button is pressed.
   * It triggers the logout process from the AuthContext.
   */
  const handleLogout = async () => {
    await logout();
    // AuthContext's logout function handles navigation to the login screen automatically.
  };

  // Conditional rendering based on loading, error, or no user data states.
  if (isLoading) {
    return (
      <View className="flex-1 items-center justify-center bg-white p-6">
        <ActivityIndicator size="large" color="#D4AF37" />
        <Text className="mt-2 text-gray-500">Loading profile...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View className="flex-1 items-center justify-center bg-white p-6">
        <Text className="text-red-500 text-center">Error loading profile: {error.message}</Text>
        {/* Navigates to the home page if there's an error fetching profile. */}
        <TouchableOpacity onPress={() => router.replace('/')} className="mt-4 btn-primary">
          <Text className="text-white">Go Home</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (!user) {
    return (
      <View className="flex-1 items-center justify-center bg-white p-6">
        <Text className="text-gray-500 text-center">No profile data available.</Text>
        {/* Navigates to the home page if no user data is found after loading. */}
        <TouchableOpacity onPress={() => router.replace('/')} className="mt-4 btn-primary">
          <Text className="text-white">Go Home</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-white">
      <View className="flex-1 p-6">
        <View className="mb-8">
          <Text className="font-inter text-3xl font-bold text-slate-900">Profile</Text>
        </View>

        {/* Displays user profile information. */}
        <View className="mb-8">
          {/* Avatar section: displays user's profile image or initials. */}
          <View className="items-center mb-6">
            {user.avatar ? (
              <Image source={{ uri: user.avatar }} className="h-24 w-24 rounded-full object-cover" />
            ) : (
              // Fallback to initials if no avatar is available.
              <View className="h-24 w-24 items-center justify-center rounded-full bg-brand-primary">
                <Text className="font-inter text-3xl font-bold text-white">{initials}</Text>
              </View>
            )}
            <Text className="mt-4 font-inter text-2xl font-bold text-slate-900">
              {user.firstName} {user.lastName}
            </Text>
            <View className="flex-row items-center mt-2">
              <Text className="font-inter text-base text-slate-600">{user.email}</Text>
              {/* Displays user role if available. */}
              {user.primaryRole?.displayName && (
                <View className="ml-2 badge-soft">
                  <Text className="font-inter text-sm font-medium text-brand-primary">
                    {user.primaryRole.displayName}
                  </Text>
                </View>
              )}
            </View>
          </View>

          {/* Details card: displays phone, email, creation, and update timestamps. */}
          <View className="mb-6 rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
            <View className="flex-row justify-between py-2 border-b border-gray-100">
              <Text className="font-inter text-sm font-semibold text-slate-500">Phone</Text>
              <Text className="font-inter text-base text-slate-900">{user.phone || 'N/A'}</Text>
            </View>
            <View className="flex-row justify-between py-2 border-b border-gray-100">
              <Text className="font-inter text-sm font-semibold text-slate-500">Email</Text>
              <Text className="font-inter text-base text-slate-900">{user.email || 'N/A'}</Text>
            </View>
            <View className="flex-row justify-between py-2 border-b border-gray-100">
              <Text className="font-inter text-sm font-semibold text-slate-500">Created</Text>
              <Text className="font-inter text-base text-slate-900">{formatDateTime(user.createdAt)}</Text>
            </View>
            <View className="flex-row justify-between py-2">
              <Text className="font-inter text-sm font-semibold text-slate-500">Updated</Text>
              <Text className="font-inter text-base text-slate-900">{formatDateTime(user.updatedAt)}</Text>
            </View>
          </View>

          {/* Action buttons: Edit Profile, Change Password, and Logout. */}
          <View className="flex-col gap-3">
            {/* Navigates to the Edit Profile screen. */}
            <Link href="/(authenticated)/profile/edit" asChild>
              <TouchableOpacity className="btn-primary">
                <Text className="text-white">Edit Profile</Text>
              </TouchableOpacity>
            </Link>
            {/* Navigates to the Change Password screen. */}
            <Link href="/(authenticated)/profile/change-password" asChild>
              <TouchableOpacity className="btn-secondary">
                <Text className="text-gray-700">Change Password</Text>
              </TouchableOpacity>
            </Link>
            {/* Calls handleLogout when pressed. */}
            <TouchableOpacity className="btn bg-brand-accent" onPress={handleLogout}>
              <Text className="font-inter text-base font-semibold text-white">Logout</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </View>
  );
}
