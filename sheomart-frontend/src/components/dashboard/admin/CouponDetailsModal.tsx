"use client";

import { useMemo, useState } from "react";
import {
  AlertCircle,
  Calendar,
  CheckCircle2,
  Clock,
  Copy,
  Edit2,
  Percent,
  Play,
  RotateCcw,
  Sparkles,
  Tag,
  Users,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import type { CouponItem } from "@/services/promotions";
import type { CategoryItem, StoreItem } from "@/types/marketplace";

interface CouponDetailsModalProps {
  open: boolean;
  coupon: CouponItem | null;
  stores?: StoreItem[];
  categories?: CategoryItem[];
  onClose: () => void;
  onEdit: (coupon: CouponItem) => void;
}

export function CouponDetailsModal({
  open,
  coupon,
  stores = [],
  categories = [],
  onClose,
  onEdit,
}: CouponDetailsModalProps) {
  const [copied, setCopied] = useState(false);

  // Redemption Simulator State
  const [simCartValue, setSimCartValue] = useState<number>(coupon?.minimumCartValue ? coupon.minimumCartValue + 100 : 500);
  const [simCustomerType, setSimCustomerType] = useState<"new" | "existing">("new");
  const [simStoreId, setSimStoreId] = useState<string>(coupon?.storeId || "");
  const [simCategoryId, setSimCategoryId] = useState<string>(coupon?.categoryId || "");

  const copyCode = async () => {
    if (!coupon?.code) return;
    await navigator.clipboard.writeText(coupon.code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Live Simulator Logic
  const simulationResult = useMemo(() => {
    if (!coupon) return null;

    const now = new Date();
    const startDate = new Date(coupon.startsAt);
    const endDate = new Date(coupon.endsAt);

    if (coupon.isDeleted) {
      return { eligible: false, reason: "Coupon has been soft-deleted and cannot be redeemed." };
    }

    if (!coupon.isActive) {
      return { eligible: false, reason: "Coupon is currently disabled / deactivated." };
    }

    if (now < startDate) {
      return { eligible: false, reason: `Coupon is scheduled and not active until ${startDate.toLocaleDateString()}.` };
    }

    if (now > endDate) {
      return { eligible: false, reason: "Coupon has expired." };
    }

    if (coupon.usageLimit !== null && coupon.usageCount >= coupon.usageLimit) {
      return { eligible: false, reason: `Global usage limit of ${coupon.usageLimit} redemptions has been reached.` };
    }

    if (coupon.newUsersOnly && simCustomerType === "existing") {
      return { eligible: false, reason: "Coupon is strictly restricted to first-time customers." };
    }

    if (simCartValue < coupon.minimumCartValue) {
      return {
        eligible: false,
        reason: `Cart value of ₹${simCartValue} does not meet the minimum requirement of ₹${coupon.minimumCartValue}.`,
      };
    }

    if (coupon.applicableScope === "store" && coupon.storeId && simStoreId && simStoreId !== coupon.storeId) {
      return { eligible: false, reason: "This coupon is only valid for items purchased from the designated store." };
    }

    if (coupon.applicableScope === "category" && coupon.categoryId && simCategoryId && simCategoryId !== coupon.categoryId) {
      return { eligible: false, reason: "This coupon is only valid for items in the designated category." };
    }

    // Calculation
    let calculatedDiscount = 0;
    if (coupon.discountType === "percentage") {
      calculatedDiscount = (simCartValue * coupon.discountValue) / 100;
      if (coupon.maximumDiscount !== null && coupon.maximumDiscount !== undefined) {
        calculatedDiscount = Math.min(calculatedDiscount, coupon.maximumDiscount);
      }
    } else {
      calculatedDiscount = coupon.discountValue;
    }

    calculatedDiscount = Math.min(simCartValue, Math.round(calculatedDiscount * 100) / 100);
    const finalAmount = Math.max(0, Math.round((simCartValue - calculatedDiscount) * 100) / 100);

    return {
      eligible: true,
      originalAmount: simCartValue,
      discount: calculatedDiscount,
      finalAmount,
    };
  }, [coupon, simCartValue, simCustomerType, simStoreId, simCategoryId]);

  if (!open || !coupon) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-stone-950/70 p-4 backdrop-blur-sm animate-in fade-in duration-200"
      role="dialog"
      aria-modal="true"
    >
      <div className="relative flex max-h-[92vh] w-full max-w-3xl flex-col rounded-2xl border border-stone-200 bg-white shadow-2xl dark:border-stone-800 dark:bg-stone-950">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-stone-100 px-6 py-4 dark:border-stone-800">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400">
              <Tag className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-stone-900 dark:text-stone-100">{coupon.code}</h2>
                <button
                  type="button"
                  onClick={copyCode}
                  className="inline-flex items-center gap-1 rounded-md bg-stone-100 px-2 py-0.5 text-[11px] font-medium text-stone-600 hover:bg-stone-200 dark:bg-stone-800 dark:text-stone-300"
                >
                  <Copy className="h-3 w-3" />
                  {copied ? "Copied" : "Copy"}
                </button>
              </div>
              <p className="text-xs text-stone-500 dark:text-stone-400">{coupon.title}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 text-stone-400 transition hover:bg-stone-100 hover:text-stone-600 dark:hover:bg-stone-800 dark:hover:text-stone-200"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Metadata Cards */}
          <div className="grid gap-3 sm:grid-cols-4">
            <div className="rounded-xl border border-stone-100 bg-stone-50/60 p-3.5 dark:border-stone-800/80 dark:bg-stone-900/40">
              <span className="text-[11px] font-medium uppercase text-stone-400">Discount</span>
              <p className="mt-1 text-lg font-bold text-emerald-600 dark:text-emerald-400">
                {coupon.discountType === "percentage" ? `${coupon.discountValue}% OFF` : `₹${coupon.discountValue} OFF`}
              </p>
              <span className="text-[11px] text-stone-500">
                {coupon.maximumDiscount ? `Cap: ₹${coupon.maximumDiscount}` : "No maximum cap"}
              </span>
            </div>

            <div className="rounded-xl border border-stone-100 bg-stone-50/60 p-3.5 dark:border-stone-800/80 dark:bg-stone-900/40">
              <span className="text-[11px] font-medium uppercase text-stone-400">Min Cart</span>
              <p className="mt-1 text-lg font-bold text-stone-800 dark:text-stone-200">
                ₹{coupon.minimumCartValue}
              </p>
              <span className="text-[11px] text-stone-500">Threshold required</span>
            </div>

            <div className="rounded-xl border border-stone-100 bg-stone-50/60 p-3.5 dark:border-stone-800/80 dark:bg-stone-900/40">
              <span className="text-[11px] font-medium uppercase text-stone-400">Redemptions</span>
              <p className="mt-1 text-lg font-bold text-stone-800 dark:text-stone-200">
                {coupon.usageCount}
                <span className="text-xs font-normal text-stone-500"> / {coupon.usageLimit ?? "∞"}</span>
              </p>
              <span className="text-[11px] text-stone-500">
                Per user: {coupon.perUserLimit ?? 1}
              </span>
            </div>

            <div className="rounded-xl border border-stone-100 bg-stone-50/60 p-3.5 dark:border-stone-800/80 dark:bg-stone-900/40">
              <span className="text-[11px] font-medium uppercase text-stone-400">Scope</span>
              <p className="mt-1 text-base font-bold capitalize text-stone-800 dark:text-stone-200">
                {coupon.applicableScope}
              </p>
              <span className="text-[11px] text-stone-500 truncate block">
                {coupon.storeName || coupon.categoryName || coupon.productName || "Marketplace"}
              </span>
            </div>
          </div>

          {/* Description & Rules Summary */}
          <div className="rounded-xl border border-stone-200 bg-white p-4 dark:border-stone-800 dark:bg-stone-900/50 space-y-2.5">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-stone-400">Configuration Details</h4>
            {coupon.description && (
              <p className="text-xs text-stone-600 dark:text-stone-300 leading-relaxed">{coupon.description}</p>
            )}
            <div className="grid gap-2 text-xs text-stone-600 dark:text-stone-300 sm:grid-cols-2 pt-1">
              <div>
                <span className="text-stone-400">Valid Period:</span>{" "}
                {new Date(coupon.startsAt).toLocaleString()} – {new Date(coupon.endsAt).toLocaleString()}
              </div>
              <div>
                <span className="text-stone-400">Audience:</span>{" "}
                {coupon.newUsersOnly ? "New customers only (First order)" : "All registered customers"}
              </div>
              <div>
                <span className="text-stone-400">Auto Apply:</span> {coupon.autoApply ? "Yes" : "No"}
              </div>
              <div>
                <span className="text-stone-400">Featured on Homepage:</span> {coupon.isFeatured ? "Yes" : "No"}
              </div>
            </div>
          </div>

          {/* ADMIN COUPON REDEMPTION SIMULATOR */}
          <div className="rounded-2xl border border-emerald-200 bg-emerald-50/40 p-5 dark:border-emerald-900/50 dark:bg-emerald-950/20 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                <h4 className="text-sm font-semibold text-stone-900 dark:text-stone-100">
                  Admin Coupon Redemption Simulator
                </h4>
              </div>
              <span className="text-[11px] text-stone-500 dark:text-stone-400">
                Interactive real-time test
              </span>
            </div>

            {/* Inputs */}
            <div className="grid gap-3 sm:grid-cols-4">
              <div>
                <label className="block text-[11px] font-semibold text-stone-700 dark:text-stone-300 mb-1">
                  Cart Amount (₹)
                </label>
                <input
                  type="number"
                  min="0"
                  value={simCartValue}
                  onChange={(e) => setSimCartValue(Number(e.target.value))}
                  className="w-full rounded-xl border border-stone-200 bg-white px-3 py-1.5 text-xs outline-none transition focus:border-emerald-500 dark:border-stone-800 dark:bg-stone-950"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-stone-700 dark:text-stone-300 mb-1">
                  Customer Type
                </label>
                <select
                  value={simCustomerType}
                  onChange={(e) => setSimCustomerType(e.target.value as "new" | "existing")}
                  className="w-full rounded-xl border border-stone-200 bg-white px-3 py-1.5 text-xs outline-none transition focus:border-emerald-500 dark:border-stone-800 dark:bg-stone-950"
                >
                  <option value="new">First Order (New)</option>
                  <option value="existing">Existing Customer</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-stone-700 dark:text-stone-300 mb-1">
                  Simulated Store
                </label>
                <select
                  value={simStoreId}
                  onChange={(e) => setSimStoreId(e.target.value)}
                  className="w-full rounded-xl border border-stone-200 bg-white px-3 py-1.5 text-xs outline-none transition focus:border-emerald-500 dark:border-stone-800 dark:bg-stone-950"
                >
                  <option value="">Any Store</option>
                  {stores.map((s) => (
                    <option key={s.storeId} value={s.storeId}>
                      {s.storeName}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-stone-700 dark:text-stone-300 mb-1">
                  Simulated Category
                </label>
                <select
                  value={simCategoryId}
                  onChange={(e) => setSimCategoryId(e.target.value)}
                  className="w-full rounded-xl border border-stone-200 bg-white px-3 py-1.5 text-xs outline-none transition focus:border-emerald-500 dark:border-stone-800 dark:bg-stone-950"
                >
                  <option value="">Any Category</option>
                  {categories.map((c) => (
                    <option key={c.categoryId} value={c.categoryId}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Simulation Feedback Card */}
            {simulationResult && (
              <div
                className={`rounded-xl border p-4 transition ${
                  simulationResult.eligible
                    ? "border-emerald-200 bg-white text-emerald-900 dark:border-emerald-800/80 dark:bg-stone-900 dark:text-emerald-300"
                    : "border-rose-200 bg-white text-rose-900 dark:border-rose-900/60 dark:bg-stone-900 dark:text-rose-300"
                }`}
              >
                <div className="flex items-center gap-2">
                  {simulationResult.eligible ? (
                    <CheckCircle2 className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                  ) : (
                    <AlertCircle className="h-5 w-5 text-rose-600 dark:text-rose-400" />
                  )}
                  <span className="font-semibold text-sm">
                    {simulationResult.eligible ? "Eligible for Redemption" : "Ineligible for Redemption"}
                  </span>
                </div>

                {!simulationResult.eligible ? (
                  <p className="mt-1.5 text-xs text-stone-600 dark:text-stone-300">
                    Reason: {simulationResult.reason}
                  </p>
                ) : (
                  <div className="mt-3 grid gap-3 sm:grid-cols-3 border-t border-emerald-100 pt-3 dark:border-emerald-950 text-xs">
                    <div>
                      <span className="text-stone-500">Cart Total:</span>{" "}
                      <span className="font-bold text-stone-800 dark:text-stone-200">
                        ₹{simulationResult.originalAmount}
                      </span>
                    </div>
                    <div>
                      <span className="text-stone-500">Discount Applied:</span>{" "}
                      <span className="font-bold text-emerald-600 dark:text-emerald-400">
                        -₹{simulationResult.discount}
                      </span>
                    </div>
                    <div>
                      <span className="text-stone-500">Customer Pays:</span>{" "}
                      <span className="font-bold text-stone-900 dark:text-stone-50 text-sm">
                        ₹{simulationResult.finalAmount}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between border-t border-stone-100 px-6 py-4 dark:border-stone-800">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => {
              onClose();
              onEdit(coupon);
            }}
            className="gap-1.5"
          >
            <Edit2 className="h-3.5 w-3.5" />
            Edit Coupon
          </Button>
          <Button type="button" size="sm" onClick={onClose}>
            Close
          </Button>
        </div>
      </div>
    </div>
  );
}
