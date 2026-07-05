import { z } from "zod";

export const addWishlistItemSchema = z.object({
  productId: z.string().trim().min(1, "Product ID is required"),
}).strict();

export type AddWishlistItemInput = z.infer<typeof addWishlistItemSchema>;
