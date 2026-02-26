import React, { useState, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  RefreshControl,
  Alert,
  ScrollView,
} from 'react-native';
import { useRouter, Stack } from 'expo-router';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import {
  useGetNotifications,
  useMarkAllNotificationsAsRead,
} from '@/tanstack/useNotifications';
import NotificationCard from '@/components/ui/NotificationCard';
import NotificationCardSkeleton from '@/components/ui/NotificationCardSkeleton';
import type { Notification } from '@/types/api.types';

/**
 * Notification List Screen
 * Displays a list of notifications with filtering and search capabilities.
 */
const NotificationListScreen = () => {
  const router = useRouter();
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [page] = useState(1);

  // Prepare API parameters
  const params = useMemo(() => ({
    page,
    limit: 20,
    category: filterCategory === 'all' ? undefined : filterCategory,
  }), [page, filterCategory]);

  // Fetch notifications
  const { data, isLoading, refetch, isFetching } = useGetNotifications(params);
  const notifications = data?.notifications || [];

  // Mutations
  const markAllAsReadMutation = useMarkAllNotificationsAsRead();

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
   * Renders a single notification item.
   */
  const renderItem = ({ item }: { item: Notification }) => (
    <NotificationCard
      notification={item}
    />
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

      {/* Filter Chips */}
      <View className="px-4 py-3 bg-white border-b border-gray-100">
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ gap: 8 }}
        >
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
        </ScrollView>
      </View>

      {isLoading && page === 1 ? (
        <View className="flex-1 p-4">
          {[...Array(5)].map((_, index) => (
            <NotificationCardSkeleton key={index} />
          ))}
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
