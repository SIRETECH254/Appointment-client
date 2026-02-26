// appointment-client/components/ui/StatusBadge.tsx
/**
 * StatusBadge Component
 * 
 * A reusable badge component that displays status with icons and proper
 * text/background color management for visibility. Used across appointments,
 * payments, and contacts for consistent badge styling.
 * 
 * @component
 */

import React from 'react';
import { View, Text } from 'react-native';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';

export type BadgeType = 'appointment' | 'payment' | 'contact' | 'notification-category' | 'notification-type';

interface StatusBadgeProps {
  status: string;
  type: BadgeType;
  className?: string;
}

/**
 * StatusBadge component for displaying status badges with icons
 * 
 * @param status - The status string (e.g., 'PENDING', 'CONFIRMED', 'NEW', 'SUCCESS')
 * @param type - The type of badge ('appointment', 'payment', or 'contact')
 * @param className - Optional additional className
 */
const StatusBadge: React.FC<StatusBadgeProps> = ({ 
  status, 
  type,
  className = '' 
}) => {
  // Get icon name based on status
  const getIcon = (status: string, type: BadgeType): string => {
    const upperStatus = status.toUpperCase();
    
    if (type === 'appointment') {
      switch (upperStatus) {
        case 'PENDING':
          return 'schedule';
        case 'CONFIRMED':
          return 'check-circle';
        case 'COMPLETED':
          return 'done-all';
        case 'CANCELLED':
        case 'NO_SHOW':
          return 'cancel';
        default:
          return 'help-outline';
      }
    }
    
    if (type === 'payment') {
      switch (upperStatus) {
        case 'SUCCESS':
        case 'COMPLETED':
          return 'check-circle';
        case 'PENDING':
        case 'PROCESSING':
          return 'schedule';
        case 'FAILED':
        case 'CANCELLED':
          return 'error';
        default:
          return 'help-outline';
      }
    }
    
    if (type === 'contact') {
      switch (upperStatus) {
        case 'NEW':
          return 'new-releases';
        case 'READ':
          return 'drafts';
        case 'REPLIED':
          return 'reply';
        case 'ARCHIVED':
          return 'archive';
        default:
          return 'help-outline';
      }
    }
    
    if (type === 'notification-category') {
      switch (upperStatus) {
        case 'APPOINTMENT':
          return 'event';
        case 'PAYMENT':
          return 'payment';
        case 'SYSTEM':
          return 'settings';
        case 'PROMOTIONAL':
          return 'campaign';
        case 'GENERAL':
          return 'notifications';
        default:
          return 'notifications';
      }
    }
    
    if (type === 'notification-type') {
      switch (upperStatus) {
        case 'EMAIL':
          return 'email';
        case 'SMS':
          return 'sms';
        case 'PUSH':
          return 'notifications';
        case 'IN_APP':
          return 'info-outline';
        default:
          return 'info-outline';
      }
    }
    
    return 'help-outline';
  };

  // Get status variant (background and text colors) based on status and type
  const getStatusVariant = (status: string, type: BadgeType) => {
    const upperStatus = status.toUpperCase();
    
    if (type === 'appointment') {
      switch (upperStatus) {
        case 'PENDING':
          return {
            bg: 'bg-yellow-100',
            text: 'text-yellow-700',
            iconColor: '#B45309', // yellow-700
          };
        case 'CONFIRMED':
          return {
            bg: 'bg-green-100',
            text: 'text-green-700',
            iconColor: '#15803D', // green-700
          };
        case 'COMPLETED':
          return {
            bg: 'bg-blue-100',
            text: 'text-blue-700',
            iconColor: '#1D4ED8', // blue-700
          };
        case 'CANCELLED':
        case 'NO_SHOW':
          return {
            bg: 'bg-red-100',
            text: 'text-red-700',
            iconColor: '#B91C1C', // red-700
          };
        default:
          return {
            bg: 'bg-gray-100',
            text: 'text-gray-700',
            iconColor: '#374151', // gray-700
          };
      }
    }
    
    if (type === 'payment') {
      switch (upperStatus) {
        case 'SUCCESS':
        case 'COMPLETED':
          return {
            bg: 'bg-green-100',
            text: 'text-green-700',
            iconColor: '#15803D', // green-700
          };
        case 'PENDING':
        case 'PROCESSING':
          return {
            bg: 'bg-yellow-100',
            text: 'text-yellow-700',
            iconColor: '#B45309', // yellow-700
          };
        case 'FAILED':
        case 'CANCELLED':
          return {
            bg: 'bg-red-100',
            text: 'text-red-700',
            iconColor: '#B91C1C', // red-700
          };
        default:
          return {
            bg: 'bg-gray-100',
            text: 'text-gray-700',
            iconColor: '#374151', // gray-700
          };
      }
    }
    
    if (type === 'contact') {
      switch (upperStatus) {
        case 'NEW':
          return {
            bg: 'bg-blue-100',
            text: 'text-blue-700',
            iconColor: '#1D4ED8', // blue-700
          };
        case 'READ':
          return {
            bg: 'bg-gray-100',
            text: 'text-gray-700',
            iconColor: '#374151', // gray-700
          };
        case 'REPLIED':
          return {
            bg: 'bg-green-100',
            text: 'text-green-700',
            iconColor: '#15803D', // green-700
          };
        case 'ARCHIVED':
          return {
            bg: 'bg-orange-100',
            text: 'text-orange-700',
            iconColor: '#C2410C', // orange-700
          };
        default:
          return {
            bg: 'bg-gray-100',
            text: 'text-gray-700',
            iconColor: '#374151', // gray-700
          };
      }
    }
    
    if (type === 'notification-category') {
      switch (upperStatus) {
        case 'APPOINTMENT':
          return {
            bg: 'bg-amber-100',
            text: 'text-amber-700',
            iconColor: '#D97706', // amber-600
          };
        case 'PAYMENT':
          return {
            bg: 'bg-orange-100',
            text: 'text-orange-700',
            iconColor: '#EA580C', // orange-600
          };
        case 'SYSTEM':
          return {
            bg: 'bg-teal-100',
            text: 'text-teal-700',
            iconColor: '#0D9488', // teal-600
          };
        case 'PROMOTIONAL':
          return {
            bg: 'bg-yellow-100',
            text: 'text-yellow-700',
            iconColor: '#D4AF37', // gold
          };
        case 'GENERAL':
          return {
            bg: 'bg-amber-100',
            text: 'text-amber-700',
            iconColor: '#D97706', // amber-600
          };
        default:
          return {
            bg: 'bg-gray-100',
            text: 'text-gray-700',
            iconColor: '#374151', // gray-700
          };
      }
    }
    
    if (type === 'notification-type') {
      return {
        bg: 'bg-slate-100',
        text: 'text-slate-700',
        iconColor: '#475569', // slate-600
      };
    }
    
    return {
      bg: 'bg-gray-100',
      text: 'text-gray-700',
      iconColor: '#374151',
    };
  };

  // Format status text for display
  const formatStatus = (status: string, badgeType: BadgeType): string => {
    // For notification types, use special formatting
    if (badgeType === 'notification-type') {
      const upperStatus = status.toUpperCase();
      switch (upperStatus) {
        case 'IN_APP':
          return 'In-App';
        case 'EMAIL':
          return 'Email';
        case 'SMS':
          return 'SMS';
        case 'PUSH':
          return 'Push';
        default:
          return status.charAt(0).toUpperCase() + status.slice(1).toLowerCase().replace(/_/g, ' ');
      }
    }
    // Replace all underscores with spaces
    return status.charAt(0).toUpperCase() + status.slice(1).toLowerCase().replace(/_/g, ' ');
  };

  const variant = getStatusVariant(status, type);
  const iconName = getIcon(status, type);

  return (
    <View className={`rounded-full px-2 py-1 flex-row items-center gap-1 ${variant.bg} ${variant.text} ${className}`}>
      <MaterialIcons name={iconName as any} size={10} color={variant.iconColor} />
      <Text className={`text-[10px] font-semibold uppercase ${variant.text}`}>
        {formatStatus(status, type)}
      </Text>
    </View>
  );
};

export default StatusBadge;
