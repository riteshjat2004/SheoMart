import { NextFunction, Request, Response } from "express";
import { env } from "../config/env";

/**
 * Defense-in-depth CSRF verification for cookie-authenticated state-changing operations.
 * - Standard Bearer token API requests bypass this check (as custom Authorization headers
 *   cannot be sent cross-origin without passing CORS preflight).
 * - Cookie-authenticated requests must have a matching Origin or Referer header.
 */
export const csrfProtection = (req: Request, res: Response, next: NextFunction): void => {
  const method = req.method.toUpperCase();

  // Safe read-only HTTP methods
  if (["GET", "HEAD", "OPTIONS"].includes(method)) {
    return next();
  }

  // If request has Authorization header, it cannot be forged via simple cross-origin browser form submission
  const authHeader = req.headers.authorization ?? req.headers.Authorization;
  if (typeof authHeader === "string" && authHeader.startsWith("Bearer ")) {
    return next();
  }

  // If no auth cookies are attached, standard public endpoint
  if (!req.cookies?.refreshToken) {
    return next();
  }

  // Cookie-authenticated state mutation: verify Origin or Referer
  const origin = (req.headers.origin as string) || "";
  const referer = (req.headers.referer as string) || "";

  const allowedOrigins = [
    env.CORS_ORIGIN,
    env.FRONTEND_URL,
    "http://localhost:8081",
    "http://localhost:3000",
    "http://localhost:5000",
  ].filter(Boolean) as string[];

  const isOriginAllowed = allowedOrigins.some((allowed) => {
    return (
      (origin && origin.startsWith(allowed)) ||
      (referer && referer.startsWith(allowed))
    );
  });

  if (!isOriginAllowed && env.NODE_ENV === "production") {
    res.status(403).json({
      success: false,
      message: "CSRF verification failed: Untrusted request origin",
    });
    return;
  }

  next();
};
