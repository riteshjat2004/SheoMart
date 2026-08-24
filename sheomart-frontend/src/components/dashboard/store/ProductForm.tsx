"use client";

import { useState, type FormEvent } from "react";
import type { CategoryItem } from "@/types/marketplace";

export interface ProductFormValues {
  name: string;
  description: string;
  brand: string;
  sku: string;
  price: number;
  discountPrice: number;
  categoryId: string;
  images: string[];
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

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    onSubmit({
      ...values,
      price: toNumber(String(values.price)),
      discountPrice: toNumber(String(values.discountPrice)),
      images: parseImageUrls(imageInput),
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
        <span className="font-medium">Image URLs</span>
        <textarea
          value={imageInput}
          onChange={(event) => setImageInput(event.target.value)}
          rows={4}
          className="w-full rounded-2xl border border-stone-200 bg-white px-3 py-2 outline-none ring-0 focus:border-emerald-500 dark:border-stone-800 dark:bg-stone-950"
          placeholder="Paste one URL per line"
        />
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
