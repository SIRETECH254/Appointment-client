// appointment-client/components/ui/NotificationCard.tsx
/**
 * NotificationCard Component
 * 
 * Displays a notification card with notification details including category,
 * type, subject, message, date, and status. Used in notification listing pages.
 * 
 * @component
 */

import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { Notification } from '@/types/api.types';
import { formatDateTime, getTypeDisplayName } from '@/utils/notificationUtils';
import StatusBadge from '@/components/ui/StatusBadge';

interface NotificationCardProps {
  notification: Notification;
  onPress?: () => void;
}

/**
 * NotificationCard component for displaying notification information in a card format.
 * 
 * @param notification - The notification object containing all notification details
 * @param onPress - Optional callback when the card is pressed (defaults to navigation)
 */
const NotificationCard: React.FC<NotificationCardProps> = ({ 
  notification, 
  onPress
}) => {
  const router = useRouter();

  const handlePress = () => {
    if (onPress) {
      onPress();
    } else {
      router.push(`/(authenticated)/notifications/${notification._id}`);
    }
  };

  return (
    <TouchableOpacity
      onPress={handlePress}
      activeOpacity={0.7}
      className="mb-3 rounded-xl border border-gray-100 bg-white p-4 shadow-sm"
    >
      <View className="flex-row items-start justify-between">
        <View className="flex-1">
          {/* View: Category badge and type badges */}
          <View className="flex-row items-center gap-2 mb-2">
            <StatusBadge
              status={notification.category}
              type="notification-category"
            />
            <StatusBadge
              status={notification.type}
              type="notification-type"
            />
          </View>
          
          {/* Text: Subject with icon */}
          <View className="flex-row items-start mb-1">
            <View className="h-5 w-5 rounded-full bg-amber-100 items-center justify-center mr-2 mt-0.5">
              <MaterialIcons name="subject" size={12} color="#D97706" />
            </View>
            <Text 
              className={`flex-1 text-base font-semibold text-gray-900 ${notification.isUnread ? 'pr-6' : ''}`}
              numberOfLines={1}
            >
              {notification.subject}
            </Text>
          </View>
          
          {/* Text: Message preview with icon */}
          <View className="flex-row items-start mt-2">
            <View className="h-4 w-4 rounded-full bg-orange-100 items-center justify-center mr-2 mt-0.5">
              <MaterialIcons name="message" size={10} color="#EA580C" />
            </View>
            <Text className="flex-1 text-sm text-gray-500" numberOfLines={2}>
              {notification.message}
            </Text>
          </View>
          
          {/* View: Date with icon */}
          <View className="flex-row items-center mt-2">
            <View className="h-4 w-4 rounded-full bg-teal-100 items-center justify-center mr-2">
              <MaterialIcons name="access-time" size={10} color="#0D9488" />
            </View>
            <Text className="text-[10px] font-medium text-teal-700">
              {formatDateTime(notification.createdAt)}
            </Text>
          </View>
        </View>

        {/* View: Unread indicator */}
        {notification.isUnread && (
          <View className="ml-2 items-center justify-center">
            <View className="h-2.5 w-2.5 rounded-full bg-amber-500" />
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
};

export default NotificationCard;
