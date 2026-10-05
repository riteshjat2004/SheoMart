import { Document, Schema, model } from "mongoose";
import { v4 as uuidv4 } from "uuid";

export interface ICartItem extends Document {
  cartItemId: string;
  userId: string;
  productId: string;
  variantId?: string;
  variantLabel?: string;
  storeId?: string;
  quantity: number;
  createdAt: Date;
  updatedAt: Date;
}

const cartSchema = new Schema<ICartItem>(
  {
    cartItemId: {
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
    variantId: {
      type: String,
      default: "",
      index: true,
    },
    variantLabel: {
      type: String,
      default: "",
    },
    storeId: {
      type: String,
      index: true,
    },
    quantity: {
      type: Number,
      default: 1,
      min: 1,
    },
  },
  {
    timestamps: true,
  }
);

cartSchema.index({ userId: 1, productId: 1, variantId: 1 }, { unique: true });

export const CartItem = model<ICartItem>("CartItem", cartSchema);

export const ensureCartIndexes = async () => {
  try {
    const indexes = await CartItem.collection.getIndexes();
    if (indexes["userId_1_productId_1"]) {
      await CartItem.collection.dropIndex("userId_1_productId_1");
    }
  } catch {
    // ignore
  }
};
