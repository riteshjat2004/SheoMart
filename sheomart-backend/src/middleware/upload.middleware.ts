import { NextFunction, Request, RequestHandler, Response } from "express";
import multer from "multer";
import path from "path";
import { AppError } from "../errors/AppError";

const ALLOWED_MIME_TYPES = ["image/jpeg", "image/png", "image/webp"];
const ALLOWED_EXTENSIONS = [".jpg", ".jpeg", ".png", ".webp"];

/**
 * Validates magic file signatures to prevent executable/disguised file uploads.
 */
function isValidImageSignature(buffer: Buffer): boolean {
  if (!buffer || buffer.length < 12) {
    return false;
  }

  // JPEG signature: FF D8 FF
  if (buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff) {
    return true;
  }

  // PNG signature: 89 50 4E 47 (0x89 'PNG')
  if (
    buffer[0] === 0x89 &&
    buffer[1] === 0x50 &&
    buffer[2] === 0x4e &&
    buffer[3] === 0x47
  ) {
    return true;
  }

  // WebP signature: "RIFF" .... "WEBP"
  if (
    buffer[0] === 0x52 &&
    buffer[1] === 0x49 &&
    buffer[2] === 0x46 &&
    buffer[3] === 0x46 &&
    buffer[8] === 0x57 &&
    buffer[9] === 0x45 &&
    buffer[10] === 0x42 &&
    buffer[11] === 0x50
  ) {
    return true;
  }

  return false;
}

const memoryUpload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024, // 5 MB per image
    files: 5, // Maximum 5 files per upload request
  },
  fileFilter: (_req: Request, file: Express.Multer.File, callback: multer.FileFilterCallback) => {
    // 1. Sanitize filename (prevent path traversal, null byte injections)
    if (file.originalname.includes("\0") || file.originalname.includes("..")) {
      callback(new AppError("Invalid or suspicious filename", 400));
      return;
    }

    // 2. Extension check
    const ext = path.extname(file.originalname).toLowerCase();
    if (!ALLOWED_EXTENSIONS.includes(ext)) {
      callback(new AppError("Allowed image extensions are: .jpg, .jpeg, .png, .webp", 400));
      return;
    }

    // 3. MIME type check
    if (!ALLOWED_MIME_TYPES.includes(file.mimetype)) {
      callback(new AppError("Allowed MIME types are: image/jpeg, image/png, image/webp", 400));
      return;
    }

    callback(null, true);
  },
});

export const uploadProductImage: RequestHandler = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  memoryUpload.single("image")(req, res, (error: unknown) => {
    if (error) {
      if (error instanceof multer.MulterError && error.code === "LIMIT_FILE_SIZE") {
        next(new AppError("Image size cannot exceed 5 MB", 400));
        return;
      }
      next(error instanceof AppError ? error : new AppError("Invalid product image upload", 400));
      return;
    }

    // Inspect magic bytes if file was received
    if (req.file?.buffer && !isValidImageSignature(req.file.buffer)) {
      next(new AppError("Uploaded file signature does not match a valid image (JPEG/PNG/WebP)", 400));
      return;
    }

    next();
  });
};

export const uploadMultipleImages: RequestHandler = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  memoryUpload.array("images", 5)(req, res, (error: unknown) => {
    if (error) {
      if (error instanceof multer.MulterError && error.code === "LIMIT_FILE_SIZE") {
        next(new AppError("Each image cannot exceed 5 MB", 400));
        return;
      }
      next(error instanceof AppError ? error : new AppError("Invalid image upload", 400));
      return;
    }

    if (Array.isArray(req.files)) {
      for (const file of req.files) {
        if (file.buffer && !isValidImageSignature(file.buffer)) {
          next(new AppError(`File ${file.originalname} is not a valid image format`, 400));
          return;
        }
      }
    }

    next();
  });
};
