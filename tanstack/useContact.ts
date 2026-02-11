import { useMutation } from '@tanstack/react-query';
import { contactAPI } from '../api';
import type { SubmitContactPayload } from '../types/api.types';

const DEFAULT_STALE_TIME = 1000 * 60 * 5;
const DEFAULT_GC_TIME = 1000 * 60 * 10;

// Submit contact message
export const useSubmitContactMessage = () => {
  return useMutation({
    mutationFn: async (messageData: SubmitContactPayload) => {
      const response = await contactAPI.submitMessage(messageData);
      return response.data.data;
    },
    onSuccess: () => {
      console.log('Contact message submitted successfully');
    },
    onError: (error: any) => {
      console.error('Submit contact message error:', error);
      const errorMessage = error.response?.data?.message || 'Failed to submit contact message';
      console.error('Error:', errorMessage);
    },
  });
};