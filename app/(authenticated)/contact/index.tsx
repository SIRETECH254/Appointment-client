import React, { useState, useEffect, useMemo, useCallback } from 'react';
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
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useGetAllContactMessages } from '@/tanstack/useContact';
import { formatDateTime } from '@/utils/notificationUtils';
import { IContact } from '@/types/api.types';

/**
 * @function ContactListScreen
 * @description Displays a list of submitted contact messages for authenticated users.
 * Allows searching, filtering by status, and navigating to message details.
 */
const ContactListScreen = () => {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  // Use the new status types for filtering
  const [filterStatus, setFilterStatus] = useState<'' | 'NEW' | 'READ' | 'REPLIED' | 'ARCHIVED'>('');

  // Debounce search input to avoid excessive API calls
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchTerm);
    }, 500);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Prepare parameters for the TanStack Query hook
  const params = useMemo(() => ({
    search: debouncedSearch || undefined,
    status: filterStatus || undefined,
  }), [debouncedSearch, filterStatus]);

  // Fetch contact messages using the custom TanStack hook
  // The data returned by useGetAllContactMessages is directly IContact[]
  const { data: messages, isLoading, refetch, isFetching } = useGetAllContactMessages(params);

  /**
   * @function renderItem
   * @description Renders a single contact message card in the FlatList.
   * @param {IContact} item - The contact message object.
   */
  const renderItem = useCallback(({ item }: { item: IContact }) => {
    // Determine status variant based on the IContact status enum
    const statusVariant = (status: IContact['status']) => {
      switch (status) {
        case 'NEW': return 'bg-blue-100 text-blue-700';
        case 'READ': return 'bg-gray-100 text-gray-700';
        case 'REPLIED': return 'bg-green-100 text-green-700';
        case 'ARCHIVED': return 'bg-orange-100 text-orange-700';
        default: return 'bg-gray-100 text-gray-700'; // Fallback
      }
    };

    return (
      <TouchableOpacity
        onPress={() => router.push(`/(authenticated)/contact/${item._id}`)}
        className="mb-3 rounded-xl border border-gray-100 bg-white p-4 shadow-sm"
      >
        <View className="flex-row items-start justify-between">
          <View className="flex-1">
            {/* Sender Name and Subject */}
            <Text className="text-base font-semibold text-gray-900" numberOfLines={1}>
              {item.name} - {item.subject}
            </Text>
            {/* Message preview */}
            <Text className="mt-1 text-sm text-gray-500" numberOfLines={2}>
              {item.message}
            </Text>
            {/* Date and Status */}
            <Text className="mt-2 text-[10px] text-gray-400 font-medium">
              {formatDateTime(item.createdAt.toString())}
            </Text>
          </View>
          {/* Status Badge */}
          <View className={`rounded-full px-2 py-0.5 ml-2 ${statusVariant(item.status)}`}>
            <Text className="text-[10px] font-semibold uppercase">
              {item.status}
            </Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  }, [router]);

  // Filter options for message status, using the new uppercase status values
  const statusFilters = [
    { label: 'All', value: '' },
    { label: 'New', value: 'NEW' },
    { label: 'Read', value: 'READ' },
    { label: 'Replied', value: 'REPLIED' },
    { label: 'Archived', value: 'ARCHIVED' },
  ];

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      {/* Stack.Screen: Configures the header for this screen. */}
      <Stack.Screen
        options={{
          title: 'Contact Messages',
          headerShown: true,
        }}
      />

      {/* View: Header section containing search bar and filter chips. */}
      <View className="px-4 py-3 bg-white border-b border-gray-100">
        {/* Search Bar */}
        <View className="relative">
          {/* MaterialIcons: Search icon within the text input. */}
          <View className="absolute left-3 top-3.5 z-10">
            <MaterialIcons name="search" size={20} color="#9CA3AF" />
          </View>
          {/* TextInput: For searching contact messages. */}
          <TextInput
            placeholder="Search messages..."
            value={searchTerm}
            onChangeText={setSearchTerm}
            className="rounded-xl border border-gray-200 bg-gray-50 py-3 pl-10 pr-4 text-sm font-inter text-gray-900"
          />
        </View>

        {/* Filter Chips */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          className="mt-3"
          contentContainerStyle={{ gap: 8 }}
        >
          {statusFilters.map((filter) => (
            // TouchableOpacity: Individual filter chip.
            <TouchableOpacity
              key={filter.value}
              onPress={() => setFilterStatus(filter.value as '' | 'NEW' | 'READ' | 'REPLIED' | 'ARCHIVED')}
              className={`rounded-full px-4 py-1.5 ${
                filterStatus === filter.value
                  ? 'bg-brand-primary'
                  : 'bg-gray-100'
              }`}
            >
              {/* Text: Label for the filter chip. */}
              <Text
                className={`text-xs font-semibold ${
                  filterStatus === filter.value ? 'text-white' : 'text-gray-600'
                }`}
              >
                {filter.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Conditional rendering for loading state */}
      {isLoading && !isFetching ? (
        // View: Loading indicator container.
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#D4AF37" />
          {/* Text: Loading message. */}
          <Text className="mt-2 text-gray-500">Loading messages...</Text>
        </View>
      ) : (
        // FlatList: Displays the list of contact messages.
        <FlatList
          data={messages} // Data source for the list.
          renderItem={renderItem} // Function to render each item.
          keyExtractor={(item) => item._id} // Unique key for each item.
          contentContainerStyle={{ padding: 16 }} // Padding for the content inside FlatList.
          refreshControl={
            // RefreshControl: Enables pull-to-refresh functionality.
            <RefreshControl
              refreshing={isFetching} // Binds refreshing state to isFetching.
              onRefresh={refetch} // Triggers refetch on pull.
              colors={['#D4AF37']} // Color of the refresh indicator.
            />
          }
          ListEmptyComponent={() => (
            // View: Component to show when the list is empty.
            <View className="flex-1 items-center justify-center py-20">
              {/* MaterialIcons: Icon for empty state. */}
              <MaterialIcons name="inbox" size={64} color="#E5E7EB" />
              {/* Text: Message for empty state. */}
              <Text className="mt-4 text-lg font-semibold text-gray-500">
                No contact messages found
              </Text>
              {/* Text: Guidance message for empty state. */}
              <Text className="mt-1 text-sm text-gray-400">
                Try adjusting your search or filters
              </Text>
            </View>
          )}
        />
      )}
    </SafeAreaView>
  );
};

export default ContactListScreen;