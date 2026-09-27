import { Router } from "express";
import {
  exportAnalytics,
  getAdminAnalyticsOverview,
  getCustomerInsights,
  getSellerAnalyticsOverview,
  exportSellerAnalytics,
} from "../controllers/analytics.controller";
import { authenticate } from "../middleware/auth.middleware";
import { authorize } from "../middleware/role.middleware";
import { asyncHandler } from "../utils/asyncHandler";
import { USER_ROLES } from "../constants/roles";

const router = Router();

router.get(
  "/admin/overview",
  authenticate,
  authorize(USER_ROLES.PLATFORM_ADMIN),
  asyncHandler(getAdminAnalyticsOverview)
);

router.get(
  "/admin/export",
  authenticate,
  authorize(USER_ROLES.PLATFORM_ADMIN),
  asyncHandler(exportAnalytics)
);

router.get(
  "/customer/insights",
  authenticate,
  authorize(USER_ROLES.CUSTOMER),
  asyncHandler(getCustomerInsights)
);

// Seller Analytics Routes
router.get(
  "/seller/overview",
  authenticate,
  authorize(USER_ROLES.STORE_OWNER),
  asyncHandler(getSellerAnalyticsOverview)
);

router.get(
  "/store/overview",
  authenticate,
  authorize(USER_ROLES.STORE_OWNER),
  asyncHandler(getSellerAnalyticsOverview)
);

router.get(
  "/seller/export",
  authenticate,
  authorize(USER_ROLES.STORE_OWNER),
  asyncHandler(exportSellerAnalytics)
);

router.get(
  "/store/export",
  authenticate,
  authorize(USER_ROLES.STORE_OWNER),
  asyncHandler(exportSellerAnalytics)
);

export default router;

