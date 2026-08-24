import { Document, Schema, model } from "mongoose";
import { v4 as uuidv4 } from "uuid";

export interface IProduct extends Document {
  productId: string;
  storeId: string;
  categoryId: string;
  name: string;
  slug: string;
  description: string;
  brand: string;
  sku: string;
  price: number;
  discountPrice: number;
  quantity: number;
  images: string[];
  image?: {
    url: string;
    publicId: string;
  } | null;
  thumbnail: string;
  isPublished: boolean;
  isActive: boolean;
  rating: number;
  totalReviews: number;
  createdBy: string | null;
  updatedBy: string | null;
  createdAt: Date;
  updatedAt: Date;
}

const productSchema = new Schema<IProduct>(
  {
    productId: {
      type: String,
      default: () => uuidv4(),
      unique: true,
      immutable: true,
    },

    storeId: {
      type: String,
      required: true,
      index: true,
    },

    categoryId: {
      type: String,
      required: true,
      index: true,
    },

    name: {
      type: String,
      required: true,
      trim: true,
      minlength: 2,
      maxlength: 120,
    },

    slug: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },

    description: {
      type: String,
      default: "",
      trim: true,
    },

    brand: {
      type: String,
      default: "",
      trim: true,
    },

    sku: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      uppercase: true,
    },

    price: {
      type: Number,
      required: true,
      min: 0,
    },

    discountPrice: {
      type: Number,
      default: 0,
      min: 0,
    },

    // Product quantity is mirrored from inventory.availableQuantity for marketplace APIs.
    quantity: {
      type: Number,
      default: 0,
      min: 0,
    },

    images: {
      type: [String],
      default: [],
      validate: {
        validator: (value: string[]) => value.length <= 10,
        message: "Maximum 10 images allowed per product",
      },
    },

    image: {
      url: { type: String, trim: true },
      publicId: { type: String, trim: true },
    },

    thumbnail: {
      type: String,
      default: "",
      trim: true,
    },

    isPublished: {
      type: Boolean,
      default: false,
    },

    isActive: {
      type: Boolean,
      default: true,
    },

    rating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5,
    },

    totalReviews: {
      type: Number,
      default: 0,
      min: 0,
    },

    createdBy: {
      type: String,
      default: null,
    },

    updatedBy: {
      type: String,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

export const Product = model<IProduct>("Product", productSchema);
