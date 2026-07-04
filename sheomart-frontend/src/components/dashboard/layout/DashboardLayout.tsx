"use client";

import type { ReactNode } from "react";
import { Sidebar } from "@/components/dashboard/layout/Sidebar";
import { Topbar } from "@/components/dashboard/layout/Topbar";
import type { UserRole } from "@/types/auth";

interface DashboardLayoutProps {
  children: ReactNode;
  role: UserRole;
}

export function DashboardLayout({ children, role }: DashboardLayoutProps) {
  return (
    <div className="min-h-screen bg-stone-50 text-stone-900 dark:bg-stone-950 dark:text-stone-100">
      <div className="flex min-h-screen flex-col xl:flex-row">
        <Sidebar role={role} />
        <div className="flex min-h-screen flex-1 flex-col">
          <Topbar />
          <main className="flex-1 px-4 py-6 sm:px-6 lg:px-8">{children}</main>
        </div>
      </div>
    </div>
  );
}
