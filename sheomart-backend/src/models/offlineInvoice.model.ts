import { Document, Schema, model } from "mongoose";
import { v4 as uuidv4 } from "uuid";
import {
  INVOICE_STATUS,
  PAYMENT_METHOD,
  PAYMENT_STATUS,
  type OfflineInvoiceData,
} from "../types/billing";

export interface IOfflineInvoice extends Document, OfflineInvoiceData {
  invoiceId: string;
  createdAt: Date;
  updatedAt: Date;
}

const offlineInvoiceSchema = new Schema<IOfflineInvoice>(
  {
    invoiceId: {
      type: String,
      default: () => uuidv4(),
      unique: true,
      immutable: true,
    },
    invoiceNumber: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    storeId: { type: String, required: true, index: true },
    customerId: { type: String, default: null },
    walkInCustomerName: { type: String, trim: true },
    walkInCustomerPhone: { type: String, trim: true },
    paymentMethod: { type: String, required: true, enum: Object.values(PAYMENT_METHOD) },
    paymentStatus: { type: String, required: true, enum: Object.values(PAYMENT_STATUS) },
    subtotal: { type: Number, required: true, min: 0 },
    discountAmount: { type: Number, required: true, min: 0 },
    grandTotal: { type: Number, required: true, min: 0 },
    amountPaid: { type: Number, required: true, min: 0 },
    remainingAmount: { type: Number, required: true, min: 0 },
    totalItems: { type: Number, required: true, min: 0 },
    notes: { type: String, trim: true },
    status: { type: String, required: true, enum: Object.values(INVOICE_STATUS) },
    createdBy: { type: String, required: true },
    cancelledAt: { type: Date, default: null },
  },
  { timestamps: true }
);

offlineInvoiceSchema.index({ storeId: 1, createdAt: -1 });
offlineInvoiceSchema.index({ customerId: 1, createdAt: -1 });

export const OfflineInvoice = model<IOfflineInvoice>("OfflineInvoice", offlineInvoiceSchema);
