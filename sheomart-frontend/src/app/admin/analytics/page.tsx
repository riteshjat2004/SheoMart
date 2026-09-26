"use client";

import { useState } from "react";
import {
  Activity,
  AlertOctagon,
  Calendar,
  CheckCircle2,
  ChevronDown,
  DollarSign,
  Download,
  Flame,
  HeartHandshake,
  Layers,
  Package,
  ShieldCheck,
  ShoppingBag,
  Sparkles,
  Star,
  Store,
  Tag,
  TrendingUp,
  Users,
} from "lucide-react";
import {
  AdminAnalyticsBreakdownChart,
  AdminAnalyticsDonutChart,
  AdminAnalyticsTrendChart,
  ActivityFeedWidget,
  MarketplaceHealthWidget,
  TopLeaderboardCard,
} from "@/components/dashboard/admin/AdminAnalyticsCharts";
import { DashboardCard } from "@/components/dashboard/DashboardCard";
import { EmptyState } from "@/components/dashboard/EmptyState";
import { Breadcrumb } from "@/components/dashboard/layout/Breadcrumb";
import { DashboardContent } from "@/components/dashboard/layout/DashboardContent";
import { LoadingSkeleton } from "@/components/dashboard/LoadingSkeleton";
import { PageHeader } from "@/components/dashboard/layout/PageHeader";
import { StatCard } from "@/components/dashboard/StatCard";
import { Button } from "@/components/ui/button";
import { ErrorState } from "@/components/common/error-state";
import { useAdminAnalytics } from "@/hooks/use-admin-analytics";
import { downloadAnalyticsExport } from "@/services/admin-analytics";
import type { AdminAnalyticsFilters } from "@/types/admin-analytics";

type AnalyticsDomainTab =
  | "overview"
  | "revenue"
  | "orders"
  | "customers"
  | "sellers"
  | "inventory"
  | "coupons"
  | "reviews"
  | "health_activity"
  | "top_lists";

function formatDateInput(date: Date) {
  return date.toISOString().slice(0, 10);
}

function getDefaultDates(days = 30) {
  const today = new Date();
  const from = new Date(today);
  from.setUTCDate(from.getUTCDate() - (days - 1));
  return { from: formatDateInput(from), to: formatDateInput(today) };
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(value);
}

export default function AdminAnalyticsPage() {
  const defaults = getDefaultDates(30);
  const [draftFrom, setDraftFrom] = useState(defaults.from);
  const [draftTo, setDraftTo] = useState(defaults.to);
  const [dateError, setDateError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<AnalyticsDomainTab>("overview");
  const [exportMenuOpen, setExportMenuOpen] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [exportFeedback, setExportFeedback] = useState<string | null>(null);

  const [filters, setFilters] = useState<AdminAnalyticsFilters>({
    from: defaults.from,
    to: defaults.to,
    timezone: "UTC",
  });

  const analyticsQuery = useAdminAnalytics(filters);
  const data = analyticsQuery.data;

  const applyRange = (from: string, to: string) => {
    if (!from || !to || from > to) {
      setDateError("Start date cannot be after end date.");
      return;
    }
    setDateError(null);
    setDraftFrom(from);
    setDraftTo(to);
    setFilters({ from, to, timezone: "UTC" });
  };

  const applyPreset = (type: "today" | "yesterday" | "7d" | "30d" | "thisMonth" | "lastMonth" | "thisYear") => {
    const today = new Date();
    let f = new Date(today);
    let t = new Date(today);

    if (type === "today") {
      // today
    } else if (type === "yesterday") {
      f.setUTCDate(today.getUTCDate() - 1);
      t.setUTCDate(today.getUTCDate() - 1);
    } else if (type === "7d") {
      f.setUTCDate(today.getUTCDate() - 6);
    } else if (type === "30d") {
      f.setUTCDate(today.getUTCDate() - 29);
    } else if (type === "thisMonth") {
      f = new Date(Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), 1));
    } else if (type === "lastMonth") {
      f = new Date(Date.UTC(today.getUTCFullYear(), today.getUTCMonth() - 1, 1));
      t = new Date(Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), 0));
    } else if (type === "thisYear") {
      f = new Date(Date.UTC(today.getUTCFullYear(), 0, 1));
    }

    const fromStr = formatDateInput(f);
    const toStr = formatDateInput(t);
    applyRange(fromStr, toStr);
  };

  const handleExport = async (type: "revenue" | "orders" | "users" | "reviews" | "coupons") => {
    try {
      setIsExporting(true);
      setExportMenuOpen(false);
      await downloadAnalyticsExport(type, filters.from, filters.to);
      setExportFeedback(`Exported ${type} data successfully.`);
      setTimeout(() => setExportFeedback(null), 4000);
    } catch (err: any) {
      setExportFeedback(err.message || `Failed to export ${type} data.`);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <DashboardContent className="space-y-6">
      <Breadcrumb items={[{ label: "Admin" }, { label: "Analytics" }]} />
      <PageHeader
        title="Marketplace Analytics & Intelligence"
        description="Real platform business performance computed from users, stores, inventory, orders, and payment records."
        actions={
          <div className="relative">
            <Button
              size="sm"
              disabled={isExporting}
              onClick={() => setExportMenuOpen(!exportMenuOpen)}
              className="bg-emerald-600 hover:bg-emerald-700 text-white gap-2 text-xs"
            >
              <Download className="h-4 w-4" />
              <span>{isExporting ? "Exporting..." : "Export CSV Report"}</span>
              <ChevronDown className="h-3.5 w-3.5" />
            </Button>

            {exportMenuOpen && (
              <div
                className="absolute right-0 top-10 z-30 w-52 rounded-xl border border-stone-200 bg-white p-1.5 shadow-xl dark:border-stone-800 dark:bg-stone-900"
                onMouseLeave={() => setExportMenuOpen(false)}
              >
                <div className="px-2 py-1 text-[11px] font-semibold text-stone-400 uppercase tracking-wider">
                  Select Dataset
                </div>
                <button
                  type="button"
                  onClick={() => handleExport("revenue")}
                  className="flex w-full items-center gap-2 rounded-lg px-2.5 py-1.5 text-xs text-stone-700 hover:bg-stone-100 dark:text-stone-300 dark:hover:bg-stone-800"
                >
                  <DollarSign className="h-3.5 w-3.5 text-emerald-600" /> Revenue Report
                </button>
                <button
                  type="button"
                  onClick={() => handleExport("orders")}
                  className="flex w-full items-center gap-2 rounded-lg px-2.5 py-1.5 text-xs text-stone-700 hover:bg-stone-100 dark:text-stone-300 dark:hover:bg-stone-800"
                >
                  <ShoppingBag className="h-3.5 w-3.5 text-blue-600" /> Orders Report
                </button>
                <button
                  type="button"
                  onClick={() => handleExport("users")}
                  className="flex w-full items-center gap-2 rounded-lg px-2.5 py-1.5 text-xs text-stone-700 hover:bg-stone-100 dark:text-stone-300 dark:hover:bg-stone-800"
                >
                  <Users className="h-3.5 w-3.5 text-purple-600" /> Users & Growth Report
                </button>
                <button
                  type="button"
                  onClick={() => handleExport("reviews")}
                  className="flex w-full items-center gap-2 rounded-lg px-2.5 py-1.5 text-xs text-stone-700 hover:bg-stone-100 dark:text-stone-300 dark:hover:bg-stone-800"
                >
                  <Star className="h-3.5 w-3.5 text-amber-500" /> Reviews & Ratings Report
                </button>
                <button
                  type="button"
                  onClick={() => handleExport("coupons")}
                  className="flex w-full items-center gap-2 rounded-lg px-2.5 py-1.5 text-xs text-stone-700 hover:bg-stone-100 dark:text-stone-300 dark:hover:bg-stone-800"
                >
                  <Tag className="h-3.5 w-3.5 text-orange-500" /> Coupons & Offers Report
                </button>
              </div>
            )}
          </div>
        }
      />

      {exportFeedback && (
        <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-xs text-emerald-800 dark:border-emerald-900/60 dark:bg-emerald-950/40 dark:text-emerald-300">
          {exportFeedback}
        </div>
      )}

      {/* Date Range Selection Card */}
      <DashboardCard
        title="Global Date Range Filter"
        description="Filter analytics across selected time boundaries. Revenue aligns with completed payment settlement time."
      >
        <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
          <div className="grid gap-3 sm:grid-cols-2">
            <label className="space-y-1.5 text-xs font-medium text-stone-700 dark:text-stone-300">
              <span>Start Date</span>
              <input
                type="date"
                value={draftFrom}
                onChange={(e) => setDraftFrom(e.target.value)}
                className="min-h-10 w-full rounded-lg border border-stone-200 bg-white px-3 text-xs outline-none focus:border-emerald-500 dark:border-stone-800 dark:bg-stone-900"
              />
            </label>
            <label className="space-y-1.5 text-xs font-medium text-stone-700 dark:text-stone-300">
              <span>End Date</span>
              <input
                type="date"
                value={draftTo}
                onChange={(e) => setDraftTo(e.target.value)}
                className="min-h-10 w-full rounded-lg border border-stone-200 bg-white px-3 text-xs outline-none focus:border-emerald-500 dark:border-stone-800 dark:bg-stone-900"
              />
            </label>
          </div>

          <div className="flex flex-wrap items-center gap-1.5">
            <Button type="button" variant="outline" size="sm" className="h-8 text-xs" onClick={() => applyPreset("today")}>
              Today
            </Button>
            <Button type="button" variant="outline" size="sm" className="h-8 text-xs" onClick={() => applyPreset("yesterday")}>
              Yesterday
            </Button>
            <Button type="button" variant="outline" size="sm" className="h-8 text-xs" onClick={() => applyPreset("7d")}>
              Last 7 Days
            </Button>
            <Button type="button" variant="outline" size="sm" className="h-8 text-xs" onClick={() => applyPreset("30d")}>
              Last 30 Days
            </Button>
            <Button type="button" variant="outline" size="sm" className="h-8 text-xs" onClick={() => applyPreset("thisMonth")}>
              This Month
            </Button>
            <Button type="button" variant="outline" size="sm" className="h-8 text-xs" onClick={() => applyPreset("thisYear")}>
              This Year
            </Button>
            <Button
              type="button"
              size="sm"
              className="h-8 text-xs bg-emerald-600 hover:bg-emerald-700 text-white"
              onClick={() => applyRange(draftFrom, draftTo)}
            >
              Apply Filter
            </Button>
          </div>
        </div>

        {dateError && <p className="mt-2 text-xs text-rose-600 dark:text-rose-400">{dateError}</p>}
        {data && (
          <p className="mt-3 text-xs text-stone-500">
            Reporting: <span className="font-medium text-stone-700 dark:text-stone-300">{data.range.from}</span> through{" "}
            <span className="font-medium text-stone-700 dark:text-stone-300">{data.range.to}</span> (UTC)
          </p>
        )}
      </DashboardCard>

      {analyticsQuery.isLoading && <LoadingSkeleton rows={5} />}
      {analyticsQuery.isError && (
        <ErrorState message={analyticsQuery.error instanceof Error ? analyticsQuery.error.message : "Unable to load analytics."} />
      )}

      {data && !analyticsQuery.isLoading && !analyticsQuery.isError && (
        <>
          {/* Top Level 3-Pillar KPI Overview Cards */}
          <div className="space-y-4">
            {/* Pillar 1: Marketplace Scale */}
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Layers className="h-4 w-4 text-emerald-600" />
                <h3 className="text-xs font-bold uppercase tracking-wider text-stone-500 dark:text-stone-400">
                  Marketplace Scale (Lifetime Totals)
                </h3>
              </div>
              <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                <StatCard
                  title="Total Revenue"
                  value={formatCurrency(data.overviewKpis?.marketplace?.totalRevenue ?? data.kpis.revenue)}
                  description="Lifetime completed gross revenue"
                  icon={<DollarSign className="h-5 w-5 text-emerald-600" />}
                />
                <StatCard
                  title="Total Orders"
                  value={(data.overviewKpis?.marketplace?.totalOrders ?? data.kpis.orders).toLocaleString()}
                  description="Lifetime completed orders"
                  icon={<ShoppingBag className="h-5 w-5 text-blue-600" />}
                />
                <StatCard
                  title="Total Registered Users"
                  value={(data.overviewKpis?.marketplace?.totalUsers ?? data.kpis.customers).toLocaleString()}
                  description="All customer & seller accounts"
                  icon={<Users className="h-5 w-5 text-purple-600" />}
                />
                <StatCard
                  title="Approved Stores"
                  value={(data.overviewKpis?.marketplace?.totalStores ?? data.kpis.stores).toLocaleString()}
                  description="Total approved seller stores"
                  icon={<Store className="h-5 w-5 text-amber-600" />}
                />
              </div>
            </div>

            {/* Pillar 2: Growth in Range & Today */}
            <div>
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="h-4 w-4 text-emerald-600" />
                <h3 className="text-xs font-bold uppercase tracking-wider text-stone-500 dark:text-stone-400">
                  Growth & Recent Momentum
                </h3>
              </div>
              <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                <StatCard
                  title="Revenue Today"
                  value={formatCurrency(data.overviewKpis?.growth?.revenueToday ?? 0)}
                  description="Completed orders today"
                  icon={<Flame className="h-5 w-5 text-rose-500" />}
                />
                <StatCard
                  title="Revenue This Week"
                  value={formatCurrency(data.overviewKpis?.growth?.revenueThisWeek ?? 0)}
                  description="Rolling 7 days revenue"
                  icon={<TrendingUp className="h-5 w-5 text-emerald-500" />}
                />
                <StatCard
                  title="Revenue This Month"
                  value={formatCurrency(data.overviewKpis?.growth?.revenueThisMonth ?? 0)}
                  description="Current calendar month"
                  icon={<Sparkles className="h-5 w-5 text-amber-500" />}
                />
                <StatCard
                  title="New Signups Today"
                  value={(data.overviewKpis?.growth?.newCustomersToday ?? 0).toLocaleString()}
                  description="Customer registrations today"
                  icon={<Users className="h-5 w-5 text-blue-500" />}
                />
              </div>
            </div>
          </div>

          {/* Domain Navigation Tabs */}
          <div className="flex flex-wrap items-center gap-1.5 border-b border-stone-200 pb-3 dark:border-stone-800">
            {[
              { id: "overview", label: "Executive Overview" },
              { id: "revenue", label: "Revenue Analytics" },
              { id: "orders", label: "Orders & Fulfillment" },
              { id: "customers", label: "Customers & Retention" },
              { id: "sellers", label: "Sellers & Stores" },
              { id: "inventory", label: "Inventory & Stock" },
              { id: "coupons", label: "Coupons & Offers" },
              { id: "reviews", label: "Ratings & Reviews" },
              { id: "health_activity", label: "Health & Live Stream" },
              { id: "top_lists", label: "Top Leaderboards" },
            ].map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id as AnalyticsDomainTab)}
                className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
                  activeTab === tab.id
                    ? "bg-emerald-600 text-white shadow-sm"
                    : "text-stone-600 hover:bg-stone-100 dark:text-stone-400 dark:hover:bg-stone-800"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Tab 1: Executive Overview */}
          {activeTab === "overview" && (
            <div className="space-y-6">
              <div className="grid gap-4 xl:grid-cols-2">
                <AdminAnalyticsTrendChart
                  title="Revenue Movement in Range"
                  points={data.revenue?.trend ?? data.trends.revenue}
                  color="#059669"
                  currency
                />
                <AdminAnalyticsTrendChart
                  title="Daily Order Volume in Range"
                  points={data.orderAnalytics?.trend ?? data.trends.orders}
                  color="#0284c7"
                />
              </div>

              <div className="grid gap-4 xl:grid-cols-3">
                <AdminAnalyticsBreakdownChart
                  title="Orders by Fulfillment Status"
                  points={data.orderAnalytics?.byStatus ?? data.breakdowns.ordersByStatus}
                />
                <AdminAnalyticsDonutChart
                  title="Revenue by Payment Channel"
                  data={
                    data.revenue?.byPaymentMethod?.map((p) => ({
                      name: p.method.toUpperCase(),
                      value: p.revenue,
                    })) ?? []
                  }
                  currency
                />
                <AdminAnalyticsDonutChart
                  title="Revenue by Category"
                  data={
                    data.revenue?.byCategory?.map((c) => ({
                      name: c.categoryName,
                      value: c.revenue,
                    })) ?? []
                  }
                  currency
                />
              </div>

              {/* Health and Activity widgets preview */}
              <div className="grid gap-4 xl:grid-cols-2">
                {data.marketplaceHealth && <MarketplaceHealthWidget health={data.marketplaceHealth} />}
                {data.activityFeed && <ActivityFeedWidget items={data.activityFeed.slice(0, 7)} />}
              </div>
            </div>
          )}

          {/* Tab 2: Revenue Analytics */}
          {activeTab === "revenue" && (
            <div className="space-y-6">
              <AdminAnalyticsTrendChart
                title="Revenue Progression (Completed Transactions)"
                points={data.revenue?.trend ?? []}
                color="#059669"
                currency
              />

              <div className="grid gap-4 xl:grid-cols-2">
                <AdminAnalyticsDonutChart
                  title="Revenue Distribution by Category"
                  data={
                    data.revenue?.byCategory?.map((c) => ({
                      name: c.categoryName,
                      value: c.revenue,
                    })) ?? []
                  }
                  currency
                />
                <AdminAnalyticsDonutChart
                  title="Revenue Breakdown by Payment Method"
                  data={
                    data.revenue?.byPaymentMethod?.map((p) => ({
                      name: p.method.toUpperCase(),
                      value: p.revenue,
                    })) ?? []
                  }
                  currency
                />
              </div>

              {/* Revenue by Store Table */}
              <DashboardCard title="Revenue Performance by Store" description="Top revenue-generating stores in this period.">
                {(!data.revenue?.byStore || data.revenue.byStore.length === 0) ? (
                  <EmptyState title="No store revenue records in this range" />
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead className="border-b border-stone-200 text-stone-500 dark:border-stone-800">
                        <tr>
                          <th className="py-2.5 font-semibold">Store</th>
                          <th className="py-2.5 font-semibold">Orders Fulfilled</th>
                          <th className="py-2.5 font-semibold">Total Revenue</th>
                          <th className="py-2.5 font-semibold">Avg. Order Value</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-stone-100 dark:divide-stone-800">
                        {data.revenue.byStore.map((st) => (
                          <tr key={st.storeId}>
                            <td className="py-3 font-semibold text-stone-900 dark:text-stone-100">{st.storeName}</td>
                            <td className="py-3 text-stone-600 dark:text-stone-300">{st.orders}</td>
                            <td className="py-3 font-bold text-emerald-600">{formatCurrency(st.revenue)}</td>
                            <td className="py-3 text-stone-500">
                              {st.orders > 0 ? formatCurrency(Math.round(st.revenue / st.orders)) : "₹0"}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </DashboardCard>
            </div>
          )}

          {/* Tab 3: Orders Analytics */}
          {activeTab === "orders" && (
            <div className="space-y-6">
              {data.orderAnalytics?.kpis && (
                <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-6">
                  <StatCard title="Orders in Range" value={data.orderAnalytics.kpis.totalOrders.toLocaleString()} />
                  <StatCard title="Completed" value={data.orderAnalytics.kpis.completedOrders.toLocaleString()} />
                  <StatCard title="Delivered" value={data.orderAnalytics.kpis.deliveredOrders.toLocaleString()} />
                  <StatCard title="Pending" value={data.orderAnalytics.kpis.pendingOrders.toLocaleString()} />
                  <StatCard title="Cancelled" value={data.orderAnalytics.kpis.cancelledOrders.toLocaleString()} />
                  <StatCard
                    title="Average Order Value"
                    value={formatCurrency(data.orderAnalytics.kpis.avgOrderValue)}
                  />
                </div>
              )}

              <div className="grid gap-4 xl:grid-cols-2">
                <AdminAnalyticsTrendChart
                  title="Daily Paid Order Intake"
                  points={data.orderAnalytics?.trend ?? []}
                  color="#0284c7"
                />
                <AdminAnalyticsBreakdownChart
                  title="Orders by Lifecycle Status"
                  points={data.orderAnalytics?.byStatus ?? []}
                />
              </div>

              {/* City Breakdown */}
              <div className="grid gap-4 xl:grid-cols-2">
                <TopLeaderboardCard
                  title="Top Cities by Orders"
                  description="Order distribution by destination shipping city"
                  items={
                    data.orderAnalytics?.byCity?.map((c) => ({
                      id: c.city,
                      name: c.city,
                      value: c.count,
                      secondary: `Revenue: ${formatCurrency(c.revenue)}`,
                    })) ?? []
                  }
                />
                <TopLeaderboardCard
                  title="Top Selling Products in Range"
                  description="Most ordered products by quantity"
                  items={
                    data.orderAnalytics?.topProducts?.map((p) => ({
                      id: p.productId,
                      name: p.name,
                      value: p.quantity,
                      secondary: `Revenue: ${formatCurrency(p.revenue)}`,
                    })) ?? []
                  }
                />
              </div>
            </div>
          )}

          {/* Tab 4: Customers Analytics */}
          {activeTab === "customers" && (
            <div className="space-y-6">
              {data.customerAnalytics?.kpis && (
                <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
                  <StatCard
                    title="Total Customers"
                    value={data.customerAnalytics.kpis.totalCustomers.toLocaleString()}
                    description="All registered platform buyers"
                  />
                  <StatCard
                    title="Verified Customers"
                    value={data.customerAnalytics.kpis.verifiedCustomers.toLocaleString()}
                    description="Manually or rule-verified"
                  />
                  <StatCard
                    title="New Signups in Range"
                    value={data.customerAnalytics.kpis.newCustomersInRange.toLocaleString()}
                    description="Created in selected period"
                  />
                  <StatCard
                    title="Repeat Buyers"
                    value={data.customerAnalytics.kpis.returningCustomers.toLocaleString()}
                    description="Placed > 1 completed order"
                  />
                  <StatCard
                    title="Repeat Purchase Rate"
                    value={`${data.customerAnalytics.kpis.repeatPurchaseRate}%`}
                    description="% buyers with multiple orders"
                  />
                </div>
              )}

              <AdminAnalyticsTrendChart
                title="Customer Sign-up Trajectory"
                points={data.customerAnalytics?.trend ?? []}
                color="#8b5cf6"
              />

              <div className="grid gap-4 xl:grid-cols-2">
                <TopLeaderboardCard
                  title="Top Customer Cities"
                  description="Cities with the highest concentration of customer delivery addresses"
                  items={
                    data.customerAnalytics?.topCities?.map((c) => ({
                      id: c.city,
                      name: c.city,
                      value: c.count,
                    })) ?? []
                  }
                />
                <TopLeaderboardCard
                  title="Top Customer Districts"
                  description="Regional geographical distribution of customers"
                  items={
                    data.customerAnalytics?.topDistricts?.map((d) => ({
                      id: d.district,
                      name: d.district,
                      value: d.count,
                    })) ?? []
                  }
                />
              </div>
            </div>
          )}

          {/* Tab 5: Sellers Analytics */}
          {activeTab === "sellers" && (
            <div className="space-y-6">
              {data.sellerAnalytics?.kpis && (
                <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
                  <StatCard
                    title="Total Store Owners"
                    value={data.sellerAnalytics.kpis.totalSellers.toLocaleString()}
                  />
                  <StatCard
                    title="Active Approved Stores"
                    value={data.sellerAnalytics.kpis.activeSellers.toLocaleString()}
                  />
                  <StatCard
                    title="Pending Store Applications"
                    value={data.sellerAnalytics.kpis.pendingSellers.toLocaleString()}
                  />
                  <StatCard
                    title="Royal Stores"
                    value={data.sellerAnalytics.kpis.royalStores.toLocaleString()}
                  />
                  <StatCard
                    title="Verified Stores"
                    value={data.sellerAnalytics.kpis.verifiedStores.toLocaleString()}
                  />
                </div>
              )}

              <div className="grid gap-4 xl:grid-cols-2">
                <TopLeaderboardCard
                  title="Top Stores by Revenue"
                  description="Stores with highest total paid order revenue"
                  items={
                    data.sellerAnalytics?.topSellersByRevenue?.map((s) => ({
                      id: s.storeId,
                      name: s.storeName,
                      value: s.revenue,
                    })) ?? []
                  }
                  isCurrency
                />
                <TopLeaderboardCard
                  title="Top Stores by Orders"
                  description="Stores with most fulfilled orders"
                  items={
                    data.sellerAnalytics?.topSellersByOrders?.map((s) => ({
                      id: s.storeId,
                      name: s.storeName,
                      value: s.orders,
                    })) ?? []
                  }
                />
              </div>
            </div>
          )}

          {/* Tab 6: Inventory & Products Analytics */}
          {activeTab === "inventory" && (
            <div className="space-y-6">
              {data.productInventory?.kpis && (
                <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
                  <StatCard
                    title="Total Products"
                    value={data.productInventory.kpis.totalProducts.toLocaleString()}
                  />
                  <StatCard
                    title="Active Catalog"
                    value={data.productInventory.kpis.activeProducts.toLocaleString()}
                  />
                  <StatCard
                    title="Out of Stock"
                    value={data.productInventory.kpis.outOfStock.toLocaleString()}
                    icon={<AlertOctagon className="h-4 w-4 text-rose-500" />}
                  />
                  <StatCard
                    title="Low Stock Warning (< 5)"
                    value={data.productInventory.kpis.lowStock.toLocaleString()}
                    icon={<AlertOctagon className="h-4 w-4 text-amber-500" />}
                  />
                  <StatCard
                    title="Featured Products"
                    value={data.productInventory.kpis.featuredProducts.toLocaleString()}
                  />
                </div>
              )}

              {/* Low Stock Alerts Table */}
              <DashboardCard
                title="Low Stock & Depleted Inventory Warnings"
                description="Products requiring replenishment or store notification."
              >
                {(!data.productInventory?.lowStockAlerts || data.productInventory.lowStockAlerts.length === 0) ? (
                  <EmptyState title="Healthy Inventory" description="No products currently have low stock (< 5 units)." />
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead className="border-b border-stone-200 text-stone-500 dark:border-stone-800">
                        <tr>
                          <th className="py-2.5 font-semibold">Product Name</th>
                          <th className="py-2.5 font-semibold">SKU</th>
                          <th className="py-2.5 font-semibold">Store</th>
                          <th className="py-2.5 font-semibold">Units Remaining</th>
                          <th className="py-2.5 font-semibold">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-stone-100 dark:divide-stone-800">
                        {data.productInventory.lowStockAlerts.map((item) => (
                          <tr key={item.productId}>
                            <td className="py-3 font-semibold text-stone-900 dark:text-stone-100">{item.name}</td>
                            <td className="py-3 font-mono text-stone-500">{item.sku}</td>
                            <td className="py-3 text-stone-600 dark:text-stone-300">{item.storeName}</td>
                            <td className="py-3 font-bold text-rose-600">{item.quantity}</td>
                            <td className="py-3">
                              <span
                                className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
                                  item.quantity === 0
                                    ? "bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300"
                                    : "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300"
                                }`}
                              >
                                {item.quantity === 0 ? "Out of Stock" : "Low Stock"}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </DashboardCard>

              {/* Stock by Category */}
              <DashboardCard title="Stock Units by Category" description="Aggregated inventory volume per marketplace category.">
                <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-4">
                  {data.productInventory?.stockByCategory?.map((c) => (
                    <div
                      key={c.categoryName}
                      className="rounded-xl border border-stone-200 bg-stone-50/50 p-3.5 dark:border-stone-800 dark:bg-stone-900/40"
                    >
                      <span className="text-xs font-semibold text-stone-700 dark:text-stone-300">{c.categoryName}</span>
                      <p className="text-lg font-bold text-stone-900 dark:text-stone-100 mt-1">
                        {c.totalStock.toLocaleString()} units
                      </p>
                      <p className="text-[11px] text-stone-500">{c.productCount} products listed</p>
                    </div>
                  ))}
                </div>
              </DashboardCard>
            </div>
          )}

          {/* Tab 7: Coupons Analytics */}
          {activeTab === "coupons" && (
            <div className="space-y-6">
              {data.couponAnalytics?.kpis && (
                <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
                  <StatCard
                    title="Coupons Created"
                    value={data.couponAnalytics.kpis.couponsCreated.toLocaleString()}
                  />
                  <StatCard
                    title="Coupons Redeemed"
                    value={data.couponAnalytics.kpis.couponsRedeemed.toLocaleString()}
                  />
                  <StatCard
                    title="Active Offers"
                    value={data.couponAnalytics.kpis.activeOffers.toLocaleString()}
                  />
                  <StatCard
                    title="Homepage Offers"
                    value={data.couponAnalytics.kpis.homepageOffers.toLocaleString()}
                  />
                  <StatCard
                    title="Buyer Savings Provided"
                    value={formatCurrency(data.couponAnalytics.kpis.revenueSaved)}
                  />
                </div>
              )}

              <TopLeaderboardCard
                title="Most Redeemed Coupons"
                description="Promotional coupon codes with highest customer conversion"
                items={
                  data.couponAnalytics?.mostUsedCoupons?.map((c) => ({
                    id: c.code,
                    name: c.code,
                    value: c.usageCount,
                    secondary: `Discount: ${c.discountType === "percentage" ? `${c.discountValue}%` : `₹${c.discountValue}`}`,
                  })) ?? []
                }
              />
            </div>
          )}

          {/* Tab 8: Reviews Analytics */}
          {activeTab === "reviews" && (
            <div className="space-y-6">
              {data.reviewAnalytics?.kpis && (
                <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
                  <StatCard
                    title="Average Rating"
                    value={`${data.reviewAnalytics.kpis.averageRating.toFixed(1)} ★`}
                  />
                  <StatCard
                    title="Total Reviews"
                    value={data.reviewAnalytics.kpis.totalReviews.toLocaleString()}
                  />
                  <StatCard
                    title="Pending Queue"
                    value={data.reviewAnalytics.kpis.pendingReviews.toLocaleString()}
                  />
                  <StatCard
                    title="Hidden Reviews"
                    value={data.reviewAnalytics.kpis.hiddenReviews.toLocaleString()}
                  />
                  <StatCard
                    title="Reported"
                    value={data.reviewAnalytics.kpis.reportedReviews.toLocaleString()}
                  />
                </div>
              )}

              <div className="grid gap-4 xl:grid-cols-3">
                <TopLeaderboardCard
                  title="Highest Rated Products"
                  description="Products with best customer feedback"
                  items={
                    data.reviewAnalytics?.topRatedProducts?.map((p) => ({
                      id: p.productId,
                      name: p.name,
                      value: p.rating,
                      secondary: `${p.totalReviews} customer reviews`,
                    })) ?? []
                  }
                />
                <TopLeaderboardCard
                  title="Lowest Rated Products"
                  description="Products that may need seller attention"
                  items={
                    data.reviewAnalytics?.lowestRatedProducts?.map((p) => ({
                      id: p.productId,
                      name: p.name,
                      value: p.rating,
                      secondary: `${p.totalReviews} customer reviews`,
                    })) ?? []
                  }
                />
                <TopLeaderboardCard
                  title="Highest Rated Stores"
                  description="Stores maintaining exceptional service ratings"
                  items={
                    data.reviewAnalytics?.topRatedStores?.map((s) => ({
                      id: s.storeId,
                      name: s.storeName,
                      value: s.rating,
                      secondary: `${s.totalReviews} store reviews`,
                    })) ?? []
                  }
                />
              </div>
            </div>
          )}

          {/* Tab 9: Health & Activity Stream */}
          {activeTab === "health_activity" && (
            <div className="space-y-6">
              {data.marketplaceHealth && <MarketplaceHealthWidget health={data.marketplaceHealth} />}
              {data.activityFeed && <ActivityFeedWidget items={data.activityFeed} />}
            </div>
          )}

          {/* Tab 10: Top Leaderboards */}
          {activeTab === "top_lists" && (
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              <TopLeaderboardCard
                title="Top Products by Volume"
                description="Products with highest sales units"
                items={data.topLists?.topProducts ?? []}
              />
              <TopLeaderboardCard
                title="Top Stores by Orders"
                description="Most active seller store partners"
                items={data.topLists?.topStores ?? []}
              />
              <TopLeaderboardCard
                title="Top Buyers by Orders"
                description="Most frequent marketplace customers"
                items={data.topLists?.topCustomers ?? []}
              />
              <TopLeaderboardCard
                title="Top Categories by Volume"
                description="Marketplace categories with highest sales"
                items={data.topLists?.topCategories ?? []}
              />
              <TopLeaderboardCard
                title="Top Coupons by Usage"
                description="Most applied coupon codes"
                items={data.topLists?.topCoupons ?? []}
              />
              <TopLeaderboardCard
                title="Top Cities by Customer Reach"
                description="Metropolitan delivery destinations"
                items={data.topLists?.topCities ?? []}
              />
            </div>
          )}
        </>
      )}
    </DashboardContent>
  );
}
