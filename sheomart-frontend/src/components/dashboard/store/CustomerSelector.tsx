"use client";

import { useState } from "react";
import { Check, Crown, Search, UserCheck, UserRound, UserRoundPlus, X } from "lucide-react";
import { useStoreCustomers } from "@/hooks/use-store-customers";
import type { StoreCustomer } from "@/types/store-customer";

export type CustomerMode = "walk-in" | "registered" | "plus";

interface CustomerSelectorProps {
  mode: CustomerMode;
  customerName: string;
  mobileNumber: string;
  selectedCustomerId?: string;
  onModeChange: (mode: CustomerMode) => void;
  onCustomerNameChange: (value: string) => void;
  onMobileNumberChange: (value: string) => void;
  onCustomerSelect?: (customer: StoreCustomer | null) => void;
}

export function CustomerSelector({
  mode,
  customerName,
  mobileNumber,
  selectedCustomerId,
  onModeChange,
  onCustomerNameChange,
  onMobileNumberChange,
  onCustomerSelect,
}: CustomerSelectorProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const mobileError = mobileNumber.length > 0 && mobileNumber.length !== 10;

  // Query customers from backend
  const customersQuery = useStoreCustomers({
    page: 1,
    limit: 12,
    search: searchTerm.trim() || undefined,
    isPlusCustomer: mode === "plus" ? true : undefined,
  });

  const customerList = customersQuery.data?.customers ?? [];
  const selectedCustomer = customerList.find((c) => c.customerId === selectedCustomerId);

  const handleSelectCustomer = (customer: StoreCustomer) => {
    onCustomerNameChange(customer.name);
    onMobileNumberChange(customer.mobile || customer.phone || "");
    if (onCustomerSelect) {
      onCustomerSelect(customer);
    }
  };

  const handleClearSelected = () => {
    onCustomerNameChange("");
    onMobileNumberChange("");
    if (onCustomerSelect) {
      onCustomerSelect(null);
    }
  };

  return (
    <section className="rounded-xl border border-stone-200 bg-white/80 p-5 shadow-sm backdrop-blur dark:border-stone-800 dark:bg-stone-900/80">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-base font-semibold text-stone-900 dark:text-stone-50">Customer</h2>
          <p className="mt-1 text-xs text-stone-500 dark:text-stone-400">
            Select billing category: walk-in shopper, registered buyer, or Plus member.
          </p>
        </div>
        <UserRound className="h-5 w-5 text-emerald-600 dark:text-emerald-400 shrink-0" />
      </div>

      {/* Tabs */}
      <div className="mt-4 grid grid-cols-3 rounded-xl bg-stone-100 p-1 dark:bg-stone-800" role="tablist">
        {(["walk-in", "registered", "plus"] as const).map((type) => (
          <button
            key={type}
            type="button"
            role="tab"
            aria-selected={mode === type}
            onClick={() => {
              onModeChange(type);
              if (type === "walk-in" && selectedCustomerId) {
                handleClearSelected();
              }
            }}
            className={`flex items-center justify-center gap-1.5 rounded-lg px-2.5 py-2 text-xs font-semibold transition ${
              mode === type
                ? "bg-white text-emerald-700 shadow-xs dark:bg-stone-900 dark:text-emerald-300"
                : "text-stone-600 hover:text-stone-900 dark:text-stone-400 dark:hover:text-stone-100"
            }`}
          >
            {type === "plus" ? <Crown className="h-3.5 w-3.5 text-amber-500" /> : null}
            {type === "walk-in" ? "Walk-in" : type === "registered" ? "Registered" : "Plus Member"}
          </button>
        ))}
      </div>

      {/* Walk-in Customer Fields */}
      {mode === "walk-in" && (
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <label className="space-y-1.5 text-xs font-semibold text-stone-700 dark:text-stone-300">
            Customer Name <span className="font-normal text-stone-400">(optional)</span>
            <input
              type="text"
              value={customerName}
              onChange={(e) => onCustomerNameChange(e.target.value)}
              placeholder="e.g. Rahul Sharma"
              className="h-10 w-full rounded-lg border border-stone-200 bg-white px-3 text-sm text-stone-900 outline-none transition placeholder:text-stone-400 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 dark:border-stone-700 dark:bg-stone-950 dark:text-stone-50"
            />
          </label>
          <label className="space-y-1.5 text-xs font-semibold text-stone-700 dark:text-stone-300">
            Mobile Number <span className="font-normal text-stone-400">(optional for e-bill)</span>
            <input
              type="tel"
              value={mobileNumber}
              onChange={(e) => onMobileNumberChange(e.target.value.replace(/\D/g, "").slice(0, 10))}
              inputMode="numeric"
              maxLength={10}
              placeholder="10-digit mobile"
              className={`h-10 w-full rounded-lg border bg-white px-3 text-sm text-stone-900 outline-none transition placeholder:text-stone-400 focus:ring-2 focus:ring-emerald-500/20 dark:bg-stone-950 dark:text-stone-50 ${
                mobileError
                  ? "border-red-400 focus:border-red-500"
                  : "border-stone-200 focus:border-emerald-500 dark:border-stone-700"
              }`}
            />
            {mobileError ? (
              <span className="text-[11px] font-normal text-red-600 dark:text-red-400">
                Please enter a 10-digit mobile number.
              </span>
            ) : null}
          </label>
        </div>
      )}

      {/* Registered & Plus Customer Search & Selection */}
      {mode !== "walk-in" && (
        <div className="mt-4 space-y-3">
          {/* Selected Customer Card */}
          {selectedCustomerId ? (
            <div className="flex items-center justify-between rounded-xl border border-emerald-300 bg-emerald-50/70 p-3.5 dark:border-emerald-900/80 dark:bg-emerald-950/30">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-600 text-white font-bold text-sm">
                  {customerName.charAt(0).toUpperCase() || "C"}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-stone-900 dark:text-stone-100">
                      {customerName}
                    </span>
                    {mode === "plus" || selectedCustomer?.isPlusCustomer ? (
                      <span className="inline-flex items-center gap-1 rounded-md bg-amber-500 px-1.5 py-0.2 text-[10px] font-black text-white">
                        <Crown className="h-3 w-3" /> PLUS
                      </span>
                    ) : (
                      <span className="rounded-md bg-emerald-100 px-1.5 py-0.2 text-[10px] font-semibold text-emerald-800 dark:bg-emerald-900/60 dark:text-emerald-300">
                        Registered
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-stone-500 dark:text-stone-400 mt-0.5">
                    Phone: {mobileNumber || "Not recorded"}
                    {selectedCustomer?.email ? ` • ${selectedCustomer.email}` : ""}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={handleClearSelected}
                className="flex items-center gap-1 rounded-lg border border-stone-200 bg-white px-2.5 py-1.5 text-xs font-semibold text-stone-700 hover:bg-stone-50 dark:border-stone-700 dark:bg-stone-900 dark:text-stone-200 transition"
              >
                <X className="h-3.5 w-3.5" />
                Change
              </button>
            </div>
          ) : (
            <div className="space-y-2">
              <div className="relative">
                <Search className="pointer-events-none absolute left-3 top-2.5 h-4 w-4 text-stone-400" />
                <input
                  type="search"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder={
                    mode === "plus"
                      ? "Search Plus customers by name or phone..."
                      : "Search registered customers by name, phone, or email..."
                  }
                  className="h-10 w-full rounded-xl border border-stone-200 bg-white pl-9 pr-3 text-xs text-stone-900 outline-none transition placeholder:text-stone-400 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 dark:border-stone-700 dark:bg-stone-950 dark:text-stone-50"
                />
              </div>

              {/* Customer Search Dropdown / List */}
              <div className="max-h-48 overflow-y-auto rounded-xl border border-stone-200 bg-white divide-y divide-stone-100 dark:border-stone-800 dark:bg-stone-900 dark:divide-stone-800 scrollbar-thin">
                {customersQuery.isLoading ? (
                  <p className="p-3 text-center text-xs text-stone-400">Loading customers...</p>
                ) : customerList.length === 0 ? (
                  <div className="p-4 text-center">
                    <p className="text-xs font-medium text-stone-600 dark:text-stone-400">
                      {mode === "plus" ? "No Plus customers found." : "No registered customers found."}
                    </p>
                    <p className="text-[11px] text-stone-400 mt-1">
                      Try searching with another keyword or use Walk-in mode.
                    </p>
                  </div>
                ) : (
                  customerList.map((customer) => (
                    <button
                      key={customer.customerId}
                      type="button"
                      onClick={() => handleSelectCustomer(customer)}
                      className="flex w-full items-center justify-between p-2.5 text-left hover:bg-emerald-50/60 dark:hover:bg-emerald-950/30 transition group"
                    >
                      <div className="flex items-center gap-2.5">
                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-stone-100 text-stone-600 font-bold text-xs dark:bg-stone-800 dark:text-stone-300">
                          {customer.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <div className="flex items-center gap-1.5">
                            <span className="text-xs font-bold text-stone-900 group-hover:text-emerald-700 dark:text-stone-100 dark:group-hover:text-emerald-300">
                              {customer.name}
                            </span>
                            {customer.isPlusCustomer ? (
                              <span className="inline-flex items-center gap-0.5 rounded bg-amber-500 px-1 py-0.2 text-[9px] font-black text-white">
                                <Crown className="h-2.5 w-2.5" /> PLUS
                              </span>
                            ) : null}
                          </div>
                          <p className="text-[11px] text-stone-400">
                            {customer.mobile || customer.phone || "No phone"}
                            {customer.email ? ` • ${customer.email}` : ""}
                          </p>
                        </div>
                      </div>

                      <span className="text-xs font-semibold text-emerald-600 opacity-0 group-hover:opacity-100 transition">
                        Select →
                      </span>
                    </button>
                  ))
                )}
              </div>
            </div>
          )}

          {mode === "plus" && (
            <div className="rounded-xl border border-amber-200/80 bg-amber-50/60 p-3 text-xs text-amber-900 dark:border-amber-900/60 dark:bg-amber-950/20 dark:text-amber-200">
              <span className="font-bold flex items-center gap-1">
                <Crown className="h-3.5 w-3.5 text-amber-600 dark:text-amber-400" /> Plus Privileges Active:
              </span>
              <p className="mt-1 text-[11px] text-amber-800 dark:text-amber-300">
                Verified store customer eligible for Credit transactions, priority counter service, and automated billing receipts.
              </p>
            </div>
          )}
        </div>
      )}
    </section>
  );
}
