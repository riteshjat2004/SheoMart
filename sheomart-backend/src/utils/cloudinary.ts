import { UploadApiResponse } from "cloudinary";
import { AppError } from "../errors/AppError";
import { cloudinary } from "../config/cloudinary";
import { CLOUDINARY_FOLDERS } from "../constants/cloudinary";

export interface CloudinaryImageUpload {
  secure_url: string;
  public_id: string;
  width: number;
  height: number;
  bytes: number;
}

export function uploadBufferToCloudinary(
  buffer: Buffer,
  folder: string = CLOUDINARY_FOLDERS.PRODUCTS,
): Promise<CloudinaryImageUpload> {
  return new Promise((resolve, reject) => {
    try {
      const stream = cloudinary.uploader.upload_stream(
        { folder, resource_type: "image", overwrite: false, invalidate: true },
        (error, result?: UploadApiResponse) => {
          if (error || !result) {
            const providerError = error as {
              message?: string;
              http_code?: number;
              code?: string | number;
              [key: string]: unknown;
            } | undefined;
            reject(new AppError(providerError?.message || "Cloudinary image upload failed", 502));
            return;
          }

          resolve({
            secure_url: result.secure_url,
            public_id: result.public_id,
            width: result.width,
            height: result.height,
            bytes: result.bytes,
          });
        },
      );

      stream.end(buffer);
    } catch (error) {
      reject(error instanceof AppError ? error : new AppError("Cloudinary image upload failed", 502));
    }
  });
}

export async function deleteImageFromCloudinary(publicId: string): Promise<boolean> {
  if (!publicId) {
    return false;
  }

  try {
    const result = await cloudinary.uploader.destroy(publicId, { resource_type: "image" });
    return result.result === "ok" || result.result === "not found";
  } catch {
    return false;
  }
}
