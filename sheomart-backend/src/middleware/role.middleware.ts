import { NextFunction, Response } from "express";
import { AppError } from "../errors/AppError";
import { AuthRequest } from "./auth.middleware";
import { UserRole } from "../models/user.model";

export const authorize =
  (...roles: UserRole[]) =>
  (
    req: AuthRequest,
    _res: Response,
    next: NextFunction
  ): void => {
    if (!req.user) {
      throw new AppError("Authentication required", 401);
    }

    if (!roles.includes(req.user.role as UserRole)) {
      throw new AppError("Access denied", 403);
    }

    next();
  };