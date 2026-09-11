import api from "./api";
import type { ApiResponse } from "@/types/api";
import type { StoreBadge, StoreItem } from "@/types/marketplace";

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
  pickupEnabled?: boolean;
  deliveryEnabled?: boolean;
  supportsPickup?: boolean;
  supportsDelivery?: boolean;
  deliveryFee?: number;
  freeDeliveryAbove?: number;
  freeDeliveryThreshold?: number;
  deliveryRadiusKm?: number;
  preparationTimeMinutes?: number;
  pickupInstructions?: string;
  pickupAddress?: string;
  latitude?: number;
  longitude?: number;
  deliverySlots?: DeliverySlot[];
}

export interface DeliverySlot {
  slotId: string;
  id?: string;
  label: string;
  startTime: string;
  endTime: string;
  capacity?: number;
  remainingCapacity?: number;
  isActive: boolean;
  active?: boolean;
}

function normalizeStore(store: Record<string, unknown>): StoreItem {
  const rawName =
    typeof store.storeName === "string"
      ? store.storeName
      : typeof store.name === "string"
        ? store.name
        : "Store";

  const badge = store.badge === "verified" || store.badge === "royal" ? store.badge : "normal";

  return {
    ...(store as unknown as Partial<StoreItem>),
    storeId: typeof store.storeId === "string" ? store.storeId : typeof store._id === "string" ? store._id : undefined,
    storeName: rawName,
    name: rawName,
    city: typeof store.city === "string" ? store.city : typeof store.address === "string" ? store.address : undefined,
    address: typeof store.address === "string" ? store.address : typeof store.city === "string" ? store.city : undefined,
    rating: typeof store.rating === "number" ? store.rating : undefined,
    totalReviews: typeof store.totalReviews === "number" ? store.totalReviews : undefined,
    pickupOpeningTime: typeof store.pickupOpeningTime === "string" ? store.pickupOpeningTime : undefined,
    pickupClosingTime: typeof store.pickupClosingTime === "string" ? store.pickupClosingTime : undefined,
    pickupEnabled: typeof store.pickupEnabled === "boolean" ? store.pickupEnabled : undefined,
    deliveryEnabled: typeof store.deliveryEnabled === "boolean" ? store.deliveryEnabled : undefined,
    supportsPickup: typeof store.supportsPickup === "boolean" ? store.supportsPickup : typeof store.pickupEnabled === "boolean" ? store.pickupEnabled : undefined,
    supportsDelivery: typeof store.supportsDelivery === "boolean" ? store.supportsDelivery : typeof store.deliveryEnabled === "boolean" ? store.deliveryEnabled : undefined,
    deliveryFee: typeof store.deliveryFee === "number" ? store.deliveryFee : undefined,
    freeDeliveryAbove: typeof store.freeDeliveryAbove === "number" ? store.freeDeliveryAbove : typeof store.freeDeliveryThreshold === "number" ? store.freeDeliveryThreshold : undefined,
    freeDeliveryThreshold: typeof store.freeDeliveryThreshold === "number" ? store.freeDeliveryThreshold : typeof store.freeDeliveryAbove === "number" ? store.freeDeliveryAbove : undefined,
    deliveryRadiusKm: typeof store.deliveryRadiusKm === "number" ? store.deliveryRadiusKm : undefined,
    preparationTimeMinutes: typeof store.preparationTimeMinutes === "number" ? store.preparationTimeMinutes : undefined,
    pickupInstructions: typeof store.pickupInstructions === "string" ? store.pickupInstructions : undefined,
    pickupAddress: typeof store.pickupAddress === "string" ? store.pickupAddress : undefined,
    latitude: typeof store.latitude === "number" ? store.latitude : undefined,
    longitude: typeof store.longitude === "number" ? store.longitude : undefined,
    deliverySlots: Array.isArray(store.deliverySlots) ? store.deliverySlots.map((slot) => { const value = slot as Record<string, unknown>; const id = typeof value.id === "string" ? value.id : typeof value.slotId === "string" ? value.slotId : ""; const active = typeof value.active === "boolean" ? value.active : value.isActive === true; return { slotId: id, id, label: typeof value.label === "string" ? value.label : "", startTime: typeof value.startTime === "string" ? value.startTime : "", endTime: typeof value.endTime === "string" ? value.endTime : "", capacity: typeof value.capacity === "number" ? value.capacity : undefined, remainingCapacity: typeof value.remainingCapacity === "number" ? value.remainingCapacity : undefined, isActive: active, active }; }) : [],
    badge,
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

  return stores.map((store) => normalizeStore(store as unknown as Record<string, unknown>));
}

export async function fetchStoreById(storeId: string) {
  const response = await api.get<ApiResponse<GetStoreResponse>>(`/api/v1/stores/${storeId}`);
  const store = response.data.data?.store;

  return store ? normalizeStore(store as unknown as Record<string, unknown>) : null;
}

export async function fetchAdminStores() {
  const response = await api.get<ApiResponse<GetStoresResponse>>("/api/v1/stores/admin");
  const stores = Array.isArray(response.data.data?.stores) ? response.data.data.stores : [];

  return stores.map((store) => normalizeStore(store as unknown as Record<string, unknown>));
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

  return store ? normalizeStore(store as unknown as Record<string, unknown>) : null;
}

export async function updateStoreBadge(storeId: string, badge: StoreBadge) {
  const response = await api.patch<ApiResponse<{ store: StoreItem }>>(`/api/v1/stores/${storeId}/badge`, { badge });
  const store = response.data.data?.store;

  return store ? normalizeStore(store as unknown as Record<string, unknown>) : null;
}
