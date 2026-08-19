"use client";

import type { ReactNode } from "react";
import { usePathname } from "next/navigation";
import { RouteGuard } from "@/components/auth/RouteGuard";
import { Footer } from "@/components/layout/footer";
import { Navbar } from "@/components/layout/navbar";

export function AppShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const isAdminRoute = pathname === "/admin" || pathname.startsWith("/admin/");

  if (isAdminRoute) {
    return <RouteGuard>{children}</RouteGuard>;
  }

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="flex-1">
        <RouteGuard>{children}</RouteGuard>
      </main>
      <Footer />
    </div>
  );
}