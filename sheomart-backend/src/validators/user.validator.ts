import { z } from "zod";

import { USER_ROLES } from "../constants/roles";

const booleanQueryParam = z.enum(["true", "false"]).transform((value) => value === "true");

export const adminUserListQuerySchema = z.object({
  search: z.string().trim().max(100).optional(),
  role: z.enum([USER_ROLES.CUSTOMER, USER_ROLES.STORE_OWNER, USER_ROLES.PLATFORM_ADMIN]).optional(),
  isActive: booleanQueryParam.optional(),
  emailVerified: booleanQueryParam.optional(),
  phoneVerified: booleanQueryParam.optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(25),
  sortBy: z.enum(["createdAt", "name", "email", "role"]).default("createdAt"),
  sortOrder: z.enum(["asc", "desc"]).default("desc"),
}).strict();

export type AdminUserListQuery = z.infer<typeof adminUserListQuerySchema>;

export const updateProfileSchema = z
  .object({
    name: z.string().trim().min(2, "Name must be at least 2 characters").max(100).optional(),
    mobile: z
      .string()
      .trim()
      .regex(/^[6-9]\d{9}$/, "Invalid mobile number")
      .optional(),
    avatar: z.string().trim().max(500).optional(),
    address: z.string().trim().max(200).optional(),
    city: z.string().trim().max(100).optional(),
    state: z.string().trim().max(100).optional(),
    pincode: z.string().trim().max(10).optional(),
  })
  .strict();

export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;

export const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(8, "Current password must be at least 8 characters"),
    newPassword: z.string().min(8, "New password must be at least 8 characters"),
    confirmPassword: z.string().min(8, "Confirm password must be at least 8 characters"),
  })
  .superRefine(({ newPassword, confirmPassword }, ctx) => {
    if (newPassword !== confirmPassword) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Passwords do not match",
        path: ["confirmPassword"],
      });
    }
  });

export type ChangePasswordInput = z.infer<typeof changePasswordSchema>;
