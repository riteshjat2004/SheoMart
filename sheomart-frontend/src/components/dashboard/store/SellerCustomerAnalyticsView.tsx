"use client";

import { useStoreCustomersAnalytics } from "@/hooks/use-store-customers";
import { LoadingSkeleton } from "@/components/dashboard/LoadingSkeleton";
import { EmptyState } from "@/components/dashboard/EmptyState";
import {
  IndianRupee,
  Users,
  Repeat,
  TrendingUp,
  Award,
  Crown,
  ShieldCheck,
  ShoppingBag,
} from "lucide-react";

const money = (val?: number) => `₹${(val ?? 0).toLocaleString("en-IN")}`;
const formatDate = (val?: string | null) =>
  val
    ? new Date(val).toLocaleDateString("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric",
      })
    : "-";

export function SellerCustomerAnalyticsView() {
  const analyticsQuery = useStoreCustomersAnalytics();
  const data = analyticsQuery.data;

  if (analyticsQuery.isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <LoadingSkeleton rows={2} />
          <LoadingSkeleton rows={2} />
          <LoadingSkeleton rows={2} />
          <LoadingSkeleton rows={2} />
        </div>
        <LoadingSkeleton rows={6} />
      </div>
    );
  }

  if (analyticsQuery.isError || !data) {
    return (
      <EmptyState
        title="Unable to load customer analytics"
        description={analyticsQuery.error?.message || "Please try again later."}
      />
    );
  }

  const { cards, spendingTrend, topCustomers, categorySpending } = data;
  const maxTrendRevenue = Math.max(...spendingTrend.map((t) => t.revenue), 1);

  return (
    <div className="space-y-6">
      {/* 4 KPI Cards */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-2xl border border-stone-200 bg-white p-5 shadow-sm dark:border-stone-800 dark:bg-stone-900">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-stone-500">
              Total Customer Revenue
            </span>
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400">
              <IndianRupee className="h-5 w-5" />
            </div>
          </div>
          <p className="mt-3 text-2xl font-bold text-stone-900 dark:text-stone-50">
            {money(cards.totalRevenue)}
          </p>
          <p className="mt-1 text-xs text-stone-500">
            From {cards.totalCustomers} total unique customers
          </p>
        </div>

        <div className="rounded-2xl border border-stone-200 bg-white p-5 shadow-sm dark:border-stone-800 dark:bg-stone-900">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-stone-500">
              Avg Customer Spend
            </span>
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-50 text-blue-600 dark:bg-blue-950/60 dark:text-blue-400">
              <TrendingUp className="h-5 w-5" />
            </div>
          </div>
          <p className="mt-3 text-2xl font-bold text-stone-900 dark:text-stone-50">
            {money(cards.averageCustomerSpend)}
          </p>
          <p className="mt-1 text-xs text-stone-500">Average lifetime spend</p>
        </div>

        <div className="rounded-2xl border border-stone-200 bg-white p-5 shadow-sm dark:border-stone-800 dark:bg-stone-900">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-stone-500">
              Repeat Purchase Rate
            </span>
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-purple-50 text-purple-600 dark:bg-purple-950/60 dark:text-purple-400">
              <Repeat className="h-5 w-5" />
            </div>
          </div>
          <p className="mt-3 text-2xl font-bold text-stone-900 dark:text-stone-50">
            {cards.repeatPurchaseRate}%
          </p>
          <p className="mt-1 text-xs text-stone-500">
            {cards.repeatCustomersCount} customers ordered &gt; 1 time
          </p>
        </div>

        <div className="rounded-2xl border border-stone-200 bg-white p-5 shadow-sm dark:border-stone-800 dark:bg-stone-900">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-stone-500">
              New vs Returning
            </span>
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-50 text-amber-600 dark:bg-amber-950/60 dark:text-amber-400">
              <Users className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-3">
            <span className="text-2xl font-bold text-stone-900 dark:text-stone-50">
              {cards.newCustomersCount}
            </span>
            <span className="text-xs font-medium text-stone-400">New /</span>
            <span className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
              {cards.repeatCustomersCount}
            </span>
            <span className="text-xs font-medium text-stone-400">Repeat</span>
          </div>
          <p className="mt-1 text-xs text-stone-500">Customer loyalty split</p>
        </div>
      </div>

      {/* Spending Trend Bar Chart & Category Breakdown */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Monthly Spending Trend */}
        <div className="rounded-2xl border border-stone-200 bg-white p-5 shadow-sm dark:border-stone-800 dark:bg-stone-900 lg:col-span-2">
          <div className="flex items-center justify-between border-b border-stone-100 pb-3 dark:border-stone-800">
            <div>
              <h3 className="font-semibold text-stone-900 dark:text-stone-50">
                Monthly Spending Trend (Last 6 Months)
              </h3>
              <p className="text-xs text-stone-500">
                Revenue generated from customers purchasing from your store
              </p>
            </div>
          </div>

          {spendingTrend.length === 0 ? (
            <div className="py-12 text-center text-xs text-stone-400">
              No sales data recorded in the last 6 months.
            </div>
          ) : (
            <div className="mt-6 flex h-48 items-end gap-3 sm:gap-6 px-2">
              {spendingTrend.map((item) => {
                const heightPercent = Math.max(
                  10,
                  Math.round((item.revenue / maxTrendRevenue) * 100)
                );
                return (
                  <div
                    key={item.month}
                    className="group flex flex-1 flex-col items-center gap-2 h-full justify-end"
                  >
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity text-[10px] font-semibold text-stone-700 dark:text-stone-300">
                      {money(item.revenue)}
                    </div>
                    <div
                      className="w-full max-w-[40px] rounded-t-lg bg-emerald-500 transition-all duration-500 group-hover:bg-emerald-600 dark:bg-emerald-600 dark:group-hover:bg-emerald-500"
                      style={{ height: `${heightPercent}%` }}
                    />
                    <span className="text-[11px] font-medium text-stone-500 truncate max-w-full">
                      {item.month.split(" ")[0]}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Category Spending Breakdown */}
        <div className="rounded-2xl border border-stone-200 bg-white p-5 shadow-sm dark:border-stone-800 dark:bg-stone-900">
          <div className="flex items-center justify-between border-b border-stone-100 pb-3 dark:border-stone-800">
            <div>
              <h3 className="font-semibold text-stone-900 dark:text-stone-50">
                Category Spending
              </h3>
              <p className="text-xs text-stone-500">Popular departments</p>
            </div>
            <ShoppingBag className="h-4 w-4 text-stone-400" />
          </div>

          <div className="mt-4 space-y-3">
            {categorySpending.length === 0 ? (
              <p className="py-6 text-center text-xs text-stone-400">
                No category sales recorded yet.
              </p>
            ) : (
              categorySpending.map((cat) => {
                const totalRev = cards.totalRevenue || 1;
                const pct = Math.min(100, Math.round((cat.spending / totalRev) * 100));
                return (
                  <div key={cat.category} className="space-y-1">
                    <div className="flex justify-between text-xs">
                      <span className="font-medium text-stone-700 dark:text-stone-300 capitalize">
                        {cat.category || "General"}
                      </span>
                      <span className="font-bold text-stone-900 dark:text-stone-100">
                        {money(cat.spending)} ({pct}%)
                      </span>
                    </div>
                    <div className="h-1.5 w-full rounded-full bg-stone-100 dark:bg-stone-800">
                      <div
                        className="h-1.5 rounded-full bg-emerald-500"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>

      {/* Top 10 Customers Leaderboard */}
      <div className="rounded-2xl border border-stone-200 bg-white p-5 shadow-sm dark:border-stone-800 dark:bg-stone-900">
        <div className="flex items-center justify-between border-b border-stone-100 pb-3 dark:border-stone-800">
          <div className="flex items-center gap-2">
            <Award className="h-5 w-5 text-amber-500" />
            <div>
              <h3 className="font-semibold text-stone-900 dark:text-stone-50">
                Top 10 Most Valuable Customers
              </h3>
              <p className="text-xs text-stone-500">
                Ranked by lifetime revenue generated at your store
              </p>
            </div>
          </div>
        </div>

        <div className="mt-4 overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-stone-50 uppercase text-[11px] tracking-wider text-stone-500 dark:bg-stone-800/50 dark:text-stone-400">
              <tr>
                <th className="px-4 py-3">Rank</th>
                <th className="px-4 py-3">Customer</th>
                <th className="px-4 py-3">Phone</th>
                <th className="px-4 py-3">Total Orders</th>
                <th className="px-4 py-3">Lifetime Spend</th>
                <th className="px-4 py-3">Last Order</th>
                <th className="px-4 py-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100 dark:divide-stone-800">
              {topCustomers.map((cust, idx) => (
                <tr key={cust.customerId} className="hover:bg-stone-50/50 dark:hover:bg-stone-800/30">
                  <td className="px-4 py-3 font-bold text-stone-400">
                    {idx === 0 ? "🥇 #1" : idx === 1 ? "🥈 #2" : idx === 2 ? "🥉 #3" : `#${idx + 1}`}
                  </td>
                  <td className="px-4 py-3 font-semibold text-stone-900 dark:text-stone-100">
                    <div className="flex items-center gap-2">
                      <span>{cust.name}</span>
                      {cust.isVip ? <Crown className="h-3.5 w-3.5 text-amber-500" /> : null}
                      {cust.isVerified ? (
                        <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />
                      ) : null}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-stone-600 dark:text-stone-400">{cust.mobile || "-"}</td>
                  <td className="px-4 py-3 font-semibold">{cust.totalOrders}</td>
                  <td className="px-4 py-3 font-bold text-emerald-600 dark:text-emerald-400">
                    {money(cust.totalSpend)}
                  </td>
                  <td className="px-4 py-3 text-stone-500">{formatDate(cust.lastPurchaseAt)}</td>
                  <td className="px-4 py-3">
                    <span
                      className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                        cust.isVip
                          ? "bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300"
                          : "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300"
                      }`}
                    >
                      {cust.isVip ? "VIP Customer" : "Valued Customer"}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
