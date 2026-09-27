"use client";

import { useState } from "react";
import { Search, Receipt, ShieldCheck, ArrowUpDown } from "lucide-react";
import { useSellerCouponRedemptions } from "@/hooks/use-seller-coupons";
import { Pagination } from "@/components/dashboard/Pagination";
import { LoadingSkeleton } from "@/components/dashboard/LoadingSkeleton";
import { EmptyState } from "@/components/dashboard/EmptyState";
import { StatusBadge } from "@/components/dashboard/StatusBadge";

const money = (val?: number) => `₹${(val ?? 0).toLocaleString("en-IN")}`;
const formatDate = (val?: string | null) =>
  val
    ? new Date(val).toLocaleDateString("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
    : "-";

export function SellerCouponRedemptionsView() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");

  const redemptionsQuery = useSellerCouponRedemptions({
    page,
    limit: 10,
    search: search.trim() || undefined,
  });

  const redemptions = redemptionsQuery.data?.redemptions ?? [];
  const pagination = redemptionsQuery.data?.pagination;

  return (
    <div className="space-y-4">
      {/* Search Bar */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative max-w-sm flex-1">
          <Search className="pointer-events-none absolute left-3 top-2.5 h-4 w-4 text-stone-400" />
          <input
            type="search"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            placeholder="Search by customer name, order ID, or code..."
            className="h-9 w-full rounded-xl border border-stone-200 bg-white pl-9 pr-3 text-xs text-stone-900 outline-none focus:border-emerald-500 dark:border-stone-800 dark:bg-stone-950 dark:text-stone-50"
          />
        </div>
      </div>

      {redemptionsQuery.isLoading ? <LoadingSkeleton rows={5} /> : null}

      {!redemptionsQuery.isLoading && redemptions.length === 0 ? (
        <EmptyState
          title="No coupon redemptions yet"
          description="When customers apply your store discount coupons during checkout, their order logs will appear here."
        />
      ) : null}

      {!redemptionsQuery.isLoading && redemptions.length > 0 ? (
        <div className="overflow-x-auto rounded-2xl border border-stone-200 bg-white shadow-sm dark:border-stone-800 dark:bg-stone-900">
          <table className="min-w-[900px] w-full text-left text-xs">
            <thead className="bg-stone-50 uppercase text-[11px] tracking-wider text-stone-500 dark:bg-stone-800/60 dark:text-stone-400">
              <tr>
                <th className="px-4 py-3.5">Customer</th>
                <th className="px-4 py-3.5">Coupon Applied</th>
                <th className="px-4 py-3.5">Order ID</th>
                <th className="px-4 py-3.5">Customer Savings</th>
                <th className="px-4 py-3.5">Final Order Amount</th>
                <th className="px-4 py-3.5">Order Status</th>
                <th className="px-4 py-3.5">Redeemed At</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100 dark:divide-stone-800">
              {redemptions.map((r, index) => (
                <tr
                  key={`${r.orderId}-${index}`}
                  className="transition hover:bg-stone-50/50 dark:hover:bg-stone-800/30"
                >
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1.5">
                      <span className="font-semibold text-stone-900 dark:text-stone-100">
                        {r.customer.name}
                      </span>
                      {r.customer.isVerified ? (
                        <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />
                      ) : null}
                    </div>
                    <span className="text-[11px] text-stone-400">
                      {r.customer.mobile || r.customer.email || "-"}
                    </span>
                  </td>

                  <td className="px-4 py-3">
                    <span className="font-mono font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-lg border border-emerald-200 dark:bg-emerald-950/40 dark:border-emerald-800 dark:text-emerald-300">
                      {r.couponCode}
                    </span>
                  </td>

                  <td className="px-4 py-3 font-mono font-medium text-stone-600 dark:text-stone-300">
                    #{r.orderId.slice(-8).toUpperCase()}
                  </td>

                  <td className="px-4 py-3 font-bold text-emerald-600 dark:text-emerald-400">
                    {money(r.discountGiven)}
                  </td>

                  <td className="px-4 py-3 font-bold text-stone-900 dark:text-stone-100">
                    {money(r.orderAmount)}
                  </td>

                  <td className="px-4 py-3">
                    <StatusBadge status={r.orderStatus} />
                  </td>

                  <td className="px-4 py-3 whitespace-nowrap text-stone-500">
                    {formatDate(r.date)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : null}

      {pagination && pagination.totalPages > 1 ? (
        <div className="pt-2">
          <Pagination
            page={pagination.page}
            totalPages={pagination.totalPages}
            onPageChange={setPage}
          />
        </div>
      ) : null}
    </div>
  );
}
