import { Router } from "express";
import { authorize } from "../middleware/role.middleware";
import { authenticate } from "../middleware/auth.middleware";
import { asyncHandler } from "../utils/asyncHandler";
import { USER_ROLES } from "../constants/roles";
import {
  approveSellerPasswordResetRequest,
  listSellerPasswordResetRequests,
  rejectSellerPasswordResetRequest,
} from "../controllers/seller-password-reset.controller";

const router = Router();
const adminOnly = [authenticate, authorize(USER_ROLES.PLATFORM_ADMIN)];

router.get("/password-reset-requests", ...adminOnly, asyncHandler(listSellerPasswordResetRequests));
router.patch("/password-reset-requests/:id/approve", ...adminOnly, asyncHandler(approveSellerPasswordResetRequest));
router.patch("/password-reset-requests/:id/reject", ...adminOnly, asyncHandler(rejectSellerPasswordResetRequest));

export default router;
