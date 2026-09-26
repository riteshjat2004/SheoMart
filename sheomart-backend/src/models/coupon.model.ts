import { Document, Schema, model } from "mongoose";
import { v4 as uuidv4 } from "uuid";

export const COUPON_DISCOUNT_TYPES = {
  FLAT: "flat",
  PERCENTAGE: "percentage",
} as const;

export type CouponDiscountType = typeof COUPON_DISCOUNT_TYPES[keyof typeof COUPON_DISCOUNT_TYPES];

export const COUPON_APPLICABLE_SCOPES = {
  MARKETPLACE: "marketplace",
  STORE: "store",
  CATEGORY: "category",
  PRODUCT: "product",
} as const;

export type CouponApplicableScope = typeof COUPON_APPLICABLE_SCOPES[keyof typeof COUPON_APPLICABLE_SCOPES];

export type CouponLifecycleStatus = "draft" | "active" | "scheduled" | "expired" | "disabled" | "deleted";

export interface ICoupon extends Document {
  couponId: string;
  title: string;
  description: string;
  code: string;
  discountType: CouponDiscountType;
  discountValue: number;
  minimumCartValue: number;
  maximumDiscount: number | null;
  usageLimit: number | null;
  usageCount: number;
  oncePerCustomer: boolean;
  perUserLimit: number;
  newUsersOnly: boolean;
  applicableScope: CouponApplicableScope;
  storeId: string | null;
  categoryId: string | null;
  productId: string | null;
  isFeatured: boolean;
  showOnBanner: boolean;
  autoApply: boolean;
  startsAt: Date;
  endsAt: Date;
  isActive: boolean;
  isDeleted: boolean;
  createdBy: string | null;
  updatedBy: string | null;
  status: CouponLifecycleStatus;
  createdAt: Date;
  updatedAt: Date;
}

const couponSchema = new Schema<ICoupon>(
  {
    couponId: { type: String, default: () => uuidv4(), unique: true, immutable: true },
    title: { type: String, required: true, trim: true, maxlength: 120 },
    description: { type: String, default: "", trim: true, maxlength: 1000 },
    code: { type: String, required: true, unique: true, uppercase: true, trim: true, minlength: 2, maxlength: 40 },
    discountType: { type: String, enum: Object.values(COUPON_DISCOUNT_TYPES), required: true },
    discountValue: { type: Number, required: true, min: 0 },
    minimumCartValue: { type: Number, default: 0, min: 0 },
    maximumDiscount: { type: Number, default: null, min: 0 },
    usageLimit: { type: Number, default: null, min: 1 },
    usageCount: { type: Number, default: 0, min: 0 },
    oncePerCustomer: { type: Boolean, default: true },
    perUserLimit: { type: Number, default: 1, min: 1 },
    newUsersOnly: { type: Boolean, default: false },
    applicableScope: {
      type: String,
      enum: Object.values(COUPON_APPLICABLE_SCOPES),
      default: COUPON_APPLICABLE_SCOPES.MARKETPLACE,
    },
    storeId: { type: String, default: null, index: true },
    categoryId: { type: String, default: null, index: true },
    productId: { type: String, default: null, index: true },
    isFeatured: { type: Boolean, default: false, index: true },
    showOnBanner: { type: Boolean, default: false },
    autoApply: { type: Boolean, default: false },
    startsAt: { type: Date, required: true },
    endsAt: { type: Date, required: true },
    isActive: { type: Boolean, default: true, index: true },
    isDeleted: { type: Boolean, default: false, index: true },
    createdBy: { type: String, default: null },
    updatedBy: { type: String, default: null },
  },
  { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } },
);

couponSchema.virtual("status").get(function (this: ICoupon): CouponLifecycleStatus {
  if (this.isDeleted) return "deleted";
  if (!this.isActive) return "disabled";
  const now = new Date();
  if (now < this.startsAt) return "scheduled";
  if (now > this.endsAt) return "expired";
  if (this.usageLimit !== null && this.usageCount >= this.usageLimit) return "expired";
  return "active";
});

couponSchema.index({ isDeleted: 1, isActive: 1, startsAt: 1, endsAt: 1 });
couponSchema.index({ code: 1, isDeleted: 1 });

export const Coupon = model<ICoupon>("Coupon", couponSchema);
