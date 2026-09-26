import { Request, Response } from "express";
import { User } from "../models/user.model";
import { ApiResponse } from "../utils/apiResponse";
import { AppError } from "../errors/AppError";
import { SettingsService } from "../services/settings.service";
import { AuditLogService } from "../services/audit-log.service";
import { env } from "../config/env";

function parseDevice(userAgent: string) {
  let browser = "Unknown Browser";
  let os = "Unknown OS";
  let deviceType = "Desktop";

  if (/mobile/i.test(userAgent)) deviceType = "Mobile";
  else if (/tablet|ipad/i.test(userAgent)) deviceType = "Tablet";

  if (/chrome|crios/i.test(userAgent)) browser = "Chrome";
  else if (/firefox|fxios/i.test(userAgent)) browser = "Firefox";
  else if (/safari/i.test(userAgent) && !/chrome/i.test(userAgent)) browser = "Safari";
  else if (/edg/i.test(userAgent)) browser = "Edge";
  else if (/postman/i.test(userAgent)) browser = "Postman";

  if (/windows/i.test(userAgent)) os = "Windows";
  else if (/macintosh|mac os x/i.test(userAgent)) os = "macOS";
  else if (/linux/i.test(userAgent)) os = "Linux";
  else if (/android/i.test(userAgent)) os = "Android";
  else if (/iphone|ipad|ipod/i.test(userAgent)) os = "iOS";

  return { browser, os, deviceType };
}

export const getAdminSessions = async (req: Request, res: Response): Promise<void> => {
  const currentUserId = (req as any).user?.userId;
  const currentSessionId = (req as any).user?.sessionId;

  const user = await User.findOne({ userId: currentUserId }).lean();
  if (!user) throw new AppError("User not found", 404);

  const sessions = (user.sessions || []).map((s) => {
    const { browser, os, deviceType } = parseDevice(s.userAgent || "");
    return {
      sessionId: s.sessionId,
      isCurrent: s.sessionId === currentSessionId,
      browser,
      os,
      deviceType,
      ipAddress: s.ipAddress || "127.0.0.1",
      userAgent: s.userAgent,
      createdAt: s.createdAt,
      lastUsedAt: s.lastUsedAt,
    };
  });

  // Sort: current session first, then newest lastUsedAt
  sessions.sort((a, b) => {
    if (a.isCurrent) return -1;
    if (b.isCurrent) return 1;
    return new Date(b.lastUsedAt).getTime() - new Date(a.lastUsedAt).getTime();
  });

  res.status(200).json(
    new ApiResponse(true, "Active sessions fetched successfully", { sessions })
  );
};

export const revokeSession = async (req: Request, res: Response): Promise<void> => {
  const currentUserId = (req as any).user?.userId;
  const currentSessionId = (req as any).user?.sessionId;
  const { sessionId } = req.params;

  if (sessionId === currentSessionId) {
    throw new AppError("Cannot revoke your current active session. Use sign out instead.", 400);
  }

  const user = await User.findOne({ userId: currentUserId });
  if (!user) throw new AppError("User not found", 404);

  const prevCount = user.sessions.length;
  user.sessions = user.sessions.filter((s) => s.sessionId !== sessionId);

  if (user.sessions.length === prevCount) {
    throw new AppError("Session not found", 404);
  }

  await user.save();

  await AuditLogService.logAction({
    adminId: currentUserId,
    adminName: user.name,
    action: "SESSION_REVOKED",
    module: "security",
    details: { sessionId },
    req,
  });

  res.status(200).json(
    new ApiResponse(true, "Session terminated successfully")
  );
};

export const logoutOtherSessions = async (req: Request, res: Response): Promise<void> => {
  const currentUserId = (req as any).user?.userId;
  const currentSessionId = (req as any).user?.sessionId;

  const user = await User.findOne({ userId: currentUserId });
  if (!user) throw new AppError("User not found", 404);

  const revokedCount = user.sessions.filter((s) => s.sessionId !== currentSessionId).length;
  user.sessions = user.sessions.filter((s) => s.sessionId === currentSessionId);
  await user.save();

  await AuditLogService.logAction({
    adminId: currentUserId,
    adminName: user.name,
    action: "ALL_OTHER_SESSIONS_REVOKED",
    module: "security",
    details: { revokedCount },
    req,
  });

  res.status(200).json(
    new ApiResponse(true, `Successfully logged out of ${revokedCount} other sessions.`)
  );
};

export const getSecurityStatus = async (_req: Request, res: Response): Promise<void> => {
  const settings = await SettingsService.getSettings();

  const status = {
    jwtSecurity: {
      accessTokenExpiry: "15m",
      refreshTokenExpiry: "7d",
      algorithm: "HS256",
      tokenRotation: true,
      secureCookies: env.NODE_ENV === "production",
    },
    middlewareChecks: {
      helmet: { enabled: true, status: "Active (X-Frame-Options, HSTS, CSP ready)" },
      rateLimiter: { enabled: true, status: "Active (100 req / 15 min window)" },
      cors: { enabled: true, origin: env.CORS_ORIGIN || "Configured" },
      mongoSanitize: { enabled: true, status: "Active" },
      hpp: { enabled: true, status: "Active (HTTP Parameter Pollution Protection)" },
      compression: { enabled: true, status: "Gzip enabled" },
    },
    policies: {
      maxLoginAttempts: settings.security.maxLoginAttempts,
      lockoutDurationMinutes: settings.security.lockoutDurationMinutes,
      passwordExpiryDays: settings.security.passwordExpiryDays,
      requireStrongPassword: settings.security.requireStrongPassword,
      requireEmailVerification: settings.security.requireEmailVerification,
      requirePhoneVerification: settings.security.requirePhoneVerification,
      twoFactorAuthEnabled: settings.security.twoFactorAuthEnabled,
    },
    maintenance: {
      enabled: settings.maintenance.enabled,
      title: settings.maintenance.title,
      estimatedReturnTime: settings.maintenance.estimatedReturnTime,
    },
  };

  res.status(200).json(
    new ApiResponse(true, "Security status retrieved", status)
  );
};
