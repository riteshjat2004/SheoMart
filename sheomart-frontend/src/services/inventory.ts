import api from "./api";
import type { ApiResponse } from "@/types/api";
import type { InventoryItem } from "@/types/inventory";

export interface InventoryResponse {
  inventory: InventoryItem;
}

export interface InventorySyncResponse {
  inventories: InventoryItem[];
}

export async function syncStoreInventory() {
  const response = await api.get<ApiResponse<InventorySyncResponse>>("/api/v1/inventory/sync");
  return response.data.data?.inventories ?? [];
}

export interface InventoryLedgerEntry {
  ledgerId?: string;
  createdAt?: string;
  movementType?: string;
  quantityChange?: number;
  previousQuantity?: number;
  newQuantity?: number;
  referenceType?: string;
  referenceId?: string;
}

export async function fetchInventory(productId: string) {
  const response = await api.get<ApiResponse<InventoryResponse>>(`/api/v1/inventory/${productId}`);
  return response.data.data?.inventory ?? null;
}

export async function updateInventory(productId: string, payload: Partial<InventoryItem>) {
  const response = await api.patch<ApiResponse<InventoryResponse>>(`/api/v1/inventory/${productId}`, payload);
  return response.data.data?.inventory ?? null;
}

export async function updateInventoryStatus(productId: string, status: string) {
  const response = await api.patch<ApiResponse<InventoryResponse>>(`/api/v1/inventory/${productId}/status`, { status });
  return response.data.data?.inventory ?? null;
}

export async function fetchInventoryLedger(productId: string): Promise<InventoryLedgerEntry[]> {
  const response = await api.get<ApiResponse<{ ledger?: InventoryLedgerEntry[]; entries?: InventoryLedgerEntry[] } | InventoryLedgerEntry[]>>(`/api/v1/inventory/${encodeURIComponent(productId)}/ledger`);
  const data = response.data.data;
  return Array.isArray(data) ? data : data?.ledger ?? data?.entries ?? [];
}
