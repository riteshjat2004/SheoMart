import api from "./api";
import type { ApiResponse } from "@/types/api";
import type { StoreOrder, StoreOrderFilters, StoreOrdersResponse } from "@/types/store-order";

const STORE_ORDERS_ENDPOINT = "/api/v1/orders/store";
const FALLBACK_ENDPOINT = "/api/v1/billing/pickup-orders";

export async function fetchStoreOrders(filters: StoreOrderFilters): Promise<StoreOrdersResponse> {
  const queryParams = {
    page: filters.page,
    limit: filters.limit,
    ...(filters.search ? { search: filters.search } : {}),
    ...(filters.orderStatus ? { orderStatus: filters.orderStatus } : {}),
    ...(filters.paymentStatus ? { paymentStatus: filters.paymentStatus } : {}),
    ...(filters.fulfillmentType && filters.fulfillmentType !== "all"
      ? { fulfillmentType: filters.fulfillmentType }
      : {}),
    ...(filters.sortBy ? { sortBy: filters.sortBy } : {}),
    ...(filters.from ? { from: filters.from } : {}),
    ...(filters.to ? { to: filters.to } : {}),
  };

  try {
    const response = await api.get<ApiResponse<StoreOrdersResponse>>(STORE_ORDERS_ENDPOINT, {
      params: queryParams,
    });
    const data = response.data.data;
    if (data && "orders" in data) {
      return data;
    }
  } catch (err) {
    // If /orders/store encounters an issue, fallback to /billing/pickup-orders
    console.warn("Primary store orders endpoint failed, falling back to legacy endpoint", err);
  }

  const fallbackResponse = await api.get<ApiResponse<StoreOrdersResponse | { orders: StoreOrder[] } | StoreOrder[]>>(
    FALLBACK_ENDPOINT,
    { params: queryParams }
  );
  const data = fallbackResponse.data.data;
  if (Array.isArray(data)) return { orders: data };
  return {
    orders: data?.orders ?? [],
    pagination: data && "pagination" in data ? data.pagination : undefined,
    summary: data && "summary" in data ? data.summary : undefined,
  };
}

export async function updateOrderStatus(
  orderId: string,
  status:
    | "ACCEPTED"
    | "PREPARING"
    | "READY_FOR_PICKUP"
    | "READY_FOR_DISPATCH"
    | "OUT_FOR_DELIVERY"
    | "PICKED_UP"
    | "DELIVERED"
    | "CANCELLED"
): Promise<StoreOrder | null> {
  const response = await api.patch<ApiResponse<{ order?: StoreOrder }>>(
    `/api/v1/orders/${orderId}/status`,
    { status }
  );
  return response.data.data?.order ?? null;
}

export async function bulkUpdateOrderStatus(
  orderIds: string[],
  status: string
): Promise<{ updatedCount: number; errors?: Array<{ orderId: string; message: string }> }> {
  const response = await api.patch<ApiResponse<{ updatedCount: number; errors?: Array<{ orderId: string; message: string }> }>>(
    "/api/v1/orders/bulk-status",
    { orderIds, status }
  );
  return response.data.data ?? { updatedCount: 0 };
}

export async function fetchStoreOrder(orderId: string): Promise<StoreOrder | null> {
  const response = await api.get<ApiResponse<{ order?: StoreOrder }>>(
    `/api/v1/orders/${encodeURIComponent(orderId)}`
  );
  return response.data.data?.order ?? null;
}

export type PickupPaymentMethod = "CASH" | "UPI" | "CARD";

export async function collectPickupPayment(
  orderId: string,
  paymentMethod: PickupPaymentMethod
): Promise<StoreOrder | null> {
  const response = await api.patch<ApiResponse<{ order?: StoreOrder }>>(
    `/api/v1/orders/${encodeURIComponent(orderId)}/payment`,
    { paymentMethod }
  );
  return response.data.data?.order ?? null;
}

export async function updateDeliveryEta(
  orderId: string,
  estimatedDeliveryAt: string
): Promise<StoreOrder | null> {
  const response = await api.patch<ApiResponse<{ order?: StoreOrder }>>(
    `/api/v1/orders/${encodeURIComponent(orderId)}/delivery-eta`,
    { estimatedDeliveryAt }
  );
  return response.data.data?.order ?? null;
}

export async function updateSellerNotes(
  orderId: string,
  sellerNotes: string
): Promise<StoreOrder | null> {
  const response = await api.patch<ApiResponse<{ order?: StoreOrder }>>(
    `/api/v1/orders/${encodeURIComponent(orderId)}/notes`,
    { sellerNotes }
  );
  return response.data.data?.order ?? null;
}