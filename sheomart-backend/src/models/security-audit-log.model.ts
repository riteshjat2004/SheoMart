import { Document, Schema, model } from "mongoose";

export type SecurityAuditAction =
  | "seller_password_reset_requested"
  | "seller_password_reset_approved"
  | "seller_password_reset_rejected";

export interface ISecurityAuditLog extends Document {
  action: SecurityAuditAction;
  sellerId: string;
  adminId?: string;
  requestId: string;
  ip: string;
  createdAt: Date;
}

const securityAuditLogSchema = new Schema<ISecurityAuditLog>(
  {
    action: {
      type: String,
      required: true,
      enum: [
        "seller_password_reset_requested",
        "seller_password_reset_approved",
        "seller_password_reset_rejected",
      ],
      immutable: true,
    },
    sellerId: { type: String, required: true, immutable: true, index: true },
    adminId: { type: String, immutable: true },
    requestId: { type: String, required: true, immutable: true, index: true },
    ip: { type: String, required: true, immutable: true },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

securityAuditLogSchema.index({ createdAt: -1 });

export const SecurityAuditLog = model<ISecurityAuditLog>(
  "SecurityAuditLog",
  securityAuditLogSchema
);
