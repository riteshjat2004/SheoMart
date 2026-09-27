import rateLimit, { Options } from "express-rate-limit";
import { Request, Response } from "express";

/**
 * Pluggable Store Interface for future Redis/distributed clustering.
 * In development and single-node setups, express-rate-limit defaults to MemoryStore.
 * When REDIS_URL is provided in production, a Redis store can be plugged in seamlessly.
 */
export interface RateLimitConfig {
  windowMs: number;
  max: number;
  message: string;
}

const createLimiter = (config: RateLimitConfig) => {
  return rateLimit({
    windowMs: config.windowMs,
    max: config.max,
    standardHeaders: true,
    legacyHeaders: false,
    handler: (_req: Request, res: Response) => {
      res.status(429).json({
        success: false,
        message: config.message,
      });
    },
  });
};

// ── AUTHENTICATION LIMITERS ──────────────────────────────────────────────────
export const authLoginLimiter = createLimiter({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // 10 attempts per IP per 15 min window
  message: "Too many login attempts. Please try again after 15 minutes.",
});

export const authRegisterLimiter = createLimiter({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 10, // 10 registration attempts per IP per hour
  message: "Too many accounts created from this IP. Please try again later.",
});

export const authRefreshLimiter = createLimiter({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 120, // Allows normal SPA refresh cycles without 429
  message: "Too many token refresh requests. Please try again later.",
});

export const authPasswordResetLimiter = createLimiter({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 5,
  message: "Too many password reset requests. Please try again in an hour.",
});

export const authOtpLimiter = createLimiter({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5,
  message: "Too many OTP verification attempts. Please try again in 15 minutes.",
});

// ── API ENDPOINT LIMITERS ────────────────────────────────────────────────────
export const searchLimiter = createLimiter({
  windowMs: 60 * 1000, // 1 minute
  max: 60, // 1 search per second avg
  message: "Search rate limit exceeded. Please slow down.",
});

export const uploadLimiter = createLimiter({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 30, // 30 image uploads per 15 min window
  message: "Image upload rate limit reached. Please wait a few minutes.",
});

export const billingPosLimiter = createLimiter({
  windowMs: 60 * 1000, // 1 minute
  max: 180, // High throughput for busy physical billing counters
  message: "Billing POS request limit reached. Please wait a moment.",
});

export const analyticsLimiter = createLimiter({
  windowMs: 60 * 1000, // 1 minute
  max: 60,
  message: "Analytics query rate limit exceeded.",
});

export const publicProductsLimiter = createLimiter({
  windowMs: 60 * 1000, // 1 minute
  max: 200,
  message: "Too many requests to public catalog. Please slow down.",
});

export const apiGeneralLimiter = createLimiter({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 1000, // Generous baseline for general authenticated calls
  message: "API rate limit exceeded. Please wait a while before retrying.",
});
