import React, { useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
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
  getTypeDisplayName,
} from '@/utils/notificationUtils';
import StatusBadge from '@/components/ui/StatusBadge';

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
      <SafeAreaView className="flex-1 bg-white">
        <Stack.Screen
          options={{
            title: 'Details',
            headerShown: true,
          }}
        />
        <ScrollView className="flex-1 px-6 pt-6">
          {/* Badges Skeleton */}
          <View className="flex-row items-center gap-2 mb-4 animate-pulse">
            <View className="h-6 w-24 bg-gray-200 rounded-full" />
            <View className="h-6 w-20 bg-gray-200 rounded-full" />
          </View>

          {/* Subject Skeleton */}
          <View className="h-8 bg-gray-200 rounded w-3/4 mb-4" />

          {/* Message Skeleton */}
          <View className="space-y-2 mb-8">
            <View className="h-4 bg-gray-200 rounded w-full" />
            <View className="h-4 bg-gray-200 rounded w-full" />
            <View className="h-4 bg-gray-200 rounded w-5/6" />
            <View className="h-4 bg-gray-200 rounded w-4/6" />
          </View>

          <View className="h-[1px] w-full bg-gray-100 mb-6" />

          {/* Metadata Skeleton */}
          <View className="space-y-4 mb-10">
            <View>
              <View className="h-3 bg-gray-200 rounded w-20 mb-2" />
              <View className="h-4 bg-gray-200 rounded w-48" />
            </View>
            <View>
              <View className="h-3 bg-gray-200 rounded w-16 mb-2" />
              <View className="h-4 bg-gray-200 rounded w-24" />
            </View>
            <View>
              <View className="h-3 bg-gray-200 rounded w-32 mb-2" />
              <View className="rounded-xl bg-gray-50 p-4 space-y-2">
                <View className="h-3 bg-gray-200 rounded w-full" />
                <View className="h-3 bg-gray-200 rounded w-5/6" />
              </View>
            </View>
          </View>
        </ScrollView>

        {/* Footer Skeleton */}
        <View className="p-6 border-t border-gray-100 animate-pulse">
          <View className="h-12 bg-gray-200 rounded-xl" />
        </View>
      </SafeAreaView>
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
          <StatusBadge
            status={notification.category}
            type="notification-category"
          />
          <StatusBadge
            status={notification.type}
            type="notification-type"
          />
        </View>

        {/* Subject with icon */}
        <View className="flex-row items-center mb-4">
          <View className="h-8 w-8 rounded-full bg-amber-100 items-center justify-center mr-3">
            <MaterialIcons name="subject" size={18} color="#D97706" />
          </View>
          <Text className="flex-1 text-2xl font-bold text-gray-900">
            {notification.subject}
          </Text>
        </View>

        {/* Message with icon */}
        <View className="mb-8">
          <View className="flex-row items-center mb-3">
            <View className="h-6 w-6 rounded-full bg-orange-100 items-center justify-center mr-2">
              <MaterialIcons name="message" size={14} color="#EA580C" />
            </View>
            <Text className="text-sm font-bold text-orange-700 uppercase tracking-wide">Message</Text>
          </View>
          <Text className="text-base leading-6 text-gray-700">
            {notification.message}
          </Text>
        </View>

        <View className="h-[1px] w-full bg-gray-100 mb-6" />

        {/* Metadata section */}
        <View className="space-y-4 mb-10">
          {/* Sent On with icon */}
          <View className="flex-row items-center">
            <View className="h-6 w-6 rounded-full bg-teal-100 items-center justify-center mr-3">
              <MaterialIcons name="schedule" size={14} color="#0D9488" />
            </View>
            <View>
              <Text className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                Sent On
              </Text>
              <Text className="mt-1 text-sm font-medium text-gray-700">
                {formatDateTimeWithTime(notification.createdAt)}
              </Text>
            </View>
          </View>

          {/* Status with icon */}
          {!notification.isUnread && (
            <View className="flex-row items-center mt-4">
              <View className="h-6 w-6 rounded-full bg-amber-100 items-center justify-center mr-3">
                <MaterialIcons name="done-all" size={14} color="#D97706" />
              </View>
              <View>
                <Text className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                  Status
                </Text>
                <Text className="mt-1 text-sm font-medium text-gray-700">
                  Read
                </Text>
              </View>
            </View>
          )}

          {/* Related Information with icon */}
          {/* @ts-ignore - metadata might exist in some notifications */}
          {notification.metadata && Object.keys(notification.metadata).length > 0 && (
            <View className="mt-4">
              <View className="flex-row items-center mb-2">
                <View className="h-6 w-6 rounded-full bg-orange-100 items-center justify-center mr-2">
                  <MaterialIcons name="info" size={14} color="#EA580C" />
                </View>
                <Text className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                  Related Information
                </Text>
              </View>
              <View className="mt-2 rounded-xl bg-gray-50 p-4">
                {Object.entries(notification.metadata).map(([key, value]) => (
                  <View key={key} className="flex-row justify-between items-center py-1">
                    <View className="flex-row items-center">
                      <MaterialIcons name="label" size={12} color="#9CA3AF" />
                      <Text className="ml-1 text-xs text-gray-500 font-medium">{key}:</Text>
                    </View>
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
