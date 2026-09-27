import api from "./api";
import type { ApiResponse } from "@/types/api";

export interface CustomerNotificationItem {
  id: string;
  title: string;
  message: string;
  type: "order" | "offer" | "coupon" | "system";
  timestamp: string;
  actionUrl?: string;
  priority: "low" | "medium" | "high";
  read?: boolean;
}

export async function fetchCustomerNotifications(): Promise<CustomerNotificationItem[]> {
  const response = await api.get<ApiResponse<{ notifications: CustomerNotificationItem[] }>>(
    "/api/v1/users/notifications"
  );
  return response.data.data?.notifications ?? [];
}
