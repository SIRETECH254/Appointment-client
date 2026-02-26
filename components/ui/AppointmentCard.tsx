// appointment-client/components/ui/AppointmentCard.tsx
/**
 * AppointmentCard Component
 * 
 * Displays an appointment card with appointment details including services,
 * date/time, staff, status, and total amount. Used in appointment listing pages.
 * 
 * @component
 */

import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { IAppointment } from '@/types/api.types';
import {
  formatAppointmentDateTime,
} from '@/utils/appointmentUtils';
import { formatCurrency } from '@/utils/paymentUtils';
import StatusBadge from '@/components/ui/StatusBadge';

interface AppointmentCardProps {
  appointment: IAppointment;
  onPress?: () => void;
}

/**
 * AppointmentCard component for displaying appointment information in a card format.
 * 
 * @param appointment - The appointment object containing all appointment details
 * @param onPress - Optional callback when the card is pressed (defaults to navigation)
 */
const AppointmentCard: React.FC<AppointmentCardProps> = ({ 
  appointment, 
  onPress 
}) => {
  const router = useRouter();

  const handlePress = () => {
    if (onPress) {
      onPress();
    } else {
      router.push(`/(authenticated)/appointment/${appointment._id}`);
    }
  };

  return (
    <TouchableOpacity
      onPress={handlePress}
      activeOpacity={0.7}
      className="mb-4 rounded-2xl border border-brand-tint bg-white p-4 shadow-sm"
    >
      <View className="flex-row items-start justify-between">
        <View className="flex-1">
          {/* Text: Service names - displays the list of services for this appointment */}
          <Text className="text-lg font-bold text-gray-900" numberOfLines={1}>
            {appointment.services.map(s => s.name).join(', ')}
          </Text>
          
          {/* View: Appointment date and time - displays when the appointment is scheduled */}
          <View className="mt-2 flex-row items-center">
            <MaterialIcons name="event" size={16} color="#6B7280" />
            <Text className="ml-1 font-inter text-sm text-gray-600">
              {formatAppointmentDateTime(appointment.startTime)}
            </Text>
          </View>

          {/* View: Booked date - displays when the appointment was originally booked */}
          <View className="mt-1 flex-row items-center">
            <MaterialIcons name="access-time" size={16} color="#9CA3AF" />
            <Text className="ml-1 font-inter text-xs text-gray-400">
              Booked on: {formatAppointmentDateTime(appointment.createdAt)}
            </Text>
          </View>

          {/* View: Staff member - displays the assigned staff member for this appointment */}
          <View className="mt-1 flex-row items-center">
            <MaterialIcons name="person-outline" size={16} color="#6B7280" />
            <Text className="ml-1 font-inter text-sm text-gray-600">
              Staff: {typeof appointment.staffId === 'object' 
                ? `${appointment.staffId.firstName} ${appointment.staffId.lastName}` 
                : appointment.staffId}
            </Text>
          </View>
        </View>

        {/* StatusBadge: Appointment status - displays the current status (Pending, Confirmed, Completed, etc.) */}
        <StatusBadge 
          status={appointment.status || ''} 
          type="appointment"
          className="ml-2"
        />
      </View>

      {/* View: Payment footer - displays the total amount and navigation chevron */}
      <View className="mt-4 flex-row items-center justify-between border-t border-gray-50 pt-3">
        <View>
          {/* Text: Total amount label */}
          <Text className="text-[10px] uppercase tracking-wider text-gray-400">Total Amount</Text>
          {/* Text: Total amount value - displays the sum of booking fee and remaining amount */}
          <Text className="font-inter text-base font-bold text-brand-primary">
            {formatCurrency(appointment.remainingAmount + appointment.bookingFeeAmount)}
          </Text>
        </View>
        
        {/* MaterialIcons: Navigation chevron - indicates the card is clickable */}
        <MaterialIcons name="chevron-right" size={24} color="#D1D5DB" />
      </View>
    </TouchableOpacity>
  );
};

export default AppointmentCard;
