import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { paymentAPI } from '../api';
import type { GetMyPaymentsParams, InitiatePaymentPayload, ServicePaymentPayload } from '../types/api.types';

const DEFAULT_STALE_TIME = 1000 * 60 * 5;
const DEFAULT_GC_TIME = 1000 * 60 * 10;

// Get all payments (Admin/Staff)
export const useGetAllPayments = (params: any = {}) => {
  return useQuery({
    queryKey: ['payments', 'all', params],
    queryFn: async () => {
      // Note: This endpoint might not be available for normal users
      const response = await paymentAPI.getMyPayments(params); 
      return response.data.data;
    },
    staleTime: DEFAULT_STALE_TIME,
    gcTime: DEFAULT_GC_TIME,
  });
};

// Get my payments (Customer)
export const useGetMyPayments = (params: GetMyPaymentsParams = {}) => {
  return useQuery({
    queryKey: ['payments', 'my', params],
    queryFn: async () => {
      const response = await paymentAPI.getMyPayments(params);
      return response.data.data;
    },
    staleTime: DEFAULT_STALE_TIME,
    gcTime: DEFAULT_GC_TIME,
  });
};

// Get single payment
export const useGetPaymentById = (paymentId: string) => {
  return useQuery({
    queryKey: ['payment', paymentId],
    queryFn: async () => {
      const response = await paymentAPI.getPayment(paymentId);
      return response.data.data.payment;
    },
    enabled: !!paymentId,
    staleTime: DEFAULT_STALE_TIME,
    gcTime: DEFAULT_GC_TIME,
  });
};

// Initiate payment
export const useInitiatePayment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (paymentData: InitiatePaymentPayload) => {
      const response = await paymentAPI.initiatePayment(paymentData);
      return response.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['payments'] });
      console.log('Payment initiated successfully');
    },
    onError: (error: any) => {
      console.error('Initiate payment error:', error);
      const errorMessage = error.response?.data?.message || 'Failed to initiate payment';
      console.error('Error:', errorMessage);
    },
  });
};

// Service payment
export const useServicePayment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (paymentData: ServicePaymentPayload) => {
      const response = await paymentAPI.servicePayment(paymentData);
      return response.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['payments'] });
      queryClient.invalidateQueries({ queryKey: ['appointments'] });
      console.log('Service payment completed successfully');
    },
    onError: (error: any) => {
      console.error('Service payment error:', error);
      const errorMessage = error.response?.data?.message || 'Failed to complete service payment';
      console.error('Error:', errorMessage);
    },
  });
};

// Query M-Pesa payment status (for fallback query)
export const useQueryMpesaStatus = (checkoutRequestId: string, options?: { enabled?: boolean }) => {
  return useQuery({
    queryKey: ['payment', 'mpesa-status', checkoutRequestId],
    queryFn: async () => {
      const response = await paymentAPI.queryMpesaStatus(checkoutRequestId);
      return response.data.data;
    },
    enabled: (options?.enabled ?? false) && !!checkoutRequestId,
    staleTime: 0,
    gcTime: 1000 * 60 * 5,
  });
};
