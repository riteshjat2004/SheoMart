"use client";

import { useSellerCouponAnalytics } from "@/hooks/use-seller-coupons";
import { LoadingSkeleton } from "@/components/dashboard/LoadingSkeleton";
import { EmptyState } from "@/components/dashboard/EmptyState";
import {
  IndianRupee,
  TicketPercent,
  TrendingUp,
  Award,
  ShoppingBag,
  Percent,
} from "lucide-react";

const money = (val?: number) => `₹${(val ?? 0).toLocaleString("en-IN")}`;

export function SellerCouponAnalyticsView() {
  const analyticsQuery = useSellerCouponAnalytics();
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
        title="Unable to load coupon analytics"
        description={analyticsQuery.error?.message || "Please try again later."}
      />
    );
  }

  const { cards, redemptionTrend, topCoupons } = data;
  const maxRedemptions = Math.max(...redemptionTrend.map((t) => t.redemptions), 1);

  return (
    <div className="space-y-6">
      {/* 4 KPI Cards */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-2xl border border-stone-200 bg-white p-5 shadow-sm dark:border-stone-800 dark:bg-stone-900">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-stone-500">
              Total Redemptions
            </span>
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400">
              <TicketPercent className="h-5 w-5" />
            </div>
          </div>
          <p className="mt-3 text-2xl font-bold text-stone-900 dark:text-stone-50">
            {cards.totalRedemptions}
          </p>
          <p className="mt-1 text-xs text-stone-500">Store coupon orders placed</p>
        </div>

        <div className="rounded-2xl border border-stone-200 bg-white p-5 shadow-sm dark:border-stone-800 dark:bg-stone-900">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-stone-500">
              Revenue Generated
            </span>
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-50 text-blue-600 dark:bg-blue-950/60 dark:text-blue-400">
              <IndianRupee className="h-5 w-5" />
            </div>
          </div>
          <p className="mt-3 text-2xl font-bold text-stone-900 dark:text-stone-50">
            {money(cards.revenueGenerated)}
          </p>
          <p className="mt-1 text-xs text-stone-500">From discounted checkouts</p>
        </div>

        <div className="rounded-2xl border border-stone-200 bg-white p-5 shadow-sm dark:border-stone-800 dark:bg-stone-900">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-stone-500">
              Discounts Given
            </span>
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-50 text-amber-600 dark:bg-amber-950/60 dark:text-amber-400">
              <Percent className="h-5 w-5" />
            </div>
          </div>
          <p className="mt-3 text-2xl font-bold text-amber-600 dark:text-amber-400">
            {money(cards.totalDiscountGiven)}
          </p>
          <p className="mt-1 text-xs text-stone-500">Total customer savings</p>
        </div>

        <div className="rounded-2xl border border-stone-200 bg-white p-5 shadow-sm dark:border-stone-800 dark:bg-stone-900">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-stone-500">
              Avg Basket Value
            </span>
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-purple-50 text-purple-600 dark:bg-purple-950/60 dark:text-purple-400">
              <TrendingUp className="h-5 w-5" />
            </div>
          </div>
          <p className="mt-3 text-2xl font-bold text-stone-900 dark:text-stone-50">
            {money(cards.averageBasketValue)}
          </p>
          <p className="mt-1 text-xs text-stone-500">Per coupon order</p>
        </div>
      </div>

      {/* Monthly Redemption Trend Bar Chart */}
      <div className="rounded-2xl border border-stone-200 bg-white p-5 shadow-sm dark:border-stone-800 dark:bg-stone-900">
        <div className="flex items-center justify-between border-b border-stone-100 pb-3 dark:border-stone-800">
          <div>
            <h3 className="font-semibold text-stone-900 dark:text-stone-50">
              Monthly Coupon Redemptions (Last 6 Months)
            </h3>
            <p className="text-xs text-stone-500">
              Track how frequently customers apply your store discount coupons
            </p>
          </div>
        </div>

        {redemptionTrend.length === 0 ? (
          <div className="py-12 text-center text-xs text-stone-400">
            No redemptions recorded in the last 6 months.
          </div>
        ) : (
          <div className="mt-6 flex h-48 items-end gap-3 sm:gap-6 px-2">
            {redemptionTrend.map((item) => {
              const heightPercent = Math.max(
                12,
                Math.round((item.redemptions / maxRedemptions) * 100)
              );
              return (
                <div
                  key={item.month}
                  className="group flex flex-1 flex-col items-center gap-2 h-full justify-end"
                >
                  <div className="opacity-0 group-hover:opacity-100 transition-opacity text-[10px] font-semibold text-stone-700 dark:text-stone-300">
                    {item.redemptions} uses ({money(item.revenue)})
                  </div>
                  <div
                    className="w-full max-w-[42px] rounded-t-lg bg-emerald-500 transition-all duration-500 group-hover:bg-emerald-600 dark:bg-emerald-600 dark:group-hover:bg-emerald-500"
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

      {/* Top Performing Coupons Leaderboard */}
      <div className="rounded-2xl border border-stone-200 bg-white p-5 shadow-sm dark:border-stone-800 dark:bg-stone-900">
        <div className="flex items-center justify-between border-b border-stone-100 pb-3 dark:border-stone-800">
          <div className="flex items-center gap-2">
            <Award className="h-5 w-5 text-amber-500" />
            <div>
              <h3 className="font-semibold text-stone-900 dark:text-stone-50">
                Top Performing Store Coupons
              </h3>
              <p className="text-xs text-stone-500">
                Ranked by customer redemption volume and sales impact
              </p>
            </div>
          </div>
        </div>

        {topCoupons.length === 0 ? (
          <p className="py-8 text-center text-xs text-stone-400">
            No coupon redemption data available yet.
          </p>
        ) : (
          <div className="mt-4 overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-stone-50 uppercase text-[11px] tracking-wider text-stone-500 dark:bg-stone-800/50 dark:text-stone-400">
                <tr>
                  <th className="px-4 py-3">Rank</th>
                  <th className="px-4 py-3">Code</th>
                  <th className="px-4 py-3">Title</th>
                  <th className="px-4 py-3">Discount</th>
                  <th className="px-4 py-3">Redemptions</th>
                  <th className="px-4 py-3">Revenue Driven</th>
                  <th className="px-4 py-3">Customer Savings</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100 dark:divide-stone-800">
                {topCoupons.map((c, idx) => (
                  <tr key={c.code} className="hover:bg-stone-50/50 dark:hover:bg-stone-800/30">
                    <td className="px-4 py-3 font-bold text-stone-400">
                      {idx === 0 ? "🥇 #1" : idx === 1 ? "🥈 #2" : idx === 2 ? "🥉 #3" : `#${idx + 1}`}
                    </td>
                    <td className="px-4 py-3 font-mono font-bold text-emerald-600 dark:text-emerald-400">
                      {c.code}
                    </td>
                    <td className="px-4 py-3 font-medium text-stone-900 dark:text-stone-100">
                      {c.title}
                    </td>
                    <td className="px-4 py-3">
                      {c.discountType === "percentage" ? `${c.discountValue}%` : `₹${c.discountValue}`}
                    </td>
                    <td className="px-4 py-3 font-semibold">{c.redemptions}</td>
                    <td className="px-4 py-3 font-bold text-emerald-600 dark:text-emerald-400">
                      {money(c.totalRevenue)}
                    </td>
                    <td className="px-4 py-3 text-stone-600 dark:text-stone-400">
                      {money(c.totalDiscount)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
