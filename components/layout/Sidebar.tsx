import { View, Text, TouchableOpacity, Dimensions } from 'react-native';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useRouter } from 'expo-router';
import { useAuth } from '../../contexts/AuthContext';

type SidebarProps = {
  isOpen: boolean;
  onClose: () => void;
};

const Sidebar = ({ isOpen, onClose }: SidebarProps) => {
  const router = useRouter();
  const { logout, isAuthenticated } = useAuth();
  const screenWidth = Dimensions.get('window').width;
  const isLargeScreen = screenWidth >= 1024;

  // Don't render on large screens
  if (isLargeScreen) {
    return null;
  }

  // Shared sidebar content
  const content = (
    <View className="flex-1 bg-white px-4 pb-6 pt-6">
      <TouchableOpacity
        onPress={onClose}
        className="absolute right-4 top-4 rounded-lg p-2"
        accessibilityLabel="Close sidebar">
        <MaterialIcons name="close" size={24} color="#4B5563" />
      </TouchableOpacity>

      {/* Primary navigation links */}
      <View className="flex-1 gap-1 pr-2 pt-8">
        {/* Placeholder navigation items - will be populated from constants/navigation.ts */}
        <TouchableOpacity
          onPress={() => {
            router.push('/(public)/');
            onClose();
          }}
          className="flex-row items-center gap-3 rounded-xl px-3 py-3">
          <MaterialIcons name="home" size={20} color="#374151" />
          <Text className="font-inter text-sm font-medium text-gray-700">Home</Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => {
            router.push('/(public)/services');
            onClose();
          }}
          className="flex-row items-center gap-3 rounded-xl px-3 py-3">
          <MaterialIcons name="room-service" size={20} color="#374151" />
          <Text className="font-inter text-sm font-medium text-gray-700">Services</Text>
        </TouchableOpacity>
        {isAuthenticated && (
          <>
            <TouchableOpacity
              onPress={() => {
                router.push('/(authenticated)/appointment');
                onClose();
              }}
              className="flex-row items-center gap-3 rounded-xl px-3 py-3">
              <MaterialIcons name="calendar-today" size={20} color="#374151" />
              <Text className="font-inter text-sm font-medium text-gray-700">Appointments</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => {
                router.push('/(authenticated)/payments');
                onClose();
              }}
              className="flex-row items-center gap-3 rounded-xl px-3 py-3">
              <MaterialIcons name="payments" size={20} color="#374151" />
              <Text className="font-inter text-sm font-medium text-gray-700">Payments</Text>
            </TouchableOpacity>
          </>
        )}
        <TouchableOpacity
          onPress={() => {
            router.push('/(public)/contact');
            onClose();
          }}
          className="flex-row items-center gap-3 rounded-xl px-3 py-3">
          <MaterialIcons name="mail-outline" size={20} color="#374151" />
          <Text className="font-inter text-sm font-medium text-gray-700">Contact</Text>
        </TouchableOpacity>
      </View>

      {/* Footer action: logout (only if authenticated) */}
      {isAuthenticated && (
        <View className="mt-6 border-t border-gray-200 pt-4">
          <TouchableOpacity
            onPress={() => {
              logout();
              onClose();
            }}
            className="btn-primary flex-row gap-2">
            <MaterialIcons name="logout" size={18} color="#FFFFFF" />
            <Text className="font-inter text-sm font-semibold text-white">Logout</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );

  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <TouchableOpacity
          onPress={onClose}
          className="absolute inset-0 z-30 bg-black/30"
          accessibilityLabel="Close sidebar"
        />
      )}
      {/* Mobile drawer */}
      {isOpen && (
        <View className="absolute left-0 top-0 z-40 h-full w-72 border-r border-gray-200 bg-white shadow-xl">
          {content}
        </View>
      )}
    </>
  );
};

export default Sidebar;
