import { Document, Schema, model } from "mongoose";
import { v4 as uuidv4 } from "uuid";
import { STORE_STATUS, StoreStatus } from "../constants/store";

export enum STORE_BADGE {
  VERIFIED = "verified",
  ROYAL = "royal",
}

export interface IStore extends Document {
  storeId: string;
  ownerId: string;
  storeName: string;
  slug: string;
  description: string;
  logo: string;
  banner: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  badges: STORE_BADGE[];
  isVerified: boolean;
  status: StoreStatus;
  approvedAt: Date | null;
  approvedBy: string | null;
  rating: number;
  totalReviews: number;
  pickupOpeningTime: string;
  pickupClosingTime: string;
  createdAt: Date;
  updatedAt: Date;
}

const storeSchema = new Schema<IStore>(
  {
    storeId: {
      type: String,
      default: () => uuidv4(),
      unique: true,
      immutable: true,
    },

    ownerId: {
      type: String,
      required: true,
      index: true,
      ref: "User",
    },

    storeName: {
      type: String,
      required: true,
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

    logo: {
      type: String,
      default: "",
    },

    banner: {
      type: String,
      default: "",
    },

    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
    },

    phone: {
      type: String,
      required: true,
      trim: true,
    },

    address: {
      type: String,
      default: "",
      trim: true,
    },

    city: {
      type: String,
      default: "",
      trim: true,
    },

    state: {
      type: String,
      default: "",
      trim: true,
    },

    pincode: {
      type: String,
      default: "",
      trim: true,
    },

    badges: {
      type: [String],
      enum: Object.values(STORE_BADGE),
      default: [],
    },

    isVerified: {
      type: Boolean,
      default: false,
    },

    status: {
      type: String,
      enum: Object.values(STORE_STATUS),
      default: STORE_STATUS.PENDING,
    },

    approvedAt: {
      type: Date,
      default: null,
    },

    approvedBy: {
      type: String,
      default: null,
    },

    rating: {
      type: Number,
      default: 0,
    },

    totalReviews: {
      type: Number,
      default: 0,
    },

    pickupOpeningTime: {
      type: String,
      default: "10:00",
    },

    pickupClosingTime: {
      type: String,
      default: "20:00",
    },
  },
  {
    timestamps: true,
  }
);

export const Store = model<IStore>("Store", storeSchema);
