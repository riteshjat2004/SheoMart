import { Document, Schema, model } from "mongoose";
import { v4 as uuidv4 } from "uuid";

export const REVIEW_STATUS = {
  PENDING: "pending",
  APPROVED: "approved",
  REJECTED: "rejected",
  HIDDEN: "hidden",
  REPORTED: "reported",
  DELETED: "deleted",
} as const;

export type ReviewStatus = (typeof REVIEW_STATUS)[keyof typeof REVIEW_STATUS];

export interface IReview extends Document {
  reviewId: string;
  productId: string;
  storeId: string;
  userId: string;
  rating: number;
  title: string;
  comment: string;
  images: string[];
  isVerifiedPurchase: boolean;
  isVisible: boolean;
  isDeleted: boolean;
  status: ReviewStatus;
  reportCount: number;
  reportReasons: string[];
  moderatedBy: string | null;
  moderatedAt: Date | null;
  moderationReason: string | null;
  deletedAt: Date | null;
  deletedBy: string | null;
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

    storeId: {
      type: String,
      default: "",
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

    images: {
      type: [String],
      default: [],
    },

    isVerifiedPurchase: {
      type: Boolean,
      default: false,
    },

    isVisible: {
      type: Boolean,
      default: true,
      index: true,
    },

    isDeleted: {
      type: Boolean,
      default: false,
      index: true,
    },

    status: {
      type: String,
      enum: Object.values(REVIEW_STATUS),
      default: REVIEW_STATUS.APPROVED,
      index: true,
    },

    reportCount: {
      type: Number,
      default: 0,
      min: 0,
      index: true,
    },

    reportReasons: {
      type: [String],
      default: [],
    },

    moderatedBy: {
      type: String,
      default: null,
    },

    moderatedAt: {
      type: Date,
      default: null,
    },

    moderationReason: {
      type: String,
      default: null,
    },

    deletedAt: {
      type: Date,
      default: null,
    },

    deletedBy: {
      type: String,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

reviewSchema.index({ productId: 1, userId: 1 }, { unique: true });
reviewSchema.index({ productId: 1, rating: 1 });
reviewSchema.index({ userId: 1, rating: 1 });
reviewSchema.index({ storeId: 1, status: 1 });
reviewSchema.index({ status: 1, createdAt: -1 });

export const Review = model<IReview>("Review", reviewSchema);

