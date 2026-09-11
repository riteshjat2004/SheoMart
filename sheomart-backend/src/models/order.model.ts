import { Document, Schema, model } from "mongoose";
import { v4 as uuidv4 } from "uuid";

export const ORDER_STATUS = {
  DRAFT: "DRAFT",

  PENDING_PAYMENT: "PENDING_PAYMENT",

  CONFIRMED: "CONFIRMED",

  PROCESSING: "PROCESSING",

  PACKED: "PACKED",

  OUT_FOR_DELIVERY: "OUT_FOR_DELIVERY",

  DELIVERED: "DELIVERED",

  CANCELLED: "CANCELLED",

  FAILED: "FAILED",

  REFUNDED: "REFUNDED",
} as const;

export const PAYMENT_STATUS = {
  PENDING: "PENDING",
  UNPAID: "UNPAID",
  PAID: "PAID",
  FAILED: "FAILED",
  CANCELLED: "CANCELLED",
  REFUNDED: "REFUNDED",
} as const;

export interface IOrderItem {
  orderItemId: string;
  productId: string;
  name: string;
  sku: string;
  quantity: number;
  price: number;
  discountPrice: number;
  totalPrice: number;
}

export interface IShippingAddress {
  fullName: string;
  mobile: string;
  house: string;
  street: string;
  landmark?: string;
  city: string;
  state: string;
  pincode: string;
  addressType: string;
}

export interface IOrder extends Document {
  orderId: string;
  invoiceNumber?: string;
  userId: string;
  storeId: string;
  addressId: string;
  shippingAddress: IShippingAddress;
  deliveryDate: string;
  deliverySlot: string;
  deliveryMethod: string;
  fulfillmentType: "pickup" | "delivery";
  deliveryFee: number;
  estimatedReadyTime: Date;
  estimatedDeliveryTime?: Date;
  selectedAddressId?: string;
  deliverySlotId?: string;
  pickupSlot?: string;
  estimatedDeliveryWindow?: string;
  deliverySlotLabel?: string;
  deliveryWindowStart?: string;
  deliveryWindowEnd?: string;
  freeDeliveryApplied: boolean;
  paymentMethod: string;
  paymentRequiredBeforeConfirmation: boolean;
  paymentStatus: string;
  amountPaid?: number;
  remainingAmount?: number;
  pickupStatus: string;
  estimatedDeliveryAt?: Date;
  updatedBySellerAt?: Date;
  acceptedAt?: Date;
  preparingAt?: Date;
  readyForDispatchAt?: Date;
  readyForPickupAt?: Date;
  outForDeliveryAt?: Date;
  deliveredAt?: Date;
  pickedUpAt?: Date;

  razorpayOrderId?: string;
  razorpayPaymentId?: string;
  razorpaySignature?: string;
  paidAt?: Date;

  subtotal: number;
  discount: number;
  festivalDiscount: number;
  couponDiscount: number;
  couponCode?: string;
  deliveryCharge: number;
  platformFee: number;
  platformFeeCharged: number;
  deliveryFeeCharged: number;
  couponDiscountApplied: number;
  festivalDiscountApplied: number;
  productSavingsShown: number;
  grandTotal: number;
  orderItems: IOrderItem[];
  status: string;
  statusUpdatedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const orderItemSchema = new Schema<IOrderItem>(
  {
    orderItemId: {
      type: String,
      default: () => uuidv4(),
      immutable: true,
    },
    productId: {
      type: String,
      required: true,
    },
    name: {
      type: String,
      required: true,
    },
    sku: {
      type: String,
      required: true,
    },
    quantity: {
      type: Number,
      required: true,
      min: 1,
    },
    price: {
      type: Number,
      required: true,
      min: 0,
    },
    discountPrice: {
      type: Number,
      required: true,
      min: 0,
    },
    totalPrice: {
      type: Number,
      required: true,
      min: 0,
    },
  },
  {
    _id: false,
  }
);

const shippingAddressSchema = new Schema<IShippingAddress>(
  {
    fullName: { type: String, required: true, trim: true },
    mobile: { type: String, required: true, trim: true },
    house: { type: String, required: true, trim: true },
    street: { type: String, required: true, trim: true },
    landmark: { type: String, default: "", trim: true },
    city: { type: String, required: true, trim: true },
    state: { type: String, required: true, trim: true },
    pincode: { type: String, required: true, trim: true },
    addressType: { type: String, required: true, trim: true },
  },
  {
    _id: false,
  }
);

const orderSchema = new Schema<IOrder>(
  {
    orderId: {
      type: String,
      default: () => uuidv4(),
      unique: true,
      immutable: true,
    },
    invoiceNumber: {
      type: String,
      sparse: true,
      unique: true,
    },
    userId: {
      type: String,
      required: true,
      index: true,
    },
    storeId: {
      type: String,
      required: true,
      index: true,
    },
    addressId: {
      type: String,
      required: true,
    },
    shippingAddress: {
      type: shippingAddressSchema,
      required: true,
    },
    deliveryDate: {
      type: String,
      required: true,
    },
    deliverySlot: {
      type: String,
      required: true,
    },
    deliveryMethod: {
      type: String,
      required: true,
    },
    fulfillmentType: {
      type: String,
      enum: ["pickup", "delivery"],
      required: true,
      default: "pickup",
    },
    deliveryFee: {
      type: Number,
      required: true,
      min: 0,
      default: 0,
    },
    estimatedReadyTime: {
      type: Date,
      required: true,
    },
    estimatedDeliveryTime: {
      type: Date,
      default: null,
    },
    selectedAddressId: { type: String, default: "" },
    deliverySlotId: { type: String, default: "" },
    pickupSlot: { type: String, default: "" },
    estimatedDeliveryWindow: { type: String, default: "" },
    deliverySlotLabel: { type: String, default: "" },
    deliveryWindowStart: { type: String, default: "" },
    deliveryWindowEnd: { type: String, default: "" },
    freeDeliveryApplied: { type: Boolean, default: false },
    paymentMethod: {
      type: String,
      required: true,
    },
    paymentRequiredBeforeConfirmation: {
      type: Boolean,
      required: true,
      default: true,
    },
    paymentStatus: {
      type: String,
      required: true,
      default: "pending",
    },
    amountPaid: { type: Number, min: 0, default: 0 },
    remainingAmount: { type: Number, min: 0, default: 0 },
    pickupStatus: {
      type: String,
      required: true,
      default: "ORDER_PLACED",
    },
    estimatedDeliveryAt: { type: Date, default: null },
    updatedBySellerAt: { type: Date, default: null },
    acceptedAt: { type: Date, default: null },
    preparingAt: { type: Date, default: null },
    readyForDispatchAt: { type: Date, default: null },
    readyForPickupAt: { type: Date, default: null },
    outForDeliveryAt: { type: Date, default: null },
    deliveredAt: { type: Date, default: null },
    pickedUpAt: { type: Date, default: null },
    razorpayOrderId: {
      type: String,
      default: null,
    },

    razorpayPaymentId: {
      type: String,
      default: null,
    },

    razorpaySignature: {
      type: String,
      default: null,
    },

    paidAt: {
      type: Date,
      default: null,
    },
    subtotal: {
      type: Number,
      required: true,
      min: 0,
    },
    discount: {
      type: Number,
      required: true,
      min: 0,
    },
    festivalDiscount: { type: Number, default: 0, min: 0 },
    couponDiscount: { type: Number, default: 0, min: 0 },
    couponCode: { type: String, default: "", trim: true, uppercase: true },
    deliveryCharge: {
      type: Number,
      required: true,
      min: 0,
    },
    platformFee: {
      type: Number,
      required: true,
      min: 0,
    },
    platformFeeCharged: { type: Number, min: 0, default: 0 },
    deliveryFeeCharged: { type: Number, min: 0, default: 0 },
    couponDiscountApplied: { type: Number, min: 0, default: 0 },
    festivalDiscountApplied: { type: Number, min: 0, default: 0 },
    productSavingsShown: { type: Number, min: 0, default: 0 },
    grandTotal: {
      type: Number,
      required: true,
      min: 0,
    },
    orderItems: {
      type: [orderItemSchema],
      required: true,
      default: [],
    },
    status: {
      type: String,
      default: ORDER_STATUS.DRAFT,
      enum: Object.values(ORDER_STATUS),
    },
    statusUpdatedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

export const Order = model<IOrder>("Order", orderSchema);
