import { Document, Schema, model } from "mongoose";

export type SellerPasswordResetRequestStatus = "pending" | "approved" | "rejected";

export interface ISellerPasswordResetRequest extends Document {
  sellerId: string;
  storeId: string;
  email: string;
  pendingPasswordHash?: string;
  reason: string;
  status: SellerPasswordResetRequestStatus;
  adminRemarks: string;
  createdAt: Date;
  reviewedAt?: Date;
  reviewedBy?: string;
}

const sellerPasswordResetRequestSchema = new Schema<ISellerPasswordResetRequest>(
  {
    sellerId: { type: String, required: true },
    storeId: { type: String, required: true, index: true },
    email: { type: String, required: true, lowercase: true, trim: true, index: true },
    pendingPasswordHash: { type: String, select: false },
    reason: { type: String, default: "", trim: true, maxlength: 1000 },
    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
    },
    adminRemarks: { type: String, default: "", trim: true, maxlength: 1000 },
    reviewedAt: { type: Date },
    reviewedBy: { type: String },
  },
  { timestamps: true }
);

sellerPasswordResetRequestSchema.index({ status: 1, createdAt: -1 });
sellerPasswordResetRequestSchema.index(
  { sellerId: 1, status: 1 },
  { unique: true, partialFilterExpression: { status: "pending" } }
);

export const SellerPasswordResetRequest = model<ISellerPasswordResetRequest>(
  "SellerPasswordResetRequest",
  sellerPasswordResetRequestSchema
);
