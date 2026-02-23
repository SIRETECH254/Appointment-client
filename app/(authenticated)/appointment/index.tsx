import React, { useState, useMemo, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  TextInput,
  ScrollView,
} from 'react-native';
import { useRouter, Stack } from 'expo-router';
import { useGetMyAppointments } from '@/tanstack/useAppointments';
import {
  formatAppointmentDateTime,
  formatAppointmentStatus,
  getAppointmentStatusVariant,
} from '@/utils/appointmentUtils';
import { formatCurrency } from '@/utils/paymentUtils';
import type { IAppointment } from '@/types/api.types';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';

/**
 * Appointment List Screen
 * Displays a scrollable list of customer appointments with search and status filtering.
 */
const AppointmentListScreen = () => {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');

  // Debounce search input to avoid excessive API calls
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchTerm);
    }, 500);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Prepare parameters for the TanStack Query hook
  const params : any = useMemo(() => ({
    search: debouncedSearch || undefined,
    status: filterStatus === 'all' ? undefined : filterStatus.toLowerCase(),
  }), [debouncedSearch, filterStatus]);

  // Fetch appointments using the custom TanStack hook
  const { data, isLoading, refetch, isFetching } = useGetMyAppointments(params);
  const appointments = data || [];


  /**
   * Render a single appointment card
   */
  const renderItem = ({ item }: { item: IAppointment }) => {
    const statusVariant = getAppointmentStatusVariant(item.status);
    
    return (
      <TouchableOpacity
        onPress={() => router.push(`/(authenticated)/appointment/${item._id}`)}
        className="mb-4 rounded-2xl border border-gray-100 bg-white p-4 shadow-sm"
      >
        <View className="flex-row items-start justify-between">
          <View className="flex-1">
            <Text className="text-lg font-bold text-gray-900" numberOfLines={1}>
              {item.services.map(s => s.name).join(', ')}
            </Text>
            
            <View className="mt-2 flex-row items-center">
              <MaterialIcons name="event" size={16} color="#6B7280" />
              <Text className="ml-1 font-inter text-sm text-gray-600">
                {formatAppointmentDateTime(item.startTime)}
              </Text>
            </View>

            <View className="mt-1 flex-row items-center">
              <MaterialIcons name="access-time" size={16} color="#9CA3AF" />
              <Text className="ml-1 font-inter text-[10px] text-gray-400">
                Booked on: {formatAppointmentDateTime(item.createdAt)}
              </Text>
            </View>

            <View className="mt-1 flex-row items-center">
              <MaterialIcons name="person-outline" size={16} color="#6B7280" />
              <Text className="ml-1 font-inter text-sm text-gray-600">
                Staff: {typeof item.staffId === 'object' ? `${item.staffId.firstName} ${item.staffId.lastName}` : item.staffId}
              </Text>
            </View>
          </View>

          <View className={`badge ${statusVariant}`}>
            <Text className="text-xs font-semibold">
              {formatAppointmentStatus(item.status)}
            </Text>
          </View>
        </View>

        <View className="mt-4 flex-row items-center justify-between border-t border-gray-50 pt-3">
          <View>
            <Text className="text-[10px] uppercase tracking-wider text-gray-400">Total Amount</Text>
            <Text className="font-inter text-base font-bold text-brand-primary">
              {formatCurrency(item.remainingAmount + item.bookingFeeAmount)}
            </Text>
          </View>
          
          <MaterialIcons name="chevron-right" size={24} color="#D1D5DB" />
        </View>
      </TouchableOpacity>
    );
  };

  const statusFilters = [
    { label: 'All', value: 'all' },
    { label: 'Pending', value: 'pending' },
    { label: 'Confirmed', value: 'confirmed' },
    { label: 'Completed', value: 'completed' },
    { label: 'Cancelled', value: 'cancelled' },
  ];

  return (
    <View className="flex-1 bg-gray-50">
      <Stack.Screen 
        options={{
          title: 'My Appointments',
          headerShown: true,
        }} 
      />

      {/* Header with Search and Status Filters */}
      <View className="bg-white border-b border-gray-100 px-4 pb-4 pt-2">
        <View className="relative">
          <View className="absolute left-3 top-3 z-10">
            <MaterialIcons name="search" size={20} color="#9CA3AF" />
          </View>
          <TextInput
            placeholder="Search by service..."
            value={searchTerm}
            onChangeText={setSearchTerm}
            className="input-search bg-gray-50"
          />
          {searchTerm.length > 0 && (
            <TouchableOpacity 
              onPress={() => setSearchTerm('')}
              className="absolute right-3 top-3 z-10"
            >
              <MaterialIcons name="cancel" size={20} color="#9CA3AF" />
            </TouchableOpacity>
          )}
        </View>

        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          className="mt-4"
          contentContainerStyle={{ gap: 8 }}
        >
          {statusFilters.map((filter) => (
            <TouchableOpacity
              key={filter.value}
              onPress={() => setFilterStatus(filter.value)}
              className={`rounded-full px-4 py-2 ${
                filterStatus === filter.value ? 'bg-brand-primary' : 'bg-gray-100'
              }`}
            >
              <Text className={`text-xs font-semibold ${
                filterStatus === filter.value ? 'text-white' : 'text-gray-600'
              }`}>
                {filter.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Main List */}
      {isLoading && !isFetching ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#D4AF37" />
          <Text className="mt-2 text-gray-500">Loading appointments...</Text>
        </View>
      ) : (
        <FlatList
          data={appointments}
          renderItem={renderItem}
          keyExtractor={(item) => item._id}
          contentContainerStyle={{ padding: 16, paddingBottom: 100 }}
          refreshControl={
            <RefreshControl
              refreshing={isFetching}
              onRefresh={refetch}
              colors={['#D4AF37']}
            />
          }
          ListEmptyComponent={() => (
            <View className="flex-1 items-center justify-center py-20">
              <View className="h-20 w-20 items-center justify-center rounded-full bg-gray-100">
                <MaterialIcons name="event-busy" size={40} color="#9CA3AF" />
              </View>
              <Text className="mt-4 text-lg font-bold text-gray-900">No appointments found</Text>
              <Text className="mt-1 text-center text-gray-500">
                Try adjusting your search or filters
              </Text>
            </View>
          )}
        />
      )}

      {/* Floating Action Button for Booking */}
      <TouchableOpacity
        onPress={() => router.push('/(authenticated)/appointment/create')}
        className="absolute bottom-6 right-6 h-14 w-14 items-center justify-center rounded-full bg-brand-primary shadow-lg"
      >
        <MaterialIcons name="add" size={32} color="white" />
      </TouchableOpacity>
    </View>
  );
};

export default AppointmentListScreen;
