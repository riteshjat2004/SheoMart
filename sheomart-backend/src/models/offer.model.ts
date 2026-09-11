import { Document, Schema, model } from "mongoose";
import { v4 as uuidv4 } from "uuid";
import { COUPON_DISCOUNT_TYPES, CouponDiscountType } from "./coupon.model";

export interface IOffer extends Document {
  offerId: string;
  title: string;
  festivalName: string;
  bannerImage: string;
  categoryIds: string[];
  discountType: CouponDiscountType;
  discountValue: number;
  startsAt: Date;
  endsAt: Date;
  priority: number;
  isActive: boolean;
  createdBy: string | null;
  updatedBy: string | null;
  status: "active" | "scheduled" | "expired" | "inactive";
  createdAt: Date;
  updatedAt: Date;
}

const offerSchema = new Schema<IOffer>(
  {
    offerId: { type: String, default: () => uuidv4(), unique: true, immutable: true },
    title: { type: String, required: true, trim: true, maxlength: 120 },
    festivalName: { type: String, required: true, trim: true, maxlength: 120 },
    bannerImage: { type: String, required: true, trim: true },
    categoryIds: { type: [String], default: [] },
    discountType: { type: String, enum: Object.values(COUPON_DISCOUNT_TYPES), required: true },
    discountValue: { type: Number, required: true, min: 0 },
    startsAt: { type: Date, required: true },
    endsAt: { type: Date, required: true },
    priority: { type: Number, default: 0, min: 0 },
    isActive: { type: Boolean, default: true },
    createdBy: { type: String, default: null },
    updatedBy: { type: String, default: null },
  },
  { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } },
);

offerSchema.virtual("status").get(function (this: IOffer) {
  if (!this.isActive) return "inactive";
  const now = new Date();
  if (now < this.startsAt) return "scheduled";
  if (now > this.endsAt) return "expired";
  return "active";
});

offerSchema.index({ isActive: 1, startsAt: 1, endsAt: 1, priority: -1 });
offerSchema.index({ categoryIds: 1 });

export const Offer = model<IOffer>("Offer", offerSchema);
