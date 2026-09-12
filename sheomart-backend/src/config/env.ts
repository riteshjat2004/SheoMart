import dotenv from "dotenv";
import { z } from "zod";

dotenv.config();

const envSchema = z.object({
  PORT: z.coerce.number().default(5000),

  NODE_ENV: z.enum(["development", "production"]).default("development"),

  MONGODB_URI: z.string().min(1, "MONGODB_URI is required"),

  JWT_ACCESS_SECRET: z.string().min(32, "JWT_ACCESS_SECRET is required"),

  JWT_REFRESH_SECRET: z.string().min(32, "JWT_REFRESH_SECRET is required"),

  JWT_ACCESS_EXPIRES_IN: z.string().default("15m"),

  JWT_REFRESH_EXPIRES_IN: z.string().default("7d"),

  CORS_ORIGIN: z.string().default("http://localhost:8081"),
  FRONTEND_URL: z.string().optional(),

  SMTP_HOST: z.string().optional(),
  SMTP_PORT: z.coerce.number().int().positive().default(587),
  SMTP_SECURE: z.enum(["true", "false"]).default("false").transform((value) => value === "true"),
  SMTP_USER: z.string().optional(),
  SMTP_PASSWORD: z.string().optional(),
  SMTP_FROM: z.string().trim().min(1).optional(),

  CLOUDINARY_CLOUD_NAME: z.string().optional(),

  CLOUDINARY_API_KEY: z.string().optional(),

  CLOUDINARY_API_SECRET: z.string().optional(),

  RAZORPAY_KEY_ID: z
    .string()
    .min(1, "RAZORPAY_KEY_ID is required")
    .regex(/^rzp_(live|test)_[A-Za-z0-9]+$/, "RAZORPAY_KEY_ID must be a valid Razorpay key ID"),

  RAZORPAY_KEY_SECRET: z
    .string()
    .min(1, "RAZORPAY_KEY_SECRET is required")
    .regex(/^[A-Za-z0-9]+$/, "RAZORPAY_KEY_SECRET must be a valid Razorpay secret")
    .refine((value) => !/^x+$/.test(value), "RAZORPAY_KEY_SECRET appears to be a placeholder value"),
});


export const env = envSchema.parse(process.env);