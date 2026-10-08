import { create } from "zustand";
import type { AddCartItemPayload } from "@/services/cart";

export interface PincodeMismatchData {
  customerPincode: string;
  storePincode: string;
  storeName?: string;
  productName?: string;
  payload: AddCartItemPayload;
  onSuccess?: () => void;
}

interface PincodeMismatchStoreState {
  mismatch: PincodeMismatchData | null;
  openMismatch: (data: PincodeMismatchData) => void;
  closeMismatch: () => void;
}

export const usePincodeMismatchStore = create<PincodeMismatchStoreState>((set) => ({
  mismatch: null,
  openMismatch: (data: PincodeMismatchData) => set({ mismatch: data }),
  closeMismatch: () => set({ mismatch: null }),
}));
