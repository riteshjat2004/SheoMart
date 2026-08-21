import api from "./api";
import type { ApiResponse } from "@/types/api";
import type { StoreOrder, StoreOrderFilters, StoreOrdersResponse } from "@/types/store-order";

const STORE_ORDERS_ENDPOINT = "/api/v1/billing/pickup-orders";

export async function fetchStoreOrders(filters: StoreOrderFilters): Promise<StoreOrdersResponse> {
  const response = await api.get<ApiResponse<StoreOrdersResponse | { orders: StoreOrdersResponse["orders"] } | StoreOrdersResponse["orders"]>>(STORE_ORDERS_ENDPOINT, {
    params: { page: filters.page, limit: filters.limit, ...(filters.search ? { search: filters.search } : {}), ...(filters.orderStatus ? { orderStatus: filters.orderStatus } : {}), ...(filters.paymentStatus ? { paymentStatus: filters.paymentStatus } : {}), ...(filters.from ? { from: filters.from } : {}), ...(filters.to ? { to: filters.to } : {}) },
  });
  const data = response.data.data;
  if (Array.isArray(data)) return { orders: data };
  return { orders: data?.orders ?? [], pagination: data && "pagination" in data ? data.pagination : undefined };
}

export async function updateOrderStatus(orderId: string, status: string): Promise<StoreOrder | null> {
  const response = await api.patch<ApiResponse<{ order?: StoreOrder }>>(`/api/v1/orders/${orderId}/status`, { status });
  return response.data.data?.order ?? null;
}

export async function fetchStoreOrder(orderId: string): Promise<StoreOrder | null> {
  const response = await api.get<ApiResponse<{ order?: StoreOrder }>>(`/api/v1/orders/${encodeURIComponent(orderId)}`);
  return response.data.data?.order ?? null;
}

export type PickupPaymentMethod = "CASH" | "UPI" | "CREDIT";

export async function collectPickupPayment(orderId: string, paymentMethod: PickupPaymentMethod): Promise<StoreOrder | null> {
  const response = await api.patch<ApiResponse<{ order?: StoreOrder }>>(`/api/v1/billing/pickup-orders/${encodeURIComponent(orderId)}/pay`, { paymentMethod });
  return response.data.data?.order ?? null;
}