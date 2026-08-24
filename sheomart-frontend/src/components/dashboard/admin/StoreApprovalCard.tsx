"use client";

import { useMemo, useState } from "react";
import { CheckCircle2, XCircle, AlertTriangle, ShieldCheck, Crown } from "lucide-react";
import type { StoreBadgeType, StoreItem } from "@/types/marketplace";
import { Button } from "@/components/ui/button";

interface StoreApprovalCardProps {
  store: StoreItem;
  onApprove: (store: StoreItem) => void;
  onReject: (store: StoreItem) => void;
  onSuspend: (store: StoreItem) => void;
  onUpdateBadges?: (store: StoreItem, badges: StoreBadgeType[]) => void;
  isSavingBadges?: boolean;
}

const statusStyles: Record<string, string> = {
  pending: "bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-300",
  approved: "bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400",
  rejected: "bg-rose-50 text-rose-700 dark:bg-rose-500/10 dark:text-rose-300",
  suspended: "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-200",
};

export function StoreApprovalCard({ store, onApprove, onReject, onSuspend, onUpdateBadges, isSavingBadges = false }: StoreApprovalCardProps) {
  const status = store.status ?? "pending";
  const [selectedBadges, setSelectedBadges] = useState<StoreBadgeType[]>(store.badges ?? []);

  const badgeOptions = useMemo(
    () => [
      { value: "verified" as const, label: "Verified Store", helper: "Trusted and verified by SheoMart.", icon: ShieldCheck, badgeClass: "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900/70 dark:bg-emerald-950/40 dark:text-emerald-300" },
      { value: "royal" as const, label: "SheoMart Royal", helper: "Premium featured store.", icon: Crown, badgeClass: "border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-900/70 dark:bg-amber-950/40 dark:text-amber-300" },
    ],
    []
  );

  const toggleBadge = (value: StoreBadgeType) => {
    setSelectedBadges((current) => {
      if (current.includes(value)) {
        return current.filter((item) => item !== value);
      }
      return [...current, value].slice(0, 2);
    });
  };

  return (
    <div className="rounded-xl border border-stone-200 bg-white/80 p-4 shadow-sm dark:border-stone-800 dark:bg-stone-900/80">
      <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
        <div className="w-full">
          <div className="flex flex-wrap items-center gap-2">
            <h4 className="text-base font-semibold text-stone-900 dark:text-stone-50">{store.storeName ?? store.name ?? "Store"}</h4>
            <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${statusStyles[status] ?? statusStyles.pending}`}>
              {status.toUpperCase()}
            </span>
          </div>
          <p className="mt-2 text-sm text-stone-600 dark:text-stone-300">{store.description ?? "No description provided."}</p>
          <div className="mt-3 flex flex-wrap gap-4 text-sm text-stone-500 dark:text-stone-400">
            <span>{store.city ?? "Unknown city"}</span>
            <span>{store.address ?? "Unknown address"}</span>
            <span>{store.rating ? `${store.rating.toFixed(1)} ★` : "No rating yet"}</span>
          </div>
          <div className="mt-4 rounded-xl border border-stone-200 bg-stone-50 p-3 dark:border-stone-800 dark:bg-stone-950/60">
            <div className="mb-2 flex items-center justify-between gap-3">
              <div>
                <p className="text-sm font-semibold text-stone-800 dark:text-stone-200">Store Badges</p>
                <p className="text-xs text-stone-500 dark:text-stone-400">Assign trust badges that customers will see.</p>
              </div>
              <Button type="button" size="sm" variant="outline" disabled={isSavingBadges || selectedBadges.length === (store.badges ?? []).length && selectedBadges.every((badge) => (store.badges ?? []).includes(badge))} onClick={() => onUpdateBadges?.(store, selectedBadges)}>
                {isSavingBadges ? "Saving..." : "Save badges"}
              </Button>
            </div>
            <div className="grid gap-2 md:grid-cols-2">
              {badgeOptions.map(({ value, label, helper, icon: Icon, badgeClass }) => {
                const checked = selectedBadges.includes(value);
                return (
                  <label key={value} className="flex cursor-pointer items-start gap-3 rounded-lg border border-stone-200 bg-white p-3 transition hover:border-emerald-300 dark:border-stone-800 dark:bg-stone-900">
                    <input type="checkbox" className="mt-1 h-4 w-4 rounded border-stone-300 text-emerald-600 focus:ring-emerald-500" checked={checked} onChange={() => toggleBadge(value)} />
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-semibold ${badgeClass}`}><Icon className="h-3 w-3" />{value === "verified" ? "Verified" : "Royal"}</span>
                        <span className="text-sm font-medium text-stone-800 dark:text-stone-200">{label}</span>
                      </div>
                      <p className="mt-1 text-xs text-stone-500 dark:text-stone-400">{helper}</p>
                    </div>
                  </label>
                );
              })}
            </div>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          {status !== "approved" ? (
            <Button variant="outline" size="sm" onClick={() => onApprove(store)}>
              <CheckCircle2 className="h-4 w-4" />
              {status === "pending" ? "Approve" : "Reactivate"}
            </Button>
          ) : null}
          {status === "pending" ? (
            <Button variant="outline" size="sm" onClick={() => onReject(store)}>
              <XCircle className="h-4 w-4" />
              Reject
            </Button>
          ) : null}
          {status === "approved" ? (
            <Button variant="outline" size="sm" onClick={() => onSuspend(store)}>
              <AlertTriangle className="h-4 w-4" />
              Suspend
            </Button>
          ) : null}
        </div>
      </div>
    </div>
  );
}
