// appointment-client/components/ui/PaymentCardSkeleton.tsx
/**
 * PaymentCardSkeleton Component
 * 
 * Displays a skeleton loading state for PaymentCard.
 * Used while payment data is being fetched.
 * 
 * @component
 */

import React from 'react';
import { View } from 'react-native';

const PaymentCardSkeleton = () => {
  return (
    <View className="mb-4 rounded-2xl border border-gray-100 bg-white p-4 shadow-sm">
      <View className="flex-row items-start justify-between">
        <View className="flex-1">
          {/* Payment number skeleton */}
          <View className="h-3 bg-gray-200 rounded w-32 mb-2" />
          
          {/* Amount skeleton */}
          <View className="h-8 bg-gray-200 rounded w-28 mb-3" />
          
          {/* Date and method skeleton */}
          <View className="flex-row items-center">
            <View className="h-3 w-3 bg-gray-200 rounded mr-1" />
            <View className="h-3 bg-gray-200 rounded w-24 mr-2" />
            <View className="h-1 w-1 bg-gray-200 rounded-full mr-2" />
            <View className="h-3 w-3 bg-gray-200 rounded mr-1" />
            <View className="h-3 bg-gray-200 rounded w-20" />
          </View>
        </View>

        {/* Status badge skeleton */}
        <View className="h-6 w-16 bg-gray-200 rounded-full ml-2" />
      </View>

      {/* Footer skeleton */}
      <View className="mt-4 flex-row items-center justify-between border-t border-gray-50 pt-3">
        <View className="h-3 bg-gray-200 rounded w-24" />
        <View className="h-5 w-5 bg-gray-200 rounded" />
      </View>
    </View>
  );
};

export default PaymentCardSkeleton;
