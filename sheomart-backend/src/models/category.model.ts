import { Document, Schema, model } from "mongoose";
import { v4 as uuidv4 } from "uuid";

export interface ICategory extends Document {
  categoryId: string;
  name: string;
  slug: string;
  description: string;
  image: string | CategoryImage;
  parentCategory: string | null;
  isActive: boolean;
  sortOrder: number;
  createdBy: string | null;
  updatedBy: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface CategoryImage {
  url: string;
  publicId: string;
}

const categorySchema = new Schema<ICategory>(
  {
    categoryId: {
      type: String,
      default: () => uuidv4(),
      unique: true,
      immutable: true,
    },

    name: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      minlength: 2,
      maxlength: 100,
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

    image: {
      type: Schema.Types.Mixed,
      default: "",
    },

    parentCategory: {
      type: String,
      default: null,
    },

    isActive: {
      type: Boolean,
      default: true,
    },

    sortOrder: {
      type: Number,
      default: 0,
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

export const Category = model<ICategory>("Category", categorySchema);
