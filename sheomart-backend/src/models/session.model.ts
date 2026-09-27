import { Document, Schema, model } from "mongoose";
import { v4 as uuidv4 } from "uuid";

export interface ISession extends Document {
  sessionId: string;
  userId: string;
  familyId: string;
  refreshTokenHash: string;
  device: string; // "Desktop" | "Mobile" | "Tablet"
  browser: string;
  os: string;
  ip: string;
  userAgent: string;
  isRevoked: boolean;
  revokedAt: Date | null;
  revokedReason: string | null;
  expiresAt: Date;
  lastUsedAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

const sessionSchema = new Schema<ISession>(
  {
    sessionId: {
      type: String,
      default: () => uuidv4(),
      unique: true,
    },
    userId: {
      type: String,
      required: true,
      index: true,
    },
    familyId: {
      type: String,
      required: true,
      index: true,
    },
    refreshTokenHash: {
      type: String,
      required: true,
      select: false,
    },
    device: {
      type: String,
      default: "Desktop",
    },
    browser: {
      type: String,
      default: "Unknown Browser",
    },
    os: {
      type: String,
      default: "Unknown OS",
    },
    ip: {
      type: String,
      default: "127.0.0.1",
    },
    userAgent: {
      type: String,
      default: "",
    },
    isRevoked: {
      type: Boolean,
      default: false,
      index: true,
    },
    revokedAt: {
      type: Date,
      default: null,
    },
    revokedReason: {
      type: String,
      default: null,
    },
    expiresAt: {
      type: Date,
      required: true,
    },
    lastUsedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

// Compound indexes for optimal query performance
sessionSchema.index({ userId: 1, isRevoked: 1 });
sessionSchema.index({ familyId: 1, isRevoked: 1 });
sessionSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 }); // Automatic MongoDB TTL cleanup of expired sessions

export const Session = model<ISession>("Session", sessionSchema);
