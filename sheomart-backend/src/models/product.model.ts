import { Document, Schema, model } from "mongoose";
import { v4 as uuidv4 } from "uuid";

export interface IProductVariant {
  variantId: string;
  label: string; // e.g. "250 gm", "500 gm", "1 kg", "500 ml", "1 L"
  unit: string; // "gm", "kg", "ml", "L", "piece", "pack", "dozen"
  value: number; // e.g. 250, 500, 1
  price: number;
  discountPrice?: number;
  sku?: string;
  stock?: number;
  packQuantity?: number;
}

export interface INutritionalInfo {
  servingSize?: string;
  energy?: string;
  protein?: string;
  carbs?: string;
  fats?: string;
}

export interface IProduct extends Document {
  productId: string;
  sourceProductId?: string | null;
  storeId: string;
  storeName?: string;
  storePincode?: string;
  categoryId: string;
  name: string;
  slug: string;
  description: string;
  brand: string;
  sku: string;
  price: number;
  discountPrice: number;
  quantity: number;
  sellingType: "PIECE" | "WEIGHT" | "VOLUME";
  baseUnit: string;
  unitLabel: string;
  minQuantity: number;
  stepQuantity: number;
  allowCustomQuantity: boolean;
  stockTrackingMode: "SEPARATE" | "SHARED";
  hasNutritionalInfo: boolean;
  nutritionalInfo?: INutritionalInfo | null;
  variants: IProductVariant[];
  images: string[];
  image?: {
    url: string;
    publicId: string;
  } | null;
  thumbnail: string;
  isPublished: boolean;
  isActive: boolean;
  isDeleted: boolean;
  isFeatured: boolean;
  featuredPriority: number;
  featuredAt: Date | null;
  isBestseller: boolean;
  isTrending: boolean;
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

    sourceProductId: {
      type: String,
      default: null,
      index: true,
    },

    storeId: {
      type: String,
      required: true,
      index: true,
    },

    storeName: {
      type: String,
      default: "",
      trim: true,
    },

    storePincode: {
      type: String,
      default: "",
      trim: true,
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

    sellingType: {
      type: String,
      enum: ["PIECE", "WEIGHT", "VOLUME"],
      default: "PIECE",
      index: true,
    },

    baseUnit: {
      type: String,
      default: "piece",
      trim: true,
    },

    unitLabel: {
      type: String,
      default: "piece",
      trim: true,
    },

    minQuantity: {
      type: Number,
      default: 1,
      min: 0.01,
    },

    stepQuantity: {
      type: Number,
      default: 1,
      min: 0.01,
    },

    allowCustomQuantity: {
      type: Boolean,
      default: false,
    },

    stockTrackingMode: {
      type: String,
      enum: ["SEPARATE", "SHARED"],
      default: "SEPARATE",
    },

    hasNutritionalInfo: {
      type: Boolean,
      default: false,
    },

    nutritionalInfo: {
      _id: false,
      servingSize: { type: String, default: "Approx per 100g", trim: true },
      energy: { type: String, default: "", trim: true },
      protein: { type: String, default: "", trim: true },
      carbs: { type: String, default: "", trim: true },
      fats: { type: String, default: "", trim: true },
    },

    variants: [
      {
        _id: false,
        variantId: {
          type: String,
          default: () => uuidv4(),
        },
        label: {
          type: String,
          required: true,
          trim: true,
        },
        unit: {
          type: String,
          required: true,
          trim: true,
        },
        value: {
          type: Number,
          required: true,
          min: 0,
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
        sku: {
          type: String,
          trim: true,
        },
        stock: {
          type: Number,
          default: 0,
        },
        packQuantity: {
          type: Number,
          default: 1,
          min: 0.01,
        },
      },
    ],

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

    isDeleted: {
      type: Boolean,
      default: false,
      index: true,
    },

    isFeatured: {
      type: Boolean,
      default: false,
      index: true,
    },

    featuredPriority: {
      type: Number,
      default: 0,
      index: true,
    },

    featuredAt: {
      type: Date,
      default: null,
    },

    isBestseller: {
      type: Boolean,
      default: false,
    },

    isTrending: {
      type: Boolean,
      default: false,
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
