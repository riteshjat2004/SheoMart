import { z } from "zod";

const multipartBoolean = z.preprocess(
  (value) => (value === "true" ? true : value === "false" ? false : value),
  z.boolean(),
);

const multipartNumber = z.preprocess(
  (value) => (typeof value === "string" && value.trim() !== "" ? Number(value) : value),
  z.number().int(),
);

const optionalImageUrl = z.preprocess(
  (value) => (typeof value === "string" && value.trim() === "" ? undefined : value),
  z.string().trim().url("Image URL must be valid").optional(),
);

export const createCategorySchema = z.object({
  name: z.string().trim().min(2, "Category name must be at least 2 characters").max(100),
  description: z.string().trim().max(1000).optional().default(""),
  imageUrl: optionalImageUrl,
  parentCategory: z.string().trim().max(100).optional().nullable().default(null),
  sortOrder: multipartNumber.optional().default(0),
  isActive: multipartBoolean.optional().default(true),
}).strict();

export type CreateCategoryInput = z.infer<typeof createCategorySchema>;
export const bulkCreateCategorySchema = z.array(createCategorySchema)
  .min(1, "Category list must contain at least one item")
  .max(100, "Cannot import more than 100 categories");

export type BulkCreateCategoryInput = z.infer<typeof bulkCreateCategorySchema>;

export const updateCategorySchema = z.object({
  name: z.string().trim().min(2, "Category name must be at least 2 characters").max(100).optional(),
  description: z.string().trim().max(1000).optional(),
  imageUrl: optionalImageUrl,
  parentCategory: z.string().trim().max(100).optional().nullable(),
  sortOrder: multipartNumber.optional(),
  isActive: multipartBoolean.optional(),
}).strict();

export type UpdateCategoryInput = z.infer<typeof updateCategorySchema>;
