// appointment-client/components/ui/NotificationCardSkeleton.tsx
/**
 * NotificationCardSkeleton Component
 * 
 * Displays a skeleton loading state for NotificationCard.
 * Used while notification data is being fetched.
 * 
 * @component
 */

import React from 'react';
import { View } from 'react-native';

const NotificationCardSkeleton = () => {
  return (
    <View className="mb-3 rounded-xl border border-gray-100 bg-white p-4 shadow-sm animate-pulse">
      <View className="flex-row items-start justify-between">
        <View className="flex-1">
          {/* Badge and type skeleton */}
          <View className="flex-row items-center gap-2 mb-2">
            <View className="h-5 w-20 bg-gray-200 rounded-full" />
            <View className="h-4 w-16 bg-gray-200 rounded" />
          </View>
          
          {/* Subject skeleton */}
          <View className="flex-row items-start mb-1">
            <View className="h-5 w-5 bg-gray-200 rounded-full mr-2" />
            <View className="h-5 bg-gray-200 rounded w-3/4" />
          </View>
          
          {/* Message skeleton */}
          <View className="flex-row items-start mt-2">
            <View className="h-4 w-4 bg-gray-200 rounded-full mr-2" />
            <View className="flex-1 space-y-1">
              <View className="h-4 bg-gray-200 rounded w-full" />
              <View className="h-4 bg-gray-200 rounded w-5/6" />
            </View>
          </View>
          
          {/* Date skeleton */}
          <View className="flex-row items-center mt-2">
            <View className="h-4 w-4 bg-gray-200 rounded-full mr-2" />
            <View className="h-3 bg-gray-200 rounded w-24" />
          </View>
        </View>

        {/* Right side skeleton */}
        <View className="items-end justify-between ml-2">
          <View className="h-2.5 w-2.5 bg-gray-200 rounded-full mb-2" />
          <View className="h-5 w-5 bg-gray-200 rounded mt-4" />
        </View>
      </View>
    </View>
  );
};

export default NotificationCardSkeleton;
