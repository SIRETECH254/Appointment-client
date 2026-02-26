import React, { useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Alert,
  SafeAreaView,
} from 'react-native';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import {
  useGetAppointment,
  useCancelAppointment,
} from '@/tanstack/useAppointments';
import {
  formatAppointmentDateTime,
  canRescheduleAppointment,
  canCancelAppointment,
  isAppointmentPending,
  isAppointmentConfirmed,
} from '@/utils/appointmentUtils';
import StatusBadge from '@/components/ui/StatusBadge';
import { formatCurrency } from '@/utils/paymentUtils';
import type { IAppointment } from '@/types/api.types';

const AppointmentDetailsScreen = () => {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();

  // Fetch appointment details
  const { data, isLoading, isError, refetch } = useGetAppointment(id!);
  const appointment = data as IAppointment;
  
  // Mutations
  const cancelMutation = useCancelAppointment();

  /**
   * Handles appointment cancellation
   */
  const handleCancel = useCallback(() => {
    Alert.alert(
      'Cancel Appointment',
      'Are you sure you want to cancel this appointment?',
      [
        { text: 'No', style: 'cancel' },
        {
          text: 'Yes, Cancel',
          style: 'destructive',
          onPress: async () => {
            try {
              await cancelMutation.mutateAsync({ appointmentId: id!, data: {} });
              Alert.alert('Success', 'Appointment cancelled successfully');
              refetch();
            } catch {
              // Error handled by mutation
            }
          },
        },
      ]
    );
  }, [id, cancelMutation, refetch]);

  if (isLoading) {
    return (
      <SafeAreaView className="flex-1 bg-white">
        <Stack.Screen
          options={{
            title: 'Appointment Details',
            headerShown: true,
          }}
        />
        <ScrollView className="flex-1">
          <View className="p-4">
            {/* Header Card Skeleton */}
            <View className="mb-6 rounded-2xl bg-gray-50 p-5 border border-gray-100 animate-pulse">
              <View className="flex-row justify-between items-center mb-4">
                <View>
                  <View className="h-3 bg-gray-200 rounded w-32 mb-2" />
                  <View className="h-4 bg-gray-200 rounded w-24" />
                </View>
                <View className="h-6 w-20 bg-gray-200 rounded-full" />
              </View>
              <View className="flex-row items-center">
                <View className="h-12 w-12 rounded-full bg-gray-200" />
                <View className="ml-3">
                  <View className="h-5 bg-gray-200 rounded w-40 mb-2" />
                  <View className="h-3 bg-gray-200 rounded w-32" />
                </View>
              </View>
            </View>

            {/* Details Section Skeleton */}
            <View className="mb-6">
              <View className="h-4 bg-gray-200 rounded w-20 mb-3" />
              <View className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
                <View className="space-y-4">
                  <View className="flex-row items-start">
                    <View className="h-5 w-5 bg-gray-200 rounded" />
                    <View className="ml-3 flex-1">
                      <View className="h-4 bg-gray-200 rounded w-24 mb-2" />
                      <View className="h-4 bg-gray-200 rounded w-48" />
                    </View>
                  </View>
                  <View className="flex-row items-start mt-4">
                    <View className="h-5 w-5 bg-gray-200 rounded" />
                    <View className="ml-3 flex-1">
                      <View className="h-4 bg-gray-200 rounded w-24 mb-2" />
                      <View className="h-4 bg-gray-200 rounded w-48" />
                    </View>
                  </View>
                  <View className="flex-row items-start mt-4">
                    <View className="h-5 w-5 bg-gray-200 rounded" />
                    <View className="ml-3 flex-1">
                      <View className="h-4 bg-gray-200 rounded w-24 mb-2" />
                      <View className="h-4 bg-gray-200 rounded w-56" />
                    </View>
                  </View>
                </View>
              </View>
            </View>

            {/* Payment Section Skeleton */}
            <View className="mb-6">
              <View className="h-4 bg-gray-200 rounded w-20 mb-3" />
              <View className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
                <View className="flex-row justify-between items-center mb-3">
                  <View className="h-4 bg-gray-200 rounded w-24" />
                  <View className="h-4 bg-gray-200 rounded w-20" />
                </View>
                <View className="flex-row justify-between items-center mb-3">
                  <View className="h-4 bg-gray-200 rounded w-32" />
                  <View className="h-4 bg-gray-200 rounded w-20" />
                </View>
                <View className="border-t border-gray-50 pt-3 flex-row justify-between items-center">
                  <View className="h-5 bg-gray-200 rounded w-24" />
                  <View className="h-6 bg-gray-200 rounded w-28" />
                </View>
              </View>
            </View>
          </View>
        </ScrollView>

        {/* Footer Skeleton */}
        <View className="p-4 border-t border-gray-100 bg-white">
          <View className="h-12 bg-gray-200 rounded-xl" />
        </View>
      </SafeAreaView>
    );
  }

  if (isError || !appointment) {
    return (
      <View className="flex-1 items-center justify-center p-6 bg-white">
        <MaterialIcons name="error-outline" size={64} color="#EF4444" />
        <Text className="mt-4 text-lg font-bold text-gray-900 text-center">
          Failed to load appointment details
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
          title: 'Appointment Details',
          headerShown: true,
        }}
      />
      
      <ScrollView className="flex-1">
        <View className="p-4">
          {/* Header Card */}
          <View className="mb-6 rounded-2xl bg-amber-50 p-5 border border-amber-200">
            <View className="flex-row justify-between items-center mb-4">
              <View>
                <View className="flex-row items-center mb-1">
                  <MaterialIcons name="fingerprint" size={14} color="#D97706" />
                  <Text className="ml-1 text-[10px] uppercase tracking-widest text-amber-700">Appointment ID</Text>
                </View>
                <Text className="font-mono text-xs font-bold text-amber-800">#{appointment._id.slice(-8).toUpperCase()}</Text>
              </View>
              <StatusBadge 
                status={appointment.status || ''} 
                type="appointment"
                className="ml-2"
              />
            </View>

            <View className="flex-row items-center">
              <View className="h-12 w-12 rounded-full bg-brand-primary items-center justify-center shadow-md">
                <MaterialIcons name="person" size={24} color="white" />
              </View>
              <View className="ml-3">
                <View className="flex-row items-center">
                  <MaterialIcons name="badge" size={14} color="#D97706" />
                  <Text className="ml-1 text-lg font-bold text-gray-900">
                    {typeof appointment.staffId === 'object' ? `${appointment.staffId.firstName} ${appointment.staffId.lastName}` : 'Professional Staff'}
                  </Text>
                </View>
                <View className="flex-row items-center mt-1">
                  <MaterialIcons name="work" size={12} color="#9CA3AF" />
                  <Text className="ml-1 text-xs text-gray-500">Professional Staff</Text>
                </View>
              </View>
            </View>
          </View>

          {/* Details Section */}
          <View className="mb-6">
            <View className="flex-row items-center mb-3 px-1">
              <View className="h-6 w-6 rounded-full bg-amber-100 items-center justify-center mr-2">
                <MaterialIcons name="info" size={16} color="#D97706" />
              </View>
              <Text className="text-sm font-bold uppercase tracking-wider text-amber-700">Details</Text>
            </View>
            <View className="rounded-2xl border border-amber-100 bg-amber-50 p-5 shadow-sm">
              <View className="space-y-4">
                <View className="flex-row items-start">
                  <View className="h-8 w-8 rounded-full bg-orange-100 items-center justify-center">
                    <MaterialIcons name="event" size={18} color="#EA580C" />
                  </View>
                  <View className="ml-3 flex-1">
                    <Text className="text-sm font-bold text-orange-700">Date & Time</Text>
                    <Text className="text-sm text-gray-700 mt-1">{formatAppointmentDateTime(appointment.startTime)}</Text>
                  </View>
                </View>

                <View className="flex-row items-start mt-4">
                  <View className="h-8 w-8 rounded-full bg-teal-100 items-center justify-center">
                    <MaterialIcons name="access-time" size={18} color="#0D9488" />
                  </View>
                  <View className="ml-3 flex-1">
                    <Text className="text-sm font-bold text-teal-700">Booked On</Text>
                    <Text className="text-sm text-gray-700 mt-1">{formatAppointmentDateTime(appointment.createdAt)}</Text>
                  </View>
                </View>

                <View className="flex-row items-start mt-4">
                  <View className="h-8 w-8 rounded-full bg-amber-100 items-center justify-center">
                    <MaterialIcons name="content-cut" size={18} color="#D97706" />
                  </View>
                  <View className="ml-3 flex-1">
                    <Text className="text-sm font-bold text-amber-700">Services</Text>
                    <Text className="text-sm text-gray-700 mt-1">
                      {appointment.services.map((s: any) => s.name).join(', ')}
                    </Text>
                  </View>
                </View>

                {appointment.notes && (
                  <View className="flex-row items-start mt-4">
                    <View className="h-8 w-8 rounded-full bg-orange-100 items-center justify-center">
                      <MaterialIcons name="notes" size={18} color="#EA580C" />
                    </View>
                    <View className="ml-3 flex-1">
                      <Text className="text-sm font-bold text-orange-700">Notes</Text>
                      <Text className="text-sm text-gray-700 mt-1">{appointment.notes}</Text>
                    </View>
                  </View>
                )}
              </View>
            </View>
          </View>

          {/* Payment Section */}
          <View className="mb-6">
            <View className="flex-row items-center mb-3 px-1">
              <View className="h-6 w-6 rounded-full bg-teal-100 items-center justify-center mr-2">
                <MaterialIcons name="payment" size={16} color="#0D9488" />
              </View>
              <Text className="text-sm font-bold uppercase tracking-wider text-teal-700">Payment</Text>
            </View>
            <View className="rounded-2xl border border-teal-100 bg-teal-50 p-5 shadow-sm">
              <View className="flex-row justify-between items-center mb-3">
                <View className="flex-row items-center">
                  <MaterialIcons name="account-balance-wallet" size={16} color="#0D9488" />
                  <Text className="ml-2 text-gray-700 font-medium">Booking Fee</Text>
                </View>
                <Text className="font-bold text-teal-700">{formatCurrency(appointment.bookingFeeAmount)}</Text>
              </View>
              <View className="flex-row justify-between items-center mb-3">
                <View className="flex-row items-center">
                  <MaterialIcons name="pending" size={16} color="#0D9488" />
                  <Text className="ml-2 text-gray-700 font-medium">Remaining Balance</Text>
                </View>
                <Text className="font-bold text-teal-700">{formatCurrency(appointment.remainingAmount)}</Text>
              </View>
              <View className="border-t border-teal-100 pt-3 flex-row justify-between items-center">
                <View className="flex-row items-center">
                  <MaterialIcons name="attach-money" size={18} color="#D4AF37" />
                  <Text className="ml-2 text-base font-bold text-gray-900">Total Price</Text>
                </View>
                <Text className="text-lg font-bold text-brand-primary">
                  {formatCurrency(appointment.bookingFeeAmount + appointment.remainingAmount)}
                </Text>
              </View>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Action Footer */}
      <View className="p-4 border-t border-gray-100 bg-white">
        <View className="flex-row gap-3">
          {isAppointmentPending(appointment) && new Date(appointment.startTime) > new Date() && (
            <TouchableOpacity
              onPress={() => router.push(`/(authenticated)/appointment/${id}/payment`)}
              className="flex-1 btn-primary"
            >
              <Text className="text-white font-bold">Confirm Appointment</Text>
            </TouchableOpacity>
          )}

          {isAppointmentPending(appointment) && new Date(appointment.startTime) <= new Date() && (
            <TouchableOpacity
              disabled
              className="flex-1 btn-secondary opacity-50"
            >
              <Text className="text-gray-400 font-bold">Time Passed</Text>
            </TouchableOpacity>
          )}
          
          {isAppointmentConfirmed(appointment) && appointment.remainingAmount > 0 && (
            <TouchableOpacity
              onPress={() => router.push(`/(authenticated)/appointment/${id}/payment`)}
              className="flex-1 btn-primary"
            >
              <Text className="text-white font-bold">Pay Balance</Text>
            </TouchableOpacity>
          )}

          {canRescheduleAppointment(appointment) && (
            <TouchableOpacity
              onPress={() => router.push({
                pathname: '/(authenticated)/appointment/reschedule',
                params: { id: id }
              })}
              className="flex-1 btn-secondary"
            >
              <Text className="text-gray-700 font-bold">Reschedule</Text>
            </TouchableOpacity>
          )}
        </View>

        {canCancelAppointment(appointment) && (
          <TouchableOpacity
            onPress={handleCancel}
            disabled={cancelMutation.isPending}
            className="mt-3 btn-ghost"
          >
            <Text className="text-red-500 font-bold">
              {cancelMutation.isPending ? 'Cancelling...' : 'Cancel Appointment'}
            </Text>
          </TouchableOpacity>
        )}
      </View>
    </SafeAreaView>
  );
};

export default AppointmentDetailsScreen;
