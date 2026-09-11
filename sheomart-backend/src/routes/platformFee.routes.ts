import { Router } from "express";
import { authenticate } from "../middleware/auth.middleware";
import { authorize } from "../middleware/role.middleware";
import { USER_ROLES } from "../constants/roles";
import { asyncHandler } from "../utils/asyncHandler";
import { getPlatformFeeConfig, updatePlatformFeeConfig } from "../controllers/platformFee.controller";

const router = Router();
router.get("/", authenticate, asyncHandler(getPlatformFeeConfig));
router.patch("/", authenticate, authorize(USER_ROLES.PLATFORM_ADMIN), asyncHandler(updatePlatformFeeConfig));
export default router;
