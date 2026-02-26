import React, { useState, useCallback, useEffect } from 'react';
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
import { formatCurrency, normalizePhoneNumber, validateEmail } from '@/utils/paymentUtils';
import { isAppointmentPending } from '@/utils/appointmentUtils';
import { useAuth } from '@/contexts/AuthContext';

/**
 * Appointment Payment Screen
 * Handles both booking fee (pending status) and remaining balance (confirmed status) payments.
 */
const AppointmentPaymentScreen = () => {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  
  const [method, setMethod] = useState<'mpesa' | 'paystack' | null>(null);
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [phoneError, setPhoneError] = useState<string>('');
  const [emailError, setEmailError] = useState<string>('');

  // Get user data for autofill
  const { user } = useAuth();

  // Fetch appointment details to know what we are paying for
  const { data: appointment, isLoading: isLoadingAppointment } = useGetAppointment(id!);
  
  // Mutations
  const confirmMutation = useConfirmAppointment();
  const servicePaymentMutation = useServicePayment();

  // Autofill phone and email from user profile when available
  useEffect(() => {
    if (user) {
      if (user.phone && !phone) {
        setPhone(user.phone);
      }
      if (user.email && !email) {
        setEmail(user.email);
      }
    }
  }, [user]);

  const isPending = isAppointmentPending(appointment);
  const amountToPay = isPending ? appointment?.bookingFeeAmount : appointment?.remainingAmount;

  /**
   * Handles the payment submission
   */
  const handlePayment = useCallback(async () => {
    // Clear previous errors
    setPhoneError('');
    setEmailError('');

    if (!method) {
      return Alert.alert('Required', 'Please select a payment method');
    }

    // Validate based on method
    if (method === 'mpesa') {
      if (!phone) {
        setPhoneError('Phone number is required');
        return;
      }
      const phoneValidation = normalizePhoneNumber(phone);
      if (!phoneValidation.isValid) {
        setPhoneError(phoneValidation.error || 'Invalid phone number');
        return;
      }
    } else if (method === 'paystack') {
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
      if (isPending) {
        // Confirming a pending appointment (booking fee)
        const payload: any = {
          appointmentId: id!,
          paymentData: {
            method: method.toUpperCase() as 'MPESA' | 'PAYSTACK',
          },
        };

        if (method === 'mpesa') {
          const phoneValidation = normalizePhoneNumber(phone);
          payload.paymentData.phone = phoneValidation.normalized;
        } else {
          const emailValidation = validateEmail(email);
          payload.paymentData.email = emailValidation.normalized;
        }

        const result = await confirmMutation.mutateAsync(payload);
        
        const paymentId = result.payment?._id || result.paymentId;
        const checkoutId = result.gateway?.checkoutRequestId || result.checkoutRequestId;
        
        router.push({
          pathname: '/(authenticated)/payments/status',
          params: { paymentId, checkoutId }
        });
      } else {
        // Paying remaining balance for a confirmed appointment
        const payload: any = {
          appointmentId: id!,
          method: method.toUpperCase() as 'MPESA' | 'PAYSTACK',
          amount: amountToPay!,
        };

        if (method === 'mpesa') {
          const phoneValidation = normalizePhoneNumber(phone);
          payload.phone = phoneValidation.normalized;
        } else {
          const emailValidation = validateEmail(email);
          payload.email = emailValidation.normalized;
        }

        const result = await servicePaymentMutation.mutateAsync(payload);
        
        const paymentId = result.payment?._id || result.paymentId;
        const checkoutId = result.gateway?.checkoutRequestId || result.checkoutRequestId;
        
        router.push({
          pathname: '/(authenticated)/payments/status',
          params: { paymentId, checkoutId }
        });
      }
    } catch {
      // Error handled by mutation
    }
  }, [id, method, phone, email, isPending, amountToPay, confirmMutation, servicePaymentMutation, router]);

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
          onPress={() => {
            setMethod('mpesa');
            setPhoneError('');
            setEmailError('');
          }}
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
          onPress={() => {
            setMethod('paystack');
            setPhoneError('');
            setEmailError('');
          }}
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

        {/* Conditional Email Input */}
        {method === 'paystack' && (
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
