"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useMemo, useState } from "react";
import { Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/store/auth-store";
import { dashboardNavigation } from "@/lib/dashboard-navigation";

interface SidebarProps {
  role: "platform_admin" | "store_owner" | "customer";
}

function SidebarContent({ role, onNavigate }: { role: SidebarProps["role"]; onNavigate?: () => void }) {
  const pathname = usePathname();
  const items = dashboardNavigation[role];

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center gap-3 border-b border-stone-200/70 px-5 py-4 dark:border-stone-800">
        <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-emerald-600 text-sm font-semibold text-white">SM</div>
        <div>
          <p className="text-sm font-semibold text-stone-900 dark:text-stone-50">SheoMart</p>
          <p className="text-xs text-stone-500 dark:text-stone-400">Dashboard</p>
        </div>
      </div>

      <nav aria-label="Dashboard navigation" className="flex-1 space-y-1 px-3 py-4">
        {items.map((item) => {
          const isDashboardItem = item.href === "/admin" || item.href === "/store";
          const isBillingItem = item.href === "/store/billing";
          const isActive = isDashboardItem || isBillingItem
            ? pathname === item.href
            : pathname === item.href || pathname.startsWith(`${item.href}/`);
          const Icon = item.icon;
          return (
            <Link
              key={item.id}
              href={item.href}
              onClick={onNavigate}
              className={`flex items-center gap-3 rounded-2xl px-3 py-2.5 text-sm font-medium transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 ${isActive ? "bg-emerald-600 text-white shadow-lg shadow-emerald-600/20" : "text-stone-600 hover:bg-stone-100 hover:text-stone-900 dark:text-stone-300 dark:hover:bg-stone-800 dark:hover:text-stone-50"}`}
            >
              <Icon className="h-4 w-4" />
              <span>{item.title}</span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}

export function Sidebar({ role }: SidebarProps) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { user } = useAuthStore();

  const currentRole = useMemo(() => role ?? user?.role ?? "store_owner", [role, user?.role]);

  return (
    <>
      <div className="sticky top-0 z-30 flex items-center justify-between border-b border-stone-200/70 bg-white/90 px-4 py-3 backdrop-blur dark:border-stone-800 dark:bg-stone-950/90 lg:hidden">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-emerald-600 text-sm font-semibold text-white">SM</div>
          <div>
            <p className="text-sm font-semibold text-stone-900 dark:text-stone-50">SheoMart</p>
            <p className="text-xs text-stone-500 dark:text-stone-400">Dashboard</p>
          </div>
        </div>
        <Button variant="ghost" size="icon" aria-label="Toggle navigation" onClick={() => setMobileOpen((value) => !value)}>
          {mobileOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
        </Button>
      </div>

      {mobileOpen ? (
        <div className="fixed inset-0 z-40 bg-stone-950/50 lg:hidden" onClick={() => setMobileOpen(false)}>
          <div className="h-full w-72 border-r border-stone-200 bg-white shadow-xl dark:border-stone-800 dark:bg-stone-950" onClick={(event) => event.stopPropagation()}>
            <SidebarContent role={currentRole} onNavigate={() => setMobileOpen(false)} />
          </div>
        </div>
      ) : null}

      <aside className="hidden h-screen w-72 shrink-0 border-r border-stone-200/70 bg-white/90 backdrop-blur xl:flex dark:border-stone-800 dark:bg-stone-950/90">
        <SidebarContent role={currentRole} />
      </aside>
    </>
  );
}
