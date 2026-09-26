import { Document, Schema, model } from "mongoose";
import { v4 as uuidv4 } from "uuid";
import { COUPON_DISCOUNT_TYPES, CouponDiscountType } from "./coupon.model";

export const OFFER_TYPES = {
  FLAT: "flat",
  PERCENTAGE: "percentage",
  BOGO: "bogo",
  BUY_X_GET_Y: "buy_x_get_y",
  FREE_DELIVERY: "free_delivery",
  COMBO: "combo",
  FLASH_SALE: "flash_sale",
} as const;

export type OfferType = typeof OFFER_TYPES[keyof typeof OFFER_TYPES];

export const OFFER_TARGET_SCOPES = {
  MARKETPLACE: "marketplace",
  STORE: "store",
  CATEGORY: "category",
  PRODUCT: "product",
} as const;

export type OfferTargetScope = typeof OFFER_TARGET_SCOPES[keyof typeof OFFER_TARGET_SCOPES];

export type OfferLifecycleStatus = "draft" | "active" | "scheduled" | "expired" | "disabled" | "deleted";

export interface IOffer extends Document {
  offerId: string;
  title: string;
  subtitle: string;
  description: string;
  festivalName: string;
  offerType: OfferType;
  discountType: CouponDiscountType;
  discountValue: number;
  buyQuantity?: number;
  getQuantity?: number;
  targetScope: OfferTargetScope;
  categoryIds: string[];
  storeIds: string[];
  productIds: string[];
  bannerImage: string;
  bannerPublicId?: string;
  colorTheme?: string;
  showOnHero: boolean;
  showOnFeatured: boolean;
  showOnExplore: boolean;
  isFlashSale: boolean;
  startsAt: Date;
  endsAt: Date;
  priority: number;
  isActive: boolean;
  isDeleted: boolean;
  createdBy: string | null;
  updatedBy: string | null;
  status: OfferLifecycleStatus;
  createdAt: Date;
  updatedAt: Date;
}

const offerSchema = new Schema<IOffer>(
  {
    offerId: { type: String, default: () => uuidv4(), unique: true, immutable: true },
    title: { type: String, required: true, trim: true, maxlength: 120 },
    subtitle: { type: String, default: "", trim: true, maxlength: 200 },
    description: { type: String, default: "", trim: true, maxlength: 2000 },
    festivalName: { type: String, required: true, trim: true, maxlength: 120 },
    offerType: {
      type: String,
      enum: Object.values(OFFER_TYPES),
      default: OFFER_TYPES.PERCENTAGE,
    },
    discountType: { type: String, enum: Object.values(COUPON_DISCOUNT_TYPES), default: COUPON_DISCOUNT_TYPES.PERCENTAGE },
    discountValue: { type: Number, default: 0, min: 0 },
    buyQuantity: { type: Number, default: 1, min: 1 },
    getQuantity: { type: Number, default: 1, min: 1 },
    targetScope: {
      type: String,
      enum: Object.values(OFFER_TARGET_SCOPES),
      default: OFFER_TARGET_SCOPES.MARKETPLACE,
    },
    categoryIds: { type: [String], default: [] },
    storeIds: { type: [String], default: [] },
    productIds: { type: [String], default: [] },
    bannerImage: { type: String, required: true, trim: true },
    bannerPublicId: { type: String, default: "", trim: true },
    colorTheme: { type: String, default: "emerald", trim: true },
    showOnHero: { type: Boolean, default: false, index: true },
    showOnFeatured: { type: Boolean, default: true, index: true },
    showOnExplore: { type: Boolean, default: false },
    isFlashSale: { type: Boolean, default: false, index: true },
    startsAt: { type: Date, required: true },
    endsAt: { type: Date, required: true },
    priority: { type: Number, default: 0, min: 0, index: true },
    isActive: { type: Boolean, default: true, index: true },
    isDeleted: { type: Boolean, default: false, index: true },
    createdBy: { type: String, default: null },
    updatedBy: { type: String, default: null },
  },
  { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } },
);

offerSchema.virtual("status").get(function (this: IOffer): OfferLifecycleStatus {
  if (this.isDeleted) return "deleted";
  if (!this.isActive) return "disabled";
  const now = new Date();
  if (now < this.startsAt) return "scheduled";
  if (now > this.endsAt) return "expired";
  return "active";
});

offerSchema.index({ isDeleted: 1, isActive: 1, startsAt: 1, endsAt: 1, priority: -1 });
offerSchema.index({ categoryIds: 1 });
offerSchema.index({ storeIds: 1 });
offerSchema.index({ productIds: 1 });

export const Offer = model<IOffer>("Offer", offerSchema);
