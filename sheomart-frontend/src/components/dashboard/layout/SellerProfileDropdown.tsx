"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  User,
  Settings,
  Receipt,
  BarChart3,
  Shield,
  HelpCircle,
  LogOut,
  ChevronDown,
  Store,
  BadgeCheck,
  Crown,
  Home,
} from "lucide-react";
import { useAuthStore } from "@/store/auth-store";
import { useProfile } from "@/hooks/useProfile";
import { useQuery } from "@tanstack/react-query";
import { fetchMyStore } from "@/services/store";

export function SellerProfileDropdown() {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const { user, logout } = useAuthStore();
  const { data: profile } = useProfile();
  const storeQuery = useQuery({
    queryKey: ["my-store"],
    queryFn: fetchMyStore,
    staleTime: 1000 * 60 * 5,
  });

  const store = storeQuery.data;
  const storeName = store?.storeName || store?.name || "My Store";
  const sellerName = profile?.name ?? user?.name ?? "Store Owner";
  const sellerEmail = profile?.email ?? user?.email ?? "seller@sheomart.com";
  const storeLogo = store?.logo;
  const badge = store?.badge || "normal";
  const initial = storeName.charAt(0).toUpperCase();

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen]);

  const menuItems = [
    { label: "Visit Home Page", href: "/", icon: Home },
    { label: "Account Profile", href: "/profile", icon: User },
    { label: "Store Settings", href: "/store/settings", icon: Settings },
    { label: "Billing & POS", href: "/store/billing", icon: Receipt },
    { label: "Store Analytics", href: "/store/analytics", icon: BarChart3 },
    { label: "Security & Login", href: "/profile#security", icon: Shield },
    { label: "Help & Support", href: "/store/settings#support", icon: HelpCircle },
  ];

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className="flex items-center gap-2.5 rounded-xl border border-stone-200/80 bg-white/80 p-1.5 pr-2.5 transition hover:bg-stone-100 hover:border-stone-300 dark:border-stone-800/80 dark:bg-stone-900/80 dark:hover:bg-stone-800"
        aria-expanded={isOpen}
      >
        <div className="relative flex h-8 w-8 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-emerald-100 ring-1 ring-emerald-500/20 dark:bg-emerald-950">
          {storeLogo ? (
            <Image
              src={storeLogo}
              alt={storeName}
              width={32}
              height={32}
              className="h-full w-full object-cover"
            />
          ) : (
            <span className="text-xs font-bold text-emerald-700 dark:text-emerald-300">
              {initial}
            </span>
          )}
        </div>

        <div className="hidden text-left sm:block">
          <div className="flex items-center gap-1.5">
            <span className="text-xs font-semibold text-stone-900 dark:text-stone-100 truncate max-w-[120px]">
              {storeName}
            </span>
            {badge === "verified" && (
              <BadgeCheck className="h-3.5 w-3.5 text-blue-500 shrink-0" />
            )}
            {badge === "royal" && (
              <Crown className="h-3.5 w-3.5 text-amber-500 shrink-0" />
            )}
          </div>
          <span className="block text-[10px] text-stone-400 dark:text-stone-500 truncate max-w-[120px]">
            {sellerName}
          </span>
        </div>

        <ChevronDown
          className={`h-3.5 w-3.5 text-stone-400 transition-transform ${
            isOpen ? "rotate-180" : ""
          }`}
        />
      </button>

      {isOpen && (
        <div className="absolute right-0 top-full mt-2 w-64 origin-top-right rounded-2xl border border-stone-200/80 bg-white/95 p-1.5 shadow-2xl backdrop-blur-md dark:border-stone-800/80 dark:bg-stone-900/95 z-50 animate-in fade-in zoom-in-95 duration-150">
          {/* Header Card */}
          <div className="rounded-xl bg-stone-50 p-3 dark:bg-stone-800/50 mb-1 border border-stone-100 dark:border-stone-800">
            <div className="flex items-center gap-2.5">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-emerald-100 ring-1 ring-emerald-500/20 dark:bg-emerald-950">
                {storeLogo ? (
                  <Image
                    src={storeLogo}
                    alt={storeName}
                    width={40}
                    height={40}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <Store className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                )}
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-1.5">
                  <p className="truncate text-xs font-bold text-stone-900 dark:text-stone-100">
                    {storeName}
                  </p>
                  {badge === "verified" && (
                    <span className="rounded bg-blue-50 px-1 py-0.5 text-[9px] font-bold text-blue-600 dark:bg-blue-950/60 dark:text-blue-400 border border-blue-500/20">
                      Verified
                    </span>
                  )}
                  {badge === "royal" && (
                    <span className="rounded bg-amber-50 px-1 py-0.5 text-[9px] font-bold text-amber-600 dark:bg-amber-950/60 dark:text-amber-400 border border-amber-500/20">
                      Royal
                    </span>
                  )}
                </div>
                <p className="text-[11px] font-medium text-stone-500 dark:text-stone-400 truncate">
                  {sellerName}
                </p>
                <p className="text-[10px] text-stone-400 truncate">{sellerEmail}</p>
              </div>
            </div>
          </div>

          {/* Navigation Links */}
          <div className="space-y-0.5 py-1">
            {menuItems.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setIsOpen(false)}
                  className="flex items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-medium text-stone-700 transition hover:bg-stone-100 hover:text-stone-900 dark:text-stone-300 dark:hover:bg-stone-800 dark:hover:text-stone-100"
                >
                  <Icon className="h-4 w-4 text-stone-400" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </div>

          {/* Logout Section */}
          <div className="border-t border-stone-100 pt-1 dark:border-stone-800">
            <button
              type="button"
              onClick={() => {
                setIsOpen(false);
                logout();
              }}
              className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-medium text-rose-600 transition hover:bg-rose-50 dark:text-rose-400 dark:hover:bg-rose-950/30"
            >
              <LogOut className="h-4 w-4" />
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
