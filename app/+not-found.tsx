import { Link, Stack } from 'expo-router';
import { Text, View } from 'react-native';

export default function NotFoundScreen() {
  return (
    <>
      <Stack.Screen options={{ title: 'Page Not Found' }} />
      <View className="flex-1 items-center justify-center bg-white px-6">
        <Text className="font-inter text-6xl font-bold text-brand-primary">404</Text>
        <Text className="mt-4 text-center font-inter text-base text-slate-700">
          This screen doesn't exist.
        </Text>
        <Link href="/(public)/" className="btn-primary btn-sm mt-6">
          <Text className="font-inter text-sm font-semibold text-white">Go to homepage</Text>
        </Link>
      </View>
    </>
  );
}
