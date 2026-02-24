import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { contactAPI } from '../api';
import type { GetContactMessagesParams, IContact, SubmitContactPayload } from '../types/api.types';

const DEFAULT_STALE_TIME = 1000 * 60 * 5;
const DEFAULT_GC_TIME = 1000 * 60 * 10;

// Submit contact message (existing hook)
export const useSubmitContactMessage = () => {
  return useMutation({
    mutationFn: async (messageData: SubmitContactPayload) => {
      const response = await contactAPI.submitMessage(messageData);
      return response.data.data;
    },
    onSuccess: () => {
      // Invalidate the contact messages list to show the new submission
      useQueryClient().invalidateQueries({ queryKey: ['contactMessages'] });
      console.log('Contact message submitted successfully');
    },
    onError: (error: any) => {
      console.error('Submit contact message error:', error);
      const errorMessage = error.response?.data?.message || 'Failed to submit contact message';
      console.error('Error:', errorMessage);
    },
  });
};

/**
 * @hook useGetAllContactMessages
 * @description Fetches a paginated list of contact messages.
 * @param {GetContactMessagesParams} params - Query parameters for filtering and pagination.
 */
export const useGetAllContactMessages = (params: GetContactMessagesParams = {}) => {
  return useQuery<IContact[]>({
    queryKey: ['contactMessages', params],
    queryFn: async () => {
      const response = await contactAPI.getContactMessages(params);
      return response.data.data.contacts;
    },
    staleTime: DEFAULT_STALE_TIME,
    gcTime: DEFAULT_GC_TIME,
  });
};

/**
 * @hook useGetContactMessageById
 * @description Fetches details of a single contact message by its ID.
 * @param {string} contactId - The ID of the contact message to fetch.
 */
export const useGetContactMessageById = (contactId: string) => {
  return useQuery<IContact>({
    queryKey: ['contactMessage', contactId],
    queryFn: async () => {
      const response = await contactAPI.getContactMessageById(contactId);
      return response.data.data.contact;
    },
    enabled: !!contactId, // Only run if contactId exists
    staleTime: DEFAULT_STALE_TIME,
    gcTime: DEFAULT_GC_TIME,
  });
};

/**
 * @hook useUpdateContactMessageStatus
 * @description Updates the status of a specific contact message.
 * @param {string} contactId - The ID of the contact message to update.
 * @param {IContact['status']} status - The new status to set for the message.
 */
export const useUpdateContactMessageStatus = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ contactId, status }: { contactId: string; status: IContact['status'] }) => {
      // Assuming a PATCH endpoint for status update. Adjust if API is different.
      const response = await contactAPI.updateContactMessage(contactId, { status });
      return response.data.data;
    },
    onSuccess: (_, variables) => {
      // Invalidate list and detail query for the updated message
      queryClient.invalidateQueries({ queryKey: ['contactMessages'] });
      queryClient.invalidateQueries({ queryKey: ['contactMessage', variables.contactId] });
      console.log(`Contact message ${variables.contactId} status updated to ${variables.status}`);
    },
    onError: (error: any) => {
      console.error('Failed to update contact message status:', error);
      const errorMessage = error.response?.data?.message || 'Failed to update message status';
      console.error('Error:', errorMessage);
    },
  });
};