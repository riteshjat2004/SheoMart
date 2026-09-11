"use client";

import Link from "next/link";
import { ShoppingCart, ArrowRight } from "lucide-react";
import { usePathname } from "next/navigation";
import { useCart } from "@/hooks/use-cart";
import { useAuthStore } from "@/store/auth-store";

const money = (value: number) => `₹${Math.max(0, value).toLocaleString("en-IN")}`;

export function FloatingCartButton() {
  const pathname = usePathname();
  const role = useAuthStore((state) => state.role);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const cartQuery = useCart();
  const excludedRoute = pathname === "/login" || pathname === "/register" || pathname === "/checkout" || pathname === "/orders" || pathname.startsWith("/orders/") || pathname === "/profile" || pathname.startsWith("/profile/") || pathname.startsWith("/admin") || pathname === "/store" || pathname.startsWith("/store/");

  if (!isAuthenticated || role !== "customer" || excludedRoute || cartQuery.isLoading || cartQuery.isError) {
    return null;
  }

  const cart = cartQuery.data;
  const itemCount = cart?.summary?.totalItems ?? 0;
  if (itemCount < 1) return null;

  const payable = Math.max(0, (cart?.summary?.subtotal ?? 0) - (cart?.summary?.estimatedSavings ?? 0));
  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-[calc(5.5rem+env(safe-area-inset-bottom))] z-30 flex justify-end px-4 sm:bottom-[calc(1.5rem+env(safe-area-inset-bottom))] sm:right-6 sm:px-0">
      <Link
        key={`${itemCount}-${payable}`}
        href="/checkout"
        aria-label={`View cart with ${itemCount} ${itemCount === 1 ? "item" : "items"} totaling ${money(payable)}`}
        className="pointer-events-auto flex min-h-12 items-center gap-3 rounded-full bg-gradient-to-r from-emerald-600 via-emerald-500 to-teal-500 px-4 py-2.5 text-white shadow-[0_14px_36px_-12px_rgba(16,185,129,0.9)] transition duration-300 hover:-translate-y-1 hover:shadow-[0_18px_42px_-12px_rgba(16,185,129,1)] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-emerald-300/50 motion-safe:animate-[float-in_350ms_ease-out] motion-reduce:animate-none"
      >
        <span className="relative flex h-9 w-9 items-center justify-center rounded-full bg-white/15">
          <ShoppingCart className="h-5 w-5" />
          <span className="absolute -right-1 -top-2 min-w-5 rounded-full bg-stone-950 px-1.5 py-0.5 text-center text-[10px] font-bold text-white">{itemCount}</span>
        </span>
        <span className="flex flex-col text-left leading-tight">
          <span className="text-xs font-medium text-emerald-50">{itemCount} {itemCount === 1 ? "Item" : "Items"} · {money(payable)}</span>
          <span className="text-sm font-semibold">View Cart</span>
        </span>
        <ArrowRight className="h-4 w-4" aria-hidden="true" />
      </Link>
    </div>
  );
}
