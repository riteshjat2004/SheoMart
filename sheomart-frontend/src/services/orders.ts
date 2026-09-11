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
  pickupStatus?: string;
  statusUpdatedAt?: string;
  paymentStatus?: string;
  razorpayPaymentId?: string;
  paidAt?: string;
  paymentRequiredBeforeConfirmation?: boolean;
  paymentMethod?: string;
  amountPaid?: number;
  remainingAmount?: number;
  subtotal?: number;
  discount?: number;
  deliveryCharge?: number;
  platformFee?: number;
  grandTotal?: number;
  createdAt?: string;
  shippingAddress?: Record<string, unknown>;
  storeName?: string;
  storePhone?: string;
  pickupAddress?: string;
  pickupHours?: string;
  store?: { storeName?: string; phone?: string; address?: string } | null;
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
  storeId: string;
  deliveryMethod: "pickup" | "delivery";
  fulfillmentType?: "pickup" | "delivery";
  selectedAddressId?: string;
  deliverySlotId?: string;
  pickupSlot?: string;
  estimatedReadyTime?: string;
  estimatedDeliveryWindow?: string;
  paymentMethod: "ONLINE" | "PAY_AT_PICKUP" | "PAY_AT_DELIVERY";
  paymentRequiredBeforeConfirmation: boolean;
  couponCode?: string;
}) {
  const response = await api.post<ApiResponse<{ order: OrderRecord }>>("/api/v1/orders", payload);
  return response.data.data?.order;
}
