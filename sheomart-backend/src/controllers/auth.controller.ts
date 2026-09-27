import { Request, Response } from "express";
import { AuthService } from "../services/auth.services";
import { ApiResponse } from "../utils/apiResponse";
import {
  forgotPasswordSchema,
  loginSchema,
  registerSchema,
  resetPasswordSchema,
  verifyResetOtpSchema,
} from "../validators/auth.validator";
import { setRefreshTokenCookie, clearRefreshTokenCookie } from "../utils/cookies";
import { AuthRequest } from "../middleware/auth.middleware";

const extractMeta = (req: Request) => {
  const userAgent = (req.headers["user-agent"] as string) || "";
  const ipAddress =
    req.ip ||
    req.socket.remoteAddress ||
    (req.headers["x-forwarded-for"]
      ? String(req.headers["x-forwarded-for"]).split(",")[0].trim()
      : "") ||
    "127.0.0.1";
  return { userAgent, ipAddress };
};

export const register = async (req: Request, res: Response): Promise<void> => {
  const data = registerSchema.parse(req.body);
  const meta = extractMeta(req);

  const result = await AuthService.register(data, meta);

  // Set secure HttpOnly cookie for refresh token
  setRefreshTokenCookie(res, result.refreshToken);

  res.status(201).json(
    new ApiResponse(true, "User registered successfully", result)
  );
};

export const login = async (req: Request, res: Response): Promise<void> => {
  const data = loginSchema.parse(req.body);
  const meta = extractMeta(req);

  const result = await AuthService.login(data, meta);

  // Set secure HttpOnly cookie for refresh token
  setRefreshTokenCookie(res, result.refreshToken);

  res.status(200).json(
    new ApiResponse(true, "Login successful", result)
  );
};

export const refresh = async (req: Request, res: Response): Promise<void> => {
  const refreshToken =
    req.body?.refreshToken ??
    req.body?.refresh_token ??
    req.cookies?.refreshToken;

  if (!refreshToken) {
    res.status(401).json(new ApiResponse(false, "Refresh token is required"));
    return;
  }

  const meta = extractMeta(req);
  const result = await AuthService.refresh(refreshToken, meta);

  // Rotate cookie with new refresh token
  setRefreshTokenCookie(res, result.refreshToken);

  res.status(200).json(
    new ApiResponse(true, "Token refreshed successfully", result)
  );
};

export const logout = async (req: AuthRequest, res: Response): Promise<void> => {
  const userId = req.user?.userId;
  const sessionId = req.user?.sessionId;
  const meta = extractMeta(req);

  if (userId) {
    await AuthService.logout(userId, sessionId, meta);
  }

  // Clear refresh token cookie
  clearRefreshTokenCookie(res);

  res.status(200).json(new ApiResponse(true, "Logged out successfully"));
};

export const logoutAll = async (req: AuthRequest, res: Response): Promise<void> => {
  const userId = req.user?.userId;
  const meta = extractMeta(req);

  if (userId) {
    await AuthService.logoutAll(userId, meta);
  }

  clearRefreshTokenCookie(res);

  res.status(200).json(new ApiResponse(true, "Logged out of all sessions successfully"));
};

export const getUserSessions = async (req: AuthRequest, res: Response): Promise<void> => {
  const userId = req.user?.userId;
  const currentSessionId = req.user?.sessionId;

  if (!userId) {
    res.status(401).json(new ApiResponse(false, "Unauthorized"));
    return;
  }

  const sessions = await AuthService.getUserSessions(userId, currentSessionId);
  res.status(200).json(
    new ApiResponse(true, "Active sessions retrieved successfully", { sessions })
  );
};

export const revokeUserSession = async (req: AuthRequest, res: Response): Promise<void> => {
  const userId = req.user?.userId;
  const currentSessionId = req.user?.sessionId;
  const rawSessionId = req.params.sessionId;
  const targetSessionId = Array.isArray(rawSessionId) ? rawSessionId[0] : rawSessionId;

  if (!userId) {
    res.status(401).json(new ApiResponse(false, "Unauthorized"));
    return;
  }

  const result = await AuthService.revokeSession(userId, targetSessionId, currentSessionId);
  res.status(200).json(new ApiResponse(true, result.message));
};

export const forgotPassword = async (req: Request, res: Response): Promise<void> => {
  const { email } = forgotPasswordSchema.parse(req.body);
  const result = await AuthService.requestPasswordReset(email);
  res.status(200).json(new ApiResponse(true, result.message, result));
};

export const resendResetOtp = async (req: Request, res: Response): Promise<void> => {
  const { email } = forgotPasswordSchema.parse(req.body);
  const result = await AuthService.requestPasswordReset(email);
  res.status(200).json(new ApiResponse(true, result.message));
};

export const verifyResetOtp = async (req: Request, res: Response): Promise<void> => {
  const data = verifyResetOtpSchema.parse(req.body);
  const result = await AuthService.verifyPasswordResetOtp(data.email, data.otp);
  res.status(200).json(new ApiResponse(true, "Verification successful", result));
};

export const resetPassword = async (req: Request, res: Response): Promise<void> => {
  const data = resetPasswordSchema.parse(req.body);
  const result = await AuthService.resetPassword(data.email, data.resetToken, data.newPassword);
  clearRefreshTokenCookie(res);
  res.status(200).json(new ApiResponse(true, result.message));
};