import { Response } from "express";
import { AuthRequest } from "../middleware/auth.middleware";
import { ApiResponse } from "../utils/apiResponse";
import { SellerPasswordResetService } from "../services/seller-password-reset.service";
import {
  sellerPasswordResetRequestSchema,
  sellerPasswordResetReviewSchema,
} from "../validators/seller-password-reset.validator";
import { logger } from "../utils/logger";

export const getSellerRecovery = async (req: AuthRequest, res: Response): Promise<void> => {
  const email = typeof req.query.email === "string" ? req.query.email.toLowerCase() : "";
  const result = await SellerPasswordResetService.getSellerRecovery(email);
  res.status(200).json(new ApiResponse(true, "Seller recovery details fetched", result));
};

export const createSellerPasswordResetRequest = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  const data = sellerPasswordResetRequestSchema.parse(req.body);
  const result = await SellerPasswordResetService.createRequest(data, req.ip ?? "unknown");
  res
    .status(201)
    .json(
      new ApiResponse(true, "Password reset request submitted for administrator approval.", result)
    );
};

export const listSellerPasswordResetRequests = async (
  _req: AuthRequest,
  res: Response
): Promise<void> => {
  const requests = await SellerPasswordResetService.listRequests();
  res.status(200).json(new ApiResponse(true, "Password reset requests fetched", { requests }));
};

export const approveSellerPasswordResetRequest = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  const requestId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  logger.info(`Approve password reset controller hit for request ${requestId} by admin ${req.user?.userId ?? "unknown"}`);
  const { adminRemarks } = sellerPasswordResetReviewSchema.parse(req.body ?? {});
  const result = await SellerPasswordResetService.reviewRequest(
    requestId,
    req.user!.userId,
    "approved",
    adminRemarks,
    req.ip ?? "unknown"
  );
  res.status(200).json(new ApiResponse(true, "Password reset approved successfully.", result));
};

export const rejectSellerPasswordResetRequest = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  const requestId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  logger.info(`Reject password reset controller hit for request ${requestId} by admin ${req.user?.userId ?? "unknown"}`);
  const { adminRemarks } = sellerPasswordResetReviewSchema.parse(req.body ?? {});
  const result = await SellerPasswordResetService.reviewRequest(
    requestId,
    req.user!.userId,
    "rejected",
    adminRemarks,
    req.ip ?? "unknown"
  );
  res.status(200).json(new ApiResponse(true, "Password reset rejected successfully.", result));
};
