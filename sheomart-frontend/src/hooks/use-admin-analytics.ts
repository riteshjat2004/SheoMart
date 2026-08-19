import { useQuery } from "@tanstack/react-query";
import { fetchAdminAnalyticsOverview } from "@/services/admin-analytics";
import type { AdminAnalyticsFilters } from "@/types/admin-analytics";

export function useAdminAnalytics(filters: AdminAnalyticsFilters) {
  return useQuery({
    queryKey: ["admin-analytics-overview", filters],
    queryFn: () => fetchAdminAnalyticsOverview(filters),
    staleTime: 1000 * 60 * 2,
  });
}
