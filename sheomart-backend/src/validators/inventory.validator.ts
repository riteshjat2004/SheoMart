import { z } from "zod";

export const updateInventorySchema = z.object({
  availableQuantity: z.number().min(0, "availableQuantity cannot be negative").optional(),
  reservedQuantity: z.number().min(0, "reservedQuantity cannot be negative").optional(),
  soldQuantity: z.number().min(0, "soldQuantity cannot be negative").optional(),
  lowStockThreshold: z.number().min(0, "lowStockThreshold cannot be negative").optional(),
}).strict();

export type UpdateInventoryInput = z.infer<typeof updateInventorySchema>;

export const updateInventoryStatusSchema = z.object({
  status: z.enum(["in_stock", "low_stock", "out_of_stock", "discontinued"]),
}).strict();

export type UpdateInventoryStatusInput = z.infer<typeof updateInventoryStatusSchema>;
