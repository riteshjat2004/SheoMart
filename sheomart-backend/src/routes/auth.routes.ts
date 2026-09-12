import { Router } from "express";
import {
    register,
    login,
    refresh,
} from "../controllers/auth.controller";
import { asyncHandler } from "../utils/asyncHandler";
import { forgotPassword, verifyResetOtp, resetPassword, resendResetOtp } from "../controllers/auth.controller";
import rateLimit from "express-rate-limit";

const router = Router();

const passwordResetIpRateLimit = rateLimit({ windowMs: 60 * 60 * 1000, max: 10, standardHeaders: true, legacyHeaders: false, message: { success: false, message: "Too many password reset requests. Try again later." } });

router.post("/register", asyncHandler(register));
router.post("/login", asyncHandler(login));
router.post("/refresh", asyncHandler(refresh));
router.post("/forgot-password", passwordResetIpRateLimit, asyncHandler(forgotPassword));
router.post("/verify-reset-otp", passwordResetIpRateLimit, asyncHandler(verifyResetOtp));
router.post("/resend-reset-otp", passwordResetIpRateLimit, asyncHandler(resendResetOtp));
router.post("/reset-password", passwordResetIpRateLimit, asyncHandler(resetPassword));

export default router;