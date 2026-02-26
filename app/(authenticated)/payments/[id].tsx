import React from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
} from 'react-native';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useGetPaymentById } from '@/tanstack/usePayments';
import {
  formatPaymentMethod,
  formatCurrency,
} from '@/utils/paymentUtils';
import StatusBadge from '@/components/ui/StatusBadge';
import { formatDateTimeWithTime } from '@/utils/notificationUtils';

/**
 * Payment Details Screen
 * Displays exhaustive information about a single payment transaction.
 */
const PaymentDetailsScreen = () => {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();

  // Fetch payment details using TanStack Query
  const { data: payment, isLoading, isError } = useGetPaymentById(id!);

  if (isLoading) {
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
            {/* Header Card Skeleton */}
            <View className="mb-6 rounded-3xl bg-gray-50 p-6 border border-gray-100 items-center animate-pulse">
              <View className="h-6 w-20 bg-gray-200 rounded-full mb-4" />
              <View className="h-4 bg-gray-200 rounded w-48 mb-2" />
              <View className="h-12 bg-gray-200 rounded w-40 mb-2" />
              <View className="h-4 bg-gray-200 rounded w-32" />
            </View>

            {/* Details Section Skeleton */}
            <View className="mb-6">
              <View className="h-4 bg-gray-200 rounded w-20 mb-3" />
              <View className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm animate-pulse">
                <View className="space-y-4">
                  <View className="flex-row justify-between py-2 border-b border-gray-50">
                    <View className="h-4 bg-gray-200 rounded w-24" />
                    <View className="h-4 bg-gray-200 rounded w-32" />
                  </View>
                  <View className="flex-row justify-between py-2 border-b border-gray-50">
                    <View className="h-4 bg-gray-200 rounded w-24" />
                    <View className="h-4 bg-gray-200 rounded w-40" />
                  </View>
                  <View className="flex-row justify-between py-2">
                    <View className="h-4 bg-gray-200 rounded w-20" />
                    <View className="h-4 bg-gray-200 rounded w-16" />
                  </View>
                </View>
              </View>
            </View>

            {/* Processor Info Skeleton */}
            <View className="mb-6">
              <View className="h-4 bg-gray-200 rounded w-32 mb-3" />
              <View className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm animate-pulse">
                <View className="h-3 bg-gray-200 rounded w-24 mb-4" />
                <View className="space-y-2">
                  <View className="flex-row justify-between">
                    <View className="h-3 bg-gray-200 rounded w-20" />
                    <View className="h-3 bg-gray-200 rounded w-32" />
                  </View>
                  <View className="flex-row justify-between mt-2">
                    <View className="h-3 bg-gray-200 rounded w-24" />
                    <View className="h-3 bg-gray-200 rounded w-36" />
                  </View>
                </View>
              </View>
            </View>
          </View>
        </ScrollView>

        {/* Footer Skeleton */}
        <View className="p-4 border-t border-gray-100 bg-white animate-pulse">
          <View className="h-12 bg-gray-200 rounded-xl" />
        </View>
      </SafeAreaView>
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
            <StatusBadge 
              status={payment.status || ''} 
              type="payment" 
              className="mb-4"
            />
            
            <View className="flex-row items-center mb-2">
              <View className="h-5 w-5 rounded-full bg-amber-100 items-center justify-center mr-2">
                <MaterialIcons name="receipt" size={14} color="#D97706" />
              </View>
              <Text className="text-sm font-mono text-amber-700 font-semibold">Transaction ID: {payment.paymentNumber}</Text>
            </View>
            
            <View className="flex-row items-center mb-2">
              <MaterialIcons name="attach-money" size={32} color="#D4AF37" />
              <Text className="text-4xl font-bold text-gray-900">
                {formatCurrency(payment.amount, payment.currency)}
              </Text>
            </View>
            
            <View className="flex-row items-center mt-2">
              <View className="h-5 w-5 rounded-full bg-teal-100 items-center justify-center mr-2">
                <MaterialIcons name="payment" size={14} color="#0D9488" />
              </View>
              <Text className="text-sm text-teal-700 font-medium">
                Via {formatPaymentMethod(payment.method)}
              </Text>
            </View>
          </View>

          {/* Details Section */}
          <View className="mb-6">
            <View className="flex-row items-center mb-3 px-1">
              <View className="h-6 w-6 rounded-full bg-teal-100 items-center justify-center mr-2">
                <MaterialIcons name="info" size={16} color="#0D9488" />
              </View>
              <Text className="text-sm font-bold uppercase tracking-wider text-teal-700">Details</Text>
            </View>
            <View className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
              <View className="space-y-4">
                <View className="flex-row justify-between items-center py-2 border-b border-gray-50">
                  <View className="flex-row items-center">
                    <View className="h-6 w-6 rounded-full bg-amber-100 items-center justify-center mr-2">
                      <MaterialIcons name="category" size={14} color="#D97706" />
                    </View>
                    <Text className="text-gray-700 font-medium">Payment Type</Text>
                  </View>
                  <Text className="font-bold text-amber-700 capitalize">{payment.type.replace('_', ' ').toLowerCase()}</Text>
                </View>

                <View className="flex-row justify-between items-center py-2 border-b border-gray-50">
                  <View className="flex-row items-center">
                    <View className="h-6 w-6 rounded-full bg-orange-100 items-center justify-center mr-2">
                      <MaterialIcons name="event" size={14} color="#EA580C" />
                    </View>
                    <Text className="text-gray-700 font-medium">Date & Time</Text>
                  </View>
                  <Text className="font-bold text-orange-700">{formatDateTimeWithTime(payment.createdAt)}</Text>
                </View>

                <View className="flex-row justify-between items-center py-2">
                  <View className="flex-row items-center">
                    <View className="h-6 w-6 rounded-full bg-teal-100 items-center justify-center mr-2">
                      <MaterialIcons name="currency-exchange" size={14} color="#0D9488" />
                    </View>
                    <Text className="text-gray-700 font-medium">Currency</Text>
                  </View>
                  <Text className="font-bold text-teal-700">{payment.currency}</Text>
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
