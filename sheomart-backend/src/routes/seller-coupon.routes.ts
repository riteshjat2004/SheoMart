import { Router } from "express";
import { authenticate } from "../middleware/auth.middleware";
import { authorize } from "../middleware/role.middleware";
import { asyncHandler } from "../utils/asyncHandler";
import { USER_ROLES } from "../constants/roles";
import {
  bulkSellerCouponAction,
  createSellerCoupon,
  deleteSellerCoupon,
  duplicateSellerCoupon,
  getSellerCoupon,
  getSellerCouponAnalytics,
  getSellerCouponRedemptions,
  getSellerCouponSummary,
  listSellerCoupons,
  updateSellerCoupon,
  updateSellerCouponStatus,
  validateCustomerSellerCoupon,
} from "../controllers/seller-coupon.controller";

const router = Router();

// Customer checkout validation for store coupons (Accessible by authenticated customers)
router.post("/validate", authenticate, asyncHandler(validateCustomerSellerCoupon));

// All management routes require authenticated store owner
router.get("/", authenticate, authorize(USER_ROLES.STORE_OWNER), asyncHandler(listSellerCoupons));
router.post("/", authenticate, authorize(USER_ROLES.STORE_OWNER), asyncHandler(createSellerCoupon));
router.get("/summary", authenticate, authorize(USER_ROLES.STORE_OWNER), asyncHandler(getSellerCouponSummary));
router.get("/analytics", authenticate, authorize(USER_ROLES.STORE_OWNER), asyncHandler(getSellerCouponAnalytics));
router.get("/redemptions", authenticate, authorize(USER_ROLES.STORE_OWNER), asyncHandler(getSellerCouponRedemptions));
router.post("/bulk-action", authenticate, authorize(USER_ROLES.STORE_OWNER), asyncHandler(bulkSellerCouponAction));

router.get("/:couponId", authenticate, authorize(USER_ROLES.STORE_OWNER), asyncHandler(getSellerCoupon));
router.patch("/:couponId", authenticate, authorize(USER_ROLES.STORE_OWNER), asyncHandler(updateSellerCoupon));
router.patch("/:couponId/status", authenticate, authorize(USER_ROLES.STORE_OWNER), asyncHandler(updateSellerCouponStatus));
router.delete("/:couponId", authenticate, authorize(USER_ROLES.STORE_OWNER), asyncHandler(deleteSellerCoupon));
router.post("/:couponId/duplicate", authenticate, authorize(USER_ROLES.STORE_OWNER), asyncHandler(duplicateSellerCoupon));

export default router;
