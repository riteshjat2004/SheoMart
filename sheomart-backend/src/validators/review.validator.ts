import { z } from "zod";

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
