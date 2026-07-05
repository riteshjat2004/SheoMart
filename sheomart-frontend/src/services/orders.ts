import api from "./api";
import type { ApiResponse } from "@/types/api";

export interface OrderItemSummary {
  orderItemId?: string;
  productId?: string;
  name?: string;
  quantity?: number;
  price?: number;
  discountPrice?: number;
  totalPrice?: number;
}

export interface OrderRecord {
  orderId?: string;
  status?: string;
  paymentStatus?: string;
  subtotal?: number;
  discount?: number;
  deliveryCharge?: number;
  platformFee?: number;
  grandTotal?: number;
  createdAt?: string;
  shippingAddress?: Record<string, unknown>;
  orderItems?: OrderItemSummary[];
}

export interface OrderListResponse {
  orders: OrderRecord[];
}

export async function fetchOrders() {
  const response = await api.get<ApiResponse<OrderListResponse>>("/api/v1/orders");
  return response.data.data?.orders ?? [];
}

export async function createDraftOrder(payload: {
  addressId: string;
  deliveryDate: string;
  deliverySlot: string;
  paymentMethod: "cod" | "online";
}) {
  const response = await api.post<ApiResponse<{ order: OrderRecord }>>("/api/v1/orders", payload);
  return response.data.data?.order;
}
