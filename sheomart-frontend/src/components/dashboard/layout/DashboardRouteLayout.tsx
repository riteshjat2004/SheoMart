"use client";

import { RouteGuard } from "@/components/auth/RouteGuard";
import { DashboardLayout } from "@/components/dashboard/layout/DashboardLayout";
import { useAuthStore } from "@/store/auth-store";
import type { UserRole } from "@/types/auth";

interface DashboardRouteLayoutProps {
  children: React.ReactNode;
  role: UserRole;
}

export function DashboardRouteLayout({ children, role }: DashboardRouteLayoutProps) {
  const currentRole = useAuthStore((state) => state.user?.role ?? role);
  const allowedRoles: UserRole[] = currentRole === "platform_admin" ? ["platform_admin"] : ["store_owner"];

  return (
    <RouteGuard allowedRoles={allowedRoles}>
      <DashboardLayout role={currentRole}>{children}</DashboardLayout>
    </RouteGuard>
  );
}
