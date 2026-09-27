"use client";

import Link from "next/link";
import {
  IndianRupee,
  ShoppingBag,
  Package,
  AlertTriangle,
  Users,
  TicketPercent,
  Star,
  ArrowRight,
  TrendingUp,
  Clock,
  CheckCircle2,
  Boxes,
  Receipt,
  BadgeCheck,
  Crown,
  ChevronRight,
  Store,
} from "lucide-react";
import { Breadcrumb } from "@/components/dashboard/layout/Breadcrumb";
import { DashboardContent } from "@/components/dashboard/layout/DashboardContent";
import { PageHeader } from "@/components/dashboard/layout/PageHeader";
import { Button } from "@/components/ui/button";
import { useSellerAnalytics } from "@/hooks/use-seller-analytics";
import { useStoreOrders } from "@/hooks/use-store-orders";
import { useStoreReviews } from "@/hooks/use-seller-reviews";

const money = (val?: number) => `₹${(val ?? 0).toLocaleString("en-IN")}`;

export default function StoreDashboardPage() {
  const analyticsQuery = useSellerAnalytics({ range: "today" });
  const recentOrdersQuery = useStoreOrders({ page: 1, limit: 5 });
  const recentReviewsQuery = useStoreReviews({ page: 1, limit: 4 });

  const analytics = analyticsQuery.data;
  const store = analytics?.store;
  const kpis = analytics?.kpis;
  const recentOrders = recentOrdersQuery.data?.orders ?? [];
  const recentReviews = recentReviewsQuery.data?.reviews ?? [];

  const storeName = store?.storeName || "My Store";
  const badge = store?.badge || "normal";
  const rating = store?.rating ?? 5.0;
  const totalReviews = store?.totalReviews ?? 0;
  const status = store?.status || "active";

  const joinedDate = store?.createdAt
    ? new Date(store.createdAt).toLocaleDateString("en-IN", {
        month: "short",
        year: "numeric",
      })
    : "Verified Partner";

  const kpiCards = [
    {
      title: "Revenue Today",
      value: money(kpis?.todayRevenue),
      subtitle: "Gross sales recorded today",
      icon: IndianRupee,
      color: "text-emerald-600 dark:text-emerald-400",
      bgColor: "bg-emerald-50 dark:bg-emerald-950/50",
    },
    {
      title: "Orders Today",
      value: (kpis?.todayOrders ?? 0).toString(),
      subtitle: `${kpis?.pendingOrders ?? 0} orders need processing`,
      icon: ShoppingBag,
      color: "text-blue-600 dark:text-blue-400",
      bgColor: "bg-blue-50 dark:bg-blue-950/50",
    },
    {
      title: "Active Products",
      value: (kpis?.totalProducts ?? 0).toString(),
      subtitle: "Live in store catalog",
      icon: Package,
      color: "text-indigo-600 dark:text-indigo-400",
      bgColor: "bg-indigo-50 dark:bg-indigo-950/50",
    },
    {
      title: "Inventory Alerts",
      value: (kpis?.lowStockCount ?? 0).toString(),
      subtitle: "Items with ≤ 10 stock",
      icon: AlertTriangle,
      color: kpis?.lowStockCount && kpis.lowStockCount > 0 ? "text-rose-600 dark:text-rose-400" : "text-stone-500",
      bgColor: kpis?.lowStockCount && kpis.lowStockCount > 0 ? "bg-rose-50 dark:bg-rose-950/50" : "bg-stone-100 dark:bg-stone-800",
    },
    {
      title: "Store Customers",
      value: (kpis?.uniqueCustomers ?? 0).toString(),
      subtitle: "Lifetime unique shoppers",
      icon: Users,
      color: "text-purple-600 dark:text-purple-400",
      bgColor: "bg-purple-50 dark:bg-purple-950/50",
    },
    {
      title: "Active Coupons",
      value: (kpis?.activeCoupons ?? 0).toString(),
      subtitle: "Live promotion campaigns",
      icon: TicketPercent,
      color: "text-amber-600 dark:text-amber-400",
      bgColor: "bg-amber-50 dark:bg-amber-950/50",
    },
  ];

  return (
    <DashboardContent className="space-y-6">
      <Breadcrumb items={[{ label: "Overview" }]} />

      <PageHeader
        category="OVERVIEW"
        title="Store Operations Console"
        description="Monitor live store performance, process orders, track inventory alerts, and drive retail growth."
        actions={
          <div className="flex items-center gap-2">
            <Link href="/store/products">
              <Button variant="outline" size="sm" className="h-9">
                <Package className="mr-1.5 h-4 w-4" />
                Manage Products
              </Button>
            </Link>
            <Link href="/store/billing">
              <Button size="sm" className="h-9 bg-emerald-600 hover:bg-emerald-700 text-white">
                <Receipt className="mr-1.5 h-4 w-4" />
                POS Billing
              </Button>
            </Link>
          </div>
        }
      />

      {/* Professional Welcome Banner */}
      <div className="relative overflow-hidden rounded-3xl border border-stone-200 bg-linear-to-r from-emerald-900 via-stone-900 to-stone-950 p-6 text-white shadow-md dark:border-stone-800">
        <div className="relative z-10 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-1.5">
              <h2 className="text-xl sm:text-2xl font-black tracking-tight text-white">
                {storeName}
              </h2>
              {badge === "verified" && (
                <span className="inline-flex items-center gap-1 rounded-full bg-blue-500/20 px-2.5 py-0.5 text-xs font-semibold text-blue-300 border border-blue-400/30">
                  <BadgeCheck className="h-3.5 w-3.5" />
                  Verified Store
                </span>
              )}
              {badge === "royal" && (
                <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/20 px-2.5 py-0.5 text-xs font-semibold text-amber-300 border border-amber-400/30">
                  <Crown className="h-3.5 w-3.5" />
                  Royal Merchant
                </span>
              )}
              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/20 px-2 py-0.5 text-xs font-semibold text-emerald-300 border border-emerald-400/30">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                {status === "active" || status === "approved" ? "Live on SheoMart" : status}
              </span>
            </div>
            <p className="text-xs text-stone-300 max-w-xl leading-relaxed">
              Welcome back to your store console. Your store is active and serving customer orders across your delivery perimeter.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-4 text-xs text-stone-300 border-t border-stone-800/80 pt-3 md:border-t-0 md:pt-0">
            <div className="flex items-center gap-1.5 rounded-2xl bg-white/10 px-3 py-2 backdrop-blur-xs">
              <Star className="h-4 w-4 text-amber-400 fill-amber-400" />
              <span className="font-bold text-white text-sm">{rating.toFixed(1)}</span>
              <span className="text-stone-300">({totalReviews} reviews)</span>
            </div>
            <div className="rounded-2xl bg-white/10 px-3 py-2 backdrop-blur-xs">
              <span className="text-stone-400 block text-[10px] uppercase tracking-wider">Merchant Partner</span>
              <span className="font-semibold text-white">Since {joinedDate}</span>
            </div>
          </div>
        </div>
      </div>

      {/* 6 Live Aggregated KPI Cards */}
      <div className="grid gap-3.5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        {kpiCards.map((card) => {
          const Icon = card.icon;
          return (
            <div
              key={card.title}
              className="rounded-2xl border border-stone-200 bg-white p-4 shadow-sm transition hover:border-stone-300 dark:border-stone-800 dark:bg-stone-900 dark:hover:border-stone-700"
            >
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-semibold uppercase tracking-wider text-stone-500 dark:text-stone-400">
                  {card.title}
                </span>
                <div className={`flex h-8 w-8 items-center justify-center rounded-xl ${card.bgColor} ${card.color}`}>
                  <Icon className="h-4 w-4" />
                </div>
              </div>
              <p className="mt-2 text-2xl font-bold text-stone-900 dark:text-stone-50">
                {card.value}
              </p>
              <p className="mt-0.5 text-[11px] text-stone-400 truncate">
                {card.subtitle}
              </p>
            </div>
          );
        })}
      </div>

      {/* Live Operational Widgets Grid */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Widget 1: Recent Orders (2 Columns on Large Screens) */}
        <div className="lg:col-span-2 rounded-2xl border border-stone-200 bg-white p-5 shadow-sm dark:border-stone-800 dark:bg-stone-900">
          <div className="flex items-center justify-between border-b border-stone-100 pb-3 dark:border-stone-800">
            <div>
              <h3 className="text-sm font-bold text-stone-900 dark:text-stone-100">Recent Store Orders</h3>
              <p className="text-xs text-stone-400">Latest incoming pickup and delivery requests</p>
            </div>
            <Link
              href="/store/orders"
              className="flex items-center gap-1 text-xs font-semibold text-emerald-600 hover:text-emerald-700 dark:text-emerald-400"
            >
              All Orders <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          <div className="mt-3 divide-y divide-stone-100 dark:divide-stone-800">
            {recentOrders.length === 0 ? (
              <div className="py-8 text-center">
                <ShoppingBag className="mx-auto h-8 w-8 text-stone-300 dark:text-stone-700 mb-2" />
                <p className="text-xs font-semibold text-stone-600 dark:text-stone-400">No orders received yet</p>
                <p className="text-[11px] text-stone-400">New customer orders will show up here live.</p>
              </div>
            ) : (
              recentOrders.map((order: any) => (
                <div key={order.orderId} className="flex items-center justify-between py-3">
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 dark:bg-emerald-950/50 dark:text-emerald-400">
                      <ShoppingBag className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-stone-900 dark:text-stone-100">
                        #{order.orderId.slice(-6).toUpperCase()}
                      </p>
                      <p className="text-[11px] text-stone-400">
                        {order.shippingAddress?.fullName || "Shopper"} • {order.orderItems?.length || 1} items
                      </p>
                    </div>
                  </div>

                  <div className="text-right">
                    <p className="text-xs font-bold text-stone-900 dark:text-stone-100">
                      {money(order.grandTotal)}
                    </p>
                    <span className="inline-block rounded-full bg-stone-100 px-2 py-0.5 text-[10px] font-semibold text-stone-600 dark:bg-stone-800 dark:text-stone-300">
                      {order.status}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Widget 2: Low Stock Alerts */}
        <div className="rounded-2xl border border-stone-200 bg-white p-5 shadow-sm dark:border-stone-800 dark:bg-stone-900">
          <div className="flex items-center justify-between border-b border-stone-100 pb-3 dark:border-stone-800">
            <div>
              <h3 className="text-sm font-bold text-stone-900 dark:text-stone-100">Inventory Alerts</h3>
              <p className="text-xs text-stone-400">Items below replenishment safety threshold</p>
            </div>
            <Link
              href="/store/inventory"
              className="text-xs font-semibold text-emerald-600 hover:text-emerald-700 dark:text-emerald-400"
            >
              Restock →
            </Link>
          </div>

          <div className="mt-3 space-y-2.5">
            {(!analytics?.lowStockAlerts || analytics.lowStockAlerts.length === 0) ? (
              <div className="py-8 text-center">
                <CheckCircle2 className="mx-auto h-8 w-8 text-emerald-500/80 mb-2" />
                <p className="text-xs font-semibold text-stone-700 dark:text-stone-300">Stock Levels Healthy</p>
                <p className="text-[11px] text-stone-400">No items are currently below low stock limit.</p>
              </div>
            ) : (
              analytics.lowStockAlerts.map((item) => (
                <div
                  key={item.productId}
                  className="flex items-center justify-between rounded-xl bg-stone-50 p-2.5 dark:bg-stone-800/40 border border-stone-200/60 dark:border-stone-800"
                >
                  <div className="min-w-0 pr-2">
                    <p className="text-xs font-semibold text-stone-800 dark:text-stone-200 truncate">
                      {item.name}
                    </p>
                    <p className="text-[10px] text-stone-400">SKU: {item.sku || "N/A"}</p>
                  </div>
                  <span className={`shrink-0 rounded-lg px-2 py-1 text-xs font-bold ${
                    item.quantity === 0
                      ? "bg-rose-100 text-rose-700 dark:bg-rose-950/60 dark:text-rose-400"
                      : "bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-400"
                  }`}>
                    {item.quantity === 0 ? "Out of Stock" : `${item.quantity} left`}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Widget 3: Top Performing Products */}
        <div className="rounded-2xl border border-stone-200 bg-white p-5 shadow-sm dark:border-stone-800 dark:bg-stone-900">
          <div className="flex items-center justify-between border-b border-stone-100 pb-3 dark:border-stone-800">
            <div>
              <h3 className="text-sm font-bold text-stone-900 dark:text-stone-100">Top Products</h3>
              <p className="text-xs text-stone-400">Highest grossing catalog items</p>
            </div>
            <Link
              href="/store/products"
              className="text-xs font-semibold text-emerald-600 hover:text-emerald-700 dark:text-emerald-400"
            >
              Catalog →
            </Link>
          </div>

          <div className="mt-3 space-y-2.5">
            {(!analytics?.topProducts || analytics.topProducts.length === 0) ? (
              <div className="py-8 text-center text-xs text-stone-400">
                Products will appear once orders are placed.
              </div>
            ) : (
              analytics.topProducts.map((prod, idx) => (
                <div key={prod.productId} className="flex items-center justify-between text-xs py-1">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-stone-100 text-[10px] font-bold text-stone-500 dark:bg-stone-800">
                      {idx + 1}
                    </span>
                    <span className="truncate font-medium text-stone-800 dark:text-stone-200 max-w-[160px]">
                      {prod.name}
                    </span>
                  </div>
                  <span className="font-bold text-stone-900 dark:text-stone-100">
                    {money(prod.price)}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Widget 4: Recent Reviews */}
        <div className="rounded-2xl border border-stone-200 bg-white p-5 shadow-sm dark:border-stone-800 dark:bg-stone-900">
          <div className="flex items-center justify-between border-b border-stone-100 pb-3 dark:border-stone-800">
            <div>
              <h3 className="text-sm font-bold text-stone-900 dark:text-stone-100">Recent Customer Reviews</h3>
              <p className="text-xs text-stone-400">Product satisfaction & feedback</p>
            </div>
            <Link
              href="/store/reviews"
              className="text-xs font-semibold text-emerald-600 hover:text-emerald-700 dark:text-emerald-400"
            >
              All Reviews →
            </Link>
          </div>

          <div className="mt-3 divide-y divide-stone-100 dark:divide-stone-800">
            {recentReviews.length === 0 ? (
              <div className="py-8 text-center text-xs text-stone-400">
                No reviews yet. Delivered orders prompt reviews.
              </div>
            ) : (
              recentReviews.map((r) => (
                <div key={r.reviewId} className="py-2.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-stone-800 dark:text-stone-200">
                      {r.user?.name || "Customer"}
                    </span>
                    <div className="flex items-center gap-0.5">
                      {Array.from({ length: r.rating }).map((_, i) => (
                        <Star key={i} className="h-3 w-3 text-amber-500 fill-amber-500" />
                      ))}
                    </div>
                  </div>
                  <p className="mt-0.5 text-[11px] text-stone-500 dark:text-stone-400 line-clamp-2">
                    {r.comment || r.title || "No comment provided"}
                  </p>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Widget 5: Quick Shortcuts Panel */}
        <div className="rounded-2xl border border-stone-200 bg-white p-5 shadow-sm dark:border-stone-800 dark:bg-stone-900">
          <div className="border-b border-stone-100 pb-3 dark:border-stone-800">
            <h3 className="text-sm font-bold text-stone-900 dark:text-stone-100">Quick Store Actions</h3>
            <p className="text-xs text-stone-400">Frequently used retail management flows</p>
          </div>

          <div className="mt-3 grid grid-cols-2 gap-2">
            <Link
              href="/store/billing"
              className="flex flex-col items-center justify-center p-3 rounded-xl border border-stone-200 bg-stone-50 hover:bg-emerald-50 hover:border-emerald-300 dark:border-stone-800 dark:bg-stone-800/40 dark:hover:bg-emerald-950/30 transition text-center group"
            >
              <Receipt className="h-5 w-5 text-emerald-600 mb-1.5 group-hover:scale-110 transition-transform" />
              <span className="text-xs font-semibold text-stone-800 dark:text-stone-200">POS Billing</span>
              <span className="text-[10px] text-stone-400">Create invoice</span>
            </Link>

            <Link
              href="/store/inventory"
              className="flex flex-col items-center justify-center p-3 rounded-xl border border-stone-200 bg-stone-50 hover:bg-emerald-50 hover:border-emerald-300 dark:border-stone-800 dark:bg-stone-800/40 dark:hover:bg-emerald-950/30 transition text-center group"
            >
              <Boxes className="h-5 w-5 text-indigo-600 mb-1.5 group-hover:scale-110 transition-transform" />
              <span className="text-xs font-semibold text-stone-800 dark:text-stone-200">Inventory</span>
              <span className="text-[10px] text-stone-400">Adjust stock</span>
            </Link>

            <Link
              href="/store/coupons"
              className="flex flex-col items-center justify-center p-3 rounded-xl border border-stone-200 bg-stone-50 hover:bg-emerald-50 hover:border-emerald-300 dark:border-stone-800 dark:bg-stone-800/40 dark:hover:bg-emerald-950/30 transition text-center group"
            >
              <TicketPercent className="h-5 w-5 text-purple-600 mb-1.5 group-hover:scale-110 transition-transform" />
              <span className="text-xs font-semibold text-stone-800 dark:text-stone-200">Coupons</span>
              <span className="text-[10px] text-stone-400">Launch deal</span>
            </Link>

            <Link
              href="/store/settings"
              className="flex flex-col items-center justify-center p-3 rounded-xl border border-stone-200 bg-stone-50 hover:bg-emerald-50 hover:border-emerald-300 dark:border-stone-800 dark:bg-stone-800/40 dark:hover:bg-emerald-950/30 transition text-center group"
            >
              <Store className="h-5 w-5 text-amber-600 mb-1.5 group-hover:scale-110 transition-transform" />
              <span className="text-xs font-semibold text-stone-800 dark:text-stone-200">Settings</span>
              <span className="text-[10px] text-stone-400">Hours & delivery</span>
            </Link>
          </div>
        </div>
      </div>
    </DashboardContent>
  );
}
