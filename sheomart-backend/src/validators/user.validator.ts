import { z } from "zod";

import { USER_ROLES } from "../constants/roles";
import { strongPassword } from "./auth.validator";

const booleanQueryParam = z.enum(["true", "false"]).transform((value) => value === "true");

export const adminUserListQuerySchema = z
  .object({
    search: z.string().trim().max(100).optional(),
    role: z.enum([USER_ROLES.CUSTOMER, USER_ROLES.STORE_OWNER, USER_ROLES.PLATFORM_ADMIN]).optional(),
    status: z.enum(["all", "active", "inactive", "suspended", "deleted"]).optional(),
    isVerifiedCustomer: booleanQueryParam.optional(),
    isActive: booleanQueryParam.optional(),
    emailVerified: booleanQueryParam.optional(),
    phoneVerified: booleanQueryParam.optional(),
    district: z.string().trim().max(100).optional(),
    state: z.string().trim().max(100).optional(),
    page: z.coerce.number().int().min(1).default(1),
    limit: z.coerce.number().int().min(1).max(100).default(25),
    sortBy: z.enum(["createdAt", "name", "email", "role", "lastLoginAt"]).default("createdAt"),
    sortOrder: z.enum(["asc", "desc"]).default("desc"),
  })
  .strict();

export type AdminUserListQuery = z.infer<typeof adminUserListQuerySchema>;

export const createAdminUserSchema = z
  .object({
    name: z.string().trim().min(2, "Name must be at least 2 characters").max(100),
    email: z.string().trim().email("Invalid email address").toLowerCase(),
    mobile: z
      .string()
      .trim()
      .regex(/^[6-9]\d{9}$/, "Invalid 10-digit Indian mobile number"),
    password: strongPassword,
    role: z.enum([USER_ROLES.CUSTOMER, USER_ROLES.STORE_OWNER, USER_ROLES.PLATFORM_ADMIN]).default(USER_ROLES.CUSTOMER),
    isVerifiedCustomer: z.boolean().default(false),
    isActive: z.boolean().default(true),
    address: z.string().trim().max(200).optional(),
    city: z.string().trim().max(100).optional(),
    district: z.string().trim().max(100).optional(),
    state: z.string().trim().max(100).optional(),
    pincode: z.string().trim().max(10).optional(),
    gender: z.enum(["male", "female", "other", ""]).optional(),
    dob: z.string().trim().optional(),
  })
  .strict();

export type CreateAdminUserInput = z.infer<typeof createAdminUserSchema>;

export const updateAdminUserSchema = z
  .object({
    name: z.string().trim().min(2, "Name must be at least 2 characters").max(100).optional(),
    email: z.string().trim().email("Invalid email address").toLowerCase().optional(),
    mobile: z
      .string()
      .trim()
      .regex(/^[6-9]\d{9}$/, "Invalid 10-digit Indian mobile number")
      .optional(),
    role: z.enum([USER_ROLES.CUSTOMER, USER_ROLES.STORE_OWNER, USER_ROLES.PLATFORM_ADMIN]).optional(),
    isVerifiedCustomer: z.boolean().optional(),
    isActive: z.boolean().optional(),
    avatar: z.string().trim().max(500).optional(),
    address: z.string().trim().max(200).optional(),
    city: z.string().trim().max(100).optional(),
    district: z.string().trim().max(100).optional(),
    state: z.string().trim().max(100).optional(),
    pincode: z.string().trim().max(10).optional(),
    gender: z.enum(["male", "female", "other", ""]).optional(),
    dob: z.string().trim().optional(),
  })
  .strict();

export type UpdateAdminUserInput = z.infer<typeof updateAdminUserSchema>;

export const changeRoleSchema = z
  .object({
    role: z.enum([USER_ROLES.CUSTOMER, USER_ROLES.STORE_OWNER, USER_ROLES.PLATFORM_ADMIN]),
  })
  .strict();

export type ChangeRoleInput = z.infer<typeof changeRoleSchema>;

export const suspendUserSchema = z
  .object({
    isSuspended: z.boolean(),
    suspendedReason: z.string().trim().max(500).optional(),
  })
  .strict();

export type SuspendUserInput = z.infer<typeof suspendUserSchema>;

export const verifyCustomerSchema = z
  .object({
    isVerifiedCustomer: z.boolean(),
  })
  .strict();

export type VerifyCustomerInput = z.infer<typeof verifyCustomerSchema>;

export const bulkUserActionSchema = z
  .object({
    userIds: z.array(z.string().min(1)).min(1, "Select at least one user"),
    action: z.enum([
      "verify",
      "unverify",
      "suspend",
      "activate",
      "delete",
      "restore",
      "assign_seller",
      "remove_seller",
    ]),
    reason: z.string().trim().max(500).optional(),
  })
  .strict();

export type BulkUserActionInput = z.infer<typeof bulkUserActionSchema>;

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
    district: z.string().trim().max(100).optional(),
    state: z.string().trim().max(100).optional(),
    pincode: z.string().trim().max(10).optional(),
    gender: z.enum(["male", "female", "other", ""]).optional(),
    dob: z.string().trim().optional(),
  })
  .strict();

export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;

export const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(8, "Current password must be at least 8 characters"),
    newPassword: strongPassword,
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
