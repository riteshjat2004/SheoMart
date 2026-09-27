import jwt, { SignOptions } from "jsonwebtoken";
import { env } from "../config/env";
import { v4 as uuidv4 } from "uuid";

export const JWT_ISSUER = "sheomart-api";
export const JWT_AUDIENCE = "sheomart-client";

export interface AccessTokenPayload {
  userId: string;
  role: string;
  sessionId: string;
  tokenVersion?: number;
  jti?: string;
  iss?: string;
  aud?: string;
}

export interface RefreshTokenPayload {
  userId: string;
  sessionId: string;
  familyId?: string;
  tokenVersion?: number;
  jti?: string;
  iss?: string;
  aud?: string;
}

export const generateAccessToken = (
  userId: string,
  role: string,
  sessionId: string,
  tokenVersion = 0
): string => {
  return jwt.sign(
    {
      userId,
      role,
      sessionId,
      tokenVersion,
    },
    env.JWT_ACCESS_SECRET,
    {
      expiresIn: (env.JWT_ACCESS_EXPIRES_IN || "15m") as SignOptions["expiresIn"],
      algorithm: "HS256",
      issuer: JWT_ISSUER,
      audience: JWT_AUDIENCE,
      jwtid: uuidv4(),
    }
  );
};

export const generateRefreshToken = (
  userId: string,
  sessionId: string,
  familyId?: string,
  tokenVersion = 0
): string => {
  return jwt.sign(
    {
      userId,
      sessionId,
      familyId: familyId || uuidv4(),
      tokenVersion,
    },
    env.JWT_REFRESH_SECRET,
    {
      expiresIn: (env.JWT_REFRESH_EXPIRES_IN || "7d") as SignOptions["expiresIn"],
      algorithm: "HS256",
      issuer: JWT_ISSUER,
      audience: JWT_AUDIENCE,
      jwtid: uuidv4(),
    }
  );
};

export const verifyAccessToken = (token: string): AccessTokenPayload => {
  try {
    return jwt.verify(token, env.JWT_ACCESS_SECRET, {
      algorithms: ["HS256"],
      issuer: JWT_ISSUER,
      audience: JWT_AUDIENCE,
    }) as AccessTokenPayload;
  } catch (err: unknown) {
    // Graceful backward compatibility for tokens issued before issuer/audience hardening
    if (
      err instanceof Error &&
      err.name === "JsonWebTokenError" &&
      (err.message.includes("jwt audience") || err.message.includes("jwt issuer"))
    ) {
      return jwt.verify(token, env.JWT_ACCESS_SECRET, {
        algorithms: ["HS256"],
      }) as AccessTokenPayload;
    }
    throw err;
  }
};

export const verifyRefreshToken = (token: string): RefreshTokenPayload => {
  try {
    return jwt.verify(token, env.JWT_REFRESH_SECRET, {
      algorithms: ["HS256"],
      issuer: JWT_ISSUER,
      audience: JWT_AUDIENCE,
    }) as RefreshTokenPayload;
  } catch (err: unknown) {
    if (
      err instanceof Error &&
      err.name === "JsonWebTokenError" &&
      (err.message.includes("jwt audience") || err.message.includes("jwt issuer"))
    ) {
      return jwt.verify(token, env.JWT_REFRESH_SECRET, {
        algorithms: ["HS256"],
      }) as RefreshTokenPayload;
    }
    throw err;
  }
};