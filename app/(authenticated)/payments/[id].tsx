import React, { useMemo } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  SafeAreaView,
} from 'react-native';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useGetPaymentById } from '@/tanstack/usePayments';
import {
  formatPaymentStatus,
  getPaymentStatusVariant,
  formatPaymentMethod,
  formatCurrency,
} from '@/utils/paymentUtils';
import { formatDateTimeWithTime } from '@/utils/notificationUtils';
import type { IPayment } from '@/types/api.types';

/**
 * Payment Details Screen
 * Displays exhaustive information about a single payment transaction.
 */
const PaymentDetailsScreen = () => {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();

  // Fetch payment details using TanStack Query
  const { data: payment, isLoading, isError, refetch } = useGetPaymentById(id!);

  if (isLoading) {
    return (
      <View className="flex-1 items-center justify-center bg-white">
        <ActivityIndicator size="large" color="#D4AF37" />
      </View>
    );
  }

  if (isError || !payment) {
    return (
      <View className="flex-1 items-center justify-center p-6 bg-white">
        <MaterialIcons name="error-outline" size={64} color="#EF4444" />
        <Text className="mt-4 text-lg font-bold text-gray-900 text-center">
          Failed to load payment details
        </Text>
        <TouchableOpacity
          onPress={() => router.back()}
          className="mt-6 btn-primary px-8"
        >
          <Text className="text-white">Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const statusVariant = getPaymentStatusVariant(payment.status);

  return (
    <SafeAreaView className="flex-1 bg-white">
      <Stack.Screen
        options={{
          title: 'Payment Details',
          headerShown: true,
        }}
      />
      
      <ScrollView className="flex-1">
        <View className="p-4">
          {/* Header Card */}
          <View className="mb-6 rounded-3xl bg-gray-50 p-6 border border-gray-100 items-center">
            <View className={`badge ${statusVariant} mb-4`}>
              <Text className="text-xs font-bold uppercase tracking-widest">
                {formatPaymentStatus(payment.status)}
              </Text>
            </View>
            
            <Text className="text-sm font-mono text-gray-400 mb-1">Transaction ID: {payment.paymentNumber}</Text>
            <Text className="text-4xl font-bold text-gray-900">
              {formatCurrency(payment.amount, payment.currency)}
            </Text>
            <Text className="mt-2 text-sm text-gray-500">
              Via {formatPaymentMethod(payment.method)}
            </Text>
          </View>

          {/* Details Section */}
          <View className="mb-6">
            <Text className="text-sm font-bold uppercase tracking-wider text-gray-400 mb-3 px-1">Details</Text>
            <View className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
              <View className="space-y-4">
                <View className="flex-row justify-between py-2 border-b border-gray-50">
                  <Text className="text-gray-500">Payment Type</Text>
                  <Text className="font-bold text-gray-900 capitalize">{payment.type.replace('_', ' ').toLowerCase()}</Text>
                </View>

                <View className="flex-row justify-between py-2 border-b border-gray-50">
                  <Text className="text-gray-500">Date & Time</Text>
                  <Text className="font-bold text-gray-900">{formatDateTimeWithTime(payment.createdAt)}</Text>
                </View>

                <View className="flex-row justify-between py-2">
                  <Text className="text-gray-500">Currency</Text>
                  <Text className="font-bold text-gray-900">{payment.currency}</Text>
                </View>
              </View>
            </View>
          </View>

          {/* Processor References */}
          {payment.processorRefs && (
            <View className="mb-6">
              <Text className="text-sm font-bold uppercase tracking-wider text-gray-400 mb-3 px-1">Processor Info</Text>
              <View className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
                {payment.processorRefs.daraja && (
                  <View>
                    <Text className="text-[10px] font-bold text-brand-primary uppercase mb-2">M-Pesa / Daraja</Text>
                    <View className="space-y-2">
                      <View className="flex-row justify-between">
                        <Text className="text-xs text-gray-500">Checkout ID</Text>
                        <Text className="text-xs font-mono text-gray-700">{payment.processorRefs.daraja.checkoutRequestId || 'N/A'}</Text>
                      </View>
                      <View className="flex-row justify-between mt-2">
                        <Text className="text-xs text-gray-500">Merchant ID</Text>
                        <Text className="text-xs font-mono text-gray-700">{payment.processorRefs.daraja.merchantRequestId || 'N/A'}</Text>
                      </View>
                    </View>
                  </View>
                )}

                {payment.processorRefs.paystack && (
                  <View>
                    <Text className="text-[10px] font-bold text-blue-500 uppercase mb-2">Paystack</Text>
                    <View className="flex-row justify-between">
                      <Text className="text-xs text-gray-500">Reference</Text>
                      <Text className="text-xs font-mono text-gray-700">{payment.processorRefs.paystack.reference || 'N/A'}</Text>
                    </View>
                  </View>
                )}
              </View>
            </View>
          )}

          {/* Appointment Link */}
          {payment.appointmentId && (
            <TouchableOpacity
              onPress={() => router.push(`/(authenticated)/appointment/${typeof payment.appointmentId === 'string' ? payment.appointmentId : payment.appointmentId._id}`)}
              className="mb-8 flex-row items-center justify-between p-5 rounded-2xl bg-brand-tint border border-brand-primary/20"
            >
              <View className="flex-row items-center">
                <View className="h-10 w-10 rounded-full bg-brand-primary items-center justify-center">
                  <MaterialIcons name="event-note" size={20} color="white" />
                </View>
                <View className="ml-3">
                  <Text className="text-sm font-bold text-gray-900">View Related Appointment</Text>
                  <Text className="text-xs text-brand-primary">Check details and schedule</Text>
                </View>
              </View>
              <MaterialIcons name="chevron-right" size={24} color="#D4AF37" />
            </TouchableOpacity>
          )}
        </View>
      </ScrollView>

      {/* Footer Action */}
      <View className="p-4 border-t border-gray-100 bg-white">
        <TouchableOpacity
          onPress={() => router.push('/(authenticated)/payments')}
          className="btn-secondary w-full"
        >
          <Text className="text-gray-700 font-bold">Back to History</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

export default PaymentDetailsScreen;
