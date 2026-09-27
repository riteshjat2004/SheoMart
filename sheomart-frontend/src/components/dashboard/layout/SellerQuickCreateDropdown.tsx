"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import {
  ChevronDown,
  Package,
  Plus,
  Receipt,
  TicketPercent,
  Boxes,
  FileEdit,
} from "lucide-react";
import { Button } from "@/components/ui/button";

const sellerSections = [
  {
    label: "Catalog & Pricing",
    items: [
      { label: "New Product", href: "/store/products", icon: Package, desc: "Add item to catalog", shortcut: "⌥P" },
      { label: "New Coupon", href: "/store/coupons", icon: TicketPercent, desc: "Create discount voucher", shortcut: "⌥C" },
    ],
  },
  {
    label: "Sales & Operations",
    items: [
      { label: "New Invoice", href: "/store/billing", icon: Receipt, desc: "Generate offline POS bill", shortcut: "⌥I" },
      { label: "Update Inventory", href: "/store/inventory", icon: Boxes, desc: "Adjust stock levels", shortcut: "⌥S" },
      { label: "Order Notes", href: "/store/orders", icon: FileEdit, desc: "Manage store orders", shortcut: "⌥O" },
    ],
  },
];

export function SellerQuickCreateDropdown() {
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
        onClick={() => setIsOpen((prev) => !prev)}
        className="h-8 gap-1.5 rounded-xl bg-emerald-600 px-3 text-xs font-semibold text-white shadow-2xs hover:bg-emerald-700 transition"
        aria-expanded={isOpen}
      >
        <Plus className="h-3.5 w-3.5" />
        <span className="hidden sm:inline">Quick Create</span>
        <ChevronDown className={`h-3 w-3 transition-transform ${isOpen ? "rotate-180" : ""}`} />
      </Button>

      {isOpen && (
        <div className="absolute right-0 top-full mt-2 w-72 origin-top-right rounded-2xl border border-stone-200/80 bg-white/95 p-2 shadow-xl backdrop-blur-md dark:border-stone-800/80 dark:bg-stone-900/95 z-50 animate-in fade-in zoom-in-95 duration-150">
          <div className="px-2 py-1.5 border-b border-stone-100 dark:border-stone-800 mb-1">
            <span className="text-[11px] font-bold uppercase tracking-wider text-stone-400 dark:text-stone-500">
              Seller Shortcuts
            </span>
          </div>

          <div className="space-y-3 py-1">
            {sellerSections.map((sec) => (
              <div key={sec.label}>
                <p className="px-2 pb-1 text-[10px] font-bold uppercase tracking-wider text-stone-400 dark:text-stone-500">
                  {sec.label}
                </p>
                <div className="space-y-0.5">
                  {sec.items.map((item) => {
                    const Icon = item.icon;
                    return (
                      <Link
                        key={item.label}
                        href={item.href}
                        onClick={() => setIsOpen(false)}
                        className="flex items-center justify-between rounded-xl px-2.5 py-1.5 text-xs text-stone-700 transition hover:bg-stone-100 hover:text-stone-900 dark:text-stone-300 dark:hover:bg-stone-800/80 dark:hover:text-stone-100 group"
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-stone-100 text-stone-500 group-hover:bg-emerald-50 group-hover:text-emerald-600 dark:bg-stone-800 dark:text-stone-400 dark:group-hover:bg-emerald-950/50 dark:group-hover:text-emerald-400 transition-colors">
                            <Icon className="h-3.5 w-3.5" />
                          </div>
                          <div className="truncate">
                            <p className="font-semibold text-stone-800 dark:text-stone-200 truncate">
                              {item.label}
                            </p>
                            <p className="text-[10px] text-stone-400 dark:text-stone-500 truncate">
                              {item.desc}
                            </p>
                          </div>
                        </div>
                        <kbd className="hidden font-mono text-[9px] text-stone-400 bg-stone-100 dark:bg-stone-800 px-1.5 py-0.5 rounded sm:inline">
                          {item.shortcut}
                        </kbd>
                      </Link>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
