"use client";

import { type ReactNode, useEffect, useRef, useState, useCallback } from "react";
import { usePathname } from "next/navigation";
import { Sidebar } from "@/components/dashboard/layout/Sidebar";
import { Topbar } from "@/components/dashboard/layout/Topbar";
import { CommandPalette } from "@/components/dashboard/layout/CommandPalette";
import { useAppStore } from "@/store/app-store";
import type { UserRole } from "@/types/auth";

interface DashboardLayoutProps {
  children: ReactNode;
  role: UserRole;
}

export function DashboardLayout({ children, role }: DashboardLayoutProps) {
  const pathname = usePathname();
  const { isSidebarCollapsed, hydrateSidebar } = useAppStore();
  const mainRef = useRef<HTMLElement | null>(null);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    hydrateSidebar();
  }, [hydrateSidebar]);

  // Automatically scroll main content to top on page navigation
  useEffect(() => {
    if (mainRef.current) {
      mainRef.current.scrollTo({ top: 0, behavior: "instant" });
    }
    setIsScrolled(false);
  }, [pathname]);

  const handleScroll = useCallback((e: React.UIEvent<HTMLElement>) => {
    const scrollTop = e.currentTarget.scrollTop;
    if (scrollTop > 8) {
      setIsScrolled((prev) => (prev ? prev : true));
    } else {
      setIsScrolled((prev) => (!prev ? prev : false));
    }
  }, []);

  return (
    <div className="min-h-screen lg:h-screen lg:overflow-hidden bg-stone-50 text-stone-900 transition-colors dark:bg-stone-950 dark:text-stone-100">
      {/* Fixed Desktop Sidebar & Mobile Drawer */}
      <Sidebar role={role} />

      {/* Main Content Wrapper (offset on desktop by sidebar width) */}
      <div
        className={`flex min-h-screen flex-col transition-all duration-300 ease-in-out lg:h-screen lg:overflow-hidden ${
          isSidebarCollapsed ? "lg:pl-20" : "lg:pl-64"
        }`}
      >
        <Topbar role={role} isScrolled={isScrolled} />
        <main
          ref={mainRef}
          id="dashboard-main-content"
          onScroll={handleScroll}
          className="flex-1 overflow-y-auto px-4 py-6 sm:px-6 lg:px-8 scrollbar-thin scroll-smooth focus:outline-none"
          tabIndex={-1}
        >
          {children}
        </main>
      </div>

      <CommandPalette />
    </div>
  );
}
