import React, { useState, useCallback, useMemo, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  TextInput,
  ActivityIndicator,
  RefreshControl,
  Alert,
} from 'react-native';
import { useRouter, Stack } from 'expo-router';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import {
  useGetNotifications,
  useMarkNotificationAsRead,
  useMarkAllNotificationsAsRead,
  useDeleteNotification,
} from '@/tanstack/useNotifications';
import {
  formatDateTime,
  getCategoryBadgeClass,
  getTypeDisplayName,
} from '@/utils/notificationUtils';
import type { Notification } from '@/types/api.types';

/**
 * Notification List Screen
 * Displays a list of notifications with filtering and search capabilities.
 */
const NotificationListScreen = () => {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [page, setPage] = useState(1);

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchTerm);
    }, 500);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Prepare API parameters
  const params = useMemo(() => ({
    page,
    limit: 20,
    search: debouncedSearch || undefined,
    category: filterCategory === 'all' ? undefined : filterCategory,
  }), [page, debouncedSearch, filterCategory]);

  // Fetch notifications
  const { data, isLoading, isError, refetch, isFetching } = useGetNotifications(params);
  const notifications = data?.notifications || [];

  // Mutations
  const markAsReadMutation = useMarkNotificationAsRead();
  const markAllAsReadMutation = useMarkAllNotificationsAsRead();
  const deleteNotificationMutation = useDeleteNotification();

  /**
   * Handles marking all notifications as read.
   */
  const handleMarkAllRead = useCallback(() => {
    Alert.alert(
      'Mark All Read',
      'Are you sure you want to mark all notifications as read?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Confirm', onPress: () => markAllAsReadMutation.mutate() },
      ]
    );
  }, [markAllAsReadMutation]);

  /**
   * Handles deleting a single notification.
   */
  const handleDelete = useCallback((id: string) => {
    Alert.alert(
      'Delete Notification',
      'Are you sure you want to delete this notification?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => deleteNotificationMutation.mutate(id),
        },
      ]
    );
  }, [deleteNotificationMutation]);

  /**
   * Renders a single notification item.
   */
  const renderItem = ({ item }: { item: Notification }) => (
    <TouchableOpacity
      onPress={() => router.push(`/(authenticated)/notifications/${item._id}`)}
      className="mb-3 rounded-xl border border-gray-100 bg-white p-4 shadow-sm"
    >
      <View className="flex-row items-start justify-between">
        <View className="flex-1">
          <View className="flex-row items-center gap-2 mb-1">
            <View className={`rounded-full px-2 py-0.5 ${getCategoryBadgeClass(item.category)}`}>
              <Text className="text-[10px] font-semibold uppercase">
                {item.category}
              </Text>
            </View>
            <Text className="text-[10px] text-gray-400 font-medium">
              {getTypeDisplayName(item.type)}
            </Text>
          </View>
          
          <Text 
            className={`text-base font-semibold text-gray-900 ${item.isUnread ? 'pr-6' : ''}`}
            numberOfLines={1}
          >
            {item.subject}
          </Text>
          
          <Text className="mt-1 text-sm text-gray-500" numberOfLines={2}>
            {item.message}
          </Text>
          
          <Text className="mt-2 text-[10px] text-gray-400 font-medium">
            {formatDateTime(item.createdAt)}
          </Text>
        </View>

        <View className="items-end justify-between ml-2">
          {item.isUnread && (
            <View className="h-2.5 w-2.5 rounded-full bg-blue-500" />
          )}
          <TouchableOpacity 
            onPress={() => handleDelete(item._id)}
            className="mt-4"
          >
            <MaterialIcons name="delete-outline" size={20} color="#EF4444" />
          </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
  );

  const categories = [
    { label: 'All', value: 'all' },
    { label: 'Appointment', value: 'appointment' },
    { label: 'Payment', value: 'payment' },
    { label: 'General', value: 'general' },
  ];

  return (
    <View className="flex-1 bg-gray-50">
      <Stack.Screen 
        options={{
          title: 'Notifications',
          headerShown: true,
          headerRight: () => (
            <TouchableOpacity onPress={handleMarkAllRead} className="mr-4">
              <Text className="text-sm font-semibold text-brand-primary">Mark all Read</Text>
            </TouchableOpacity>
          ),
        }} 
      />

      <View className="px-4 py-3 bg-white border-b border-gray-100">
        {/* Search Bar */}
        <View className="relative">
          <View className="absolute left-3 top-3.5 z-10">
            <MaterialIcons name="search" size={20} color="#9CA3AF" />
          </View>
          <TextInput
            placeholder="Search notifications..."
            value={searchTerm}
            onChangeText={setSearchTerm}
            className="rounded-xl border border-gray-200 bg-gray-50 py-3 pl-10 pr-4 text-sm font-inter text-gray-900"
          />
        </View>

        {/* Filter Chips */}
        <View className="flex-row mt-3 gap-2">
          {categories.map((cat) => (
            <TouchableOpacity
              key={cat.value}
              onPress={() => setFilterCategory(cat.value)}
              className={`rounded-full px-4 py-1.5 ${
                filterCategory === cat.value
                  ? 'bg-brand-primary'
                  : 'bg-gray-100'
              }`}
            >
              <Text
                className={`text-xs font-semibold ${
                  filterCategory === cat.value ? 'text-white' : 'text-gray-600'
                }`}
              >
                {cat.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {isLoading && page === 1 ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#D4AF37" />
        </View>
      ) : (
        <FlatList
          data={notifications}
          renderItem={renderItem}
          keyExtractor={(item) => item._id}
          contentContainerStyle={{ padding: 16 }}
          refreshControl={
            <RefreshControl
              refreshing={isFetching && page === 1}
              onRefresh={refetch}
              colors={['#D4AF37']}
            />
          }
          ListEmptyComponent={() => (
            <View className="flex-1 items-center justify-center py-20">
              <MaterialIcons name="notifications-none" size={64} color="#E5E7EB" />
              <Text className="mt-4 text-lg font-semibold text-gray-500">
                No notifications found
              </Text>
              <Text className="mt-1 text-sm text-gray-400">
                You&apos;re all caught up!
              </Text>
            </View>
          )}
        />
      )}
    </View>
  );
};

export default NotificationListScreen;
