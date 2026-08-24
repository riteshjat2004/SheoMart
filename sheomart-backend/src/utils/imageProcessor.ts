import sharp from "sharp";
import { AppError } from "../errors/AppError";

export async function processProductImage(buffer: Buffer): Promise<Buffer> {
  try {
    return await sharp(buffer)
      .resize(512, 512, { fit: "cover", position: "centre" })
      .jpeg({ quality: 80, progressive: true, force: true })
      .toBuffer();
  } catch {
    throw new AppError("Unable to process product image", 400);
  }
}
