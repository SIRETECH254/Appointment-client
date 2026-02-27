import React, { useState, useCallback, useMemo, useEffect } from 'react';
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
import Toast from 'react-native-toast-message';
import { useGetAllServices } from '@/tanstack/useServices';
import { useInitiatePayment } from '@/tanstack/usePayments';
import { formatCurrency, normalizePhoneNumber, validateEmail } from '@/utils/paymentUtils';
import { useAuth } from '@/contexts/AuthContext';
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
  const [email, setEmail] = useState('');
  const [phoneError, setPhoneError] = useState<string>('');
  const [emailError, setEmailError] = useState<string>('');

  // Get user data for autofill (only when authenticated)
  const { user, isAuthenticated } = useAuth();

  // Queries
  const { data: servicesData, isLoading: isLoadingServices } = useGetAllServices({ status: 'active' });

  // Autofill phone and email from user profile when authenticated
  useEffect(() => {
    if (isAuthenticated && user) {
      if (user.phone && !phone) {
        setPhone(user.phone);
      }
      if (user.email && !email) {
        setEmail(user.email);
      }
    }
  }, [isAuthenticated, user]);
  
  /**
   * Extract services array from the response
   * The API may return { services: IService[] } or IService[] directly
   * This handles both cases safely
   */
  const allServices: IService[] = useMemo(() => {
    if (!servicesData) return [];
    
    // Check if data is an array directly
    if (Array.isArray(servicesData)) {
      return servicesData;
    }
    
    // Check if data has a services property
    if (servicesData && typeof servicesData === 'object' && 'services' in servicesData) {
      return (servicesData as any).services || [];
    }
    
    return [];
  }, [servicesData]);

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
    // Clear previous errors
    setPhoneError('');
    setEmailError('');

    if (selectedServices.length === 0) {
      return Alert.alert('Required', 'Please select at least one service');
    }
    if (!method) {
      return Alert.alert('Required', 'Please select a payment method');
    }

    // Validate based on method
    if (method === 'MPESA') {
      if (!phone) {
        setPhoneError('Phone number is required');
        return;
      }
      const phoneValidation = normalizePhoneNumber(phone);
      if (!phoneValidation.isValid) {
        setPhoneError(phoneValidation.error || 'Invalid phone number');
        return;
      }
    } else if (method === 'PAYSTACK') {
      if (!email) {
        setEmailError('Email is required');
        return;
      }
      const emailValidation = validateEmail(email);
      if (!emailValidation.isValid) {
        setEmailError(emailValidation.error || 'Invalid email address');
        return;
      }
    }

    try {
      const payload: any = {
        appointmentId: 'SERVICE_PAYMENT', // Backend convention for non-appointment payments if allowed, else use dedicated payload
        method: method,
        services: selectedServices
      };

      let phoneValidation: any = null;
      if (method === 'MPESA') {
        phoneValidation = normalizePhoneNumber(phone);
        payload.phone = phoneValidation.normalized;
      } else {
        const emailValidation = validateEmail(email);
        payload.email = emailValidation.normalized;
      }

      const result = await initiateMutation.mutateAsync(payload);
      
      // Show toast notification based on payment method
      if (method === 'MPESA' && phoneValidation) {
        const phoneDisplay = phoneValidation.normalized.replace(/^254/, '0'); // Format for display
        Toast.show({
          type: 'success',
          text1: 'STK Sent!',
          text2: `STK sent to your Phone number ${phoneDisplay}`,
          position: 'top',
        });
      } else {
        Toast.show({
          type: 'success',
          text1: 'Success!',
          text2: 'Payment initiated successfully',
          position: 'top',
        });
      }
      
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
  }, [selectedServices, method, phone, email, initiateMutation, router]);

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
              onPress={() => {
                setMethod('MPESA');
                setPhoneError('');
                setEmailError('');
              }}
              className={`flex-1 items-center p-4 rounded-2xl border ${
                method === 'MPESA' ? 'border-brand-primary bg-brand-tint/30' : 'border-gray-100 bg-white'
              }`}
            >
              <MaterialIcons name="phone-android" size={24} color={method === 'MPESA' ? '#D4AF37' : '#9CA3AF'} />
              <Text className={`mt-2 font-bold ${method === 'MPESA' ? 'text-brand-primary' : 'text-gray-500'}`}>M-Pesa</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => {
                setMethod('PAYSTACK');
                setPhoneError('');
                setEmailError('');
              }}
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
                onChangeText={(text) => {
                  setPhone(text);
                  setPhoneError(''); // Clear error when user types
                }}
                keyboardType="phone-pad"
                placeholder="e.g. 0757429010 or 254757429010"
                className="input"
              />
              <Text className="mt-2 text-[10px] text-gray-400 italic">
                Enter the number that will receive the STK push prompt. Formats: 07XXXXXXXX (mobile) or 01XXXXXXXX (landline) or 2547XXXXXXXX / 2541XXXXXXXX with country code
              </Text>
              {phoneError ? (
                <View className="mt-2 p-3 bg-red-50 border border-red-200 rounded-xl">
                  <Text className="text-sm text-red-700 font-medium">{phoneError}</Text>
                </View>
              ) : null}
            </View>
          )}

          {/* Email Input for Paystack */}
          {method === 'PAYSTACK' && (
            <View className="auth-field mb-8">
              <Text className="label">Email Address</Text>
              <TextInput
                value={email}
                onChangeText={(text) => {
                  setEmail(text);
                  setEmailError(''); // Clear error when user types
                }}
                keyboardType="email-address"
                autoCapitalize="none"
                placeholder="e.g. name@example.com"
                className="input"
              />
              <Text className="mt-2 text-[10px] text-gray-400 italic">
                Enter your email address for payment confirmation
              </Text>
              {emailError ? (
                <View className="mt-2 p-3 bg-red-50 border border-red-200 rounded-xl">
                  <Text className="text-sm text-red-700 font-medium">{emailError}</Text>
                </View>
              ) : null}
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
