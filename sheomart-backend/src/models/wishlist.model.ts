import { Document, Schema, model } from "mongoose";
import { v4 as uuidv4 } from "uuid";

export interface IWishlistItem extends Document {
  wishlistItemId: string;
  userId: string;
  productId: string;
  createdAt: Date;
  updatedAt: Date;
}

const wishlistSchema = new Schema<IWishlistItem>(
  {
    wishlistItemId: {
      type: String,
      default: () => uuidv4(),
      unique: true,
      immutable: true,
    },
    userId: {
      type: String,
      required: true,
      index: true,
    },
    productId: {
      type: String,
      required: true,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

wishlistSchema.index({ userId: 1, productId: 1 }, { unique: true });

export const WishlistItem = model<IWishlistItem>("WishlistItem", wishlistSchema);
