import { CookieOptions, Response } from "express";
import { env } from "../config/env";

export const COOKIE_NAMES = {
  REFRESH_TOKEN: "refreshToken",
} as const;

export const getAuthCookieOptions = (path = "/api/v1/auth"): CookieOptions => {
  const isProd = env.NODE_ENV === "production";
  return {
    httpOnly: true,
    secure: isProd,
    sameSite: isProd ? ("strict" as const) : ("lax" as const),
    path,
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days (matching refresh token expiry)
  };
};

export const setRefreshTokenCookie = (res: Response, token: string): void => {
  res.cookie(COOKIE_NAMES.REFRESH_TOKEN, token, getAuthCookieOptions("/api/v1/auth"));
};

export const clearRefreshTokenCookie = (res: Response): void => {
  res.clearCookie(COOKIE_NAMES.REFRESH_TOKEN, getAuthCookieOptions("/api/v1/auth"));
  // Also clear root path just in case previous implementations set it there
  res.clearCookie(COOKIE_NAMES.REFRESH_TOKEN, getAuthCookieOptions("/"));
};
