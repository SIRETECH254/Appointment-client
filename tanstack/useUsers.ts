import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { userAPI } from '../api';
import type {
  // Removed: AdminCreateUserPayload, AssignRolePayload,
  ChangePasswordPayload,
  GetCustomersParams,
  // Removed: GetUsersParams, SetUserAdminPayload,
  UpdateNotificationPreferencesPayload,
  UpdateProfilePayload,
  // Removed: UpdateUserStatusPayload,
} from '../types/api.types';

const DEFAULT_STALE_TIME = 1000 * 60 * 5;
const DEFAULT_GC_TIME = 1000 * 60 * 10;

// Get own profile
export const useGetProfile = () => {
  return useQuery({
    queryKey: ['user', 'profile'],
    queryFn: async () => {
      const response = await userAPI.getProfile();
      return response.data.data;
    },
    staleTime: DEFAULT_STALE_TIME,
    gcTime: DEFAULT_GC_TIME,
  });
};

// Update own profile
export const useUpdateProfile = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (profileData: UpdateProfilePayload | FormData) => {
      const response = await userAPI.updateProfile(profileData);
      return response.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user', 'profile'] });
      console.log('Profile updated successfully');
    },
    onError: (error: any) => {
      console.error('Update profile error:', error);
      const errorMessage = error.response?.data?.message || 'Failed to update profile';
      console.error('Error:', errorMessage);
    },
  });
};

// Change password
export const useChangePassword = () => {
  return useMutation({
    mutationFn: async (passwordData: ChangePasswordPayload) => {
      const response = await userAPI.changePassword(passwordData);
      return response.data.data;
    },
    onSuccess: () => {
      console.log('Password changed successfully');
    },
    onError: (error: any) => {
      console.error('Change password error:', error);
      const errorMessage = error.response?.data?.message || 'Failed to change password';
      console.error('Error:', errorMessage);
    },
  });
};

// Get notification preferences
export const useGetNotificationPreferences = () => {
  return useQuery({
    queryKey: ['user', 'notification-preferences'],
    queryFn: async () => {
      const response = await userAPI.getNotificationPreferences();
      return response.data.data;
    },
    staleTime: DEFAULT_STALE_TIME,
    gcTime: DEFAULT_GC_TIME,
  });
};

// Update notification preferences
export const useUpdateNotificationPreferences = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (preferences: UpdateNotificationPreferencesPayload) => {
      const response = await userAPI.updateNotificationPreferences(preferences);
      return response.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user', 'notification-preferences'] });
      console.log('Notification preferences updated successfully');
    },
    onError: (error: any) => {
      console.error('Update notification preferences error:', error);
      const errorMessage = error.response?.data?.message || 'Failed to update notification preferences';
      console.error('Error:', errorMessage);
    },
  });
};

// Get customers (users with customer role)
export const useGetCustomers = (params: GetCustomersParams = {}) => {
  return useQuery({
    queryKey: ['users', 'customers', params],
    queryFn: async () => {
      const response = await userAPI.getCustomers(params);
      return response.data.data;
    },
    staleTime: DEFAULT_STALE_TIME,
    gcTime: DEFAULT_GC_TIME,
  });
};

// Get staff members who provide a specific service (for booking flow)
export const useGetStaffByService = (serviceId: string) => {
  return useQuery({
    queryKey: ['users', 'staff', 'service', serviceId],
    queryFn: async () => {
      // Get all staff users
      // Assuming userAPI.getAllUsers can filter by role and status for client view
      const response = await userAPI.getAllUsers({ role: 'staff', status: 'active' });
      const allStaff = response.data.data.users || [];
      
      // Filter staff where their services array includes the serviceId
      const staffWithService = allStaff.filter((staff: any) => {
        if (!staff.services || staff.services.length === 0) return false;
        
        // Handle both populated services and service IDs
        return staff.services.some((s: any) => {
          const id = typeof s === 'string' ? s : s._id || s;
          return id === serviceId;
        });
      });

      return { users: staffWithService };
    },
    enabled: !!serviceId,
    staleTime: DEFAULT_STALE_TIME,
    gcTime: DEFAULT_GC_TIME,
  });
};
