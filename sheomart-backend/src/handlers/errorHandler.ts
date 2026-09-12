import { NextFunction, Request, Response } from "express";
import { ZodError } from "zod";
import { AppError } from "../errors/AppError";
import { logger } from "../utils/logger";

export const errorHandler = (
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction
) => {
  console.error("[Global Error Handler] Complete error:", err);
  console.error("[Global Error Handler] Stack trace:", err.stack);

  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      success: false,
      message: err.message,
      ...(err.stage ? { stage: err.stage } : {}),
    });
  }

  if (err instanceof ZodError) {
    const errors = err.issues.map((issue) => ({
      field: issue.path.length > 0 ? issue.path.join(".") : "body",
      message: issue.message,
    }));

    return res.status(400).json({
      success: false,
      message: "Validation failed",
      errors,
    });
  }

  logger.error("Unhandled Server Error", err);

  return res.status(500).json({
    success: false,
    message: "Internal Server Error",
  });
};