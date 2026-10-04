"use client";

import { useState } from "react";
import Link from "next/link";
import { Wrench, Clock, RefreshCw, ShoppingBag, ShieldCheck, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { PublicMaintenanceInfo } from "@/services/public-settings";

export interface MaintenanceScreenProps {
  maintenanceInfo?: Partial<PublicMaintenanceInfo>;
  isPreview?: boolean;
  onRefresh?: () => void | Promise<void>;
  isRefreshing?: boolean;
}

export function MaintenanceScreen({
  maintenanceInfo,
  isPreview = false,
  onRefresh,
  isRefreshing = false,
}: MaintenanceScreenProps) {
  const [internalRefreshing, setInternalRefreshing] = useState(false);

  const title = maintenanceInfo?.title || "We'll be back soon";
  const description =
    maintenanceInfo?.description ||
    "We're making a few improvements to SheoMart. Please check back shortly.";
  const returnTime = maintenanceInfo?.estimatedReturnTime;

  const handleRefresh = async () => {
    if (onRefresh) {
      await onRefresh();
    } else {
      setInternalRefreshing(true);
      window.location.reload();
    }
  };

  const refreshing = isRefreshing || internalRefreshing;

  return (
    <div className="flex min-h-[85vh] w-full flex-col items-center justify-center px-4 py-12 text-stone-900 dark:text-stone-100 sm:px-6 lg:px-8">
      <div className="w-full max-w-lg space-y-6 text-center">
        {/* Brand Header */}
        <div className="inline-flex items-center gap-2 rounded-full border border-stone-200/80 bg-white/80 px-4 py-1.5 shadow-xs backdrop-blur-xs dark:border-stone-800 dark:bg-stone-900/80">
          <div className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-600 text-white">
            <ShoppingBag className="h-3 w-3" />
          </div>
          <span className="text-xs font-bold tracking-tight text-stone-900 dark:text-stone-100">
            SheoMart
          </span>
          <span className="text-stone-300 dark:text-stone-700">•</span>
          <span className="flex items-center gap-1.5 text-[11px] font-semibold text-amber-600 dark:text-amber-400">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-amber-400 opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-amber-500" />
            </span>
            {isPreview ? "Simulation Preview" : "Scheduled Upgrades"}
          </span>
        </div>

        {/* Central Maintenance Card */}
        <div className="relative overflow-hidden rounded-3xl border border-stone-200 bg-white p-8 shadow-xl dark:border-stone-800 dark:bg-stone-900/90 sm:p-10">
          {/* Subtle decorative background gradient */}
          <div className="pointer-events-none absolute -top-24 left-1/2 h-48 w-72 -translate-x-1/2 rounded-full bg-amber-500/10 blur-3xl dark:bg-amber-400/5" />

          {/* Icon Badge */}
          <div className="relative mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-amber-100 text-amber-600 shadow-inner dark:bg-amber-950/60 dark:text-amber-400">
            <Wrench className="h-8 w-8 animate-pulse" />
          </div>

          {/* Content */}
          <h1 className="mt-6 text-2xl font-extrabold tracking-tight text-stone-900 dark:text-stone-50 sm:text-3xl">
            {title}
          </h1>

          <p className="mt-3 text-sm leading-relaxed text-stone-600 dark:text-stone-400">
            {description}
          </p>

          {/* Estimated Return Time Callout */}
          {returnTime ? (
            <div className="mt-6 inline-flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50/80 px-4 py-2 text-xs font-semibold text-emerald-800 shadow-2xs dark:border-emerald-900/60 dark:bg-emerald-950/40 dark:text-emerald-300">
              <Clock className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
              <span>Expected back: {returnTime}</span>
            </div>
          ) : null}

          {/* Action Area */}
          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            {!isPreview ? (
              <Button
                type="button"
                onClick={handleRefresh}
                disabled={refreshing}
                className="w-full gap-2 rounded-xl bg-emerald-600 text-xs font-semibold text-white shadow-xs hover:bg-emerald-700 disabled:opacity-50 sm:w-auto"
              >
                <RefreshCw className={`h-3.5 w-3.5 ${refreshing ? "animate-spin" : ""}`} />
                {refreshing ? "Checking Status..." : "Check Status Again"}
              </Button>
            ) : null}
          </div>

          <div className="mt-8 border-t border-stone-100 pt-5 text-xs text-stone-400 dark:border-stone-800/80">
            Orders already in progress and store customer accounts are safely preserved during maintenance.
          </div>
        </div>

        {/* Admin Bypass Link (for admins needing to access console without searching) */}
        {!isPreview ? (
          <div className="text-xs text-stone-500 dark:text-stone-400">
            Platform administrator?{" "}
            <Link
              href="/login"
              className="inline-flex items-center gap-1 font-semibold text-emerald-600 hover:text-emerald-700 hover:underline dark:text-emerald-400"
            >
              Sign in to admin console
              <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
        ) : null}
      </div>
    </div>
  );
}
