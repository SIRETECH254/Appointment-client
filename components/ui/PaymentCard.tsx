// appointment-client/components/ui/PaymentCard.tsx
/**
 * PaymentCard Component
 * 
 * Displays a payment card with payment details including payment number,
 * amount, date, method, status, and type. Used in payment history listing pages.
 * 
 * @component
 */

import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { IPayment } from '@/types/api.types';
import {
  formatPaymentMethod,
  formatCurrency,
} from '@/utils/paymentUtils';
import { formatDateTimeWithTime } from '@/utils/notificationUtils';
import StatusBadge from '@/components/ui/StatusBadge';

interface PaymentCardProps {
  payment: IPayment;
  onPress?: () => void;
}

/**
 * PaymentCard component for displaying payment information in a card format.
 * 
 * @param payment - The payment object containing all payment details
 * @param onPress - Optional callback when the card is pressed (defaults to navigation)
 */
const PaymentCard: React.FC<PaymentCardProps> = ({ 
  payment, 
  onPress 
}) => {
  const router = useRouter();

  const handlePress = () => {
    if (onPress) {
      onPress();
    } else {
      router.push(`/(authenticated)/payments/${payment._id}`);
    }
  };

  return (
    <TouchableOpacity
      onPress={handlePress}
      activeOpacity={0.7}
      className="mb-4 rounded-2xl border border-gray-100 bg-white p-4 shadow-sm"
    >
      <View className="flex-row items-start justify-between">
        <View className="flex-1">
          {/* View: Payment number with icon */}
          <View className="flex-row items-center mb-1">
            <View className="h-5 w-5 rounded-full bg-amber-100 items-center justify-center mr-2">
              <MaterialIcons name="receipt" size={12} color="#D97706" />
            </View>
            <Text className="text-xs font-mono font-bold text-amber-700 uppercase tracking-widest">
              {payment.paymentNumber}
            </Text>
          </View>
          
          {/* Text: Payment amount */}
          <Text className="mt-1 text-2xl font-bold text-gray-900">
            {formatCurrency(payment.amount, payment.currency)}
          </Text>
          
          {/* View: Date and payment method with icons */}
          <View className="mt-3 flex-row items-center">
            <View className="h-5 w-5 rounded-full bg-orange-100 items-center justify-center">
              <MaterialIcons name="event" size={12} color="#EA580C" />
            </View>
            <Text className="ml-2 text-xs font-medium text-orange-700">
              {formatDateTimeWithTime(payment.createdAt)}
            </Text>
            <View className="mx-2 h-1 w-1 rounded-full bg-gray-300" />
            <View className="h-5 w-5 rounded-full bg-teal-100 items-center justify-center">
              <MaterialIcons name="payment" size={12} color="#0D9488" />
            </View>
            <Text className="ml-2 text-xs font-medium text-teal-700">
              {formatPaymentMethod(payment.method)}
            </Text>
          </View>
        </View>

        <StatusBadge 
          status={payment.status || ''} 
          type="payment"
          className="ml-2"
        />
      </View>

      <View className="mt-4 flex-row items-center justify-between border-t border-gray-50 pt-3">
        <View className="flex-row items-center">
          <View className="h-4 w-4 rounded-full bg-amber-100 items-center justify-center mr-2">
            <MaterialIcons name="category" size={10} color="#D97706" />
          </View>
          <Text className="text-[10px] font-medium text-amber-700">
            Type: {payment.type.replace('_', ' ')}
          </Text>
        </View>
        <MaterialIcons name="chevron-right" size={20} color="#D1D5DB" />
      </View>
    </TouchableOpacity>
  );
};

export default PaymentCard;
