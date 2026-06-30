import { Schema, model, Document } from "mongoose";
import { v4 as uuidv4 } from "uuid";
import validator from "validator";

export type UserRole =
  | "customer"
  | "store_owner"
  | "platform_admin";

export interface IUser extends Document {
  userId: string;
  name: string;
  email: string;
  mobile: string;
  password: string;
  role: UserRole;
  isCreditApproved: boolean;
  emailVerified: boolean;
  phoneVerified: boolean;
  isActive: boolean;
  refreshToken?: string;
  createdAt: Date;
  updatedAt: Date;
}

const userSchema = new Schema<IUser>(
  {
    userId: {
      type: String,
      default: () => uuidv4(),
      unique: true,
      immutable: true,
    },

    name: {
      type: String,
      required: true,
      trim: true,
      minlength: 2,
      maxlength: 100,
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      validate: [validator.isEmail, "Invalid email"],
    },

    mobile: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },

    password: {
      type: String,
      required: true,
      minlength: 8,
      select: false,
    },

    role: {
      type: String,
      enum: ["customer", "store_owner", "platform_admin"],
      default: "customer",
    },

    isCreditApproved: {
      type: Boolean,
      default: false,
    },

    emailVerified: {
      type: Boolean,
      default: false,
    },

    phoneVerified: {
      type: Boolean,
      default: false,
    },

    isActive: {
      type: Boolean,
      default: true,
    },

    refreshToken: {
      type: String,
      default: null,
      select: false,
    },
  },
  {
    timestamps: true,
  }
);

export const User = model<IUser>("User", userSchema);