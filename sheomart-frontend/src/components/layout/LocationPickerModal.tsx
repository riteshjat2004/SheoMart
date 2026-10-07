"use client";

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import { MapPin, X, Check, Plus, ArrowRight, Home as HomeIcon, Briefcase, Navigation } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCustomerLocation } from "@/hooks/use-customer-location";
import type { AddressItem } from "@/services/addresses";

interface LocationPickerModalProps {
  isOpen?: boolean;
  open?: boolean;
  onClose: () => void;
}

export function LocationPickerModal({ isOpen, open, onClose }: LocationPickerModalProps) {
  const showModal = isOpen ?? open ?? false;
  const {
    activeAddress,
    activePincode,
    addresses,
    isCustomer,
    selectAddress,
    setPincode,
    clearLocation,
  } = useCustomerLocation();

  const [inputPincode, setInputPincode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Lock body scroll when modal is active
  useEffect(() => {
    if (!showModal) return;
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = originalOverflow;
    };
  }, [showModal]);

  // Handle ESC key press
  useEffect(() => {
    if (!showModal) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [showModal, onClose]);

  if (!showModal || !mounted) return null;

  const handleApplyPincode = (e: React.FormEvent) => {
    e.preventDefault();
    const cleaned = inputPincode.trim();
    if (!/^\d{6}$/.test(cleaned)) {
      setError("Please enter a valid 6-digit Indian PIN code.");
      return;
    }
    setError(null);
    setPincode(cleaned);
    setInputPincode("");
    onClose();
  };

  const handleSelectAddress = (address: AddressItem) => {
    if (address.addressId) {
      selectAddress(address.addressId);
    }
    onClose();
  };

  const getAddressIcon = (type?: string) => {
    if (type === "work") return <Briefcase className="h-4 w-4 text-emerald-600" />;
    return <HomeIcon className="h-4 w-4 text-emerald-600" />;
  };

  return createPortal(
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-stone-950/70 p-4 backdrop-blur-sm animate-in fade-in duration-200 overflow-y-auto"
      role="dialog"
      aria-modal="true"
      aria-labelledby="location-picker-title"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="relative my-auto w-full max-w-md overflow-hidden rounded-3xl border border-stone-200 bg-white p-6 shadow-2xl dark:border-stone-800 dark:bg-stone-900">
        <button
          type="button"
          onClick={onClose}
          className="absolute right-4 top-4 rounded-xl p-1 text-stone-400 hover:bg-stone-100 hover:text-stone-700 dark:hover:bg-stone-800 dark:hover:text-stone-200"
          aria-label="Close"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-600 dark:bg-emerald-950/50 dark:text-emerald-400">
            <MapPin className="h-5 w-5" />
          </div>
          <div>
            <h2 id="location-picker-title" className="text-base font-bold text-stone-900 dark:text-stone-50">
              Select Delivery Location
            </h2>
            <p className="text-xs text-stone-500 dark:text-stone-400">
              Stores and inventory are tailored to your selected PIN code.
            </p>
          </div>
        </div>

        {/* Current Active Location Indicator */}
        <div className="mt-4 rounded-xl bg-stone-50 p-3 text-xs dark:bg-stone-950/60">
          <span className="font-semibold text-stone-700 dark:text-stone-300">Active Delivery PIN: </span>
          {activePincode ? (
            <span className="rounded bg-emerald-100 px-2 py-0.5 font-bold text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
              {activePincode}
            </span>
          ) : (
            <span className="text-stone-400">Not set (Browsing all locations)</span>
          )}
        </div>

        {/* Saved Addresses Section (for Customers) */}
        {isCustomer && addresses.length > 0 ? (
          <div className="mt-5 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-stone-400">
                Your Saved Addresses
              </span>
              <Link
                href="/addresses"
                onClick={onClose}
                className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-600 hover:underline dark:text-emerald-400"
              >
                <span>Manage</span>
                <ArrowRight className="h-3 w-3" />
              </Link>
            </div>

            <div className="max-h-56 space-y-2 overflow-y-auto pr-1">
              {addresses.map((address) => {
                const isSelected = activeAddress?.addressId === address.addressId;
                return (
                  <button
                    key={address.addressId}
                    type="button"
                    onClick={() => handleSelectAddress(address)}
                    className={`flex w-full items-start gap-3 rounded-2xl border p-3 text-left transition ${
                      isSelected
                        ? "border-emerald-500 bg-emerald-50/50 shadow-xs dark:border-emerald-600 dark:bg-emerald-950/30"
                        : "border-stone-200 bg-white hover:border-stone-300 dark:border-stone-800 dark:bg-stone-900 dark:hover:border-stone-700"
                    }`}
                  >
                    <div className="mt-0.5 shrink-0">{getAddressIcon(address.addressType)}</div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-stone-900 capitalize dark:text-stone-100">
                          {address.addressType || "Delivery Address"}
                        </span>
                        {address.isDefault ? (
                          <span className="rounded bg-stone-100 px-1.5 py-0.2 text-[10px] font-semibold text-stone-600 dark:bg-stone-800 dark:text-stone-400">
                            Default
                          </span>
                        ) : null}
                      </div>
                      <p className="mt-0.5 truncate text-xs text-stone-500 dark:text-stone-400">
                        {[address.house, address.street, address.city].filter(Boolean).join(", ")}
                      </p>
                      <p className="mt-1 text-xs font-bold text-emerald-600 dark:text-emerald-400">
                        PIN: {address.pincode}
                      </p>
                    </div>
                    {isSelected ? (
                      <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-600 text-white">
                        <Check className="h-3 w-3" />
                      </div>
                    ) : null}
                  </button>
                );
              })}
            </div>
          </div>
        ) : null}

        {/* PIN Code Direct Input */}
        <div className="mt-5 space-y-2 border-t border-stone-100 pt-4 dark:border-stone-800">
          <label htmlFor="pincode-input" className="block text-xs font-bold uppercase tracking-wider text-stone-400">
            {isCustomer && addresses.length > 0 ? "Or Enter Another PIN Code" : "Enter Delivery PIN Code"}
          </label>
          <form onSubmit={handleApplyPincode} className="flex gap-2">
            <input
              id="pincode-input"
              type="text"
              maxLength={6}
              value={inputPincode}
              onChange={(e) => {
                setInputPincode(e.target.value.replace(/\D/g, ""));
                if (error) setError(null);
              }}
              placeholder="e.g. 476001"
              className="flex-1 rounded-xl border border-stone-300 bg-white px-3 py-2 text-sm text-stone-900 outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 dark:border-stone-700 dark:bg-stone-950 dark:text-stone-100"
            />
            <Button type="submit" size="sm" className="rounded-xl bg-emerald-600 px-4 text-xs font-semibold text-white hover:bg-emerald-700">
              Apply
            </Button>
          </form>
          {error ? <p className="text-xs text-rose-500">{error}</p> : null}

          {/* Quick Active City Chips */}
          <div className="pt-2">
            <span className="text-[11px] font-semibold text-stone-500 dark:text-stone-400">Popular Active Hubs:</span>
            <div className="mt-1.5 flex flex-wrap gap-1.5">
              <button
                type="button"
                onClick={() => {
                  setPincode("476337");
                  onClose();
                }}
                className={`rounded-full border px-2.5 py-1 text-xs font-medium transition ${
                  activePincode === "476337"
                    ? "border-emerald-500 bg-emerald-50 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300"
                    : "border-stone-200 bg-stone-50 text-stone-700 hover:border-emerald-300 dark:border-stone-700 dark:bg-stone-850 dark:text-stone-300"
                }`}
              >
                📍 Sheopur (476337)
              </button>
              <button
                type="button"
                onClick={() => {
                  setPincode("560001");
                  onClose();
                }}
                className={`rounded-full border px-2.5 py-1 text-xs font-medium transition ${
                  activePincode === "560001"
                    ? "border-emerald-500 bg-emerald-50 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300"
                    : "border-stone-200 bg-stone-50 text-stone-700 hover:border-emerald-300 dark:border-stone-700 dark:bg-stone-850 dark:text-stone-300"
                }`}
              >
                📍 Bangalore (560001)
              </button>
            </div>
          </div>
        </div>

        {/* Clear Location Button */}
        {activePincode ? (
          <div className="mt-4 flex items-center justify-between border-t border-stone-100 pt-3 text-xs text-stone-400 dark:border-stone-800">
            <span>Filtering by PIN {activePincode}</span>
            <button
              type="button"
              onClick={() => {
                clearLocation();
                onClose();
              }}
              className="text-xs font-semibold text-rose-600 hover:underline dark:text-rose-400"
            >
              Reset to all stores
            </button>
          </div>
        ) : null}
      </div>
    </div>,
    document.body
  );
}
