"use client";

import Link from "next/link";
import { AlertOctagon, ArrowRight, Wrench } from "lucide-react";
import { useMaintenanceMode } from "@/hooks/use-maintenance-mode";

export function AdminMaintenanceBanner() {
  const { isMaintenanceActive, isPlatformAdmin } = useMaintenanceMode();

  if (!isMaintenanceActive || !isPlatformAdmin) {
    return null;
  }

  return (
    <aside
      aria-label="Maintenance mode active banner"
      className="relative z-50 flex items-center justify-between border-b border-amber-500/30 bg-amber-500/15 px-4 py-2 text-xs font-medium text-amber-900 backdrop-blur-md dark:border-amber-400/20 dark:bg-amber-950/80 dark:text-amber-200"
    >
      <div className="flex items-center gap-2">
        <span className="flex h-2 w-2 rounded-full bg-amber-500 animate-pulse" />
        <Wrench className="h-3.5 w-3.5 text-amber-600 dark:text-amber-400" />
        <span>
          <strong className="font-semibold">Maintenance Mode Active:</strong> Storefront browsing is paused for customers and guests. You have platform admin bypass access.
        </span>
      </div>
      <Link
        href="/admin/settings"
        className="inline-flex items-center gap-1 rounded-lg bg-amber-600 px-2.5 py-1 text-[11px] font-bold text-white shadow-2xs hover:bg-amber-700 dark:bg-amber-500 dark:text-stone-950 dark:hover:bg-amber-400"
      >
        <span>Manage in Settings</span>
        <ArrowRight className="h-3 w-3" />
      </Link>
    </aside>
  );
}
