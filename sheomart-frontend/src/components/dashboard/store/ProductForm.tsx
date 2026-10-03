"use client";

import { useEffect, useRef, useState, type DragEvent, type FormEvent } from "react";
import { UploadCloud, X, Sparkles, Tag, Check, AlertCircle } from "lucide-react";
import type { CategoryItem } from "@/types/marketplace";

export interface ProductFormValues {
  name: string;
  description: string;
  brand: string;
  sku: string;
  price: number;
  discountPrice: number;
  quantity?: number;
  categoryId: string;
  images: string[];
  imageUrl?: string;
  imageFile?: File;
  isPublished: boolean;
  isActive: boolean;
  isFeatured?: boolean;
}

interface ProductFormProps {
  initialValues?: Partial<ProductFormValues>;
  categories: CategoryItem[];
  onSubmit: (values: ProductFormValues) => void;
  formId: string;
  isEdit?: boolean;
}

const emptyValues: ProductFormValues = {
  name: "",
  description: "",
  brand: "",
  sku: "",
  price: 0,
  discountPrice: 0,
  quantity: 0,
  categoryId: "",
  images: [],
  isPublished: true,
  isActive: true,
  isFeatured: false,
};

function toNumber(value: string | number) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? Math.max(0, parsed) : 0;
}

function parseImageUrls(value: string) {
  return Array.from(new Set(value.split(/[,\n]+/).map((image) => image.trim()).filter(Boolean)));
}

export function ProductForm({ initialValues, categories, onSubmit, formId, isEdit = false }: ProductFormProps) {
  const initialImages = initialValues?.images ?? [];
  const [values, setValues] = useState<ProductFormValues>({
    ...emptyValues,
    ...initialValues,
    images: initialImages,
    quantity: initialValues?.quantity !== undefined ? initialValues.quantity : emptyValues.quantity,
  });
  const [imageInput, setImageInput] = useState(initialImages.join("\n"));
  const [imageFile, setImageFile] = useState<File | undefined>();
  const initialImageInput = initialImages.join("\n");
  const [imageError, setImageError] = useState("");
  const [formError, setFormError] = useState("");
  const [isDraggingImage, setIsDraggingImage] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const initialPreviewUrl = initialValues?.imageUrl || initialImages[0] || "";
  const [previewUrl, setPreviewUrl] = useState(initialPreviewUrl);

  useEffect(() => {
    if (!imageFile) {
      setPreviewUrl(initialPreviewUrl);
      return;
    }

    const objectUrl = URL.createObjectURL(imageFile);
    setPreviewUrl(objectUrl);

    return () => {
      URL.revokeObjectURL(objectUrl);
    };
  }, [imageFile, initialPreviewUrl]);

  const handleFileChange = (file: File | undefined) => {
    if (!file) return;
    if (!["image/jpeg", "image/jpg", "image/png", "image/webp"].includes(file.type)) {
      setImageError("Only JPG, PNG, and WebP images are allowed.");
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      setImageError("Image must be 10 MB or smaller.");
      return;
    }
    setImageError("");
    setImageFile(file);
  };

  const handleImageDrop = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDraggingImage(false);
    handleFileChange(event.dataTransfer.files?.[0]);
  };

  const clearSelectedImage = () => {
    setImageFile(undefined);
    setPreviewUrl("");
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const mrp = toNumber(values.price);
  const discountPrice = toNumber(values.discountPrice);
  const sellingPrice = discountPrice > 0 && discountPrice < mrp ? discountPrice : mrp;
  const savings = mrp > sellingPrice ? mrp - sellingPrice : 0;
  const discountPercent = mrp > 0 && savings > 0 ? Math.round((savings / mrp) * 100) : 0;

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setFormError("");

    if (!values.name.trim()) {
      setFormError("Product name is required.");
      return;
    }
    if (!values.sku.trim()) {
      setFormError("SKU is required.");
      return;
    }
    if (!values.categoryId) {
      setFormError("Please select a category.");
      return;
    }
    if (mrp <= 0) {
      setFormError("Price must be greater than 0.");
      return;
    }
    if (discountPrice > mrp) {
      setFormError("Discount price cannot exceed the original price.");
      return;
    }

    const images = imageFile ? [] : parseImageUrls(imageInput);
    if (!imageFile && imageInput.trim()) {
      try {
        images.forEach((image) => new URL(image));
      } catch {
        setImageError("Enter a valid image URL.");
        return;
      }
    }
    setImageError("");

    onSubmit({
      ...values,
      name: values.name.trim(),
      sku: values.sku.trim().toUpperCase(),
      brand: values.brand.trim(),
      price: mrp,
      discountPrice,
      quantity: toNumber(values.quantity !== undefined ? values.quantity : (initialValues?.quantity ?? 0)),
      images,
      imageUrl: imageFile ? undefined : imageInput !== initialImageInput ? images[0] : undefined,
      imageFile,
    });
  };

  return (
    <form id={formId} className="space-y-6" onSubmit={handleSubmit}>
      {formError ? (
        <div className="flex items-center gap-2 rounded-2xl border border-rose-200 bg-rose-50 p-3.5 text-xs font-medium text-rose-700 dark:border-rose-900/50 dark:bg-rose-950/40 dark:text-rose-400">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>{formError}</span>
        </div>
      ) : null}

      {/* Basic Info Section */}
      <div className="space-y-4">
        <h4 className="text-xs font-semibold uppercase tracking-wider text-stone-400 dark:text-stone-500">
          Basic Information
        </h4>

        <div className="grid gap-4 md:grid-cols-2">
          <label className="space-y-1.5 text-xs font-medium text-stone-700 dark:text-stone-300">
            <span>Product Name *</span>
            <input
              required
              value={values.name}
              onChange={(event) => setValues((current) => ({ ...current, name: event.target.value }))}
              className="w-full rounded-2xl border border-stone-200 bg-white px-3.5 py-2.5 text-sm outline-none transition-all focus:border-emerald-500 dark:border-stone-800 dark:bg-stone-950"
              placeholder="e.g. Organic Alphonso Mango"
            />
          </label>

          <label className="space-y-1.5 text-xs font-medium text-stone-700 dark:text-stone-300">
            <span>SKU (Stock Keeping Unit) *</span>
            <input
              required
              value={values.sku}
              onChange={(event) =>
                setValues((current) => ({ ...current, sku: event.target.value.toUpperCase() }))
              }
              className="w-full font-mono rounded-2xl border border-stone-200 bg-white px-3.5 py-2.5 text-sm uppercase outline-none transition-all focus:border-emerald-500 dark:border-stone-800 dark:bg-stone-950"
              placeholder="e.g. MNG-ALP-500G"
            />
          </label>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <label className="space-y-1.5 text-xs font-medium text-stone-700 dark:text-stone-300">
            <span>Category *</span>
            <select
              required
              value={values.categoryId}
              onChange={(event) => setValues((current) => ({ ...current, categoryId: event.target.value }))}
              className="w-full rounded-2xl border border-stone-200 bg-white px-3.5 py-2.5 text-sm outline-none transition-all focus:border-emerald-500 dark:border-stone-800 dark:bg-stone-950"
            >
              <option value="">Select a category</option>
              {categories.map((category) => (
                <option key={category.categoryId ?? category._id} value={category.categoryId ?? category._id ?? ""}>
                  {category.name}
                </option>
              ))}
            </select>
          </label>

          <label className="space-y-1.5 text-xs font-medium text-stone-700 dark:text-stone-300">
            <span>Brand / Manufacturer</span>
            <input
              value={values.brand}
              onChange={(event) => setValues((current) => ({ ...current, brand: event.target.value }))}
              className="w-full rounded-2xl border border-stone-200 bg-white px-3.5 py-2.5 text-sm outline-none transition-all focus:border-emerald-500 dark:border-stone-800 dark:bg-stone-950"
              placeholder="e.g. FreshFarms, Tata, Nestle"
            />
          </label>
        </div>

        <label className="block space-y-1.5 text-xs font-medium text-stone-700 dark:text-stone-300">
          <span>Description</span>
          <textarea
            value={values.description}
            onChange={(event) => setValues((current) => ({ ...current, description: event.target.value }))}
            rows={3}
            className="w-full rounded-2xl border border-stone-200 bg-white px-3.5 py-2.5 text-sm outline-none transition-all focus:border-emerald-500 dark:border-stone-800 dark:bg-stone-950"
            placeholder="Detailed description, ingredients, storage instructions..."
          />
        </label>
      </div>

      {/* Pricing & Stock Section */}
      <div className="space-y-4">
        <h4 className="text-xs font-semibold uppercase tracking-wider text-stone-400 dark:text-stone-500">
          Pricing & Inventory
        </h4>

        <div className="grid gap-4 sm:grid-cols-3">
          <label className="space-y-1.5 text-xs font-medium text-stone-700 dark:text-stone-300">
            <span>MRP / Regular Price (₹) *</span>
            <input
              type="number"
              min="0"
              step="0.01"
              required
              value={values.price || ""}
              onChange={(event) => setValues((current) => ({ ...current, price: toNumber(event.target.value) }))}
              className="w-full rounded-2xl border border-stone-200 bg-white px-3.5 py-2.5 text-sm outline-none transition-all focus:border-emerald-500 dark:border-stone-800 dark:bg-stone-950"
              placeholder="0.00"
            />
          </label>

          <label className="space-y-1.5 text-xs font-medium text-stone-700 dark:text-stone-300">
            <span>Discount / Selling Price (₹)</span>
            <input
              type="number"
              min="0"
              step="0.01"
              value={values.discountPrice || ""}
              onChange={(event) =>
                setValues((current) => ({ ...current, discountPrice: toNumber(event.target.value) }))
              }
              className="w-full rounded-2xl border border-stone-200 bg-white px-3.5 py-2.5 text-sm outline-none transition-all focus:border-emerald-500 dark:border-stone-800 dark:bg-stone-950"
              placeholder="Leave empty or 0 if no discount"
            />
          </label>

          <label className="space-y-1.5 text-xs font-medium text-stone-700 dark:text-stone-300">
            <span>{isEdit ? "Stock Quantity" : "Initial Stock Quantity"}</span>
            <input
              type="number"
              min="0"
              step="1"
              value={values.quantity ?? 0}
              onChange={(event) =>
                setValues((current) => ({ ...current, quantity: toNumber(event.target.value) }))
              }
              className="w-full rounded-2xl border border-stone-200 bg-white px-3.5 py-2.5 text-sm outline-none transition-all focus:border-emerald-500 dark:border-stone-800 dark:bg-stone-950"
              placeholder="0"
            />
          </label>
        </div>

        {/* Pricing Insight Card */}
        {mrp > 0 ? (
          <div className="flex items-center justify-between rounded-2xl border border-emerald-500/20 bg-emerald-50/50 p-3.5 dark:bg-emerald-950/20">
            <div className="flex items-center gap-2">
              <Tag className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
              <span className="text-xs text-stone-600 dark:text-stone-300">
                Customers pay:{" "}
                <strong className="text-emerald-600 dark:text-emerald-400">
                  ₹{sellingPrice.toLocaleString("en-IN")}
                </strong>
              </span>
            </div>
            {discountPercent > 0 ? (
              <span className="rounded-full bg-emerald-600 px-2.5 py-0.5 text-xs font-bold text-white">
                {discountPercent}% OFF (Save ₹{savings.toLocaleString("en-IN")})
              </span>
            ) : (
              <span className="text-xs text-stone-400">No discount applied</span>
            )}
          </div>
        ) : null}
      </div>

      {/* Media / Image Upload Section */}
      <div className="space-y-3">
        <h4 className="text-xs font-semibold uppercase tracking-wider text-stone-400 dark:text-stone-500">
          Product Media
        </h4>

        <div
          onDragEnter={(event) => {
            event.preventDefault();
            setIsDraggingImage(true);
          }}
          onDragOver={(event) => event.preventDefault()}
          onDragLeave={(event) => {
            event.preventDefault();
            setIsDraggingImage(false);
          }}
          onDrop={handleImageDrop}
          onClick={() => fileInputRef.current?.click()}
          onKeyDown={(event) => {
            if (event.key === "Enter" || event.key === " ") fileInputRef.current?.click();
          }}
          role="button"
          tabIndex={0}
          className={`flex min-h-40 cursor-pointer flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed p-4 text-center transition-all ${
            isDraggingImage
              ? "border-emerald-500 bg-emerald-500/5"
              : "border-stone-300 hover:border-emerald-500/60 dark:border-stone-800 dark:hover:border-emerald-500/50"
          }`}
        >
          {previewUrl ? (
            <div className="relative group">
              <img
                src={previewUrl}
                alt="Product preview"
                className="h-28 w-28 rounded-2xl object-cover shadow-sm border border-stone-200 dark:border-stone-800"
              />
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  clearSelectedImage();
                }}
                className="absolute -top-2 -right-2 rounded-full bg-rose-600 p-1 text-white shadow-md hover:bg-rose-700"
                title="Remove image"
              >
                <X className="h-3 w-3" />
              </button>
            </div>
          ) : (
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-stone-100 text-stone-400 dark:bg-stone-900">
              <UploadCloud className="h-6 w-6" />
            </div>
          )}

          <div className="space-y-1">
            <p className="text-xs font-medium text-stone-700 dark:text-stone-300">
              {imageFile ? imageFile.name : "Drag & drop an image here, or click to browse"}
            </p>
            <p className="text-[11px] text-stone-400 dark:text-stone-500">
              JPG, PNG, or WebP • Max 10 MB • Auto-optimized to 512×512
            </p>
          </div>

          <input
            ref={fileInputRef}
            type="file"
            accept=".jpg,.jpeg,.png,.webp,image/jpeg,image/png,image/webp"
            onChange={(event) => handleFileChange(event.target.files?.[0])}
            className="sr-only"
          />
        </div>
        {imageError ? <p className="text-xs text-rose-600">{imageError}</p> : null}

        <label className="block space-y-1 text-xs text-stone-500">
          <span>Or provide an external Image URL (optional)</span>
          <input
            value={imageInput}
            onChange={(event) => setImageInput(event.target.value)}
            className="w-full rounded-2xl border border-stone-200 bg-white px-3.5 py-2 text-xs outline-none transition-all focus:border-emerald-500 dark:border-stone-800 dark:bg-stone-950"
            placeholder="https://example.com/product-image.jpg"
          />
        </label>
      </div>

      {/* Visibility & Settings */}
      <div className="space-y-3 rounded-2xl border border-stone-200/70 bg-stone-50/50 p-4 dark:border-stone-800/70 dark:bg-stone-900/30">
        <h4 className="text-xs font-semibold uppercase tracking-wider text-stone-400 dark:text-stone-500">
          Visibility & Publishing
        </h4>

        <div className="grid gap-3 sm:grid-cols-2">
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={values.isPublished}
              onChange={(event) => setValues((current) => ({ ...current, isPublished: event.target.checked }))}
              className="h-4 w-4 rounded border-stone-300 text-emerald-600 focus:ring-emerald-500 dark:border-stone-700"
            />
            <div>
              <p className="text-xs font-semibold text-stone-800 dark:text-stone-200">Publish Product</p>
              <p className="text-[11px] text-stone-500">Make live for customers immediately</p>
            </div>
          </label>

          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={values.isActive}
              onChange={(event) => setValues((current) => ({ ...current, isActive: event.target.checked }))}
              className="h-4 w-4 rounded border-stone-300 text-emerald-600 focus:ring-emerald-500 dark:border-stone-700"
            />
            <div>
              <p className="text-xs font-semibold text-stone-800 dark:text-stone-200">Active in Catalog</p>
              <p className="text-[11px] text-stone-500">Uncheck to hide without deleting</p>
            </div>
          </label>
        </div>
      </div>
    </form>
  );
}
