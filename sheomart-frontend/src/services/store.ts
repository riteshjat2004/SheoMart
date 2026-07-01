import api from "./api";
import type { ApiResponse } from "@/types/api";
import type { StoreItem } from "@/types/marketplace";

export interface GetStoresResponse {
  stores: StoreItem[];
}

function normalizeStore(store: Record<string, unknown>): StoreItem {
  const rawName =
    typeof store.storeName === "string"
      ? store.storeName
      : typeof store.name === "string"
        ? store.name
        : "Store";

  return {
    ...(store as StoreItem),
    storeId: typeof store.storeId === "string" ? store.storeId : typeof store._id === "string" ? store._id : undefined,
    storeName: rawName,
    name: rawName,
    city: typeof store.city === "string" ? store.city : typeof store.address === "string" ? store.address : undefined,
    address: typeof store.address === "string" ? store.address : typeof store.city === "string" ? store.city : undefined,
    rating: typeof store.rating === "number" ? store.rating : undefined,
    status: typeof store.status === "string" ? store.status : undefined,
  };
}

export async function fetchStores() {
  const response = await api.get<ApiResponse<GetStoresResponse>>("/api/v1/stores");
  const stores = Array.isArray(response.data.data?.stores) ? response.data.data.stores : [];

  return stores.map((store) => normalizeStore(store as Record<string, unknown>));
}
