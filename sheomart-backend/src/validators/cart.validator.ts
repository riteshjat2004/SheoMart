import { z } from "zod";

export const addCartItemSchema = z.object({
  productId: z.string().trim().min(1, "Product ID is required"),
  storeId: z.string().trim().nullable().optional(),
  quantity: z.number().int().min(1, "Quantity must be at least 1").optional().default(1),
  variantId: z.string().trim().nullable().optional(),
  variantLabel: z.string().trim().nullable().optional(),
  clearPreviousCart: z.boolean().optional().default(false),
});

export type AddCartItemInput = z.infer<typeof addCartItemSchema>;

export const updateCartItemSchema = z.object({
  quantity: z.number().int().min(0, "Quantity must be 0 or greater"),
});

export type UpdateCartItemInput = z.infer<typeof updateCartItemSchema>;
