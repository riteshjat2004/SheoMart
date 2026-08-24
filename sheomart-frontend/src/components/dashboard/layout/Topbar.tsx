"use client";

import Link from "next/link";
import { Bell, ChevronDown, LogOut, UserCircle2 } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/store/auth-store";

export function Topbar() {
  const { user, logout } = useAuthStore();
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-20 border-b border-stone-200/70 bg-white/90 backdrop-blur dark:border-stone-800 dark:bg-stone-950/90">
      <div className="flex items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.24em] text-emerald-600">Operations</p>
          <h1 className="text-lg font-semibold text-stone-900 dark:text-stone-50">Welcome back</h1>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" aria-label="Notifications">
            <Bell className="h-4 w-4" />
          </Button>

          <div className="relative">
            <button
              type="button"
              onClick={() => setOpen((value) => !value)}
              className="flex items-center gap-2 rounded-full border border-stone-200 bg-white px-2 py-2 text-sm font-medium text-stone-700 transition hover:border-emerald-400 hover:text-emerald-600 dark:border-stone-800 dark:bg-stone-900 dark:text-stone-200"
              aria-haspopup="menu"
              aria-expanded={open}
            >
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-600 text-sm font-semibold text-white">
                {user?.name?.[0] ?? "U"}
              </div>
              <span className="hidden sm:block">{user?.name ?? "User"}</span>
              <ChevronDown className="mr-1 h-4 w-4" />
            </button>

            {open ? (
              <div className="absolute right-0 mt-2 w-56 rounded-2xl border border-stone-200 bg-white p-2 shadow-xl dark:border-stone-800 dark:bg-stone-900">
                <Link href="/" className="flex items-center gap-3 rounded-xl px-3 py-2 text-sm text-stone-700 transition hover:bg-stone-100 dark:text-stone-200 dark:hover:bg-stone-800">
                  <UserCircle2 className="h-4 w-4" />
                  View storefront
                </Link>
                <button
                  type="button"
                  onClick={() => {
                    logout();
                    setOpen(false);
                  }}
                  className="flex w-full items-center gap-3 rounded-xl px-3 py-2 text-left text-sm text-stone-700 transition hover:bg-stone-100 dark:text-stone-200 dark:hover:bg-stone-800"
                >
                  <LogOut className="h-4 w-4" />
                  Logout
                </button>
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </header>
  );
}
