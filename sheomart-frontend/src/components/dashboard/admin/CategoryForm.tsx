"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { forwardRef, useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

const categoryFormSchema = z.object({
  name: z.string().trim().min(2, "Category name must be at least 2 characters"),
  description: z.string().max(1000),
  image: z.string().max(500),
  imageUrl: z.string().url("Enter a valid image URL").optional().or(z.literal("")),
  imageFile: z.custom<File>().optional(),
  sortOrder: z.number().int().min(0).max(1000),
  isActive: z.boolean(),
});

export type CategoryFormValues = z.infer<typeof categoryFormSchema>;

function getImageUrl(image: unknown) {
  return typeof image === "string" ? image : image && typeof image === "object" && "url" in image && typeof image.url === "string" ? image.url : "";
}

interface CategoryFormProps {
  initialValues?: Partial<CategoryFormValues>;
  onSubmit: (values: CategoryFormValues) => void;
}

export const CategoryForm = forwardRef<HTMLFormElement, CategoryFormProps>(function CategoryForm({ initialValues, onSubmit }, ref) {
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<CategoryFormValues>({
    resolver: zodResolver(categoryFormSchema),
    defaultValues: {
      name: initialValues?.name ?? "",
      description: initialValues?.description ?? "",
      image: getImageUrl(initialValues?.image),
      imageUrl: getImageUrl(initialValues?.image),
      sortOrder: initialValues?.sortOrder ?? 0,
      isActive: initialValues?.isActive ?? true,
    },
  });
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [imageFile, setImageFile] = useState<File>();
  const [previewUrl, setPreviewUrl] = useState(getImageUrl(initialValues?.image));
  const imageInput = watch("imageUrl") ?? "";

  useEffect(() => {
    if (!imageFile) {
      setPreviewUrl(getImageUrl(initialValues?.image));
      return;
    }
    const objectUrl = URL.createObjectURL(imageFile);
    setPreviewUrl(objectUrl);
    return () => URL.revokeObjectURL(objectUrl);
  }, [imageFile, initialValues?.image]);

  const handleFileChange = (file?: File) => {
    if (!file || !["image/jpeg", "image/jpg", "image/png"].includes(file.type) || file.size > 10 * 1024 * 1024) return;
    setImageFile(file);
  };

  return (
    <form ref={ref} className="space-y-4" onSubmit={handleSubmit((values) => onSubmit({ ...values, imageUrl: imageInput === getImageUrl(initialValues?.image) ? undefined : imageInput, imageFile }))}>
      <div className="grid gap-4 md:grid-cols-2">
        <label className="space-y-2 text-sm font-medium text-stone-700 dark:text-stone-300">
          <span>Category name</span>
          <input
            {...register("name")}
            className="w-full rounded-2xl border border-stone-200 bg-white px-3 py-2 text-sm outline-none ring-0 transition focus:border-emerald-500 dark:border-stone-800 dark:bg-stone-950"
            placeholder="Example: Electronics"
          />
          {errors.name ? <p className="text-sm text-rose-600">{errors.name.message}</p> : null}
        </label>

        <label className="space-y-2 text-sm font-medium text-stone-700 dark:text-stone-300">
          <span>Sort order</span>
          <input
            type="number"
            {...register("sortOrder", { valueAsNumber: true })}
            className="w-full rounded-2xl border border-stone-200 bg-white px-3 py-2 text-sm outline-none ring-0 transition focus:border-emerald-500 dark:border-stone-800 dark:bg-stone-950"
          />
          {errors.sortOrder ? <p className="text-sm text-rose-600">{errors.sortOrder.message}</p> : null}
        </label>
      </div>

      <label className="space-y-2 text-sm font-medium text-stone-700 dark:text-stone-300">
        <span>Description</span>
        <textarea
          {...register("description")}
          rows={4}
          className="w-full rounded-2xl border border-stone-200 bg-white px-3 py-2 text-sm outline-none transition focus:border-emerald-500 dark:border-stone-800 dark:bg-stone-950"
          placeholder="Optional description"
        />
      </label>

      <label className="space-y-2 text-sm font-medium text-stone-700 dark:text-stone-300">
        <span>Image URL</span>
        <input
          {...register("imageUrl")}
          className="w-full rounded-2xl border border-stone-200 bg-white px-3 py-2 text-sm outline-none transition focus:border-emerald-500 dark:border-stone-800 dark:bg-stone-950"
          placeholder="https://example.com/image.jpg"
        />
        <p className="text-xs font-normal text-stone-500">Optional external image URL.</p>
      </label>

      <div className="space-y-3 text-sm font-medium text-stone-700 dark:text-stone-300">
        <span className="block">Upload Category Icon</span>
        {previewUrl ? <img src={previewUrl} alt="Category icon preview" className="h-24 w-24 rounded-xl object-cover" /> : null}
        <input
          ref={fileInputRef}
          type="file"
          accept=".jpg,.jpeg,.png,image/jpeg,image/jpg,image/png"
          onChange={(event) => handleFileChange(event.target.files?.[0])}
          className="block w-full text-sm"
        />
        <p className="text-xs font-normal text-stone-500">JPG, JPEG, or PNG. Maximum 10 MB.</p>
      </div>

      <label className="flex items-center gap-3 text-sm font-medium text-stone-700 dark:text-stone-300">
        <input type="checkbox" {...register("isActive")} className="h-4 w-4 rounded border-stone-300 text-emerald-600 focus:ring-emerald-500" />
        <span>Active</span>
      </label>

    </form>
  );
});

CategoryForm.displayName = "CategoryForm";
