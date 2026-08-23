import { Document, Schema, model } from "mongoose";
import { v4 as uuidv4 } from "uuid";

export interface ICartItem extends Document {
  cartItemId: string;
  userId: string;
  productId: string;
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

cartSchema.index({ userId: 1, productId: 1 }, { unique: true });

export const CartItem = model<ICartItem>("CartItem", cartSchema);
