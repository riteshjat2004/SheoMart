import { Router } from "express";
import {
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
  updateCoupon,
  updateOffer,
  validateCoupon,
} from "../controllers/promotion.controller";
import { authenticate } from "../middleware/auth.middleware";
import { authorize } from "../middleware/role.middleware";
import { USER_ROLES } from "../constants/roles";
import { asyncHandler } from "../utils/asyncHandler";

const router = Router();
const adminOnly = [authenticate, authorize(USER_ROLES.PLATFORM_ADMIN)];

router.get("/coupons/active", asyncHandler(getActiveCoupons));
router.get("/offers/active", asyncHandler(getActiveOffers));
router.get("/coupons", asyncHandler(getActiveCoupons));
router.get("/offers", asyncHandler(getActiveOffers));
router.post("/coupons/validate", authenticate, asyncHandler(validateCoupon));
router.get("/coupons/wallet", authenticate, asyncHandler(getCustomerCouponWallet));

router.get("/admin/coupons", ...adminOnly, asyncHandler(getAdminCoupons));
router.post("/admin/coupons", ...adminOnly, asyncHandler(createCoupon));
router.get("/admin/coupons/:couponId", ...adminOnly, asyncHandler(getCoupon));
router.patch("/admin/coupons/:couponId", ...adminOnly, asyncHandler(updateCoupon));
router.delete("/admin/coupons/:couponId", ...adminOnly, asyncHandler(deleteCoupon));

router.get("/admin/offers", ...adminOnly, asyncHandler(getAdminOffers));
router.post("/admin/offers", ...adminOnly, asyncHandler(createOffer));
router.get("/admin/offers/:offerId", ...adminOnly, asyncHandler(getOffer));
router.patch("/admin/offers/:offerId", ...adminOnly, asyncHandler(updateOffer));
router.delete("/admin/offers/:offerId", ...adminOnly, asyncHandler(deleteOffer));

export default router;
