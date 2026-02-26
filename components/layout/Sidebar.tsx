import { View, Text, TouchableOpacity, Dimensions } from 'react-native';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useRouter, usePathname } from 'expo-router';
import { useAuth } from '../../contexts/AuthContext';
import { getPublicNavItems, getAuthenticatedNavItems, isRouteActive } from '../../constants/navigation';

type SidebarProps = {
  isOpen: boolean;
  onClose: () => void;
};

const Sidebar = ({ isOpen, onClose }: SidebarProps) => {
  const router = useRouter();
  const pathname = usePathname();
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
      {/* Primary navigation links */}
      <View className="flex-1 gap-1 pr-2 pt-8">
        {/* Public navigation items */}
        {getPublicNavItems().map((item) => {
          const isActive = isRouteActive(pathname, item);
          return (
            <TouchableOpacity
              key={item.path}
              onPress={() => {
                router.push(item.path as any);
                onClose();
              }}
              className={`flex-row items-center gap-3 rounded-xl px-3 py-3 ${isActive ? 'active-sidelink' : ''}`}>
              <MaterialIcons 
                name={item.icon} 
                size={20} 
                color={isActive ? '#D4AF37' : '#374151'} 
              />
              <Text className={`font-inter text-sm font-medium ${isActive ? 'active-sidelink-text' : 'text-gray-700'}`}>
                {item.label}
              </Text>
            </TouchableOpacity>
          );
        })}
        {/* Authenticated navigation items */}
        {isAuthenticated && getAuthenticatedNavItems()
          .filter(item => item.label === 'Appointments' || item.label === 'Payments')
          .map((item) => {
            const isActive = isRouteActive(pathname, item);
            return (
              <TouchableOpacity
                key={item.path}
                onPress={() => {
                  router.push(item.path as any);
                  onClose();
                }}
                className={`flex-row items-center gap-3 rounded-xl px-3 py-3 ${isActive ? 'active-sidelink' : ''}`}>
                <MaterialIcons 
                  name={item.icon} 
                  size={20} 
                  color={isActive ? '#D4AF37' : '#374151'} 
                />
                <Text className={`font-inter text-sm font-medium ${isActive ? 'active-sidelink-text' : 'text-gray-700'}`}>
                  {item.label}
                </Text>
              </TouchableOpacity>
            );
          })}
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
          {/* Close button - positioned relative to drawer */}
          <TouchableOpacity
            onPress={onClose}
            className="absolute right-4 top-4 z-50 rounded-lg p-2"
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            activeOpacity={0.7}
            accessibilityLabel="Close sidebar">
            <MaterialIcons name="close" size={24} color="#4B5563" />
          </TouchableOpacity>
          {content}
        </View>
      )}
    </>
  );
};

export default Sidebar;
