"use client";

import type { ReactNode } from "react";
import { usePathname } from "next/navigation";
import { RouteGuard } from "@/components/auth/RouteGuard";
import { Footer } from "@/components/layout/footer";
import { Navbar } from "@/components/layout/navbar";
import { FloatingCartButton } from "@/components/cart/FloatingCartButton";
import { CartStoreConflictModal } from "@/components/cart/CartStoreConflictModal";
import { CartPincodeMismatchModal } from "@/components/cart/CartPincodeMismatchModal";

import { useMaintenanceMode } from "@/hooks/use-maintenance-mode";
import { MaintenanceScreen } from "@/components/maintenance/MaintenanceScreen";
import { AdminMaintenanceBanner } from "@/components/maintenance/AdminMaintenanceBanner";

export function AppShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const isAdminRoute = pathname === "/admin" || pathname.startsWith("/admin/");
  const isStoreRoute = pathname === "/store" || pathname.startsWith("/store/");
  const isAuthRoute =
    pathname === "/login" ||
    pathname === "/register" ||
    pathname === "/forgot-password" ||
    pathname.startsWith("/auth") ||
    pathname.startsWith("/admin-reset-password") ||
    pathname.startsWith("/seller-reset-password") ||
    pathname.startsWith("/reset-password");

  const {
    isMaintenanceActive,
    isPlatformAdmin,
    maintenanceInfo,
    refetch,
    isFetching,
  } = useMaintenanceMode();

  // Maintenance screen displays for non-admin users on non-exempt routes:
  // - Admin routes (/admin, /admin/*) are always accessible for platform management
  // - Auth routes (/login, /register, etc.) stay accessible so admins can log in
  // - Authenticated platform admins have full bypass everywhere
  const shouldShowMaintenance =
    isMaintenanceActive && !isPlatformAdmin && !isAuthRoute && !isAdminRoute;

  if (shouldShowMaintenance) {
    return (
      <div className="flex min-h-screen flex-col bg-stone-50 dark:bg-stone-950">
        <MaintenanceScreen
          maintenanceInfo={maintenanceInfo}
          onRefresh={() => void refetch()}
          isRefreshing={isFetching}
        />
      </div>
    );
  }

  if (isAdminRoute || isStoreRoute) {
    return (
      <>
        <AdminMaintenanceBanner />
        <RouteGuard>{children}</RouteGuard>
        <FloatingCartButton />
      </>
    );
  }

  return (
    <div className="flex min-h-screen flex-col">
      <AdminMaintenanceBanner />
      <Navbar />
      <main className="flex-1">
        <RouteGuard>{children}</RouteGuard>
      </main>
      {pathname === "/" ? <Footer /> : null}
      {!isAuthRoute ? <FloatingCartButton /> : null}
      <CartStoreConflictModal />
      <CartPincodeMismatchModal />
    </div>
  );
}