import { Text, TouchableOpacity, View } from 'react-native';
import { useAuth } from '../../../contexts/AuthContext';

export default function ProfileScreen() {
  const { user, logout } = useAuth();

  const handleLogout = async () => {
    await logout();
    // Logout function already handles navigation to login
  };

  return (
    <View className="flex-1 bg-white">
      <View className="flex-1 p-6">
        <View className="mb-8">
          <Text className="font-inter text-3xl font-bold text-slate-900">Profile</Text>
        </View>

        <View className="mb-8">
          <View className="items-center">
            <View className="h-24 w-24 items-center justify-center rounded-full bg-brand-primary">
              <Text className="font-inter text-3xl font-bold text-white">
                {user?.firstName?.[0]?.toUpperCase() || 'U'}
                {user?.lastName?.[0]?.toUpperCase() || ''}
              </Text>
            </View>
          </View>

          <View className="mt-6 gap-4">
            <View className="border-b border-gray-200 pb-4">
              <Text className="font-inter text-sm font-semibold text-slate-500">Name</Text>
              <Text className="mt-1 font-inter text-base text-slate-900">
                {user?.firstName} {user?.lastName}
              </Text>
            </View>

            <View className="border-b border-gray-200 pb-4">
              <Text className="font-inter text-sm font-semibold text-slate-500">Email</Text>
              <Text className="mt-1 font-inter text-base text-slate-900">{user?.email || 'N/A'}</Text>
            </View>

            {user?.phone && (
              <View className="border-b border-gray-200 pb-4">
                <Text className="font-inter text-sm font-semibold text-slate-500">Phone</Text>
                <Text className="mt-1 font-inter text-base text-slate-900">{user.phone}</Text>
              </View>
            )}

            <View className="border-b border-gray-200 pb-4">
              <Text className="font-inter text-sm font-semibold text-slate-500">Role</Text>
              <Text className="mt-1 font-inter text-base text-slate-900">{user?.role || 'N/A'}</Text>
            </View>
          </View>
        </View>

        <View className="mb-8 rounded-xl bg-brand-tint p-4">
          <Text className="text-center font-inter text-sm italic text-slate-600">
            Profile management features will be implemented here
          </Text>
        </View>

        <TouchableOpacity className="btn bg-brand-accent" onPress={handleLogout}>
          <Text className="font-inter text-base font-semibold text-white">Logout</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
