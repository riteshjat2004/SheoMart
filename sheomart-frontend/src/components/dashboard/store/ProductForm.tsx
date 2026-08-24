"use client";

import { useEffect, useRef, useState, type DragEvent, type FormEvent } from "react";
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
}

interface ProductFormProps {
  initialValues?: Partial<ProductFormValues>;
  categories: CategoryItem[];
  onSubmit: (values: ProductFormValues) => void;
  formId: string;
}

const emptyValues: ProductFormValues = {
  name: "",
  description: "",
  brand: "",
  sku: "",
  price: 0,
  discountPrice: 0,
  categoryId: "",
  images: [],
  isPublished: false,
  isActive: true,
};

function toNumber(value: string) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

function parseImageUrls(value: string) {
  return Array.from(new Set(value.split(/[,\n]+/).map((image) => image.trim()).filter(Boolean)));
}

export function ProductForm({ initialValues, categories, onSubmit, formId }: ProductFormProps) {
  const initialImages = initialValues?.images ?? [];
  const [values, setValues] = useState<ProductFormValues>({
    ...emptyValues,
    ...initialValues,
    images: initialImages,
  });
  const [imageInput, setImageInput] = useState(initialImages.join("\n"));
  const [imageFile, setImageFile] = useState<File | undefined>();
  const initialImageInput = initialImages.join("\n");
  const [imageError, setImageError] = useState("");
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
    if (!["image/jpeg", "image/jpg", "image/png"].includes(file.type)) {
      setImageError("Only JPG, JPEG, and PNG images are allowed.");
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

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
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
      price: toNumber(String(values.price)),
      discountPrice: toNumber(String(values.discountPrice)),
      images,
      imageUrl: imageFile ? undefined : imageInput !== initialImageInput ? images[0] : undefined,
      imageFile,
    });
  };

  return (
    <form id={formId} className="space-y-4" onSubmit={handleSubmit}>
      <div className="grid gap-4 md:grid-cols-2">
        <label className="space-y-2 text-sm text-stone-700 dark:text-stone-300">
          <span className="font-medium">Product name</span>
          <input
            required
            value={values.name}
            onChange={(event) => setValues((current) => ({ ...current, name: event.target.value }))}
            className="w-full rounded-2xl border border-stone-200 bg-white px-3 py-2 outline-none ring-0 focus:border-emerald-500 dark:border-stone-800 dark:bg-stone-950"
            placeholder="e.g. Fresh Mango"
          />
        </label>

        <label className="space-y-2 text-sm text-stone-700 dark:text-stone-300">
          <span className="font-medium">SKU</span>
          <input
            required
            value={values.sku}
            onChange={(event) => setValues((current) => ({ ...current, sku: event.target.value }))}
            className="w-full rounded-2xl border border-stone-200 bg-white px-3 py-2 outline-none ring-0 focus:border-emerald-500 dark:border-stone-800 dark:bg-stone-950"
            placeholder="SKU-001"
          />
        </label>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <label className="space-y-2 text-sm text-stone-700 dark:text-stone-300">
          <span className="font-medium">Category</span>
          <select
            required
            value={values.categoryId}
            onChange={(event) => setValues((current) => ({ ...current, categoryId: event.target.value }))}
            className="w-full rounded-2xl border border-stone-200 bg-white px-3 py-2 outline-none focus:border-emerald-500 dark:border-stone-800 dark:bg-stone-950"
          >
            <option value="">Select a category</option>
            {categories.map((category) => (
              <option key={category.categoryId ?? category._id} value={category.categoryId ?? category._id ?? ""}>
                {category.name}
              </option>
            ))}
          </select>
        </label>

        <label className="space-y-2 text-sm text-stone-700 dark:text-stone-300">
          <span className="font-medium">Brand</span>
          <input
            value={values.brand}
            onChange={(event) => setValues((current) => ({ ...current, brand: event.target.value }))}
            className="w-full rounded-2xl border border-stone-200 bg-white px-3 py-2 outline-none ring-0 focus:border-emerald-500 dark:border-stone-800 dark:bg-stone-950"
            placeholder="Brand name"
          />
        </label>
      </div>

      <label className="block space-y-2 text-sm text-stone-700 dark:text-stone-300">
        <span className="font-medium">Description</span>
        <textarea
          value={values.description}
          onChange={(event) => setValues((current) => ({ ...current, description: event.target.value }))}
          rows={4}
          className="w-full rounded-2xl border border-stone-200 bg-white px-3 py-2 outline-none ring-0 focus:border-emerald-500 dark:border-stone-800 dark:bg-stone-950"
          placeholder="Describe the product"
        />
      </label>

      <div className="space-y-2 text-sm text-stone-700 dark:text-stone-300">
        <span className="font-medium">Upload product image</span>
        <div
          onDragEnter={(event) => { event.preventDefault(); setIsDraggingImage(true); }}
          onDragOver={(event) => event.preventDefault()}
          onDragLeave={(event) => { event.preventDefault(); setIsDraggingImage(false); }}
          onDrop={handleImageDrop}
          onClick={() => fileInputRef.current?.click()}
          onKeyDown={(event) => { if (event.key === "Enter" || event.key === " ") fileInputRef.current?.click(); }}
          role="button"
          tabIndex={0}
          className={`flex min-h-52 cursor-pointer flex-col items-center justify-center gap-4 rounded-2xl border-2 border-dashed p-5 text-center transition-colors ${isDraggingImage ? "border-emerald-500 bg-emerald-50 dark:bg-emerald-950/30" : "border-stone-300 hover:border-emerald-400 dark:border-stone-700 dark:hover:border-emerald-600"}`}
        >
          {previewUrl ? <img src={previewUrl} alt="Product preview" className="h-[120px] w-[120px] rounded-xl object-cover" /> : <div className="flex h-[120px] w-[120px] items-center justify-center rounded-xl bg-stone-100 text-xs text-stone-400 dark:bg-stone-900">No image</div>}
          <div className="min-w-0">
            {imageFile ? <p className="truncate text-sm font-medium text-stone-800 dark:text-stone-100">{imageFile.name}</p> : <p className="text-sm text-stone-600 dark:text-stone-300">Drag and drop an image here, or click to browse</p>}
            <p className="mt-1 text-xs text-stone-500">JPG, JPEG or PNG • Maximum 10 MB • Automatically optimized to 512×512.</p>
            {imageFile || previewUrl ? <button type="button" onClick={(event) => { event.stopPropagation(); fileInputRef.current?.click(); }} className="mt-3 rounded-full bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-emerald-700">Replace image</button> : null}
          </div>
          <input ref={fileInputRef} type="file" accept=".jpg,.jpeg,.png,image/jpeg,image/png" onChange={(event) => handleFileChange(event.target.files?.[0])} className="sr-only" />
        </div>
        {imageError ? <p className="text-xs text-rose-600">{imageError}</p> : null}
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <label className="space-y-2 text-sm text-stone-700 dark:text-stone-300">
          <span className="font-medium">Price</span>
          <input
            type="number"
            min="0"
            step="0.01"
            value={values.price}
            onChange={(event) => setValues((current) => ({ ...current, price: toNumber(event.target.value) }))}
            className="w-full rounded-2xl border border-stone-200 bg-white px-3 py-2 outline-none ring-0 focus:border-emerald-500 dark:border-stone-800 dark:bg-stone-950"
          />
        </label>

        <label className="space-y-2 text-sm text-stone-700 dark:text-stone-300">
          <span className="font-medium">Discount price</span>
          <input
            type="number"
            min="0"
            step="0.01"
            value={values.discountPrice}
            onChange={(event) => setValues((current) => ({ ...current, discountPrice: toNumber(event.target.value) }))}
            className="w-full rounded-2xl border border-stone-200 bg-white px-3 py-2 outline-none ring-0 focus:border-emerald-500 dark:border-stone-800 dark:bg-stone-950"
          />
        </label>

      </div>

      <label className="block space-y-2 text-sm text-stone-700 dark:text-stone-300">
        <span className="font-medium">Image URL (Optional)</span>
        <textarea
          value={imageInput}
          onChange={(event) => setImageInput(event.target.value)}
          rows={4}
          className="w-full rounded-2xl border border-stone-200 bg-white px-3 py-2 outline-none ring-0 focus:border-emerald-500 dark:border-stone-800 dark:bg-stone-950"
          placeholder="Paste an image URL only if you don't want to upload a file."
        />
        <p className="text-xs text-stone-500">Use this only if you want to use an external image URL.</p>
      </label>

      <label className="flex items-center gap-2 text-sm text-stone-700 dark:text-stone-300">
        <input
          type="checkbox"
          checked={values.isPublished}
          onChange={(event) => setValues((current) => ({ ...current, isPublished: event.target.checked }))}
          className="h-4 w-4 rounded border-stone-300 text-emerald-600 focus:ring-emerald-500"
        />
        Publish immediately
      </label>

      <label className="flex items-center gap-2 text-sm text-stone-700 dark:text-stone-300">
        <input
          type="checkbox"
          checked={values.isActive}
          onChange={(event) => setValues((current) => ({ ...current, isActive: event.target.checked }))}
          className="h-4 w-4 rounded border-stone-300 text-emerald-600 focus:ring-emerald-500"
        />
        Visible in catalog
      </label>
    </form>
  );
}
