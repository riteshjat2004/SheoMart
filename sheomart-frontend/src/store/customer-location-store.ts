import { create } from "zustand";

const STORAGE_KEY_SELECTED_ADDRESS_ID = "sheomart_selected_address_id";
const STORAGE_KEY_GUEST_PINCODE = "sheomart_customer_pincode";

interface CustomerLocationStoreState {
  selectedAddressId: string | null;
  guestPincode: string | null;
  isLoaded: boolean;
  initialize: () => void;
  selectAddress: (addressId: string) => void;
  setPincode: (pincode: string) => void;
  clearLocation: () => void;
}

export const useCustomerLocationStore = create<CustomerLocationStoreState>((set, get) => ({
  selectedAddressId: null,
  guestPincode: null,
  isLoaded: false,

  initialize: () => {
    if (get().isLoaded) return;
    if (typeof window === "undefined") return;

    try {
      const savedAddressId = localStorage.getItem(STORAGE_KEY_SELECTED_ADDRESS_ID);
      const savedPincode = localStorage.getItem(STORAGE_KEY_GUEST_PINCODE);
      set({
        selectedAddressId: savedAddressId || null,
        guestPincode: savedPincode || null,
        isLoaded: true,
      });
    } catch {
      set({ isLoaded: true });
    }
  },

  selectAddress: (addressId: string) => {
    set({ selectedAddressId: addressId });
    if (typeof window !== "undefined") {
      try {
        localStorage.setItem(STORAGE_KEY_SELECTED_ADDRESS_ID, addressId);
      } catch {
        // Ignored
      }
    }
  },

  setPincode: (pincode: string) => {
    const cleaned = pincode.trim();
    set({ guestPincode: cleaned || null, selectedAddressId: null });
    if (typeof window !== "undefined") {
      try {
        if (cleaned) {
          localStorage.setItem(STORAGE_KEY_GUEST_PINCODE, cleaned);
        } else {
          localStorage.removeItem(STORAGE_KEY_GUEST_PINCODE);
        }
        localStorage.removeItem(STORAGE_KEY_SELECTED_ADDRESS_ID);
      } catch {
        // Ignored
      }
    }
  },

  clearLocation: () => {
    set({ selectedAddressId: null, guestPincode: null });
    if (typeof window !== "undefined") {
      try {
        localStorage.removeItem(STORAGE_KEY_SELECTED_ADDRESS_ID);
        localStorage.removeItem(STORAGE_KEY_GUEST_PINCODE);
      } catch {
        // Ignored
      }
    }
  },
}));
