"use client";

import { useState } from "react";
import {
  IndianRupee,
  ShoppingBag,
  TrendingUp,
  Users,
  Download,
  Calendar,
  Package,
  Boxes,
  TicketPercent,
  Star,
  FileSpreadsheet,
} from "lucide-react";
import { Breadcrumb } from "@/components/dashboard/layout/Breadcrumb";
import { DashboardContent } from "@/components/dashboard/layout/DashboardContent";
import { PageHeader } from "@/components/dashboard/layout/PageHeader";
import { Button } from "@/components/ui/button";
import { useSellerAnalytics } from "@/hooks/use-seller-analytics";
import { exportSellerAnalytics } from "@/services/seller-analytics";

const money = (val?: number) => `₹${(val ?? 0).toLocaleString("en-IN")}`;

type DateRange = "today" | "week" | "month" | "quarter" | "year";

export default function StoreAnalyticsPage() {
  const [range, setRange] = useState<DateRange>("month");
  const [isExporting, setIsExporting] = useState(false);

  const { data: analytics, isLoading } = useSellerAnalytics({ range });
  const kpis = analytics?.kpis;
  const trend = analytics?.trend ?? [];
  const topProducts = analytics?.topProducts ?? [];

  const maxRevenue = Math.max(...trend.map((t) => t.revenue), 1000);

  const handleExport = async (type: "orders" | "products") => {
    setIsExporting(true);
    try {
      const blob = await exportSellerAnalytics({ type, from: undefined, to: undefined });
      const url = window.URL.createObjectURL(new Blob([blob]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `store_${type}_export_${Date.now()}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      console.error("Export failed", err);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <DashboardContent className="space-y-6">
      <Breadcrumb items={[{ label: "Analytics & Growth" }]} />

      <PageHeader
        category="ANALYTICS"
        title="Store Analytics & Insights"
        description="Comprehensive store-exclusive performance telemetry, revenue velocity, order volumes, and customer trends."
        actions={
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex rounded-xl border border-stone-200 bg-white p-1 dark:border-stone-800 dark:bg-stone-900 shadow-2xs">
              {(["today", "week", "month", "quarter", "year"] as DateRange[]).map((r) => (
                <button
                  key={r}
                  type="button"
                  onClick={() => setRange(r)}
                  className={`rounded-lg px-3 py-1 text-xs font-semibold capitalize transition ${
                    range === r
                      ? "bg-emerald-600 text-white shadow-xs"
                      : "text-stone-600 hover:bg-stone-100 dark:text-stone-400 dark:hover:bg-stone-800"
                  }`}
                >
                  {r === "today" ? "Today" : r === "week" ? "7 Days" : r === "month" ? "30 Days" : r === "quarter" ? "3 Months" : "1 Year"}
                </button>
              ))}
            </div>

            <Button
              variant="outline"
              size="sm"
              disabled={isExporting}
              onClick={() => handleExport("orders")}
              className="h-8.5 gap-1.5"
            >
              <Download className="h-3.5 w-3.5" />
              <span>Export CSV</span>
            </Button>

            <Button
              variant="outline"
              size="sm"
              disabled={isExporting}
              onClick={() => handleExport("products")}
              className="h-8.5 gap-1.5"
            >
              <FileSpreadsheet className="h-3.5 w-3.5" />
              <span>Catalog Export</span>
            </Button>
          </div>
        }
      />

      {/* KPI Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-2xl border border-stone-200 bg-white p-5 shadow-sm dark:border-stone-800 dark:bg-stone-900">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-stone-500">Gross Sales</span>
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 dark:bg-emerald-950/50 dark:text-emerald-400">
              <IndianRupee className="h-4.5 w-4.5" />
            </div>
          </div>
          <p className="mt-3 text-2xl font-bold text-stone-900 dark:text-stone-50">
            {money(kpis?.totalRevenue)}
          </p>
          <p className="mt-1 text-xs text-stone-400">
            Average basket: <span className="font-semibold text-stone-700 dark:text-stone-300">{money(kpis?.averageBasketValue)}</span>
          </p>
        </div>

        <div className="rounded-2xl border border-stone-200 bg-white p-5 shadow-sm dark:border-stone-800 dark:bg-stone-900">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-stone-500">Order Volume</span>
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-50 text-blue-600 dark:bg-blue-950/50 dark:text-blue-400">
              <ShoppingBag className="h-4.5 w-4.5" />
            </div>
          </div>
          <p className="mt-3 text-2xl font-bold text-stone-900 dark:text-stone-50">
            {kpis?.totalOrders ?? 0}
          </p>
          <p className="mt-1 text-xs text-stone-400">
            {kpis?.completedOrders ?? 0} fulfilled • {kpis?.cancelledOrders ?? 0} cancelled
          </p>
        </div>

        <div className="rounded-2xl border border-stone-200 bg-white p-5 shadow-sm dark:border-stone-800 dark:bg-stone-900">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-stone-500">Store Shoppers</span>
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-purple-50 text-purple-600 dark:bg-purple-950/50 dark:text-purple-400">
              <Users className="h-4.5 w-4.5" />
            </div>
          </div>
          <p className="mt-3 text-2xl font-bold text-stone-900 dark:text-stone-50">
            {kpis?.uniqueCustomers ?? 0}
          </p>
          <p className="mt-1 text-xs text-stone-400">
            Active verified shoppers in period
          </p>
        </div>

        <div className="rounded-2xl border border-stone-200 bg-white p-5 shadow-sm dark:border-stone-800 dark:bg-stone-900">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-stone-500">Inventory Health</span>
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 dark:bg-indigo-950/50 dark:text-indigo-400">
              <Boxes className="h-4.5 w-4.5" />
            </div>
          </div>
          <p className="mt-3 text-2xl font-bold text-stone-900 dark:text-stone-50">
            {kpis?.totalProducts ?? 0}
          </p>
          <p className="mt-1 text-xs text-stone-400">
            {kpis?.lowStockCount ?? 0} items near reorder limit
          </p>
        </div>
      </div>

      {/* Revenue Trend Chart */}
      <div className="rounded-2xl border border-stone-200 bg-white p-6 shadow-sm dark:border-stone-800 dark:bg-stone-900">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between pb-4 border-b border-stone-100 dark:border-stone-800 gap-2">
          <div>
            <h3 className="text-base font-bold text-stone-900 dark:text-stone-50">Revenue & Order Trajectory</h3>
            <p className="text-xs text-stone-400">Daily sales breakdown across selected time window</p>
          </div>
          <div className="flex items-center gap-4 text-xs">
            <div className="flex items-center gap-1.5">
              <div className="h-3 w-3 rounded-full bg-emerald-600" />
              <span className="text-stone-600 dark:text-stone-400">Revenue (₹)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="h-3 w-3 rounded-full bg-blue-500" />
              <span className="text-stone-600 dark:text-stone-400">Orders count</span>
            </div>
          </div>
        </div>

        <div className="mt-6">
          {trend.length === 0 ? (
            <div className="py-12 text-center text-xs text-stone-400">
              No transaction data available for this range.
            </div>
          ) : (
            <div className="h-64 flex items-end gap-2 pt-6 pb-2 overflow-x-auto scrollbar-thin">
              {trend.map((pt) => {
                const heightPct = Math.max(8, Math.round((pt.revenue / maxRevenue) * 100));
                return (
                  <div key={pt.date} className="flex-1 min-w-[28px] flex flex-col items-center gap-2 group">
                    <div className="text-[10px] font-bold text-stone-700 dark:text-stone-300 opacity-0 group-hover:opacity-100 transition truncate">
                      {money(pt.revenue)}
                    </div>
                    <div className="w-full relative flex items-end justify-center h-48 bg-stone-50 dark:bg-stone-800/40 rounded-t-lg overflow-hidden">
                      <div
                        style={{ height: `${heightPct}%` }}
                        className="w-full bg-linear-to-t from-emerald-600 to-emerald-400 rounded-t transition-all group-hover:brightness-110"
                      />
                    </div>
                    <span className="text-[10px] text-stone-400 truncate max-w-[40px]">
                      {new Date(pt.date).toLocaleDateString([], { day: "numeric", month: "short" })}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Top Products Table */}
      <div className="rounded-2xl border border-stone-200 bg-white p-6 shadow-sm dark:border-stone-800 dark:bg-stone-900">
        <h3 className="text-base font-bold text-stone-900 dark:text-stone-50 mb-1">Top Selling Items</h3>
        <p className="text-xs text-stone-400 mb-4">Catalog leaders driving revenue for your store</p>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-stone-100 text-stone-400 dark:border-stone-800">
                <th className="pb-3 font-semibold">Product</th>
                <th className="pb-3 font-semibold">Unit Price</th>
                <th className="pb-3 font-semibold">Units Sold</th>
                <th className="pb-3 font-semibold">Available Stock</th>
                <th className="pb-3 font-semibold text-right">Revenue Generated</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100 dark:divide-stone-800">
              {topProducts.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-6 text-center text-stone-400">
                    No sales data recorded yet.
                  </td>
                </tr>
              ) : (
                topProducts.map((p) => (
                  <tr key={p.productId} className="hover:bg-stone-50/60 dark:hover:bg-stone-800/40">
                    <td className="py-3 font-semibold text-stone-800 dark:text-stone-200">
                      {p.name}
                    </td>
                    <td className="py-3 text-stone-600 dark:text-stone-400">
                      {money(p.price)}
                    </td>
                    <td className="py-3 text-stone-600 dark:text-stone-400">
                      {p.salesCount} units
                    </td>
                    <td className="py-3">
                      <span className={`rounded-md px-2 py-0.5 text-[11px] font-semibold ${
                        p.quantity <= 5
                          ? "bg-rose-50 text-rose-600 dark:bg-rose-950/60 dark:text-rose-400"
                          : "bg-emerald-50 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400"
                      }`}>
                        {p.quantity} in stock
                      </span>
                    </td>
                    <td className="py-3 text-right font-bold text-stone-900 dark:text-stone-100">
                      {money(p.revenue)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </DashboardContent>
  );
}
