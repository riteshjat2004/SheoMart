import api from "./api";
import type { ApiResponse } from "@/types/api";

export interface CustomerInsights {
  totalOrders: number;
  cancelledOrders: number;
  totalSpent: number;
  moneySaved: number;
  couponsUsed: number;
  currentMonthSpending: number;
  favoriteStore: string;
  favoriteCategory: string;
  spendingTrend: Array<{ month: string; spending: number }>;
  ordersTrend: Array<{ month: string; orders: number }>;
  categorySpending: Array<{ category: string; spent: number; itemsCount: number }>;
}

export async function fetchCustomerInsights(): Promise<CustomerInsights> {
  const response = await api.get<ApiResponse<CustomerInsights>>("/api/v1/analytics/customer/insights");
  return (
    response.data.data ?? {
      totalOrders: 0,
      cancelledOrders: 0,
      totalSpent: 0,
      moneySaved: 0,
      couponsUsed: 0,
      currentMonthSpending: 0,
      favoriteStore: "None yet",
      favoriteCategory: "None yet",
      spendingTrend: [],
      ordersTrend: [],
      categorySpending: [],
    }
  );
}
