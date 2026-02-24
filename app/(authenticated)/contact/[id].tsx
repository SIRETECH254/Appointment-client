import React, { useCallback, useEffect } from 'react'; // React.useEffect instead of React.useEffect
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  SafeAreaView,
  Linking, // Ensure Linking is imported for tel:
} from 'react-native';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import {
  useGetContactMessageById,
  useUpdateContactMessageStatus,
} from '@/tanstack/useContact'; // Import from useContact.ts
import { formatDateTimeWithTime } from '@/utils/notificationUtils';
import { IContact } from '@/types/api.types'; // Import IContact

/**
 * @function ContactDetailsScreen
 * @description Displays the full content and metadata of a specific contact message.
 * Provides actions like marking as read and archiving.
 */
const ContactDetailsScreen = () => {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();

  // Fetch contact message details
  const { data, isLoading, isError } = useGetContactMessageById(id!);
  const message = data as IContact; // Cast data to IContact type

  // Mutation hooks for updating message status.
  const updateStatusMutation = useUpdateContactMessageStatus();

  /**
   * @function handleMarkAsRead
   * @description Marks the current contact message as read if it's not already.
   * Calls the `updateStatusMutation` and handles potential errors.
   */
  const handleMarkAsRead = useCallback(async () => {
    if (!message || message.status === 'READ') return; // Only mark if message exists and is 'NEW'.
    try {
      await updateStatusMutation.mutateAsync({ contactId: message._id, status: 'READ' });
      // Optionally show a toast/alert or just let query invalidation handle UI update.
    } catch (error) {
      console.error('Failed to mark as read:', error);
      Alert.alert('Error', 'Failed to mark message as read.');
    }
  }, [message, updateStatusMutation]);

  /**
   * @function handleArchive
   * @description Archives the current contact message after user confirmation.
   * Calls the `updateStatusMutation` and navigates back to the list on success.
   */
  const handleArchive = useCallback(() => {
    Alert.alert(
      'Archive Message',
      'Are you sure you want to archive this message?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Archive',
          style: 'destructive',
          onPress: async () => {
            try {
              await updateStatusMutation.mutateAsync({ contactId: id!, status: 'ARCHIVED' });
              router.back(); // Navigate back to the list after archiving.
            } catch (error) {
              console.error('Failed to archive message:', error);
              Alert.alert('Error', 'Failed to archive message.');
            }
          },
        },
      ]
    );
  }, [id, updateStatusMutation, router]);

  // Effect to mark the message as read automatically when the details screen is opened.
  // Use a direct import of useEffect if React.useEffect is causing issues
  useEffect(() => {
    if (message && message.status === 'NEW') {
      handleMarkAsRead();
    }
  }, [message, handleMarkAsRead]);

  // Render loading state while fetching message details.
  if (isLoading) {
    return (
      <View className="flex-1 items-center justify-center bg-white">
        <ActivityIndicator size="large" color="#D4AF37" />
        <Text className="mt-2 text-gray-500">Loading message...</Text>
      </View>
    );
  }

  // Render error state if message fetching fails or message is not found.
  if (isError || !message) {
    return (
      <View className="flex-1 items-center justify-center p-6 bg-white">
        <MaterialIcons name="error-outline" size={64} color="#EF4444" />
        <Text className="mt-4 text-lg font-semibold text-gray-900 text-center">
          Failed to load message details or message not found.
        </Text>
        {/* TouchableOpacity: Button to navigate back to the previous screen. */}
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
    // SafeAreaView: Ensures content is not obscured by device notches or status bar.
    <SafeAreaView className="flex-1 bg-gray-50">
      {/* Stack.Screen: Configures the header for this screen. */}
      <Stack.Screen
        options={{
          title: 'Message Details', // Title displayed in the header.
          headerShown: true, // Ensures the header is visible.
          // headerRight: Allows custom components in the header's right side (e.g., action buttons).
          headerRight: () => (
            <View className="flex-row items-center mr-4">
              {/* TouchableOpacity: Button to archive the message. */}
              <TouchableOpacity onPress={handleArchive} disabled={updateStatusMutation.isPending}>
                <MaterialIcons name="archive" size={24} color="#374151" />
              </TouchableOpacity>
              {/* Add other actions here, e.g., Reply (using Linking.openURL for mailto) */}
            </View>
          ),
        }}
      />
      
      {/* ScrollView: Main scrollable area for message content and details. */}
      <ScrollView className="flex-1 p-6">
        {/* View: Container for sender information and subject. */}
        <View className="mb-6 p-4 bg-white rounded-xl border border-gray-100 shadow-sm">
          {/* Text: Displays sender's name. */}
          <Text className="text-xl font-bold text-gray-900 mb-1">{message.name}</Text>
          {/* Text: Displays sender's email address. */}
          <Text className="text-sm text-gray-600 mb-3">{message.email}</Text>
          {/* Text: Displays the subject of the message. */}
          <Text className="text-lg font-semibold text-gray-800">Subject: {message.subject}</Text>
        </View>

        {/* View: Container for the main message body. */}
        <View className="mb-6 p-4 bg-white rounded-xl border border-gray-100 shadow-sm">
          {/* Text: Displays the full content of the message. */}
          <Text className="text-base leading-6 text-gray-700">{message.message}</Text>
        </View>

        {/* View: Container for message metadata (phone, status, timestamps). */}
        <View className="mb-6 p-4 bg-white rounded-xl border border-gray-100 shadow-sm">
          {/* Text: Label for metadata section. */}
          <Text className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
            Message Details
          </Text>
          {/* Conditional rendering for phone number if available. */}
          {message.phone && (
            <View className="flex-row justify-between items-center py-1 border-b border-gray-50">
              <Text className="text-sm text-gray-500">Phone</Text>
              {/* TouchableOpacity: Makes the phone number tappable to initiate a call. */}
              <TouchableOpacity onPress={() => Linking.openURL(`tel:${message.phone}`)}>
                <Text className="text-sm font-medium text-brand-primary">{message.phone}</Text>
              </TouchableOpacity>
            </View>
          )}
          {/* View: Displays message status. */}
          <View className="flex-row justify-between items-center py-1 border-b border-gray-50">
            <Text className="text-sm text-gray-500">Status</Text>
            <Text className="text-sm font-medium text-gray-700 capitalize">{message.status.toLowerCase()}</Text>
          </View>
          {/* View: Displays message submission timestamp. */}
          <View className="flex-row justify-between items-center py-1">
            <Text className="text-sm text-gray-500">Submitted On</Text>
            <Text className="text-sm font-medium text-gray-700">
              {formatDateTimeWithTime(message.createdAt.toString())}
            </Text>
          </View>
        </View>
      </ScrollView>

      {/* View: Fixed footer for action buttons. */}
      <View className="p-4 border-t border-gray-100 bg-white">
        {/* Conditional rendering for 'Mark as Read' button if message is 'NEW'. */}
        {message.status === 'NEW' && (
          <TouchableOpacity
            onPress={handleMarkAsRead}
            disabled={updateStatusMutation.isPending}
            className="btn-primary w-full"
          >
            {updateStatusMutation.isPending ? (
              <ActivityIndicator color="white" />
            ) : (
              <Text className="text-white font-bold text-lg">Mark as Read</Text>
            )}
          </TouchableOpacity>
        )}
        {/* TouchableOpacity: Button to navigate back to the contact list. */}
        <TouchableOpacity
          onPress={() => router.back()}
          className={`mt-2 ${message.status === 'NEW' ? 'btn-secondary' : 'btn-primary'} w-full`}
        >
          <Text className={`${message.status === 'NEW' ? 'text-gray-700' : 'text-white'} font-bold text-lg`}>
            Back to Messages
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

export default ContactDetailsScreen;
