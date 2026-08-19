"use client";

import { CheckCircle2, XCircle, AlertTriangle } from "lucide-react";
import type { StoreItem } from "@/types/marketplace";
import { Button } from "@/components/ui/button";

interface StoreApprovalCardProps {
  store: StoreItem;
  onApprove: (store: StoreItem) => void;
  onReject: (store: StoreItem) => void;
  onSuspend: (store: StoreItem) => void;
}

const statusStyles: Record<string, string> = {
  pending: "bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-300",
  approved: "bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400",
  rejected: "bg-rose-50 text-rose-700 dark:bg-rose-500/10 dark:text-rose-300",
  suspended: "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-200",
};

export function StoreApprovalCard({ store, onApprove, onReject, onSuspend }: StoreApprovalCardProps) {
  const status = store.status ?? "pending";

  return (
    <div className="rounded-xl border border-stone-200 bg-white/80 p-4 shadow-sm dark:border-stone-800 dark:bg-stone-900/80">
      <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
        <div>
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
