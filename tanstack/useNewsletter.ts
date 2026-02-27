import { useMutation } from '@tanstack/react-query';
import { newsletterAPI } from '../api';
import type { SubscribeNewsletterPayload } from '../types/api.types';

/**
 * @hook useSubscribeNewsletter
 * @description Subscribes an email to the newsletter.
 * If the user is authenticated, the token in the API config will automatically attach userId to the subscription.
 * @returns Mutation hook for newsletter subscription
 */
export const useSubscribeNewsletter = () => {
  return useMutation({
    mutationFn: async (subscriptionData: SubscribeNewsletterPayload) => {
      const response = await newsletterAPI.subscribe(subscriptionData);
      return response.data.data;
    },
    onSuccess: () => {
      console.log('Successfully subscribed to newsletter');
    },
    onError: (error: any) => {
      console.error('Newsletter subscription error:', error);
      const errorMessage = error.response?.data?.message || 'Failed to subscribe to newsletter';
      console.error('Error:', errorMessage);
    },
  });
};
