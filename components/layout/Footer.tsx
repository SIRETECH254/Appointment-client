import { View, Text } from 'react-native';

const Footer = () => {
  return (
    <View className="border-t border-gray-200 bg-white py-6">
      <View className="items-center justify-center px-4">
        <Text className="text-center font-inter text-sm text-slate-500">
          © {new Date().getFullYear()} Appointment Client. All rights reserved.
        </Text>
      </View>
    </View>
  );
};

export default Footer;
