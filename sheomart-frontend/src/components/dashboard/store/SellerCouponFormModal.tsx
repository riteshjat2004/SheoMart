"use client";

import { useState, useId } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  X,
  Tag,
  Percent,
  IndianRupee,
  Calendar,
  Layers,
  Sparkles,
  ShieldCheck,
  Check,
  ShoppingBag,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { fetchCategories } from "@/services/category";
import { useCreateSellerCoupon, useUpdateSellerCoupon } from "@/hooks/use-seller-coupons";
import type {
  SellerCouponItem,
  CreateSellerCouponPayload,
  SellerCouponDiscountType,
  SellerCouponScope,
} from "@/types/seller-coupon";

interface SellerCouponFormModalProps {
  isOpen?: boolean;
  coupon?: SellerCouponItem | null;
  onClose: () => void;
  onSuccess?: () => void;
}

const formatDateForInput = (isoDate?: string) => {
  if (!isoDate) return "";
  const d = new Date(isoDate);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
};

export function SellerCouponFormModal({ coupon, onClose, onSuccess }: SellerCouponFormModalProps) {
  const isEditing = Boolean(coupon);
  const categoriesQuery = useQuery({ queryKey: ["categories"], queryFn: fetchCategories });
  const categories = categoriesQuery.data ?? [];

  // Form field states
  const [title, setTitle] = useState(coupon?.title || "");
  const [code, setCode] = useState(coupon?.code || "");
  const [description, setDescription] = useState(coupon?.description || "");
  const [discountType, setDiscountType] = useState<SellerCouponDiscountType>(
    coupon?.discountType || "percentage"
  );
  const [discountValue, setDiscountValue] = useState<number | "">(
    coupon?.discountValue !== undefined ? coupon.discountValue : 15
  );
  const [minimumCartValue, setMinimumCartValue] = useState<number | "">(
    coupon?.minimumCartValue !== undefined ? coupon.minimumCartValue : 299
  );
  const [maximumDiscount, setMaximumDiscount] = useState<number | "">(
    coupon?.maximumDiscount !== null && coupon?.maximumDiscount !== undefined
      ? coupon.maximumDiscount
      : 150
  );
  const [isUnlimited, setIsUnlimited] = useState(coupon ? coupon.usageLimit === null : true);
  const [usageLimit, setUsageLimit] = useState<number | "">(
    coupon?.usageLimit || 100
  );
  const [perUserLimit, setPerUserLimit] = useState<number | "">(
    coupon?.perUserLimit || 1
  );
  const [newUsersOnly, setNewUsersOnly] = useState(coupon?.newUsersOnly || false);
  const [verifiedOnly, setVerifiedOnly] = useState(coupon?.verifiedOnly || false);
  const [applicableScope, setApplicableScope] = useState<SellerCouponScope>(
    coupon?.applicableScope || "store"
  );
  const [selectedCategoryIds, setSelectedCategoryIds] = useState<string[]>(
    coupon?.categoryIds || (coupon?.categoryId ? [coupon.categoryId] : [])
  );

  const defaultStart = new Date();
  const defaultEnd = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

  const [startsAt, setStartsAt] = useState(
    coupon ? formatDateForInput(coupon.startsAt) : formatDateForInput(defaultStart.toISOString())
  );
  const [endsAt, setEndsAt] = useState(
    coupon ? formatDateForInput(coupon.endsAt) : formatDateForInput(defaultEnd.toISOString())
  );

  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const createMutation = useCreateSellerCoupon();
  const updateMutation = useUpdateSellerCoupon();
  const isPending = createMutation.isPending || updateMutation.isPending;

  // Accessibility IDs
  const titleId = useId();
  const codeId = useId();
  const descId = useId();
  const minCartId = useId();
  const maxDiscId = useId();
  const usageLimitId = useId();
  const perUserId = useId();
  const startsAtId = useId();
  const endsAtId = useId();

  const handleCodeChange = (val: string) => {
    // Force uppercase and remove spaces/special characters except alphanumeric
    const sanitized = val.toUpperCase().replace(/[^A-Z0-9_-]/g, "");
    setCode(sanitized);
  };

  const handleCategoryToggle = (catId: string) => {
    setSelectedCategoryIds((prev) =>
      prev.includes(catId) ? prev.filter((id) => id !== catId) : [...prev, catId]
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!title.trim()) {
      setErrorMessage("Please enter a coupon title.");
      return;
    }
    if (!code.trim() || code.trim().length < 2) {
      setErrorMessage("Coupon code must be at least 2 characters.");
      return;
    }
    if (discountValue === "" || Number(discountValue) <= 0) {
      setErrorMessage("Discount value must be greater than 0.");
      return;
    }
    if (discountType === "percentage" && Number(discountValue) > 100) {
      setErrorMessage("Percentage discount cannot exceed 100%.");
      return;
    }
    if (!startsAt || !endsAt) {
      setErrorMessage("Please specify both start and expiry dates.");
      return;
    }
    if (new Date(startsAt) >= new Date(endsAt)) {
      setErrorMessage("Start date & time must be before expiry date & time.");
      return;
    }

    const payload: CreateSellerCouponPayload = {
      title: title.trim(),
      code: code.trim().toUpperCase(),
      description: description.trim(),
      discountType,
      discountValue: Number(discountValue),
      minimumCartValue: minimumCartValue === "" ? 0 : Number(minimumCartValue),
      maximumDiscount:
        discountType === "percentage" && maximumDiscount !== ""
          ? Number(maximumDiscount)
          : null,
      usageLimit: isUnlimited ? null : usageLimit === "" ? null : Number(usageLimit),
      perUserLimit: perUserLimit === "" ? 1 : Number(perUserLimit),
      oncePerCustomer: perUserLimit === 1,
      newUsersOnly,
      verifiedOnly,
      applicableScope,
      categoryIds: applicableScope === "category" ? selectedCategoryIds : [],
      startsAt: new Date(startsAt).toISOString(),
      endsAt: new Date(endsAt).toISOString(),
      isActive: true,
    };

    if (isEditing && coupon) {
      updateMutation.mutate(
        { couponId: coupon.couponId, payload },
        {
          onSuccess: () => {
            onSuccess?.();
            onClose();
          },
          onError: (err) => {
            setErrorMessage(err instanceof Error ? err.message : "Failed to update coupon.");
          },
        }
      );
    } else {
      createMutation.mutate(payload, {
        onSuccess: () => {
          onSuccess?.();
          onClose();
        },
        onError: (err) => {
          setErrorMessage(err instanceof Error ? err.message : "Failed to create coupon.");
        },
      });
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-stone-950/60 p-4 backdrop-blur-sm overflow-y-auto"
      role="dialog"
      aria-modal="true"
      aria-labelledby="coupon-modal-title"
    >
      <div className="w-full max-w-4xl my-8 rounded-2xl border border-stone-200 bg-white p-6 shadow-2xl dark:border-stone-800 dark:bg-stone-900">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-stone-100 pb-4 dark:border-stone-800">
          <div className="flex items-center gap-2.5">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 dark:bg-emerald-950/50 dark:text-emerald-400">
              <Tag className="h-5 w-5" />
            </div>
            <div>
              <h2 id="coupon-modal-title" className="text-lg font-bold text-stone-900 dark:text-stone-50">
                {isEditing ? "Edit Store Coupon" : "Create Store Coupon"}
              </h2>
              <p className="text-xs text-stone-500">
                Configure discounts and redemption rules exclusively for your store products.
              </p>
            </div>
          </div>
          <Button type="button" variant="ghost" size="icon" onClick={onClose} aria-label="Close dialog">
            <X className="h-5 w-5" />
          </Button>
        </div>

        {errorMessage ? (
          <div className="mt-4 rounded-xl border border-red-200 bg-red-50 p-3 text-xs text-red-700 dark:border-red-900/60 dark:bg-red-950/30 dark:text-red-300">
            {errorMessage}
          </div>
        ) : null}

        <form onSubmit={handleSubmit} className="mt-5 space-y-6">
          <div className="grid gap-6 lg:grid-cols-3">
            {/* Left 2 Cols: Form Inputs */}
            <div className="space-y-5 lg:col-span-2">
              {/* Basic Information */}
              <div className="space-y-3">
                <p className="text-xs font-bold uppercase tracking-wider text-stone-500">
                  1. Basic Information
                </p>

                <div className="grid gap-3 sm:grid-cols-2">
                  <div>
                    <label htmlFor={titleId} className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
                      Coupon Title *
                    </label>
                    <input
                      id={titleId}
                      required
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder="e.g. Festival Special 20% OFF"
                      className="w-full rounded-xl border border-stone-200 bg-stone-50 px-3 py-2 text-xs text-stone-900 outline-none focus:border-emerald-500 focus:bg-white dark:border-stone-800 dark:bg-stone-950 dark:text-stone-50"
                    />
                  </div>

                  <div>
                    <label htmlFor={codeId} className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
                      Coupon Code * (Auto Uppercase)
                    </label>
                    <input
                      id={codeId}
                      required
                      value={code}
                      onChange={(e) => handleCodeChange(e.target.value)}
                      placeholder="e.g. FESTIVAL20"
                      className="w-full font-mono uppercase font-bold tracking-wider rounded-xl border border-stone-200 bg-stone-50 px-3 py-2 text-xs text-emerald-700 outline-none focus:border-emerald-500 focus:bg-white dark:border-stone-800 dark:bg-stone-950 dark:text-emerald-400"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor={descId} className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
                    Description & Terms
                  </label>
                  <textarea
                    id={descId}
                    rows={2}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="e.g. Applicable on fresh fruits and vegetables on orders above ₹299."
                    className="w-full rounded-xl border border-stone-200 bg-stone-50 p-2.5 text-xs text-stone-900 outline-none focus:border-emerald-500 focus:bg-white dark:border-stone-800 dark:bg-stone-950 dark:text-stone-50"
                  />
                </div>
              </div>

              {/* Discount Configuration */}
              <div className="space-y-3 pt-2 border-t border-stone-100 dark:border-stone-800">
                <p className="text-xs font-bold uppercase tracking-wider text-stone-500">
                  2. Discount Configuration
                </p>

                <div className="grid gap-3 sm:grid-cols-2">
                  <div>
                    <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
                      Discount Type
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => setDiscountType("percentage")}
                        className={`flex items-center justify-center gap-1.5 rounded-xl border py-2 text-xs font-semibold transition ${
                          discountType === "percentage"
                            ? "border-emerald-500 bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300"
                            : "border-stone-200 bg-stone-50 text-stone-600 dark:border-stone-800 dark:bg-stone-950"
                        }`}
                      >
                        <Percent className="h-3.5 w-3.5" /> Percentage (%)
                      </button>
                      <button
                        type="button"
                        onClick={() => setDiscountType("flat")}
                        className={`flex items-center justify-center gap-1.5 rounded-xl border py-2 text-xs font-semibold transition ${
                          discountType === "flat"
                            ? "border-emerald-500 bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300"
                            : "border-stone-200 bg-stone-50 text-stone-600 dark:border-stone-800 dark:bg-stone-950"
                        }`}
                      >
                        <IndianRupee className="h-3.5 w-3.5" /> Flat (₹)
                      </button>
                    </div>
                  </div>

                  <div>
                    <label htmlFor="discount-val-input" className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
                      {discountType === "percentage" ? "Discount Percentage (%)" : "Flat Discount (₹)"} *
                    </label>
                    <input
                      id="discount-val-input"
                      type="number"
                      required
                      min={1}
                      max={discountType === "percentage" ? 100 : 10000}
                      value={discountValue}
                      onChange={(e) => setDiscountValue(e.target.value === "" ? "" : Number(e.target.value))}
                      placeholder={discountType === "percentage" ? "e.g. 20" : "e.g. 50"}
                      className="w-full rounded-xl border border-stone-200 bg-stone-50 px-3 py-2 text-xs text-stone-900 outline-none focus:border-emerald-500 focus:bg-white dark:border-stone-800 dark:bg-stone-950 dark:text-stone-50"
                    />
                  </div>
                </div>

                <div className="grid gap-3 sm:grid-cols-2">
                  <div>
                    <label htmlFor={minCartId} className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
                      Min Order Value (₹)
                    </label>
                    <input
                      id={minCartId}
                      type="number"
                      min={0}
                      value={minimumCartValue}
                      onChange={(e) =>
                        setMinimumCartValue(e.target.value === "" ? "" : Number(e.target.value))
                      }
                      placeholder="e.g. 299"
                      className="w-full rounded-xl border border-stone-200 bg-stone-50 px-3 py-2 text-xs text-stone-900 outline-none focus:border-emerald-500 focus:bg-white dark:border-stone-800 dark:bg-stone-950 dark:text-stone-50"
                    />
                  </div>

                  {discountType === "percentage" ? (
                    <div>
                      <label htmlFor={maxDiscId} className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
                        Max Discount Cap (₹)
                      </label>
                      <input
                        id={maxDiscId}
                        type="number"
                        min={1}
                        value={maximumDiscount}
                        onChange={(e) =>
                          setMaximumDiscount(e.target.value === "" ? "" : Number(e.target.value))
                        }
                        placeholder="e.g. 150 (Leave blank for no cap)"
                        className="w-full rounded-xl border border-stone-200 bg-stone-50 px-3 py-2 text-xs text-stone-900 outline-none focus:border-emerald-500 focus:bg-white dark:border-stone-800 dark:bg-stone-950 dark:text-stone-50"
                      />
                    </div>
                  ) : null}
                </div>
              </div>

              {/* Target Scope & Eligibility */}
              <div className="space-y-3 pt-2 border-t border-stone-100 dark:border-stone-800">
                <p className="text-xs font-bold uppercase tracking-wider text-stone-500">
                  3. Target Scope & Eligibility
                </p>

                <div>
                  <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
                    Store Application Scope
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setApplicableScope("store")}
                      className={`flex items-center justify-center gap-1.5 rounded-xl border py-2 text-xs font-semibold transition ${
                        applicableScope === "store"
                          ? "border-emerald-500 bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300"
                          : "border-stone-200 bg-stone-50 text-stone-600 dark:border-stone-800 dark:bg-stone-950"
                      }`}
                    >
                      <ShoppingBag className="h-3.5 w-3.5" /> Entire Store
                    </button>
                    <button
                      type="button"
                      onClick={() => setApplicableScope("category")}
                      className={`flex items-center justify-center gap-1.5 rounded-xl border py-2 text-xs font-semibold transition ${
                        applicableScope === "category"
                          ? "border-emerald-500 bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300"
                          : "border-stone-200 bg-stone-50 text-stone-600 dark:border-stone-800 dark:bg-stone-950"
                      }`}
                    >
                      <Layers className="h-3.5 w-3.5" /> Specific Categories
                    </button>
                  </div>
                </div>

                {applicableScope === "category" ? (
                  <div>
                    <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1.5">
                      Select Eligible Grocery Categories ({selectedCategoryIds.length} selected)
                    </label>
                    <div className="max-h-36 overflow-y-auto rounded-xl border border-stone-200 bg-stone-50 p-2.5 space-y-1.5 dark:border-stone-800 dark:bg-stone-950">
                      {categories.map((cat) => {
                        const catId = cat.categoryId || cat._id;
                        if (!catId) return null;
                        const isSelected = selectedCategoryIds.includes(catId);
                        return (
                          <label
                            key={catId}
                            className="flex items-center gap-2 text-xs text-stone-700 dark:text-stone-300 cursor-pointer hover:bg-stone-100 p-1.5 rounded-lg dark:hover:bg-stone-900"
                          >
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={() => handleCategoryToggle(catId)}
                              className="rounded border-stone-300 text-emerald-600 focus:ring-emerald-500"
                            />
                            <span>{cat.name}</span>
                          </label>
                        );
                      })}
                    </div>
                  </div>
                ) : null}

                {/* Customer Eligibility Toggles */}
                <div className="grid gap-2 sm:grid-cols-2 pt-1">
                  <label className="flex items-center gap-2 rounded-xl border border-stone-200 bg-stone-50 p-3 text-xs text-stone-700 dark:border-stone-800 dark:bg-stone-950 dark:text-stone-300 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={newUsersOnly}
                      onChange={(e) => setNewUsersOnly(e.target.checked)}
                      className="rounded border-stone-300 text-emerald-600 focus:ring-emerald-500"
                    />
                    <div>
                      <span className="font-semibold block">First Order Only</span>
                      <span className="text-[11px] text-stone-400">Valid for new store buyers</span>
                    </div>
                  </label>

                  <label className="flex items-center gap-2 rounded-xl border border-stone-200 bg-stone-50 p-3 text-xs text-stone-700 dark:border-stone-800 dark:bg-stone-950 dark:text-stone-300 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={verifiedOnly}
                      onChange={(e) => setVerifiedOnly(e.target.checked)}
                      className="rounded border-stone-300 text-emerald-600 focus:ring-emerald-500"
                    />
                    <div>
                      <span className="font-semibold block">Verified Customers Only</span>
                      <span className="text-[11px] text-stone-400">Admin verified accounts</span>
                    </div>
                  </label>
                </div>
              </div>

              {/* Limits & Validity */}
              <div className="space-y-3 pt-2 border-t border-stone-100 dark:border-stone-800">
                <p className="text-xs font-bold uppercase tracking-wider text-stone-500">
                  4. Usage Limits & Validity Period
                </p>

                <div className="grid gap-3 sm:grid-cols-2">
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label htmlFor={usageLimitId} className="text-xs font-semibold text-stone-700 dark:text-stone-300">
                        Total Redemptions Limit
                      </label>
                      <label className="flex items-center gap-1.5 text-xs text-stone-500 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={isUnlimited}
                          onChange={(e) => setIsUnlimited(e.target.checked)}
                          className="rounded border-stone-300 text-emerald-600"
                        />
                        <span>Unlimited</span>
                      </label>
                    </div>
                    <input
                      id={usageLimitId}
                      type="number"
                      disabled={isUnlimited}
                      min={1}
                      value={isUnlimited ? "" : usageLimit}
                      onChange={(e) => setUsageLimit(e.target.value === "" ? "" : Number(e.target.value))}
                      placeholder={isUnlimited ? "Unlimited redemptions" : "e.g. 100"}
                      className="w-full rounded-xl border border-stone-200 bg-stone-50 px-3 py-2 text-xs text-stone-900 outline-none focus:border-emerald-500 focus:bg-white disabled:opacity-50 dark:border-stone-800 dark:bg-stone-950 dark:text-stone-50"
                    />
                  </div>

                  <div>
                    <label htmlFor={perUserId} className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
                      Per Customer Limit
                    </label>
                    <input
                      id={perUserId}
                      type="number"
                      min={1}
                      max={10}
                      value={perUserLimit}
                      onChange={(e) => setPerUserLimit(e.target.value === "" ? "" : Number(e.target.value))}
                      placeholder="e.g. 1 (once per user)"
                      className="w-full rounded-xl border border-stone-200 bg-stone-50 px-3 py-2 text-xs text-stone-900 outline-none focus:border-emerald-500 focus:bg-white dark:border-stone-800 dark:bg-stone-950 dark:text-stone-50"
                    />
                  </div>
                </div>

                <div className="grid gap-3 sm:grid-cols-2">
                  <div>
                    <label htmlFor={startsAtId} className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
                      Start Date & Time *
                    </label>
                    <input
                      id={startsAtId}
                      type="datetime-local"
                      required
                      value={startsAt}
                      onChange={(e) => setStartsAt(e.target.value)}
                      className="w-full rounded-xl border border-stone-200 bg-stone-50 px-3 py-2 text-xs text-stone-900 outline-none focus:border-emerald-500 focus:bg-white dark:border-stone-800 dark:bg-stone-950 dark:text-stone-50"
                    />
                  </div>

                  <div>
                    <label htmlFor={endsAtId} className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
                      Expiry Date & Time *
                    </label>
                    <input
                      id={endsAtId}
                      type="datetime-local"
                      required
                      value={endsAt}
                      onChange={(e) => setEndsAt(e.target.value)}
                      className="w-full rounded-xl border border-stone-200 bg-stone-50 px-3 py-2 text-xs text-stone-900 outline-none focus:border-emerald-500 focus:bg-white dark:border-stone-800 dark:bg-stone-950 dark:text-stone-50"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Right Col: Live Customer Coupon Preview */}
            <div className="space-y-4">
              <p className="text-xs font-bold uppercase tracking-wider text-stone-500">
                Customer View Preview
              </p>

              <div className="relative overflow-hidden rounded-2xl border-2 border-dashed border-emerald-300 bg-gradient-to-br from-emerald-50 to-teal-50/50 p-5 shadow-sm dark:border-emerald-800 dark:from-emerald-950/30 dark:to-teal-950/20">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-1.5">
                    <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-600 text-white shadow-sm">
                      <Sparkles className="h-4 w-4" />
                    </span>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400">
                      Store Offer
                    </span>
                  </div>
                  {verifiedOnly ? (
                    <span className="flex items-center gap-1 rounded-full bg-emerald-200/60 px-2 py-0.5 text-[10px] font-semibold text-emerald-800 dark:bg-emerald-900/60 dark:text-emerald-300">
                      <ShieldCheck className="h-3 w-3" /> Verified Only
                    </span>
                  ) : null}
                </div>

                <div className="mt-4">
                  <span className="text-2xl font-black text-stone-900 dark:text-stone-50">
                    {discountType === "percentage"
                      ? `${discountValue || 0}% OFF`
                      : `₹${discountValue || 0} OFF`}
                  </span>
                  <p className="mt-0.5 text-xs font-bold text-stone-800 dark:text-stone-200 truncate">
                    {title || "Special Store Discount"}
                  </p>
                  <p className="mt-1 text-[11px] text-stone-500 dark:text-stone-400 line-clamp-2">
                    {description || "Enjoy exclusive discounts on your favorite groceries at our store."}
                  </p>
                </div>

                <div className="mt-4 flex items-center justify-between border-t border-emerald-200/60 pt-3 dark:border-emerald-800/60">
                  <div className="rounded-lg border border-emerald-400 border-dashed bg-white px-2.5 py-1 font-mono text-xs font-bold text-emerald-700 shadow-sm dark:bg-stone-900 dark:text-emerald-400">
                    {code || "YOURCODE"}
                  </div>
                  <span className="text-[11px] font-semibold text-emerald-700 dark:text-emerald-400">
                    Min ₹{minimumCartValue || 0}
                  </span>
                </div>

                <div className="mt-2 text-[10px] text-stone-400 flex items-center justify-between">
                  <span>
                    {applicableScope === "category"
                      ? `${selectedCategoryIds.length} categories`
                      : "Entire store items"}
                  </span>
                  <span>
                    Expires {endsAt ? new Date(endsAt).toLocaleDateString() : "in 30 days"}
                  </span>
                </div>
              </div>

              {/* Informational callout */}
              <div className="rounded-xl border border-stone-200 bg-stone-50 p-3 text-[11px] text-stone-600 dark:border-stone-800 dark:bg-stone-950 dark:text-stone-400">
                <p className="font-semibold text-stone-900 dark:text-stone-200 mb-1">
                  💡 Independent Seller Coupon
                </p>
                This coupon applies solely to products sold by your store. It does not deduct from platform admin fees and can be combined at checkout with platform-wide coupons if stacking is enabled.
              </div>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-stone-100 dark:border-stone-800">
            <Button type="button" variant="outline" onClick={onClose} disabled={isPending}>
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isPending}
              className="bg-emerald-600 hover:bg-emerald-700 text-white min-w-[120px]"
            >
              {isPending ? "Saving..." : isEditing ? "Save Changes" : "Create Coupon"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
