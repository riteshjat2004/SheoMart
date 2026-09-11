import { z } from "zod";

export const DELIVERY_SLOTS = [
  "10:00 AM - 12:00 PM",
  "12:00 PM - 2:00 PM",
  "4:00 PM - 6:00 PM",
  "Morning",
  "Afternoon",
  "Evening",
] as const;

export const PAYMENT_METHODS = ["ONLINE", "PAY_AT_PICKUP", "PAY_AT_DELIVERY"] as const;

export const createOrderSchema = z.object({
  addressId: z.string().trim().min(1, "Delivery address is required"),
  deliveryDate: z.string().trim().min(1, "Delivery date is required"),
  deliverySlot: z.string().trim().min(1, "Select a valid delivery slot"),
  storeId: z.string().trim().min(1, "Store is required"),
  deliveryMethod: z.enum(["pickup", "delivery"], "Select a valid delivery method"),
  fulfillmentType: z.enum(["pickup", "delivery"], "Select a valid fulfillment type").optional(),
  selectedAddressId: z.string().trim().min(1).optional(),
  deliverySlotId: z.string().trim().min(1).optional(),
  deliverySlotLabel: z.string().trim().min(1).optional(),
  deliveryWindowStart: z.string().regex(/^\d{2}:\d{2}$/).optional(),
  deliveryWindowEnd: z.string().regex(/^\d{2}:\d{2}$/).optional(),
  deliveryFee: z.number().min(0).optional(),
  deliveryFeeCharged: z.number().min(0).optional(),
  freeDeliveryApplied: z.boolean().optional(),
  pickupSlot: z.string().trim().min(1).optional(),
  pickupSlotId: z.string().trim().min(1).optional(),
  pickupSlotLabel: z.string().trim().min(1).optional(),
  estimatedReadyTime: z.string().datetime().optional(),
  estimatedDeliveryWindow: z.string().trim().min(1).optional(),
  paymentMethod: z.enum(PAYMENT_METHODS, "Select a valid payment method"),
  paymentRequiredBeforeConfirmation: z.boolean(),
  couponCode: z.string().trim().min(2).max(40).optional(),
});

export type CreateOrderInput = z.infer<typeof createOrderSchema>;

export const verifyPaymentSchema = z.object({
  razorpayOrderId: z.string().trim().min(1),
  razorpayPaymentId: z.string().trim().min(1),
  razorpaySignature: z.string().trim().min(1),
  checkout: createOrderSchema,
});

export type VerifyPaymentInput = z.infer<typeof verifyPaymentSchema>;

export const orderIdParamSchema = z.object({
  orderId: z.string().trim().min(1, "Order ID is required"),
});

export const addressIdParamSchema = z.object({
  addressId: z.string().trim().min(1, "Address ID is required"),
});
