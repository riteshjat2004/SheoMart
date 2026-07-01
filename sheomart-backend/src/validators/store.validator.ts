import { z } from "zod";

export const allowedStoreUpdateFields = [
  "description",
  "logo",
  "banner",
  "phone",
  "address",
  "city",
  "state",
  "pincode",
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
  })
  .strict();

export type UpdateStoreInput = z.infer<typeof updateStoreSchema>;
