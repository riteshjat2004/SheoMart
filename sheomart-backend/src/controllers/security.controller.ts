import { Request, Response } from "express";
import { User } from "../models/user.model";
import { Session } from "../models/session.model";
import { ApiResponse } from "../utils/apiResponse";
import { AppError } from "../errors/AppError";
import { SettingsService } from "../services/settings.service";
import { AuditLogService } from "../services/audit-log.service";
import { SecurityLogger } from "../utils/security-logger";
import { parseDevice } from "../utils/device-parser";
import { env } from "../config/env";

export const getAdminSessions = async (req: Request, res: Response): Promise<void> => {
  const currentUserId = (req as any).user?.userId;
  const currentSessionId = (req as any).user?.sessionId;

  // Retrieve active sessions from Session collection
  let sessionsFromDb = await Session.find({
    userId: currentUserId,
    isRevoked: false,
    expiresAt: { $gt: new Date() },
  })
    .sort({ lastUsedAt: -1 })
    .lean();

  // Fallback to user.sessions if no standalone session records exist yet
  if (sessionsFromDb.length === 0) {
    const user = await User.findOne({ userId: currentUserId }).lean();
    if (!user) throw new AppError("User not found", 404);

    const mapped = (user.sessions || []).map((s) => {
      const { browser, os, device } = parseDevice(s.userAgent || "");
      return {
        sessionId: s.sessionId,
        isCurrent: s.sessionId === currentSessionId,
        browser,
        os,
        deviceType: device,
        ipAddress: s.ipAddress || "127.0.0.1",
        userAgent: s.userAgent,
        createdAt: s.createdAt,
        lastUsedAt: s.lastUsedAt,
      };
    });

    mapped.sort((a, b) => {
      if (a.isCurrent) return -1;
      if (b.isCurrent) return 1;
      return new Date(b.lastUsedAt).getTime() - new Date(a.lastUsedAt).getTime();
    });

    res.status(200).json(
      new ApiResponse(true, "Active sessions fetched successfully", { sessions: mapped })
    );
    return;
  }

  const sessions = sessionsFromDb.map((s) => {
    return {
      sessionId: s.sessionId,
      isCurrent: s.sessionId === currentSessionId,
      browser: s.browser || "Unknown Browser",
      os: s.os || "Unknown OS",
      deviceType: s.device || "Desktop",
      ipAddress: s.ip || "127.0.0.1",
      userAgent: s.userAgent,
      createdAt: s.createdAt,
      lastUsedAt: s.lastUsedAt,
    };
  });

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
  const rawSessionId = req.params.sessionId;
  const sessionId = Array.isArray(rawSessionId) ? rawSessionId[0] : rawSessionId;

  if (sessionId === currentSessionId) {
    throw new AppError("Cannot revoke your current active session. Use sign out instead.", 400);
  }

  // Revoke in Session model
  await Session.updateOne(
    { sessionId, userId: currentUserId },
    { $set: { isRevoked: true, revokedAt: new Date(), revokedReason: "ADMIN_SECURITY_REVOKED" } }
  );

  // Synchronize User.sessions
  const user = await User.findOne({ userId: currentUserId });
  if (user) {
    user.sessions = user.sessions.filter((s) => s.sessionId !== sessionId);
    await user.save();
  }

  await AuditLogService.logAction({
    adminId: currentUserId,
    adminName: user?.name || "Admin",
    action: "SESSION_REVOKED",
    module: "security",
    details: { sessionId },
    req,
  });

  await SecurityLogger.log({
    action: "SESSION_REVOKED",
    userId: currentUserId,
    sessionId,
    req,
  });

  res.status(200).json(
    new ApiResponse(true, "Session terminated successfully")
  );
};

export const logoutOtherSessions = async (req: Request, res: Response): Promise<void> => {
  const currentUserId = (req as any).user?.userId;
  const currentSessionId = (req as any).user?.sessionId;

  // Revoke all other sessions in Session collection
  const updateResult = await Session.updateMany(
    { userId: currentUserId, sessionId: { $ne: currentSessionId }, isRevoked: false },
    { $set: { isRevoked: true, revokedAt: new Date(), revokedReason: "ALL_OTHER_SESSIONS_REVOKED" } }
  );

  const user = await User.findOne({ userId: currentUserId });
  let revokedCount = updateResult.modifiedCount || 0;
  if (user) {
    const prevCount = user.sessions.filter((s) => s.sessionId !== currentSessionId).length;
    user.sessions = user.sessions.filter((s) => s.sessionId === currentSessionId);
    await user.save();
    if (revokedCount === 0) revokedCount = prevCount;
  }

  await AuditLogService.logAction({
    adminId: currentUserId,
    adminName: user?.name || "Admin",
    action: "ALL_OTHER_SESSIONS_REVOKED",
    module: "security",
    details: { revokedCount },
    req,
  });

  await SecurityLogger.log({
    action: "LOGOUT_ALL",
    userId: currentUserId,
    details: { revokedCount, exceptSessionId: currentSessionId },
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
      reuseDetection: true,
      tokenVersioning: true,
      secureCookies: env.NODE_ENV === "production",
    },
    middlewareChecks: {
      helmet: { enabled: true, status: "Active (CSP, HSTS Preload, Permissions-Policy, X-Frame-Options)" },
      rateLimiter: { enabled: true, status: "Active (Route-specific tiered rate limiting)" },
      cors: { enabled: true, origin: env.CORS_ORIGIN || "Configured" },
      mongoSanitize: { enabled: true, status: "Active (NoSQL injection filter enabled)" },
      hpp: { enabled: true, status: "Active (HTTP Parameter Pollution Protection)" },
      compression: { enabled: true, status: "Gzip enabled" },
      csrfProtection: { enabled: true, status: "Active (Origin/Referer custom header defense)" },
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
