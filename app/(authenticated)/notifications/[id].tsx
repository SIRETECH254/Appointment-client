import React, { useCallback } from 'react';
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
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import {
  useGetNotification,
  useMarkNotificationAsRead,
  useDeleteNotification,
} from '@/tanstack/useNotifications';
import {
  formatDateTimeWithTime,
  getCategoryBadgeClass,
  getTypeDisplayName,
} from '@/utils/notificationUtils';

/**
 * Notification Details Screen
 * Displays the full content and metadata of a specific notification.
 */
const NotificationDetailsScreen = () => {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();

  // Fetch notification details
  const { data: notification, isLoading, isError } = useGetNotification(id!);
  
  // Mutations
  const markAsReadMutation = useMarkNotificationAsRead();
  const deleteMutation = useDeleteNotification();

  /**
   * Marks the current notification as read.
   */
  const handleMarkAsRead = useCallback(async () => {
    if (!notification || !notification.isUnread) return;
    try {
      await markAsReadMutation.mutateAsync(notification._id);
    } catch (error) {
      console.error('Failed to mark as read:', error);
    }
  }, [notification, markAsReadMutation]);

  /**
   * Handles deleting the current notification.
   */
  const handleDelete = useCallback(() => {
    Alert.alert(
      'Delete Notification',
      'Are you sure you want to delete this notification?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteMutation.mutateAsync(id!);
              router.back();
            } catch (error) {
              console.error('Failed to delete notification:', error);
            }
          },
        },
      ]
    );
  }, [id, deleteMutation, router]);

  // Effect to mark as read when opened
  React.useEffect(() => {
    if (notification && notification.isUnread) {
      handleMarkAsRead();
    }
  }, [notification, handleMarkAsRead]);

  if (isLoading) {
    return (
      <View className="flex-1 items-center justify-center bg-white">
        <ActivityIndicator size="large" color="#D4AF37" />
      </View>
    );
  }

  if (isError || !notification) {
    return (
      <View className="flex-1 items-center justify-center p-6 bg-white">
        <MaterialIcons name="error-outline" size={64} color="#EF4444" />
        <Text className="mt-4 text-lg font-semibold text-gray-900 text-center">
          Failed to load notification
        </Text>
        <TouchableOpacity
          onPress={() => router.back()}
          className="mt-6 rounded-xl bg-brand-primary px-6 py-3"
        >
          <Text className="font-semibold text-white">Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-white">
      <Stack.Screen
        options={{
          title: 'Details',
          headerShown: true,
          headerRight: () => (
            <TouchableOpacity onPress={handleDelete} className="mr-4">
              <MaterialIcons name="delete-outline" size={24} color="#EF4444" />
            </TouchableOpacity>
          ),
        }}
      />
      
      <ScrollView className="flex-1 px-6 pt-6">
        {/* Category & Type Badges */}
        <View className="flex-row items-center gap-2 mb-4">
          <View className={`rounded-full px-3 py-1 ${getCategoryBadgeClass(notification.category)}`}>
            <Text className="text-xs font-bold uppercase">
              {notification.category}
            </Text>
          </View>
          <View className="rounded-full bg-gray-100 px-3 py-1">
            <Text className="text-xs font-bold text-gray-600 uppercase">
              {getTypeDisplayName(notification.type)}
            </Text>
          </View>
        </View>

        {/* Subject */}
        <Text className="text-2xl font-bold text-gray-900 mb-4">
          {notification.subject}
        </Text>

        {/* Message */}
        <Text className="text-base leading-6 text-gray-700 mb-8">
          {notification.message}
        </Text>

        <View className="h-[1px] w-full bg-gray-100 mb-6" />

        {/* Metadata section */}
        <View className="space-y-4 mb-10">
          <View>
            <Text className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
              Sent On
            </Text>
            <Text className="mt-1 text-sm font-medium text-gray-700">
              {formatDateTimeWithTime(notification.createdAt)}
            </Text>
          </View>

          {!notification.isUnread && (
            <View className="mt-4">
              <Text className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                Status
              </Text>
              <Text className="mt-1 text-sm font-medium text-gray-700">
                Read
              </Text>
            </View>
          )}

          {/* @ts-ignore - metadata might exist in some notifications */}
          {notification.metadata && Object.keys(notification.metadata).length > 0 && (
            <View className="mt-4">
              <Text className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                Related Information
              </Text>
              <View className="mt-2 rounded-xl bg-gray-50 p-4">
                {Object.entries(notification.metadata).map(([key, value]) => (
                  <View key={key} className="flex-row justify-between py-1">
                    <Text className="text-xs text-gray-500 font-medium">{key}:</Text>
                    <Text className="text-xs text-gray-800 font-semibold">{String(value)}</Text>
                  </View>
                ))}
              </View>
            </View>
          )}
        </View>
      </ScrollView>

      {/* Bottom Action Button (Optional/Contextual) */}
      {notification.isUnread && (
        <View className="p-6 border-t border-gray-100">
          <TouchableOpacity
            onPress={handleMarkAsRead}
            className="w-full flex-row items-center justify-center rounded-xl bg-brand-primary py-4"
          >
            <MaterialIcons name="done-all" size={20} color="white" />
            <Text className="ml-2 font-bold text-white text-base">Mark as Read</Text>
          </TouchableOpacity>
        </View>
      )}
    </SafeAreaView>
  );
};

export default NotificationDetailsScreen;
