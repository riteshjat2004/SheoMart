import { Document, Schema, model } from "mongoose";

export type PlatformFeeType = "FIXED" | "PERCENTAGE";

export interface IPlatformFeeConfig extends Document {
  amount: number;
  feeType: PlatformFeeType;
  minimumOrderAmount?: number;
  maximumPlatformFee?: number;
  enabled: boolean;
  updatedBy?: string;
  createdAt: Date;
  updatedAt: Date;
}

const platformFeeConfigSchema = new Schema<IPlatformFeeConfig>({
  amount: { type: Number, min: 0, default: 10 },
  feeType: { type: String, enum: ["FIXED", "PERCENTAGE"], default: "FIXED" },
  minimumOrderAmount: { type: Number, min: 0, default: 0 },
  maximumPlatformFee: { type: Number, min: 0 },
  enabled: { type: Boolean, default: true },
  updatedBy: { type: String, default: "" },
}, { timestamps: true });

export const PlatformFeeConfig = model<IPlatformFeeConfig>("PlatformFeeConfig", platformFeeConfigSchema);
