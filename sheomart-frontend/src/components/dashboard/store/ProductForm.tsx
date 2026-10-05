"use client";

import { useEffect, useRef, useState, type DragEvent, type FormEvent } from "react";
import { UploadCloud, X, Sparkles, Tag, Check, AlertCircle, Scale, Droplets, Package, Plus, Trash2 } from "lucide-react";
import type { CategoryItem, ProductVariant } from "@/types/marketplace";

export interface ProductFormValues {
  name: string;
  description: string;
  brand: string;
  sku: string;
  price: number;
  discountPrice: number;
  quantity?: number;
  categoryId: string;
  sellingType?: "PIECE" | "WEIGHT" | "VOLUME";
  baseUnit?: string;
  unitLabel?: string;
  minQuantity?: number;
  stepQuantity?: number;
  allowCustomQuantity?: boolean;
  stockTrackingMode?: "SEPARATE" | "SHARED";
  hasNutritionalInfo?: boolean;
  nutritionalInfo?: {
    servingSize?: string;
    energy?: string;
    protein?: string;
    carbs?: string;
    fats?: string;
  } | null;
  variants?: ProductVariant[];
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
  sellingType: "PIECE",
  baseUnit: "piece",
  unitLabel: "",
  minQuantity: 1,
  stepQuantity: 1,
  allowCustomQuantity: false,
  stockTrackingMode: "SEPARATE",
  hasNutritionalInfo: false,
  nutritionalInfo: null,
  variants: [],
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
    sellingType: initialValues?.sellingType ?? "PIECE",
    baseUnit: initialValues?.baseUnit ?? "piece",
    unitLabel: initialValues?.unitLabel ?? "",
    minQuantity: initialValues?.minQuantity ?? 1,
    stepQuantity: initialValues?.stepQuantity ?? 1,
    allowCustomQuantity: initialValues?.allowCustomQuantity ?? false,
    stockTrackingMode: initialValues?.stockTrackingMode ?? "SEPARATE",
    hasNutritionalInfo: initialValues?.hasNutritionalInfo ?? false,
    nutritionalInfo: initialValues?.nutritionalInfo ?? null,
    variants: Array.isArray(initialValues?.variants) ? initialValues.variants : [],
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

    const finalQuantity =
      values.stockTrackingMode === "SEPARATE" && (values.variants ?? []).length > 0
        ? (values.variants ?? []).reduce((sum, v) => sum + (v.stock ?? 0), 0)
        : toNumber(values.quantity !== undefined ? values.quantity : (initialValues?.quantity ?? 0));

    onSubmit({
      ...values,
      name: values.name.trim(),
      sku: values.sku.trim().toUpperCase(),
      brand: values.brand.trim(),
      price: mrp,
      discountPrice,
      quantity: finalQuantity,
      hasNutritionalInfo: values.hasNutritionalInfo ?? false,
      nutritionalInfo: values.hasNutritionalInfo ? values.nutritionalInfo : null,
      images,
      imageUrl: imageFile ? undefined : imageInput !== initialImageInput ? images[0] : undefined,
      imageFile,
    });
  };

  const handleSellingTypeChange = (type: "PIECE" | "WEIGHT" | "VOLUME") => {
    let defaultBaseUnit = "piece";
    let defaultUnitLabel = "";
    if (type === "WEIGHT") {
      defaultBaseUnit = "kg";
      defaultUnitLabel = "per kg";
    } else if (type === "VOLUME") {
      defaultBaseUnit = "L";
      defaultUnitLabel = "per Liter";
    }
    setValues((prev) => ({
      ...prev,
      sellingType: type,
      baseUnit: defaultBaseUnit,
      unitLabel: defaultUnitLabel,
    }));
  };

  const handleAddPresetVariant = (preset: { label: string; unit: string; value: number; multiplier: number }) => {
    const calculatedPrice = Math.round(mrp * preset.multiplier);
    const calculatedDiscountPrice = discountPrice > 0 ? Math.round(discountPrice * preset.multiplier) : 0;
    const newVariant: ProductVariant = {
      variantId: `var_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
      label: preset.label,
      unit: preset.unit,
      value: preset.value,
      price: calculatedPrice,
      discountPrice: calculatedDiscountPrice,
      sku: `${values.sku ? `${values.sku}-` : ""}${preset.label.replace(/\s+/g, "").toUpperCase()}`,
    };

    setValues((prev) => {
      const existing = prev.variants ?? [];
      if (existing.some((v) => v.label.toLowerCase() === preset.label.toLowerCase())) {
        return prev;
      }
      return {
        ...prev,
        variants: [...existing, newVariant],
      };
    });
  };

  const handleAddCustomVariant = () => {
    const isWeight = values.sellingType === "WEIGHT";
    const isVolume = values.sellingType === "VOLUME";
    const defaultUnit = isWeight ? "gm" : isVolume ? "ml" : "piece";
    const newVariant: ProductVariant = {
      variantId: `var_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
      label: isWeight ? "500 gm" : isVolume ? "500 ml" : "1 pack",
      unit: defaultUnit,
      value: 500,
      price: mrp > 0 ? mrp : 0,
      discountPrice: discountPrice > 0 ? discountPrice : 0,
    };
    setValues((prev) => ({
      ...prev,
      variants: [...(prev.variants ?? []), newVariant],
    }));
  };

  const handleUpdateVariant = (index: number, patch: Partial<ProductVariant>) => {
    setValues((prev) => {
      const updated = [...(prev.variants ?? [])];
      if (updated[index]) {
        updated[index] = { ...updated[index], ...patch };
      }
      return { ...prev, variants: updated };
    });
  };

  const handleRemoveVariant = (index: number) => {
    setValues((prev) => ({
      ...prev,
      variants: (prev.variants ?? []).filter((_, idx) => idx !== index),
    }));
  };

  return (
    <form id={formId} className="space-y-6" onSubmit={handleSubmit}>
      {formError ? (
        <div className="flex items-center gap-2 rounded-2xl border border-rose-200 bg-rose-50 p-3.5 text-xs font-medium text-rose-700 dark:border-rose-900/50 dark:bg-rose-950/40 dark:text-rose-400">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>{formError}</span>
        </div>
      ) : null}

      {/* Selling Type & Measurement Units Section */}
      <div className="space-y-4 rounded-2xl border border-emerald-500/20 bg-emerald-50/30 p-4 dark:border-emerald-500/10 dark:bg-emerald-950/10">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-emerald-800 dark:text-emerald-400">
              Selling Type & Measurement Units
            </h4>
            <p className="text-[11px] text-stone-500">
              Configure how this item is measured, priced, and packaged (e.g. per kg, per Liter, or portions like 250g, 500g).
            </p>
          </div>
        </div>

        {/* Selling Type Radio Tabs */}
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
          <button
            type="button"
            onClick={() => handleSellingTypeChange("PIECE")}
            className={`flex items-center gap-2.5 rounded-xl border p-3 text-left transition ${
              values.sellingType === "PIECE"
                ? "border-emerald-500 bg-white shadow-sm ring-2 ring-emerald-500/20 dark:bg-stone-900"
                : "border-stone-200 bg-white/50 hover:bg-white dark:border-stone-800 dark:bg-stone-950/50"
            }`}
          >
            <div className={`rounded-lg p-2 ${values.sellingType === "PIECE" ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300" : "bg-stone-100 text-stone-500 dark:bg-stone-900"}`}>
              <Package className="h-4 w-4" />
            </div>
            <div>
              <p className="text-xs font-bold text-stone-900 dark:text-stone-100">Per Piece / Pack</p>
              <p className="text-[10px] text-stone-500">Packaged goods, items</p>
            </div>
          </button>

          <button
            type="button"
            onClick={() => handleSellingTypeChange("WEIGHT")}
            className={`flex items-center gap-2.5 rounded-xl border p-3 text-left transition ${
              values.sellingType === "WEIGHT"
                ? "border-emerald-500 bg-white shadow-sm ring-2 ring-emerald-500/20 dark:bg-stone-900"
                : "border-stone-200 bg-white/50 hover:bg-white dark:border-stone-800 dark:bg-stone-950/50"
            }`}
          >
            <div className={`rounded-lg p-2 ${values.sellingType === "WEIGHT" ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300" : "bg-stone-100 text-stone-500 dark:bg-stone-900"}`}>
              <Scale className="h-4 w-4" />
            </div>
            <div>
              <p className="text-xs font-bold text-stone-900 dark:text-stone-100">By Weight (Solid)</p>
              <p className="text-[10px] text-stone-500">Rice, Dal, Veggies, Fruits</p>
            </div>
          </button>

          <button
            type="button"
            onClick={() => handleSellingTypeChange("VOLUME")}
            className={`flex items-center gap-2.5 rounded-xl border p-3 text-left transition ${
              values.sellingType === "VOLUME"
                ? "border-emerald-500 bg-white shadow-sm ring-2 ring-emerald-500/20 dark:bg-stone-900"
                : "border-stone-200 bg-white/50 hover:bg-white dark:border-stone-800 dark:bg-stone-950/50"
            }`}
          >
            <div className={`rounded-lg p-2 ${values.sellingType === "VOLUME" ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300" : "bg-stone-100 text-stone-500 dark:bg-stone-900"}`}>
              <Droplets className="h-4 w-4" />
            </div>
            <div>
              <p className="text-xs font-bold text-stone-900 dark:text-stone-100">By Volume (Liquid)</p>
              <p className="text-[10px] text-stone-500">Oil, Milk, Juice, Ghee</p>
            </div>
          </button>
        </div>

        {/* Base Unit Details */}
        <div className="grid gap-3 sm:grid-cols-2">
          <label className="space-y-1.5 text-xs font-medium text-stone-700 dark:text-stone-300">
            <span>Base Measurement Unit</span>
            <select
              value={values.baseUnit}
              onChange={(e) => setValues((prev) => ({ ...prev, baseUnit: e.target.value }))}
              className="w-full rounded-xl border border-stone-200 bg-white px-3 py-2 text-xs font-medium outline-none dark:border-stone-800 dark:bg-stone-950"
            >
              {values.sellingType === "WEIGHT" ? (
                <>
                  <option value="kg">Kilogram (kg)</option>
                  <option value="gm">Gram (gm)</option>
                  <option value="quintal">Quintal (q)</option>
                </>
              ) : values.sellingType === "VOLUME" ? (
                <>
                  <option value="L">Liter (L)</option>
                  <option value="ml">Milliliter (ml)</option>
                </>
              ) : (
                <>
                  <option value="piece">Piece (pc)</option>
                  <option value="pack">Pack</option>
                  <option value="box">Box</option>
                  <option value="dozen">Dozen</option>
                </>
              )}
            </select>
          </label>

          <label className="space-y-1.5 text-xs font-medium text-stone-700 dark:text-stone-300">
            <span>Price Label Display (e.g. &quot;₹60 / kg&quot;)</span>
            <input
              value={values.unitLabel}
              onChange={(e) => setValues((prev) => ({ ...prev, unitLabel: e.target.value }))}
              placeholder={values.sellingType === "WEIGHT" ? "e.g. per kg" : values.sellingType === "VOLUME" ? "e.g. per Liter" : "e.g. per pack"}
              className="w-full rounded-xl border border-stone-200 bg-white px-3 py-2 text-xs outline-none dark:border-stone-800 dark:bg-stone-950"
            />
          </label>
        </div>

        {/* Quick Portion Generator for Weight / Volume */}
        {values.sellingType !== "PIECE" && (
          <div className="space-y-2 pt-1 border-t border-emerald-500/10">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-stone-700 dark:text-stone-300">
                Quick Pack Size Presets:
              </span>
              <span className="text-[11px] text-stone-400">
                Auto-calculates price based on base price (₹{mrp || 0})
              </span>
            </div>
            <div className="flex flex-wrap gap-2">
              {values.sellingType === "WEIGHT" ? (
                <>
                  {[
                    { label: "250 gm", unit: "gm", value: 250, multiplier: 0.25 },
                    { label: "500 gm", unit: "gm", value: 500, multiplier: 0.5 },
                    { label: "1 kg", unit: "kg", value: 1, multiplier: 1 },
                    { label: "2 kg", unit: "kg", value: 2, multiplier: 2 },
                    { label: "5 kg", unit: "kg", value: 5, multiplier: 5 },
                  ].map((preset) => (
                    <button
                      key={preset.label}
                      type="button"
                      onClick={() => handleAddPresetVariant(preset)}
                      className="inline-flex items-center gap-1 rounded-full border border-emerald-500/30 bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-800 hover:bg-emerald-100 dark:bg-emerald-950/40 dark:text-emerald-300"
                    >
                      <Plus className="h-3 w-3" />
                      {preset.label}
                    </button>
                  ))}
                </>
              ) : (
                <>
                  {[
                    { label: "200 ml", unit: "ml", value: 200, multiplier: 0.2 },
                    { label: "250 ml", unit: "ml", value: 250, multiplier: 0.25 },
                    { label: "500 ml", unit: "ml", value: 500, multiplier: 0.5 },
                    { label: "1 L", unit: "L", value: 1, multiplier: 1 },
                    { label: "2 L", unit: "L", value: 2, multiplier: 2 },
                    { label: "5 L", unit: "L", value: 5, multiplier: 5 },
                  ].map((preset) => (
                    <button
                      key={preset.label}
                      type="button"
                      onClick={() => handleAddPresetVariant(preset)}
                      className="inline-flex items-center gap-1 rounded-full border border-emerald-500/30 bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-800 hover:bg-emerald-100 dark:bg-emerald-950/40 dark:text-emerald-300"
                    >
                      <Plus className="h-3 w-3" />
                      {preset.label}
                    </button>
                  ))}
                </>
              )}
            </div>
          </div>
        )}

        {/* Inventory Tracking Mode for Packs / Sizes */}
        <div className="rounded-xl border border-stone-200 bg-white/70 p-3.5 space-y-2 dark:border-stone-800 dark:bg-stone-900/40">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-stone-800 dark:text-stone-200">
              Inventory Tracking Mode:
            </span>
            <span className="text-[11px] text-stone-400">
              {values.stockTrackingMode === "SEPARATE" ? "Individual Stock per Pack" : "Shared Master Stock"}
            </span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => setValues((prev) => ({ ...prev, stockTrackingMode: "SEPARATE" }))}
              className={`rounded-xl border p-2.5 text-left transition ${
                values.stockTrackingMode === "SEPARATE"
                  ? "border-emerald-500 bg-emerald-50/70 ring-2 ring-emerald-500/20 dark:bg-emerald-950/40"
                  : "border-stone-200 bg-white hover:bg-stone-50 dark:border-stone-800 dark:bg-stone-900"
              }`}
            >
              <p className="text-xs font-bold text-stone-900 dark:text-stone-100">Separate Stock per Pack</p>
              <p className="text-[10px] text-stone-500">Each pack size has its own stock count (e.g. 70g, 140g, 280g packs)</p>
            </button>
            <button
              type="button"
              onClick={() => setValues((prev) => ({ ...prev, stockTrackingMode: "SHARED" }))}
              className={`rounded-xl border p-2.5 text-left transition ${
                values.stockTrackingMode === "SHARED"
                  ? "border-emerald-500 bg-emerald-50/70 ring-2 ring-emerald-500/20 dark:bg-emerald-950/40"
                  : "border-stone-200 bg-white hover:bg-stone-50 dark:border-stone-800 dark:bg-stone-900"
              }`}
            >
              <p className="text-xs font-bold text-stone-900 dark:text-stone-100">Shared Base Stock (Bundle / Multi-pack)</p>
              <p className="text-[10px] text-stone-500">Packs draw from total stock using a multiplier (e.g. 1-pack, 3-pack combo)</p>
            </button>
          </div>
        </div>

        {/* Portions / Variants List */}
        <div className="space-y-2 pt-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-stone-800 dark:text-stone-200">
              Configured Portions / Sizes ({(values.variants ?? []).length})
            </span>
            <button
              type="button"
              onClick={handleAddCustomVariant}
              className="inline-flex items-center gap-1 text-xs font-bold text-emerald-600 hover:text-emerald-700 dark:text-emerald-400"
            >
              <Plus className="h-3.5 w-3.5" />
              Add Custom Size / Portion
            </button>
          </div>

          {(values.variants ?? []).length === 0 ? (
            <div className="rounded-xl border border-dashed border-stone-300 bg-white/40 p-4 text-center text-xs text-stone-500 dark:border-stone-800 dark:bg-stone-950/40">
              No portion variants added yet. Customers will buy at base price. Click a quick preset above or &quot;Add Custom Size&quot; to offer options like 250gm, 500gm, 1kg!
            </div>
          ) : (
            <div className="space-y-2">
              {(values.variants ?? []).map((variant, index) => {
                const availableBundles =
                  values.stockTrackingMode === "SHARED" && variant.packQuantity && variant.packQuantity > 0
                    ? Math.floor((values.quantity ?? 0) / variant.packQuantity)
                    : 0;

                return (
                  <div
                    key={variant.variantId || index}
                    className="flex flex-wrap items-center gap-2 rounded-xl border border-stone-200 bg-white p-2.5 text-xs shadow-xs dark:border-stone-800 dark:bg-stone-950"
                  >
                    <div className="min-w-28 flex-1">
                      <span className="text-[10px] text-stone-400">Label</span>
                      <input
                        value={variant.label}
                        onChange={(e) => handleUpdateVariant(index, { label: e.target.value })}
                        placeholder="e.g. 500 gm"
                        className="w-full rounded-lg border border-stone-200 px-2 py-1 font-semibold dark:border-stone-700 dark:bg-stone-900"
                      />
                    </div>

                    <div className="w-20">
                      <span className="text-[10px] text-stone-400">Unit</span>
                      <input
                        value={variant.unit}
                        onChange={(e) => handleUpdateVariant(index, { unit: e.target.value })}
                        placeholder="gm, kg"
                        className="w-full rounded-lg border border-stone-200 px-2 py-1 dark:border-stone-700 dark:bg-stone-900"
                      />
                    </div>

                    <div className="w-24">
                      <span className="text-[10px] text-stone-400">MRP (₹)</span>
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        value={variant.price || ""}
                        onChange={(e) => handleUpdateVariant(index, { price: toNumber(e.target.value) })}
                        placeholder="0"
                        className="w-full rounded-lg border border-stone-200 px-2 py-1 font-bold dark:border-stone-700 dark:bg-stone-900"
                      />
                    </div>

                    <div className="w-28">
                      <span className="text-[10px] text-stone-400">Selling Price (₹)</span>
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        value={variant.discountPrice || ""}
                        onChange={(e) => handleUpdateVariant(index, { discountPrice: toNumber(e.target.value) })}
                        placeholder="Optional"
                        className="w-full rounded-lg border border-emerald-300 px-2 py-1 font-bold text-emerald-700 dark:border-emerald-800 dark:bg-stone-900 dark:text-emerald-400"
                      />
                    </div>

                    {values.stockTrackingMode === "SEPARATE" ? (
                      <div className="w-24">
                        <span className="text-[10px] text-stone-400">Stock (Units)</span>
                        <input
                          type="number"
                          min="0"
                          step="1"
                          value={variant.stock ?? 0}
                          onChange={(e) => handleUpdateVariant(index, { stock: toNumber(e.target.value) })}
                          placeholder="0"
                          className="w-full rounded-lg border border-stone-200 px-2 py-1 font-semibold dark:border-stone-700 dark:bg-stone-900"
                        />
                      </div>
                    ) : (
                      <div className="w-24">
                        <span className="text-[10px] text-stone-400">Items/Pack</span>
                        <input
                          type="number"
                          min="1"
                          step="1"
                          value={variant.packQuantity ?? 1}
                          onChange={(e) => handleUpdateVariant(index, { packQuantity: toNumber(e.target.value) || 1 })}
                          placeholder="1"
                          className="w-full rounded-lg border border-stone-200 px-2 py-1 font-semibold dark:border-stone-700 dark:bg-stone-900"
                        />
                      </div>
                    )}

                    {values.stockTrackingMode === "SHARED" && (
                      <div className="flex flex-col justify-end text-[10px] text-stone-500">
                        <span>Available:</span>
                        <strong className="text-emerald-600 dark:text-emerald-400">{availableBundles} bundles</strong>
                      </div>
                    )}

                    <button
                      type="button"
                      onClick={() => handleRemoveVariant(index)}
                      className="mt-3 rounded-lg p-1.5 text-stone-400 hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-950/40"
                      title="Remove portion"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Custom Quantity Relaxation */}
        {values.sellingType !== "PIECE" && (
          <div className="rounded-xl border border-emerald-500/20 bg-white/70 p-3.5 space-y-3 dark:border-stone-800 dark:bg-stone-900/40">
            <label className="flex items-center gap-2.5 cursor-pointer">
              <input
                type="checkbox"
                checked={values.allowCustomQuantity}
                onChange={(e) => setValues((prev) => ({ ...prev, allowCustomQuantity: e.target.checked }))}
                className="h-4 w-4 rounded border-stone-300 text-emerald-600 focus:ring-emerald-500 dark:border-stone-700"
              />
              <div>
                <p className="text-xs font-semibold text-stone-800 dark:text-stone-200">
                  Allow Custom Quantity Selection
                </p>
                <p className="text-[11px] text-stone-500">
                  Allow buyers to specify exact amount (e.g. 0.5 {values.baseUnit}, 1.5 {values.baseUnit}) instead of only predefined portions
                </p>
              </div>
            </label>

            {values.allowCustomQuantity && (
              <div className="grid grid-cols-2 gap-3 pt-2 border-t border-stone-100 dark:border-stone-800">
                <label className="space-y-1 text-xs font-medium text-stone-700 dark:text-stone-300">
                  <span>Minimum Order ({values.baseUnit})</span>
                  <input
                    type="number"
                    min="0.01"
                    step="0.01"
                    value={values.minQuantity ?? 1}
                    onChange={(e) => setValues((prev) => ({ ...prev, minQuantity: toNumber(e.target.value) || 0.01 }))}
                    className="w-full rounded-lg border border-stone-200 px-2.5 py-1.5 text-xs outline-none dark:border-stone-700 dark:bg-stone-900"
                  />
                </label>
                <label className="space-y-1 text-xs font-medium text-stone-700 dark:text-stone-300">
                  <span>Increment Step ({values.baseUnit})</span>
                  <input
                    type="number"
                    min="0.01"
                    step="0.01"
                    value={values.stepQuantity ?? 1}
                    onChange={(e) => setValues((prev) => ({ ...prev, stepQuantity: toNumber(e.target.value) || 0.01 }))}
                    className="w-full rounded-lg border border-stone-200 px-2.5 py-1.5 text-xs outline-none dark:border-stone-700 dark:bg-stone-900"
                  />
                </label>
              </div>
            )}
          </div>
        )}
      </div>

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

      {/* Nutritional Information (Optional) */}
      <div className="rounded-2xl border border-stone-200 bg-stone-50/60 p-4 space-y-4 dark:border-stone-800 dark:bg-stone-900/30">
        <label className="flex items-start gap-3 cursor-pointer select-none">
          <input
            type="checkbox"
            checked={values.hasNutritionalInfo ?? false}
            onChange={(e) =>
              setValues((prev) => ({
                ...prev,
                hasNutritionalInfo: e.target.checked,
                nutritionalInfo: e.target.checked
                  ? prev.nutritionalInfo || {
                      servingSize: "Approx per 100g",
                      energy: "",
                      protein: "",
                      carbs: "",
                      fats: "",
                    }
                  : null,
              }))
            }
            className="mt-0.5 h-4 w-4 rounded border-stone-300 text-emerald-600 focus:ring-emerald-500 dark:border-stone-700"
          />
          <div>
            <p className="text-xs font-bold text-stone-900 dark:text-stone-100">
              Include Nutritional Information / Facts
            </p>
            <p className="text-[11px] text-stone-500">
              Optional. Enable for food, beverages, and grocery items. If left unticked, a Store Quality &amp; Trust Guarantee badge is shown on the product page instead.
            </p>
          </div>
        </label>

        {values.hasNutritionalInfo && (
          <div className="pt-3 border-t border-stone-200/80 dark:border-stone-800 space-y-3">
            <label className="block space-y-1 text-xs font-medium text-stone-700 dark:text-stone-300">
              <span>Serving Size / Reference Basis</span>
              <input
                type="text"
                value={values.nutritionalInfo?.servingSize ?? "Approx per 100g"}
                onChange={(e) =>
                  setValues((prev) => ({
                    ...prev,
                    nutritionalInfo: {
                      ...(prev.nutritionalInfo || {}),
                      servingSize: e.target.value,
                    },
                  }))
                }
                placeholder="e.g. Approx per 100g, Per 100ml, 1 portion (30g)"
                className="w-full rounded-xl border border-stone-200 bg-white px-3 py-2 text-xs outline-none focus:border-emerald-500 dark:border-stone-700 dark:bg-stone-900"
              />
            </label>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <label className="space-y-1 text-xs font-medium text-stone-700 dark:text-stone-300">
                <span>Energy / Calories</span>
                <input
                  type="text"
                  value={values.nutritionalInfo?.energy ?? ""}
                  onChange={(e) =>
                    setValues((prev) => ({
                      ...prev,
                      nutritionalInfo: {
                        ...(prev.nutritionalInfo || {}),
                        energy: e.target.value,
                      },
                    }))
                  }
                  placeholder="e.g. 120 kcal"
                  className="w-full rounded-xl border border-stone-200 bg-white px-3 py-1.5 text-xs outline-none focus:border-emerald-500 dark:border-stone-700 dark:bg-stone-900"
                />
              </label>

              <label className="space-y-1 text-xs font-medium text-stone-700 dark:text-stone-300">
                <span>Protein</span>
                <input
                  type="text"
                  value={values.nutritionalInfo?.protein ?? ""}
                  onChange={(e) =>
                    setValues((prev) => ({
                      ...prev,
                      nutritionalInfo: {
                        ...(prev.nutritionalInfo || {}),
                        protein: e.target.value,
                      },
                    }))
                  }
                  placeholder="e.g. 3.2 g"
                  className="w-full rounded-xl border border-stone-200 bg-white px-3 py-1.5 text-xs outline-none focus:border-emerald-500 dark:border-stone-700 dark:bg-stone-900"
                />
              </label>

              <label className="space-y-1 text-xs font-medium text-stone-700 dark:text-stone-300">
                <span>Carbohydrates</span>
                <input
                  type="text"
                  value={values.nutritionalInfo?.carbs ?? ""}
                  onChange={(e) =>
                    setValues((prev) => ({
                      ...prev,
                      nutritionalInfo: {
                        ...(prev.nutritionalInfo || {}),
                        carbs: e.target.value,
                      },
                    }))
                  }
                  placeholder="e.g. 18.5 g"
                  className="w-full rounded-xl border border-stone-200 bg-white px-3 py-1.5 text-xs outline-none focus:border-emerald-500 dark:border-stone-700 dark:bg-stone-900"
                />
              </label>

              <label className="space-y-1 text-xs font-medium text-stone-700 dark:text-stone-300">
                <span>Fats</span>
                <input
                  type="text"
                  value={values.nutritionalInfo?.fats ?? ""}
                  onChange={(e) =>
                    setValues((prev) => ({
                      ...prev,
                      nutritionalInfo: {
                        ...(prev.nutritionalInfo || {}),
                        fats: e.target.value,
                      },
                    }))
                  }
                  placeholder="e.g. 1.1 g"
                  className="w-full rounded-xl border border-stone-200 bg-white px-3 py-1.5 text-xs outline-none focus:border-emerald-500 dark:border-stone-700 dark:bg-stone-900"
                />
              </label>
            </div>
          </div>
        )}
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
            <span>
              {values.stockTrackingMode === "SEPARATE" && (values.variants ?? []).length > 0
                ? "Total Stock (Sum of pack stocks)"
                : isEdit
                  ? "Stock Quantity"
                  : "Initial Stock Quantity"}
            </span>
            <input
              type="number"
              min="0"
              step="1"
              disabled={values.stockTrackingMode === "SEPARATE" && (values.variants ?? []).length > 0}
              value={
                values.stockTrackingMode === "SEPARATE" && (values.variants ?? []).length > 0
                  ? (values.variants ?? []).reduce((sum, v) => sum + (v.stock ?? 0), 0)
                  : (values.quantity ?? 0)
              }
              onChange={(event) =>
                setValues((current) => ({ ...current, quantity: toNumber(event.target.value) }))
              }
              className={`w-full rounded-2xl border border-stone-200 bg-white px-3.5 py-2.5 text-sm outline-none transition-all focus:border-emerald-500 dark:border-stone-800 dark:bg-stone-950 ${
                values.stockTrackingMode === "SEPARATE" && (values.variants ?? []).length > 0
                  ? "bg-stone-100 font-bold text-stone-700 dark:bg-stone-900 dark:text-stone-300 cursor-not-allowed"
                  : ""
              }`}
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
