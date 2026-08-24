import { NextFunction, Request, RequestHandler, Response } from "express";
import multer from "multer";
import { AppError } from "../errors/AppError";

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (_req, file, callback) => {
    if (!(["image/jpeg", "image/jpg", "image/png"] as string[]).includes(file.mimetype)) {
      callback(new AppError("Only JPG, JPEG, and PNG images are allowed", 400));
      return;
    }

    callback(null, true);
  },
});

export const uploadProductImage: RequestHandler = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  upload.single("image")(req, res, (error: unknown) => {
    if (!error) {
      next();
      return;
    }

    if (error instanceof multer.MulterError && error.code === "LIMIT_FILE_SIZE") {
      next(new AppError("Image must be 10 MB or smaller", 400));
      return;
    }

    next(error instanceof AppError ? error : new AppError("Invalid product image upload", 400));
  });
};
