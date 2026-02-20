import React, { useState, useCallback, useMemo, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  TextInput,
  Alert,
  Platform,
} from 'react-native';
import { DatePickerModal } from 'react-native-paper-dates';
import { useRouter, Stack } from 'expo-router';
import { useCreateAppointment } from '@/tanstack/useAppointments';
import { useGetAllServices } from '@/tanstack/useServices';
import { useGetAllStaff } from '@/tanstack/useUsers';
import { useGetSlots } from '@/tanstack/useAvailability';
import { format } from 'date-fns';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { formatCurrency } from '@/utils/paymentUtils';
import type { User, IService, ITimeSlot } from '@/types/api.types';

// Define the tabs for the booking flow
type BookingTab = 'staff' | 'services' | 'slots' | 'summary';

/**
 * Appointment Create Screen
 * Implements a tabbed interface for booking an appointment.
 * Tabs: Select Staff -> Select Services -> Slot Availability -> Summary
 */
const AppointmentCreateScreen = () => {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<BookingTab>('staff');
  
  // Selection State
  const [selectedStaff, setSelectedStaff] = useState<User | null>(null);
  const [selectedServices, setSelectedServices] = useState<string[]>([]);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedSlot, setSelectedSlot] = useState<ITimeSlot | null>(null);
  const [notes, setNotes] = useState('');
  const [showDatePicker, setShowDatePicker] = useState(false);

  // Queries
  const { data: staffList, isLoading: isLoadingStaff } = useGetAllStaff();

  const { data: allServicesData, isLoading: isLoadingServices } = useGetAllServices({ status: 'active' });
  const allServices: IService[] = allServicesData?.services || [];

  // Slots Query - only runs when staff, services, and date are selected
  const slotsParams = useMemo(() => {
    if (!selectedStaff?._id || selectedServices.length === 0) return null;
    return {
      staffId: selectedStaff._id,
      serviceId: selectedServices,
      date: format(selectedDate, 'yyyy-MM-dd'),
    };
  }, [selectedStaff, selectedServices, selectedDate]);

  const { data: slotsData, isLoading: isLoadingSlots } = useGetSlots(slotsParams, {
    enabled: activeTab === 'slots' && !!slotsParams,
  });
  const slots: ITimeSlot[] = slotsData?.slots || [];

  // Mutation
  const createMutation = useCreateAppointment();

  /**
   * Tab 1: Handle Staff Selection
   * Automatically selects all services offered by the selected staff.
   */
  const handleStaffSelect = useCallback((staff: User) => {
    setSelectedStaff(staff);
    // Documentation Requirement: "the service the staff offers should be autoselected"
    const staffServiceIds = ((staff as any).services || []).map((s: any) => typeof s === 'string' ? s : s._id);
    setSelectedServices(staffServiceIds);
    setSelectedSlot(null); // Reset slot if staff changes
    setActiveTab('services');
  }, []);

  /**
   * Tab 2: Handle Service Toggle
   */
  const toggleService = useCallback((serviceId: string) => {
    setSelectedServices(prev => 
      prev.includes(serviceId) 
        ? prev.filter(id => id !== serviceId)
        : [...prev, serviceId]
    );
    setSelectedSlot(null); // Reset slot if services change
  }, []);

  /**
   * Check if a service is disabled (if it's not offered by the selected staff)
   */
  const isServiceDisabled = useCallback((serviceId: string) => {
    if (!selectedStaff?.services) return false;
    const staffServiceIds = selectedStaff.services.map((s: any) => typeof s === 'string' ? s : s._id);
    return !staffServiceIds.includes(serviceId);
  }, [selectedStaff]);

  /**
   * Calculate total duration and price
   */
  const totals = useMemo(() => {
    return selectedServices.reduce((acc, id) => {
      const service = allServices.find((s: any) => s._id === id);
      return {
        price: acc.price + (service?.fullPrice || 0),
        duration: acc.duration + (service?.duration || 0)
      };
    }, { price: 0, duration: 0 });
  }, [selectedServices, allServices]);

  /**
   * Tab 3: Handle Date Selection
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
   * Final Submission
   */
  const handleBooking = async () => {
    if (!selectedStaff || selectedServices.length === 0 || !selectedSlot) {
      Alert.alert('Error', 'Please complete all steps before booking.');
      return;
    }

    try {
      await createMutation.mutateAsync({
        staffId: selectedStaff._id,
        services: selectedServices,
        startTime: selectedSlot.startTime,
        endTime: selectedSlot.endTime,
        notes,
      });
      router.push('/(authenticated)/appointment');
    } catch (error) {
      // Error handled by mutation
    }
  };

  /**
   * Render Tab Headers
   */
  const renderTabHeaders = () => (
    <View className="flex-row bg-white border-b border-gray-100">
      {(['staff', 'services', 'slots', 'summary'] as BookingTab[]).map((tab) => (
        <TouchableOpacity
          key={tab}
          onPress={() => {
            // Basic validation for manual tab switching
            if (tab === 'services' && !selectedStaff) return;
            if (tab === 'slots' && (selectedServices.length === 0 || !selectedStaff)) return;
            if (tab === 'summary' && !selectedSlot) return;
            setActiveTab(tab);
          }}
          className={`flex-1 py-3 items-center border-b-2 ${
            activeTab === tab ? 'border-brand-primary' : 'border-transparent'
          }`}
        >
          <Text className={`text-[10px] uppercase font-bold ${
            activeTab === tab ? 'text-brand-primary' : 'text-gray-400'
          }`}>
            {tab}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );

  return (
    <View className="flex-1 bg-gray-50">
      <Stack.Screen 
        options={{
          title: 'Create Appointment',
          headerShown: true,
        }} 
      />
      
      {renderTabHeaders()}

      <ScrollView className="flex-1">
        {/* Tab 1: Staff Selection */}
        {activeTab === 'staff' && (
          <View className="p-4">
            <Text className="text-xl font-bold text-gray-900 mb-4">Select Professional</Text>
            {isLoadingStaff ? (
              <ActivityIndicator color="#D4AF37" />
            ) : (
              staffList?.map((staff: any) => (
                <TouchableOpacity
                  key={staff._id}
                  onPress={() => handleStaffSelect(staff)}
                  className={`mb-4 flex-row items-center p-4 rounded-2xl bg-white border ${
                    selectedStaff?._id === staff._id ? 'border-brand-primary' : 'border-gray-100'
                  } shadow-sm`}
                >
                  <View className="h-16 w-16 rounded-full bg-gray-200 overflow-hidden items-center justify-center">
                    {staff.avatar ? (
                      <Image source={{ uri: staff.avatar }} className="h-full w-full" />
                    ) : (
                      <MaterialIcons name="person" size={40} color="white" />
                    )}
                  </View>
                  <View className="ml-4 flex-1">
                    <Text className="text-lg font-bold text-gray-900">{staff.firstName} {staff.lastName}</Text>
                    <Text className="text-sm text-gray-500">{staff.role}</Text>
                    <Text className="mt-1 text-xs text-brand-primary font-medium" numberOfLines={1}>
                      Provides: {staff.services?.map((s: any) => typeof s === 'string' ? s : s.name).join(', ')}
                    </Text>
                  </View>
                  {selectedStaff?._id === staff._id && (
                    <MaterialIcons name="check-circle" size={24} color="#D4AF37" />
                  )}
                </TouchableOpacity>
              ))
            )}
          </View>
        )}

        {/* Tab 2: Service Selection */}
        {activeTab === 'services' && (
          <View className="p-4">
            <Text className="text-xl font-bold text-gray-900 mb-4">Select Services</Text>
            {isLoadingServices ? (
              <ActivityIndicator color="#D4AF37" />
            ) : (
              allServices.map((service: any) => {
                const isDisabled = isServiceDisabled(service._id);
                const isSelected = selectedServices.includes(service._id);
                
                return (
                  <TouchableOpacity
                    key={service._id}
                    onPress={() => !isDisabled && toggleService(service._id)}
                    disabled={isDisabled}
                    className={`mb-3 flex-row items-center p-4 rounded-2xl bg-white border ${
                      isSelected ? 'border-brand-primary' : 'border-gray-100'
                    } ${isDisabled ? 'opacity-40' : ''} shadow-sm`}
                  >
                    <View className="flex-1">
                      <Text className="text-base font-bold text-gray-900">{service.name}</Text>
                      <Text className="text-xs text-gray-500">{service.duration} mins • {formatCurrency(service.fullPrice)}</Text>
                    </View>
                    <MaterialIcons 
                      name={isSelected ? "check-box" : "check-box-outline-blank"} 
                      size={24} 
                      color={isSelected ? "#D4AF37" : "#D1D5DB"} 
                    />
                  </TouchableOpacity>
                );
              })
            )}
            
            <View className="mt-6 p-4 rounded-2xl bg-brand-tint border border-brand-primary/20">
              <View className="flex-row justify-between mb-1">
                <Text className="text-gray-600">Total Duration:</Text>
                <Text className="font-bold text-gray-900">{totals.duration} mins</Text>
              </View>
              <View className="flex-row justify-between">
                <Text className="text-gray-600">Estimated Price:</Text>
                <Text className="font-bold text-brand-primary text-lg">{formatCurrency(totals.price)}</Text>
              </View>
            </View>
          </View>
        )}

        {/* Tab 3: Slots Availability */}
        {activeTab === 'slots' && (
          <View className="p-4">
            <Text className="text-xl font-bold text-gray-900 mb-2">Select Date & Time</Text>
            
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

            <View className="mt-8">
              <Text className="text-base font-bold text-gray-700 mb-4">Available Slots for {selectedStaff?.firstName}</Text>
              
              {slotsData?.message && (
                <View className="mb-4 p-3 bg-brand-tint border border-brand-primary/20 rounded-xl">
                  <Text className="text-xs text-brand-primary font-medium text-center">
                    {slotsData.message}
                  </Text>
                </View>
              )}

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
          </View>
        )}

        {/* Tab 4: Summary */}
        {activeTab === 'summary' && (
          <View className="p-4">
            <Text className="text-xl font-bold text-gray-900 mb-4">Review Appointment</Text>
            
            <View className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm mb-6">
              <View className="flex-row items-center mb-4">
                <Image 
                  source={{ uri: selectedStaff?.avatar || 'https://via.placeholder.com/150' }} 
                  className="h-12 w-12 rounded-full" 
                />
                <View className="ml-3">
                  <Text className="text-base font-bold text-gray-900">{selectedStaff?.firstName} {selectedStaff?.lastName}</Text>
                  <Text className="text-xs text-gray-500">Professional Staff</Text>
                </View>
              </View>

              <View className="space-y-3">
                <View className="flex-row items-start">
                  <MaterialIcons name="content-cut" size={18} color="#9CA3AF" />
                  <View className="ml-3 flex-1">
                    <Text className="text-sm font-bold text-gray-900">Services</Text>
                    <Text className="text-sm text-gray-600">
                      {allServices.filter((s: any) => selectedServices.includes(s._id)).map((s: any) => s.name).join(', ')}
                    </Text>
                  </View>
                </View>

                <View className="flex-row items-start mt-3">
                  <MaterialIcons name="access-time" size={18} color="#9CA3AF" />
                  <View className="ml-3 flex-1">
                    <Text className="text-sm font-bold text-gray-900">Date & Time</Text>
                    <Text className="text-sm text-gray-600">
                      {format(selectedDate, 'MMMM d, yyyy')} at {selectedSlot ? format(new Date(selectedSlot.startTime), 'p') : ''}
                    </Text>
                  </View>
                </View>

                <View className="flex-row items-start mt-3">
                  <MaterialIcons name="payments" size={18} color="#9CA3AF" />
                  <View className="ml-3 flex-1">
                    <Text className="text-sm font-bold text-gray-900">Price Details</Text>
                    <Text className="text-sm text-gray-600">Total Price: {formatCurrency(totals.price)}</Text>
                  </View>
                </View>
              </View>
            </View>

            <View className="auth-field mb-6">
              <Text className="label">Notes (Optional)</Text>
              <TextInput
                multiline
                numberOfLines={4}
                value={notes}
                onChangeText={setNotes}
                placeholder="Anything else we should know?"
                className="input min-h-[100px] pt-3"
                textAlignVertical="top"
              />
            </View>

            {createMutation.isError && (
              <View className="alert-error mb-4">
                <Text className="text-red-700">Error: {createMutation.error.message}</Text>
              </View>
            )}
          </View>
        )}
      </ScrollView>

      {/* Navigation Footer */}
      <View className="p-4 bg-white border-t border-gray-100 flex-row gap-4">
        {activeTab !== 'staff' && (
          <TouchableOpacity 
            onPress={() => {
              if (activeTab === 'services') setActiveTab('staff');
              if (activeTab === 'slots') setActiveTab('services');
              if (activeTab === 'summary') setActiveTab('slots');
            }}
            className="btn-secondary flex-1"
          >
            <Text className="font-bold text-gray-700">Previous</Text>
          </TouchableOpacity>
        )}
        
        <TouchableOpacity 
          onPress={() => {
            if (activeTab === 'staff') {
              if (!selectedStaff) return Alert.alert('Required', 'Please select a staff member.');
              setActiveTab('services');
            } else if (activeTab === 'services') {
              if (selectedServices.length === 0) return Alert.alert('Required', 'Please select at least one service.');
              setActiveTab('slots');
            } else if (activeTab === 'slots') {
              if (!selectedSlot) return Alert.alert('Required', 'Please select a time slot.');
              setActiveTab('summary');
            } else if (activeTab === 'summary') {
              handleBooking();
            }
          }}
          disabled={createMutation.isPending}
          className="btn-primary flex-1"
        >
          {createMutation.isPending ? (
            <ActivityIndicator color="white" />
          ) : (
            <Text className="font-bold text-white">
              {activeTab === 'summary' ? 'Confirm & Book' : 'Next'}
            </Text>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default AppointmentCreateScreen;
