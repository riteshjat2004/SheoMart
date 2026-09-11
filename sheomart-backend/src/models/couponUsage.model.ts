import { Document, Schema, model } from "mongoose";
import { v4 as uuidv4 } from "uuid";

export interface ICouponUsage extends Document {
  usageId: string;
  couponId: string;
  customerId: string;
  orderId: string | null;
  redeemedAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

const couponUsageSchema = new Schema<ICouponUsage>(
  {
    usageId: { type: String, default: () => uuidv4(), unique: true, immutable: true },
    couponId: { type: String, required: true, index: true },
    customerId: { type: String, required: true, index: true },
    orderId: { type: String, default: null, index: true },
    redeemedAt: { type: Date, default: Date.now },
  },
  { timestamps: true },
);

couponUsageSchema.index({ couponId: 1, customerId: 1 });

export const CouponUsage = model<ICouponUsage>("CouponUsage", couponUsageSchema);
