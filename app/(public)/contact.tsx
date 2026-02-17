import { View, Text, ScrollView } from 'react-native';

export default function ContactPage() {
  return (
    <ScrollView className="flex-1 bg-white">
      <View className="p-6">
        <Text className="font-inter text-3xl font-bold text-slate-900">Contact Us</Text>
        <Text className="mt-2 font-inter text-xl font-semibold text-brand-primary">
          Get in Touch
        </Text>
        <Text className="mt-4 font-inter text-base leading-6 text-slate-600">
          Have questions or need assistance? Reach out to us through the contact form below.
        </Text>
        {/* Placeholder for contact form */}
        <View className="mt-8 items-center rounded-xl bg-brand-tint p-6">
          <Text className="font-inter text-sm italic text-slate-600">
            Contact form will be implemented here
          </Text>
        </View>
      </View>
    </ScrollView>
  );
}
