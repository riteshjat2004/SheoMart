"use client";

import { useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { X, Package, Sparkles, Upload, Image as ImageIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { AdminProduct } from "@/types/admin-product";
import type { CategoryItem, StoreItem } from "@/types/marketplace";

const productFormSchema = z.object({
  name: z.string().trim().min(2, "Product name must be at least 2 characters").max(120),
  sku: z.string().trim().min(1, "SKU is required").max(100),
  brand: z.string().trim().max(100).optional(),
  storeId: z.string().trim().min(1, "Please select a store"),
  categoryId: z.string().trim().min(1, "Please select a category"),
  price: z.number().min(0, "Price cannot be negative"),
  discountPrice: z.number().min(0, "Discount price cannot be negative"),
  quantity: z.number().int().min(0, "Quantity cannot be negative"),
  description: z.string().trim().max(2000).optional(),
  imageUrl: z.string().trim().optional(),
  isPublished: z.boolean(),
  isActive: z.boolean(),
  isFeatured: z.boolean(),
  sellingType: z.enum(["PIECE", "WEIGHT", "VOLUME"]).optional(),
  baseUnit: z.string().trim().optional(),
  unitLabel: z.string().trim().optional(),
});

export type ProductFormValues = z.infer<typeof productFormSchema>;

interface ProductFormModalProps {
  open: boolean;
  product?: AdminProduct | null;
  stores: StoreItem[];
  categories: CategoryItem[];
  isSubmitting?: boolean;
  onClose: () => void;
  onSubmit: (data: FormData) => void;
}

export function ProductFormModal({
  open,
  product,
  stores,
  categories,
  isSubmitting = false,
  onClose,
  onSubmit,
}: ProductFormModalProps) {
  const isEditing = Boolean(product);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>("");

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setError,
    formState: { errors },
  } = useForm<ProductFormValues>({
    resolver: zodResolver(productFormSchema),
    defaultValues: {
      name: "",
      sku: "",
      brand: "",
      storeId: "",
      categoryId: "",
      price: 0,
      discountPrice: 0,
      quantity: 0,
      description: "",
      imageUrl: "",
      isPublished: false,
      isActive: true,
      isFeatured: false,
    },
  });

  const priceWatch = watch("price") ?? 0;
  const discountPriceWatch = watch("discountPrice") ?? 0;
  const imageUrlWatch = watch("imageUrl") ?? "";

  // Reset form when modal opens or product changes
  useEffect(() => {
    if (open) {
      if (product) {
        reset({
          name: product.name || "",
          sku: product.sku || "",
          brand: product.brand || "",
          storeId: product.store?.storeId || "",
          categoryId: product.category?.categoryId || "",
          price: product.price || 0,
          discountPrice: product.discountPrice || 0,
          quantity: product.quantity || 0,
          description: product.description || "",
          imageUrl: product.thumbnail || "",
          isPublished: product.isPublished ?? false,
          isActive: product.isActive ?? true,
          isFeatured: product.isFeatured ?? false,
        });
        setPreviewUrl(product.thumbnail || "");
      } else {
        reset({
          name: "",
          sku: "",
          brand: "",
          storeId: stores[0]?.storeId ?? "",
          categoryId: categories[0]?.categoryId ?? "",
          price: 0,
          discountPrice: 0,
          quantity: 0,
          description: "",
          imageUrl: "",
          isPublished: true,
          isActive: true,
          isFeatured: false,
        });
        setPreviewUrl("");
      }
      setSelectedFile(null);
    }
  }, [open, product, stores, categories, reset]);

  // Handle local file selection preview
  const handleFileChange = (file?: File) => {
    if (!file || !["image/jpeg", "image/jpg", "image/png", "image/webp"].includes(file.type)) return;
    if (file.size > 10 * 1024 * 1024) return;
    setSelectedFile(file);
    const objectUrl = URL.createObjectURL(file);
    setPreviewUrl(objectUrl);
  };

  // Live discount calculation
  const discountPercentage =
    priceWatch > 0 && discountPriceWatch > 0 && discountPriceWatch < priceWatch
      ? Math.round(((priceWatch - discountPriceWatch) / priceWatch) * 100)
      : 0;

  const onFormSubmit = (data: ProductFormValues) => {
    if (data.discountPrice > 0 && data.discountPrice > data.price) {
      setError("discountPrice", { message: "Discount price cannot exceed regular price" });
      return;
    }

    const formData = new FormData();
    formData.append("name", data.name);
    formData.append("sku", data.sku.toUpperCase());
    formData.append("brand", data.brand || "");
    formData.append("storeId", data.storeId);
    formData.append("categoryId", data.categoryId);
    formData.append("price", String(data.price));
    formData.append("discountPrice", String(data.discountPrice || 0));
    formData.append("quantity", String(data.quantity || 0));
    formData.append("description", data.description || "");
    formData.append("isPublished", String(data.isPublished));
    formData.append("isActive", String(data.isActive));
    formData.append("isFeatured", String(data.isFeatured));
    if (data.sellingType) formData.append("sellingType", data.sellingType);
    if (data.baseUnit) formData.append("baseUnit", data.baseUnit);
    if (data.unitLabel) formData.append("unitLabel", data.unitLabel);

    if (selectedFile) {
      formData.append("image", selectedFile);
    } else if (data.imageUrl) {
      formData.append("imageUrl", data.imageUrl);
    }

    onSubmit(formData);
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-stone-950/70 p-4 backdrop-blur-sm">
      <div className="flex max-h-[92vh] w-full max-w-3xl flex-col overflow-hidden rounded-2xl border border-stone-200 bg-white shadow-2xl dark:border-stone-800 dark:bg-stone-950">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-stone-200 px-6 py-4 dark:border-stone-800">
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400">
              <Package className="h-5 w-5" />
            </span>
            <div>
              <h2 className="text-lg font-bold text-stone-900 dark:text-stone-50">
                {isEditing ? `Edit Product: ${product?.name}` : "Create New Product"}
              </h2>
              <p className="text-xs text-stone-500 dark:text-stone-400">
                {isEditing
                  ? "Update product catalog attributes, pricing, stock, or promotional flags."
                  : "Add a new product to the marketplace catalog and assign it to a store."}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-stone-400 hover:bg-stone-100 hover:text-stone-600 dark:hover:bg-stone-800 dark:hover:text-stone-200"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Scrollable Form Body */}
        <form id="admin-product-form" onSubmit={handleSubmit(onFormSubmit)} className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Basic Information */}
          <div className="space-y-4">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-stone-400">
              1. Basic Information
            </h3>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
                  Product Name <span className="text-rose-500">*</span>
                </label>
                <input
                  {...register("name")}
                  placeholder="e.g. Organic Brown Basmati Rice (1kg)"
                  className="w-full rounded-xl border border-stone-200 bg-white px-3.5 py-2 text-sm outline-none transition focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 dark:border-stone-800 dark:bg-stone-950"
                />
                {errors.name && <p className="mt-1 text-xs text-rose-500">{errors.name.message}</p>}
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
                  SKU (Stock Keeping Unit) <span className="text-rose-500">*</span>
                </label>
                <input
                  {...register("sku")}
                  placeholder="e.g. GROC-RICE-001"
                  className="w-full rounded-xl border border-stone-200 bg-white px-3.5 py-2 font-mono text-sm uppercase outline-none transition focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 dark:border-stone-800 dark:bg-stone-950"
                />
                {errors.sku && <p className="mt-1 text-xs text-rose-500">{errors.sku.message}</p>}
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
                  Brand (Optional)
                </label>
                <input
                  {...register("brand")}
                  placeholder="e.g. India Gate, Nestle, FarmFresh"
                  className="w-full rounded-xl border border-stone-200 bg-white px-3.5 py-2 text-sm outline-none transition focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 dark:border-stone-800 dark:bg-stone-950"
                />
                {errors.brand && <p className="mt-1 text-xs text-rose-500">{errors.brand.message}</p>}
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
                  Store / Vendor <span className="text-rose-500">*</span>
                </label>
                <select
                  {...register("storeId")}
                  className="w-full rounded-xl border border-stone-200 bg-white px-3.5 py-2 text-sm outline-none transition focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 dark:border-stone-800 dark:bg-stone-950"
                >
                  <option value="">Select a store...</option>
                  {stores.map((s) => (
                    <option key={s.storeId ?? s._id} value={s.storeId ?? s._id}>
                      {s.storeName ?? s.name ?? "Store"}
                    </option>
                  ))}
                </select>
                {errors.storeId && <p className="mt-1 text-xs text-rose-500">{errors.storeId.message}</p>}
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
                  Category <span className="text-rose-500">*</span>
                </label>
                <select
                  {...register("categoryId")}
                  className="w-full rounded-xl border border-stone-200 bg-white px-3.5 py-2 text-sm outline-none transition focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 dark:border-stone-800 dark:bg-stone-950"
                >
                  <option value="">Select a category...</option>
                  {categories.map((c) => (
                    <option key={c.categoryId ?? c._id} value={c.categoryId ?? c._id}>
                      {c.name}
                    </option>
                  ))}
                </select>
                {errors.categoryId && <p className="mt-1 text-xs text-rose-500">{errors.categoryId.message}</p>}
              </div>
            </div>
          </div>

          {/* Pricing & Stock */}
          <div className="space-y-4">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-stone-400">
              2. Pricing & Inventory
            </h3>

            <div className="grid gap-4 sm:grid-cols-3">
              <div>
                <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
                  Regular Price (MRP in ₹) <span className="text-rose-500">*</span>
                </label>
                <input
                  type="number"
                  step="0.01"
                  {...register("price", { valueAsNumber: true })}
                  className="w-full rounded-xl border border-stone-200 bg-white px-3.5 py-2 text-sm outline-none transition focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 dark:border-stone-800 dark:bg-stone-950"
                />
                {errors.price && <p className="mt-1 text-xs text-rose-500">{errors.price.message}</p>}
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
                  Discount Price (Selling ₹)
                </label>
                <input
                  type="number"
                  step="0.01"
                  {...register("discountPrice", { valueAsNumber: true })}
                  className="w-full rounded-xl border border-stone-200 bg-white px-3.5 py-2 text-sm outline-none transition focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 dark:border-stone-800 dark:bg-stone-950"
                />
                {discountPercentage > 0 && (
                  <span className="mt-1 block text-xs font-bold text-emerald-600 dark:text-emerald-400">
                    {discountPercentage}% Discount calculated
                  </span>
                )}
                {errors.discountPrice && (
                  <p className="mt-1 text-xs text-rose-500">{errors.discountPrice.message}</p>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
                  Available Quantity <span className="text-rose-500">*</span>
                </label>
                <input
                  type="number"
                  {...register("quantity", { valueAsNumber: true })}
                  className="w-full rounded-xl border border-stone-200 bg-white px-3.5 py-2 text-sm outline-none transition focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 dark:border-stone-800 dark:bg-stone-950"
                />
                {errors.quantity && <p className="mt-1 text-xs text-rose-500">{errors.quantity.message}</p>}
              </div>
            </div>
          </div>

          {/* Media Upload */}
          <div className="space-y-4">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-stone-400">
              3. Product Imagery
            </h3>

            <div className="flex flex-col sm:flex-row items-start gap-4">
              <div className="flex h-24 w-24 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-stone-200 bg-stone-50 dark:border-stone-800 dark:bg-stone-900">
                {previewUrl || imageUrlWatch ? (
                  <img
                    src={previewUrl || imageUrlWatch}
                    alt="Preview"
                    className="h-full w-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLElement).style.display = "none";
                    }}
                  />
                ) : (
                  <ImageIcon className="h-8 w-8 text-stone-300" />
                )}
              </div>

              <div className="flex-1 space-y-3 w-full">
                <div>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".jpg,.jpeg,.png,.webp,image/*"
                    onChange={(e) => handleFileChange(e.target.files?.[0])}
                    className="hidden"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => fileInputRef.current?.click()}
                    className="text-xs"
                  >
                    <Upload className="h-3.5 w-3.5 mr-1.5" />
                    {selectedFile ? "Replace Selected Image" : "Upload Image File"}
                  </Button>
                  {selectedFile && (
                    <span className="ml-2 text-xs text-stone-500">{selectedFile.name}</span>
                  )}
                  <p className="mt-1 text-[11px] text-stone-400">PNG, JPG, or WEBP up to 10MB.</p>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
                    Or Enter Image URL
                  </label>
                  <input
                    {...register("imageUrl")}
                    placeholder="https://example.com/product.jpg"
                    className="w-full rounded-xl border border-stone-200 bg-white px-3.5 py-1.5 text-xs outline-none transition focus:border-emerald-500 dark:border-stone-800 dark:bg-stone-950"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Publication and Status Flags */}
          <div className="space-y-4">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-stone-400">
              4. Publication & Promotion
            </h3>

            <div className="grid gap-3 sm:grid-cols-3">
              <label className="flex items-center gap-3 rounded-xl border border-stone-200 p-3.5 cursor-pointer dark:border-stone-800 hover:bg-stone-50 dark:hover:bg-stone-900/50">
                <input
                  type="checkbox"
                  {...register("isPublished")}
                  className="h-4 w-4 rounded border-stone-300 text-emerald-600 focus:ring-emerald-500"
                />
                <div>
                  <span className="block text-xs font-semibold text-stone-900 dark:text-stone-100">
                    Published
                  </span>
                  <span className="block text-[11px] text-stone-500">Live on storefront</span>
                </div>
              </label>

              <label className="flex items-center gap-3 rounded-xl border border-stone-200 p-3.5 cursor-pointer dark:border-stone-800 hover:bg-stone-50 dark:hover:bg-stone-900/50">
                <input
                  type="checkbox"
                  {...register("isActive")}
                  className="h-4 w-4 rounded border-stone-300 text-emerald-600 focus:ring-emerald-500"
                />
                <div>
                  <span className="block text-xs font-semibold text-stone-900 dark:text-stone-100">
                    Active Status
                  </span>
                  <span className="block text-[11px] text-stone-500">Enable purchasing</span>
                </div>
              </label>

              <label className="flex items-center gap-3 rounded-xl border border-stone-200 p-3.5 cursor-pointer dark:border-stone-800 hover:bg-stone-50 dark:hover:bg-stone-900/50">
                <input
                  type="checkbox"
                  {...register("isFeatured")}
                  className="h-4 w-4 rounded border-stone-300 text-amber-600 focus:ring-amber-500"
                />
                <div>
                  <span className="flex items-center gap-1 text-xs font-semibold text-stone-900 dark:text-stone-100">
                    <Sparkles className="h-3 w-3 text-amber-500" /> Featured
                  </span>
                  <span className="block text-[11px] text-stone-500">Highlight in banners</span>
                </div>
              </label>
            </div>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300">
              Product Description (Optional)
            </label>
            <textarea
              {...register("description")}
              rows={3}
              placeholder="Enter product specifications, ingredients, dietary notes, or features..."
              className="w-full rounded-xl border border-stone-200 bg-white px-3.5 py-2 text-sm outline-none transition focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 dark:border-stone-800 dark:bg-stone-950"
            />
            {errors.description && (
              <p className="mt-1 text-xs text-rose-500">{errors.description.message}</p>
            )}
          </div>
        </form>

        {/* Footer */}
        <div className="flex items-center justify-end gap-2 border-t border-stone-200 bg-stone-50/60 px-6 py-4 dark:border-stone-800 dark:bg-stone-900/60">
          <Button type="button" variant="outline" size="sm" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button
            type="submit"
            form="admin-product-form"
            disabled={isSubmitting}
            className="bg-emerald-600 text-white hover:bg-emerald-700"
          >
            {isSubmitting ? "Saving Product..." : isEditing ? "Save Changes" : "Create Product"}
          </Button>
        </div>
      </div>
    </div>
  );
}
