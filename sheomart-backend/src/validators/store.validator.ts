import { z } from "zod";
import { STORE_BADGE } from "../models/store.model";

export const allowedStoreUpdateFields = [
  "description",
  "logo",
  "banner",
  "phone",
  "address",
  "city",
  "state",
  "pincode",
  "pickupOpeningTime",
  "pickupClosingTime",
  "pickupEnabled",
  "deliveryEnabled",
  "deliveryFee",
  "freeDeliveryAbove",
  "deliveryRadiusKm",
  "preparationTimeMinutes",
  "latitude",
  "longitude",
  "deliverySlots",
] as const;

export const protectedStoreUpdateFields = [
  "ownerId",
  "storeId",
  "slug",
  "status",
  "isVerified",
  "approvedAt",
  "approvedBy",
  "rating",
  "totalReviews",
  "createdAt",
  "updatedAt",
  "_id",
] as const;

export const createStoreSchema = z.object({
  storeName: z
    .string()
    .trim()
    .min(2, "Store name must be at least 2 characters")
    .max(100),
  description: z.string().trim().max(1000).optional().default(""),
  email: z.string().trim().email("Invalid email"),
  phone: z.string().trim().min(8, "Phone number is required"),
  address: z.string().trim().max(200).optional().default(""),
  city: z.string().trim().max(100).optional().default(""),
  state: z.string().trim().max(100).optional().default(""),
  pincode: z.string().trim().max(10).optional().default(""),
});

export type CreateStoreInput = z.infer<typeof createStoreSchema>;

export const updateStoreSchema = z
  .object({
    description: z.string().trim().max(1000).optional(),
    logo: z.string().trim().max(500).optional(),
    banner: z.string().trim().max(500).optional(),
    phone: z.string().trim().min(8, "Phone number is required").optional(),
    address: z.string().trim().max(200).optional(),
    city: z.string().trim().max(100).optional(),
    state: z.string().trim().max(100).optional(),
    pincode: z.string().trim().max(10).optional(),
    pickupOpeningTime: z.string().regex(/^\d{2}:\d{2}$/).optional(),
    pickupClosingTime: z.string().regex(/^\d{2}:\d{2}$/).optional(),
    pickupEnabled: z.boolean().optional(),
    deliveryEnabled: z.boolean().optional(),
    deliveryFee: z.number().min(0).optional(),
    freeDeliveryAbove: z.number().min(0).optional(),
    deliveryRadiusKm: z.number().min(0).optional(),
    preparationTimeMinutes: z.number().int().min(0).optional(),
    latitude: z.number().min(-90).max(90).optional(),
    longitude: z.number().min(-180).max(180).optional(),
    deliverySlots: z.array(z.object({
      slotId: z.string().min(1),
      label: z.string().trim().min(1),
      startTime: z.string().regex(/^\d{2}:\d{2}$/),
      endTime: z.string().regex(/^\d{2}:\d{2}$/),
      capacity: z.number().int().min(1).optional(),
      isActive: z.boolean(),
    })).optional(),
  })
  .strict();

export type UpdateStoreInput = z.infer<typeof updateStoreSchema>;

export const updateStoreBadgeSchema = z
  .object({
    badge: z.nativeEnum(STORE_BADGE),
  })
  .strict();

export type UpdateStoreBadgeInput = z.infer<typeof updateStoreBadgeSchema>;
