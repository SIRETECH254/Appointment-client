import { useState, useMemo, useEffect } from 'react';
import { View, Text, TouchableOpacity, Dimensions } from 'react-native';
import { useRouter, usePathname } from 'expo-router';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useAuth } from '../../contexts/AuthContext';
import { useGetUnreadNotificationCount } from '../../tanstack/useNotifications';

type NavbarProps = {
  isSidebarOpen: boolean;
  onToggleSidebar: () => void;
};

const Navbar = ({ isSidebarOpen, onToggleSidebar }: NavbarProps) => {
  const { user, isAuthenticated, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // Connect to the unread count API
  const { data: unreadCountData } = useGetUnreadNotificationCount();
  const unreadCount = unreadCountData?.unreadCount || 0;

  // Check if screen is large (lg breakpoint - 1024px)
  const [screenWidth, setScreenWidth] = useState(Dimensions.get('window').width);
  const isLargeScreen = screenWidth >= 1024;

  // Update screen width on dimension change
  useEffect(() => {
    const subscription = Dimensions.addEventListener('change', ({ window }) => {
      setScreenWidth(window.width);
    });
    return () => subscription?.remove();
  }, []);

  // Build user initials for avatar
  const userInitials = useMemo(() => {
    if (!user) return 'U';
    const initials = [user.firstName, user.lastName]
      .filter(Boolean)
      .map((value) => value?.[0]?.toUpperCase())
      .join('');
    return initials || 'U';
  }, [user]);

  const handleProfile = () => {
    setIsMenuOpen(false);
    router.push('/(authenticated)/(tabs)/profile');
  };

  const handleLogout = async () => {
    setIsMenuOpen(false);
    await logout();
  };

  const handleLogin = () => {
    router.push('/(public)/(auth)/login');
  };

  const handleNotifications = () => {
    setIsMenuOpen(false);
    router.push('/(authenticated)/notifications');
  };

  return (
    <View className="sticky top-0 z-40 border-b border-gray-200 bg-white">
      <View className="flex-row items-center justify-between px-4 py-3 lg:px-6">
        {/* Left section: hamburger + logo */}
        <View className="flex-row items-center gap-3">
          {/* Mobile sidebar toggle */}
          {!isLargeScreen && (
            <TouchableOpacity
              onPress={onToggleSidebar}
              className="h-10 w-10 items-center justify-center rounded-full bg-gray-100 lg:hidden"
              accessibilityLabel={isSidebarOpen ? 'Close navigation' : 'Open navigation'}>
              <MaterialIcons
                name={isSidebarOpen ? 'close' : 'menu'}
                size={22}
                color="#374151"
              />
            </TouchableOpacity>
          )}
          {/* Logo + app name */}
          <View className="flex-row items-center gap-2">
            <View className="h-9 w-9 items-center justify-center rounded-lg bg-brand-primary">
              <Text className="font-inter text-sm font-semibold text-white">AC</Text>
            </View>
          </View>
        </View>

        {/* Center section: navigation links (large screens only) */}
        {isLargeScreen && (
          <View className="hidden flex-1 flex-row justify-center gap-6 lg:flex">
            <TouchableOpacity
              onPress={() => router.push('/(public)/')}
              className={`px-3 py-2 ${pathname === '/(public)/' ? 'border-b-2 border-brand-primary' : ''}`}>
              <Text className={`font-inter text-sm font-medium ${pathname === '/(public)/' ? 'text-brand-primary' : 'text-slate-600'}`}>
                Home
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => router.push('/(public)/services')}
              className={`px-3 py-2 ${pathname === '/(public)/services' ? 'border-b-2 border-brand-primary' : ''}`}>
              <Text className={`font-inter text-sm font-medium ${pathname === '/(public)/services' ? 'text-brand-primary' : 'text-slate-600'}`}>
                Services
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => router.push('/(public)/contact')}
              className={`px-3 py-2 ${pathname === '/(public)/contact' ? 'border-b-2 border-brand-primary' : ''}`}>
              <Text className={`font-inter text-sm font-medium ${pathname === '/(public)/contact' ? 'text-brand-primary' : 'text-slate-600'}`}>
                Contact
              </Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Right section: notifications + profile menu OR login button */}
        <View className="flex-row items-center gap-3">
          {isAuthenticated ? (
            <>
              {/* Notifications icon + unread badge */}
              <TouchableOpacity
                onPress={handleNotifications}
                className="relative h-10 w-10 items-center justify-center rounded-full bg-gray-100"
                accessibilityLabel="Notifications">
                <MaterialIcons name="notifications-none" size={22} color="#374151" />
                {unreadCount > 0 && (
                  <View className="absolute -right-1 -top-1 min-w-[20px] items-center justify-center rounded-full bg-red-500 px-1">
                    <Text className="text-[10px] font-semibold text-white">
                      {unreadCount > 99 ? '99+' : unreadCount}
                    </Text>
                  </View>
                )}
              </TouchableOpacity>

              {/* Profile dropdown trigger + menu */}
              <View className="relative">
                <TouchableOpacity
                  onPress={() => setIsMenuOpen((prev) => !prev)}
                  className="flex-row items-center gap-2 rounded-full bg-gray-100 px-2 py-1.5"
                  accessibilityLabel="Account menu">
                  <View className="h-9 w-9 items-center justify-center rounded-full bg-brand-primary">
                    <Text className="font-inter text-sm font-semibold text-white">{userInitials}</Text>
                  </View>
                  {isLargeScreen && (
                    <View className="hidden flex-col lg:flex">
                      <Text className="font-inter text-sm font-semibold text-slate-900">
                        {user ? `${user.firstName} ${user.lastName}` : 'User'}
                      </Text>
                      <Text className="font-inter text-xs text-slate-500">
                        {user?.email ?? 'user@example.com'}
                      </Text>
                    </View>
                  )}
                  <MaterialIcons name="arrow-drop-down" size={20} color="#4B5563" />
                </TouchableOpacity>

                {/* Dropdown actions */}
                {isMenuOpen && (
                  <>
                    <View className="absolute right-0 z-40 mt-3 w-56 rounded-xl border border-gray-200 bg-white p-3 shadow-lg">
                      <TouchableOpacity
                        onPress={handleProfile}
                        className="flex-row items-center gap-2 rounded-lg px-3 py-2">
                        <MaterialIcons name="person" size={18} color="#374151" />
                        <Text className="font-inter text-sm text-gray-700">View Profile</Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        onPress={handleLogout}
                        className="mt-2 flex-row items-center gap-2 rounded-lg px-3 py-2">
                        <MaterialIcons name="logout" size={18} color="#DC2626" />
                        <Text className="font-inter text-sm text-red-600">Logout</Text>
                      </TouchableOpacity>
                    </View>
                    {/* Click-away overlay to close the menu */}
                    <TouchableOpacity
                      onPress={() => setIsMenuOpen(false)}
                      className="absolute inset-0 z-30"
                      accessibilityLabel="Close menu"
                    />
                  </>
                )}
              </View>
            </>
          ) : (
            <TouchableOpacity
              onPress={handleLogin}
              className="btn-primary btn-sm">
              <Text className="font-inter text-sm font-semibold text-white">Login</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </View>
  );
};

export default Navbar;


