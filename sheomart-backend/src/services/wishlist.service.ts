import { AppError } from "../errors/AppError";
import { Product } from "../models/product.model";
import { WishlistItem } from "../models/wishlist.model";
import { AddWishlistItemInput } from "../validators/wishlist.validator";

export class WishlistService {
  static async getWishlistForUser(userId: string) {
    const wishlistItems = await WishlistItem.find({ userId }).sort({ createdAt: -1 });
    const productIds = wishlistItems.map((item) => item.productId);
    const products = await Product.find({ productId: { $in: productIds }, isActive: true, isPublished: true });
    const productMap = new Map(products.map((product) => [product.productId, product]));

    return wishlistItems
      .map((item) => {
        const product = productMap.get(item.productId);
        if (!product) {
          return null;
        }
        return {
          wishlistItemId: item.wishlistItemId,
          product,
        };
      })
      .filter((item): item is { wishlistItemId: string; product: typeof products[number] } => item !== null);
  }

  static async addWishlistItem(userId: string, data: AddWishlistItemInput) {
    const product = await Product.findOne({ productId: data.productId, isActive: true, isPublished: true });

    if (!product) {
      throw new AppError("Product not found", 404);
    }

    const existingItem = await WishlistItem.findOne({ userId, productId: data.productId });

    if (existingItem) {
      return existingItem;
    }

    const wishlistItem = await WishlistItem.create({
      userId,
      productId: data.productId,
    });

    return wishlistItem;
  }

  static async removeWishlistItem(wishlistItemId: string, userId: string) {
    const wishlistItem = await WishlistItem.findOne({ wishlistItemId, userId });

    if (!wishlistItem) {
      throw new AppError("Wishlist item not found", 404);
    }

    await wishlistItem.deleteOne();
    return wishlistItem;
  }
}
