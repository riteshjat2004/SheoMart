import { z } from "zod";

const discountTypeSchema = z.enum(["flat", "percentage"]);
const couponScopeSchema = z.enum(["marketplace", "store", "category", "product"]);
const offerTypeSchema = z.enum([
  "flat",
  "percentage",
  "bogo",
  "buy_x_get_y",
  "free_delivery",
  "combo",
  "flash_sale",
]);
const offerScopeSchema = z.enum(["marketplace", "store", "category", "product"]);
const dateSchema = z.coerce.date();
const optionalNumber = z.number().finite().nonnegative().nullable().optional();

export const couponFields = z.object({
  title: z.string().trim().min(2).max(120),
  description: z.string().trim().max(1000).optional().default(""),
  code: z.string().trim().min(2).max(40).transform((value) => value.toUpperCase()),
  discountType: discountTypeSchema,
  discountValue: z.number().finite().nonnegative(),
  minimumCartValue: z.number().finite().nonnegative().optional().default(0),
  maximumDiscount: optionalNumber,
  usageLimit: z.number().int().positive().nullable().optional(),
  oncePerCustomer: z.boolean().optional().default(true),
  perUserLimit: z.number().int().positive().optional().default(1),
  newUsersOnly: z.boolean().optional().default(false),
  applicableScope: couponScopeSchema.optional().default("marketplace"),
  storeId: z.string().trim().nullable().optional().default(null),
  categoryId: z.string().trim().nullable().optional().default(null),
  productId: z.string().trim().nullable().optional().default(null),
  isFeatured: z.boolean().optional().default(false),
  showOnBanner: z.boolean().optional().default(false),
  autoApply: z.boolean().optional().default(false),
  startsAt: dateSchema,
  endsAt: dateSchema,
  isActive: z.boolean().optional().default(true),
});

const couponRules = (value: Partial<z.infer<typeof couponFields>>, context: z.RefinementCtx) => {
  if (value.startsAt && value.endsAt && value.startsAt >= value.endsAt) {
    context.addIssue({ code: "custom", message: "Start date must be before end date", path: ["endsAt"] });
  }
  if (value.discountType === "percentage" && typeof value.discountValue === "number" && value.discountValue > 100) {
    context.addIssue({ code: "custom", message: "Percentage discount cannot exceed 100", path: ["discountValue"] });
  }
  if (value.discountType === "flat" && value.maximumDiscount !== undefined && value.maximumDiscount !== null) {
    context.addIssue({ code: "custom", message: "Maximum discount is only valid for percentage coupons", path: ["maximumDiscount"] });
  }
};

export const createCouponSchema = couponFields.superRefine(couponRules);

export const updateCouponSchema = couponFields.partial().superRefine(couponRules);

export const offerFields = z.object({
  title: z.string().trim().min(2).max(120),
  subtitle: z.string().trim().max(200).optional().default(""),
  description: z.string().trim().max(2000).optional().default(""),
  festivalName: z.string().trim().min(2).max(120),
  offerType: offerTypeSchema.optional().default("percentage"),
  discountType: discountTypeSchema.optional().default("percentage"),
  discountValue: z.number().finite().nonnegative().optional().default(0),
  buyQuantity: z.number().int().positive().optional().default(1),
  getQuantity: z.number().int().positive().optional().default(1),
  targetScope: offerScopeSchema.optional().default("marketplace"),
  categoryIds: z.preprocess(
    (v) => (typeof v === "string" ? (v.trim() ? JSON.parse(v) : []) : v),
    z.array(z.string().trim().min(1)).optional().default([])
  ),
  storeIds: z.preprocess(
    (v) => (typeof v === "string" ? (v.trim() ? JSON.parse(v) : []) : v),
    z.array(z.string().trim().min(1)).optional().default([])
  ),
  productIds: z.preprocess(
    (v) => (typeof v === "string" ? (v.trim() ? JSON.parse(v) : []) : v),
    z.array(z.string().trim().min(1)).optional().default([])
  ),
  bannerImage: z.string().trim().max(2000).optional().default(""),
  bannerPublicId: z.string().trim().optional().default(""),
  colorTheme: z.string().trim().optional().default("emerald"),
  showOnHero: z.preprocess((v) => (typeof v === "string" ? v === "true" : v), z.boolean().optional().default(false)),
  showOnFeatured: z.preprocess((v) => (typeof v === "string" ? v === "true" : v), z.boolean().optional().default(true)),
  showOnExplore: z.preprocess((v) => (typeof v === "string" ? v === "true" : v), z.boolean().optional().default(false)),
  isFlashSale: z.preprocess((v) => (typeof v === "string" ? v === "true" : v), z.boolean().optional().default(false)),
  startsAt: dateSchema,
  endsAt: dateSchema,
  priority: z.preprocess((v) => (typeof v === "string" ? Number(v) : v), z.number().int().nonnegative().optional().default(0)),
  isActive: z.preprocess((v) => (typeof v === "string" ? v === "true" : v), z.boolean().optional().default(true)),
});

const offerRules = (value: Partial<z.infer<typeof offerFields>>, context: z.RefinementCtx) => {
  if (value.startsAt && value.endsAt && value.startsAt >= value.endsAt) {
    context.addIssue({ code: "custom", message: "Start date must be before end date", path: ["endsAt"] });
  }
  if (value.discountType === "percentage" && typeof value.discountValue === "number" && value.discountValue > 100) {
    context.addIssue({ code: "custom", message: "Percentage discount cannot exceed 100", path: ["discountValue"] });
  }
};

export const createOfferSchema = offerFields.superRefine(offerRules);

export const updateOfferSchema = offerFields.partial().superRefine(offerRules);

export const bulkPromotionActionSchema = z.object({
  ids: z.array(z.string().trim().min(1)).min(1, "Select at least one item"),
  action: z.enum(["activate", "deactivate", "delete", "restore"]),
});

export type BulkPromotionActionInput = z.infer<typeof bulkPromotionActionSchema>;

export type CreateCouponInput = z.infer<typeof createCouponSchema>;
export type UpdateCouponInput = z.infer<typeof updateCouponSchema>;
export type CreateOfferInput = z.infer<typeof createOfferSchema>;
export type UpdateOfferInput = z.infer<typeof updateOfferSchema>;

export const validateCouponSchema = z.object({
  code: z.string().trim().min(2).max(40).transform((value) => value.toUpperCase()),
  cartValue: z.number().finite().nonnegative(),
  storeId: z.string().trim().optional(),
  categoryIds: z.array(z.string().trim()).optional(),
  productIds: z.array(z.string().trim()).optional(),
});

export type ValidateCouponInput = z.infer<typeof validateCouponSchema>;
