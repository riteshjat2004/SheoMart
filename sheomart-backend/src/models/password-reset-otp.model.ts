import { Schema, model, Document } from "mongoose";

export interface IPasswordResetOtp extends Document {
  customerId: string;
  email: string;
  otpHash: string;
  expiresAt: Date;
  attemptCount: number;
  used: boolean;
  resetTokenHash?: string;
  resetTokenExpiresAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const passwordResetOtpSchema = new Schema<IPasswordResetOtp>(
  {
    customerId: { type: String, required: true, index: true },
    email: { type: String, required: true, lowercase: true, trim: true, index: true },
    otpHash: { type: String, required: true, select: false },
    expiresAt: { type: Date, required: true },
    attemptCount: { type: Number, required: true, default: 0 },
    used: { type: Boolean, required: true, default: false, index: true },
    resetTokenHash: { type: String, select: false },
    resetTokenExpiresAt: { type: Date },
  },
  { timestamps: true },
);

passwordResetOtpSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });
passwordResetOtpSchema.index({ email: 1, createdAt: -1 });

export const PasswordResetOtp = model<IPasswordResetOtp>("PasswordResetOtp", passwordResetOtpSchema);
