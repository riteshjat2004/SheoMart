import { Router } from "express";
import rateLimit from "express-rate-limit";
import { asyncHandler } from "../utils/asyncHandler";
import {
  createSellerPasswordResetRequest,
  getSellerRecovery,
} from "../controllers/seller-password-reset.controller";

const router = Router();
const sellerResetRateLimit = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: "Too many password reset requests. Try again later." },
});

router.get(
  "/seller/password-reset-recovery",
  sellerResetRateLimit,
  asyncHandler(getSellerRecovery)
);
router.post(
  "/seller/password-reset-request",
  sellerResetRateLimit,
  asyncHandler(createSellerPasswordResetRequest)
);
export default router;
