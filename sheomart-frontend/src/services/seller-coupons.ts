import api from "./api";
import type { ApiResponse } from "@/types/api";
import type {
  SellerCouponFilters,
  SellerCouponItem,
  SellerCouponListResponse,
  SellerCouponSummary,
  SellerCouponAnalytics,
  SellerCouponRedemptionsResponse,
  CreateSellerCouponPayload,
  UpdateSellerCouponPayload,
} from "@/types/seller-coupon";

const BASE_URL = "/api/v1/store/coupons";

export async function fetchSellerCoupons(
  filters: SellerCouponFilters
): Promise<SellerCouponListResponse> {
  const response = await api.get<ApiResponse<SellerCouponListResponse>>(BASE_URL, {
    params: filters,
  });
  return (
    response.data.data ?? {
      coupons: [],
      pagination: { page: filters.page || 1, limit: filters.limit || 10, total: 0, totalPages: 0 },
      summary: {
        totalCoupons: 0,
        activeCoupons: 0,
        scheduledCoupons: 0,
        expiredCoupons: 0,
        couponsRedeemed: 0,
        revenueGenerated: 0,
      },
    }
  );
}

export async function fetchSellerCouponSummary(): Promise<SellerCouponSummary> {
  const response = await api.get<ApiResponse<SellerCouponSummary>>(`${BASE_URL}/summary`);
  return (
    response.data.data ?? {
      totalCoupons: 0,
      activeCoupons: 0,
      scheduledCoupons: 0,
      expiredCoupons: 0,
      couponsRedeemed: 0,
      revenueGenerated: 0,
    }
  );
}

export async function fetchSellerCouponAnalytics(): Promise<SellerCouponAnalytics> {
  const response = await api.get<ApiResponse<SellerCouponAnalytics>>(`${BASE_URL}/analytics`);
  return (
    response.data.data ?? {
      cards: {
        totalRedemptions: 0,
        totalDiscountGiven: 0,
        revenueGenerated: 0,
        averageBasketValue: 0,
        topCoupon: null,
      },
      redemptionTrend: [],
      topCoupons: [],
    }
  );
}

export async function fetchSellerCouponRedemptions(filters?: {
  page?: number;
  limit?: number;
  couponCode?: string;
  search?: string;
}): Promise<SellerCouponRedemptionsResponse> {
  const response = await api.get<ApiResponse<SellerCouponRedemptionsResponse>>(
    `${BASE_URL}/redemptions`,
    { params: filters }
  );
  return (
    response.data.data ?? {
      redemptions: [],
      pagination: { page: filters?.page || 1, limit: filters?.limit || 10, total: 0, totalPages: 0 },
    }
  );
}

export async function fetchSellerCoupon(couponId: string): Promise<SellerCouponItem> {
  const response = await api.get<ApiResponse<SellerCouponItem>>(`${BASE_URL}/${couponId}`);
  return response.data.data!;
}

export async function createSellerCoupon(
  payload: CreateSellerCouponPayload
): Promise<SellerCouponItem> {
  const response = await api.post<ApiResponse<SellerCouponItem>>(BASE_URL, payload);
  return response.data.data!;
}

export async function updateSellerCoupon(
  couponId: string,
  payload: UpdateSellerCouponPayload
): Promise<SellerCouponItem> {
  const response = await api.patch<ApiResponse<SellerCouponItem>>(
    `${BASE_URL}/${couponId}`,
    payload
  );
  return response.data.data!;
}

export async function updateSellerCouponStatus(
  couponId: string,
  isActive: boolean
): Promise<SellerCouponItem> {
  const response = await api.patch<ApiResponse<SellerCouponItem>>(
    `${BASE_URL}/${couponId}/status`,
    { isActive }
  );
  return response.data.data!;
}

export async function deleteSellerCoupon(
  couponId: string
): Promise<{ success: boolean; message: string }> {
  const response = await api.delete<ApiResponse<{ success: boolean; message: string }>>(
    `${BASE_URL}/${couponId}`
  );
  return response.data.data!;
}

export async function duplicateSellerCoupon(couponId: string): Promise<SellerCouponItem> {
  const response = await api.post<ApiResponse<SellerCouponItem>>(
    `${BASE_URL}/${couponId}/duplicate`
  );
  return response.data.data!;
}

export async function bulkSellerCouponAction(
  action: "activate" | "deactivate" | "delete",
  couponIds: string[]
): Promise<{ success: boolean; count: number }> {
  const response = await api.post<ApiResponse<{ success: boolean; count: number }>>(
    `${BASE_URL}/bulk-action`,
    { action, couponIds }
  );
  return response.data.data!;
}
