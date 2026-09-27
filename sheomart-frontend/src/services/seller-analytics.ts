import api from "./api";
import type { ApiResponse } from "@/types/api";

export interface SellerAnalyticsOverview {
  store: {
    storeId: string;
    storeName: string;
    badge: string;
    status: string;
    rating: number;
    totalReviews: number;
    createdAt?: string;
  };
  kpis: {
    todayRevenue: number;
    todayOrders: number;
    totalRevenue: number;
    totalOrders: number;
    completedOrders: number;
    cancelledOrders: number;
    pendingOrders: number;
    totalProducts: number;
    lowStockCount: number;
    uniqueCustomers: number;
    activeCoupons: number;
    averageBasketValue: number;
  };
  trend: Array<{
    date: string;
    revenue: number;
    orders: number;
  }>;
  topProducts: Array<{
    productId: string;
    name: string;
    price: number;
    salesCount: number;
    quantity: number;
    revenue: number;
  }>;
  lowStockAlerts: Array<{
    productId: string;
    name: string;
    quantity: number;
    sku?: string;
  }>;
}

export interface SellerAnalyticsQuery {
  from?: string;
  to?: string;
  range?: "today" | "week" | "month" | "quarter" | "year";
}

export async function fetchSellerAnalytics(query?: SellerAnalyticsQuery) {
  const response = await api.get<ApiResponse<SellerAnalyticsOverview>>(
    "/api/v1/analytics/seller/overview",
    { params: query }
  );
  return response.data.data;
}

export async function exportSellerAnalytics(query: { type: string; from?: string; to?: string }) {
  const response = await api.get("/api/v1/analytics/seller/export", {
    params: query,
    responseType: "blob",
  });
  return response.data;
}
