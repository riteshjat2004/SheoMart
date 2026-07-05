import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";

import { env } from "../config/env";
import { AppError } from "../errors/AppError";

export interface AuthRequest extends Request {
  user?: {
    userId: string;
    role: string;
    sessionId: string;
  };
}

export const authenticate = (
  req: AuthRequest,
  _res: Response,
  next: NextFunction
): void => {
  const authHeader = req.headers.authorization ?? req.headers.Authorization;

  if (typeof authHeader !== "string" || !authHeader.startsWith("Bearer ")) {
    throw new AppError("Authentication required", 401);
  }

  const token = authHeader.split(" ")[1];

  if (!token) {
    throw new AppError("Authentication required", 401);
  }

  try {
    const payload = jwt.verify(token, env.JWT_ACCESS_SECRET) as {
      userId: string;
      role: string;
      sessionId: string;
    };

    req.user = payload;

    next();
  } catch {
    throw new AppError("Invalid or expired token", 401);
  }
};