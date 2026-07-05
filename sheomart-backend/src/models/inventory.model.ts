import { Document, Schema, model } from "mongoose";
import { v4 as uuidv4 } from "uuid";

export const INVENTORY_STATUS = {
  IN_STOCK: "in_stock",
  LOW_STOCK: "low_stock",
  OUT_OF_STOCK: "out_of_stock",
  DISCONTINUED: "discontinued",
} as const;

export interface IInventory extends Document {
  inventoryId: string;
  productId: string;
  availableQuantity: number;
  reservedQuantity: number;
  soldQuantity: number;
  lowStockThreshold: number;
  status: string;
  createdBy: string | null;
  updatedBy: string | null;
  createdAt: Date;
  updatedAt: Date;
}

const inventorySchema = new Schema<IInventory>(
  {
    inventoryId: {
      type: String,
      default: () => uuidv4(),
      unique: true,
      immutable: true,
    },

    productId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },

    // Inventory.availableQuantity is the canonical stock source for store inventory updates.
    availableQuantity: {
      type: Number,
      default: 0,
      min: 0,
    },

    reservedQuantity: {
      type: Number,
      default: 0,
      min: 0,
    },

    soldQuantity: {
      type: Number,
      default: 0,
      min: 0,
    },

    lowStockThreshold: {
      type: Number,
      default: 5,
      min: 0,
    },

    status: {
      type: String,
      default: INVENTORY_STATUS.IN_STOCK,
      enum: Object.values(INVENTORY_STATUS),
    },

    createdBy: {
      type: String,
      default: null,
    },

    updatedBy: {
      type: String,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

export const Inventory = model<IInventory>("Inventory", inventorySchema);
