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
  SafeAreaView,
} from 'react-native';
import { useRouter, Stack } from 'expo-router';
import { useGetMyPayments } from '@/tanstack/usePayments';
import PaymentCard from '@/components/ui/PaymentCard';
import PaymentCardSkeleton from '@/components/ui/PaymentCardSkeleton';
import type { IPayment } from '@/types/api.types';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';

/**
 * Payment History Screen
 * Displays a list of all payments made by the authenticated user.
 * Supports searching by payment number and filtering by status and method.
 */
const PaymentHistoryScreen = () => {
  const router = useRouter();
  
  // Search and Filter State
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');

  // Debounce search input to avoid unnecessary API calls
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchTerm);
    }, 500);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Memoized params for TanStack Query
  const params = useMemo(() => ({
    search: debouncedSearch || undefined,
    status: filterStatus === 'all' ? undefined : filterStatus.toUpperCase(),
  }), [debouncedSearch, filterStatus]);

  // Fetch payments using TanStack Query
  const { data, isLoading, refetch, isFetching } = useGetMyPayments(params);
  const payments = data?.payments || [];

  /**
   * Render a single payment card
   */
  const renderItem = ({ item }: { item: IPayment }) => {
    return <PaymentCard payment={item} />;
  };

  const statusFilters = [
    { label: 'All', value: 'all' },
    { label: 'Success', value: 'success' },
    { label: 'Pending', value: 'pending' },
    { label: 'Failed', value: 'failed' },
  ];

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <Stack.Screen 
        options={{
          title: 'Payment History',
          headerShown: true,
        }} 
      />

      {/* Header with Search and Filters */}
      <View className="bg-white border-b border-gray-100 px-4 pb-4 pt-2">
        <View className="relative">
          <View className="absolute left-3 top-3 z-10">
            <MaterialIcons name="search" size={20} color="#9CA3AF" />
          </View>
          <TextInput
            placeholder="Search payment number..."
            value={searchTerm}
            onChangeText={setSearchTerm}
            className="input-search bg-gray-50"
          />
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

      {/* Payment List */}
      {isLoading && !isFetching ? (
        <View className="flex-1 p-4">
          {[...Array(3)].map((_, index) => (
            <PaymentCardSkeleton key={index} />
          ))}
        </View>
      ) : (
        <FlatList
          data={payments}
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
                <MaterialIcons name="receipt" size={40} color="#9CA3AF" />
              </View>
              <Text className="mt-4 text-lg font-bold text-gray-900">No payments found</Text>
              <Text className="mt-1 text-center text-gray-500">
                You haven&apos;t made any payments matching these criteria.
              </Text>
            </View>
          )}
        />
      )}

      {/* Floating Action Button for Service Payment */}
      <TouchableOpacity
        onPress={() => router.push('/(authenticated)/payments/service')}
        className="absolute bottom-6 right-6 h-14 w-14 items-center justify-center rounded-full bg-brand-primary shadow-lg"
      >
        <MaterialIcons name="add-card" size={28} color="white" />
      </TouchableOpacity>
    </SafeAreaView>
  );
};

export default PaymentHistoryScreen;
