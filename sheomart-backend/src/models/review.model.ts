import { Document, Schema, model } from "mongoose";
import { v4 as uuidv4 } from "uuid";

export interface IReview extends Document {
  reviewId: string;
  productId: string;
  userId: string;
  rating: number;
  title: string;
  comment: string;
  isVerifiedPurchase: boolean;
  isVisible: boolean;
  isDeleted: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const reviewSchema = new Schema<IReview>(
  {
    reviewId: {
      type: String,
      default: () => uuidv4(),
      unique: true,
      immutable: true,
    },

    productId: {
      type: String,
      required: true,
      index: true,
    },

    userId: {
      type: String,
      required: true,
      index: true,
    },

    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
      integer: true,
    },

    title: {
      type: String,
      default: "",
      trim: true,
      maxlength: 120,
    },

    comment: {
      type: String,
      default: "",
      trim: true,
      maxlength: 2000,
    },

    isVerifiedPurchase: {
      type: Boolean,
      default: false,
    },

    isVisible: {
      type: Boolean,
      default: true,
    },

    isDeleted: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

reviewSchema.index({ productId: 1, userId: 1 }, { unique: true });
reviewSchema.index({ productId: 1, rating: 1 });
reviewSchema.index({ userId: 1, rating: 1 });

export const Review = model<IReview>("Review", reviewSchema);
