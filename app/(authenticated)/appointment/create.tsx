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
} from 'react-native';
import { DatePickerModal } from 'react-native-paper-dates';
import { useRouter, Stack } from 'expo-router';
import { useQueryClient } from '@tanstack/react-query';
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

const TABS: { key: BookingTab; label: string; step: number }[] = [
  { key: 'staff', label: 'Staff', step: 1 },
  { key: 'services', label: 'Service', step: 2 },
  { key: 'slots', label: 'Slots', step: 3 },
  { key: 'summary', label: 'Summary', step: 4 },
];

/**
 * Appointment Create Screen
 * Implements a tabbed interface for booking an appointment.
 * Tabs: Select Staff -> Select Services -> Slot Availability -> Summary
 */
const AppointmentCreateScreen = () => {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<BookingTab>('staff');
  const [errorMessage, setErrorMessage] = useState<string>('');
  
  // Selection State
  const [selectedStaff, setSelectedStaff] = useState<User | null>(null);
  const [selectedServices, setSelectedServices] = useState<string[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedSlot, setSelectedSlot] = useState<ITimeSlot | null>(null);
  const [notes, setNotes] = useState('');
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [shouldFetchSlots, setShouldFetchSlots] = useState(false);

  // Queries
  const { data: staffList, isLoading: isLoadingStaff } = useGetAllStaff();

  const { data: allServicesData, isLoading: isLoadingServices } = useGetAllServices({ status: 'active' });
  // Standardized response: allServicesData is now directly the services array
  const allServices: IService[] = useMemo(() => {
    if (!allServicesData) return [];
    // Handle both array and object with services property for backward compatibility
    if (Array.isArray(allServicesData)) {
      return allServicesData;
    }
    return (allServicesData as any).services || [];
  }, [allServicesData]);

  // Slots Query - only runs when manually triggered via button
  const slotsParams = useMemo(() => {
    if (!selectedStaff?._id || selectedServices.length === 0 || !selectedDate) return null;
    return {
      staffId: selectedStaff._id,
      serviceId: selectedServices,
      date: format(selectedDate, 'yyyy-MM-dd'),
    };
  }, [selectedStaff, selectedServices, selectedDate]);

  const { data: slotsData, isLoading: isLoadingSlots, refetch: refetchSlots } = useGetSlots(slotsParams, {
    enabled: shouldFetchSlots && !!slotsParams,
  });
  const slots: ITimeSlot[] = slotsData?.slots || [];

  // Mutation
  const createMutation = useCreateAppointment();

  // Get current step number
  const currentStep = useMemo(() => {
    return TABS.find(tab => tab.key === activeTab)?.step || 1;
  }, [activeTab]);

  /**
   * Validate current tab and return error message if invalid
   */
  const validateCurrentTab = useCallback((): string | null => {
    if (activeTab === 'staff' && !selectedStaff) {
      return 'Please select a staff member.';
    }
    
    if (activeTab === 'services' && selectedServices.length === 0) {
      return 'Please select at least one service.';
    }
    
    if (activeTab === 'slots') {
      if (!selectedDate) {
        return 'Please select a date.';
      }
      if (!shouldFetchSlots) {
        return 'Please click "Check Availability" to see available slots.';
      }
      if (!selectedSlot) {
        return 'Please select a time slot.';
      }
    }
    
    if (activeTab === 'summary') {
      if (!selectedStaff) {
        return 'Please select a staff member.';
      }
      if (selectedServices.length === 0) {
        return 'Please select at least one service.';
      }
      if (!selectedSlot) {
        return 'Please select a time slot.';
      }
    }
    
    return null;
  }, [activeTab, selectedStaff, selectedServices, selectedDate, shouldFetchSlots, selectedSlot]);

  /**
   * Validate tab navigation (for step indicator clicks - doesn't show errors)
   */
  const validateTabNavigation = useCallback((targetTab: BookingTab): boolean => {
    // Don't set error messages here - only prevent navigation
    // Errors should only show when clicking "Next" button
    
    if (targetTab === 'services' && !selectedStaff) {
      return false;
    }
    
    if (targetTab === 'slots' && (!selectedStaff || selectedServices.length === 0)) {
      return false;
    }
    
    if (targetTab === 'summary' && (!selectedStaff || selectedServices.length === 0 || !selectedSlot)) {
      return false;
    }
    
    return true;
  }, [selectedStaff, selectedServices, selectedSlot]);

  /**
   * Handle tab change with validation (for step indicator clicks)
   */
  const handleTabChange = useCallback((tab: BookingTab) => {
    // Only allow navigation if validation passes
    // Don't show errors here - errors only show when clicking "Next"
    if (!validateTabNavigation(tab)) {
      return;
    }
    setActiveTab(tab);
    setErrorMessage(''); // Clear any existing errors when navigating
  }, [validateTabNavigation]);

  /**
   * Clear error when selection is made on current tab
   */
  useEffect(() => {
    // Only clear error if there's an error message and a valid selection is made
    if (errorMessage) {
      if (activeTab === 'staff' && selectedStaff) {
        setErrorMessage('');
      } else if (activeTab === 'services' && selectedServices.length > 0) {
        setErrorMessage('');
      } else if (activeTab === 'slots' && selectedSlot) {
        setErrorMessage('');
      }
    }
  }, [activeTab, selectedStaff, selectedServices, selectedSlot, errorMessage]);

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
    setSelectedDate(null); // Reset date
    setShouldFetchSlots(false); // Reset fetch flag
    // Don't automatically navigate - user must click "Next"
    setErrorMessage('');
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
    setSelectedDate(null); // Reset date
    setShouldFetchSlots(false); // Reset fetch flag
  }, []);

  /**
   * Check if a service is disabled (if it's not offered by the selected staff)
   */
  const isServiceDisabled = useCallback((serviceId: string) => {
    if (!selectedStaff) return false;
    const staffServices = (selectedStaff as any).services || [];
    const staffServiceIds = staffServices.map((s: any) => typeof s === 'string' ? s : s._id);
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
    setShouldFetchSlots(false); // Reset fetch flag when date changes
    setShowDatePicker(false);
  }, []);

  const hideDatePicker = useCallback(() => {
    setShowDatePicker(false);
  }, []);

  /**
   * Handle Check Availability button click
   */
  const handleCheckAvailability = useCallback(() => {
    if (!selectedDate) {
      setErrorMessage('Please select a date first.');
      return;
    }
    setShouldFetchSlots(true);
    setSelectedSlot(null); // Reset selected slot
    refetchSlots();
  }, [selectedDate, refetchSlots]);

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
    } catch {
      // Error handled by mutation
    }
  };

  /**
   * Render Step Indicator Header
   */
  const renderStepHeader = () => {
    const progress = (currentStep / TABS.length) * 100;
    
    return (
      <View className="bg-white border-b border-gray-100 space-y-4 p-3">

        <View className="flex-row items-center  justify-between">

          {/* current step & lable */}
          <View className="flex-row items-center gap-x-2">
            
            <View className="h-5 w-5 rounded-full items-center justify-center bg-brand-primary text-white text-xs font-bold">{TABS.find(tab => tab.key === activeTab)?.step}</View>

            <Text className="text-sm font-semibold text-brand-primary">{TABS.find(tab => tab.key === activeTab)?.label}</Text>

          </View>
       
          {/* Step numbers and labels */}
          <View className="flex-row items-center gap-x-2 md:gap-x-4 lg:gap-x-6">
            {TABS.map((tab) => {
              const isActive = tab.key === activeTab;
              const isCompleted = currentStep > tab.step;
              
              return (
                <TouchableOpacity
                  key={tab.key}
                  onPress={() => handleTabChange(tab.key)}
                  className="flex-1 items-center"
                  disabled={!validateTabNavigation(tab.key)}
                >
                  <View className="items-center">

                    {/* Step number circle */}
                    <View className={`h-6 w-6 rounded-full items-center justify-center ${
                      isActive 
                        ? 'bg-brand-primary' 
                        : isCompleted 
                          ? 'bg-brand-primary/30' 
                          : 'bg-gray-200'
                    }`}>
                      {isCompleted ? (
                        <MaterialIcons name="check" size={20} color="white" />
                      ) : (
                        <Text className={`text-base font-bold ${
                          isActive ? 'text-white' : 'text-gray-500'
                        }`}>
                          {tab.step}
                        </Text>
                      )}
                    </View>
                    
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>

        </View>
        
        {/* Progress bar */}
        <View className="h-2 bg-gray-100 rounded-full">
          <View 
            className="h-full bg-brand-primary rounded-full"
            style={{ width: `${progress}%` }}
          />
        </View>

      </View>
    );
  };

  /**
   * Render Staff Card Skeleton
   */
  const renderStaffSkeleton = () => {
    return Array.from({ length: 5 }).map((_, index) => (
      <View
        key={`skeleton-${index}`}
        className="mb-4 flex-row items-center p-4 rounded-2xl bg-white border border-gray-100 shadow-sm animate-pulse"
      >
        <View className="h-16 w-16 rounded-full bg-gray-200" />
        <View className="ml-4 flex-1">
          <View className="h-5 w-32 rounded bg-gray-200 mb-2" />
          <View className="h-4 w-24 rounded bg-gray-200 mb-2" />
          <View className="h-3 w-48 rounded bg-gray-200" />
        </View>
      </View>
    ));
  };

  /**
   * Render Service Card Skeleton
   */
  const renderServiceSkeleton = () => {
    return Array.from({ length: 5 }).map((_, index) => (
      <View
        key={`skeleton-${index}`}
        className="mb-3 flex-row items-center p-4 rounded-2xl bg-white border border-gray-100 shadow-sm animate-pulse"
      >
        <View className="flex-1">
          <View className="h-5 w-40 rounded bg-gray-200 mb-2" />
          <View className="h-4 w-32 rounded bg-gray-200" />
        </View>
        <View className="h-6 w-6 rounded bg-gray-200" />
      </View>
    ));
  };

  return (
    <View className="flex-1 bg-gray-50">
      <Stack.Screen 
        options={{
          title: 'Create Appointment',
          headerShown: true,
          headerRight: () => (
            <View className="mr-4">
              <Text className="text-sm font-semibold text-brand-primary">
                Step {currentStep} of {TABS.length}
              </Text>
            </View>
          ),
        }} 
      />
      
      {renderStepHeader()}



      <ScrollView className="flex-1">
        {/* Tab 1: Staff Selection */}
        {activeTab === 'staff' && (
          <View className="p-4">
            <Text className="text-xl font-bold text-gray-900 mb-4">Select Professional</Text>
            {isLoadingStaff ? (
              renderStaffSkeleton()
            ) : (
              staffList?.map((staff: any) => {
                const staffServices = ((staff as any).services || []).map((s: any) => 
                  typeof s === 'string' ? s : s.name || s
                );
                
                return (
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
                        <MaterialIcons name="person" size={40} color="#9CA3AF" />
                      )}
                    </View>
                    <View className="ml-4 flex-1">
                      <Text className="text-lg font-bold text-gray-900">{staff.firstName} {staff.lastName}</Text>
                      <Text className="text-sm text-gray-500">{staff.role}</Text>
                      
                      {/* Services list */}
                      {staffServices.length > 0 && (
                        <View className="mt-2">
                          <Text className="text-xs font-semibold text-gray-600 mb-1">Services Provided:</Text>
                          <View className="ml-2">
                            {staffServices.map((serviceName: string, idx: number) => (
                              <View key={idx} className="flex-row items-center mb-1">
                                <Text className="text-xs text-gray-500">• {serviceName}</Text>
                              </View>
                            ))}
                          </View>
                        </View>
                      )}
                    </View>
                    {selectedStaff?._id === staff._id && (
                      <MaterialIcons name="check-circle" size={24} color="#D4AF37" />
                    )}
                  </TouchableOpacity>
                );
              })
            )}
          </View>
        )}

        {/* Tab 2: Service Selection */}
        {activeTab === 'services' && (
          <View className="p-4">
            <Text className="text-xl font-bold text-gray-900 mb-4">Select Services</Text>
            {isLoadingServices ? (
              renderServiceSkeleton()
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
                <Text className="ml-3 font-bold text-gray-900">
                  {selectedDate ? format(selectedDate, 'PPPP') : 'Select a date'}
                </Text>
              </View>
              <Text className="text-brand-primary font-bold">Change</Text>
            </TouchableOpacity>

            <DatePickerModal
              locale="en"
              mode="single"
              visible={showDatePicker}
              onDismiss={hideDatePicker}
              date={selectedDate || undefined}
              onConfirm={handleConfirmDate}
              validRange={{
                startDate: new Date(),
              }}
            />

            {/* Check Availability Button */}
            <TouchableOpacity
              onPress={handleCheckAvailability}
              disabled={!selectedDate || isLoadingSlots}
              className={`mt-4 p-4 rounded-2xl shadow-sm  ${
                selectedDate && !isLoadingSlots
                  ? 'bg-brand-tint' 
                  : 'bg-gray-300'
              }`}
            >
              <Text className={`text-center font-bold ${
                selectedDate && !isLoadingSlots ? 'text-gray-900' : 'text-gray-500'
              }`}>
                {isLoadingSlots ? 'Checking...' : 'Check Availability'}
              </Text>
            </TouchableOpacity>

            {/* Slots Display */}
            {shouldFetchSlots && (
              <View className="mt-8">
                <Text className="text-base font-bold text-gray-700 mb-4">Available Slots for {selectedStaff?.firstName}</Text>
                
                {isLoadingSlots ? (
                  <ActivityIndicator color="#D4AF37" size="large" />
                ) : (
                  <>
                    {/* Show message if available (even if slots array is empty) */}
                    {slotsData?.message && (
                      <View className="mb-4 p-3 bg-brand-tint border border-brand-primary/20 rounded-xl">
                        <Text className="text-sm text-brand-primary font-medium text-center">
                          {slotsData.message}
                        </Text>
                      </View>
                    )}

                    {/* Show slots if available */}
                    {slots.length > 0 ? (
                      <View className="flex-row flex-wrap gap-3">
                        {slots.map((slot: any, index: number) => (
                          <TouchableOpacity
                            key={index}
                            onPress={() => setSelectedSlot(slot)}
                            className={`px-4 py-3 rounded-xl border ${
                              selectedSlot?.startTime === slot.startTime 
                                ? 'bg-brand-tint border-brand-primary' 
                                : 'bg-white border-gray-200'
                            }`}
                          >
                            <Text className={`font-bold ${
                              selectedSlot?.startTime === slot.startTime ? 'text-gray-800' : 'text-gray-700'
                            }`}>
                              {format(new Date(slot.startTime), 'p')}
                            </Text>
                          </TouchableOpacity>
                        ))}
                      </View>
                    ) : (
                      /* Show empty state only if no message was provided */
                      !slotsData?.message && (
                        <View className="items-center py-10">
                          <MaterialIcons name="event-busy" size={48} color="#D1D5DB" />
                          <Text className="mt-2 text-gray-400">No available slots for this date</Text>
                        </View>
                      )
                    )}
                  </>
                )}
              </View>
            )}
          </View>
        )}

        {/* Tab 4: Summary */}
        {activeTab === 'summary' && (
          <View className="p-4">
            <Text className="text-xl font-bold text-gray-900 mb-4">Review Appointment</Text>
            
            {/* Staff Card */}
            <View className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm mb-4">
              <View className="flex-row items-center justify-between mb-3">
                <View className="flex-row items-center">
                  <MaterialIcons name="person" size={20} color="#D4AF37" />
                  <Text className="text-base font-bold text-gray-900 ml-2">Staff</Text>
                </View>
                <TouchableOpacity
                  onPress={() => handleTabChange('staff')}
                  className="p-2"
                >
                  <MaterialIcons name="edit" size={20} color="#D4AF37" />
                </TouchableOpacity>
              </View>
              <View className="flex-row items-center">
                <Image 
                  source={{ uri: selectedStaff?.avatar || 'https://via.placeholder.com/150' }} 
                  className="h-12 w-12 rounded-full" 
                />
                <View className="ml-3 flex-1">
                  <Text className="text-base font-bold text-gray-900">
                    {selectedStaff?.firstName} {selectedStaff?.lastName}
                  </Text>
                  <View className="flex-row items-center mt-1">
                    <MaterialIcons name="work" size={14} color="#9CA3AF" />
                    <Text className="text-xs text-gray-500 ml-1">{selectedStaff?.role}</Text>
                  </View>
                </View>
              </View>
            </View>

            {/* Services Card */}
            <View className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm mb-4">
              <View className="flex-row items-center justify-between mb-3">
                <View className="flex-row items-center">
                  <MaterialIcons name="content-cut" size={20} color="#D4AF37" />
                  <Text className="text-base font-bold text-gray-900 ml-2">Services</Text>
                </View>
                <TouchableOpacity
                  onPress={() => handleTabChange('services')}
                  className="p-2"
                >
                  <MaterialIcons name="edit" size={20} color="#D4AF37" />
                </TouchableOpacity>
              </View>
              <View className="flex-1">
                {allServices
                  .filter((s: any) => selectedServices.includes(s._id))
                  .map((service: any, index: number) => (
                    <View key={service._id} className="flex-row items-center mb-2">
                      <MaterialIcons name="spa" size={16} color="#9CA3AF" />
                      <Text className="text-sm text-gray-600 ml-2 flex-1">
                        {index + 1}. {service.name} - {formatCurrency(service.fullPrice)}
                      </Text>
                    </View>
                  ))}
              </View>
            </View>

            {/* Date & Time Card */}
            {selectedDate && selectedSlot && (
              <View className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm mb-4">
                <View className="flex-row items-center justify-between mb-3">
                  <View className="flex-row items-center">
                    <MaterialIcons name="access-time" size={20} color="#D4AF37" />
                    <Text className="text-base font-bold text-gray-900 ml-2">Date & Time</Text>
                  </View>
                  <TouchableOpacity
                    onPress={() => handleTabChange('slots')}
                    className="p-2"
                  >
                    <MaterialIcons name="edit" size={20} color="#D4AF37" />
                  </TouchableOpacity>
                </View>
                <View className="flex-1">
                  <View className="flex-row items-center mb-2">
                    <MaterialIcons name="calendar-today" size={16} color="#9CA3AF" />
                    <Text className="text-sm text-gray-600 ml-2">
                      Date: {format(selectedDate, 'MMMM d, yyyy')}
                    </Text>
                  </View>
                  <View className="flex-row items-center mb-2">
                    <MaterialIcons name="schedule" size={16} color="#9CA3AF" />
                    <Text className="text-sm text-gray-600 ml-2">
                      Start: {format(new Date(selectedSlot.startTime), 'p')}
                    </Text>
                  </View>
                  <View className="flex-row items-center">
                    <MaterialIcons name="schedule" size={16} color="#9CA3AF" />
                    <Text className="text-sm text-gray-600 ml-2">
                      End: {format(new Date(selectedSlot.endTime), 'p')}
                    </Text>
                  </View>
                </View>
              </View>
            )}

            {/* Price Summary Card */}
            <View className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm mb-6">
              <View className="flex-row items-center mb-3">
                <MaterialIcons name="payments" size={20} color="#D4AF37" />
                <Text className="text-base font-bold text-gray-900 ml-2">Price Summary</Text>
              </View>
              <View className="flex-row items-center justify-between mb-2">
                <View className="flex-row items-center">
                  <MaterialIcons name="timer" size={16} color="#9CA3AF" />
                  <Text className="text-sm text-gray-600 ml-2">Total Duration:</Text>
                </View>
                <Text className="text-sm font-bold text-gray-900">{totals.duration} mins</Text>
              </View>
              <View className="flex-row items-center justify-between">
                <View className="flex-row items-center">
                  <MaterialIcons name="attach-money" size={16} color="#9CA3AF" />
                  <Text className="text-base font-bold text-gray-900 ml-2">Total Price:</Text>
                </View>
                <Text className="text-base font-bold text-brand-primary">{formatCurrency(totals.price)}</Text>
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

        {/* Error Message */}
        {errorMessage ? (
          <View className="mx-4 mt-4 p-3 bg-red-50 border border-red-200 rounded-xl">
            <Text className="text-sm text-red-700 font-medium">{errorMessage}</Text>
          </View>
        ) : null}

      </ScrollView>

      {/* Navigation Footer */}
      <View className="p-4 bg-white border-t border-gray-100 flex-row gap-4">
        {activeTab !== 'staff' && (
          <TouchableOpacity 
            onPress={() => {
              // Clear error when going back to previous tab
              setErrorMessage('');
              
              // Check if previous tab has a selection and clear error if it does
              if (activeTab === 'services') {
                // Going back to staff tab - if staff is selected, no error
                if (selectedStaff) {
                  setErrorMessage('');
                }
                setActiveTab('staff');
              } else if (activeTab === 'slots') {
                // Going back to services tab - if services are selected, no error
                if (selectedServices.length > 0) {
                  setErrorMessage('');
                }
                setActiveTab('services');
              } else if (activeTab === 'summary') {
                // Going back to slots tab - if slot is selected, no error
                if (selectedSlot) {
                  setErrorMessage('');
                }
                setActiveTab('slots');
              }
            }}
            className="btn-secondary flex-1"
          >
            <Text className="font-bold text-gray-700">Previous</Text>
          </TouchableOpacity>
        )}
        
        <TouchableOpacity 
          onPress={() => {
            // Validate current tab and show specific error
            const error = validateCurrentTab();
            if (error) {
              setErrorMessage(error);
              return;
            }
            
            // Clear error if validation passes
            setErrorMessage('');
            
            // Proceed to next tab
            if (activeTab === 'staff') {
              setActiveTab('services');
            } else if (activeTab === 'services') {
              setActiveTab('slots');
            } else if (activeTab === 'slots') {
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
              {activeTab === 'summary' ? 'Book' : 'Next'}
            </Text>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default AppointmentCreateScreen;
