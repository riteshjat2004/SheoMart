import { Router } from "express";

import {
  getProfile,
  updateProfile,
  changePassword,
  deleteAccount,
} from "../controllers/user.controller";
import { asyncHandler } from "../utils/asyncHandler";
import { authenticate } from "../middleware/auth.middleware";

const router = Router();

router.get("/profile", authenticate, asyncHandler(getProfile));
router.patch("/profile", authenticate, asyncHandler(updateProfile));
router.patch("/change-password", authenticate, asyncHandler(changePassword));
router.delete("/account", authenticate, asyncHandler(deleteAccount));

export default router;