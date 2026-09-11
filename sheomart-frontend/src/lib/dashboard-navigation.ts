import { BarChart3, Boxes, LayoutGrid, Package, Receipt, Settings, ShoppingBag, Store, Tag, Tags, TicketPercent, Users } from "lucide-react";
import type { UserRole } from "@/types/auth";

export interface DashboardNavItem {
  id: string;
  title: string;
  href: string;
  icon: typeof LayoutGrid;
  permission: "all" | UserRole;
}

export const dashboardNavigation: Record<UserRole, DashboardNavItem[]> = {
  customer: [],
  store_owner: [
    { id: "store-dashboard", title: "Dashboard", href: "/store", icon: LayoutGrid, permission: "all" },
    { id: "store-products", title: "Products", href: "/store/products", icon: Package, permission: "store_owner" },
    { id: "store-inventory", title: "Inventory", href: "/store/inventory", icon: Boxes, permission: "store_owner" },
    { id: "store-reviews", title: "Reviews", href: "/store/reviews", icon: ShoppingBag, permission: "store_owner" },
    { id: "store-orders", title: "Orders", href: "/store/orders", icon: ShoppingBag, permission: "store_owner" },
    { id: "store-customers", title: "Customers", href: "/store/customers", icon: Users, permission: "store_owner" },
    { id: "store-billing", title: "Billing", href: "/store/billing", icon: Receipt, permission: "store_owner" },
    { id: "store-coupons", title: "Coupons", href: "/store/coupons", icon: Store, permission: "store_owner" },
    { id: "store-analytics", title: "Analytics", href: "/store/analytics", icon: BarChart3, permission: "store_owner" },
    { id: "store-settings", title: "Settings", href: "/store/settings", icon: Settings, permission: "store_owner" },
  ],
  platform_admin: [
    { id: "admin-dashboard", title: "Dashboard", href: "/admin", icon: LayoutGrid, permission: "all" },
    { id: "admin-users", title: "Users", href: "/admin/users", icon: Users, permission: "platform_admin" },
    { id: "admin-stores", title: "Stores", href: "/admin/stores", icon: Store, permission: "platform_admin" },
    { id: "admin-categories", title: "Categories", href: "/admin/categories", icon: Tags, permission: "platform_admin" },
    { id: "admin-products", title: "Products", href: "/admin/products", icon: Package, permission: "platform_admin" },
    { id: "admin-coupons", title: "Coupons", href: "/admin/coupons", icon: TicketPercent, permission: "platform_admin" },
    { id: "admin-offers", title: "Offers", href: "/admin/offers", icon: Tag, permission: "platform_admin" },
    { id: "admin-reviews", title: "Reviews", href: "/admin/reviews", icon: ShoppingBag, permission: "platform_admin" },
    { id: "admin-analytics", title: "Analytics", href: "/admin/analytics", icon: BarChart3, permission: "platform_admin" },
    { id: "admin-settings", title: "Settings", href: "/admin/settings", icon: Settings, permission: "platform_admin" },
  ],
};
