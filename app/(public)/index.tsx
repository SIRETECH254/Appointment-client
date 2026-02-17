import { Link } from 'expo-router';
import { Text, View } from 'react-native';

export default function HomePage() {
  return (
    <View className="flex-1 bg-white">
      <View className="flex-1 items-center justify-center px-6">
        <Text className="font-inter text-3xl font-bold text-slate-900">Welcome</Text>
        <Text className="mt-2 font-inter text-xl font-semibold text-brand-primary">
          Appointment Booking System
        </Text>
        <Text className="mt-4 max-w-xl text-center font-inter text-base leading-6 text-slate-600">
          Book your appointments with ease. Sign in or create an account to get started.
        </Text>

        <View className="mt-12 w-full max-w-sm gap-4">
          <Link href="/(public)/(auth)/login" className="btn-primary">
            <Text className="font-inter text-base font-semibold text-white">Login</Text>
          </Link>
          <Link href="/(public)/(auth)/register" className="btn-secondary">
            <Text className="font-inter text-base font-semibold text-gray-700">Register</Text>
          </Link>
        </View>
      </View>
    </View>
  );
}
