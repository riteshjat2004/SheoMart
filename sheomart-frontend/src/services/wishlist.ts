import api from "./api";
import type { ApiResponse } from "@/types/api";
import type { WishlistItem } from "@/types/marketplace";

export interface WishlistResponse {
  wishlist: WishlistItem[];
}

export interface AddWishlistItemPayload {
  productId: string;
}

export async function fetchWishlist() {
  const response = await api.get<ApiResponse<WishlistResponse>>("/api/v1/wishlist");
  return response.data.data?.wishlist ?? [];
}

export async function addWishlistItem(payload: AddWishlistItemPayload) {
  const response = await api.post<ApiResponse<{ wishlistItem: WishlistItem }>>( "/api/v1/wishlist", payload);
  return response.data.data?.wishlistItem;
}

export async function removeWishlistItem(wishlistItemId: string) {
  const response = await api.delete<ApiResponse<{ wishlistItem: WishlistItem }>>(`/api/v1/wishlist/${wishlistItemId}`);
  return response.data.data?.wishlistItem;
}
