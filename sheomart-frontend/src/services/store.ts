import api from "./api";
import type { ApiResponse } from "@/types/api";
import type { StoreItem } from "@/types/marketplace";

export interface GetStoresResponse {
  stores: StoreItem[];
}

export interface GetStoreResponse {
  store: StoreItem;
}

export interface CreateStoreApplicationPayload {
  storeName: string;
  description?: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
}

export interface UpdateMyStorePayload {
  description?: string;
  logo?: string;
  banner?: string;
  phone?: string;
  address?: string;
  city?: string;
  state?: string;
  pincode?: string;
  pickupOpeningTime?: string;
  pickupClosingTime?: string;
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
    totalReviews: typeof store.totalReviews === "number" ? store.totalReviews : undefined,
    pickupOpeningTime: typeof store.pickupOpeningTime === "string" ? store.pickupOpeningTime : "10:00",
    pickupClosingTime: typeof store.pickupClosingTime === "string" ? store.pickupClosingTime : "20:00",
    status: typeof store.status === "string" ? store.status : undefined,
  };
}

export interface StoreLocation {
  pincode?: string;
  city?: string;
  state?: string;
}

export async function fetchStores(location?: StoreLocation) {
  const response = await api.get<ApiResponse<GetStoresResponse>>("/api/v1/stores", { params: location });
  const stores = Array.isArray(response.data.data?.stores) ? response.data.data.stores : [];

  return stores.map((store) => normalizeStore(store as Record<string, unknown>));
}

export async function fetchStoreById(storeId: string) {
  const response = await api.get<ApiResponse<GetStoreResponse>>(`/api/v1/stores/${storeId}`);
  const store = response.data.data?.store;

  return store ? normalizeStore(store as Record<string, unknown>) : null;
}

export async function fetchAdminStores() {
  const response = await api.get<ApiResponse<GetStoresResponse>>("/api/v1/stores/admin");
  const stores = Array.isArray(response.data.data?.stores) ? response.data.data.stores : [];

  return stores.map((store) => normalizeStore(store as Record<string, unknown>));
}

export async function createStoreApplication(payload: CreateStoreApplicationPayload) {
  const response = await api.post<ApiResponse<{ store: StoreItem }>>("/api/v1/stores", payload);
  return response.data.data?.store;
}

export async function fetchMyStore() {
  try {
    const response = await api.get<ApiResponse<{ store: StoreItem | null }>>("/api/v1/stores/me");
    return response.data.data?.store ?? null;
  } catch (error) {
    if (error instanceof Error && /404/.test(error.message)) {
      return null;
    }
    throw error;
  }
}

export async function updateMyStore(payload: UpdateMyStorePayload) {
  const response = await api.patch<ApiResponse<{ store: StoreItem }>>("/api/v1/stores/me", payload);
  const store = response.data.data?.store;

  return store ? normalizeStore(store as Record<string, unknown>) : null;
}
