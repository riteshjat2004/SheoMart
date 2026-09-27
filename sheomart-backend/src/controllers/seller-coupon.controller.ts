import { Response } from "express";
import { AppError } from "../errors/AppError";
import { AuthRequest } from "../middleware/auth.middleware";
import { SellerCouponService } from "../services/seller-coupon.service";
import { ApiResponse } from "../utils/apiResponse";
import { z } from "zod";

const createSellerCouponSchema = z.object({
  title: z.string().trim().min(2, "Title must be at least 2 characters").max(120),
  description: z.string().trim().max(1000).optional().default(""),
  code: z.string().trim().min(2, "Code must be at least 2 characters").max(40).transform((v) => v.toUpperCase()),
  discountType: z.enum(["flat", "percentage"]),
  discountValue: z.number().finite().nonnegative("Discount value must be positive"),
  minimumCartValue: z.number().finite().nonnegative().optional().default(0),
  maximumDiscount: z.number().finite().nonnegative().nullable().optional(),
  usageLimit: z.number().int().positive().nullable().optional(),
  oncePerCustomer: z.boolean().optional().default(true),
  perUserLimit: z.number().int().positive().optional().default(1),
  newUsersOnly: z.boolean().optional().default(false),
  verifiedOnly: z.boolean().optional().default(false),
  applicableScope: z.enum(["store", "category", "product"]).optional().default("store"),
  categoryId: z.string().trim().nullable().optional().default(null),
  productId: z.string().trim().nullable().optional().default(null),
  categoryIds: z.array(z.string()).optional().default([]),
  productIds: z.array(z.string()).optional().default([]),
  isFeatured: z.boolean().optional().default(false),
  startsAt: z.coerce.date(),
  endsAt: z.coerce.date(),
  isActive: z.boolean().optional().default(true),
});

const updateSellerCouponSchema = createSellerCouponSchema.partial();

const bulkActionSchema = z.object({
  action: z.enum(["activate", "deactivate", "delete"]),
  couponIds: z.array(z.string()).min(1, "At least one coupon must be selected"),
});

const validateSellerCouponSchema = z.object({
  code: z.string().trim().min(1, "Coupon code is required"),
  storeId: z.string().trim().min(1, "Store ID is required"),
  cartValue: z.number().finite().nonnegative(),
  categoryIds: z.array(z.string()).optional(),
  productIds: z.array(z.string()).optional(),
});

export const listSellerCoupons = async (req: AuthRequest, res: Response) => {
  const result = await SellerCouponService.listCoupons(req.user!.userId, req.query);
  res.status(200).json(new ApiResponse(true, "Store coupons fetched successfully", result));
};

export const getSellerCouponSummary = async (req: AuthRequest, res: Response) => {
  const summary = await SellerCouponService.getCouponSummary(req.user!.userId);
  res.status(200).json(new ApiResponse(true, "Coupon summary fetched successfully", summary));
};

export const getSellerCouponAnalytics = async (req: AuthRequest, res: Response) => {
  const analytics = await SellerCouponService.getCouponAnalytics(req.user!.userId);
  res.status(200).json(new ApiResponse(true, "Coupon analytics fetched successfully", analytics));
};

export const getSellerCouponRedemptions = async (req: AuthRequest, res: Response) => {
  const redemptions = await SellerCouponService.getRedemptionHistory(req.user!.userId, req.query);
  res.status(200).json(new ApiResponse(true, "Coupon redemption history fetched successfully", redemptions));
};

export const getSellerCoupon = async (req: AuthRequest, res: Response) => {
  const couponId = Array.isArray(req.params.couponId) ? req.params.couponId[0] : req.params.couponId;
  const coupon = await SellerCouponService.getCoupon(req.user!.userId, couponId);
  res.status(200).json(new ApiResponse(true, "Coupon details fetched successfully", coupon));
};

export const createSellerCoupon = async (req: AuthRequest, res: Response) => {
  const parsed = createSellerCouponSchema.safeParse(req.body);
  if (!parsed.success) {
    throw new AppError(parsed.error.issues[0]?.message || "Invalid coupon input", 400);
  }
  const coupon = await SellerCouponService.createCoupon(req.user!.userId, parsed.data);
  res.status(201).json(new ApiResponse(true, "Store coupon created successfully", coupon));
};

export const updateSellerCoupon = async (req: AuthRequest, res: Response) => {
  const couponId = Array.isArray(req.params.couponId) ? req.params.couponId[0] : req.params.couponId;
  const parsed = updateSellerCouponSchema.safeParse(req.body);
  if (!parsed.success) {
    throw new AppError(parsed.error.issues[0]?.message || "Invalid coupon update payload", 400);
  }
  const coupon = await SellerCouponService.updateCoupon(req.user!.userId, couponId, parsed.data);
  res.status(200).json(new ApiResponse(true, "Store coupon updated successfully", coupon));
};

export const updateSellerCouponStatus = async (req: AuthRequest, res: Response) => {
  const couponId = Array.isArray(req.params.couponId) ? req.params.couponId[0] : req.params.couponId;
  const isActive = typeof req.body?.isActive === "boolean" ? req.body.isActive : true;
  const coupon = await SellerCouponService.updateCouponStatus(req.user!.userId, couponId, isActive);
  res.status(200).json(new ApiResponse(true, `Coupon ${isActive ? "activated" : "deactivated"} successfully`, coupon));
};

export const deleteSellerCoupon = async (req: AuthRequest, res: Response) => {
  const couponId = Array.isArray(req.params.couponId) ? req.params.couponId[0] : req.params.couponId;
  const result = await SellerCouponService.deleteCoupon(req.user!.userId, couponId);
  res.status(200).json(new ApiResponse(true, "Coupon deleted successfully", result));
};

export const duplicateSellerCoupon = async (req: AuthRequest, res: Response) => {
  const couponId = Array.isArray(req.params.couponId) ? req.params.couponId[0] : req.params.couponId;
  const coupon = await SellerCouponService.duplicateCoupon(req.user!.userId, couponId);
  res.status(201).json(new ApiResponse(true, "Coupon duplicated successfully", coupon));
};

export const bulkSellerCouponAction = async (req: AuthRequest, res: Response) => {
  const parsed = bulkActionSchema.safeParse(req.body);
  if (!parsed.success) {
    throw new AppError(parsed.error.issues[0]?.message || "Invalid bulk action payload", 400);
  }
  const result = await SellerCouponService.bulkAction(req.user!.userId, parsed.data.action, parsed.data.couponIds);
  res.status(200).json(new ApiResponse(true, "Bulk action executed successfully", result));
};

export const validateCustomerSellerCoupon = async (req: AuthRequest, res: Response) => {
  const parsed = validateSellerCouponSchema.safeParse(req.body);
  if (!parsed.success) {
    throw new AppError(parsed.error.issues[0]?.message || "Invalid validation payload", 400);
  }

  const validation = await SellerCouponService.validateSellerCoupon(
    parsed.data.code,
    req.user!.userId,
    parsed.data.storeId,
    parsed.data.cartValue,
    {
      categoryIds: parsed.data.categoryIds,
      productIds: parsed.data.productIds,
    }
  );

  res.status(200).json(new ApiResponse(true, "Store coupon applied successfully", validation));
};
