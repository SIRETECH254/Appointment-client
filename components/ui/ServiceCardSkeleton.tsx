// appointment-client/components/ui/ServiceCardSkeleton.tsx
import React from 'react';
import { View } from 'react-native';

const ServiceCardSkeleton = () => {
  return (
    <View className="bg-gray-200 p-4 rounded-lg shadow-md mb-4 animate-pulse">
      <View className="h-6 bg-gray-300 rounded w-3/4 mb-2"></View>
      <View className="h-4 bg-gray-300 rounded w-full mb-2"></View>
      <View className="h-4 bg-gray-300 rounded w-5/6 mb-4"></View>
      <View className="flex-row justify-between items-center">
        <View className="h-4 bg-gray-300 rounded w-1/4"></View>
        <View className="h-6 bg-gray-300 rounded w-1/4"></View>
      </View>
    </View>
  );
};

export default ServiceCardSkeleton;
