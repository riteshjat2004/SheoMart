"use client";

import { useMemo, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import {
  LayoutGrid,
  BarChart3,
  Store,
  Tags,
  Package,
  Users,
  TicketPercent,
  Tag,
  ShoppingBag,
  Shield,
  Settings,
  ChevronLeft,
  ChevronRight,
  LogOut,
  X,
  Boxes,
  Receipt,
  Star,
  BadgeCheck,
  Crown,
  LucideIcon,
  LifeBuoy,
} from "lucide-react";
import { useAuthStore } from "@/store/auth-store";
import { useAppStore } from "@/store/app-store";
import { useProfile } from "@/hooks/useProfile";
import { useQuery } from "@tanstack/react-query";
import { fetchMyStore } from "@/services/store";
import type { UserRole } from "@/types/auth";

interface NavItem {
  id: string;
  title: string;
  href: string;
  icon: LucideIcon;
  badge?: string;
}

interface NavGroup {
  label: string;
  items: NavItem[];
}

const ADMIN_NAV_GROUPS: NavGroup[] = [
  {
    label: "Main",
    items: [
      { id: "admin-dashboard", title: "Dashboard", href: "/admin", icon: LayoutGrid },
      { id: "admin-analytics", title: "Analytics", href: "/admin/analytics", icon: BarChart3 },
    ],
  },
  {
    label: "Marketplace",
    items: [
      { id: "admin-stores", title: "Stores", href: "/admin/stores", icon: Store },
      { id: "admin-categories", title: "Categories", href: "/admin/categories", icon: Tags },
      { id: "admin-products", title: "Products", href: "/admin/products", icon: Package },
      { id: "admin-users", title: "Users", href: "/admin/users", icon: Users },
    ],
  },
  {
    label: "Promotions",
    items: [
      { id: "admin-coupons", title: "Coupons", href: "/admin/coupons", icon: TicketPercent },
      { id: "admin-offers", title: "Offers", href: "/admin/offers", icon: Tag },
    ],
  },
  {
    label: "Platform",
    items: [
      { id: "admin-reviews", title: "Reviews", href: "/admin/reviews", icon: ShoppingBag },
      { id: "admin-support", title: "Support Center", href: "/admin/support", icon: LifeBuoy },
      { id: "admin-security", title: "Security", href: "/admin/security", icon: Shield },
    ],
  },
  {
    label: "System",
    items: [
      { id: "admin-settings", title: "Settings", href: "/admin/settings", icon: Settings },
    ],
  },
];

const STORE_OWNER_NAV_GROUPS: NavGroup[] = [
  {
    label: "Main",
    items: [
      { id: "store-dashboard", title: "Dashboard", href: "/store", icon: LayoutGrid },
      { id: "store-analytics", title: "Analytics", href: "/store/analytics", icon: BarChart3 },
    ],
  },
  {
    label: "Catalog",
    items: [
      { id: "store-products", title: "Products", href: "/store/products", icon: Package },
      { id: "store-inventory", title: "Inventory", href: "/store/inventory", icon: Boxes },
    ],
  },
  {
    label: "Sales & Customers",
    items: [
      { id: "store-orders", title: "Orders", href: "/store/orders", icon: ShoppingBag },
      { id: "store-customers", title: "Customers", href: "/store/customers", icon: Users },
      { id: "store-reviews", title: "Reviews", href: "/store/reviews", icon: Star },
    ],
  },
  {
    label: "Billing & Marketing",
    items: [
      { id: "store-coupons", title: "Coupons", href: "/store/coupons", icon: TicketPercent },
      { id: "store-billing", title: "Billing & POS", href: "/store/billing", icon: Receipt },
    ],
  },
  {
    label: "Configuration",
    items: [
      { id: "store-settings", title: "Store Settings", href: "/store/settings", icon: Settings },
    ],
  },
];

const CUSTOMER_NAV_GROUPS: NavGroup[] = [
  {
    label: "Account",
    items: [
      { id: "customer-security", title: "Security", href: "/profile#security", icon: Shield },
    ],
  },
];

interface SidebarProps {
  role?: UserRole;
}

export function Sidebar({ role }: SidebarProps) {
  const pathname = usePathname();
  const { user, logout } = useAuthStore();
  const { data: profile } = useProfile();
  const {
    isSidebarCollapsed,
    hydrateSidebar,
    toggleSidebarCollapse,
    isMobileMenuOpen,
    setMobileMenuOpen,
  } = useAppStore();

  useEffect(() => {
    hydrateSidebar();
  }, [hydrateSidebar]);

  const currentRole: UserRole = role ?? user?.role ?? "platform_admin";
  const isSeller = currentRole === "store_owner" || pathname?.startsWith("/store");

  const storeQuery = useQuery({
    queryKey: ["my-store"],
    queryFn: fetchMyStore,
    staleTime: 1000 * 60 * 5,
    enabled: isSeller,
  });

  const store = storeQuery.data;
  const storeName = store?.storeName || store?.name || "My Store";
  const storeLogo = store?.logo;
  const storeBadge = store?.badge || "normal";

  const navGroups = useMemo(() => {
    if (isSeller) return STORE_OWNER_NAV_GROUPS;
    if (currentRole === "platform_admin") return ADMIN_NAV_GROUPS;
    return CUSTOMER_NAV_GROUPS;
  }, [currentRole, isSeller]);

  const userInitial = user?.name ? user.name.charAt(0).toUpperCase() : "A";
  const avatarUrl = profile?.avatar || "/logo/admin-avatar.jpg";
  const displayName = isSeller
    ? storeName
    : profile?.name ?? user?.name ?? "Administrator";
  const displayEmail = isSeller
    ? profile?.email ?? user?.email ?? "seller@sheomart.com"
    : profile?.email ?? user?.email ?? "admin@sheomart.com";

  const brandHref = isSeller ? "/store" : "/admin";

  const renderNavGroup = (group: NavGroup, isCollapsed: boolean, onNavigate?: () => void) => (
    <div key={group.label} className="mb-5">
      {!isCollapsed && (
        <p className="px-3 pb-2 text-[10px] font-bold uppercase tracking-wider text-stone-400 dark:text-stone-500">
          {group.label}
        </p>
      )}
      <div className="space-y-0.5">
        {group.items.map((item) => {
          const isExactRoot = item.href === "/admin" || item.href === "/store";
          const isActive = isExactRoot
            ? pathname === item.href
            : pathname === item.href || pathname.startsWith(`${item.href}/`);
          const Icon = item.icon;

          return (
            <Link
              key={item.id}
              href={item.href}
              onClick={onNavigate}
              title={isCollapsed ? item.title : undefined}
              className={`group relative flex items-center gap-3 rounded-xl px-3 py-2 text-xs font-medium transition-all duration-200 ${
                isActive
                  ? "bg-emerald-600 text-white shadow-sm shadow-emerald-600/30 font-semibold"
                  : "text-stone-600 hover:bg-stone-100 hover:text-stone-900 dark:text-stone-400 dark:hover:bg-stone-800/80 dark:hover:text-stone-100"
              } ${isCollapsed ? "justify-center px-0 py-2.5" : ""}`}
            >
              {/* Active left indicator bar */}
              {isActive && !isCollapsed && (
                <span className="absolute -left-3 top-1.5 bottom-1.5 w-1 rounded-r-full bg-emerald-400" />
              )}
              <Icon
                className={`h-4 w-4 shrink-0 transition-transform group-hover:scale-110 ${
                  isActive ? "text-white" : "text-stone-500 group-hover:text-emerald-500 dark:text-stone-400"
                }`}
              />
              {!isCollapsed && <span className="truncate">{item.title}</span>}
              {!isCollapsed && item.badge && (
                <span className="ml-auto rounded-full bg-emerald-500/10 px-1.5 py-0.2 text-[10px] font-semibold text-emerald-600 dark:text-emerald-400">
                  {item.badge}
                </span>
              )}
            </Link>
          );
        })}
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile Backdrop & Drawer */}
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 z-50 bg-stone-950/60 backdrop-blur-xs lg:hidden animate-in fade-in duration-200"
          onClick={() => setMobileMenuOpen(false)}
        >
          <div
            className="fixed inset-y-0 left-0 w-72 max-w-[85vw] border-r border-stone-200 bg-white p-4 shadow-2xl flex flex-col dark:border-stone-800 dark:bg-stone-950 animate-in slide-in-from-left duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Mobile Header */}
            <div className="flex items-center justify-between pb-4 border-b border-stone-200 dark:border-stone-800">
              <Link
                href={brandHref}
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-2.5"
              >
                <div className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-xl bg-stone-50 dark:bg-stone-900 border border-stone-200/80 dark:border-stone-800">
                  {isSeller && storeLogo ? (
                    <Image
                      src={storeLogo}
                      alt={storeName}
                      width={32}
                      height={32}
                      className="w-8 h-8 object-cover rounded-lg"
                    />
                  ) : (
                    <Image
                      src="/logo/appicon.png"
                      alt="SheoMart Logo"
                      width={32}
                      height={32}
                      className="w-8 h-8 object-contain rounded-lg"
                    />
                  )}
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-sm font-bold tracking-tight text-stone-900 dark:text-stone-50">
                      SheoMart
                    </span>
                    {isSeller ? (
                      <span className="flex items-center gap-0.5 rounded-md bg-emerald-500/10 px-1.5 py-0.5 text-[9px] font-bold text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                        {storeBadge === "verified" ? (
                          <>
                            <BadgeCheck className="h-2.5 w-2.5 text-blue-500" />
                            Verified
                          </>
                        ) : storeBadge === "royal" ? (
                          <>
                            <Crown className="h-2.5 w-2.5 text-amber-500" />
                            Royal
                          </>
                        ) : (
                          "Seller"
                        )}
                      </span>
                    ) : (
                      <span className="rounded-md bg-emerald-500/10 px-1.5 py-0.5 text-[9px] font-bold text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                        Marketplace Admin
                      </span>
                    )}
                  </div>
                  <p className="text-[10px] font-medium text-stone-400 dark:text-stone-500 truncate max-w-[140px]">
                    {isSeller ? storeName : "Marketplace Console"}
                  </p>
                </div>
              </Link>
              <button
                type="button"
                onClick={() => setMobileMenuOpen(false)}
                className="flex h-8 w-8 items-center justify-center rounded-lg text-stone-500 hover:bg-stone-100 dark:hover:bg-stone-800"
                aria-label="Close navigation"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Mobile Navigation List */}
            <nav className="flex-1 overflow-y-auto py-4 scrollbar-thin">
              {navGroups.map((group) =>
                renderNavGroup(group, false, () => setMobileMenuOpen(false))
              )}
            </nav>

            {/* Mobile Footer */}
            <div className="pt-3 border-t border-stone-200 dark:border-stone-800">
              <div className="flex items-center justify-between rounded-xl bg-stone-50 p-2.5 dark:bg-stone-900/60 border border-stone-200/60 dark:border-stone-800/60">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="relative flex h-8 w-8 shrink-0 items-center justify-center overflow-hidden rounded-full ring-2 ring-emerald-500/30">
                    {isSeller && storeLogo ? (
                      <Image
                        src={storeLogo}
                        alt={storeName}
                        width={32}
                        height={32}
                        className="h-full w-full object-cover"
                      />
                    ) : avatarUrl ? (
                      <Image
                        src={avatarUrl}
                        alt="Avatar"
                        width={32}
                        height={32}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center bg-linear-to-br from-emerald-500 to-emerald-700 text-xs font-bold text-white">
                        {userInitial}
                      </div>
                    )}
                  </div>
                  <div className="min-w-0 truncate">
                    <p className="truncate text-xs font-semibold text-stone-900 dark:text-stone-100">
                      {displayName}
                    </p>
                    <p className="text-[10px] text-stone-400 dark:text-stone-500 truncate">
                      {displayEmail}
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setMobileMenuOpen(false);
                    logout();
                  }}
                  className="rounded-lg p-1.5 text-stone-400 hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-950/30 dark:hover:text-rose-400 transition"
                  title="Logout"
                >
                  <LogOut className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Desktop Fixed Aside */}
      <aside
        className={`fixed inset-y-0 left-0 z-30 hidden h-screen border-r border-stone-200/80 bg-white/95 backdrop-blur-md transition-all duration-300 ease-in-out lg:flex lg:flex-col dark:border-stone-800/80 dark:bg-stone-950/95 ${
          isSidebarCollapsed ? "w-20" : "w-64"
        }`}
      >
        {/* Desktop Brand Header */}
        <div className="flex h-[60px] shrink-0 items-center justify-between border-b border-stone-200/80 px-4 dark:border-stone-800/80">
          <Link
            href={brandHref}
            className={`flex items-center gap-3 transition-opacity ${
              isSidebarCollapsed ? "mx-auto" : ""
            }`}
          >
            <div className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-stone-50 dark:bg-stone-900 border border-stone-200/80 dark:border-stone-800 shadow-2xs">
              {isSeller && storeLogo ? (
                <Image
                  src={storeLogo}
                  alt={storeName}
                  width={32}
                  height={32}
                  className="w-8 h-8 object-cover rounded-lg"
                />
              ) : (
                <Image
                  src="/logo/appicon.png"
                  alt="SheoMart Logo"
                  width={32}
                  height={32}
                  className="w-8 h-8 object-contain rounded-lg"
                />
              )}
            </div>
            {!isSidebarCollapsed && (
              <div className="animate-in fade-in duration-150 min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className="text-sm font-extrabold tracking-tight text-stone-900 dark:text-stone-50">
                    SheoMart
                  </span>
                  {isSeller ? (
                    <span className="flex items-center gap-0.5 rounded-md bg-emerald-500/10 px-1.5 py-0.5 text-[9px] font-bold text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                      {storeBadge === "verified" ? (
                        <>
                          <BadgeCheck className="h-2.5 w-2.5 text-blue-500" />
                          Verified
                        </>
                      ) : storeBadge === "royal" ? (
                        <>
                          <Crown className="h-2.5 w-2.5 text-amber-500" />
                          Royal
                        </>
                      ) : (
                        "Seller"
                      )}
                    </span>
                  ) : (
                    <span className="rounded-md bg-emerald-500/10 px-1.5 py-0.5 text-[9px] font-bold text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                      Marketplace Admin
                    </span>
                  )}
                </div>
                <p className="text-[10px] font-medium text-stone-400 dark:text-stone-500 truncate max-w-[140px]">
                  {isSeller ? storeName : "Marketplace Console"}
                </p>
              </div>
            )}
          </Link>

          {!isSidebarCollapsed && (
            <button
              type="button"
              onClick={toggleSidebarCollapse}
              className="flex h-7 w-7 items-center justify-center rounded-lg border border-stone-200/80 text-stone-400 transition hover:bg-stone-100 hover:text-stone-700 dark:border-stone-800 dark:hover:bg-stone-900 dark:hover:text-stone-200"
              title="Collapse sidebar"
              aria-label="Collapse sidebar"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
          )}
        </div>

        {/* Collapsed expand trigger button */}
        {isSidebarCollapsed && (
          <div className="flex shrink-0 justify-center py-2 border-b border-stone-200/50 dark:border-stone-800/50">
            <button
              type="button"
              onClick={toggleSidebarCollapse}
              className="flex h-7 w-7 items-center justify-center rounded-lg border border-stone-200/80 text-stone-400 transition hover:bg-stone-100 hover:text-stone-700 dark:border-stone-800 dark:hover:bg-stone-900 dark:hover:text-stone-200"
              title="Expand sidebar"
              aria-label="Expand sidebar"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        )}

        {/* Desktop Navigation Groups */}
        <nav className="flex-1 overflow-y-auto px-3 py-4 scrollbar-thin">
          {navGroups.map((group) => renderNavGroup(group, isSidebarCollapsed))}
        </nav>

        {/* Desktop Sidebar Footer */}
        <div className="shrink-0 border-t border-stone-200/80 p-3 dark:border-stone-800/80">
          {isSidebarCollapsed ? (
            <div className="flex flex-col items-center gap-2">
              <div
                className="relative flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-full ring-2 ring-emerald-500/30 shadow-xs"
                title={`${displayName} (${displayEmail})`}
              >
                {isSeller && storeLogo ? (
                  <Image
                    src={storeLogo}
                    alt={storeName}
                    width={36}
                    height={36}
                    className="h-full w-full object-cover"
                  />
                ) : avatarUrl ? (
                  <Image
                    src={avatarUrl}
                    alt="Avatar"
                    width={36}
                    height={36}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center bg-linear-to-br from-emerald-500 to-emerald-700 text-xs font-bold text-white">
                    {userInitial}
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-between rounded-xl bg-stone-50/80 p-2.5 dark:bg-stone-900/60 border border-stone-200/60 dark:border-stone-800/60">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="relative flex h-8 w-8 shrink-0 items-center justify-center overflow-hidden rounded-full ring-2 ring-emerald-500/30 shadow-xs">
                  {isSeller && storeLogo ? (
                    <Image
                      src={storeLogo}
                      alt={storeName}
                      width={32}
                      height={32}
                      className="h-full w-full object-cover"
                    />
                  ) : avatarUrl ? (
                    <Image
                      src={avatarUrl}
                      alt="Avatar"
                      width={32}
                      height={32}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center bg-linear-to-br from-emerald-500 to-emerald-700 text-xs font-bold text-white">
                      {userInitial}
                    </div>
                  )}
                </div>
                <div className="min-w-0 truncate">
                  <p className="truncate text-xs font-semibold text-stone-900 dark:text-stone-100">
                    {displayName}
                  </p>
                  <p className="text-[10px] text-stone-400 dark:text-stone-500 truncate">
                    {displayEmail}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => logout()}
                className="rounded-lg p-1.5 text-stone-400 hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-950/30 dark:hover:text-rose-400 transition"
                title="Log out"
                aria-label="Log out"
              >
                <LogOut className="h-4 w-4" />
              </button>
            </div>
          )}
        </div>
      </aside>
    </>
  );
}
