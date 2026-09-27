"use client";

import { usePathname } from "next/navigation";
import { Menu, AlertTriangle } from "lucide-react";
import { useAppStore } from "@/store/app-store";
import { useAdminSettings, useSystemHealth } from "@/hooks/use-admin-settings";
import { QuickCreateDropdown } from "./QuickCreateDropdown";
import { NotificationCenter } from "./NotificationCenter";
import { AdminProfileDropdown } from "./AdminProfileDropdown";
import { SellerStoreStatusBadge } from "./SellerStoreStatusBadge";
import { SellerQuickCreateDropdown } from "./SellerQuickCreateDropdown";
import { SellerNotificationCenter } from "./SellerNotificationCenter";
import { SellerProfileDropdown } from "./SellerProfileDropdown";
import type { UserRole } from "@/types/auth";

interface TopbarProps {
  role?: UserRole;
}

export function Topbar({ role }: TopbarProps) {
  const pathname = usePathname();
  const { setMobileMenuOpen } = useAppStore();
  const { data: settings } = useAdminSettings();
  const { data: health } = useSystemHealth();

  const isSeller = role === "store_owner" || pathname?.startsWith("/store");
  const isMaintenanceMode = settings?.maintenance?.enabled;
  const isHealthy = health?.status === "healthy";

  return (
    <header className="sticky top-0 z-20 border-b border-stone-200/80 bg-white/85 backdrop-blur-md dark:border-stone-800/80 dark:bg-stone-950/85 transition-colors">
      <div className="flex h-[60px] items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Left Section: Mobile Menu Trigger on small screens */}
        <div className="flex items-center">
          <button
            type="button"
            onClick={() => setMobileMenuOpen(true)}
            className="flex h-9 w-9 items-center justify-center rounded-xl border border-stone-200 bg-white text-stone-600 transition hover:bg-stone-100 hover:text-stone-900 lg:hidden dark:border-stone-800 dark:bg-stone-900 dark:text-stone-300 dark:hover:bg-stone-800"
            aria-label="Open mobile navigation menu"
          >
            <Menu className="h-5 w-5" />
          </button>
        </div>

        {/* Right Section */}
        {isSeller ? (
          /* Dedicated Seller Header */
          <div className="flex items-center gap-2 sm:gap-2.5">
            <SellerStoreStatusBadge />
            <SellerQuickCreateDropdown />
            <SellerNotificationCenter />
            <div className="h-5 w-px bg-stone-200 dark:bg-stone-800 hidden sm:block" />
            <SellerProfileDropdown />
          </div>
        ) : (
          /* Preserved Admin Header */
          <div className="flex items-center gap-2 sm:gap-2.5">
            <div className="hidden lg:flex items-center">
              {isMaintenanceMode ? (
                <div className="flex items-center gap-1.5 rounded-full border border-amber-500/30 bg-amber-500/10 px-2.5 py-1 text-[11px] font-semibold text-amber-600 dark:text-amber-400">
                  <AlertTriangle className="h-3 w-3" />
                  <span>Maintenance Active</span>
                </div>
              ) : (
                <div className="flex items-center gap-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-1 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
                  <span className="relative flex h-2 w-2">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                    <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
                  </span>
                  <span className="hidden 2xl:inline">System</span>
                  <span>{isHealthy ? "Online" : "Degraded"}</span>
                </div>
              )}
            </div>

            <QuickCreateDropdown />
            <NotificationCenter />
            <div className="h-5 w-px bg-stone-200 dark:bg-stone-800 hidden sm:block" />
            <AdminProfileDropdown />
          </div>
        )}
      </div>
    </header>
  );
}
