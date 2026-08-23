import { Document, Schema, model } from "mongoose";
import { v4 as uuidv4 } from "uuid";
import {
  INVENTORY_MOVEMENT_TYPE,
  REFERENCE_TYPE,
  type InventoryLedgerData,
} from "../types/billing";

export interface IInventoryLedger extends Document, InventoryLedgerData {
  ledgerId: string;
  createdAt: Date;
}

const inventoryLedgerSchema = new Schema<IInventoryLedger>(
  {
    ledgerId: {
      type: String,
      default: () => uuidv4(),
      unique: true,
      immutable: true,
    },
    storeId: { type: String, required: true, index: true },
    productId: { type: String, required: true, index: true },
    movementType: {
      type: String,
      required: true,
      enum: Object.values(INVENTORY_MOVEMENT_TYPE),
      index: true,
    },
    source: { type: String, enum: ["ONLINE_ORDER", "ORDER_CANCELLED_RESTORE"] },
    referenceType: { type: String, required: true, enum: Object.values(REFERENCE_TYPE) },
    referenceId: { type: String, required: true },
    quantityChange: { type: Number, required: true },
    previousQuantity: { type: Number, required: true, min: 0 },
    newQuantity: { type: Number, required: true, min: 0 },
    performedBy: { type: String, required: true },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

inventoryLedgerSchema.index({ storeId: 1, createdAt: -1 });
inventoryLedgerSchema.index({ productId: 1, createdAt: -1 });

export const InventoryLedger = model<IInventoryLedger>("InventoryLedger", inventoryLedgerSchema);
