import { useQuery } from '@tanstack/react-query'; // useMutation, useQueryClient no longer needed here
import { serviceAPI, userAPI } from '../api';
import type { GetServicesParams, IService /* Removed: AssignServicesToStaffPayload, CreateServicePayload, UpdateServicePayload */ } from '../types/api.types';

const DEFAULT_STALE_TIME = 1000 * 60 * 5;
const DEFAULT_GC_TIME = 1000 * 60 * 10;

// Get all services
export const useGetAllServices = (params: GetServicesParams = {}) => {
  return useQuery({
    queryKey: ['services', params],
    queryFn: async () => {
      const response = await serviceAPI.getAllServices(params);
      return response.data.data;
    },
    staleTime: DEFAULT_STALE_TIME,
    gcTime: DEFAULT_GC_TIME,
  });
};

// Get services by staff member (useful for client to see what services a staff offers)
export const useGetServicesByStaff = (staffId: string) => {
  return useQuery({
    queryKey: ['services', 'staff', staffId],
    queryFn: async () => {
      // First, get the staff user to get their services array
      const userResponse = await userAPI.getUserById(staffId); // Assuming userAPI is accessible and can get staff details
      const user = userResponse.data.data.user;
      
      if (!user || !user.services || user.services.length === 0) {
        return { services: [] };
      }

      // Get service IDs from user.services (could be populated or just IDs)
      const serviceIds = user.services.map((s: any) => 
        typeof s === 'string' ? s : s._id || s
      );

      // Fetch all services and filter to only those assigned to this staff
      const allServicesResponse = await serviceAPI.getAllServices({ status: 'active' });
      const allServices = allServicesResponse.data.data.services || [];
      
      const staffServices = allServices.filter((service: IService) => 
        serviceIds.includes(service._id)
      );

      return { services: staffServices };
    },
    enabled: !!staffId,
    staleTime: DEFAULT_STALE_TIME,
    gcTime: DEFAULT_GC_TIME,
  });
};

// Get single service
export const useGetServiceById = (serviceId: string) => {
  return useQuery({
    queryKey: ['service', serviceId],
    queryFn: async () => {
      const response = await serviceAPI.getService(serviceId);
      return response.data.data;
    },
    enabled: !!serviceId,
    staleTime: DEFAULT_STALE_TIME,
    gcTime: DEFAULT_GC_TIME,
  });
};