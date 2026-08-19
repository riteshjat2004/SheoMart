import { Router } from "express";
import { getAdminAnalyticsOverview } from "../controllers/analytics.controller";
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

export default router;
