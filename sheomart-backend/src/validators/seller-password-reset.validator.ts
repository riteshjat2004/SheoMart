import { z } from "zod";
import { strongPassword } from "./auth.validator";

export const sellerPasswordResetRequestSchema = z
  .object({
    email: z.email().transform((value) => value.toLowerCase()),
    newPassword: strongPassword,
    confirmPassword: z.string().min(8),
    reason: z.string().trim().max(1000).optional().default(""),
  })
  .superRefine(({ newPassword, confirmPassword }, ctx) => {
    if (newPassword !== confirmPassword)
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Passwords do not match",
        path: ["confirmPassword"],
      });
  });

export const sellerPasswordResetReviewSchema = z.object({
  remarks: z.string().trim().max(1000).optional(),
  adminRemarks: z.string().trim().max(1000).optional(),
}).transform(({ remarks, adminRemarks }) => ({
  adminRemarks: remarks ?? adminRemarks ?? "",
}));
