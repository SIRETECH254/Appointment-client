import React, { useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
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
  formatAppointmentStatus,
  getAppointmentStatusVariant,
  canRescheduleAppointment,
  canCancelAppointment,
  isAppointmentPending,
  isAppointmentConfirmed,
} from '@/utils/appointmentUtils';
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
      <View className="flex-1 items-center justify-center bg-white">
        <ActivityIndicator size="large" color="#D4AF37" />
      </View>
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

  const statusVariant = getAppointmentStatusVariant(appointment.status);

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
          <View className="mb-6 rounded-2xl bg-gray-50 p-5 border border-gray-100">
            <View className="flex-row justify-between items-center mb-4">
              <View>
                <Text className="text-[10px] uppercase tracking-widest text-gray-400">Appointment ID</Text>
                <Text className="font-mono text-xs font-bold text-gray-600">#{appointment._id.slice(-8).toUpperCase()}</Text>
              </View>
              <View className={`badge ${statusVariant}`}>
                <Text className="text-xs font-semibold">{formatAppointmentStatus(appointment.status)}</Text>
              </View>
            </View>

            <View className="flex-row items-center">
              <View className="h-12 w-12 rounded-full bg-brand-primary items-center justify-center">
                <MaterialIcons name="person" size={24} color="white" />
              </View>
              <View className="ml-3">
                <Text className="text-lg font-bold text-gray-900">
                  {typeof appointment.staffId === 'object' ? `${appointment.staffId.firstName} ${appointment.staffId.lastName}` : 'Professional Staff'}
                </Text>
                <Text className="text-xs text-gray-500">Professional Staff</Text>
              </View>
            </View>
          </View>

          {/* Details Section */}
          <View className="mb-6">
            <Text className="text-sm font-bold uppercase tracking-wider text-gray-400 mb-3 px-1">Details</Text>
            <View className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
              <View className="space-y-4">
                <View className="flex-row items-start">
                  <MaterialIcons name="event" size={20} color="#D4AF37" />
                  <View className="ml-3">
                    <Text className="text-sm font-bold text-gray-900">Date & Time</Text>
                    <Text className="text-sm text-gray-600">{formatAppointmentDateTime(appointment.startTime)}</Text>
                  </View>
                </View>

                <View className="flex-row items-start mt-4">
                  <MaterialIcons name="access-time" size={20} color="#D4AF37" />
                  <View className="ml-3">
                    <Text className="text-sm font-bold text-gray-900">Booked On</Text>
                    <Text className="text-sm text-gray-600">{formatAppointmentDateTime(appointment.createdAt)}</Text>
                  </View>
                </View>

                <View className="flex-row items-start mt-4">
                  <MaterialIcons name="content-cut" size={20} color="#D4AF37" />
                  <View className="ml-3">
                    <Text className="text-sm font-bold text-gray-900">Services</Text>
                    <Text className="text-sm text-gray-600">
                      {appointment.services.map((s: any) => s.name).join(', ')}
                    </Text>
                  </View>
                </View>

                {appointment.notes && (
                  <View className="flex-row items-start mt-4">
                    <MaterialIcons name="notes" size={20} color="#D4AF37" />
                    <View className="ml-3">
                      <Text className="text-sm font-bold text-gray-900">Notes</Text>
                      <Text className="text-sm text-gray-600">{appointment.notes}</Text>
                    </View>
                  </View>
                )}
              </View>
            </View>
          </View>

          {/* Payment Section */}
          <View className="mb-6">
            <Text className="text-sm font-bold uppercase tracking-wider text-gray-400 mb-3 px-1">Payment</Text>
            <View className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
              <View className="flex-row justify-between items-center mb-3">
                <Text className="text-gray-600">Booking Fee</Text>
                <Text className="font-bold text-gray-900">{formatCurrency(appointment.bookingFeeAmount)}</Text>
              </View>
              <View className="flex-row justify-between items-center mb-3">
                <Text className="text-gray-600">Remaining Balance</Text>
                <Text className="font-bold text-gray-900">{formatCurrency(appointment.remainingAmount)}</Text>
              </View>
              <View className="border-t border-gray-50 pt-3 flex-row justify-between items-center">
                <Text className="text-base font-bold text-gray-900">Total Price</Text>
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
