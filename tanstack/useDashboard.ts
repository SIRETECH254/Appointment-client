import { useQuery } from '@tanstack/react-query';
import { dashboardAPI } from '../api';
// Removed unused imports: GetRevenueStatsParams, GetStaffActivityStatsParams

const DEFAULT_STALE_TIME = 1000 * 60 * 5; // 5 minutes
const DEFAULT_GC_TIME = 1000 * 60 * 10; // 10 minutes

/**
 * Hook to fetch client dashboard statistics
 * @returns TanStack Query result with client dashboard data
 */
export const useGetClientDashboard = () => {
  return useQuery({
    queryKey: ['dashboard', 'client'],
    queryFn: async () => {
      const response = await dashboardAPI.getClientDashboard();
      return response.data;
    },
    staleTime: DEFAULT_STALE_TIME,
    gcTime: DEFAULT_GC_TIME,
  });
};