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
import {
  formatPaymentStatus,
  getPaymentStatusVariant,
  formatPaymentMethod,
  formatCurrency,
} from '@/utils/paymentUtils';
import { formatDateTime } from '@/utils/notificationUtils';
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
    const statusVariant = getPaymentStatusVariant(item.status);
    
    return (
      <TouchableOpacity
        onPress={() => router.push(`/(authenticated)/payments/${item._id}`)}
        className="mb-4 rounded-2xl border border-gray-100 bg-white p-4 shadow-sm"
      >
        <View className="flex-row items-start justify-between">
          <View className="flex-1">
            <Text className="text-xs font-mono font-bold text-gray-400 uppercase tracking-widest">
              {item.paymentNumber}
            </Text>
            <Text className="mt-1 text-2xl font-bold text-gray-900">
              {formatCurrency(item.amount, item.currency)}
            </Text>
            
            <View className="mt-3 flex-row items-center">
              <MaterialIcons name="event" size={14} color="#9CA3AF" />
              <Text className="ml-1 text-xs text-gray-500">
                {formatDateTime(item.createdAt)}
              </Text>
              <View className="mx-2 h-1 w-1 rounded-full bg-gray-300" />
              <MaterialIcons name="payment" size={14} color="#9CA3AF" />
              <Text className="ml-1 text-xs text-gray-500">
                {formatPaymentMethod(item.method)}
              </Text>
            </View>
          </View>

          <View className={`badge ${statusVariant}`}>
            <Text className="text-[10px] font-bold uppercase">
              {formatPaymentStatus(item.status)}
            </Text>
          </View>
        </View>

        <View className="mt-4 flex-row items-center justify-between border-t border-gray-50 pt-3">
          <Text className="text-[10px] text-gray-400 italic">
            Type: {item.type.replace('_', ' ')}
          </Text>
          <MaterialIcons name="chevron-right" size={20} color="#D1D5DB" />
        </View>
      </TouchableOpacity>
    );
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
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#D4AF37" />
          <Text className="mt-2 text-gray-500">Loading history...</Text>
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
