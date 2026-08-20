import { Document, Schema, model } from "mongoose";
import { v4 as uuidv4 } from "uuid";
import type { StoreCustomerData } from "../types/billing";

export interface IStoreCustomer extends Document, StoreCustomerData {
  storeCustomerId: string;
  createdAt: Date;
  updatedAt: Date;
}

const storeCustomerSchema = new Schema<IStoreCustomer>(
  {
    storeCustomerId: {
      type: String,
      default: () => uuidv4(),
      unique: true,
      immutable: true,
    },
    storeId: { type: String, required: true },
    customerId: { type: String, required: true },
    isPlusCustomer: { type: Boolean, required: true, default: false },
    joinedAt: { type: Date, required: true, default: Date.now },
    totalOfflinePurchases: { type: Number, required: true, min: 0, default: 0 },
    totalOnlinePurchases: { type: Number, required: true, min: 0, default: 0 },
    lastPurchaseAt: { type: Date, default: null },
  },
  { timestamps: true }
);

storeCustomerSchema.index({ storeId: 1, customerId: 1 }, { unique: true });
storeCustomerSchema.index({ storeId: 1, isPlusCustomer: 1 });

export const StoreCustomer = model<IStoreCustomer>("StoreCustomer", storeCustomerSchema);
