import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  SafeAreaView,
  ScrollView,
} from 'react-native';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import { io, Socket } from 'socket.io-client';
import { useGetPaymentById, useQueryMpesaStatus } from '@/tanstack/usePayments';
import { API_BASE_URL } from '@/api/config';
import {
  formatCurrency,
  formatPaymentMethod,
} from '@/utils/paymentUtils';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';

// Constants
const FALLBACK_TIMEOUT = 60000; // 60 seconds

/**
 * Payment Status Screen
 * Tracks real-time payment status via WebSockets (Socket.IO).
 * Implements a fallback polling mechanism for M-Pesa payments.
 */
const PaymentStatusScreen = () => {
  const { paymentId, checkoutId } = useLocalSearchParams<{ paymentId: string; checkoutId: string }>();
  const router = useRouter();

  // Local State
  const [socketStatus, setSocketStatus] = useState<string | null>(null);
  const [socketConnected, setSocketConnected] = useState(false);
  const [socketError, setSocketError] = useState<string | null>(null);
  const [isFallbackActive, setIsFallbackActive] = useState(false);

  // Refs
  const socketRef = useRef<Socket | null>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Queries
  const { data: payment, isLoading: isLoadingPayment } = useGetPaymentById(paymentId!);
  
  // Fallback M-Pesa query (Daraja API)
  const { refetch: refetchMpesaStatus } = useQueryMpesaStatus(checkoutId!, { enabled: false });

  /**
   * Cleanup connections and timers
   */
  const clearPaymentTimers = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    if (socketRef.current) {
      socketRef.current.disconnect();
      socketRef.current = null;
    }
  }, []);

  /**
   * Handle M-Pesa specific result codes from Daraja Callback or Fallback Query
   */
  const handleMpesaResultCode = useCallback((resultCode: number | string, resultMessage: string) => {
    clearPaymentTimers();
    // Ensure we handle string codes from API (e.g., "0")
    const code = typeof resultCode === 'string' ? parseInt(resultCode, 10) : resultCode;

    if (code === 0) {
      setSocketStatus('SUCCESS');
    } else if (code === 1032) {
      setSocketStatus('CANCELLED');
      setSocketError('Payment cancelled by user');
    } else if (code === 1) {
      setSocketStatus('FAILED');
      setSocketError('Insufficient balance');
    } else {
      setSocketStatus('FAILED');
      setSocketError(resultMessage || `Transaction failed (Code: ${code})`);
    }
  }, [clearPaymentTimers]);

  /**
   * Start Socket.IO tracking
   */
  const startTracking = useCallback((trackingPaymentId: string, trackingMethod: string) => {
    clearPaymentTimers();

    // Initialize Socket connection
    socketRef.current = io(API_BASE_URL, {
      transports: ['websocket'],
      forceNew: true,
      timeout: 20000,
      reconnection: true,
      reconnectionAttempts: 5,
    });

    socketRef.current.on('connect', () => {
      setSocketConnected(true);
      socketRef.current?.emit('subscribe-to-payment', trackingPaymentId);
    });

    socketRef.current.on('connect_error', (err) => {
      console.error('Socket connection error:', err);
      setSocketConnected(false);
    });

    // M-Pesa callback event (Real-time from Daraja)
    socketRef.current.on('callback.received', (payload: any) => {
      console.log('M-Pesa Callback Received:', payload);
      // Backend payload structure: { CODE: number/string, message: string }
      handleMpesaResultCode(payload.CODE, payload.message);
    });

    // Generic payment update event (from payment status changes)
    socketRef.current.on('payment.updated', (payload: any) => {
      console.log('Payment Updated:', payload);
      if (payload.paymentId === trackingPaymentId) {
        setSocketStatus(payload.status);
        if (payload.status === 'SUCCESS' || payload.status === 'FAILED' || payload.status === 'CANCELLED') {
          clearPaymentTimers();
        }
      }
    });

    // Start fallback timer for M-Pesa
    if (trackingMethod === 'MPESA' && checkoutId) {
      timeoutRef.current = setTimeout(async () => {
        setIsFallbackActive(true);
        try {
          const result = await refetchMpesaStatus();
          // API Response Structure check: result.data contains { payment, status: { ok, resultCode, resultDesc } }
          const fallbackData = result.data;
          if (fallbackData && fallbackData.status) {
            handleMpesaResultCode(fallbackData.status.resultCode, fallbackData.status.resultDesc);
          }
        } catch (error) {
          console.error('Fallback query failed:', error);
        } finally {
          setIsFallbackActive(false);
        }
      }, FALLBACK_TIMEOUT);
    }
  }, [checkoutId, handleMpesaResultCode, refetchMpesaStatus, clearPaymentTimers]);

  // Effect: Start tracking once payment data is available
  useEffect(() => {
    if (payment && payment.status === 'PENDING') {
      startTracking(payment._id, payment.method);
    } else if (payment && payment.status !== 'PENDING') {
      setSocketStatus(payment.status);
    }

    return () => clearPaymentTimers();
  }, [payment, startTracking, clearPaymentTimers]);

  // Derived display status
  const currentStatus = socketStatus || payment?.status || 'PENDING';

  if (isLoadingPayment) {
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
          title: 'Payment Status',
          headerShown: true,
          headerLeft: () => (
            <TouchableOpacity onPress={() => router.replace('/(authenticated)/payments')}>
              <MaterialIcons name="close" size={24} color="black" />
            </TouchableOpacity>
          ),
        }}
      />
      
      <ScrollView className="flex-1">
        <View className="p-6 items-center pt-12">
          {/* Status Icon & Main Message */}
          {currentStatus === 'PENDING' ? (
            <View className="items-center">
              <View className="h-24 w-24 rounded-full bg-brand-tint items-center justify-center mb-6">
                <ActivityIndicator size="large" color="#D4AF37" />
              </View>
              <Text className="text-2xl font-bold text-gray-900 text-center">Processing Payment</Text>
              <Text className="text-gray-500 mt-2 text-center">
                Please wait while we confirm your transaction with {formatPaymentMethod(payment?.method)}.
              </Text>
              <Text className="text-[10px] text-gray-400 mt-4 italic">Do not close this screen or navigate away.</Text>
            </View>
          ) : currentStatus === 'SUCCESS' ? (
            <View className="items-center">
              <View className="h-24 w-24 rounded-full bg-emerald-100 items-center justify-center mb-6">
                <MaterialIcons name="check-circle" size={64} color="#10B981" />
              </View>
              <Text className="text-2xl font-bold text-gray-900 text-center">Payment Successful!</Text>
              <Text className="text-gray-500 mt-2 text-center">
                Your transaction has been completed successfully.
              </Text>
            </View>
          ) : (
            <View className="items-center">
              <View className="h-24 w-24 rounded-full bg-red-100 items-center justify-center mb-6">
                <MaterialIcons name="error" size={64} color="#EF4444" />
              </View>
              <Text className="text-2xl font-bold text-gray-900 text-center">Payment Failed</Text>
              <Text className="text-gray-500 mt-2 text-center">
                {socketError || 'We couldn&apos;t process your payment at this time.'}
              </Text>
            </View>
          )}

          {/* Details Card */}
          <View className="w-full mt-12 p-6 rounded-3xl bg-gray-50 border border-gray-100">
            <View className="flex-row justify-between mb-4">
              <Text className="text-gray-500">Amount</Text>
              <Text className="text-xl font-bold text-gray-900">{formatCurrency(payment?.amount, payment?.currency)}</Text>
            </View>
            <View className="flex-row justify-between mb-4">
              <Text className="text-gray-500">Payment #</Text>
              <Text className="font-mono text-gray-700">{payment?.paymentNumber}</Text>
            </View>
            <View className="flex-row justify-between">
              <Text className="text-gray-500">Method</Text>
              <Text className="font-bold text-gray-900">{formatPaymentMethod(payment?.method)}</Text>
            </View>
          </View>

          {/* Connection Stats (Debug/Transparency) */}
          <View className="mt-8 flex-row items-center gap-4">
            <View className="flex-row items-center">
              <View className={`h-2 w-2 rounded-full mr-2 ${socketConnected ? 'bg-emerald-500' : 'bg-gray-300'}`} />
              <Text className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Live Connect</Text>
            </View>
            {isFallbackActive && (
              <View className="flex-row items-center">
                <ActivityIndicator size="small" color="#D4AF37" className="mr-2 scale-75" />
                <Text className="text-[10px] font-bold text-brand-primary uppercase tracking-widest">Auto checking...</Text>
              </View>
            )}
          </View>
        </View>
      </ScrollView>

      {/* Footer Actions */}
      <View className="p-4 border-t border-gray-100 bg-white gap-3">
        {currentStatus === 'SUCCESS' && (
          <TouchableOpacity
            onPress={() => router.push(`/(authenticated)/payments/${paymentId}`)}
            className="btn-primary w-full"
          >
            <Text className="text-white font-bold">View Receipt</Text>
          </TouchableOpacity>
        )}
        
        {currentStatus === 'FAILED' && (
          <TouchableOpacity
            onPress={() => router.back()}
            className="btn-primary w-full"
          >
            <Text className="text-white font-bold">Try Again</Text>
          </TouchableOpacity>
        )}

        <TouchableOpacity
          onPress={() => router.replace('/(authenticated)/payments')}
          className="btn-secondary w-full"
        >
          <Text className="text-gray-700 font-bold">Go to History</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

export default PaymentStatusScreen;
