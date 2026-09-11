import { Document, Schema, model } from "mongoose";
import { v4 as uuidv4 } from "uuid";
import { STORE_STATUS, StoreStatus } from "../constants/store";

export enum STORE_BADGE {
  NORMAL = "normal",
  VERIFIED = "verified",
  ROYAL = "royal",
}

export interface IDeliverySlot {
  slotId: string;
  id?: string;
  label: string;
  startTime: string;
  endTime: string;
  capacity?: number;
  isActive: boolean;
  active?: boolean;
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
  badge: STORE_BADGE;
  isVerified: boolean;
  status: StoreStatus;
  approvedAt: Date | null;
  approvedBy: string | null;
  rating: number;
  totalReviews: number;
  pickupOpeningTime: string;
  pickupClosingTime: string;
  pickupEnabled: boolean;
  deliveryEnabled: boolean;
  supportsPickup: boolean;
  supportsDelivery: boolean;
  deliveryFee: number;
  freeDeliveryAbove: number;
  freeDeliveryThreshold?: number;
  deliveryRadiusKm: number;
  preparationTimeMinutes: number;
  pickupInstructions: string;
  pickupAddress: string;
    latitude?: number;
    longitude?: number;
    deliverySlots: IDeliverySlot[];
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

    badge: {
      type: String,
      enum: Object.values(STORE_BADGE),
      default: STORE_BADGE.NORMAL,
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

    pickupEnabled: {
      type: Boolean,
      default: true,
    },

    deliveryEnabled: {
      type: Boolean,
      default: false,
    },

    supportsPickup: {
      type: Boolean,
      default: true,
    },

    supportsDelivery: {
      type: Boolean,
      default: false,
    },

    deliveryFee: {
      type: Number,
      min: 0,
      default: 0,
    },

    freeDeliveryAbove: {
      type: Number,
      min: 0,
      default: 0,
    },
    freeDeliveryThreshold: {
      type: Number,
      min: 0,
    },

    deliveryRadiusKm: {
      type: Number,
      min: 0,
      default: 0,
    },

    preparationTimeMinutes: {
      type: Number,
      min: 0,
      default: 30,
    },
    pickupInstructions: {
      type: String,
      default: "Bring your order ID when collecting your order.",
      trim: true,
      maxlength: 500,
    },
    pickupAddress: {
      type: String,
      default: "",
      trim: true,
      maxlength: 300,
    },
    latitude: { type: Number, min: -90, max: 90 },
    longitude: { type: Number, min: -180, max: 180 },
    deliverySlots: {
      type: [{
        slotId: { type: String, required: true },
        label: { type: String, required: true, trim: true },
        startTime: { type: String, required: true },
        endTime: { type: String, required: true },
        capacity: { type: Number, min: 1 },
        isActive: { type: Boolean, default: true },
      }],
      default: [],
    },
  },
  {
    timestamps: true,
  }
);

export const Store = model<IStore>("Store", storeSchema);
