import { User } from "../models/user.model";
import { Store } from "../models/store.model";
import { Session } from "../models/session.model";
import { PasswordResetOtp } from "../models/password-reset-otp.model";
import { AppError } from "../errors/AppError";
import { v4 as uuidv4 } from "uuid";
import { randomBytes, randomInt } from "node:crypto";
import { USER_ROLES } from "../constants/roles";
import { sendPasswordResetOTP } from "./mail.service";
import { logger } from "../utils/logger";
import { SecurityLogger } from "../utils/security-logger";
import { parseDevice } from "../utils/device-parser";
import { SettingsService } from "./settings.service";

import {
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken,
} from "../utils/jwt";

import {
  RegisterInput,
  LoginInput,
} from "../validators/auth.validator";

import {
  comparePassword,
  hashPassword,
  compareToken,
  hashToken,
} from "../utils/password";

export class AuthService {
  private static readonly genericResetMessage = "If this email exists, we've sent a verification code.";

  private static async issueResetOtp(email: string) {
    const user = await User.findOne({ email, role: USER_ROLES.CUSTOMER, isActive: true });
    if (!user) return;

    const now = Date.now();
    const latest = await PasswordResetOtp.findOne({ email, createdAt: { $gte: new Date(now - 60_000) } }).sort({ createdAt: -1 });
    if (latest) return;

    const hourlyCount = await PasswordResetOtp.countDocuments({ email, createdAt: { $gte: new Date(now - 60 * 60_000) } });
    if (hourlyCount >= 3) return;

    await PasswordResetOtp.updateMany({ email, used: false }, { $set: { used: true } });
    const otp = randomInt(100000, 1000000).toString();
    const record = await PasswordResetOtp.create({
      customerId: user.userId,
      email,
      otpHash: await hashToken(otp),
      expiresAt: new Date(now + 10 * 60_000),
    });

    try {
      await sendPasswordResetOTP(email, otp);
      await SecurityLogger.log({
        action: "PASSWORD_RESET_REQUESTED",
        userId: user.userId,
        details: { email },
      });
    } catch (error) {
      await record.deleteOne();
      throw error;
    }
  }

  static async requestPasswordReset(email: string) {
    const user = await User.findOne({ email }).lean();
    if (!user || user.role === USER_ROLES.PLATFORM_ADMIN) {
      return { accountType: "unknown" as const, message: "If an account exists, we'll process the recovery request." };
    }
    if (user.role === USER_ROLES.STORE_OWNER) {
      const store = await Store.findOne({ ownerId: user.userId }).lean();
      return {
        accountType: "seller" as const,
        message: "Seller account requires administrator approval.",
        seller: { email: user.email, storeId: store?.storeId ?? "", storeName: store?.storeName ?? "" },
      };
    }
    try {
      await this.issueResetOtp(email);
    } catch (error) {
      logger.error("Password reset OTP delivery failed", error);
      throw new AppError("Unable to process password reset request. Please try again later.", 503);
    }
    return { accountType: "customer" as const, message: this.genericResetMessage };
  }

  static async verifyPasswordResetOtp(email: string, otp: string) {
    const record = await PasswordResetOtp.findOne({ email, used: false, expiresAt: { $gt: new Date() } })
      .sort({ createdAt: -1 })
      .select("+otpHash +resetTokenHash");
    if (!record || record.attemptCount >= 5) {
      if (record) {
        record.used = true;
        await record.save();
      }
      throw new AppError("Invalid or expired verification code", 400);
    }

    const valid = await compareToken(otp, record.otpHash);
    if (!valid) {
      record.attemptCount += 1;
      if (record.attemptCount >= 5) record.used = true;
      await record.save();
      throw new AppError("Invalid or expired verification code", 400);
    }

    const resetToken = randomBytes(32).toString("hex");
    record.used = true;
    record.resetTokenHash = await hashToken(resetToken);
    record.resetTokenExpiresAt = new Date(Date.now() + 10 * 60_000);
    await record.save();
    return { email, resetToken };
  }

  static async resetPassword(email: string, resetToken: string, newPassword: string) {
    const record = await PasswordResetOtp.findOne({ email, used: true, resetTokenExpiresAt: { $gt: new Date() } })
      .sort({ createdAt: -1 })
      .select("+resetTokenHash");
    if (!record?.resetTokenHash || !(await compareToken(resetToken, record.resetTokenHash))) {
      throw new AppError("Invalid or expired password reset session", 400);
    }

    const user = await User.findOne({ userId: record.customerId, role: USER_ROLES.CUSTOMER, isActive: true })
      .select("+password +sessions.refreshToken");
    if (!user) throw new AppError("Invalid or expired password reset session", 400);
    if (await comparePassword(newPassword, user.password)) {
      throw new AppError("New password must be different from your current password", 400);
    }

    user.password = await hashPassword(newPassword);
    user.tokenVersion = (user.tokenVersion || 0) + 1; // Invalidate all active stateless JWTs
    user.sessions = [];
    user.failedLoginAttempts = 0;
    user.lockUntil = null;
    await user.save();
    await record.deleteOne();

    // Revoke all existing sessions in Session collection
    await Session.updateMany(
      { userId: user.userId, isRevoked: false },
      { $set: { isRevoked: true, revokedAt: new Date(), revokedReason: "PASSWORD_CHANGED" } }
    );

    await SecurityLogger.log({
      action: "PASSWORD_RESET_COMPLETED",
      userId: user.userId,
      details: { email },
    });

    return { message: "Password updated successfully" };
  }

  static async register(data: RegisterInput, meta?: { userAgent?: string; ipAddress?: string }) {
    const existingEmail = await User.findOne({
      email: data.email.toLowerCase(),
    });

    if (existingEmail) {
      throw new AppError("Email already exists", 409);
    }

    const existingMobile = await User.findOne({
      mobile: data.mobile,
    });

    if (existingMobile) {
      throw new AppError("Mobile number already exists", 409);
    }

    const hashedPassword = await hashPassword(data.password);

    const user = await User.create({
      ...data,
      email: data.email.toLowerCase(),
      password: hashedPassword,
      tokenVersion: 0,
      failedLoginAttempts: 0,
    });

    const sessionId = uuidv4();
    const familyId = uuidv4();
    const { device, browser, os } = parseDevice(meta?.userAgent);
    const ip = meta?.ipAddress || "127.0.0.1";
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

    const accessToken = generateAccessToken(user.userId, user.role, sessionId, user.tokenVersion);
    const refreshToken = generateRefreshToken(user.userId, sessionId, familyId, user.tokenVersion);
    const hashedRefresh = await hashToken(refreshToken);

    // Save in standalone Session collection
    await Session.create({
      sessionId,
      userId: user.userId,
      familyId,
      refreshTokenHash: hashedRefresh,
      device,
      browser,
      os,
      ip,
      userAgent: meta?.userAgent || "",
      expiresAt,
    });

    // Synchronize user.sessions array for backward compatibility
    user.sessions.push({
      sessionId,
      refreshToken: hashedRefresh,
      userAgent: meta?.userAgent || "",
      ipAddress: ip,
      createdAt: new Date(),
      lastUsedAt: new Date(),
    });

    await user.save();

    await SecurityLogger.log({
      action: "LOGIN_SUCCESS",
      userId: user.userId,
      sessionId,
      familyId,
      ip,
      userAgent: meta?.userAgent,
      details: { event: "REGISTER_LOGIN" },
    });

    return {
      user: {
        userId: user.userId,
        name: user.name,
        email: user.email,
        mobile: user.mobile,
        role: user.role,
        isCreditApproved: user.isCreditApproved,
        emailVerified: user.emailVerified,
        phoneVerified: user.phoneVerified,
        isActive: user.isActive,
      },
      accessToken,
      refreshToken,
    };
  }

  static async login(data: LoginInput, meta?: { userAgent?: string; ipAddress?: string }) {
    const isEmail = data.identifier.includes("@");
    const ip = meta?.ipAddress || "127.0.0.1";

    const user = await User.findOne(
      isEmail
        ? { email: data.identifier.toLowerCase() }
        : { mobile: data.identifier }
    ).select("+password +sessions.refreshToken");

    if (!user) {
      await SecurityLogger.log({
        action: "LOGIN_FAILED",
        ip,
        userAgent: meta?.userAgent,
        details: { identifier: data.identifier, reason: "USER_NOT_FOUND" },
      });
      throw new AppError("Invalid credentials", 401);
    }

    if (!user.isActive || user.isDeleted) {
      throw new AppError("Account has been disabled", 403);
    }

    if (user.isSuspended) {
      throw new AppError("Account is suspended. Please contact support.", 403);
    }

    // Check account lockout timer
    if (user.lockUntil && user.lockUntil > new Date()) {
      const remainingMinutes = Math.ceil((user.lockUntil.getTime() - Date.now()) / 60000);
      await SecurityLogger.log({
        action: "LOGIN_FAILED",
        userId: user.userId,
        ip,
        userAgent: meta?.userAgent,
        details: { reason: "ACCOUNT_LOCKED", remainingMinutes },
      });
      throw new AppError(
        `Account temporarily locked due to excessive failed attempts. Please try again in ${remainingMinutes} minute(s).`,
        429
      );
    }

    // Progressive delay defense (adds micro-delay on repeated failed attempts)
    if (user.failedLoginAttempts > 0) {
      const delayMs = Math.min(2000, user.failedLoginAttempts * 250);
      await new Promise((resolve) => setTimeout(resolve, delayMs));
    }

    const isPasswordValid = await comparePassword(data.password, user.password);

    if (!isPasswordValid) {
      user.failedLoginAttempts = (user.failedLoginAttempts || 0) + 1;

      // Load security policy from settings
      let maxAttempts = 5;
      let lockoutMinutes = 15;
      try {
        const settings = await SettingsService.getSettings();
        if (settings?.security?.maxLoginAttempts) {
          maxAttempts = settings.security.maxLoginAttempts;
        }
        if (settings?.security?.lockoutDurationMinutes) {
          lockoutMinutes = settings.security.lockoutDurationMinutes;
        }
      } catch {
        // Fall back to defaults
      }

      if (user.failedLoginAttempts >= maxAttempts) {
        user.lockUntil = new Date(Date.now() + lockoutMinutes * 60 * 1000);
        user.failedLoginAttempts = 0; // Reset after locking
        await user.save();

        await SecurityLogger.log({
          action: "ACCOUNT_LOCKED",
          userId: user.userId,
          ip,
          userAgent: meta?.userAgent,
          details: { maxAttempts, lockoutMinutes },
        });

        throw new AppError(
          `Account locked due to ${maxAttempts} consecutive failed attempts. Please try again in ${lockoutMinutes} minutes.`,
          429
        );
      }

      await user.save();

      await SecurityLogger.log({
        action: "LOGIN_FAILED",
        userId: user.userId,
        ip,
        userAgent: meta?.userAgent,
        details: { attempt: user.failedLoginAttempts, reason: "INVALID_PASSWORD" },
      });

      throw new AppError("Invalid credentials", 401);
    }

    // Password valid — reset failed attempts & lockout
    user.failedLoginAttempts = 0;
    user.lockUntil = null;
    user.lastLoginAt = new Date();

    const sessionId = uuidv4();
    const familyId = uuidv4();
    const { device, browser, os } = parseDevice(meta?.userAgent);
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

    const accessToken = generateAccessToken(user.userId, user.role, sessionId, user.tokenVersion || 0);
    const refreshToken = generateRefreshToken(user.userId, sessionId, familyId, user.tokenVersion || 0);
    const hashedRefresh = await hashToken(refreshToken);

    // Create session in standalone Session collection
    await Session.create({
      sessionId,
      userId: user.userId,
      familyId,
      refreshTokenHash: hashedRefresh,
      device,
      browser,
      os,
      ip,
      userAgent: meta?.userAgent || "",
      expiresAt,
    });

    // Update user.sessions
    user.sessions.push({
      sessionId,
      refreshToken: hashedRefresh,
      userAgent: meta?.userAgent || "",
      ipAddress: ip,
      createdAt: new Date(),
      lastUsedAt: new Date(),
    });

    // Cap embedded sessions array to most recent 20
    if (user.sessions.length > 20) {
      user.sessions = user.sessions.slice(-20);
    }

    await user.save();

    await SecurityLogger.log({
      action: "LOGIN_SUCCESS",
      userId: user.userId,
      sessionId,
      familyId,
      ip,
      userAgent: meta?.userAgent,
    });

    return {
      user: {
        userId: user.userId,
        name: user.name,
        email: user.email,
        mobile: user.mobile,
        role: user.role,
        isCreditApproved: user.isCreditApproved,
        emailVerified: user.emailVerified,
        phoneVerified: user.phoneVerified,
        isActive: user.isActive,
      },
      accessToken,
      refreshToken,
    };
  }

  static async refresh(refreshToken: string, meta?: { userAgent?: string; ipAddress?: string }) {
    let payload;

    try {
      payload = verifyRefreshToken(refreshToken);
    } catch {
      throw new AppError("Invalid or expired refresh token", 401);
    }

    const ip = meta?.ipAddress || "127.0.0.1";

    // Lookup session in Session collection
    let session = await Session.findOne({
      sessionId: payload.sessionId,
    }).select("+refreshTokenHash");

    // Fallback lookup in User.sessions if session was created prior to session model
    if (!session) {
      const legacyUser = await User.findOne({ userId: payload.userId }).select("+sessions.refreshToken");
      const legacySession = legacyUser?.sessions.find((s) => s.sessionId === payload.sessionId);
      if (legacyUser && legacySession) {
        const { device, browser, os } = parseDevice(legacySession.userAgent);
        session = await Session.create({
          sessionId: legacySession.sessionId,
          userId: legacyUser.userId,
          familyId: payload.familyId || uuidv4(),
          refreshTokenHash: legacySession.refreshToken,
          device,
          browser,
          os,
          ip: legacySession.ipAddress || ip,
          userAgent: legacySession.userAgent || "",
          expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
          lastUsedAt: legacySession.lastUsedAt || new Date(),
        });
      }
    }

    if (!session) {
      throw new AppError("Session not found or expired", 401);
    }

    // ── OWASP REFRESH TOKEN REUSE DETECTION ─────────────────────────────────
    // If an already revoked session is presented, an attacker or compromised client is reusing an old token!
    if (session.isRevoked) {
      // 1. Immediately revoke entire token family
      if (session.familyId) {
        await Session.updateMany(
          { familyId: session.familyId },
          { $set: { isRevoked: true, revokedAt: new Date(), revokedReason: "TOKEN_REUSE_DETECTED" } }
        );
      }

      // 2. Invalidate all user tokens by incrementing tokenVersion
      await User.updateOne({ userId: payload.userId }, { $inc: { tokenVersion: 1 } });

      // 3. Log high-severity security event
      await SecurityLogger.log({
        action: "REFRESH_REUSE_DETECTED",
        userId: payload.userId,
        sessionId: payload.sessionId,
        familyId: session.familyId,
        ip,
        userAgent: meta?.userAgent,
        details: { warning: "Replay attack detected: Revoked refresh token used", originalRevokedReason: session.revokedReason },
      });

      throw new AppError("Security violation: Token reuse detected. All active sessions have been terminated. Please log in again.", 401);
    }

    // Check logical expiration
    if (session.expiresAt && session.expiresAt < new Date()) {
      session.isRevoked = true;
      session.revokedAt = new Date();
      session.revokedReason = "EXPIRED";
      await session.save();
      throw new AppError("Refresh token has expired. Please log in again.", 401);
    }

    // Verify token hash matches stored hash
    const isValid = await compareToken(refreshToken, session.refreshTokenHash);

    if (!isValid) {
      // Token mismatch against active session is another indicator of token tampering / reuse!
      if (session.familyId) {
        await Session.updateMany(
          { familyId: session.familyId },
          { $set: { isRevoked: true, revokedAt: new Date(), revokedReason: "TOKEN_MISMATCH_SUSPECTED_REUSE" } }
        );
      }
      await User.updateOne({ userId: payload.userId }, { $inc: { tokenVersion: 1 } });

      await SecurityLogger.log({
        action: "REFRESH_REUSE_DETECTED",
        userId: payload.userId,
        sessionId: payload.sessionId,
        familyId: session.familyId,
        ip,
        userAgent: meta?.userAgent,
        details: { warning: "Token hash mismatch against active session" },
      });

      throw new AppError("Security violation: Token mismatch. Please log in again.", 401);
    }

    // Verify user status
    const user = await User.findOne({
      userId: payload.userId,
      isDeleted: { $ne: true },
    }).select("+sessions.refreshToken");

    if (!user || !user.isActive) {
      throw new AppError("User account inactive or not found", 401);
    }

    if (user.isSuspended) {
      throw new AppError("Account is suspended", 403);
    }

    if (
      payload.tokenVersion !== undefined &&
      user.tokenVersion !== undefined &&
      payload.tokenVersion < user.tokenVersion
    ) {
      throw new AppError("Token version invalidated. Please log in again.", 401);
    }

    // ── ROTATE TOKENS ───────────────────────────────────────────────────────
    const currentTokenVersion = user.tokenVersion || 0;
    const newAccessToken = generateAccessToken(user.userId, user.role, session.sessionId, currentTokenVersion);
    const newRefreshToken = generateRefreshToken(user.userId, session.sessionId, session.familyId, currentTokenVersion);
    const newHashedRefresh = await hashToken(newRefreshToken);

    // Update Session
    session.refreshTokenHash = newHashedRefresh;
    session.lastUsedAt = new Date();
    if (meta?.ipAddress) session.ip = meta.ipAddress;
    if (meta?.userAgent) session.userAgent = meta.userAgent;
    await session.save();

    // Synchronize user.sessions array
    const userSession = user.sessions.find((s) => s.sessionId === session.sessionId);
    if (userSession) {
      userSession.refreshToken = newHashedRefresh;
      userSession.lastUsedAt = new Date();
      user.markModified("sessions");
      await user.save();
    }

    await SecurityLogger.log({
      action: "REFRESH_SUCCESS",
      userId: user.userId,
      sessionId: session.sessionId,
      familyId: session.familyId,
      ip,
      userAgent: meta?.userAgent,
    });

    return {
      accessToken: newAccessToken,
      refreshToken: newRefreshToken,
    };
  }

  static async logout(userId: string, sessionId?: string, meta?: { userAgent?: string; ipAddress?: string }) {
    if (sessionId) {
      await Session.updateOne(
        { sessionId, userId },
        { $set: { isRevoked: true, revokedAt: new Date(), revokedReason: "USER_LOGOUT" } }
      );
      await User.updateOne({ userId }, { $pull: { sessions: { sessionId } } });
    }

    await SecurityLogger.log({
      action: "LOGOUT",
      userId,
      sessionId,
      ip: meta?.ipAddress,
      userAgent: meta?.userAgent,
    });

    return { message: "Logged out successfully" };
  }

  static async logoutAll(userId: string, meta?: { userAgent?: string; ipAddress?: string }) {
    await Session.updateMany(
      { userId, isRevoked: false },
      { $set: { isRevoked: true, revokedAt: new Date(), revokedReason: "LOGOUT_ALL" } }
    );

    // Increment tokenVersion so all existing access tokens are rejected
    await User.updateOne(
      { userId },
      {
        $inc: { tokenVersion: 1 },
        $set: { sessions: [] },
      }
    );

    await SecurityLogger.log({
      action: "LOGOUT_ALL",
      userId,
      ip: meta?.ipAddress,
      userAgent: meta?.userAgent,
    });

    return { message: "Successfully logged out of all devices" };
  }

  static async getUserSessions(userId: string, currentSessionId?: string) {
    const sessions = await Session.find({
      userId,
      isRevoked: false,
      expiresAt: { $gt: new Date() },
    })
      .sort({ lastUsedAt: -1 })
      .lean();

    return sessions.map((s) => ({
      sessionId: s.sessionId,
      isCurrent: s.sessionId === currentSessionId,
      device: s.device || "Desktop",
      browser: s.browser || "Unknown Browser",
      os: s.os || "Unknown OS",
      ipAddress: s.ip || "127.0.0.1",
      userAgent: s.userAgent,
      createdAt: s.createdAt,
      lastUsedAt: s.lastUsedAt,
    }));
  }

  static async revokeSession(userId: string, targetSessionId: string, currentSessionId?: string) {
    if (targetSessionId === currentSessionId) {
      throw new AppError("Cannot revoke your current session. Use logout instead.", 400);
    }

    const session = await Session.findOneAndUpdate(
      { sessionId: targetSessionId, userId, isRevoked: false },
      { $set: { isRevoked: true, revokedAt: new Date(), revokedReason: "REVOKED_BY_USER" } },
      { new: true }
    );

    if (!session) {
      throw new AppError("Session not found or already revoked", 404);
    }

    await User.updateOne({ userId }, { $pull: { sessions: { sessionId: targetSessionId } } });

    await SecurityLogger.log({
      action: "SESSION_REVOKED",
      userId,
      sessionId: targetSessionId,
    });

    return { message: "Session revoked successfully" };
  }
}
