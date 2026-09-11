export const STORE_ORDER_STATUSES = ["ORDER_PLACED", "ACCEPTED", "PREPARING", "READY_FOR_PICKUP", "READY_FOR_DISPATCH", "OUT_FOR_DELIVERY", "PICKED_UP", "DELIVERED", "CANCELLED"] as const;
export const STORE_PAYMENT_STATUSES = ["PAID", "PENDING", "PARTIALLY_PAID", "FAILED"] as const;
export type StoreOrderStatus = (typeof STORE_ORDER_STATUSES)[number];
export type StorePaymentStatus = (typeof STORE_PAYMENT_STATUSES)[number];

export interface StoreOrderCustomer { name?: string; fullName?: string; mobile?: string; phone?: string; email?: string; customerType?: string; isPlus?: boolean; }
export interface StoreOrderAddress { fullName?: string; mobile?: string; house?: string; street?: string; landmark?: string; city?: string; state?: string; pincode?: string; addressType?: string; }
export interface StoreOrderItem { orderItemId?: string; productId?: string; name?: string; productName?: string; sku?: string; quantity?: number; price?: number; unitPrice?: number; discountPrice?: number; totalPrice?: number; lineTotal?: number; productImage?: string; image?: string; }
export interface StoreOrder {
  orderId: string;
  customer?: StoreOrderCustomer | null;
  customerName?: string;
  customerMobile?: string;
  customerPhone?: string;
  customerEmail?: string;
  customerType?: string;
  isPlusCustomer?: boolean;
  invoiceNumber?: string;
  invoiceId?: string;
  storeName?: string;
  store?: { name?: string; storeName?: string; address?: string; pickupAddress?: string; pickupHours?: string; preparationTimeMinutes?: number; } | null;
  status?: string;
  orderStatus?: string;
  paymentStatus?: string;
  paymentMethod?: string;
  shippingAddress?: StoreOrderAddress | null;
  pickupStore?: string;
  pickupAddress?: string;
  pickupHours?: string;
  estimatedPickupTime?: string;
  deliveryDate?: string;
  deliverySlot?: string;
  deliverySlotId?: string;
  deliverySlotLabel?: string;
  deliveryWindowStart?: string;
  deliveryWindowEnd?: string;
  deliveryFeeCharged?: number;
  preparationTimeMinutes?: number;
  freeDeliveryApplied?: boolean;
  orderNotes?: string;
  notes?: string;
  subtotal?: number;
  discount?: number;
  deliveryCharge?: number;
  platformFee?: number;
  grandTotal?: number;
  createdAt?: string;
  orderItems?: StoreOrderItem[];
  fulfillmentType?: string;
  deliveryMethod?: string;
  estimatedDeliveryAt?: string;
  updatedBySellerAt?: string;
  acceptedAt?: string;
  preparingAt?: string;
  readyForDispatchAt?: string;
  readyForPickupAt?: string;
  outForDeliveryAt?: string;
  deliveredAt?: string;
  pickedUpAt?: string;
}
export interface StoreOrderPagination { page: number; limit: number; total: number; totalPages: number; }
export interface StoreOrdersResponse { orders: StoreOrder[]; pagination?: StoreOrderPagination; }
export interface StoreOrderFilters {
  page: number;
  limit: number;
  search?: string;
  orderStatus?: StoreOrderStatus;
  paymentStatus?: StorePaymentStatus;
  from?: string;
  to?: string;
}