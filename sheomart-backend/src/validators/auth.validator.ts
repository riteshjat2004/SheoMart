import { z } from "zod";

export const registerSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Name must be at least 2 characters")
    .max(100),

  email: z.email(),

  mobile: z
    .string()
    .trim()
    .regex(/^[6-9]\d{9}$/, "Invalid mobile number"),

  password: z
    .string()
    .min(8, "Password must be at least 8 characters"),
});

export type RegisterInput = z.infer<typeof registerSchema>;

export const loginSchema = z.object({
  identifier: z
    .string()
    .trim()
    .min(1, "Email or mobile number is required"),

  password: z
    .string()
    .min(8, "Password must be at least 8 characters"),
});

export type LoginInput = z.infer<typeof loginSchema>;

export const strongPassword = z
  .string()
  .min(8, "Password must be at least 8 characters")
  .regex(/[A-Z]/, "Password must contain an uppercase letter")
  .regex(/[a-z]/, "Password must contain a lowercase letter")
  .regex(/[0-9]/, "Password must contain a number")
  .regex(/[^A-Za-z0-9]/, "Password must contain a special character");

export const forgotPasswordSchema = z.object({ email: z.email().transform((value) => value.toLowerCase()) });
export const verifyResetOtpSchema = z.object({ email: z.email().transform((value) => value.toLowerCase()), otp: z.string().regex(/^\d{6}$/, "Enter a valid 6-digit code") });
export const resetPasswordSchema = z.object({
  email: z.email().transform((value) => value.toLowerCase()),
  resetToken: z.string().min(32),
  newPassword: strongPassword,
  confirmPassword: z.string().min(8),
}).superRefine(({ newPassword, confirmPassword }, ctx) => {
  if (newPassword !== confirmPassword) ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Passwords do not match", path: ["confirmPassword"] });
});