"use client";

import { RouteGuard } from "@/components/auth/RouteGuard";
import { DashboardLayout } from "@/components/dashboard/layout/DashboardLayout";
import type { UserRole } from "@/types/auth";

interface DashboardRouteLayoutProps {
  children: React.ReactNode;
  role: UserRole;
}

export function DashboardRouteLayout({ children, role }: DashboardRouteLayoutProps) {
  return (
    <RouteGuard allowedRoles={[role]}>
      <DashboardLayout role={role}>{children}</DashboardLayout>
    </RouteGuard>
  );
}
