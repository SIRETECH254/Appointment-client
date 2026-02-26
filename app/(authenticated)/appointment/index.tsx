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
import AppointmentCard from '@/components/ui/AppointmentCard';
import AppointmentCardSkeleton from '@/components/ui/AppointmentCardSkeleton';
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
    return <AppointmentCard appointment={item} />;
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
        <View className="flex-1 p-4">
          {[...Array(3)].map((_, index) => (
            <AppointmentCardSkeleton key={index} />
          ))}
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
