import { z } from "zod";

export const DELIVERY_SLOTS = [
  "10:00 AM - 12:00 PM",
  "12:00 PM - 2:00 PM",
  "4:00 PM - 6:00 PM",
  "Morning",
  "Afternoon",
  "Evening",
] as const;

export const PAYMENT_METHODS = ["cod", "online"] as const;

export const createOrderSchema = z.object({
  addressId: z.string().trim().min(1, "Delivery address is required"),
  deliveryDate: z.string().trim().min(1, "Delivery date is required"),
  deliverySlot: z.enum(DELIVERY_SLOTS, "Select a valid delivery slot"),
  paymentMethod: z.enum(PAYMENT_METHODS, "Select a valid payment method"),
});

export type CreateOrderInput = z.infer<typeof createOrderSchema>;

export const orderIdParamSchema = z.object({
  orderId: z.string().trim().min(1, "Order ID is required"),
});

export const addressIdParamSchema = z.object({
  addressId: z.string().trim().min(1, "Address ID is required"),
});
