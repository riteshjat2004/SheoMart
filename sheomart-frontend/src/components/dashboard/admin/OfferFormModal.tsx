"use client";

import { useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  CalendarDays,
  Check,
  Flame,
  Image as ImageIcon,
  Sparkles,
  Tag,
  Upload,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import type { OfferItem, OfferType, OfferTargetScope } from "@/services/promotions";
import type { CategoryItem, StoreItem } from "@/types/marketplace";

const offerFormSchema = z.object({
  title: z.string().trim().min(2, "Title must be at least 2 characters").max(120),
  subtitle: z.string().trim().max(200).optional(),
  festivalName: z.string().trim().min(2, "Festival / Campaign name is required").max(120),
  description: z.string().trim().max(2000).optional(),
  offerType: z.enum([
    "flat",
    "percentage",
    "bogo",
    "buy_x_get_y",
    "free_delivery",
    "combo",
    "flash_sale",
  ]),
  discountType: z.enum(["flat", "percentage"]),
  discountValue: z.number().min(0, "Discount value cannot be negative"),
  buyQuantity: z.number().int().min(1).optional(),
  getQuantity: z.number().int().min(1).optional(),
  targetScope: z.enum(["marketplace", "store", "category", "product"]),
  bannerImage: z.string().trim().optional(),
  colorTheme: z.string().trim().optional(),
  showOnHero: z.boolean(),
  showOnFeatured: z.boolean(),
  showOnExplore: z.boolean(),
  isFlashSale: z.boolean(),
  priority: z.number().int().min(0),
  startsAt: z.string().min(1, "Start date is required"),
  endsAt: z.string().min(1, "End date is required"),
  isActive: z.boolean(),
});

export type OfferFormValues = z.infer<typeof offerFormSchema>;

interface OfferFormModalProps {
  open: boolean;
  offer?: OfferItem | null;
  stores: StoreItem[];
  categories: CategoryItem[];
  isSubmitting?: boolean;
  onClose: () => void;
  onSubmit: (data: FormData) => void;
}

function toLocalDatetimeString(dateInput?: string | Date) {
  if (!dateInput) return "";
  const date = new Date(dateInput);
  if (Number.isNaN(date.getTime())) return "";
  const offset = date.getTimezoneOffset();
  return new Date(date.getTime() - offset * 60000).toISOString().slice(0, 16);
}

export function OfferFormModal({
  open,
  offer,
  stores,
  categories,
  isSubmitting = false,
  onClose,
  onSubmit,
}: OfferFormModalProps) {
  const isEditing = Boolean(offer);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>("");
  const [selectedCategoryIds, setSelectedCategoryIds] = useState<string[]>([]);
  const [selectedStoreIds, setSelectedStoreIds] = useState<string[]>([]);

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    setError,
    formState: { errors },
  } = useForm<OfferFormValues>({
    resolver: zodResolver(offerFormSchema),
    defaultValues: {
      title: "",
      subtitle: "",
      festivalName: "",
      description: "",
      offerType: "percentage",
      discountType: "percentage",
      discountValue: 15,
      buyQuantity: 1,
      getQuantity: 1,
      targetScope: "marketplace",
      bannerImage: "",
      colorTheme: "emerald",
      showOnHero: false,
      showOnFeatured: true,
      showOnExplore: false,
      isFlashSale: false,
      priority: 0,
      startsAt: "",
      endsAt: "",
      isActive: true,
    },
  });

  useEffect(() => {
    if (open) {
      if (offer) {
        reset({
          title: offer.title || "",
          subtitle: offer.subtitle || "",
          festivalName: offer.festivalName || "",
          description: offer.description || "",
          offerType: offer.offerType || "percentage",
          discountType: offer.discountType || "percentage",
          discountValue: offer.discountValue ?? 0,
          buyQuantity: offer.buyQuantity ?? 1,
          getQuantity: offer.getQuantity ?? 1,
          targetScope: offer.targetScope || "marketplace",
          bannerImage: offer.bannerImage || "",
          colorTheme: offer.colorTheme || "emerald",
          showOnHero: offer.showOnHero ?? false,
          showOnFeatured: offer.showOnFeatured ?? true,
          showOnExplore: offer.showOnExplore ?? false,
          isFlashSale: offer.isFlashSale ?? false,
          priority: offer.priority ?? 0,
          startsAt: toLocalDatetimeString(offer.startsAt),
          endsAt: toLocalDatetimeString(offer.endsAt),
          isActive: offer.isActive ?? true,
        });
        setPreviewUrl(offer.bannerImage || "");
        setSelectedCategoryIds(offer.categoryIds || []);
        setSelectedStoreIds(offer.storeIds || []);
        setSelectedFile(null);
      } else {
        const now = new Date();
        const inTwoWeeks = new Date();
        inTwoWeeks.setDate(inTwoWeeks.getDate() + 14);
        reset({
          title: "",
          subtitle: "",
          festivalName: "",
          description: "",
          offerType: "percentage",
          discountType: "percentage",
          discountValue: 15,
          buyQuantity: 1,
          getQuantity: 1,
          targetScope: "marketplace",
          bannerImage: "",
          colorTheme: "emerald",
          showOnHero: false,
          showOnFeatured: true,
          showOnExplore: false,
          isFlashSale: false,
          priority: 0,
          startsAt: toLocalDatetimeString(now),
          endsAt: toLocalDatetimeString(inTwoWeeks),
          isActive: true,
        });
        setPreviewUrl("");
        setSelectedCategoryIds([]);
        setSelectedStoreIds([]);
        setSelectedFile(null);
      }
    }
  }, [open, offer, reset]);

  const watchedValues = watch();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      const objectUrl = URL.createObjectURL(file);
      setPreviewUrl(objectUrl);
    }
  };

  const handleToggleCategory = (catId: string) => {
    setSelectedCategoryIds((prev) =>
      prev.includes(catId) ? prev.filter((id) => id !== catId) : [...prev, catId]
    );
  };

  const handleToggleStore = (sId: string) => {
    setSelectedStoreIds((prev) =>
      prev.includes(sId) ? prev.filter((id) => id !== sId) : [...prev, sId]
    );
  };

  const onFormSubmit = (data: OfferFormValues) => {
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

    if (!selectedFile && !data.bannerImage && !previewUrl) {
      setError("bannerImage", { message: "Banner image is required" });
      return;
    }

    const formData = new FormData();
    formData.append("title", data.title);
    formData.append("subtitle", data.subtitle || "");
    formData.append("festivalName", data.festivalName);
    formData.append("description", data.description || "");
    formData.append("offerType", data.offerType);
    formData.append("discountType", data.discountType);
    formData.append("discountValue", String(data.discountValue));
    formData.append("buyQuantity", String(data.buyQuantity || 1));
    formData.append("getQuantity", String(data.getQuantity || 1));
    formData.append("targetScope", data.targetScope);
    formData.append("colorTheme", data.colorTheme || "emerald");
    formData.append("priority", String(data.priority));
    formData.append("showOnHero", String(data.showOnHero));
    formData.append("showOnFeatured", String(data.showOnFeatured));
    formData.append("showOnExplore", String(data.showOnExplore));
    formData.append("isFlashSale", String(data.isFlashSale));
    formData.append("startsAt", startDate.toISOString());
    formData.append("endsAt", endDate.toISOString());
    formData.append("isActive", String(data.isActive));

    formData.append("categoryIds", JSON.stringify(selectedCategoryIds));
    formData.append("storeIds", JSON.stringify(selectedStoreIds));

    if (selectedFile) {
      formData.append("image", selectedFile);
    } else if (data.bannerImage) {
      formData.append("bannerImage", data.bannerImage);
    }

    onSubmit(formData);
  };

  if (!open) return null;

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
              <Sparkles className="h-4 w-4" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-stone-900 dark:text-stone-100">
                {isEditing ? `Edit Campaign: ${offer?.title}` : "Create Promotional Campaign"}
              </h2>
              <p className="text-xs text-stone-500 dark:text-stone-400">
                Configure seasonal festival deals, banners, and homepage carousel placements.
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
          id="admin-offer-form"
          onSubmit={handleSubmit(onFormSubmit)}
          className="flex-1 overflow-y-auto p-6 space-y-6"
        >
          {/* Section 1: Campaign Details */}
          <div className="space-y-4">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
              1. Campaign Information
            </h3>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
                  Festival / Event Name <span className="text-rose-500">*</span>
                </label>
                <input
                  {...register("festivalName")}
                  placeholder="e.g. Diwali Mega Super Saver, Summer Fiesta"
                  className="w-full rounded-xl border border-stone-200 bg-white px-3.5 py-2 text-sm outline-none transition focus:border-emerald-500 dark:border-stone-800 dark:bg-stone-950"
                />
                {errors.festivalName && <p className="mt-1 text-xs text-rose-500">{errors.festivalName.message}</p>}
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
                  Offer Title <span className="text-rose-500">*</span>
                </label>
                <input
                  {...register("title")}
                  placeholder="e.g. Up to 40% Off Fresh Fruits & Vegetables"
                  className="w-full rounded-xl border border-stone-200 bg-white px-3.5 py-2 text-sm outline-none transition focus:border-emerald-500 dark:border-stone-800 dark:bg-stone-950"
                />
                {errors.title && <p className="mt-1 text-xs text-rose-500">{errors.title.message}</p>}
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
                  Subtitle / Tagline (Optional)
                </label>
                <input
                  {...register("subtitle")}
                  placeholder="e.g. Farm-fresh produce directly from local vendors at discounted rates"
                  className="w-full rounded-xl border border-stone-200 bg-white px-3.5 py-2 text-sm outline-none transition focus:border-emerald-500 dark:border-stone-800 dark:bg-stone-950"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
                  Description (Optional)
                </label>
                <textarea
                  {...register("description")}
                  rows={2}
                  placeholder="Detailed terms, promotional message, or highlight..."
                  className="w-full rounded-xl border border-stone-200 bg-white px-3.5 py-2 text-sm outline-none transition focus:border-emerald-500 dark:border-stone-800 dark:bg-stone-950"
                />
              </div>
            </div>
          </div>

          {/* Section 2: Offer Type & Discount */}
          <div className="space-y-4">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
              2. Campaign Mechanics & Discount
            </h3>
            <div className="grid gap-4 sm:grid-cols-3">
              <div>
                <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
                  Campaign Type
                </label>
                <select
                  {...register("offerType")}
                  className="w-full rounded-xl border border-stone-200 bg-white px-3.5 py-2 text-sm outline-none transition focus:border-emerald-500 dark:border-stone-800 dark:bg-stone-950"
                >
                  <option value="percentage">Percentage Off (%)</option>
                  <option value="flat">Flat Discount (₹)</option>
                  <option value="bogo">BOGO (Buy 1 Get 1 Free)</option>
                  <option value="buy_x_get_y">Buy X Get Y</option>
                  <option value="free_delivery">Free Delivery</option>
                  <option value="combo">Combo Savings</option>
                  <option value="flash_sale">Flash Sale</option>
                </select>
              </div>

              {(watchedValues.offerType === "bogo" || watchedValues.offerType === "buy_x_get_y") ? (
                <>
                  <div>
                    <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
                      Buy Quantity
                    </label>
                    <input
                      type="number"
                      min="1"
                      {...register("buyQuantity", { valueAsNumber: true })}
                      className="w-full rounded-xl border border-stone-200 bg-white px-3.5 py-2 text-sm outline-none transition focus:border-emerald-500 dark:border-stone-800 dark:bg-stone-950"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
                      Get Quantity Free
                    </label>
                    <input
                      type="number"
                      min="1"
                      {...register("getQuantity", { valueAsNumber: true })}
                      className="w-full rounded-xl border border-stone-200 bg-white px-3.5 py-2 text-sm outline-none transition focus:border-emerald-500 dark:border-stone-800 dark:bg-stone-950"
                    />
                  </div>
                </>
              ) : (
                <>
                  <div>
                    <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
                      Discount Type
                    </label>
                    <select
                      {...register("discountType")}
                      className="w-full rounded-xl border border-stone-200 bg-white px-3.5 py-2 text-sm outline-none transition focus:border-emerald-500 dark:border-stone-800 dark:bg-stone-950"
                    >
                      <option value="percentage">Percentage (%)</option>
                      <option value="flat">Flat Amount (₹)</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
                      Discount Value ({watchedValues.discountType === "percentage" ? "%" : "₹"})
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      {...register("discountValue", { valueAsNumber: true })}
                      className="w-full rounded-xl border border-stone-200 bg-white px-3.5 py-2 text-sm outline-none transition focus:border-emerald-500 dark:border-stone-800 dark:bg-stone-950"
                    />
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Section 3: Banner Image Upload */}
          <div className="space-y-4">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
              3. Campaign Banner & Visuals
            </h3>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="flex h-36 w-full flex-col items-center justify-center rounded-2xl border-2 border-dashed border-stone-300 bg-stone-50/50 p-4 transition hover:border-emerald-500 hover:bg-emerald-50/20 dark:border-stone-800 dark:bg-stone-900/40"
                >
                  <Upload className="h-6 w-6 text-stone-400" />
                  <p className="mt-2 text-xs font-semibold text-stone-700 dark:text-stone-300">
                    {selectedFile ? selectedFile.name : "Upload Banner Image (Cloudinary)"}
                  </p>
                  <p className="text-[11px] text-stone-400">PNG, JPG, WebP up to 5MB</p>
                </button>
                {errors.bannerImage && <p className="mt-1 text-xs text-rose-500">{errors.bannerImage.message}</p>}
              </div>

              {/* Banner Preview */}
              <div>
                {previewUrl ? (
                  <div className="relative h-36 w-full overflow-hidden rounded-2xl border border-stone-200 dark:border-stone-800 bg-stone-100 dark:bg-stone-900">
                    <img src={previewUrl} alt="Offer banner preview" className="h-full w-full object-cover" />
                    <button
                      type="button"
                      onClick={() => {
                        setPreviewUrl("");
                        setSelectedFile(null);
                        setValue("bannerImage", "");
                      }}
                      className="absolute right-2 top-2 rounded-full bg-black/60 p-1 text-white hover:bg-black/80"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </div>
                ) : (
                  <div className="flex h-36 w-full items-center justify-center rounded-2xl border border-stone-200 bg-stone-50 text-xs text-stone-400 dark:border-stone-800 dark:bg-stone-900/50">
                    <ImageIcon className="mr-2 h-4 w-4" />
                    Banner preview will appear here
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Section 4: Targeting Scopes (Categories & Stores) */}
          <div className="space-y-4">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
              4. Target Scope & Eligibility
            </h3>

            <div>
              <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
                Target Scope Mode
              </label>
              <select
                {...register("targetScope")}
                className="w-full rounded-xl border border-stone-200 bg-white px-3.5 py-2 text-sm outline-none transition focus:border-emerald-500 dark:border-stone-800 dark:bg-stone-950"
              >
                <option value="marketplace">Whole Marketplace (All stores & items)</option>
                <option value="category">Category Specific</option>
                <option value="store">Store Specific</option>
              </select>
            </div>

            {/* Category selector */}
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-stone-600 dark:text-stone-400">
                Target Categories ({selectedCategoryIds.length} selected)
              </label>
              <div className="flex max-h-32 flex-wrap gap-1.5 overflow-y-auto rounded-xl border border-stone-200 p-2.5 dark:border-stone-800 dark:bg-stone-900/50">
                {categories.map((c) => {
                  const catId = c.categoryId ?? (c as unknown as { _id?: string })._id ?? "";
                  if (!catId) return null;
                  const isSelected = selectedCategoryIds.includes(catId);
                  return (
                    <button
                      key={catId}
                      type="button"
                      onClick={() => handleToggleCategory(catId)}
                      className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium transition ${
                        isSelected
                          ? "bg-emerald-600 text-white"
                          : "bg-stone-100 text-stone-700 hover:bg-stone-200 dark:bg-stone-800 dark:text-stone-300"
                      }`}
                    >
                      {isSelected && <Check className="h-3 w-3" />}
                      {c.name}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Store selector */}
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-stone-600 dark:text-stone-400">
                Target Stores ({selectedStoreIds.length} selected)
              </label>
              <div className="flex max-h-32 flex-wrap gap-1.5 overflow-y-auto rounded-xl border border-stone-200 p-2.5 dark:border-stone-800 dark:bg-stone-900/50">
                {stores.map((s) => {
                  const stId = s.storeId ?? (s as unknown as { _id?: string })._id ?? "";
                  if (!stId) return null;
                  const isSelected = selectedStoreIds.includes(stId);
                  return (
                    <button
                      key={stId}
                      type="button"
                      onClick={() => handleToggleStore(stId)}
                      className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium transition ${
                        isSelected
                          ? "bg-emerald-600 text-white"
                          : "bg-stone-100 text-stone-700 hover:bg-stone-200 dark:bg-stone-800 dark:text-stone-300"
                      }`}
                    >
                      {isSelected && <Check className="h-3 w-3" />}
                      {s.storeName}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Section 5: Homepage Placements & Timing */}
          <div className="space-y-4">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
              5. Placements, Timing & Status
            </h3>

            <div className="grid gap-4 sm:grid-cols-3">
              <div>
                <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
                  Priority (Order Sort)
                </label>
                <input
                  type="number"
                  min="0"
                  {...register("priority", { valueAsNumber: true })}
                  className="w-full rounded-xl border border-stone-200 bg-white px-3.5 py-2 text-sm outline-none transition focus:border-emerald-500 dark:border-stone-800 dark:bg-stone-950"
                />
              </div>

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
            </div>

            {/* Placements check switches */}
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4 pt-1">
              <label className="flex items-center gap-2.5 rounded-xl border border-stone-200 bg-stone-50/60 p-3 text-xs font-medium text-stone-700 dark:border-stone-800 dark:bg-stone-900/40 dark:text-stone-300 cursor-pointer">
                <input
                  type="checkbox"
                  {...register("showOnHero")}
                  className="h-4 w-4 rounded border-stone-300 text-emerald-600 focus:ring-emerald-500"
                />
                <span>Hero Carousel</span>
              </label>

              <label className="flex items-center gap-2.5 rounded-xl border border-stone-200 bg-stone-50/60 p-3 text-xs font-medium text-stone-700 dark:border-stone-800 dark:bg-stone-900/40 dark:text-stone-300 cursor-pointer">
                <input
                  type="checkbox"
                  {...register("showOnFeatured")}
                  className="h-4 w-4 rounded border-stone-300 text-emerald-600 focus:ring-emerald-500"
                />
                <span>Featured Deals</span>
              </label>

              <label className="flex items-center gap-2.5 rounded-xl border border-stone-200 bg-stone-50/60 p-3 text-xs font-medium text-stone-700 dark:border-stone-800 dark:bg-stone-900/40 dark:text-stone-300 cursor-pointer">
                <input
                  type="checkbox"
                  {...register("isFlashSale")}
                  className="h-4 w-4 rounded border-stone-300 text-amber-600 focus:ring-amber-500"
                />
                <span className="flex items-center gap-1">
                  <Flame className="h-3.5 w-3.5 text-amber-500" />
                  Flash Sale
                </span>
              </label>

              <label className="flex items-center gap-2.5 rounded-xl border border-stone-200 bg-stone-50/60 p-3 text-xs font-medium text-stone-700 dark:border-stone-800 dark:bg-stone-900/40 dark:text-stone-300 cursor-pointer">
                <input
                  type="checkbox"
                  {...register("isActive")}
                  className="h-4 w-4 rounded border-stone-300 text-emerald-600 focus:ring-emerald-500"
                />
                <span>Active Status</span>
              </label>
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
            form="admin-offer-form"
            disabled={isSubmitting}
            className="bg-emerald-600 text-white hover:bg-emerald-700 dark:bg-emerald-600 dark:hover:bg-emerald-700"
          >
            {isSubmitting ? "Saving..." : isEditing ? "Save Campaign" : "Publish Campaign"}
          </Button>
        </div>
      </div>
    </div>
  );
}
