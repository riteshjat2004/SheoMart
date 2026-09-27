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
  isVerifiedCustomer: boolean;
  verifiedAt: Date | null;
  verifiedBy: string | null;
  isSuspended: boolean;
  suspendedReason: string | null;
  suspendedAt: Date | null;
  suspendedBy: string | null;
  isDeleted: boolean;
  deletedAt: Date | null;
  deletedBy: string | null;
  avatar: string;
  address: string;
  city: string;
  district: string;
  state: string;
  pincode: string;
  gender: string;
  dob: Date | null;
  lastLoginAt: Date | null;
  failedLoginAttempts: number;
  lockUntil: Date | null;
  tokenVersion: number;
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
      index: true,
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
      index: true,
    },

    isVerifiedCustomer: {
      type: Boolean,
      default: false,
      index: true,
    },

    verifiedAt: {
      type: Date,
      default: null,
    },

    verifiedBy: {
      type: String,
      default: null,
    },

    isSuspended: {
      type: Boolean,
      default: false,
      index: true,
    },

    suspendedReason: {
      type: String,
      default: null,
    },

    suspendedAt: {
      type: Date,
      default: null,
    },

    suspendedBy: {
      type: String,
      default: null,
    },

    isDeleted: {
      type: Boolean,
      default: false,
      index: true,
    },

    deletedAt: {
      type: Date,
      default: null,
    },

    deletedBy: {
      type: String,
      default: null,
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

    district: {
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

    gender: {
      type: String,
      default: "",
    },

    dob: {
      type: Date,
      default: null,
    },

    lastLoginAt: {
      type: Date,
      default: null,
    },

    failedLoginAttempts: {
      type: Number,
      default: 0,
    },

    lockUntil: {
      type: Date,
      default: null,
    },

    tokenVersion: {
      type: Number,
      default: 0,
      index: true,
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