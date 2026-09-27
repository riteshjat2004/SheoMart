import { Router } from "express";
import {
  register,
  login,
  refresh,
  logout,
  logoutAll,
  getUserSessions,
  revokeUserSession,
  forgotPassword,
  verifyResetOtp,
  resetPassword,
  resendResetOtp,
} from "../controllers/auth.controller";
import { asyncHandler } from "../utils/asyncHandler";
import { authenticate } from "../middleware/auth.middleware";
import {
  authLoginLimiter,
  authRegisterLimiter,
  authRefreshLimiter,
  authPasswordResetLimiter,
  authOtpLimiter,
} from "../middleware/rate-limit.middleware";

const router = Router();

// ── Public Auth Endpoints ───────────────────────────────────────────────────
router.post("/register", authRegisterLimiter, asyncHandler(register));
router.post("/login", authLoginLimiter, asyncHandler(login));
router.post("/refresh", authRefreshLimiter, asyncHandler(refresh));

// ── Session Management Endpoints ────────────────────────────────────────────
router.post("/logout", authenticate, asyncHandler(logout));
router.post("/logout-all", authenticate, asyncHandler(logoutAll));
router.get("/sessions", authenticate, asyncHandler(getUserSessions));
router.delete("/sessions/:sessionId", authenticate, asyncHandler(revokeUserSession));

// ── Password Reset Endpoints ────────────────────────────────────────────────
router.post("/forgot-password", authPasswordResetLimiter, asyncHandler(forgotPassword));
router.post("/verify-reset-otp", authOtpLimiter, asyncHandler(verifyResetOtp));
router.post("/resend-reset-otp", authOtpLimiter, asyncHandler(resendResetOtp));
router.post("/reset-password", authPasswordResetLimiter, asyncHandler(resetPassword));

export default router;