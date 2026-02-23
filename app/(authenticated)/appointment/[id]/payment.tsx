import React, { useState, useMemo, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Alert,
  SafeAreaView,
} from 'react-native';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useGetAppointment, useConfirmAppointment } from '@/tanstack/useAppointments';
import { useServicePayment } from '@/tanstack/usePayments';
import { formatCurrency } from '@/utils/paymentUtils';
import { isAppointmentPending } from '@/utils/appointmentUtils';

/**
 * Appointment Payment Screen
 * Handles both booking fee (pending status) and remaining balance (confirmed status) payments.
 */
const AppointmentPaymentScreen = () => {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  
  const [method, setMethod] = useState<'mpesa' | 'paystack' | null>(null);
  const [phone, setPhone] = useState('');

  // Fetch appointment details to know what we are paying for
  const { data: appointment, isLoading: isLoadingAppointment } = useGetAppointment(id!);
  
  // Mutations
  const confirmMutation = useConfirmAppointment();
  const servicePaymentMutation = useServicePayment();

  const isPending = isAppointmentPending(appointment);
  const amountToPay = isPending ? appointment?.bookingFeeAmount : appointment?.remainingAmount;

  /**
   * Handles the payment submission
   */
  const handlePayment = useCallback(async () => {
    if (!method) return Alert.alert('Required', 'Please select a payment method');
    if (method === 'mpesa' && !phone) return Alert.alert('Required', 'Please enter your M-Pesa phone number');

    try {
      if (isPending) {
        // Confirming a pending appointment (booking fee)
        const result = await confirmMutation.mutateAsync({
          appointmentId: id!,
          paymentData: {
            method: method.toUpperCase() as 'MPESA' | 'PAYSTACK',
            phone: phone,
          },
        });
        
        const paymentId = result.payment?._id || result.paymentId;
        const checkoutId = result.gateway?.checkoutRequestId || result.checkoutRequestId;
        
        router.push({
          pathname: '/(authenticated)/payments/status',
          params: { paymentId, checkoutId }
        });
      } else {
        // Paying remaining balance for a confirmed appointment
        const result = await servicePaymentMutation.mutateAsync({
          appointmentId: id!,
          method: method.toUpperCase() as 'MPESA' | 'PAYSTACK',
          phone: phone,
          amount: amountToPay!,
        });
        
        const paymentId = result.payment?._id || result.paymentId;
        const checkoutId = result.gateway?.checkoutRequestId || result.checkoutRequestId;
        
        router.push({
          pathname: '/(authenticated)/payments/status',
          params: { paymentId, checkoutId }
        });
      }
    } catch (error) {
      // Error handled by mutation
    }
  }, [id, method, phone, isPending, amountToPay, confirmMutation, servicePaymentMutation, router]);

  if (isLoadingAppointment) {
    return (
      <View className="flex-1 items-center justify-center bg-white">
        <ActivityIndicator size="large" color="#D4AF37" />
      </View>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-white">
      <Stack.Screen
        options={{
          title: isPending ? 'Confirm Appointment' : 'Finish Payment',
          headerShown: true,
        }}
      />
      
      <ScrollView className="flex-1 p-4">
        <View className="mb-8">
          <Text className="text-2xl font-bold text-gray-900">
            {isPending ? 'Pay Booking Fee' : 'Pay Remaining Balance'}
          </Text>
          <Text className="mt-2 text-gray-500">
            Select your preferred payment method below to complete the transaction.
          </Text>
        </View>

        {/* Amount Summary */}
        <View className="mb-8 rounded-2xl bg-brand-tint p-6 border border-brand-primary/20 items-center">
          <Text className="text-sm font-bold uppercase tracking-wider text-brand-primary">Total to Pay</Text>
          <Text className="mt-1 text-4xl font-inter font-bold text-gray-900">
            {formatCurrency(amountToPay)}
          </Text>
        </View>

        {/* Method Selection */}
        <Text className="text-sm font-bold uppercase tracking-wider text-gray-400 mb-4 px-1">Payment Method</Text>
        
        <TouchableOpacity
          onPress={() => setMethod('mpesa')}
          className={`mb-4 flex-row items-center p-4 rounded-2xl border ${
            method === 'mpesa' ? 'border-brand-primary bg-brand-tint/30' : 'border-gray-100 bg-white'
          }`}
        >
          <View className="h-10 w-10 rounded-full bg-green-500 items-center justify-center">
            <MaterialIcons name="phone-android" size={20} color="white" />
          </View>
          <View className="ml-4 flex-1">
            <Text className="text-lg font-bold text-gray-900">M-Pesa</Text>
            <Text className="text-xs text-gray-500">Instant mobile money payment</Text>
          </View>
          {method === 'mpesa' && (
            <MaterialIcons name="check-circle" size={24} color="#D4AF37" />
          )}
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => setMethod('paystack')}
          className={`mb-8 flex-row items-center p-4 rounded-2xl border ${
            method === 'paystack' ? 'border-brand-primary bg-brand-tint/30' : 'border-gray-100 bg-white'
          }`}
        >
          <View className="h-10 w-10 rounded-full bg-blue-500 items-center justify-center">
            <MaterialIcons name="credit-card" size={20} color="white" />
          </View>
          <View className="ml-4 flex-1">
            <Text className="text-lg font-bold text-gray-900">Card / Other</Text>
            <Text className="text-xs text-gray-500">Secure payment via Paystack</Text>
          </View>
          {method === 'paystack' && (
            <MaterialIcons name="check-circle" size={24} color="#D4AF37" />
          )}
        </TouchableOpacity>

        {/* Conditional Phone Input */}
        {method === 'mpesa' && (
          <View className="auth-field mb-8">
            <Text className="label">M-Pesa Phone Number</Text>
            <TextInput
              value={phone}
              onChangeText={setPhone}
              keyboardType="phone-pad"
              placeholder="e.g. 0712345678"
              className="input"
            />
            <Text className="mt-2 text-[10px] text-gray-400 italic">
              Enter the number that will receive the STK push prompt.
            </Text>
          </View>
        )}
      </ScrollView>

      {/* Footer Button */}
      <View className="p-4 border-t border-gray-100 bg-white">
        <TouchableOpacity
          onPress={handlePayment}
          disabled={confirmMutation.isPending || servicePaymentMutation.isPending || !method}
          className={`btn-primary w-full ${!method ? 'opacity-50' : ''}`}
        >
          {confirmMutation.isPending || servicePaymentMutation.isPending ? (
            <ActivityIndicator color="white" />
          ) : (
            <Text className="text-white font-bold text-lg">Pay {formatCurrency(amountToPay)}</Text>
          )}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

export default AppointmentPaymentScreen;
