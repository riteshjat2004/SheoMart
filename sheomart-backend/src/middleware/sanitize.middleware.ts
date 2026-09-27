import { NextFunction, Request, Response } from "express";

/**
 * Recursively cleans objects in-place to prevent NoSQL injection.
 * Strips any keys starting with `$` or containing `.` from queries, params, and bodies.
 * Mutates in-place to support Express 5 where req.query and req.params are getter-only properties.
 */
function sanitizeInPlace(obj: unknown): void {
  if (!obj || typeof obj !== "object") {
    return;
  }

  if (Array.isArray(obj)) {
    for (let i = 0; i < obj.length; i++) {
      if (typeof obj[i] === "object" && obj[i] !== null) {
        sanitizeInPlace(obj[i]);
      }
    }
    return;
  }

  const record = obj as Record<string, unknown>;
  for (const key of Object.keys(record)) {
    if (key.startsWith("$") || key.includes(".")) {
      delete record[key];
    } else if (typeof record[key] === "object" && record[key] !== null) {
      sanitizeInPlace(record[key]);
    }
  }
}

export const mongoSanitize = (req: Request, _res: Response, next: NextFunction): void => {
  if (req.body && typeof req.body === "object") {
    sanitizeInPlace(req.body);
  }
  if (req.query && typeof req.query === "object") {
    sanitizeInPlace(req.query);
  }
  if (req.params && typeof req.params === "object") {
    sanitizeInPlace(req.params);
  }
  next();
};

export const enforceContentType = (req: Request, res: Response, next: NextFunction): void => {
  const method = req.method.toUpperCase();
  if (["POST", "PUT", "PATCH"].includes(method)) {
    const contentType = req.headers["content-type"] || "";
    // If request has a body and is not multipart form data or json, reject
    if (
      req.headers["content-length"] &&
      req.headers["content-length"] !== "0" &&
      !contentType.includes("application/json") &&
      !contentType.includes("multipart/form-data") &&
      !contentType.includes("application/x-www-form-urlencoded")
    ) {
      res.status(415).json({
        success: false,
        message: "Unsupported Media Type: Content-Type must be application/json or multipart/form-data",
      });
      return;
    }
  }
  next();
};
