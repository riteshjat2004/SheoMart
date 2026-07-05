import api from "./api";
import type { ApiResponse } from "@/types/api";
import type { CartItem, ProductItem } from "@/types/marketplace";

export interface CartSummary {
  totalItems: number;
  subtotal: number;
  totalProducts: number;
  estimatedSavings: number;
  hasUnavailableItems: boolean;
}

export interface CartResponse {
  cartItems: CartItem[];
  summary: CartSummary;
}

export interface AddCartItemPayload {
  productId: string;
  quantity?: number;
}

function extractCartItem(payload: unknown): CartItem | undefined {
  if (!payload || typeof payload !== "object") {
    return undefined;
  }

  const record = payload as Record<string, unknown>;

  if (record.cartItem && typeof record.cartItem === "object") {
    const nested = record.cartItem as Record<string, unknown>;
    if (nested.cartItem && typeof nested.cartItem === "object") {
      return nested.cartItem as CartItem;
    }

    if (nested.product && typeof nested.product === "object") {
      return nested as unknown as CartItem;
    }
  }

  if (record.product && typeof record.product === "object") {
    return record as unknown as CartItem;
  }

  return undefined;
}

export async function fetchCart() {
  const response = await api.get<ApiResponse<{ cart: CartResponse }>>(
    "/api/v1/cart"
  );

  return (
    response.data.data?.cart ?? {
      cartItems: [],
      summary: {
        totalItems: 0,
        subtotal: 0,
        totalProducts: 0,
        estimatedSavings: 0,
        hasUnavailableItems: false,
      },
    }
  );
}

export async function addCartItem(payload: AddCartItemPayload) {
  const response = await api.post<ApiResponse<{ cartItem: unknown }>>("/api/v1/cart", payload);
  return extractCartItem(response.data.data?.cartItem);
}

export async function updateCartItem(cartItemId: string, payload: { quantity: number }) {
  const response = await api.patch<ApiResponse<{ cartItem: unknown }>>(`/api/v1/cart/${cartItemId}`, payload);
  return extractCartItem(response.data.data?.cartItem);
}

export async function removeCartItem(cartItemId: string) {
  const response = await api.delete<ApiResponse<{ cartItem: unknown }>>(`/api/v1/cart/${cartItemId}`);
  return extractCartItem(response.data.data?.cartItem);
}

export async function clearCart() {
  const response = await api.delete<ApiResponse<{}>>("/api/v1/cart");
  return response.data.data;
}
