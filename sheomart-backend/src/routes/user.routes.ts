import { Router } from "express";

import {
  getAdminUsers,
  getAdminUserStats,
  getAdminUserDetails,
  createAdminUser,
  updateAdminUser,
  updateUserStatus,
  updateUserRole,
  verifyCustomer,
  deleteAdminUser,
  restoreAdminUser,
  bulkUserAction,
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

// Admin User Management Routes (Protected & Restricted to PLATFORM_ADMIN)
router.get("/admin", authenticate, authorize(USER_ROLES.PLATFORM_ADMIN), asyncHandler(getAdminUsers));
router.get("/admin/stats", authenticate, authorize(USER_ROLES.PLATFORM_ADMIN), asyncHandler(getAdminUserStats));
router.post("/admin/bulk-action", authenticate, authorize(USER_ROLES.PLATFORM_ADMIN), asyncHandler(bulkUserAction));
router.post("/admin", authenticate, authorize(USER_ROLES.PLATFORM_ADMIN), asyncHandler(createAdminUser));
router.get("/admin/:userId", authenticate, authorize(USER_ROLES.PLATFORM_ADMIN), asyncHandler(getAdminUserDetails));
router.patch("/admin/:userId", authenticate, authorize(USER_ROLES.PLATFORM_ADMIN), asyncHandler(updateAdminUser));
router.patch("/admin/:userId/status", authenticate, authorize(USER_ROLES.PLATFORM_ADMIN), asyncHandler(updateUserStatus));
router.patch("/admin/:userId/role", authenticate, authorize(USER_ROLES.PLATFORM_ADMIN), asyncHandler(updateUserRole));
router.patch("/admin/:userId/verify", authenticate, authorize(USER_ROLES.PLATFORM_ADMIN), asyncHandler(verifyCustomer));
router.delete("/admin/:userId", authenticate, authorize(USER_ROLES.PLATFORM_ADMIN), asyncHandler(deleteAdminUser));
router.patch("/admin/:userId/restore", authenticate, authorize(USER_ROLES.PLATFORM_ADMIN), asyncHandler(restoreAdminUser));

// User Profile Routes
router.get("/profile", authenticate, asyncHandler(getProfile));
router.patch("/profile", authenticate, asyncHandler(updateProfile));
router.patch("/change-password", authenticate, asyncHandler(changePassword));
router.post("/change-password", authenticate, asyncHandler(changePassword));
router.delete("/account", authenticate, asyncHandler(deleteAccount));

export default router;