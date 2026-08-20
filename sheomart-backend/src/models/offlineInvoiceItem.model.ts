import { Document, Schema, model } from "mongoose";
import { v4 as uuidv4 } from "uuid";
import type { OfflineInvoiceItemData } from "../types/billing";

export interface IOfflineInvoiceItem extends Document, OfflineInvoiceItemData {
  invoiceItemId: string;
  createdAt: Date;
  updatedAt: Date;
}

const offlineInvoiceItemSchema = new Schema<IOfflineInvoiceItem>(
  {
    invoiceItemId: {
      type: String,
      default: () => uuidv4(),
      unique: true,
      immutable: true,
    },
    invoiceId: { type: String, required: true, index: true },
    productId: { type: String, required: true, index: true },
    productNameSnapshot: { type: String, required: true, trim: true },
    skuSnapshot: { type: String, required: true, trim: true },
    categorySnapshot: { type: String, required: true, trim: true },
    priceSnapshot: { type: Number, required: true, min: 0 },
    discountSnapshot: { type: Number, required: true, min: 0 },
    quantity: { type: Number, required: true, min: 1 },
    subtotal: { type: Number, required: true, min: 0 },
  },
  { timestamps: true }
);

export const OfflineInvoiceItem = model<IOfflineInvoiceItem>(
  "OfflineInvoiceItem",
  offlineInvoiceItemSchema
);
