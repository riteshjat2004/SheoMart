import api from "./api";
import type { ApiResponse } from "@/types/api";
import type { InventoryItem } from "@/types/inventory";

export interface InventoryResponse {
  inventory: InventoryItem;
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
