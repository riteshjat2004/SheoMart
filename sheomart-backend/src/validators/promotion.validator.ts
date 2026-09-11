import { z } from "zod";

const discountTypeSchema = z.enum(["flat", "percentage"]);
const dateSchema = z.coerce.date();
const optionalNumber = z.number().finite().nonnegative().nullable().optional();

const couponFields = z.object({
  title: z.string().trim().min(2).max(120),
  code: z.string().trim().min(2).max(40).transform((value) => value.toUpperCase()),
  discountType: discountTypeSchema,
  discountValue: z.number().finite().positive(),
  minimumCartValue: z.number().finite().nonnegative().optional().default(0),
  maximumDiscount: optionalNumber,
  usageLimit: z.number().int().positive().nullable().optional(),
  oncePerCustomer: z.boolean().optional().default(true),
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

const offerFields = z.object({
  title: z.string().trim().min(2).max(120),
  festivalName: z.string().trim().min(2).max(120),
  bannerImage: z.string().trim().min(1).max(2000),
  categoryIds: z.array(z.string().trim().min(1)).max(100).optional().default([]),
  discountType: discountTypeSchema,
  discountValue: z.number().finite().positive(),
  startsAt: dateSchema,
  endsAt: dateSchema,
  priority: z.number().int().nonnegative().optional().default(0),
  isActive: z.boolean().optional().default(true),
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

export type CreateCouponInput = z.infer<typeof createCouponSchema>;
export type UpdateCouponInput = z.infer<typeof updateCouponSchema>;
export type CreateOfferInput = z.infer<typeof createOfferSchema>;
export type UpdateOfferInput = z.infer<typeof updateOfferSchema>;

export const validateCouponSchema = z.object({
  code: z.string().trim().min(2).max(40).transform((value) => value.toUpperCase()),
  cartValue: z.number().finite().nonnegative(),
});

export type ValidateCouponInput = z.infer<typeof validateCouponSchema>;
