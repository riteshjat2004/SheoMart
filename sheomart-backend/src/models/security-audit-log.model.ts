import { Document, Schema, model } from "mongoose";

export type SecurityAuditAction =
  | "seller_password_reset_requested"
  | "seller_password_reset_approved"
  | "seller_password_reset_rejected"
  | "LOGIN_SUCCESS"
  | "LOGIN_FAILED"
  | "LOGOUT"
  | "LOGOUT_ALL"
  | "PASSWORD_CHANGE"
  | "PASSWORD_RESET_REQUESTED"
  | "PASSWORD_RESET_COMPLETED"
  | "REFRESH_SUCCESS"
  | "REFRESH_REUSE_DETECTED"
  | "SESSION_REVOKED"
  | "ACCOUNT_LOCKED"
  | "SUSPICIOUS_ACTIVITY";

export interface ISecurityAuditLog extends Document {
  action: SecurityAuditAction;
  userId?: string;
  sellerId?: string;
  adminId?: string;
  requestId?: string;
  sessionId?: string;
  familyId?: string;
  ip: string;
  userAgent?: string;
  details?: Record<string, unknown>;
  createdAt: Date;
}

const securityAuditLogSchema = new Schema<ISecurityAuditLog>(
  {
    action: {
      type: String,
      required: true,
      index: true,
      immutable: true,
    },
    userId: { type: String, index: true },
    sellerId: { type: String, index: true },
    adminId: { type: String },
    requestId: { type: String, index: true },
    sessionId: { type: String },
    familyId: { type: String },
    ip: { type: String, required: true, immutable: true },
    userAgent: { type: String, default: "" },
    details: { type: Schema.Types.Mixed, default: {} },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

securityAuditLogSchema.index({ createdAt: -1 });
securityAuditLogSchema.index({ userId: 1, createdAt: -1 });

export const SecurityAuditLog = model<ISecurityAuditLog>(
  "SecurityAuditLog",
  securityAuditLogSchema
);
