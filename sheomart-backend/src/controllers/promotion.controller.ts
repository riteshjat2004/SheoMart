import { Response } from "express";
import { AppError } from "../errors/AppError";
import { AuthRequest } from "../middleware/auth.middleware";
import { PromotionService } from "../services/promotion.service";
import { ApiResponse } from "../utils/apiResponse";
import {
  createCouponSchema,
  createOfferSchema,
  updateCouponSchema,
  updateOfferSchema,
  validateCouponSchema,
} from "../validators/promotion.validator";

const parsePayload = <T>(schema: { safeParse: (value: unknown) => { success: true; data: T } | { success: false; error: { issues: Array<{ message: string }> } } }, payload: unknown): T => {
  const result = schema.safeParse(payload);
  if (!result.success) throw new AppError(result.error.issues[0]?.message ?? "Invalid promotion payload", 400);
  return result.data;
};

export const getActiveCoupons = async (_req: AuthRequest, res: Response) => {
  const coupons = await PromotionService.listActiveCoupons();
  res.status(200).json(new ApiResponse(true, "Active coupons fetched successfully", { coupons }));
};

export const getActiveOffers = async (_req: AuthRequest, res: Response) => {
  const offers = await PromotionService.listActiveOffers();
  res.status(200).json(new ApiResponse(true, "Active offers fetched successfully", { offers }));
};

export const validateCoupon = async (req: AuthRequest, res: Response) => {
  const result = validateCouponSchema.safeParse(req.body);
  if (!result.success) throw new AppError(result.error.issues[0]?.message ?? "Invalid coupon validation payload", 400);
  const validation = await PromotionService.validateCoupon(result.data.code, req.user!.userId, result.data.cartValue);
  res.status(200).json(new ApiResponse(true, "Coupon applied successfully", validation));
};

export const getCustomerCouponWallet = async (req: AuthRequest, res: Response) => {
  const wallet = await PromotionService.getCustomerCouponWallet(req.user!.userId);
  res.status(200).json(new ApiResponse(true, "Coupon wallet fetched successfully", wallet));
};

export const getAdminCoupons = async (_req: AuthRequest, res: Response) => {
  const coupons = await PromotionService.listCoupons();
  res.status(200).json(new ApiResponse(true, "Coupons fetched successfully", { coupons }));
};

export const getAdminOffers = async (_req: AuthRequest, res: Response) => {
  const offers = await PromotionService.listOffers();
  res.status(200).json(new ApiResponse(true, "Offers fetched successfully", { offers }));
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

export const deleteCoupon = async (req: AuthRequest, res: Response) => {
  const coupon = await PromotionService.deleteCoupon(String(req.params.couponId), req.user?.userId);
  res.status(200).json(new ApiResponse(true, "Coupon deactivated successfully", { coupon }));
};

export const createOffer = async (req: AuthRequest, res: Response) => {
  const offer = await PromotionService.createOffer(parsePayload(createOfferSchema, req.body), req.user?.userId);
  res.status(201).json(new ApiResponse(true, "Offer created successfully", { offer }));
};

export const updateOffer = async (req: AuthRequest, res: Response) => {
  const offer = await PromotionService.updateOffer(String(req.params.offerId), parsePayload(updateOfferSchema, req.body), req.user?.userId);
  res.status(200).json(new ApiResponse(true, "Offer updated successfully", { offer }));
};

export const deleteOffer = async (req: AuthRequest, res: Response) => {
  const offer = await PromotionService.deleteOffer(String(req.params.offerId), req.user?.userId);
  res.status(200).json(new ApiResponse(true, "Offer deactivated successfully", { offer }));
};
