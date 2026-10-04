"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { useAddresses } from "./use-addresses";
import { useAuthStore } from "@/store/auth-store";
import type { AddressItem } from "@/services/addresses";

const STORAGE_KEY_SELECTED_ADDRESS_ID = "sheomart_selected_address_id";
const STORAGE_KEY_GUEST_PINCODE = "sheomart_customer_pincode";

export function useCustomerLocation() {
  const isCustomer = useAuthStore((state) => state.user?.role === "customer");
  const user = useAuthStore((state) => state.user);
  const addressesQuery = useAddresses(isCustomer);
  const addresses = useMemo(
    () => (Array.isArray(addressesQuery.data) ? addressesQuery.data : []),
    [addressesQuery.data]
  );

  const [selectedAddressId, setSelectedAddressId] = useState<string | null>(null);
  const [guestPincode, setGuestPincodeState] = useState<string | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  // Initialize from localStorage
  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const savedAddressId = localStorage.getItem(STORAGE_KEY_SELECTED_ADDRESS_ID);
      const savedPincode = localStorage.getItem(STORAGE_KEY_GUEST_PINCODE);
      if (savedAddressId) setSelectedAddressId(savedAddressId);
      if (savedPincode) setGuestPincodeState(savedPincode);
    } catch {
      // Storage unavailable or disabled
    } finally {
      setIsLoaded(true);
    }
  }, []);

  // Determine active address
  const activeAddress = useMemo<AddressItem | null>(() => {
    if (!addresses.length) return null;
    if (selectedAddressId) {
      const found = addresses.find((a) => a.addressId === selectedAddressId);
      if (found) return found;
    }
    return addresses.find((a) => a.isDefault) ?? addresses[0] ?? null;
  }, [addresses, selectedAddressId]);

  // Determine active PIN code
  const activePincode = useMemo<string | null>(() => {
    if (activeAddress?.pincode?.trim()) {
      return activeAddress.pincode.trim();
    }
    if (isCustomer && (user as unknown as { pincode?: string })?.pincode?.trim()) {
      return (user as unknown as { pincode?: string }).pincode!.trim();
    }
    if (guestPincode?.trim()) {
      return guestPincode.trim();
    }
    return null;
  }, [activeAddress, isCustomer, user, guestPincode]);

  // Human-readable location label
  const locationLabel = useMemo<string>(() => {
    if (activeAddress) {
      const parts = [activeAddress.house, activeAddress.street, activeAddress.city].filter(Boolean);
      const shortAddr = parts.length > 0 ? parts[0] : activeAddress.city || "Delivery Location";
      return `${shortAddr} (${activeAddress.pincode})`;
    }
    if (activePincode) {
      return `PIN ${activePincode}`;
    }
    return "Select Location";
  }, [activeAddress, activePincode]);

  const selectAddress = useCallback((addressId: string) => {
    setSelectedAddressId(addressId);
    if (typeof window !== "undefined") {
      try {
        localStorage.setItem(STORAGE_KEY_SELECTED_ADDRESS_ID, addressId);
      } catch {
        // Ignored
      }
    }
  }, []);

  const setPincode = useCallback((pincode: string) => {
    const cleaned = pincode.trim();
    setGuestPincodeState(cleaned || null);
    setSelectedAddressId(null);
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
  }, []);

  const clearLocation = useCallback(() => {
    setSelectedAddressId(null);
    setGuestPincodeState(null);
    if (typeof window !== "undefined") {
      try {
        localStorage.removeItem(STORAGE_KEY_SELECTED_ADDRESS_ID);
        localStorage.removeItem(STORAGE_KEY_GUEST_PINCODE);
      } catch {
        // Ignored
      }
    }
  }, []);

  return {
    isLoaded,
    activeAddress,
    activePincode,
    locationLabel,
    addresses,
    isCustomer,
    isLoadingAddresses: addressesQuery.isLoading,
    selectAddress,
    setPincode,
    clearLocation,
  };
}
