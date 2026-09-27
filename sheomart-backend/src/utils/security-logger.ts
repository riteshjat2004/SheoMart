import { Request } from "express";
import { SecurityAuditLog, SecurityAuditAction } from "../models/security-audit-log.model";
import { logger } from "./logger";

export interface LogSecurityEventParams {
  action: SecurityAuditAction;
  userId?: string;
  sellerId?: string;
  adminId?: string;
  sessionId?: string;
  familyId?: string;
  ip?: string;
  userAgent?: string;
  details?: Record<string, unknown>;
  req?: Request;
}

export class SecurityLogger {
  static async log(params: LogSecurityEventParams): Promise<void> {
    try {
      const ip =
        params.ip ||
        params.req?.ip ||
        params.req?.socket?.remoteAddress ||
        (params.req?.headers["x-forwarded-for"]
          ? String(params.req.headers["x-forwarded-for"]).split(",")[0].trim()
          : "127.0.0.1");

      const userAgent =
        params.userAgent || (params.req?.headers["user-agent"] as string) || "unknown";

      await SecurityAuditLog.create({
        action: params.action,
        userId: params.userId,
        sellerId: params.sellerId,
        adminId: params.adminId,
        sessionId: params.sessionId,
        familyId: params.familyId,
        ip,
        userAgent,
        details: params.details || {},
      });
    } catch (err) {
      logger.error("[SecurityLogger] Failed to write security audit log:", err);
    }
  }
}
