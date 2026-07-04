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
