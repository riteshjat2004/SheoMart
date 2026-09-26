import { Router } from "express";
import {
  bulkCouponAction,
  bulkOfferAction,
  createCoupon,
  createOffer,
  deleteCoupon,
  deleteOffer,
  getActiveCoupons,
  getActiveOffers,
  getAdminCoupons,
  getAdminOffers,
  getCoupon,
  getOffer,
  getCustomerCouponWallet,
  restoreCoupon,
  restoreOffer,
  updateCoupon,
  updateCouponStatus,
  updateOffer,
  updateOfferStatus,
  validateCoupon,
} from "../controllers/promotion.controller";
import { authenticate } from "../middleware/auth.middleware";
import { authorize } from "../middleware/role.middleware";
import { USER_ROLES } from "../constants/roles";
import { asyncHandler } from "../utils/asyncHandler";
import { uploadProductImage } from "../middleware/upload.middleware";

const router = Router();
const adminOnly = [authenticate, authorize(USER_ROLES.PLATFORM_ADMIN)];

// Public / Customer promotion routes
router.get("/coupons/active", asyncHandler(getActiveCoupons));
router.get("/offers/active", asyncHandler(getActiveOffers));
router.get("/coupons", asyncHandler(getActiveCoupons));
router.get("/offers", asyncHandler(getActiveOffers));
router.post("/coupons/validate", authenticate, asyncHandler(validateCoupon));
router.get("/coupons/wallet", authenticate, asyncHandler(getCustomerCouponWallet));

// Admin Coupon Routes
router.get("/admin/coupons", ...adminOnly, asyncHandler(getAdminCoupons));
router.post("/admin/coupons", ...adminOnly, asyncHandler(createCoupon));
router.post("/admin/coupons/bulk-action", ...adminOnly, asyncHandler(bulkCouponAction));
router.get("/admin/coupons/:couponId", ...adminOnly, asyncHandler(getCoupon));
router.patch("/admin/coupons/:couponId", ...adminOnly, asyncHandler(updateCoupon));
router.patch("/admin/coupons/:couponId/status", ...adminOnly, asyncHandler(updateCouponStatus));
router.patch("/admin/coupons/:couponId/restore", ...adminOnly, asyncHandler(restoreCoupon));
router.delete("/admin/coupons/:couponId", ...adminOnly, asyncHandler(deleteCoupon));

// Admin Offer Routes
router.get("/admin/offers", ...adminOnly, asyncHandler(getAdminOffers));
router.post("/admin/offers", ...adminOnly, uploadProductImage, asyncHandler(createOffer));
router.post("/admin/offers/bulk-action", ...adminOnly, asyncHandler(bulkOfferAction));
router.get("/admin/offers/:offerId", ...adminOnly, asyncHandler(getOffer));
router.patch("/admin/offers/:offerId", ...adminOnly, uploadProductImage, asyncHandler(updateOffer));
router.patch("/admin/offers/:offerId/status", ...adminOnly, asyncHandler(updateOfferStatus));
router.patch("/admin/offers/:offerId/restore", ...adminOnly, asyncHandler(restoreOffer));
router.delete("/admin/offers/:offerId", ...adminOnly, asyncHandler(deleteOffer));

export default router;
