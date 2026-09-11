"use client";

import type { ReactNode } from "react";
import { usePathname } from "next/navigation";
import { RouteGuard } from "@/components/auth/RouteGuard";
import { Footer } from "@/components/layout/footer";
import { Navbar } from "@/components/layout/navbar";
import { FloatingCartButton } from "@/components/cart/FloatingCartButton";

export function AppShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const isAdminRoute = pathname === "/admin" || pathname.startsWith("/admin/");
  const isStoreRoute = pathname === "/store" || pathname.startsWith("/store/");

  if (isAdminRoute || isStoreRoute) {
    return <><RouteGuard>{children}</RouteGuard><FloatingCartButton /></>;
  }

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="flex-1">
        <RouteGuard>{children}</RouteGuard>
      </main>
      <Footer />
      <FloatingCartButton />
    </div>
  );
}