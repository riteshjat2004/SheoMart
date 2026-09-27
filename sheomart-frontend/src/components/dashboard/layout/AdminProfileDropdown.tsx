"use client";

import { useState, useRef, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  UserCircle2,
  Shield,
  Settings,
  FileText,
  Bell,
  PanelLeftClose,
  PanelLeftOpen,
  Rows,
  Laptop,
  LogOut,
  ChevronDown,
  Sparkles,
  ExternalLink,
} from "lucide-react";
import { useAuthStore } from "@/store/auth-store";
import { useAppStore } from "@/store/app-store";
import { ConfirmDialog } from "@/components/dashboard/ConfirmDialog";
import { useProfile } from "@/hooks/useProfile";

export function AdminProfileDropdown() {
  const router = useRouter();
  const { user, logout } = useAuthStore();
  const {
    isSidebarCollapsed,
    toggleSidebarCollapse,
    denseMode,
    toggleDenseMode,
  } = useAppStore();

  const { data: profile } = useProfile();

  const [isOpen, setIsOpen] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [logoutScope, setLogoutScope] = useState<"current" | "others">("current");
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click or escape
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    }

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      document.addEventListener("keydown", handleKeyDown);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen]);

  const handleLogoutConfirm = async () => {
    setIsLoggingOut(true);
    try {
      if (logoutScope === "current") {
        logout();
        setIsOpen(false);
        setShowLogoutConfirm(false);
        router.push("/login");
      } else {
        // Logout other sessions: navigate to security
        setShowLogoutConfirm(false);
        setIsOpen(false);
        router.push("/admin/security");
      }
    } finally {
      setIsLoggingOut(false);
    }
  };

  const userInitial = user?.name ? user.name.charAt(0).toUpperCase() : "A";
  const userRoleFormatted =
    user?.role === "platform_admin"
      ? "Super Administrator"
      : user?.role === "store_owner"
      ? "Store Merchant"
      : "Customer";

  const avatarUrl = profile?.avatar || "/logo/admin-avatar.jpg";
  const displayName = profile?.name ?? user?.name ?? "Platform Admin";
  const displayEmail = profile?.email ?? user?.email ?? "admin@sheomart.com";

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className="flex items-center gap-2.5 rounded-full border border-stone-200/80 bg-white/90 p-1.5 pr-3 text-sm font-medium text-stone-700 shadow-xs transition hover:border-emerald-500/50 hover:bg-stone-50 dark:border-stone-800 dark:bg-stone-900/90 dark:text-stone-200 dark:hover:border-emerald-500/50 dark:hover:bg-stone-800/80"
        aria-haspopup="menu"
        aria-expanded={isOpen}
        aria-label="Admin user menu"
      >
        {/* Trigger Avatar */}
        <div className="relative shrink-0">
          {avatarUrl ? (
            <Image
              src={avatarUrl}
              alt={displayName}
              width={32}
              height={32}
              className="h-8 w-8 rounded-full object-cover ring-2 ring-emerald-500/30"
            />
          ) : (
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-linear-to-br from-emerald-500 to-teal-700 text-xs font-bold text-white shadow-xs ring-2 ring-emerald-500/30">
              {userInitial}
            </div>
          )}
          <span className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full border-2 border-white bg-emerald-500 dark:border-stone-900" />
        </div>

        <div className="hidden text-left lg:block">
          <p className="line-clamp-1 max-w-[120px] text-xs font-semibold leading-tight text-stone-900 dark:text-stone-100">
            {displayName}
          </p>
          <p className="text-[10px] font-medium text-emerald-600 dark:text-emerald-400">
            Super Admin
          </p>
        </div>

        <ChevronDown
          className={`h-3.5 w-3.5 text-stone-400 transition-transform duration-200 ${
            isOpen ? "rotate-180 text-emerald-600" : ""
          }`}
        />
      </button>

      {isOpen && (
        <div className="absolute right-0 z-50 mt-2 w-72 origin-top-right rounded-2xl border border-stone-200 bg-white p-2 shadow-2xl ring-1 ring-black/5 animate-in fade-in zoom-in-95 duration-150 dark:border-stone-800 dark:bg-stone-950 dark:shadow-stone-950/80">
          {/* User Profile Header Card */}
          <div className="rounded-xl bg-linear-to-br from-stone-50 to-stone-100/70 p-3.5 dark:from-stone-900/80 dark:to-stone-900/40 border border-stone-200/60 dark:border-stone-800/60">
            <div className="flex items-center gap-3">
              {/* Large Header Avatar */}
              <div className="shrink-0">
                {avatarUrl ? (
                  <Image
                    src={avatarUrl}
                    alt={displayName}
                    width={48}
                    height={48}
                    className="h-12 w-12 rounded-full object-cover ring-2 ring-emerald-500/40 shadow-xs"
                  />
                ) : (
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-linear-to-br from-emerald-600 to-teal-800 text-base font-bold text-white shadow-md ring-2 ring-emerald-500/40">
                    {userInitial}
                  </div>
                )}
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-bold text-stone-900 dark:text-stone-50">
                  {displayName}
                </p>
                <p className="truncate text-xs text-stone-500 dark:text-stone-400">
                  {displayEmail}
                </p>
                <div className="mt-1 flex items-center gap-1.5">
                  <span className="inline-flex items-center rounded-md bg-emerald-500/10 px-1.5 py-0.5 text-[10px] font-semibold text-emerald-700 dark:text-emerald-400 border border-emerald-500/20">
                    <Sparkles className="mr-1 h-2.5 w-2.5" />
                    {userRoleFormatted}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="my-1.5 border-t border-stone-200/70 dark:border-stone-800/70" />

          {/* Account Section */}
          <div className="px-1 py-1">
            <p className="px-2 pb-1 text-[10px] font-bold uppercase tracking-wider text-stone-400 dark:text-stone-500">
              Account
            </p>
            <Link
              href="/admin/settings?tab=general"
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-2.5 rounded-xl px-2.5 py-2 text-xs font-medium text-stone-700 transition hover:bg-stone-100 hover:text-stone-900 dark:text-stone-300 dark:hover:bg-stone-800/80 dark:hover:text-stone-50"
            >
              <UserCircle2 className="h-4 w-4 text-stone-400" />
              <span>My Profile</span>
            </Link>
            <Link
              href="/admin/security"
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-2.5 rounded-xl px-2.5 py-2 text-xs font-medium text-stone-700 transition hover:bg-stone-100 hover:text-stone-900 dark:text-stone-300 dark:hover:bg-stone-800/80 dark:hover:text-stone-50"
            >
              <Shield className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
              <span>Security</span>
            </Link>
            <Link
              href="/admin/settings?tab=notifications"
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-2.5 rounded-xl px-2.5 py-2 text-xs font-medium text-stone-700 transition hover:bg-stone-100 hover:text-stone-900 dark:text-stone-300 dark:hover:bg-stone-800/80 dark:hover:text-stone-50"
            >
              <Bell className="h-4 w-4 text-stone-400" />
              <span>Notification Preferences</span>
            </Link>
          </div>

          <div className="my-1.5 border-t border-stone-200/70 dark:border-stone-800/70" />

          {/* Platform Section */}
          <div className="px-1 py-1">
            <p className="px-2 pb-1 text-[10px] font-bold uppercase tracking-wider text-stone-400 dark:text-stone-500">
              Platform
            </p>
            <Link
              href="/admin/settings"
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-2.5 rounded-xl px-2.5 py-2 text-xs font-medium text-stone-700 transition hover:bg-stone-100 hover:text-stone-900 dark:text-stone-300 dark:hover:bg-stone-800/80 dark:hover:text-stone-50"
            >
              <Settings className="h-4 w-4 text-stone-400" />
              <span>Settings</span>
            </Link>
            <Link
              href="/admin/settings?tab=audit"
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-2.5 rounded-xl px-2.5 py-2 text-xs font-medium text-stone-700 transition hover:bg-stone-100 hover:text-stone-900 dark:text-stone-300 dark:hover:bg-stone-800/80 dark:hover:text-stone-50"
            >
              <FileText className="h-4 w-4 text-stone-400" />
              <span>Audit Logs</span>
            </Link>
          </div>

          <div className="my-1.5 border-t border-stone-200/70 dark:border-stone-800/70" />

          {/* Session Section */}
          <div className="px-1 py-1">
            <p className="px-2 pb-1 text-[10px] font-bold uppercase tracking-wider text-stone-400 dark:text-stone-500">
              Session
            </p>
            <Link
              href="/admin/security#sessions"
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-2.5 rounded-xl px-2.5 py-2 text-xs font-medium text-stone-700 transition hover:bg-stone-100 hover:text-stone-900 dark:text-stone-300 dark:hover:bg-stone-800/80 dark:hover:text-stone-50"
            >
              <Laptop className="h-4 w-4 text-stone-400" />
              <span>Active Sessions</span>
            </Link>
            <button
              type="button"
              onClick={() => {
                setLogoutScope("current");
                setShowLogoutConfirm(true);
              }}
              className="flex w-full items-center gap-2.5 rounded-xl px-2.5 py-2 text-left text-xs font-semibold text-rose-600 transition hover:bg-rose-50 hover:text-rose-700 dark:text-rose-400 dark:hover:bg-rose-950/40 dark:hover:text-rose-300"
            >
              <LogOut className="h-4 w-4" />
              <span>Logout</span>
            </button>
          </div>
        </div>
      )}

      {/* Logout Confirmation Dialog */}
      <ConfirmDialog
        open={showLogoutConfirm}
        onClose={() => setShowLogoutConfirm(false)}
        onConfirm={handleLogoutConfirm}
        title={logoutScope === "current" ? "Confirm Admin Logout" : "Sign Out Other Sessions"}
        description={
          logoutScope === "current"
            ? "Are you sure you want to end your current administrative session? You will be redirected to the sign in page."
            : "This will terminate all other active browser and device sessions for your account."
        }
        confirmLabel="Log out"
        confirmVariant="destructive"
        isConfirming={isLoggingOut}
        icon={<LogOut className="h-5 w-5 text-rose-600 dark:text-rose-400" />}
      />
    </div>
  );
}
