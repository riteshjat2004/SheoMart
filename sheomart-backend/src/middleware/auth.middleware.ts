import { NextFunction, Request, Response } from "express";
import { AppError } from "../errors/AppError";
import { verifyAccessToken } from "../utils/jwt";
import { User } from "../models/user.model";

export interface AuthRequest extends Request {
  user?: {
    userId: string;
    role: string;
    sessionId: string;
  };
  file?: Express.Multer.File;
  files?: Express.Multer.File[] | { [fieldname: string]: Express.Multer.File[] };
}

export const authenticate = async (
  req: AuthRequest,
  _res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization ?? req.headers.Authorization;

    if (typeof authHeader !== "string" || !authHeader.startsWith("Bearer ")) {
      throw new AppError("Authentication required", 401);
    }

    const token = authHeader.split(" ")[1];

    if (!token) {
      throw new AppError("Authentication required", 401);
    }

    let payload;
    try {
      payload = verifyAccessToken(token);
    } catch {
      throw new AppError("Invalid or expired token", 401);
    }

    // Verify user exists and check account status (defense-in-depth against suspended/deleted accounts)
    const user = await User.findOne({
      userId: payload.userId,
      isDeleted: { $ne: true },
    })
      .select("userId role isActive isSuspended tokenVersion")
      .lean();

    if (!user) {
      throw new AppError("Account not found or deactivated", 401);
    }

    if (!user.isActive) {
      throw new AppError("Account has been disabled", 403);
    }

    if (user.isSuspended) {
      throw new AppError("Account is currently suspended", 403);
    }

    // Token version check (revokes stateless tokens if user password changed or tokens revoked)
    if (
      payload.tokenVersion !== undefined &&
      user.tokenVersion !== undefined &&
      payload.tokenVersion < user.tokenVersion
    ) {
      throw new AppError("Token has been revoked. Please log in again.", 401);
    }

    req.user = {
      userId: user.userId,
      role: user.role || payload.role,
      sessionId: payload.sessionId,
    };

    next();
  } catch (error) {
    next(error);
  }
};