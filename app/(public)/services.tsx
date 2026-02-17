import { View, Text, ScrollView } from 'react-native';

export default function ServicesPage() {
  return (
    <ScrollView className="flex-1 bg-white">
      <View className="p-6">
        <Text className="font-inter text-3xl font-bold text-slate-900">Services</Text>
        <Text className="mt-2 font-inter text-xl font-semibold text-brand-primary">
          Our Available Services
        </Text>
        <Text className="mt-4 font-inter text-base leading-6 text-slate-600">
          Browse our range of services. This page will display all available services with details.
        </Text>
        {/* Placeholder for services list */}
        <View className="mt-8 items-center rounded-xl bg-brand-tint p-6">
          <Text className="font-inter text-sm italic text-slate-600">
            Services list will be implemented here
          </Text>
        </View>
      </View>
    </ScrollView>
  );
}
