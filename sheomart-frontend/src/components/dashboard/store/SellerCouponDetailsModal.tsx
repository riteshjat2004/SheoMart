"use client";

import { useState } from "react";
import {
  X,
  Tag,
  Calendar,
  Percent,
  IndianRupee,
  Layers,
  Users,
  Copy,
  Check,
  TrendingUp,
  Clock,
  ShieldCheck,
  AlertCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/dashboard/StatusBadge";
import { LoadingSkeleton } from "@/components/dashboard/LoadingSkeleton";
import { useSellerCoupon, useUpdateSellerCouponStatus } from "@/hooks/use-seller-coupons";
import type { SellerCouponItem } from "@/types/seller-coupon";

interface SellerCouponDetailsModalProps {
  coupon: SellerCouponItem;
  onClose: () => void;
  onEdit?: () => void;
}

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

export function SellerCouponDetailsModal({
  coupon,
  onClose,
  onEdit,
}: SellerCouponDetailsModalProps) {
  const couponQuery = useSellerCoupon(coupon.couponId);
  const data = couponQuery.data || coupon;
  const updateStatus = useUpdateSellerCouponStatus();
  const [copied, setCopied] = useState(false);

  const copyCode = async () => {
    await navigator.clipboard.writeText(data.code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleToggleActive = () => {
    updateStatus.mutate({
      couponId: data.couponId,
      isActive: !data.isActive,
    });
  };

  const redemptionPct =
    data.usageLimit && data.usageLimit > 0
      ? Math.min(100, Math.round(((data.usageCount || 0) / data.usageLimit) * 100))
      : null;

  return (
    <>
      <button
        type="button"
        aria-label="Close coupon details"
        className="fixed inset-0 z-40 bg-stone-950/60 backdrop-blur-sm"
        onClick={onClose}
      />
      <aside
        className="fixed inset-x-0 bottom-0 z-50 max-h-[94vh] overflow-y-auto rounded-t-2xl border border-stone-200 bg-stone-50 p-6 shadow-2xl dark:border-stone-800 dark:bg-stone-950 sm:inset-y-0 sm:right-0 sm:left-auto sm:h-full sm:w-[min(100%,38rem)] sm:rounded-none sm:border-y-0 sm:border-r-0"
        role="dialog"
        aria-modal="true"
        aria-labelledby="coupon-details-title"
      >
        {/* Header */}
        <div className="flex items-start justify-between gap-4 border-b border-stone-200 pb-4 dark:border-stone-800">
          <div>
            <div className="flex items-center gap-2">
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300">
                <Tag className="h-5 w-5" />
              </span>
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                  Seller Store Coupon
                </p>
                <h2 id="coupon-details-title" className="text-xl font-bold text-stone-900 dark:text-stone-50">
                  {data.title}
                </h2>
              </div>
            </div>
            <p className="mt-1 text-xs text-stone-500">
              Created {formatDate(data.createdAt)}
            </p>
          </div>
          <Button type="button" variant="ghost" size="icon" onClick={onClose} aria-label="Close drawer">
            <X className="h-5 w-5" />
          </Button>
        </div>

        {couponQuery.isLoading ? (
          <div className="mt-6 space-y-4">
            <LoadingSkeleton rows={5} />
          </div>
        ) : null}

        {!couponQuery.isLoading ? (
          <div className="mt-6 space-y-6">
            {/* Coupon Code Banner Card */}
            <div className="rounded-2xl border border-dashed border-emerald-300 bg-emerald-50/60 p-4 dark:border-emerald-800 dark:bg-emerald-950/20">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <span className="text-[11px] text-stone-500 font-medium">Coupon Code</span>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="font-mono text-2xl font-black text-emerald-700 dark:text-emerald-300 tracking-wider">
                      {data.code}
                    </span>
                    <button
                      type="button"
                      onClick={copyCode}
                      className="rounded-lg p-1.5 text-emerald-700 hover:bg-emerald-200/50 transition dark:text-emerald-300"
                      title="Copy coupon code"
                    >
                      {copied ? <Check className="h-4 w-4 text-emerald-600" /> : <Copy className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <StatusBadge status={data.status} />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleToggleActive}
                    disabled={updateStatus.isPending}
                    className="h-8 text-xs font-semibold"
                  >
                    {data.isActive ? "Deactivate" : "Activate"}
                  </Button>
                </div>
              </div>

              {data.description ? (
                <p className="mt-3 text-xs text-stone-600 dark:text-stone-300 border-t border-emerald-200/60 pt-2.5 dark:border-emerald-800/60">
                  {data.description}
                </p>
              ) : null}
            </div>

            {/* Performance KPI Cards */}
            <div>
              <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-stone-500">
                Redemption Performance
              </p>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                <div className="rounded-xl border border-stone-200 bg-white p-3.5 shadow-sm dark:border-stone-800 dark:bg-stone-900">
                  <span className="text-xs text-stone-500">Redeemed</span>
                  <p className="mt-1 text-xl font-bold text-stone-900 dark:text-stone-50">
                    {data.usageCount || 0}
                  </p>
                  <p className="text-[10px] text-stone-400">
                    {data.usageLimit ? `of ${data.usageLimit} max` : "Unlimited"}
                  </p>
                </div>

                <div className="rounded-xl border border-stone-200 bg-white p-3.5 shadow-sm dark:border-stone-800 dark:bg-stone-900">
                  <span className="text-xs text-stone-500">Revenue Driven</span>
                  <p className="mt-1 text-xl font-bold text-emerald-600 dark:text-emerald-400">
                    {money(data.revenueGenerated)}
                  </p>
                  <p className="text-[10px] text-stone-400">From redeemed orders</p>
                </div>

                <div className="rounded-xl border border-stone-200 bg-white p-3.5 shadow-sm dark:border-stone-800 dark:bg-stone-900">
                  <span className="text-xs text-stone-500">Discount Given</span>
                  <p className="mt-1 text-xl font-bold text-stone-900 dark:text-stone-50">
                    {money(data.discountGiven)}
                  </p>
                  <p className="text-[10px] text-stone-400">Total customer savings</p>
                </div>

                <div className="rounded-xl border border-stone-200 bg-white p-3.5 shadow-sm dark:border-stone-800 dark:bg-stone-900">
                  <span className="text-xs text-stone-500">Orders Count</span>
                  <p className="mt-1 text-xl font-bold text-stone-900 dark:text-stone-50">
                    {data.ordersCount || data.usageCount || 0}
                  </p>
                  <p className="text-[10px] text-stone-400">Store checkouts</p>
                </div>
              </div>

              {redemptionPct !== null ? (
                <div className="mt-3 rounded-xl border border-stone-200 bg-white p-3 dark:border-stone-800 dark:bg-stone-900">
                  <div className="flex justify-between text-xs font-semibold mb-1">
                    <span>Usage Limit Progress</span>
                    <span>{redemptionPct}% Redeemed</span>
                  </div>
                  <div className="h-2 w-full rounded-full bg-stone-100 dark:bg-stone-800">
                    <div
                      className="h-2 rounded-full bg-emerald-500"
                      style={{ width: `${redemptionPct}%` }}
                    />
                  </div>
                </div>
              ) : null}
            </div>

            {/* Discount Rules */}
            <div className="rounded-xl border border-stone-200 bg-white p-4 shadow-sm dark:border-stone-800 dark:bg-stone-900 space-y-3">
              <p className="text-xs font-bold uppercase tracking-wider text-stone-700 dark:text-stone-300">
                Discount & Order Conditions
              </p>

              <div className="grid grid-cols-2 gap-3 text-xs">
                <div>
                  <span className="text-stone-500">Discount Type</span>
                  <p className="font-semibold text-stone-900 dark:text-stone-100 capitalize">
                    {data.discountType === "percentage"
                      ? `${data.discountValue}% Percentage`
                      : `₹${data.discountValue} Flat Discount`}
                  </p>
                </div>

                <div>
                  <span className="text-stone-500">Min Cart Value</span>
                  <p className="font-semibold text-stone-900 dark:text-stone-100">
                    {money(data.minimumCartValue)}
                  </p>
                </div>

                {data.discountType === "percentage" ? (
                  <div>
                    <span className="text-stone-500">Maximum Discount Cap</span>
                    <p className="font-semibold text-stone-900 dark:text-stone-100">
                      {data.maximumDiscount ? money(data.maximumDiscount) : "No Limit"}
                    </p>
                  </div>
                ) : null}

                <div>
                  <span className="text-stone-500">Customer Per-User Limit</span>
                  <p className="font-semibold text-stone-900 dark:text-stone-100">
                    {data.perUserLimit || 1} time(s) per user
                  </p>
                </div>
              </div>
            </div>

            {/* Scope & Eligibility */}
            <div className="rounded-xl border border-stone-200 bg-white p-4 shadow-sm dark:border-stone-800 dark:bg-stone-900 space-y-3">
              <p className="text-xs font-bold uppercase tracking-wider text-stone-700 dark:text-stone-300">
                Scope & Customer Targeting
              </p>

              <div className="grid grid-cols-2 gap-3 text-xs">
                <div>
                  <span className="text-stone-500">Applicable Scope</span>
                  <p className="font-semibold text-stone-900 dark:text-stone-100 capitalize">
                    {data.applicableScope === "store"
                      ? "Entire Store Items"
                      : data.applicableScope === "category"
                      ? "Specific Categories"
                      : "Specific Products"}
                  </p>
                </div>

                <div>
                  <span className="text-stone-500">Target Eligibility</span>
                  <div className="flex flex-wrap items-center gap-1.5 mt-0.5">
                    {data.newUsersOnly ? (
                      <span className="rounded bg-teal-100 px-2 py-0.5 text-[10px] font-semibold text-teal-800 dark:bg-teal-950/60 dark:text-teal-300">
                        First Order Only
                      </span>
                    ) : null}
                    {data.verifiedOnly ? (
                      <span className="rounded bg-emerald-100 px-2 py-0.5 text-[10px] font-semibold text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300">
                        Verified Only
                      </span>
                    ) : null}
                    {!data.newUsersOnly && !data.verifiedOnly ? (
                      <span className="text-stone-600 dark:text-stone-300">All Store Shoppers</span>
                    ) : null}
                  </div>
                </div>
              </div>

              {data.targetCategories && data.targetCategories.length > 0 ? (
                <div className="pt-2 border-t border-stone-100 dark:border-stone-800">
                  <span className="text-stone-500 text-xs block mb-1.5">
                    Eligible Categories ({data.targetCategories.length})
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {data.targetCategories.map((c) => (
                      <span
                        key={c.id}
                        className="rounded-lg bg-stone-100 px-2 py-1 text-[11px] font-medium text-stone-700 dark:bg-stone-800 dark:text-stone-300"
                      >
                        {c.name}
                      </span>
                    ))}
                  </div>
                </div>
              ) : null}
            </div>

            {/* Validity Period */}
            <div className="rounded-xl border border-stone-200 bg-white p-4 shadow-sm dark:border-stone-800 dark:bg-stone-900 space-y-2">
              <p className="text-xs font-bold uppercase tracking-wider text-stone-700 dark:text-stone-300">
                Validity Window
              </p>
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div>
                  <span className="text-stone-500">Starts At</span>
                  <p className="font-semibold text-stone-900 dark:text-stone-100">
                    {formatDate(data.startsAt)}
                  </p>
                </div>
                <div>
                  <span className="text-stone-500">Expires At</span>
                  <p className="font-semibold text-stone-900 dark:text-stone-100">
                    {formatDate(data.endsAt)}
                  </p>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end gap-2 pt-2">
              <Button type="button" variant="outline" onClick={onClose}>
                Close
              </Button>
              {onEdit ? (
                <Button
                  type="button"
                  onClick={() => {
                    onClose();
                    onEdit();
                  }}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white"
                >
                  Edit Coupon
                </Button>
              ) : null}
            </div>
          </div>
        ) : null}
      </aside>
    </>
  );
}
