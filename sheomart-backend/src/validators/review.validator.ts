import { z } from "zod";

const booleanQueryParam = z.enum(["true", "false"]).transform((value) => value === "true");

export const adminReviewListQuerySchema = z.object({
  search: z.string().trim().max(100).optional(),
  productId: z.string().trim().min(1).optional(),
  storeId: z.string().trim().min(1).optional(),
  userId: z.string().trim().min(1).optional(),
  rating: z.coerce.number().int().min(1).max(5).optional(),
  isVisible: booleanQueryParam.optional(),
  isDeleted: booleanQueryParam.optional(),
  isVerifiedPurchase: booleanQueryParam.optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(25),
  sortBy: z.enum(["createdAt", "updatedAt", "rating"]).default("createdAt"),
  sortOrder: z.enum(["asc", "desc"]).default("desc"),
}).strict();

export type AdminReviewListQuery = z.infer<typeof adminReviewListQuerySchema>;

export const createReviewSchema = z.object({
  rating: z.number().int().min(1, "Rating must be at least 1").max(5, "Rating must be at most 5"),
  title: z.string().trim().max(120).optional().default(""),
  comment: z.string().trim().max(2000).optional().default(""),
  isVerifiedPurchase: z.boolean().optional().default(false),
}).strict();

export type CreateReviewInput = z.infer<typeof createReviewSchema>;

export const updateReviewSchema = z.object({
  rating: z.number().int().min(1, "Rating must be at least 1").max(5, "Rating must be at most 5").optional(),
  title: z.string().trim().max(120).optional(),
  comment: z.string().trim().max(2000).optional(),
  isVerifiedPurchase: z.boolean().optional(),
}).strict();

export type UpdateReviewInput = z.infer<typeof updateReviewSchema>;

export const visibilitySchema = z.object({
  isVisible: z.boolean(),
}).strict();

export type VisibilityInput = z.infer<typeof visibilitySchema>;
