import api from "@/services/api";
import type { ApiResponse } from "@/types/api";
import type { AdminAnalyticsFilters, AdminAnalyticsOverview } from "@/types/admin-analytics";

export async function fetchAdminAnalyticsOverview(filters: AdminAnalyticsFilters): Promise<AdminAnalyticsOverview> {
  const params = new URLSearchParams();

  if (filters.from) params.set("from", filters.from);
  if (filters.to) params.set("to", filters.to);
  params.set("timezone", filters.timezone || "UTC");

  const response = await api.get<ApiResponse<AdminAnalyticsOverview>>(`/api/v1/analytics/admin/overview?${params.toString()}`);
  return response.data.data as AdminAnalyticsOverview;
}
