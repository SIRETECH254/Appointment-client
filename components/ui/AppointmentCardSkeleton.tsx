// appointment-client/components/ui/AppointmentCardSkeleton.tsx
/**
 * AppointmentCardSkeleton Component
 * 
 * Displays a skeleton loading state for AppointmentCard.
 * Used while appointment data is being fetched.
 * 
 * @component
 */

import React from 'react';
import { View } from 'react-native';

const AppointmentCardSkeleton = () => {
  return (
    <View className="mb-4 rounded-2xl border border-gray-100 bg-white p-4 shadow-sm">
      <View className="flex-row items-start justify-between">
        <View className="flex-1">
          {/* Service name skeleton */}
          <View className="h-5 bg-gray-200 rounded w-3/4 mb-2" />
          
          {/* Date skeleton */}
          <View className="mt-2 flex-row items-center">
            <View className="h-4 w-4 bg-gray-200 rounded mr-1" />
            <View className="h-4 bg-gray-200 rounded w-32" />
          </View>

          {/* Booked on skeleton */}
          <View className="mt-1 flex-row items-center">
            <View className="h-3 w-3 bg-gray-200 rounded mr-1" />
            <View className="h-3 bg-gray-200 rounded w-24" />
          </View>

          {/* Staff skeleton */}
          <View className="mt-1 flex-row items-center">
            <View className="h-4 w-4 bg-gray-200 rounded mr-1" />
            <View className="h-4 bg-gray-200 rounded w-28" />
          </View>
        </View>

        {/* Status badge skeleton */}
        <View className="h-6 w-16 bg-gray-200 rounded-full ml-2" />
      </View>

      {/* Footer skeleton */}
      <View className="mt-4 flex-row items-center justify-between border-t border-gray-50 pt-3">
        <View>
          <View className="h-3 bg-gray-200 rounded w-20 mb-1" />
          <View className="h-5 bg-gray-200 rounded w-24" />
        </View>
        <View className="h-6 w-6 bg-gray-200 rounded" />
      </View>
    </View>
  );
};

export default AppointmentCardSkeleton;
