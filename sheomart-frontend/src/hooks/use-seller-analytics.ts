import { useQuery } from "@tanstack/react-query";
import {
  fetchSellerAnalytics,
  type SellerAnalyticsQuery,
  type SellerAnalyticsOverview,
} from "@/services/seller-analytics";

export function useSellerAnalytics(query?: SellerAnalyticsQuery) {
  return useQuery<SellerAnalyticsOverview | undefined>({
    queryKey: ["seller-analytics", query?.range, query?.from, query?.to],
    queryFn: () => fetchSellerAnalytics(query),
    staleTime: 1000 * 60 * 3, // 3 minutes
  });
}
