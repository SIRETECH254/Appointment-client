import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { appointmentAPI } from '../api';
import type {
  CancelAppointmentPayload,
  ConfirmAppointmentPayload,
  CreateAppointmentPayload,
  // Removed: GetAppointmentsParams, // Not strictly needed as useGetAllAppointments is removed
  GetMyAppointmentsParams,
  RescheduleAppointmentPayload,
} from '../types/api.types';

const DEFAULT_STALE_TIME = 1000 * 60 * 5;
const DEFAULT_GC_TIME = 1000 * 60 * 10;

// Get my appointments
export const useGetMyAppointments = (params: GetMyAppointmentsParams = {}) => {
  return useQuery({
    queryKey: ['appointments', 'my', params],
    queryFn: async () => {
      const response = await appointmentAPI.getMyAppointments(params);
      return response.data.data;
    },
    staleTime: DEFAULT_STALE_TIME,
    gcTime: DEFAULT_GC_TIME,
  });
};

// Get single appointment
export const useGetAppointment = (appointmentId: string) => {
  return useQuery({
    queryKey: ['appointment', appointmentId],
    queryFn: async () => {
      const response = await appointmentAPI.getAppointment(appointmentId);
      return response.data.data;
    },
    enabled: !!appointmentId,
    staleTime: DEFAULT_STALE_TIME,
    gcTime: DEFAULT_GC_TIME,
  });
};

// Create appointment
export const useCreateAppointment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (appointmentData: CreateAppointmentPayload) => {
      const response = await appointmentAPI.create(appointmentData);
      return response.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['appointments'] }); // Invalidate both 'my' and general if used elsewhere
      queryClient.invalidateQueries({ queryKey: ['appointments', 'my'] });
      console.log('Appointment created successfully');
    },
    onError: (error: any) => {
      console.error('Create appointment error:', error);
      const errorMessage = error.response?.data?.message || 'Failed to create appointment';
      console.error('Error:', errorMessage);
    },
  });
};

// Confirm appointment
export const useConfirmAppointment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ appointmentId, paymentData }: { appointmentId: string; paymentData: ConfirmAppointmentPayload }) => {
      const response = await appointmentAPI.confirm(appointmentId, paymentData);
      return response.data.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['appointments'] });
      queryClient.invalidateQueries({ queryKey: ['appointments', 'my'] });
      queryClient.invalidateQueries({ queryKey: ['appointment', variables.appointmentId] });
      console.log('Appointment confirmed successfully');
    },
    onError: (error: any) => {
      console.error('Confirm appointment error:', error);
      const errorMessage = error.response?.data?.message || 'Failed to confirm appointment';
      console.error('Error:', errorMessage);
    },
  });
};

// Reschedule appointment
export const useRescheduleAppointment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ appointmentId, data }: { appointmentId: string; data: RescheduleAppointmentPayload }) => {
      const response = await appointmentAPI.reschedule(appointmentId, data);
      return response.data.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['appointments'] });
      queryClient.invalidateQueries({ queryKey: ['appointments', 'my'] });
      queryClient.invalidateQueries({ queryKey: ['appointment', variables.appointmentId] });
      console.log('Appointment rescheduled successfully');
    },
    onError: (error: any) => {
      console.error('Reschedule appointment error:', error);
      const errorMessage = error.response?.data?.message || 'Failed to reschedule appointment';
      console.error('Error:', errorMessage);
    },
  });
};

// Cancel appointment
export const useCancelAppointment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ appointmentId, data }: { appointmentId: string; data?: CancelAppointmentPayload }) => {
      const response = await appointmentAPI.cancel(appointmentId, data);
      return response.data.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['appointments'] });
      queryClient.invalidateQueries({ queryKey: ['appointments', 'my'] });
      queryClient.invalidateQueries({ queryKey: ['appointment', variables.appointmentId] });
      console.log('Appointment cancelled successfully');
    },
    onError: (error: any) => {
      console.error('Cancel appointment error:', error);
      const errorMessage = error.response?.data?.message || 'Failed to cancel appointment';
      console.error('Error:', errorMessage);
    },
  });
};