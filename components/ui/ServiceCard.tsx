// appointment-client/components/ui/ServiceCard.tsx
/**
 * ServiceCard Component
 * 
 * Displays a service card with service details including name, description,
 * duration, price, and deposit amount. Used in service listing pages.
 * 
 * @component
 */

import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { Service } from '../../types/api.types';
import { formatCurrency } from '../../utils/paymentUtils';
import { formatDuration } from '../../utils/serviceUtils';

interface ServiceCardProps {
  service: Service;
  onPress?: () => void;
  showBookButton?: boolean;
  onBookPress?: () => void;
}

/**
 * ServiceCard component for displaying service information in a card format.
 * 
 * @param service - The service object containing all service details
 * @param onPress - Optional callback when the card is pressed
 * @param showBookButton - Whether to show the "Book Now" button
 * @param onBookPress - Optional callback when the "Book Now" button is pressed
 */
const ServiceCard: React.FC<ServiceCardProps> = ({ 
  service, 
  onPress,
  showBookButton = false,
  onBookPress 
}) => {
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.7}
      className="rounded-2xl border border-gray-100 bg-white p-2 shadow-sm"
    >
      {/* Service Name */}
      <Text className="mb-2 font-inter text-xl font-bold text-gray-900" numberOfLines={1} ellipsizeMode="tail">
        {service.name}
      </Text>

      {/* Service Description */}
      <Text 
        className="mb-4 font-inter text-sm leading-5 text-gray-600" 
        numberOfLines={1}
        ellipsizeMode="tail"
      >
        {service.description}
      </Text>

      {/* Service Details Row: Duration and Price */}
      <View className="mb-4 flex-row items-center justify-between">
        {/* Duration */}
        <View className="flex-row items-center">
          <MaterialIcons name="access-time" size={18} color="#6B7280" />
          <Text className="ml-1 font-inter text-sm text-gray-600">
            {formatDuration(service.duration)}
          </Text>
        </View>

        {/* Price */}
        <View className="flex-row items-center">
          <MaterialIcons name="attach-money" size={18} color="#D4AF37" />
          <Text className="ml-1 font-inter text-base font-bold text-brand-primary">
            {service.fullPrice}
          </Text>
        </View>
      </View>

      {/* Deposit Amount (if applicable) */}
      {service.depositAmount > 0 && (
        <View className="mb-4 flex-row items-center">
          <MaterialIcons name="account-balance-wallet" size={16} color="#9CA3AF" />
          <Text className="ml-1 font-inter text-xs text-gray-500">
            Deposit: {formatCurrency(service.depositAmount)}
          </Text>
        </View>
      )}

      {/* Book Now Button (optional) */}
      {showBookButton && (
        <TouchableOpacity
          onPress={(e) => {
            e.stopPropagation(); // Prevent card press when button is clicked
            onBookPress?.();
          }}
          className="btn-primary mt-2"
        >
          <Text className="font-inter text-base font-semibold text-white">
            Book Now
          </Text>
        </TouchableOpacity>
      )}
    </TouchableOpacity>
  );
};

export default ServiceCard;
