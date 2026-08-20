"use client";

import { Search, UserRound, UserRoundPlus } from "lucide-react";

export type CustomerMode = "walk-in" | "registered" | "plus";

interface CustomerSelectorProps {
  mode: CustomerMode;
  customerName: string;
  mobileNumber: string;
  selectedCustomerId?: string;
  onModeChange: (mode: CustomerMode) => void;
  onCustomerNameChange: (value: string) => void;
  onMobileNumberChange: (value: string) => void;
}

export function CustomerSelector({
  mode,
  customerName,
  mobileNumber,
  selectedCustomerId,
  onModeChange,
  onCustomerNameChange,
  onMobileNumberChange,
}: CustomerSelectorProps) {
  const mobileError = mobileNumber.length > 0 && mobileNumber.length !== 10;

  return (
    <section className="rounded-xl border border-stone-200 bg-white/80 p-5 shadow-sm backdrop-blur dark:border-stone-800 dark:bg-stone-900/80">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-base font-semibold text-stone-900 dark:text-stone-50">Customer</h2>
          <p className="mt-1.5 text-sm leading-6 text-stone-600 dark:text-stone-300">Choose who this invoice is for.</p>
        </div>
        <UserRound className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
      </div>

      <div className="mt-5 grid grid-cols-3 rounded-lg bg-stone-100 p-1 dark:bg-stone-800" role="tablist" aria-label="Customer type">
        {(["walk-in", "registered", "plus"] as const).map((type) => (
          <button
            key={type}
            type="button"
            role="tab"
            aria-selected={mode === type}
            onClick={() => onModeChange(type)}
            className={`rounded-md px-3 py-2 text-sm font-medium transition ${mode === type ? "bg-white text-emerald-700 shadow-sm dark:bg-stone-950 dark:text-emerald-300" : "text-stone-600 hover:text-stone-900 dark:text-stone-300 dark:hover:text-stone-50"}`}
          >
            {type === "walk-in" ? "Walk-in Customer" : type === "registered" ? "Registered Customer" : "Plus Customer"}
          </button>
        ))}
      </div>

      {mode === "walk-in" ? (
        <div className="mt-5 grid gap-4 sm:grid-cols-2">
          <label className="space-y-2 text-sm font-medium text-stone-700 dark:text-stone-200">
            Name <span className="font-normal text-stone-400">(optional)</span>
            <input
              type="text"
              value={customerName}
              onChange={(event) => onCustomerNameChange(event.target.value)}
              placeholder="Customer name"
              className="h-11 w-full rounded-lg border border-stone-200 bg-white px-3 text-sm font-normal text-stone-900 outline-none transition placeholder:text-stone-400 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 dark:border-stone-700 dark:bg-stone-950 dark:text-stone-50"
            />
          </label>
          <label className="space-y-2 text-sm font-medium text-stone-700 dark:text-stone-200">
            Phone <span className="font-normal text-stone-400">(optional)</span>
            <input
              type="tel"
              value={mobileNumber}
              onChange={(event) => onMobileNumberChange(event.target.value.replace(/\D/g, "").slice(0, 10))}
              inputMode="numeric"
              maxLength={10}
              placeholder="Phone number"
              className={`h-11 w-full rounded-lg border bg-white px-3 text-sm font-normal text-stone-900 outline-none transition placeholder:text-stone-400 focus:ring-2 focus:ring-emerald-500/20 dark:bg-stone-950 dark:text-stone-50 ${mobileError ? "border-red-400 focus:border-red-500" : "border-stone-200 focus:border-emerald-500 dark:border-stone-700"}`}
            />
            {mobileError ? <span className="text-xs font-normal text-red-600 dark:text-red-400">Enter a 10-digit mobile number.</span> : null}
          </label>
        </div>
      ) : mode === "registered" ? (
        <div className="mt-5 space-y-4">
          <label className="relative block text-sm font-medium text-stone-700 dark:text-stone-200">
            Search registered customers
            <Search className="pointer-events-none absolute left-3 top-9 h-4 w-4 text-stone-400" />
            <input
              type="search"
              disabled
              placeholder="Customer search coming soon"
              className="mt-2 h-11 w-full rounded-lg border border-stone-200 bg-stone-100 pl-9 pr-3 text-sm font-normal text-stone-500 outline-none dark:border-stone-700 dark:bg-stone-800 dark:text-stone-400"
            />
          </label>
          <div className="flex items-center gap-3 rounded-lg border border-dashed border-stone-300 p-4 dark:border-stone-700">
            <UserRoundPlus className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
            <span className="text-sm text-stone-600 dark:text-stone-300">{selectedCustomerId ? "Registered customer selected." : "Registered customer search is not connected yet."}</span>
          </div>
        </div>
      ) : (
        <div className="mt-5 rounded-lg border border-emerald-200 bg-emerald-50 p-4 dark:border-emerald-900/70 dark:bg-emerald-950/30">
          <div className="flex items-center gap-3">
            <UserRoundPlus className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
            <span className="rounded-full bg-emerald-600 px-2.5 py-1 text-xs font-semibold text-white">PLUS</span>
          </div>
          <p className="mt-3 text-sm font-medium text-emerald-800 dark:text-emerald-200">This customer can Pay at Shop.</p>
        </div>
      )}
    </section>
  );
}
