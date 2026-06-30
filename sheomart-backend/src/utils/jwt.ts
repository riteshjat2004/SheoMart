import jwt, { SignOptions } from "jsonwebtoken";
import { env } from "../config/env";
import { v4 as uuidv4 } from "uuid";

export const generateAccessToken = (
  userId: string,
  role: string,
  sessionId: string
): string => {
  return jwt.sign(
    { userId, role, sessionId, },
    env.JWT_ACCESS_SECRET,
    {
      expiresIn: env.JWT_ACCESS_EXPIRES_IN as SignOptions["expiresIn"],
    }
  );
};

export const generateRefreshToken = (userId: string, sessionId: string): string => {
  return jwt.sign(
    { userId, sessionId,jti: uuidv4(), },
    env.JWT_REFRESH_SECRET,
    {
      expiresIn: env.JWT_REFRESH_EXPIRES_IN as SignOptions["expiresIn"],
    }
  );
};

export const verifyAccessToken = (token: string) => {
  return jwt.verify(token, env.JWT_ACCESS_SECRET);
};

export const verifyRefreshToken = (token: string) => {
  return jwt.verify(token, env.JWT_REFRESH_SECRET);
};