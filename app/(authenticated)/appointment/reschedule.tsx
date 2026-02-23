import React, { useState, useCallback, useMemo } from 'react';
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
import { DatePickerModal } from 'react-native-paper-dates';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useGetAppointment, useRescheduleAppointment } from '@/tanstack/useAppointments';
import { useGetSlots } from '@/tanstack/useAvailability';
import { formatAppointmentDateTime } from '@/utils/appointmentUtils';
import { format } from 'date-fns';

/**
 * Reschedule Appointment Screen
 * Allows users to change the date and time of an existing appointment.
 */
const RescheduleAppointmentScreen = () => {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();

  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedSlot, setSelectedSlot] = useState<any>(null);
  const [showDatePicker, setShowDatePicker] = useState(false);

  // Fetch current appointment
  const { data: appointment, isLoading: isLoadingAppointment } = useGetAppointment(id!);
  
  // Slots Query
  const slotsParams = useMemo(() => {
    if (!appointment || !appointment.staffId) return null;
    return {
      staffId: typeof appointment.staffId === 'string' ? appointment.staffId : (appointment.staffId as any)._id,
      serviceId: appointment.services.map((s: any) => s._id),
      date: format(selectedDate, 'yyyy-MM-dd'),
    };
  }, [appointment, selectedDate]);

  const { data: slotsData, isLoading: isLoadingSlots } = useGetSlots(slotsParams, {
    enabled: !!slotsParams,
  });
  const slots = slotsData?.slots || [];

  // Mutation
  const rescheduleMutation = useRescheduleAppointment();

  /**
   * Handles date selection confirm
   */
  const handleConfirmDate = useCallback((params: any) => {
    setSelectedDate(params.date);
    setSelectedSlot(null);
    setShowDatePicker(false);
  }, []);

  const hideDatePicker = useCallback(() => {
    setShowDatePicker(false);
  }, []);

  /**
   * Handles reschedule submission
   */
  const handleReschedule = useCallback(async () => {
    if (!selectedSlot) return Alert.alert('Required', 'Please select a new time slot');

    try {
      await rescheduleMutation.mutateAsync({
        appointmentId: id!,
        data: {
          newStartTime: selectedSlot.startTime,
        },
      });
      
      Alert.alert('Success', 'Appointment rescheduled successfully');
      router.push(`/(authenticated)/appointment/${id}`);
    } catch {
      // Error handled by mutation
    }
  }, [id, selectedSlot, rescheduleMutation, router]);

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
          title: 'Reschedule',
          headerShown: true,
        }}
      />
      
      <ScrollView className="flex-1 p-4">
        {/* Current Slot Info */}
        <View className="mb-8 rounded-2xl bg-gray-50 p-5 border border-gray-100">
          <Text className="text-[10px] uppercase font-bold text-gray-400 mb-1">Current Schedule</Text>
          <View className="flex-row items-center">
            <MaterialIcons name="event-available" size={20} color="#D4AF37" />
            <Text className="ml-2 font-bold text-gray-900">
              {formatAppointmentDateTime(appointment?.startTime)}
            </Text>
          </View>
        </View>

        <Text className="text-xl font-bold text-gray-900 mb-2">Select New Date & Time</Text>
        
        {/* Date Selection */}
        <TouchableOpacity 
          onPress={() => setShowDatePicker(true)}
          className="mt-4 flex-row items-center justify-between p-4 bg-white border border-gray-100 rounded-2xl shadow-sm"
        >
          <View className="flex-row items-center">
            <MaterialIcons name="calendar-today" size={20} color="#D4AF37" />
            <Text className="ml-3 font-bold text-gray-900">{format(selectedDate, 'PPPP')}</Text>
          </View>
          <Text className="text-brand-primary font-bold">Change</Text>
        </TouchableOpacity>

        <DatePickerModal
          locale="en"
          mode="single"
          visible={showDatePicker}
          onDismiss={hideDatePicker}
          date={selectedDate}
          onConfirm={handleConfirmDate}
          validRange={{
            startDate: new Date(),
          }}
        />

        {/* Time Selection */}
        <View className="mt-8">
          <Text className="text-base font-bold text-gray-700 mb-4">Available Slots</Text>
          {isLoadingSlots ? (
            <ActivityIndicator color="#D4AF37" />
          ) : slots.length > 0 ? (
            <View className="flex-row flex-wrap gap-3">
              {slots.map((slot: any, index: number) => (
                <TouchableOpacity
                  key={index}
                  onPress={() => setSelectedSlot(slot)}
                  className={`px-4 py-3 rounded-xl border ${
                    selectedSlot?.startTime === slot.startTime 
                      ? 'bg-brand-primary border-brand-primary' 
                      : 'bg-white border-gray-200'
                  }`}
                >
                  <Text className={`font-bold ${
                    selectedSlot?.startTime === slot.startTime ? 'text-white' : 'text-gray-700'
                  }`}>
                    {format(new Date(slot.startTime), 'p')}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          ) : (
            <View className="items-center py-10">
              <MaterialIcons name="event-busy" size={48} color="#D1D5DB" />
              <Text className="mt-2 text-gray-400">No available slots for this date</Text>
            </View>
          )}
        </View>
      </ScrollView>

      {/* Footer Action */}
      <View className="p-4 border-t border-gray-100 bg-white">
        <TouchableOpacity
          onPress={handleReschedule}
          disabled={rescheduleMutation.isPending || !selectedSlot}
          className={`btn-primary w-full ${!selectedSlot ? 'opacity-50' : ''}`}
        >
          {rescheduleMutation.isPending ? (
            <ActivityIndicator color="white" />
          ) : (
            <Text className="text-white font-bold text-lg">Confirm Reschedule</Text>
          )}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

export default RescheduleAppointmentScreen;
