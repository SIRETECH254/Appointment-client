import React, { useState, useCallback, useMemo } from 'react';
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
import { useRouter, Stack } from 'expo-router';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useGetAllServices } from '@/tanstack/useServices';
import { useInitiatePayment } from '@/tanstack/usePayments';
import { formatCurrency } from '@/utils/paymentUtils';
import type { IService } from '@/types/api.types';

/**
 * Quick Service Payment Screen
 * Allows users to pay for services directly without creating an appointment.
 * This is useful for walk-in customers or immediate payments.
 */
const ServicePaymentScreen = () => {
  const router = useRouter();
  
  // Selection State
  const [selectedServices, setSelectedServices] = useState<string[]>([]);
  const [method, setMethod] = useState<'MPESA' | 'PAYSTACK' | null>(null);
  const [phone, setPhone] = useState('');

  // Queries
  const { data: servicesData, isLoading: isLoadingServices } = useGetAllServices({ status: 'active' });
  const allServices: IService[] = useMemo(() => servicesData?.services || [], [servicesData]);

  // Mutations
  const initiateMutation = useInitiatePayment();

  /**
   * Toggle service selection
   */
  const toggleService = useCallback((serviceId: string) => {
    setSelectedServices(prev => 
      prev.includes(serviceId) 
        ? prev.filter(id => id !== serviceId)
        : [...prev, serviceId]
    );
  }, []);

  /**
   * Calculate totals
   */
  const totalAmount = useMemo(() => {
    return selectedServices.reduce((sum, id) => {
      const service = allServices.find(s => s._id === id);
      return sum + (service?.fullPrice || 0);
    }, 0);
  }, [selectedServices, allServices]);

  /**
   * Handle Payment Submission
   */
  const handlePayment = useCallback(async () => {
    if (selectedServices.length === 0) return Alert.alert('Required', 'Please select at least one service');
    if (!method) return Alert.alert('Required', 'Please select a payment method');
    if (method === 'MPESA' && !phone) return Alert.alert('Required', 'Please enter your M-Pesa phone number');

    try {
      const result = await initiateMutation.mutateAsync({
        appointmentId: 'SERVICE_PAYMENT', // Backend convention for non-appointment payments if allowed, else use dedicated payload
        method: method,
        phone: phone,
        services: selectedServices
      });
      
      // Success handling - navigate to status tracking
      const paymentId = result.payment?._id || result.paymentId;
      const checkoutId = result.gateway?.checkoutRequestId || result.checkoutRequestId;
      
      router.push({
        pathname: '/(authenticated)/payments/status',
        params: { paymentId, checkoutId }
      });
    } catch {
      // Error handled by mutation
    }
  }, [selectedServices, method, phone, initiateMutation, router]);

  return (
    <SafeAreaView className="flex-1 bg-white">
      <Stack.Screen
        options={{
          title: 'Quick Payment',
          headerShown: true,
        }}
      />
      
      <ScrollView className="flex-1">
        <View className="p-4">
          <View className="mb-6">
            <Text className="text-2xl font-bold text-gray-900">Service Payment</Text>
            <Text className="text-gray-500 mt-1">Pay for services instantly without an appointment.</Text>
          </View>

          {/* Service Selection */}
          <Text className="text-sm font-bold uppercase tracking-wider text-gray-400 mb-3 px-1">Select Services</Text>
          {isLoadingServices ? (
            <ActivityIndicator color="#D4AF37" />
          ) : (
            allServices.map((service) => (
              <TouchableOpacity
                key={service._id}
                onPress={() => toggleService(service._id)}
                className={`mb-3 flex-row items-center p-4 rounded-2xl border ${
                  selectedServices.includes(service._id) ? 'border-brand-primary bg-brand-tint/30' : 'border-gray-100 bg-white'
                } shadow-sm`}
              >
                <View className="flex-1">
                  <Text className="text-base font-bold text-gray-900">{service.name}</Text>
                  <Text className="text-xs text-gray-500">{service.duration} mins</Text>
                </View>
                <View className="items-end">
                  <Text className="font-bold text-gray-900">{formatCurrency(service.fullPrice)}</Text>
                  {selectedServices.includes(service._id) && (
                    <MaterialIcons name="check-circle" size={20} color="#D4AF37" className="mt-1" />
                  )}
                </View>
              </TouchableOpacity>
            ))
          )}

          {/* Amount Summary */}
          <View className="mt-4 mb-8 rounded-2xl bg-gray-900 p-6 items-center shadow-lg">
            <Text className="text-xs font-bold uppercase tracking-widest text-gray-400">Total to Pay</Text>
            <Text className="mt-1 text-4xl font-bold text-white">
              {formatCurrency(totalAmount)}
            </Text>
          </View>

          {/* Method Selection */}
          <Text className="text-sm font-bold uppercase tracking-wider text-gray-400 mb-3 px-1">Payment Method</Text>
          <View className="flex-row gap-3 mb-6">
            <TouchableOpacity
              onPress={() => setMethod('MPESA')}
              className={`flex-1 items-center p-4 rounded-2xl border ${
                method === 'MPESA' ? 'border-brand-primary bg-brand-tint/30' : 'border-gray-100 bg-white'
              }`}
            >
              <MaterialIcons name="phone-android" size={24} color={method === 'MPESA' ? '#D4AF37' : '#9CA3AF'} />
              <Text className={`mt-2 font-bold ${method === 'MPESA' ? 'text-brand-primary' : 'text-gray-500'}`}>M-Pesa</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => setMethod('PAYSTACK')}
              className={`flex-1 items-center p-4 rounded-2xl border ${
                method === 'PAYSTACK' ? 'border-brand-primary bg-brand-tint/30' : 'border-gray-100 bg-white'
              }`}
            >
              <MaterialIcons name="credit-card" size={24} color={method === 'PAYSTACK' ? '#D4AF37' : '#9CA3AF'} />
              <Text className={`mt-2 font-bold ${method === 'PAYSTACK' ? 'text-brand-primary' : 'text-gray-500'}`}>Card</Text>
            </TouchableOpacity>
          </View>

          {/* Phone Input for M-Pesa */}
          {method === 'MPESA' && (
            <View className="auth-field mb-8">
              <Text className="label">M-Pesa Phone Number</Text>
              <TextInput
                value={phone}
                onChangeText={setPhone}
                keyboardType="phone-pad"
                placeholder="e.g. 0712345678"
                className="input"
              />
            </View>
          )}
        </View>
      </ScrollView>

      {/* Footer Action */}
      <View className="p-4 border-t border-gray-100 bg-white">
        <TouchableOpacity
          onPress={handlePayment}
          disabled={initiateMutation.isPending || selectedServices.length === 0 || !method}
          className={`btn-primary w-full ${(!method || selectedServices.length === 0) ? 'opacity-50' : ''}`}
        >
          {initiateMutation.isPending ? (
            <ActivityIndicator color="white" />
          ) : (
            <Text className="text-white font-bold text-lg">Confirm & Pay {formatCurrency(totalAmount)}</Text>
          )}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

export default ServicePaymentScreen;
