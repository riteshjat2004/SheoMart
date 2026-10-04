"use client";

import { useEffect, useMemo } from "react";
import { useAddresses } from "./use-addresses";
import { useAuthStore } from "@/store/auth-store";
import { useCustomerLocationStore } from "@/store/customer-location-store";
import type { AddressItem } from "@/services/addresses";

export function useCustomerLocation() {
  const isCustomer = useAuthStore((state) => state.user?.role === "customer");
  const user = useAuthStore((state) => state.user);
  const addressesQuery = useAddresses(isCustomer);
  const addresses = useMemo(
    () => (Array.isArray(addressesQuery.data) ? addressesQuery.data : []),
    [addressesQuery.data]
  );

  const selectedAddressId = useCustomerLocationStore((state) => state.selectedAddressId);
  const guestPincode = useCustomerLocationStore((state) => state.guestPincode);
  const isLoaded = useCustomerLocationStore((state) => state.isLoaded);
  const initialize = useCustomerLocationStore((state) => state.initialize);
  const selectAddress = useCustomerLocationStore((state) => state.selectAddress);
  const setPincode = useCustomerLocationStore((state) => state.setPincode);
  const clearLocation = useCustomerLocationStore((state) => state.clearLocation);

  useEffect(() => {
    initialize();
  }, [initialize]);

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
