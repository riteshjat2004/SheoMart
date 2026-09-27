"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import {
  ChevronDown,
  Layers,
  Package,
  Plus,
  Store,
  Tag,
  TicketPercent,
  UserPlus,
} from "lucide-react";
import { Button } from "@/components/ui/button";

const sections = [
  {
    label: "Marketplace",
    items: [
      { label: "New Store", href: "/admin/stores", icon: Store, desc: "Onboard seller store", shortcut: "⌥S" },
      { label: "New Product", href: "/admin/products", icon: Package, desc: "Add catalog item", shortcut: "⌥P" },
      { label: "New Category", href: "/admin/categories", icon: Layers, desc: "Create taxonomy", shortcut: "⌥C" },
    ],
  },
  {
    label: "Marketing",
    items: [
      { label: "New Coupon", href: "/admin/coupons", icon: TicketPercent, desc: "Create discount code", shortcut: "⌥K" },
      { label: "New Offer", href: "/admin/offers", icon: Tag, desc: "Create promotional banner", shortcut: "⌥O" },
    ],
  },
  {
    label: "Users",
    items: [
      { label: "New User", href: "/admin/users", icon: UserPlus, desc: "Create account", shortcut: "⌥U" },
    ],
  },
];

export function QuickCreateDropdown() {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

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

  return (
    <div className="relative" ref={dropdownRef}>
      <Button
        size="sm"
        onClick={() => setIsOpen(!isOpen)}
        className="h-9 gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-xl shadow-xs"
      >
        <Plus className="h-3.5 w-3.5" />
        <span className="hidden sm:inline">Quick Create</span>
        <ChevronDown className="h-3 w-3 opacity-80" />
      </Button>

      {isOpen && (
        <div className="absolute right-0 top-11 z-50 w-60 rounded-xl border border-stone-200 bg-white p-1.5 shadow-xl dark:border-stone-800 dark:bg-stone-950 animate-in zoom-in-95 duration-150">
          {sections.map((section, sIdx) => (
            <div key={section.label}>
              {/* Section divider (skip for first) */}
              {sIdx > 0 && (
                <div className="my-1 border-t border-stone-100 dark:border-stone-800" />
              )}

              {/* Section label */}
              <p className="px-2.5 pt-2 pb-1 text-[10px] font-bold uppercase tracking-wider text-stone-400 dark:text-stone-500">
                {section.label}
              </p>

              {/* Items */}
              {section.items.map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.label}
                    href={item.href}
                    onClick={() => setIsOpen(false)}
                    className="flex items-center gap-2.5 rounded-lg px-2.5 py-1.5 text-xs font-medium text-stone-700 hover:bg-stone-100 hover:text-stone-900 dark:text-stone-300 dark:hover:bg-stone-800 dark:hover:text-stone-100 transition"
                  >
                    <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-stone-100 text-stone-600 dark:bg-stone-800 dark:text-stone-300">
                      <Icon className="h-3.5 w-3.5" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <span className="block text-[12px] font-semibold leading-tight">{item.label}</span>
                      <span className="block text-[10px] text-stone-400 leading-tight">{item.desc}</span>
                    </div>
                    {item.shortcut && (
                      <kbd className="rounded border border-stone-200 bg-stone-50 px-1 py-0.5 text-[9px] font-mono font-medium text-stone-400 dark:border-stone-800 dark:bg-stone-900">
                        {item.shortcut}
                      </kbd>
                    )}
                  </Link>
                );
              })}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
