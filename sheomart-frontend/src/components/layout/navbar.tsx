"use client";

import Link from "next/link";
import Image from "next/image";
import { ChevronDown, LogOut, MapPin, Menu, ShoppingCart, UserCircle2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Container } from "@/components/layout/container";
import { useAuthStore } from "@/store/auth-store";
import { usePathname, useRouter } from "next/navigation";
import { useCart } from "@/hooks/use-cart";
import { NavbarSearch } from "@/components/layout/NavbarSearch";
import { CustomerNotificationCenter } from "@/components/layout/CustomerNotificationCenter";
import { useCustomerLocation } from "@/hooks/use-customer-location";
import { LocationPickerModal } from "@/components/layout/LocationPickerModal";
import { useState } from "react";

export function Navbar() {
  const router = useRouter();
  const pathname = usePathname();
  const { isAuthenticated, user, logout } = useAuthStore();
  const cartQuery = useCart();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isLocationModalOpen, setIsLocationModalOpen] = useState(false);
  const { locationLabel } = useCustomerLocation();

  const handleLogout = () => {
    logout();
    router.push("/login");
  };

  return (
    <header className="sticky top-0 z-50 border-b border-stone-200/70 bg-white/80 backdrop-blur-xl dark:border-stone-800 dark:bg-stone-950/80">
      <Container className="flex items-center justify-between py-4">
        <div className="flex items-center gap-3">
          <Link href="/" className="flex h-10 items-center gap-3">
            <Image src="/logo/sheomartheaderlogo.png" alt="SheoMart - Fresh essentials, beautifully delivered" width={216} height={72} className="-my-1 h-12 w-auto object-contain" priority />
          </Link>

          {/* Delivery Location / PIN Selector */}
          <button
            type="button"
            onClick={() => setIsLocationModalOpen(true)}
            className="flex items-center gap-1.5 rounded-full border border-stone-200 bg-stone-50 px-2.5 py-1 text-xs text-stone-700 hover:border-emerald-500 hover:bg-emerald-50/50 hover:text-emerald-800 transition dark:border-stone-800 dark:bg-stone-900 dark:text-stone-300 dark:hover:border-emerald-600 dark:hover:bg-emerald-950/40 dark:hover:text-emerald-300"
            title="Choose delivery location"
          >
            <MapPin className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
            <span className="max-w-[120px] truncate font-semibold sm:max-w-[180px]">
              {locationLabel}
            </span>
            <ChevronDown className="h-3 w-3 text-stone-400 shrink-0" />
          </button>
        </div>

        <nav className="hidden items-center gap-6 text-sm font-medium text-stone-600 md:flex dark:text-stone-300">
          <Link href="/" className="transition hover:text-emerald-600">Home</Link>
          <Link href="/explore" className="transition hover:text-emerald-600">Explore</Link>
          <Link href="/about" className="transition hover:text-emerald-600">About</Link>
          <NavbarSearch key={pathname} className="hidden w-[260px] lg:block" />
        </nav>

        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" aria-label={isMobileMenuOpen ? "Close menu" : "Open menu"} className="md:hidden" onClick={() => setIsMobileMenuOpen((open) => !open)}>
            {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
          {isAuthenticated && user?.role === "customer" ? (
            <>
              <CustomerNotificationCenter />
              <Button asChild variant="ghost" size="sm" className="relative">
                <Link href="/cart" aria-label="Open shopping cart">
                  <ShoppingCart className="mr-2 h-4 w-4" />
                  Cart
                  {(cartQuery.data?.summary.totalItems ?? 0) > 0 ? (
                    <span className="ml-1 inline-flex min-w-5 items-center justify-center rounded-full bg-emerald-600 px-1.5 text-xs font-semibold text-white">
                      {cartQuery.data?.summary.totalItems}
                    </span>
                  ) : null}
                </Link>
              </Button>
            </>
          ) : null}
          {isAuthenticated ? (
            <>
              <Button asChild variant="ghost" size="sm">
                <Link href={user?.role === "customer" ? "/profile" : user?.role === "store_owner" ? "/store" : "/admin"} aria-label="Open dashboard">
                  <UserCircle2 className="mr-2 h-4 w-4" />
                  Profile
                </Link>
              </Button>
              <Button variant="ghost" size="sm" onClick={handleLogout} aria-label="Log out">
                <LogOut className="mr-2 h-4 w-4" />
                Logout
              </Button>
            </>
          ) : (
            <>
              <Button asChild variant="ghost" size="sm">
                <Link href="/login">Login</Link>
              </Button>
              <Button asChild size="sm">
                <Link href="/register">Register</Link>
              </Button>
            </>
          )}
        </div>
      </Container>
      {isMobileMenuOpen ? <div className="border-t border-stone-200/70 px-4 py-3 md:hidden dark:border-stone-800"><NavbarSearch key={pathname} /></div> : null}
      <LocationPickerModal isOpen={isLocationModalOpen} onClose={() => setIsLocationModalOpen(false)} />
    </header>
  );
}
