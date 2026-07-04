import { z } from "zod";

export const createCategorySchema = z.object({
  name: z.string().trim().min(2, "Category name must be at least 2 characters").max(100),
  description: z.string().trim().max(1000).optional().default(""),
  image: z.string().trim().max(500).optional().default(""),
  parentCategory: z.string().trim().max(100).optional().nullable().default(null),
  sortOrder: z.number().int().optional().default(0),
  isActive: z.boolean().optional().default(true),
}).strict();

export type CreateCategoryInput = z.infer<typeof createCategorySchema>;

export const updateCategorySchema = z.object({
  name: z.string().trim().min(2, "Category name must be at least 2 characters").max(100).optional(),
  description: z.string().trim().max(1000).optional(),
  image: z.string().trim().max(500).optional(),
  parentCategory: z.string().trim().max(100).optional().nullable(),
  sortOrder: z.number().int().optional(),
  isActive: z.boolean().optional(),
}).strict();

export type UpdateCategoryInput = z.infer<typeof updateCategorySchema>;
