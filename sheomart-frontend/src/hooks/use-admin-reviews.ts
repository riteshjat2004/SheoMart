import { useQuery } from "@tanstack/react-query";
import { fetchAdminReviews } from "@/services/admin-reviews";
import type { AdminReviewFilters } from "@/types/admin-review";

export function useAdminReviews(filters: AdminReviewFilters) {
  return useQuery({
    queryKey: ["admin-reviews", filters],
    queryFn: () => fetchAdminReviews(filters),
    staleTime: 1000 * 60 * 2,
  });
}
