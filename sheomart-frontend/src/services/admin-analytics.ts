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

export async function downloadAnalyticsExport(
  type: "revenue" | "orders" | "users" | "reviews" | "coupons",
  from?: string,
  to?: string
): Promise<void> {
  const params = new URLSearchParams();
  params.set("type", type);
  if (from) params.set("from", from);
  if (to) params.set("to", to);

  const response = await api.get(`/api/v1/analytics/admin/export?${params.toString()}`, {
    responseType: "blob",
  });

  const blob = new Blob([response.data], { type: "text/csv;charset=utf-8;" });
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.setAttribute("download", `sheomart-${type}-analytics-${new Date().toISOString().slice(0, 10)}.csv`);
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(url);
}
