"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  CalendarDays,
  Check,
  Copy,
  Info,
  Sparkles,
  Tag,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import type { CouponItem } from "@/services/promotions";
import type { CategoryItem, StoreItem } from "@/types/marketplace";

const couponFormSchema = z.object({
  title: z.string().trim().min(2, "Title must be at least 2 characters").max(120),
  description: z.string().trim().max(1000).optional(),
  code: z
    .string()
    .trim()
    .min(2, "Code must be at least 2 characters")
    .max(40)
    .regex(/^[A-Z0-9_-]+$/, "Code must contain only uppercase letters, numbers, hyphens, and underscores"),
  discountType: z.enum(["flat", "percentage"]),
  discountValue: z.number().min(0.01, "Discount value must be greater than 0"),
  minimumCartValue: z.number().min(0, "Minimum cart value cannot be negative"),
  maximumDiscount: z.number().nullable().optional(),
  usageLimit: z.number().int().min(1).nullable().optional(),
  perUserLimit: z.number().int().min(1, "Per user limit must be at least 1"),
  oncePerCustomer: z.boolean(),
  newUsersOnly: z.boolean(),
  applicableScope: z.enum(["marketplace", "store", "category", "product"]),
  storeId: z.string().nullable().optional(),
  categoryId: z.string().nullable().optional(),
  productId: z.string().nullable().optional(),
  isFeatured: z.boolean(),
  showOnBanner: z.boolean(),
  autoApply: z.boolean(),
  startsAt: z.string().min(1, "Start date is required"),
  endsAt: z.string().min(1, "End date is required"),
  isActive: z.boolean(),
});

export type CouponFormValues = z.infer<typeof couponFormSchema>;

interface CouponFormModalProps {
  open: boolean;
  coupon?: CouponItem | null;
  stores: StoreItem[];
  categories: CategoryItem[];
  isSubmitting?: boolean;
  onClose: () => void;
  onSubmit: (data: Record<string, unknown>) => void;
}

function toLocalDatetimeString(dateInput?: string | Date) {
  if (!dateInput) return "";
  const date = new Date(dateInput);
  if (Number.isNaN(date.getTime())) return "";
  const offset = date.getTimezoneOffset();
  return new Date(date.getTime() - offset * 60000).toISOString().slice(0, 16);
}

export function CouponFormModal({
  open,
  coupon,
  stores,
  categories,
  isSubmitting = false,
  onClose,
  onSubmit,
}: CouponFormModalProps) {
  const isEditing = Boolean(coupon);

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    setError,
    formState: { errors },
  } = useForm<CouponFormValues>({
    resolver: zodResolver(couponFormSchema),
    defaultValues: {
      title: "",
      description: "",
      code: "",
      discountType: "percentage",
      discountValue: 10,
      minimumCartValue: 0,
      maximumDiscount: null,
      usageLimit: null,
      perUserLimit: 1,
      oncePerCustomer: true,
      newUsersOnly: false,
      applicableScope: "marketplace",
      storeId: null,
      categoryId: null,
      productId: null,
      isFeatured: false,
      showOnBanner: false,
      autoApply: false,
      startsAt: "",
      endsAt: "",
      isActive: true,
    },
  });

  useEffect(() => {
    if (open) {
      if (coupon) {
        reset({
          title: coupon.title || "",
          description: coupon.description || "",
          code: coupon.code || "",
          discountType: coupon.discountType || "percentage",
          discountValue: coupon.discountValue || 10,
          minimumCartValue: coupon.minimumCartValue || 0,
          maximumDiscount: coupon.maximumDiscount ?? null,
          usageLimit: coupon.usageLimit ?? null,
          perUserLimit: coupon.perUserLimit ?? (coupon.oncePerCustomer ? 1 : 1),
          oncePerCustomer: coupon.oncePerCustomer ?? true,
          newUsersOnly: coupon.newUsersOnly ?? false,
          applicableScope: coupon.applicableScope || "marketplace",
          storeId: coupon.storeId ?? null,
          categoryId: coupon.categoryId ?? null,
          productId: coupon.productId ?? null,
          isFeatured: coupon.isFeatured ?? false,
          showOnBanner: coupon.showOnBanner ?? false,
          autoApply: coupon.autoApply ?? false,
          startsAt: toLocalDatetimeString(coupon.startsAt),
          endsAt: toLocalDatetimeString(coupon.endsAt),
          isActive: coupon.isActive ?? true,
        });
      } else {
        const now = new Date();
        const inOneMonth = new Date();
        inOneMonth.setDate(inOneMonth.getDate() + 30);
        reset({
          title: "",
          description: "",
          code: "",
          discountType: "percentage",
          discountValue: 10,
          minimumCartValue: 0,
          maximumDiscount: null,
          usageLimit: null,
          perUserLimit: 1,
          oncePerCustomer: true,
          newUsersOnly: false,
          applicableScope: "marketplace",
          storeId: null,
          categoryId: null,
          productId: null,
          isFeatured: false,
          showOnBanner: false,
          autoApply: false,
          startsAt: toLocalDatetimeString(now),
          endsAt: toLocalDatetimeString(inOneMonth),
          isActive: true,
        });
      }
    }
  }, [open, coupon, reset]);

  const watchedValues = watch();

  const handleGenerateCode = () => {
    const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
    let randomPart = "";
    for (let i = 0; i < 6; i++) {
      randomPart += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    const prefix = watchedValues.discountType === "percentage" ? "SAVE" : "FLAT";
    setValue("code", `${prefix}${Math.round(watchedValues.discountValue || 10)}_${randomPart}`, {
      shouldValidate: true,
    });
  };

  const onFormSubmit = (data: CouponFormValues) => {
    const startDate = new Date(data.startsAt);
    const endDate = new Date(data.endsAt);

    if (startDate >= endDate) {
      setError("endsAt", { message: "End date must be after start date" });
      return;
    }

    if (data.discountType === "percentage" && data.discountValue > 100) {
      setError("discountValue", { message: "Percentage discount cannot exceed 100%" });
      return;
    }

    const payload: Record<string, unknown> = {
      ...data,
      code: data.code.toUpperCase().trim(),
      startsAt: startDate.toISOString(),
      endsAt: endDate.toISOString(),
      storeId: data.applicableScope === "store" ? data.storeId : null,
      categoryId: data.applicableScope === "category" ? data.categoryId : null,
      productId: data.applicableScope === "product" ? data.productId : null,
    };

    onSubmit(payload);
  };

  if (!open) return null;

  const targetStore = stores.find((s) => s.storeId === watchedValues.storeId);
  const targetCat = categories.find((c) => c.categoryId === watchedValues.categoryId);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-stone-950/70 p-4 backdrop-blur-sm animate-in fade-in duration-200"
      role="dialog"
      aria-modal="true"
    >
      <div className="relative flex max-h-[92vh] w-full max-w-4xl flex-col rounded-2xl border border-stone-200 bg-white shadow-2xl dark:border-stone-800 dark:bg-stone-950">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-stone-100 px-6 py-4 dark:border-stone-800">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400">
              <Tag className="h-4 w-4" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-stone-900 dark:text-stone-100">
                {isEditing ? `Edit Coupon: ${coupon?.code}` : "Create New Coupon"}
              </h2>
              <p className="text-xs text-stone-500 dark:text-stone-400">
                Configure discount rules, targeting scopes, and customer usage limits.
              </p>
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

        {/* Form Body */}
        <form
          id="admin-coupon-form"
          onSubmit={handleSubmit(onFormSubmit)}
          className="flex-1 overflow-y-auto p-6 space-y-6"
        >
          <div className="grid gap-6 lg:grid-cols-3">
            {/* Form Left & Middle (2 cols) */}
            <div className="space-y-6 lg:col-span-2">
              {/* Section 1: Basic Information */}
              <div className="space-y-4">
                <h3 className="text-xs font-semibold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                  1. Coupon Information
                </h3>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="text-xs font-semibold text-stone-700 dark:text-stone-300">
                        Coupon Code <span className="text-rose-500">*</span>
                      </label>
                      <button
                        type="button"
                        onClick={handleGenerateCode}
                        className="inline-flex items-center gap-1 text-[11px] font-medium text-emerald-600 hover:underline dark:text-emerald-400"
                      >
                        <Sparkles className="h-3 w-3" />
                        Generate
                      </button>
                    </div>
                    <input
                      {...register("code")}
                      placeholder="e.g. FESTIVE50"
                      onChange={(e) => setValue("code", e.target.value.toUpperCase())}
                      className="w-full rounded-xl border border-stone-200 bg-white px-3.5 py-2 font-mono text-sm uppercase outline-none transition focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 dark:border-stone-800 dark:bg-stone-950"
                    />
                    {errors.code && <p className="mt-1 text-xs text-rose-500">{errors.code.message}</p>}
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
                      Coupon Title <span className="text-rose-500">*</span>
                    </label>
                    <input
                      {...register("title")}
                      placeholder="e.g. ₹50 Off Weekend Grocery"
                      className="w-full rounded-xl border border-stone-200 bg-white px-3.5 py-2 text-sm outline-none transition focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 dark:border-stone-800 dark:bg-stone-950"
                    />
                    {errors.title && <p className="mt-1 text-xs text-rose-500">{errors.title.message}</p>}
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
                      Description (Optional)
                    </label>
                    <textarea
                      {...register("description")}
                      rows={2}
                      placeholder="Briefly explain what this discount offers or conditions..."
                      className="w-full rounded-xl border border-stone-200 bg-white px-3.5 py-2 text-sm outline-none transition focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 dark:border-stone-800 dark:bg-stone-950"
                    />
                  </div>
                </div>
              </div>

              {/* Section 2: Discount & Cart Value */}
              <div className="space-y-4">
                <h3 className="text-xs font-semibold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                  2. Discount Rules
                </h3>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
                      Discount Type <span className="text-rose-500">*</span>
                    </label>
                    <select
                      {...register("discountType")}
                      className="w-full rounded-xl border border-stone-200 bg-white px-3.5 py-2 text-sm outline-none transition focus:border-emerald-500 dark:border-stone-800 dark:bg-stone-950"
                    >
                      <option value="percentage">Percentage Discount (%)</option>
                      <option value="flat">Flat Amount (₹)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
                      Discount Value ({watchedValues.discountType === "percentage" ? "%" : "₹"}) <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      min="0.01"
                      {...register("discountValue", { valueAsNumber: true })}
                      className="w-full rounded-xl border border-stone-200 bg-white px-3.5 py-2 text-sm outline-none transition focus:border-emerald-500 dark:border-stone-800 dark:bg-stone-950"
                    />
                    {errors.discountValue && <p className="mt-1 text-xs text-rose-500">{errors.discountValue.message}</p>}
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
                      Minimum Cart Value (₹)
                    </label>
                    <input
                      type="number"
                      min="0"
                      {...register("minimumCartValue", { valueAsNumber: true })}
                      placeholder="0"
                      className="w-full rounded-xl border border-stone-200 bg-white px-3.5 py-2 text-sm outline-none transition focus:border-emerald-500 dark:border-stone-800 dark:bg-stone-950"
                    />
                    {errors.minimumCartValue && <p className="mt-1 text-xs text-rose-500">{errors.minimumCartValue.message}</p>}
                  </div>

                  {watchedValues.discountType === "percentage" && (
                    <div>
                      <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
                        Maximum Discount Cap (₹, Optional)
                      </label>
                      <input
                        type="number"
                        min="0"
                        {...register("maximumDiscount", {
                          setValueAs: (v) => (v === "" || v === null ? null : Number(v)),
                        })}
                        placeholder="Unlimited"
                        className="w-full rounded-xl border border-stone-200 bg-white px-3.5 py-2 text-sm outline-none transition focus:border-emerald-500 dark:border-stone-800 dark:bg-stone-950"
                      />
                    </div>
                  )}
                </div>
              </div>

              {/* Section 3: Scope & Targeting */}
              <div className="space-y-4">
                <h3 className="text-xs font-semibold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                  3. Applicability Scope
                </h3>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
                      Target Scope
                    </label>
                    <select
                      {...register("applicableScope")}
                      className="w-full rounded-xl border border-stone-200 bg-white px-3.5 py-2 text-sm outline-none transition focus:border-emerald-500 dark:border-stone-800 dark:bg-stone-950"
                    >
                      <option value="marketplace">Whole Marketplace (All Stores & Products)</option>
                      <option value="store">Store Specific</option>
                      <option value="category">Category Specific</option>
                      <option value="product">Specific Product</option>
                    </select>
                  </div>

                  {watchedValues.applicableScope === "store" && (
                    <div className="sm:col-span-2">
                      <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
                        Select Store <span className="text-rose-500">*</span>
                      </label>
                      <select
                        {...register("storeId")}
                        className="w-full rounded-xl border border-stone-200 bg-white px-3.5 py-2 text-sm outline-none transition focus:border-emerald-500 dark:border-stone-800 dark:bg-stone-950"
                      >
                        <option value="">-- Choose a store --</option>
                        {stores.map((s) => (
                          <option key={s.storeId} value={s.storeId}>
                            {s.storeName} ({s.city || "Online"})
                          </option>
                        ))}
                      </select>
                    </div>
                  )}

                  {watchedValues.applicableScope === "category" && (
                    <div className="sm:col-span-2">
                      <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
                        Select Category <span className="text-rose-500">*</span>
                      </label>
                      <select
                        {...register("categoryId")}
                        className="w-full rounded-xl border border-stone-200 bg-white px-3.5 py-2 text-sm outline-none transition focus:border-emerald-500 dark:border-stone-800 dark:bg-stone-950"
                      >
                        <option value="">-- Choose a category --</option>
                        {categories.map((c) => (
                          <option key={c.categoryId} value={c.categoryId}>
                            {c.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}

                  {watchedValues.applicableScope === "product" && (
                    <div className="sm:col-span-2">
                      <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
                        Product ID <span className="text-rose-500">*</span>
                      </label>
                      <input
                        {...register("productId")}
                        placeholder="Paste Product ID (e.g. 9b1deb4d-...)"
                        className="w-full rounded-xl border border-stone-200 bg-white px-3.5 py-2 text-sm outline-none transition focus:border-emerald-500 dark:border-stone-800 dark:bg-stone-950"
                      />
                    </div>
                  )}
                </div>
              </div>

              {/* Section 4: Usage Limits & Customer Rules */}
              <div className="space-y-4">
                <h3 className="text-xs font-semibold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                  4. Redemption Limits & Customer Rules
                </h3>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
                      Total Global Usage Limit
                    </label>
                    <input
                      type="number"
                      min="1"
                      {...register("usageLimit", {
                        setValueAs: (v) => (v === "" || v === null ? null : Number(v)),
                      })}
                      placeholder="Unlimited"
                      className="w-full rounded-xl border border-stone-200 bg-white px-3.5 py-2 text-sm outline-none transition focus:border-emerald-500 dark:border-stone-800 dark:bg-stone-950"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
                      Per User Limit
                    </label>
                    <input
                      type="number"
                      min="1"
                      {...register("perUserLimit", { valueAsNumber: true })}
                      placeholder="1"
                      className="w-full rounded-xl border border-stone-200 bg-white px-3.5 py-2 text-sm outline-none transition focus:border-emerald-500 dark:border-stone-800 dark:bg-stone-950"
                    />
                  </div>

                  <div className="sm:col-span-2 flex flex-wrap gap-4 pt-1">
                    <label className="inline-flex items-center gap-2 text-xs font-medium text-stone-700 dark:text-stone-300 cursor-pointer">
                      <input
                        type="checkbox"
                        {...register("newUsersOnly")}
                        className="h-4 w-4 rounded border-stone-300 text-emerald-600 focus:ring-emerald-500"
                      />
                      <span>New customers only (First order)</span>
                    </label>

                    <label className="inline-flex items-center gap-2 text-xs font-medium text-stone-700 dark:text-stone-300 cursor-pointer">
                      <input
                        type="checkbox"
                        {...register("autoApply")}
                        className="h-4 w-4 rounded border-stone-300 text-emerald-600 focus:ring-emerald-500"
                      />
                      <span>Auto-apply at checkout if eligible</span>
                    </label>
                  </div>
                </div>
              </div>

              {/* Section 5: Validity Period & Status */}
              <div className="space-y-4">
                <h3 className="text-xs font-semibold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                  5. Timing & Visibility
                </h3>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
                      Start Date & Time <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="datetime-local"
                      {...register("startsAt")}
                      className="w-full rounded-xl border border-stone-200 bg-white px-3.5 py-2 text-sm outline-none transition focus:border-emerald-500 dark:border-stone-800 dark:bg-stone-950"
                    />
                    {errors.startsAt && <p className="mt-1 text-xs text-rose-500">{errors.startsAt.message}</p>}
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
                      End Date & Time <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="datetime-local"
                      {...register("endsAt")}
                      className="w-full rounded-xl border border-stone-200 bg-white px-3.5 py-2 text-sm outline-none transition focus:border-emerald-500 dark:border-stone-800 dark:bg-stone-950"
                    />
                    {errors.endsAt && <p className="mt-1 text-xs text-rose-500">{errors.endsAt.message}</p>}
                  </div>

                  <div className="sm:col-span-2 flex flex-wrap gap-4 pt-1">
                    <label className="inline-flex items-center gap-2 text-xs font-medium text-stone-700 dark:text-stone-300 cursor-pointer">
                      <input
                        type="checkbox"
                        {...register("isFeatured")}
                        className="h-4 w-4 rounded border-stone-300 text-emerald-600 focus:ring-emerald-500"
                      />
                      <span>Featured coupon (highlight on homepage)</span>
                    </label>

                    <label className="inline-flex items-center gap-2 text-xs font-medium text-stone-700 dark:text-stone-300 cursor-pointer">
                      <input
                        type="checkbox"
                        {...register("showOnBanner")}
                        className="h-4 w-4 rounded border-stone-300 text-emerald-600 focus:ring-emerald-500"
                      />
                      <span>Show in promotional banners</span>
                    </label>

                    <label className="inline-flex items-center gap-2 text-xs font-medium text-stone-700 dark:text-stone-300 cursor-pointer">
                      <input
                        type="checkbox"
                        {...register("isActive")}
                        className="h-4 w-4 rounded border-stone-300 text-emerald-600 focus:ring-emerald-500"
                      />
                      <span>Active status</span>
                    </label>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column: Live Coupon Preview Card */}
            <div className="space-y-4">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-stone-400">
                Live Customer Preview
              </h3>

              <div className="sticky top-0 space-y-4 rounded-2xl border border-stone-200 bg-stone-50/70 p-4 dark:border-stone-800 dark:bg-stone-900/50">
                <p className="text-[11px] text-stone-500">
                  How this coupon appears on the homepage and customer checkout drawer:
                </p>

                {/* Simulated Coupon Card */}
                <div className="rounded-2xl border border-dashed border-emerald-300 bg-emerald-50/80 p-4 shadow-sm dark:border-emerald-800 dark:bg-emerald-950/30">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <span className="inline-block rounded-full bg-emerald-600 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-white">
                        {watchedValues.discountType === "percentage"
                          ? `${watchedValues.discountValue || 0}% OFF`
                          : `₹${watchedValues.discountValue || 0} OFF`}
                      </span>
                      <h4 className="mt-1.5 font-semibold text-stone-900 dark:text-stone-50 text-sm">
                        {watchedValues.title || "Coupon Title Here"}
                      </h4>
                      {watchedValues.description && (
                        <p className="mt-1 text-xs text-stone-600 dark:text-stone-400 line-clamp-2">
                          {watchedValues.description}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="mt-3 flex items-center justify-between gap-2 rounded-lg border border-emerald-200 bg-white/90 px-2.5 py-1.5 dark:border-emerald-800/80 dark:bg-stone-900/90">
                    <code className="font-mono text-xs font-bold text-emerald-800 dark:text-emerald-300">
                      {watchedValues.code || "COUPONCODE"}
                    </code>
                    <span className="inline-flex items-center gap-1 text-[11px] font-medium text-emerald-600 dark:text-emerald-400">
                      <Copy className="h-3 w-3" />
                      Copy
                    </span>
                  </div>

                  <div className="mt-3 space-y-1 text-[11px] text-stone-500 dark:text-stone-400">
                    <p>
                      Min order: <span className="font-semibold text-stone-700 dark:text-stone-300">₹{watchedValues.minimumCartValue || 0}</span>
                      {watchedValues.discountType === "percentage" && watchedValues.maximumDiscount && (
                        <> · Max save: <span className="font-semibold text-stone-700 dark:text-stone-300">₹{watchedValues.maximumDiscount}</span></>
                      )}
                    </p>
                    <p>
                      Scope:{" "}
                      <span className="capitalize font-semibold text-stone-700 dark:text-stone-300">
                        {watchedValues.applicableScope === "store"
                          ? targetStore?.storeName || "Store"
                          : watchedValues.applicableScope === "category"
                            ? targetCat?.name || "Category"
                            : watchedValues.applicableScope}
                      </span>
                    </p>
                    {watchedValues.newUsersOnly && (
                      <p className="font-medium text-amber-600 dark:text-amber-400">
                        ★ First-time customers only
                      </p>
                    )}
                    {watchedValues.endsAt && (
                      <p className="text-[10px] text-stone-400">
                        Expires {new Date(watchedValues.endsAt).toLocaleDateString()}
                      </p>
                    )}
                  </div>
                </div>

                <div className="rounded-xl border border-stone-200 bg-white p-3 text-xs text-stone-500 dark:border-stone-800 dark:bg-stone-900">
                  <div className="flex items-center gap-1.5 font-medium text-stone-700 dark:text-stone-300">
                    <Info className="h-3.5 w-3.5 text-emerald-600" />
                    Validation Note
                  </div>
                  <p className="mt-1 text-[11px] text-stone-500 leading-relaxed">
                    Once saved, the system automatically checks minimum cart values, customer first-order eligibility, and dates at checkout.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </form>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 border-t border-stone-100 px-6 py-4 dark:border-stone-800">
          <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button
            type="submit"
            form="admin-coupon-form"
            disabled={isSubmitting}
            className="bg-emerald-600 text-white hover:bg-emerald-700 dark:bg-emerald-600 dark:hover:bg-emerald-700"
          >
            {isSubmitting ? "Saving..." : isEditing ? "Save Changes" : "Create Coupon"}
          </Button>
        </div>
      </div>
    </div>
  );
}
