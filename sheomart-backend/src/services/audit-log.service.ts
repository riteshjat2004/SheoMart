import { Request } from "express";
import { AuditLog, AuditLogModule } from "../models/audit-log.model";

export class AuditLogService {
  static async logAction(params: {
    adminId: string;
    adminName: string;
    action: string;
    module: AuditLogModule;
    details?: Record<string, any>;
    req?: Request;
  }) {
    try {
      const ip =
        params.req?.ip ||
        params.req?.headers["x-forwarded-for"]?.toString() ||
        "127.0.0.1";
      const userAgent = params.req?.headers["user-agent"] || "unknown";

      await AuditLog.create({
        adminId: params.adminId,
        adminName: params.adminName,
        action: params.action,
        module: params.module,
        details: params.details || {},
        ip,
        userAgent,
      });
    } catch (error) {
      console.error("[AuditLogService] Error writing audit log:", error);
    }
  }

  static async getAuditLogs(filters: {
    page?: number;
    limit?: number;
    module?: string;
    action?: string;
    search?: string;
    from?: string;
    to?: string;
  }) {
    const page = Math.max(1, Number(filters.page) || 1);
    const limit = Math.min(100, Math.max(1, Number(filters.limit) || 20));
    const skip = (page - 1) * limit;

    const query: any = {};

    if (filters.module && filters.module !== "all") {
      query.module = filters.module;
    }

    if (filters.action) {
      query.action = { $regex: filters.action, $options: "i" };
    }

    if (filters.search) {
      query.$or = [
        { adminName: { $regex: filters.search, $options: "i" } },
        { action: { $regex: filters.search, $options: "i" } },
        { ip: { $regex: filters.search, $options: "i" } },
      ];
    }

    if (filters.from || filters.to) {
      query.createdAt = {};
      if (filters.from) query.createdAt.$gte = new Date(filters.from);
      if (filters.to) {
        const toDate = new Date(filters.to);
        toDate.setUTCHours(23, 59, 59, 999);
        query.createdAt.$lte = toDate;
      }
    }

    const [logs, total] = await Promise.all([
      AuditLog.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
      AuditLog.countDocuments(query),
    ]);

    return {
      logs: logs.map((log) => ({
        id: log._id.toString(),
        adminId: log.adminId,
        adminName: log.adminName,
        action: log.action,
        module: log.module,
        details: log.details,
        ip: log.ip,
        userAgent: log.userAgent,
        createdAt: log.createdAt,
      })),
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }
}
