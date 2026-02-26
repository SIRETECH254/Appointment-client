// appointment-client/components/ui/ContactCard.tsx
/**
 * ContactCard Component
 * 
 * Displays a contact message card with sender name, subject, message preview,
 * date, and status. Used in contact message listing pages.
 * 
 * @component
 */

import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { IContact } from '@/types/api.types';
import { formatDateTime } from '@/utils/notificationUtils';
import StatusBadge from '@/components/ui/StatusBadge';

interface ContactCardProps {
  contact: IContact;
  onPress?: () => void;
}

/**
 * ContactCard component for displaying contact message information in a card format.
 * 
 * @param contact - The contact message object containing all message details
 * @param onPress - Optional callback when the card is pressed (defaults to navigation)
 */
const ContactCard: React.FC<ContactCardProps> = ({ 
  contact, 
  onPress 
}) => {
  const router = useRouter();

  const handlePress = () => {
    if (onPress) {
      onPress();
    } else {
      router.push(`/(authenticated)/contact/${contact._id}`);
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
          {/* View: Sender name and subject with icon */}
          <View className="flex-row items-center mb-1">
            <View className="h-5 w-5 rounded-full bg-amber-100 items-center justify-center mr-2">
              <MaterialIcons name="person" size={12} color="#D97706" />
            </View>
            <Text className="text-base font-semibold text-gray-900 flex-1" numberOfLines={1}>
              {contact.name} - {contact.subject}
            </Text>
          </View>
          
          {/* View: Message preview with icon */}
          <View className="flex-row items-start mt-2">
            <View className="h-4 w-4 rounded-full bg-orange-100 items-center justify-center mr-2 mt-0.5">
              <MaterialIcons name="message" size={10} color="#EA580C" />
            </View>
            <Text className="flex-1 text-sm text-gray-500" numberOfLines={2}>
              {contact.message}
            </Text>
          </View>
          
          {/* View: Date with icon */}
          <View className="mt-2 flex-row items-center">
            <View className="h-4 w-4 rounded-full bg-teal-100 items-center justify-center mr-2">
              <MaterialIcons name="access-time" size={10} color="#0D9488" />
            </View>
            <Text className="text-[10px] font-medium text-teal-700">
              {formatDateTime(contact.createdAt.toString())}
            </Text>
          </View>
        </View>
        {/* Status Badge */}
        <StatusBadge 
          status={contact.status} 
          type="contact"
          className="ml-2"
        />
      </View>
    </TouchableOpacity>
  );
};

export default ContactCard;
