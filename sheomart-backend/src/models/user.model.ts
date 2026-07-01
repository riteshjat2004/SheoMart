import { Schema, model, Document } from "mongoose";
import { v4 as uuidv4 } from "uuid";
import validator from "validator";
import { USER_ROLES, UserRole } from "../constants/roles";

export interface IUserSession {
  sessionId: string;
  refreshToken: string;
  userAgent: string;
  ipAddress: string;
  createdAt: Date;
  lastUsedAt: Date;
}

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
  avatar: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  // refreshToken?: string;
  sessions: IUserSession[];
  createdAt: Date;
  updatedAt: Date;
}


const sessionSchema = new Schema<IUserSession>(
  {
    sessionId: {
      type: String,
      required: true,
    },

    refreshToken: {
      type: String,
      required: true,
      select: false,
    },

    userAgent: {
      type: String,
      default: "",
    },

    ipAddress: {
      type: String,
      default: "",
    },

    createdAt: {
      type: Date,
      default: Date.now,
    },

    lastUsedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    _id: false,
  }
);

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
      enum: Object.values(USER_ROLES),
      default: USER_ROLES.CUSTOMER,
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

    avatar: {
      type: String,
      default: "",
    },

    address: {
      type: String,
      default: "",
    },

    city: {
      type: String,
      default: "",
    },

    state: {
      type: String,
      default: "",
    },

    pincode: {
      type: String,
      default: "",
    },

    sessions: {
      type: [sessionSchema],
      default: [],
    },
  },
  {
    timestamps: true,
  }
);

export const User = model<IUser>("User", userSchema);