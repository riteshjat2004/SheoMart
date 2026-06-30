import { NextFunction, Request, Response } from "express";
import { AppError } from "../errors/AppError";
import { logger } from "../utils/logger";

export const errorHandler = (
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction
) => {
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      success: false,
      message: err.message,
    });
  }

  logger.error("Unhandled Server Error", err);

  return res.status(500).json({
    success: false,
    message: "Internal Server Error",
  });
};