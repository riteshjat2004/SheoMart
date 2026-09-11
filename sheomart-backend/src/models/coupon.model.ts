import { Document, Schema, model } from "mongoose";
import { v4 as uuidv4 } from "uuid";

export const COUPON_DISCOUNT_TYPES = {
  FLAT: "flat",
  PERCENTAGE: "percentage",
} as const;

export type CouponDiscountType = typeof COUPON_DISCOUNT_TYPES[keyof typeof COUPON_DISCOUNT_TYPES];

export interface ICoupon extends Document {
  couponId: string;
  title: string;
  code: string;
  discountType: CouponDiscountType;
  discountValue: number;
  minimumCartValue: number;
  maximumDiscount: number | null;
  usageLimit: number | null;
  usageCount: number;
  oncePerCustomer: boolean;
  startsAt: Date;
  endsAt: Date;
  isActive: boolean;
  createdBy: string | null;
  updatedBy: string | null;
  status: "active" | "scheduled" | "expired" | "inactive";
  createdAt: Date;
  updatedAt: Date;
}

const couponSchema = new Schema<ICoupon>(
  {
    couponId: { type: String, default: () => uuidv4(), unique: true, immutable: true },
    title: { type: String, required: true, trim: true, maxlength: 120 },
    code: { type: String, required: true, unique: true, uppercase: true, trim: true, minlength: 2, maxlength: 40 },
    discountType: { type: String, enum: Object.values(COUPON_DISCOUNT_TYPES), required: true },
    discountValue: { type: Number, required: true, min: 0 },
    minimumCartValue: { type: Number, default: 0, min: 0 },
    maximumDiscount: { type: Number, default: null, min: 0 },
    usageLimit: { type: Number, default: null, min: 1 },
    usageCount: { type: Number, default: 0, min: 0 },
    oncePerCustomer: { type: Boolean, default: true },
    startsAt: { type: Date, required: true },
    endsAt: { type: Date, required: true },
    isActive: { type: Boolean, default: true },
    createdBy: { type: String, default: null },
    updatedBy: { type: String, default: null },
  },
  { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } },
);

couponSchema.virtual("status").get(function (this: ICoupon) {
  if (!this.isActive) return "inactive";
  const now = new Date();
  if (now < this.startsAt) return "scheduled";
  if (now > this.endsAt) return "expired";
  return "active";
});

couponSchema.index({ isActive: 1, startsAt: 1, endsAt: 1 });

export const Coupon = model<ICoupon>("Coupon", couponSchema);
