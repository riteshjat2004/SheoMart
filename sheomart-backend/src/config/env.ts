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

  CLOUDINARY_CLOUD_NAME: z.string().optional(),

  CLOUDINARY_API_KEY: z.string().optional(),

  CLOUDINARY_API_SECRET: z.string().optional(),
});


export const env = envSchema.parse(process.env);