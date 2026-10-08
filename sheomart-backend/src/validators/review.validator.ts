import { z } from "zod";
import { REVIEW_STATUS } from "../models/review.model";

const booleanQueryParam = z.enum(["true", "false"]).transform((value) => value === "true");

export const adminReviewListQuerySchema = z
  .object({
    search: z.string().trim().max(100).optional(),
    productId: z.string().trim().min(1).optional(),
    storeId: z.string().trim().min(1).optional(),
    userId: z.string().trim().min(1).optional(),
    categoryId: z.string().trim().min(1).optional(),
    rating: z.coerce.number().int().min(1).max(5).optional(),
    status: z
      .enum([
        "all",
        REVIEW_STATUS.PENDING,
        REVIEW_STATUS.APPROVED,
        REVIEW_STATUS.REJECTED,
        REVIEW_STATUS.HIDDEN,
        REVIEW_STATUS.REPORTED,
        REVIEW_STATUS.DELETED,
      ])
      .optional(),
    isVisible: booleanQueryParam.optional(),
    isDeleted: booleanQueryParam.optional(),
    isVerifiedPurchase: booleanQueryParam.optional(),
    isReported: booleanQueryParam.optional(),
    from: z.string().trim().optional(),
    to: z.string().trim().optional(),
    page: z.coerce.number().int().min(1).default(1),
    limit: z.coerce.number().int().min(1).max(100).default(25),
    sortBy: z.enum(["createdAt", "updatedAt", "rating", "reportCount"]).default("createdAt"),
    sortOrder: z.enum(["asc", "desc"]).default("desc"),
  })
  .strict();

export type AdminReviewListQuery = z.infer<typeof adminReviewListQuerySchema>;

export const moderateReviewSchema = z
  .object({
    status: z.enum([
      REVIEW_STATUS.APPROVED,
      REVIEW_STATUS.REJECTED,
      REVIEW_STATUS.HIDDEN,
      REVIEW_STATUS.PENDING,
    ]),
    reason: z.string().trim().max(500).optional(),
  })
  .strict();

export type ModerateReviewInput = z.infer<typeof moderateReviewSchema>;

export const reportReviewSchema = z
  .object({
    reason: z.string().trim().min(3, "Reason must be at least 3 characters").max(500),
  })
  .strict();

export type ReportReviewInput = z.infer<typeof reportReviewSchema>;

export const bulkReviewActionSchema = z
  .object({
    reviewIds: z.array(z.string().min(1)).min(1, "Select at least one review"),
    action: z.enum(["approve", "reject", "hide", "unhide", "delete", "restore", "mark_spam", "mark_abuse"]),
    reason: z.string().trim().max(500).optional(),
  })
  .strict();

export type BulkReviewActionInput = z.infer<typeof bulkReviewActionSchema>;

export const createReviewSchema = z
  .object({
    rating: z.coerce.number().int().min(1, "Rating must be between 1 and 5").max(5, "Rating must be between 1 and 5"),
    title: z.string().trim().max(120).optional().default(""),
    comment: z.string().trim().max(2000).optional().default(""),
    images: z.array(z.string().trim().max(1000)).optional().default([]),
    isVerifiedPurchase: z.boolean().optional().default(false),
  })
  .strict();

export type CreateReviewInput = z.infer<typeof createReviewSchema>;

export const updateReviewSchema = z
  .object({
    rating: z.coerce.number().int().min(1, "Rating must be between 1 and 5").max(5, "Rating must be between 1 and 5").optional(),
    title: z.string().trim().max(120).optional(),
    comment: z.string().trim().max(2000).optional(),
    images: z.array(z.string().trim().max(1000)).optional(),
    isVerifiedPurchase: z.boolean().optional(),
  })
  .strict();

export type UpdateReviewInput = z.infer<typeof updateReviewSchema>;

export const visibilitySchema = z
  .object({
    isVisible: z.boolean(),
  })
  .strict();

export type VisibilityInput = z.infer<typeof visibilitySchema>;

