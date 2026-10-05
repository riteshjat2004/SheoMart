import api from "./api";
import type { ApiResponse } from "@/types/api";

export interface StoreNotificationItem {
  id: string;
  notificationId: string;
  type: "new-order" | "low-stock" | "coupon-expiring" | "review-received" | "admin-announcement" | "store-verification" | "system";
  title: string;
  message: string;
  data?: {
    orderId?: string;
    shortId?: string;
    grandTotal?: number;
    fulfillmentType?: string;
    itemCount?: number;
    customerName?: string;
    customerPhone?: string;
    paymentMethod?: string;
    status?: string;
    pickupStatus?: string;
    [key: string]: unknown;
  };
  link?: string;
  read: boolean;
  isRead: boolean;
  timestamp: string;
  createdAt: string;
}

export interface StoreNotificationsResponse {
  notifications: StoreNotificationItem[];
  total: number;
  unreadCount: number;
  page: number;
  limit: number;
  totalPages: number;
}

export async function fetchStoreNotifications(params?: {
  page?: number;
  limit?: number;
  unreadOnly?: boolean;
}): Promise<StoreNotificationsResponse> {
  const response = await api.get<ApiResponse<StoreNotificationsResponse>>(
    "/api/v1/notifications/store",
    { params }
  );
  return (
    response.data.data || {
      notifications: [],
      total: 0,
      unreadCount: 0,
      page: 1,
      limit: 20,
      totalPages: 0,
    }
  );
}

export async function fetchStoreUnreadCount(): Promise<number> {
  const response = await api.get<ApiResponse<{ count: number }>>(
    "/api/v1/notifications/store/unread-count"
  );
  return response.data.data?.count ?? 0;
}

export async function markNotificationAsRead(notificationId: string) {
  const response = await api.patch<ApiResponse<{ notification: StoreNotificationItem }>>(
    `/api/v1/notifications/${notificationId}/read`
  );
  return response.data.data?.notification;
}

export async function markAllStoreNotificationsAsRead() {
  const response = await api.patch<ApiResponse<{ modifiedCount: number }>>(
    "/api/v1/notifications/store/mark-all-read"
  );
  return response.data.data;
}
