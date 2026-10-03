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

export const createOrderSchema = z
  .object({
    addressId: z.string().trim().optional().default(""),
    deliveryDate: z.string().trim().optional().default(""),
    deliverySlot: z.string().trim().optional().default(""),
    storeId: z.string().trim().min(1, "Store is required"),
    deliveryMethod: z.enum(["pickup", "delivery"], { message: "Select a valid delivery method" }),
    fulfillmentType: z.enum(["pickup", "delivery"]).optional(),
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
    paymentMethod: z.enum(PAYMENT_METHODS, { message: "Select a valid payment method" }),
    paymentRequiredBeforeConfirmation: z.boolean().default(false),
    couponCode: z.string().trim().min(2).max(40).optional(),
  })
  .superRefine((data, ctx) => {
    const method = data.fulfillmentType || data.deliveryMethod;
    if (method === "delivery") {
      if (!data.addressId && !data.selectedAddressId) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Delivery address is required for home delivery",
          path: ["addressId"],
        });
      }
    }
  });

export type CreateOrderInput = z.infer<typeof createOrderSchema>;

export const checkoutQuoteSchema = z.object({
  storeId: z.string().trim().min(1, "Store ID is required"),
  deliveryMethod: z.enum(["pickup", "delivery"]).default("delivery"),
  couponCode: z.string().trim().optional(),
});

export type CheckoutQuoteInput = z.infer<typeof checkoutQuoteSchema>;

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
