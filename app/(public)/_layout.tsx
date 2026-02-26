import { useState } from 'react';
import { View } from 'react-native';
import { Stack } from 'expo-router';
import Navbar from '../../components/layout/Navbar';
// import Footer from '../../components/layout/Footer';
import Sidebar from '../../components/layout/Sidebar';

export default function PublicLayout() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const toggleSidebar = () => {
    setIsSidebarOpen((prev) => !prev);
  };

  return (
    <View className="flex-1 bg-white">
      <Navbar isSidebarOpen={isSidebarOpen} onToggleSidebar={toggleSidebar} />
      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
      <View className="flex-1">
        <Stack
          screenOptions={{
            headerShown: false,
          }}>
          <Stack.Screen name="index" />
          <Stack.Screen name="services" />
          <Stack.Screen name="contact" />
          <Stack.Screen name="(auth)" options={{ headerShown: false }} />
        </Stack>
      </View>
      {/* <Footer /> */}
    </View>
  );
}
