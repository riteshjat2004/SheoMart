import { create } from "zustand";
import type { AddCartItemPayload } from "@/services/cart";

export interface CartConflictData {
  existingStoreName: string;
  newStoreName: string;
  payload: AddCartItemPayload;
  onSuccess?: () => void;
}

interface CartConflictStoreState {
  conflict: CartConflictData | null;
  openConflict: (data: CartConflictData) => void;
  closeConflict: () => void;
}

export const useCartConflictStore = create<CartConflictStoreState>((set) => ({
  conflict: null,
  openConflict: (data: CartConflictData) => set({ conflict: data }),
  closeConflict: () => set({ conflict: null }),
}));
