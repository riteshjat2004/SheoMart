import { Response } from "express";
import { AppError } from "../errors/AppError";
import { AuthRequest } from "../middleware/auth.middleware";
import { PromotionService } from "../services/promotion.service";
import { ApiResponse } from "../utils/apiResponse";
import {
  bulkPromotionActionSchema,
  createCouponSchema,
  createOfferSchema,
  updateCouponSchema,
  updateOfferSchema,
  validateCouponSchema,
} from "../validators/promotion.validator";

const parsePayload = <T>(
  schema: { safeParse: (value: unknown) => { success: true; data: T } | { success: false; error: { issues: Array<{ message: string }> } } },
  payload: unknown
): T => {
  const result = schema.safeParse(payload);
  if (!result.success) throw new AppError(result.error.issues[0]?.message ?? "Invalid promotion payload", 400);
  return result.data;
};

export const getActiveCoupons = async (req: AuthRequest, res: Response) => {
  const storeId = typeof req.query.storeId === "string" ? req.query.storeId : undefined;
  const coupons = await PromotionService.listActiveCoupons(storeId);
  res.status(200).json(new ApiResponse(true, "Active coupons fetched successfully", { coupons }));
};

export const getActiveOffers = async (_req: AuthRequest, res: Response) => {
  const offers = await PromotionService.listActiveOffers();
  res.status(200).json(new ApiResponse(true, "Active offers fetched successfully", { offers }));
};

export const validateCoupon = async (req: AuthRequest, res: Response) => {
  const result = validateCouponSchema.safeParse(req.body);
  if (!result.success) throw new AppError(result.error.issues[0]?.message ?? "Invalid coupon validation payload", 400);
  const validation = await PromotionService.validateCoupon(
    result.data.code,
    req.user!.userId,
    result.data.cartValue,
    {
      storeId: result.data.storeId,
      categoryIds: result.data.categoryIds,
      productIds: result.data.productIds,
    }
  );
  res.status(200).json(new ApiResponse(true, "Coupon applied successfully", validation));
};

export const getCustomerCouponWallet = async (req: AuthRequest, res: Response) => {
  const wallet = await PromotionService.getCustomerCouponWallet(req.user!.userId);
  res.status(200).json(new ApiResponse(true, "Coupon wallet fetched successfully", wallet));
};

export const getAdminCoupons = async (req: AuthRequest, res: Response) => {
  const { search, status, scope } = req.query as { search?: string; status?: string; scope?: string };
  const data = await PromotionService.listCoupons({ search, status, scope });
  res.status(200).json(new ApiResponse(true, "Coupons fetched successfully", data));
};

export const getAdminOffers = async (req: AuthRequest, res: Response) => {
  const { search, status, offerType } = req.query as { search?: string; status?: string; offerType?: string };
  const data = await PromotionService.listOffers({ search, status, offerType });
  res.status(200).json(new ApiResponse(true, "Offers fetched successfully", data));
};

export const getCoupon = async (req: AuthRequest, res: Response) => {
  const coupon = await PromotionService.getCoupon(String(req.params.couponId));
  res.status(200).json(new ApiResponse(true, "Coupon fetched successfully", { coupon }));
};

export const getOffer = async (req: AuthRequest, res: Response) => {
  const offer = await PromotionService.getOffer(String(req.params.offerId));
  res.status(200).json(new ApiResponse(true, "Offer fetched successfully", { offer }));
};

export const createCoupon = async (req: AuthRequest, res: Response) => {
  const coupon = await PromotionService.createCoupon(parsePayload(createCouponSchema, req.body), req.user?.userId);
  res.status(201).json(new ApiResponse(true, "Coupon created successfully", { coupon }));
};

export const updateCoupon = async (req: AuthRequest, res: Response) => {
  const coupon = await PromotionService.updateCoupon(String(req.params.couponId), parsePayload(updateCouponSchema, req.body), req.user?.userId);
  res.status(200).json(new ApiResponse(true, "Coupon updated successfully", { coupon }));
};

export const updateCouponStatus = async (req: AuthRequest, res: Response) => {
  const { isActive } = req.body;
  if (typeof isActive !== "boolean") throw new AppError("isActive boolean is required", 400);
  const coupon = await PromotionService.updateCouponStatus(String(req.params.couponId), isActive, req.user?.userId);
  res.status(200).json(new ApiResponse(true, `Coupon ${isActive ? "activated" : "deactivated"} successfully`, { coupon }));
};

export const deleteCoupon = async (req: AuthRequest, res: Response) => {
  const coupon = await PromotionService.deleteCoupon(String(req.params.couponId), req.user?.userId);
  res.status(200).json(new ApiResponse(true, "Coupon deleted successfully", { coupon }));
};

export const restoreCoupon = async (req: AuthRequest, res: Response) => {
  const coupon = await PromotionService.restoreCoupon(String(req.params.couponId), req.user?.userId);
  res.status(200).json(new ApiResponse(true, "Coupon restored successfully", { coupon }));
};

export const bulkCouponAction = async (req: AuthRequest, res: Response) => {
  const result = parsePayload(bulkPromotionActionSchema, req.body);
  const data = await PromotionService.bulkUpdateCoupons(result, req.user?.userId);
  res.status(200).json(new ApiResponse(true, "Bulk action executed successfully", data));
};

export const createOffer = async (req: AuthRequest, res: Response) => {
  const payload = { ...((req.body && typeof req.body === "object" ? req.body : {}) as Record<string, unknown>) };
  const validated = parsePayload(createOfferSchema, payload);
  const offer = await PromotionService.createOffer(validated, req.user?.userId, req.file?.buffer);
  res.status(201).json(new ApiResponse(true, "Offer created successfully", { offer }));
};

export const updateOffer = async (req: AuthRequest, res: Response) => {
  const payload = { ...((req.body && typeof req.body === "object" ? req.body : {}) as Record<string, unknown>) };
  const validated = parsePayload(updateOfferSchema, payload);
  const offer = await PromotionService.updateOffer(String(req.params.offerId), validated, req.user?.userId, req.file?.buffer);
  res.status(200).json(new ApiResponse(true, "Offer updated successfully", { offer }));
};

export const updateOfferStatus = async (req: AuthRequest, res: Response) => {
  const { isActive } = req.body;
  if (typeof isActive !== "boolean") throw new AppError("isActive boolean is required", 400);
  const offer = await PromotionService.updateOfferStatus(String(req.params.offerId), isActive, req.user?.userId);
  res.status(200).json(new ApiResponse(true, `Offer ${isActive ? "activated" : "deactivated"} successfully`, { offer }));
};

export const deleteOffer = async (req: AuthRequest, res: Response) => {
  const offer = await PromotionService.deleteOffer(String(req.params.offerId), req.user?.userId);
  res.status(200).json(new ApiResponse(true, "Offer deleted successfully", { offer }));
};

export const restoreOffer = async (req: AuthRequest, res: Response) => {
  const offer = await PromotionService.restoreOffer(String(req.params.offerId), req.user?.userId);
  res.status(200).json(new ApiResponse(true, "Offer restored successfully", { offer }));
};

export const bulkOfferAction = async (req: AuthRequest, res: Response) => {
  const result = parsePayload(bulkPromotionActionSchema, req.body);
  const data = await PromotionService.bulkUpdateOffers(result, req.user?.userId);
  res.status(200).json(new ApiResponse(true, "Bulk action executed successfully", data));
};
