// appointment-client/components/ui/ContactCardSkeleton.tsx
/**
 * ContactCardSkeleton Component
 * 
 * Displays a skeleton loading state for ContactCard.
 * Used while contact message data is being fetched.
 * 
 * @component
 */

import React from 'react';
import { View } from 'react-native';

const ContactCardSkeleton = () => {
  return (
    <View className="mb-3 rounded-xl border border-gray-100 bg-white p-4 shadow-sm">
      <View className="flex-row items-start justify-between">
        <View className="flex-1">
          {/* Name and subject skeleton */}
          <View className="h-5 bg-gray-200 rounded w-3/4 mb-2" />
          
          {/* Message preview skeleton */}
          <View className="mt-1 space-y-1">
            <View className="h-4 bg-gray-200 rounded w-full" />
            <View className="h-4 bg-gray-200 rounded w-5/6" />
          </View>
          
          {/* Date skeleton */}
          <View className="mt-2 h-3 bg-gray-200 rounded w-32" />
        </View>
        
        {/* Status badge skeleton */}
        <View className="h-6 w-16 bg-gray-200 rounded-full ml-2" />
      </View>
    </View>
  );
};

export default ContactCardSkeleton;
