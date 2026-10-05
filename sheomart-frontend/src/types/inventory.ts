import type { ProductVariant } from "./marketplace";

export interface InventoryItem {
  inventoryId?: string;
  productId?: string;
  availableQuantity?: number;
  reservedQuantity?: number;
  soldQuantity?: number;
  lowStockThreshold?: number;
  status?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface UpdateInventoryPayload extends Partial<InventoryItem> {
  note?: string;
  variants?: ProductVariant[];
  variantStocks?: {
    variantId?: string;
    label?: string;
    stock: number;
  }[];
}

