import '../global.css';
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';
import { PaperProvider } from 'react-native-paper';
import { en, registerTranslation } from 'react-native-paper-dates';

// Register date picker locale
registerTranslation('en', en);

import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import { store, persistor } from '../redux';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'; // TanStack Query imports

import { AuthProvider } from '../contexts/AuthContext'; // Import AuthProvider

import { useColorScheme } from '@/hooks/use-color-scheme';

// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      gcTime: 10 * 60 * 1000, // 10 minutes (formerly cacheTime)
      retry: 1,
      // In React Native, refetchOnWindowFocus might not be directly applicable
      // or behave differently than in web. Consider if this default is desired.
      // refetchOnWindowFocus: false,
    },
    mutations: {
      retry: 1,
    },
  },
});

export default function RootLayout() {
  const colorScheme = useColorScheme();

  const appShell = (
    <AuthProvider>
      <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
        <PaperProvider>
          <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen name="(public)" options={{ headerShown: false }} />
            <Stack.Screen name="(authenticated)" options={{ headerShown: false }} />
            <Stack.Screen name="+not-found" />
          </Stack>
          <StatusBar style="auto" />
        </PaperProvider>
      </ThemeProvider>
    </AuthProvider>
  );

  return (
    <QueryClientProvider client={queryClient}>
      <Provider store={store}>
        {persistor ? (
          <PersistGate loading={null} persistor={persistor}>{appShell}</PersistGate>
        ) : (
          appShell
        )}
      </Provider>
    </QueryClientProvider>
  );
}
