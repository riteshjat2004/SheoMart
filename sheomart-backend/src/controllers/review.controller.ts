import { Response } from "express";
import { AppError } from "../errors/AppError";
import { AuthRequest } from "../middleware/auth.middleware";
import { ApiResponse } from "../utils/apiResponse";
import { ReviewService } from "../services/review.service";
import {
  adminReviewListQuerySchema,
  bulkReviewActionSchema,
  createReviewSchema,
  moderateReviewSchema,
  reportReviewSchema,
  updateReviewSchema,
  visibilitySchema,
} from "../validators/review.validator";

export const getAdminReviews = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  const filters = adminReviewListQuerySchema.parse(req.query);
  const result = await ReviewService.listAdminReviews(filters);

  res.status(200).json(
    new ApiResponse(true, "Reviews fetched successfully", result)
  );
};

export const getAdminReviewStats = async (
  _req: AuthRequest,
  res: Response
): Promise<void> => {
  const stats = await ReviewService.getAdminReviewStats();

  res.status(200).json(
    new ApiResponse(true, "Review statistics fetched successfully", stats)
  );
};

export const getAdminReviewDetails = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  const reviewId = Array.isArray(req.params.reviewId) ? req.params.reviewId[0] : req.params.reviewId;
  const result = await ReviewService.getReviewDetails(reviewId);

  res.status(200).json(
    new ApiResponse(true, "Review details fetched successfully", result)
  );
};

export const moderateReview = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  const reviewId = Array.isArray(req.params.reviewId) ? req.params.reviewId[0] : req.params.reviewId;
  const data = moderateReviewSchema.parse(req.body);
  const review = await ReviewService.moderateReview(reviewId, data, req.user?.userId as string);

  res.status(200).json(
    new ApiResponse(true, `Review marked as ${data.status} successfully`, { review })
  );
};

export const softDeleteAdminReview = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  const reviewId = Array.isArray(req.params.reviewId) ? req.params.reviewId[0] : req.params.reviewId;
  const result = await ReviewService.softDeleteReview(reviewId, req.user?.userId as string);

  res.status(200).json(
    new ApiResponse(true, result.message, result)
  );
};

export const restoreAdminReview = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  const reviewId = Array.isArray(req.params.reviewId) ? req.params.reviewId[0] : req.params.reviewId;
  const review = await ReviewService.restoreReview(reviewId, req.user?.userId as string);

  res.status(200).json(
    new ApiResponse(true, "Review restored successfully", { review })
  );
};

export const markSpamOrAbuse = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  const reviewId = Array.isArray(req.params.reviewId) ? req.params.reviewId[0] : req.params.reviewId;
  const type = req.body?.type === "abuse" ? "abuse" : "spam";
  const review = await ReviewService.markSpamOrAbuse(reviewId, type, req.user?.userId as string);

  res.status(200).json(
    new ApiResponse(true, `Review flagged as ${type}`, { review })
  );
};

export const reportReview = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  const reviewId = Array.isArray(req.params.reviewId) ? req.params.reviewId[0] : req.params.reviewId;
  const data = reportReviewSchema.parse(req.body);
  const review = await ReviewService.reportReview(reviewId, data.reason);

  res.status(200).json(
    new ApiResponse(true, "Review reported successfully", { review })
  );
};

export const bulkReviewAction = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  const data = bulkReviewActionSchema.parse(req.body);
  const result = await ReviewService.bulkReviewAction(data, req.user?.userId as string);

  res.status(200).json(
    new ApiResponse(true, result.message, result)
  );
};

export const createReview = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  const payload = (req.body && typeof req.body === "object" ? req.body : {}) as Record<string, unknown>;
  const result = createReviewSchema.safeParse(payload);

  if (!result.success) {
    const message = result.error.issues[0]?.message || "Invalid review payload";
    throw new AppError(message, 400);
  }

  const productId = Array.isArray(req.params.productId) ? req.params.productId[0] : req.params.productId;
  const review = await ReviewService.createReview(productId, result.data, req.user?.userId as string, req.user?.role);

  res.status(201).json(
    new ApiResponse(true, "Review created successfully", { review })
  );
};

export const getProductReviews = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  const productId = Array.isArray(req.params.productId) ? req.params.productId[0] : req.params.productId;
  const result = await ReviewService.getProductReviews(productId);

  res.status(200).json(
    new ApiResponse(true, "Reviews fetched successfully", result)
  );
};

export const getReview = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  const reviewId = Array.isArray(req.params.reviewId) ? req.params.reviewId[0] : req.params.reviewId;
  const review = await ReviewService.getReview(reviewId);

  res.status(200).json(
    new ApiResponse(true, "Review fetched successfully", { review })
  );
};

export const updateReview = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  const payload = (req.body && typeof req.body === "object" ? req.body : {}) as Record<string, unknown>;
  const result = updateReviewSchema.safeParse(payload);

  if (!result.success) {
    const message = result.error.issues[0]?.message || "Invalid review update payload";
    throw new AppError(message, 400);
  }

  const reviewId = Array.isArray(req.params.reviewId) ? req.params.reviewId[0] : req.params.reviewId;
  const review = await ReviewService.updateReview(reviewId, result.data, req.user?.userId as string);

  res.status(200).json(
    new ApiResponse(true, "Review updated successfully", { review })
  );
};

export const deleteReview = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  const reviewId = Array.isArray(req.params.reviewId) ? req.params.reviewId[0] : req.params.reviewId;
  const review = await ReviewService.deleteReview(reviewId, req.user?.userId as string);

  res.status(200).json(
    new ApiResponse(true, "Review deleted successfully", { review })
  );
};

export const updateVisibility = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  const payload = (req.body && typeof req.body === "object" ? req.body : {}) as Record<string, unknown>;
  const result = visibilitySchema.safeParse(payload);

  if (!result.success) {
    const message = result.error.issues[0]?.message || "Invalid visibility payload";
    throw new AppError(message, 400);
  }

  const reviewId = Array.isArray(req.params.reviewId) ? req.params.reviewId[0] : req.params.reviewId;
  const review = await ReviewService.updateVisibility(reviewId, result.data, req.user?.role);

  res.status(200).json(
    new ApiResponse(true, "Review visibility updated successfully", { review })
  );
};

