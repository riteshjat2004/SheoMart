"use client";

import { useEffect, useMemo } from "react";
import { usePathname, useRouter } from "next/navigation";
import { LoadingScreen } from "@/components/auth/LoadingScreen";
import { Unauthorized } from "@/components/auth/Unauthorized";
import { GUEST_ONLY_ROUTES, isProtectedRoute, isGuestRoute, hasRequiredRole } from "@/lib/auth-guards";
import { useAuthStore } from "@/store/auth-store";
import type { UserRole } from "@/types/auth";

interface RouteGuardProps {
  children: React.ReactNode;
  allowedRoles?: UserRole[];
}

export function RouteGuard({ children, allowedRoles }: RouteGuardProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { isAuthenticated, loading, role, logout } = useAuthStore();

  const isGuestRoutePath = useMemo(() => isGuestRoute(pathname), [pathname]);
  const isProtectedPath = useMemo(() => isProtectedRoute(pathname), [pathname]);

  useEffect(() => {
    if (loading) {
      return;
    }

    if (isGuestRoutePath && isAuthenticated) {
      if (role === "customer") {
        router.replace("/customer");
      } else if (role === "store_owner") {
        router.replace("/store");
      } else if (role === "platform_admin") {
        router.replace("/admin");
      }
      return;
    }

    if (isProtectedPath && !isAuthenticated) {
      router.replace("/login");
      return;
    }

    if (allowedRoles && role && !hasRequiredRole(role, allowedRoles)) {
      logout();
      router.replace("/login");
      return;
    }
  }, [allowedRoles, isAuthenticated, isGuestRoutePath, isProtectedPath, loading, logout, pathname, role, router]);

  if (loading) {
    return <LoadingScreen />;
  }

  if (isGuestRoutePath && isAuthenticated) {
    return null;
  }

  if (isProtectedPath && !isAuthenticated) {
    return <Unauthorized />;
  }

  if (allowedRoles && role && !hasRequiredRole(role, allowedRoles)) {
    return <Unauthorized />;
  }

  return <>{children}</>;
}
