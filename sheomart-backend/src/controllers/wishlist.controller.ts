import { Response } from "express";
import { AppError } from "../errors/AppError";
import { AuthRequest } from "../middleware/auth.middleware";
import { ApiResponse } from "../utils/apiResponse";
import { WishlistService } from "../services/wishlist.service";
import { addWishlistItemSchema } from "../validators/wishlist.validator";

export const getWishlist = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  const wishlist = await WishlistService.getWishlistForUser(req.user?.userId as string);

  res.status(200).json(
    new ApiResponse(true, "Wishlist fetched successfully", { wishlist })
  );
};

export const addWishlistItem = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  const payload = (req.body && typeof req.body === "object" ? req.body : {}) as Record<string, unknown>;
  const result = addWishlistItemSchema.safeParse(payload);

  if (!result.success) {
    const message = result.error.issues[0]?.message || "Invalid wishlist payload";
    throw new AppError(message, 400);
  }

  const wishlistItem = await WishlistService.addWishlistItem(req.user?.userId as string, result.data);

  res.status(201).json(
    new ApiResponse(true, "Product added to wishlist successfully", { wishlistItem })
  );
};

export const removeWishlistItem = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  const wishlistItemId = Array.isArray(req.params.wishlistItemId)
    ? req.params.wishlistItemId[0]
    : req.params.wishlistItemId;
  const wishlistItem = await WishlistService.removeWishlistItem(wishlistItemId, req.user?.userId as string);

  res.status(200).json(
    new ApiResponse(true, "Wishlist item removed successfully", { wishlistItem })
  );
};
