import { useState } from 'react';
import { Redirect, Stack } from 'expo-router';
import { ActivityIndicator, View } from 'react-native';
import { useAuth } from '../../contexts/AuthContext';
import Navbar from '../../components/layout/Navbar';
import Footer from '../../components/layout/Footer';
import Sidebar from '../../components/layout/Sidebar';

export default function AuthenticatedLayout() {
  const { isAuthenticated, isLoading } = useAuth();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const toggleSidebar = () => {
    setIsSidebarOpen((prev) => !prev);
  };

  if (isLoading) {
    return (
      <View className="flex-1 items-center justify-center bg-white">
        <ActivityIndicator size="large" color="#D4AF37" />
      </View>
    );
  }

  if (!isAuthenticated) {
    return <Redirect href="/(public)/(auth)/login" />;
  }

  return (
    <View className="flex-1 bg-white">
      <Navbar isSidebarOpen={isSidebarOpen} onToggleSidebar={toggleSidebar} />
      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
      <View className="flex-1">
        <Stack
          screenOptions={{
            headerShown: false,
          }}>
          <Stack.Screen name="appointment/index" options={{ headerShown: false }} />
          <Stack.Screen name="appointment/create" options={{ headerShown: false }} />
          <Stack.Screen name="appointment/reschedule" options={{ headerShown: false }} />
          <Stack.Screen name="appointment/[id]" options={{ headerShown: false }} />
          <Stack.Screen name="appointment/[id]/payment" options={{ headerShown: false }} />
          <Stack.Screen name="payments/index" options={{ headerShown: false }} />
          <Stack.Screen name="payments/[id]" options={{ headerShown: false }} />
          <Stack.Screen name="payments/service" options={{ headerShown: false }} />
          <Stack.Screen name="payments/status" options={{ headerShown: false }} />
          <Stack.Screen name="profile/index" options={{ headerShown: false }} />
          <Stack.Screen name="profile/edit" options={{ headerShown: false }} />
          <Stack.Screen name="profile/change-password" options={{ headerShown: false }} />
          <Stack.Screen name="notifications/index" options={{ headerShown: false }} />
          <Stack.Screen name="notifications/[id]" options={{ headerShown: false }} />
          <Stack.Screen name="contact/index" options={{ headerShown: false }} />
          <Stack.Screen name="contact/[id]" options={{ headerShown: false }} />
        </Stack>
      </View>
      <Footer />
    </View>
  );
}
