import { Router } from "express";

import {
  getAdminUsers,
  getProfile,
  updateProfile,
  changePassword,
  deleteAccount,
} from "../controllers/user.controller";
import { asyncHandler } from "../utils/asyncHandler";
import { authenticate } from "../middleware/auth.middleware";
import { authorize } from "../middleware/role.middleware";
import { USER_ROLES } from "../constants/roles";

const router = Router();

router.get("/admin", authenticate, authorize(USER_ROLES.PLATFORM_ADMIN), asyncHandler(getAdminUsers));
router.get("/profile", authenticate, asyncHandler(getProfile));
router.patch("/profile", authenticate, asyncHandler(updateProfile));
router.patch("/change-password", authenticate, asyncHandler(changePassword));
router.delete("/account", authenticate, asyncHandler(deleteAccount));

export default router;