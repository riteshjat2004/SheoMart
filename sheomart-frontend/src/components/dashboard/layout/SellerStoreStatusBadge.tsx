"use client";

import { useQuery } from "@tanstack/react-query";
import { CheckCircle2, Clock, AlertTriangle, PowerOff } from "lucide-react";
import { fetchMyStore } from "@/services/store";

export function SellerStoreStatusBadge() {
  const storeQuery = useQuery({
    queryKey: ["my-store"],
    queryFn: fetchMyStore,
    staleTime: 1000 * 60 * 5,
  });

  const store = storeQuery.data;
  const status = store?.status?.toLowerCase() || "active";

  if (status === "active" || status === "approved") {
    return (
      <div className="flex items-center gap-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-1 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
        <span className="relative flex h-2 w-2">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
          <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
        </span>
        <span className="hidden sm:inline">Store</span>
        <span>Live</span>
      </div>
    );
  }

  if (status === "pending") {
    return (
      <div className="flex items-center gap-1.5 rounded-full border border-amber-500/30 bg-amber-500/10 px-2.5 py-1 text-[11px] font-semibold text-amber-600 dark:text-amber-400">
        <Clock className="h-3 w-3" />
        <span className="hidden sm:inline">Store</span>
        <span>Pending Approval</span>
      </div>
    );
  }

  if (status === "suspended") {
    return (
      <div className="flex items-center gap-1.5 rounded-full border border-rose-500/30 bg-rose-500/10 px-2.5 py-1 text-[11px] font-semibold text-rose-600 dark:text-rose-400">
        <AlertTriangle className="h-3 w-3" />
        <span className="hidden sm:inline">Store</span>
        <span>Suspended</span>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-1.5 rounded-full border border-stone-300 bg-stone-100 px-2.5 py-1 text-[11px] font-semibold text-stone-600 dark:border-stone-800 dark:bg-stone-900 dark:text-stone-400">
      <PowerOff className="h-3 w-3" />
      <span className="hidden sm:inline">Store</span>
      <span>Offline</span>
    </div>
  );
}
