"use client";

import { useMemo } from "react";
import {
  TrendingUp,
  IndianRupee,
  ShoppingBag,
  Tag,
  Store,
  Boxes,
  Calendar,
  Sparkles,
  BarChart3,
  Award,
} from "lucide-react";
import { useCustomerInsights } from "@/hooks/use-customer-analytics";
import { LoadingSkeleton } from "@/components/dashboard/LoadingSkeleton";

export function CustomerInsightsView() {
  const insightsQuery = useCustomerInsights();
  const data = insightsQuery.data;

  const maxMonthSpending = useMemo(() => {
    if (!data?.spendingTrend?.length) return 1000;
    return Math.max(...data.spendingTrend.map((t) => t.spending), 100);
  }, [data]);

  const maxCatSpent = useMemo(() => {
    if (!data?.categorySpending?.length) return 1000;
    return Math.max(...data.categorySpending.map((c) => c.spent), 100);
  }, [data]);

  if (insightsQuery.isLoading) {
    return <LoadingSkeleton rows={5} />;
  }

  return (
    <div className="space-y-6">
      {/* KPI Stat Cards Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <div className="rounded-[1.75rem] border border-stone-200 bg-white p-5 shadow-sm dark:border-stone-800 dark:bg-zinc-900">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-stone-500">
              Total Orders
            </span>
            <div className="rounded-xl bg-emerald-50 p-2.5 text-emerald-600 dark:bg-emerald-950/50">
              <ShoppingBag className="h-5 w-5" />
            </div>
          </div>
          <p className="mt-2 text-2xl font-extrabold text-stone-900 dark:text-stone-50">
            {data?.totalOrders ?? 0}
          </p>
          <p className="mt-1 text-xs text-stone-500">
            {data?.cancelledOrders ? `${data.cancelledOrders} cancelled` : "All delivered/fulfilled"}
          </p>
        </div>

        <div className="rounded-[1.75rem] border border-stone-200 bg-white p-5 shadow-sm dark:border-stone-800 dark:bg-zinc-900">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-stone-500">
              Total Money Saved
            </span>
            <div className="rounded-xl bg-emerald-50 p-2.5 text-emerald-600 dark:bg-emerald-950/50">
              <Sparkles className="h-5 w-5" />
            </div>
          </div>
          <p className="mt-2 text-2xl font-extrabold text-emerald-600 dark:text-emerald-400">
            ₹{(data?.moneySaved ?? 0).toLocaleString("en-IN")}
          </p>
          <p className="mt-1 text-xs text-stone-500">From discounts & coupons</p>
        </div>

        <div className="rounded-[1.75rem] border border-stone-200 bg-white p-5 shadow-sm dark:border-stone-800 dark:bg-zinc-900">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-stone-500">
              Coupons Redeemed
            </span>
            <div className="rounded-xl bg-amber-50 p-2.5 text-amber-600 dark:bg-amber-950/50">
              <Tag className="h-5 w-5" />
            </div>
          </div>
          <p className="mt-2 text-2xl font-extrabold text-stone-900 dark:text-stone-50">
            {data?.couponsUsed ?? 0}
          </p>
          <p className="mt-1 text-xs text-stone-500">Exclusive basket coupons applied</p>
        </div>

        <div className="rounded-[1.75rem] border border-stone-200 bg-white p-5 shadow-sm dark:border-stone-800 dark:bg-zinc-900">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-stone-500">
              Monthly Spending
            </span>
            <div className="rounded-xl bg-blue-50 p-2.5 text-blue-600 dark:bg-blue-950/50">
              <Calendar className="h-5 w-5" />
            </div>
          </div>
          <p className="mt-2 text-2xl font-extrabold text-stone-900 dark:text-stone-50">
            ₹{(data?.currentMonthSpending ?? 0).toLocaleString("en-IN")}
          </p>
          <p className="mt-1 text-xs text-stone-500">Current calendar month</p>
        </div>

        <div className="rounded-[1.75rem] border border-stone-200 bg-white p-5 shadow-sm dark:border-stone-800 dark:bg-zinc-900">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-stone-500">
              Favorite Store
            </span>
            <div className="rounded-xl bg-purple-50 p-2.5 text-purple-600 dark:bg-purple-950/50">
              <Store className="h-5 w-5" />
            </div>
          </div>
          <p className="mt-2 text-lg font-bold text-stone-900 line-clamp-1 dark:text-stone-50">
            {data?.favoriteStore ?? "None yet"}
          </p>
          <p className="mt-1 text-xs text-stone-500">Most frequent store partner</p>
        </div>

        <div className="rounded-[1.75rem] border border-stone-200 bg-white p-5 shadow-sm dark:border-stone-800 dark:bg-zinc-900">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-stone-500">
              Top Category
            </span>
            <div className="rounded-xl bg-indigo-50 p-2.5 text-indigo-600 dark:bg-indigo-950/50">
              <Boxes className="h-5 w-5" />
            </div>
          </div>
          <p className="mt-2 text-lg font-bold text-stone-900 line-clamp-1 dark:text-stone-50">
            {data?.favoriteCategory ?? "None yet"}
          </p>
          <p className="mt-1 text-xs text-stone-500">Most purchased grocery segment</p>
        </div>
      </div>

      {/* Visual Analytics Charts */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Monthly Spending Trend Bars */}
        <div className="rounded-[1.75rem] border border-stone-200 bg-white p-6 shadow-sm dark:border-stone-800 dark:bg-zinc-900">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-stone-900 dark:text-stone-50">
              Monthly Spending Trend
            </h3>
            <span className="text-xs font-semibold text-stone-400">Last 6 Months</span>
          </div>

          <div className="mt-6 flex h-48 items-end gap-3 pt-6 border-b border-stone-100 dark:border-stone-800">
            {(data?.spendingTrend ?? []).map((point, idx) => {
              const heightPct = Math.max(10, Math.round((point.spending / maxMonthSpending) * 100));
              const monthLabel = point.month
                ? new Date(point.month + "-01").toLocaleDateString("en-IN", { month: "short" })
                : "";
              return (
                <div key={idx} className="flex-1 flex flex-col items-center gap-2 h-full justify-end">
                  <span className="text-[10px] font-bold text-stone-600 dark:text-stone-400">
                    {point.spending > 0 ? `₹${point.spending}` : "-"}
                  </span>
                  <div
                    className="w-full max-w-[40px] rounded-t-xl bg-gradient-to-t from-emerald-600 to-emerald-400 transition-all duration-500 hover:brightness-110"
                    style={{ height: `${heightPct}%` }}
                  />
                  <span className="text-[11px] font-semibold text-stone-500">{monthLabel}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Category Breakdown */}
        <div className="rounded-[1.75rem] border border-stone-200 bg-white p-6 shadow-sm dark:border-stone-800 dark:bg-zinc-900">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-stone-900 dark:text-stone-50">
              Spending by Category
            </h3>
            <span className="text-xs font-semibold text-stone-400">Top Categories</span>
          </div>

          <div className="mt-6 space-y-4">
            {(data?.categorySpending ?? []).length > 0 ? (
              data!.categorySpending.map((cat, idx) => {
                const pct = Math.round((cat.spent / maxCatSpent) * 100);
                return (
                  <div key={idx} className="space-y-1.5">
                    <div className="flex justify-between text-xs">
                      <span className="font-semibold text-stone-800 dark:text-stone-200">
                        {cat.category} ({cat.itemsCount} items)
                      </span>
                      <span className="font-bold text-stone-900 dark:text-stone-100">
                        ₹{cat.spent}
                      </span>
                    </div>
                    <div className="h-2 w-full overflow-hidden rounded-full bg-stone-100 dark:bg-stone-800">
                      <div
                        className="h-full bg-emerald-500 rounded-full transition-all duration-300"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                );
              })
            ) : (
              <p className="text-xs text-stone-500 pt-8 text-center">
                Place orders across categories to see personal distribution here.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
