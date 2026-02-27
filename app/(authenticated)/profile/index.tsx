import { useMemo } from 'react';
import { Link, useRouter } from 'expo-router';
import { Text, TouchableOpacity, View, Image, ActivityIndicator } from 'react-native';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
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
          {/* Avatar section: displays user's profile image or initials with brand colors. */}
          <View className="items-center mb-6">
            <View className="relative">
              {user.avatar ? (
                <Image source={{ uri: user.avatar }} className="h-28 w-28 rounded-full object-cover border-4 border-brand-primary" />
              ) : (
                // Fallback to initials if no avatar is available.
                <View className="h-28 w-28 items-center justify-center rounded-full bg-brand-primary border-4 border-brand-accent shadow-lg">
                  <Text className="font-inter text-4xl font-bold text-white">{initials}</Text>
                </View>
              )}
              {/* Status indicator ring */}
              {user.isActive && (
                <View className="absolute bottom-0 right-0 h-6 w-6 rounded-full bg-green-500 border-2 border-white" />
              )}
            </View>
            <Text className="mt-4 font-inter text-2xl font-bold text-slate-900">
              {user.firstName} {user.lastName}
            </Text>
            <Text className="mt-1 font-inter text-base text-slate-600">{user.email}</Text>
            
            {/* Status badges row: Role, Verified, Active */}
            <View className="flex-row items-center justify-center mt-4 gap-2 flex-wrap">
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
            </View>
          </View>

          {/* Details card: displays phone, email, creation, and update timestamps with brand accent colors. */}
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
            <View className="flex-row items-center mb-4 pb-3 border-b border-brand-soft/30">
              <View className="h-8 w-8 rounded-full bg-brand-soft/20 items-center justify-center mr-3">
                <MaterialIcons name="email" size={16} color="#C5A028" />
              </View>
              <View className="flex-1">
                <Text className="font-inter text-xs font-semibold text-slate-500 uppercase tracking-wide">Email</Text>
                <Text className="font-inter text-base text-slate-900 mt-0.5">{user.email || 'N/A'}</Text>
              </View>
            </View>
            <View className="flex-row items-center mb-4 pb-3 border-b border-brand-soft/30">
              <View className="h-8 w-8 rounded-full bg-brand-soft/20 items-center justify-center mr-3">
                <MaterialIcons name="calendar-today" size={16} color="#C5A028" />
              </View>
              <View className="flex-1">
                <Text className="font-inter text-xs font-semibold text-slate-500 uppercase tracking-wide">Created</Text>
                <Text className="font-inter text-base text-slate-900 mt-0.5">{formatDateTime(user.createdAt)}</Text>
              </View>
            </View>
            <View className="flex-row items-center">
              <View className="h-8 w-8 rounded-full bg-brand-soft/20 items-center justify-center mr-3">
                <MaterialIcons name="update" size={16} color="#C5A028" />
              </View>
              <View className="flex-1">
                <Text className="font-inter text-xs font-semibold text-slate-500 uppercase tracking-wide">Updated</Text>
                <Text className="font-inter text-base text-slate-900 mt-0.5">{formatDateTime(user.updatedAt)}</Text>
              </View>
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
