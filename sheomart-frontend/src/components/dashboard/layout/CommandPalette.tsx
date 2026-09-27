"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  BarChart3,
  Boxes,
  FileText,
  KeyRound,
  Laptop,
  Layers,
  LayoutGrid,
  Package,
  PlusCircle,
  Search,
  Server,
  Settings,
  Shield,
  ShoppingBag,
  Sparkles,
  Store,
  Tag,
  TicketPercent,
  Users,
  Wrench,
  X,
} from "lucide-react";
import { useAppStore } from "@/store/app-store";

interface CommandItem {
  id: string;
  title: string;
  category: "Navigation" | "Quick Action" | "System";
  icon: any;
  href: string;
  keywords?: string[];
}

const COMMANDS: CommandItem[] = [
  // Navigation
  { id: "nav-dashboard", title: "Dashboard Overview", category: "Navigation", icon: LayoutGrid, href: "/admin", keywords: ["home", "main"] },
  { id: "nav-analytics", title: "Marketplace Analytics", category: "Navigation", icon: BarChart3, href: "/admin/analytics", keywords: ["revenue", "stats", "charts", "kpis"] },
  { id: "nav-users", title: "User Management", category: "Navigation", icon: Users, href: "/admin/users", keywords: ["customers", "sellers", "roles", "accounts"] },
  { id: "nav-stores", title: "Store Management", category: "Navigation", icon: Store, href: "/admin/stores", keywords: ["sellers", "shops", "approvals"] },
  { id: "nav-categories", title: "Category Taxonomy", category: "Navigation", icon: Layers, href: "/admin/categories", keywords: ["catalog", "hierarchy"] },
  { id: "nav-products", title: "Product Catalog", category: "Navigation", icon: Package, href: "/admin/products", keywords: ["items", "inventory", "stock"] },
  { id: "nav-coupons", title: "Coupons & Discounts", category: "Navigation", icon: TicketPercent, href: "/admin/coupons", keywords: ["promo", "vouchers"] },
  { id: "nav-offers", title: "Promotional Offers", category: "Navigation", icon: Tag, href: "/admin/offers", keywords: ["banner", "deals"] },
  { id: "nav-reviews", title: "Review Moderation", category: "Navigation", icon: ShoppingBag, href: "/admin/reviews", keywords: ["ratings", "feedback", "spam"] },
  { id: "nav-security", title: "Security & Sessions", category: "Navigation", icon: Shield, href: "/admin/security", keywords: ["devices", "password reset", "tokens"] },
  { id: "nav-settings", title: "Platform Settings", category: "Navigation", icon: Settings, href: "/admin/settings", keywords: ["general", "branding", "delivery", "payments"] },
  { id: "nav-audit", title: "Audit Trail Logs", category: "Navigation", icon: FileText, href: "/admin/settings", keywords: ["activity", "history", "admin logs"] },
  { id: "nav-about", title: "System Diagnostics", category: "Navigation", icon: Server, href: "/admin/settings", keywords: ["health", "versions", "database", "uptime"] },

  // Quick Actions
  { id: "act-new-product", title: "Create New Product", category: "Quick Action", icon: PlusCircle, href: "/admin/products", keywords: ["add product", "new item"] },
  { id: "act-new-store", title: "Review Store Applications", category: "Quick Action", icon: Store, href: "/admin/stores", keywords: ["pending stores", "approve store"] },
  { id: "act-new-category", title: "Add Product Category", category: "Quick Action", icon: Layers, href: "/admin/categories", keywords: ["new category"] },
  { id: "act-new-coupon", title: "Create Discount Coupon", category: "Quick Action", icon: TicketPercent, href: "/admin/coupons", keywords: ["add coupon", "new code"] },
  { id: "act-new-offer", title: "Create Promotional Offer", category: "Quick Action", icon: Tag, href: "/admin/offers", keywords: ["new deal", "add offer"] },
  { id: "act-new-user", title: "Add Administrator / User", category: "Quick Action", icon: Users, href: "/admin/users", keywords: ["new user", "invite user"] },
  { id: "act-sessions", title: "Inspect Active Sessions", category: "Quick Action", icon: Laptop, href: "/admin/security", keywords: ["devices", "connected devices"] },
  { id: "act-backup", title: "Generate Platform Backup", category: "Quick Action", icon: Server, href: "/admin/settings", keywords: ["backup", "download snapshot"] },
  { id: "act-maintenance", title: "Toggle Maintenance Mode", category: "Quick Action", icon: Wrench, href: "/admin/settings", keywords: ["maintenance", "downtime"] },
];

export function CommandPalette() {
  const router = useRouter();
  const { isCommandPaletteOpen, setCommandPaletteOpen } = useAppStore();
  const [query, setQuery] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);

  // Global Ctrl + K / Cmd + K listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setCommandPaletteOpen(!isCommandPaletteOpen);
      } else if (e.key === "Escape" && isCommandPaletteOpen) {
        setCommandPaletteOpen(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isCommandPaletteOpen, setCommandPaletteOpen]);

  // Filter commands
  const filteredCommands = useMemo(() => {
    if (!query.trim()) return COMMANDS;
    const lower = query.toLowerCase().trim();
    return COMMANDS.filter((cmd) => {
      const matchTitle = cmd.title.toLowerCase().includes(lower);
      const matchCategory = cmd.category.toLowerCase().includes(lower);
      const matchKeywords = cmd.keywords?.some((k) => k.toLowerCase().includes(lower));
      return matchTitle || matchCategory || matchKeywords;
    });
  }, [query]);

  // Reset index when query changes
  useEffect(() => {
    setSelectedIndex(0);
  }, [query]);

  const handleSelect = (href: string) => {
    setCommandPaletteOpen(false);
    setQuery("");
    router.push(href);
  };

  const handleInputKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIndex((prev) => (prev < filteredCommands.length - 1 ? prev + 1 : 0));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIndex((prev) => (prev > 0 ? prev - 1 : filteredCommands.length - 1));
    } else if (e.key === "Enter" && filteredCommands[selectedIndex]) {
      e.preventDefault();
      handleSelect(filteredCommands[selectedIndex].href);
    }
  };

  if (!isCommandPaletteOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center bg-stone-950/70 p-4 pt-16 sm:pt-24 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={() => setCommandPaletteOpen(false)}
      role="dialog"
      aria-modal="true"
    >
      <div
        className="relative w-full max-w-2xl rounded-2xl border border-stone-200 bg-white shadow-2xl overflow-hidden dark:border-stone-800 dark:bg-stone-900 animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search Input Bar */}
        <div className="flex items-center gap-3 border-b border-stone-200 px-4 py-3.5 dark:border-stone-800">
          <Search className="h-5 w-5 text-stone-400 shrink-0" />
          <input
            type="text"
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleInputKeyDown}
            placeholder="Type a command or search pages, settings, actions..."
            className="w-full bg-transparent text-sm text-stone-900 placeholder:text-stone-400 outline-none dark:text-stone-100"
          />
          {query ? (
            <button
              type="button"
              onClick={() => setQuery("")}
              className="rounded p-1 text-stone-400 hover:text-stone-600 dark:hover:text-stone-200"
            >
              <X className="h-4 w-4" />
            </button>
          ) : (
            <kbd className="hidden sm:inline-block rounded bg-stone-100 px-1.5 py-0.5 text-[10px] font-semibold text-stone-500 border border-stone-200 dark:bg-stone-800 dark:border-stone-700 dark:text-stone-400">
              ESC
            </kbd>
          )}
        </div>

        {/* Results List */}
        <div className="max-h-96 overflow-y-auto p-2">
          {filteredCommands.length === 0 ? (
            <div className="py-12 text-center text-xs text-stone-400">
              No matching pages or actions found for &quot;{query}&quot;
            </div>
          ) : (
            <div className="space-y-1">
              {filteredCommands.map((cmd, idx) => {
                const Icon = cmd.icon;
                const isSelected = selectedIndex === idx;

                return (
                  <button
                    key={cmd.id}
                    type="button"
                    onClick={() => handleSelect(cmd.href)}
                    onMouseEnter={() => setSelectedIndex(idx)}
                    className={`flex w-full items-center justify-between rounded-xl px-3.5 py-2.5 text-left text-xs transition ${
                      isSelected
                        ? "bg-emerald-600 text-white shadow-sm"
                        : "text-stone-700 hover:bg-stone-100 dark:text-stone-200 dark:hover:bg-stone-800"
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div
                        className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-lg ${
                          isSelected
                            ? "bg-white/20 text-white"
                            : "bg-stone-100 text-stone-600 dark:bg-stone-800 dark:text-stone-300"
                        }`}
                      >
                        <Icon className="h-4 w-4" />
                      </div>
                      <span className="font-semibold truncate">{cmd.title}</span>
                    </div>

                    <span
                      className={`text-[10px] font-medium uppercase tracking-wider rounded px-1.5 py-0.5 ${
                        isSelected
                          ? "bg-emerald-700 text-emerald-100"
                          : "bg-stone-100 text-stone-500 dark:bg-stone-800 dark:text-stone-400"
                      }`}
                    >
                      {cmd.category}
                    </span>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer Navigation Hints */}
        <div className="flex items-center justify-between border-t border-stone-100 bg-stone-50/70 px-4 py-2 text-[11px] text-stone-400 dark:border-stone-800 dark:bg-stone-950/50">
          <div className="flex items-center gap-3">
            <span>
              <kbd className="font-mono">↑</kbd> <kbd className="font-mono">↓</kbd> to navigate
            </span>
            <span>
              <kbd className="font-mono">↵</kbd> to select
            </span>
          </div>
          <span>SheoMart Enterprise Command Bar</span>
        </div>
      </div>
    </div>
  );
}
