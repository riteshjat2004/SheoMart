import { Schema, model, Document } from "mongoose";

export type AuditLogModule =
  | "settings"
  | "security"
  | "users"
  | "stores"
  | "products"
  | "promotions"
  | "orders"
  | "system";

export interface IAuditLog extends Document {
  adminId: string;
  adminName: string;
  action: string;
  module: AuditLogModule;
  details: Record<string, any>;
  ip: string;
  userAgent: string;
  createdAt: Date;
}

const auditLogSchema = new Schema<IAuditLog>(
  {
    adminId: { type: String, required: true, index: true },
    adminName: { type: String, required: true },
    action: { type: String, required: true, index: true },
    module: {
      type: String,
      required: true,
      enum: [
        "settings",
        "security",
        "users",
        "stores",
        "products",
        "promotions",
        "orders",
        "system",
      ],
      index: true,
    },
    details: { type: Schema.Types.Mixed, default: {} },
    ip: { type: String, default: "127.0.0.1" },
    userAgent: { type: String, default: "" },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

auditLogSchema.index({ createdAt: -1 });
auditLogSchema.index({ module: 1, createdAt: -1 });
auditLogSchema.index({ adminId: 1, createdAt: -1 });

export const AuditLog = model<IAuditLog>("AuditLog", auditLogSchema);
