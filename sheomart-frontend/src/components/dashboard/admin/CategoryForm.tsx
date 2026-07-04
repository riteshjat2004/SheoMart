"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { forwardRef } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";

const categoryFormSchema = z.object({
  name: z.string().trim().min(2, "Category name must be at least 2 characters"),
  description: z.string().max(1000),
  image: z.string().max(500),
  sortOrder: z.number().int().min(0).max(1000),
  isActive: z.boolean(),
});

export type CategoryFormValues = z.infer<typeof categoryFormSchema>;

interface CategoryFormProps {
  initialValues?: Partial<CategoryFormValues>;
  isSubmitting?: boolean;
  onSubmit: (values: CategoryFormValues) => void;
}

export const CategoryForm = forwardRef<HTMLFormElement, CategoryFormProps>(function CategoryForm({ initialValues, isSubmitting = false, onSubmit }, ref) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CategoryFormValues>({
    resolver: zodResolver(categoryFormSchema),
    defaultValues: {
      name: initialValues?.name ?? "",
      description: initialValues?.description ?? "",
      image: initialValues?.image ?? "",
      sortOrder: initialValues?.sortOrder ?? 0,
      isActive: initialValues?.isActive ?? true,
    },
  });

  return (
    <form ref={ref} className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
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
          {...register("image")}
          className="w-full rounded-2xl border border-stone-200 bg-white px-3 py-2 text-sm outline-none transition focus:border-emerald-500 dark:border-stone-800 dark:bg-stone-950"
          placeholder="https://example.com/image.jpg"
        />
      </label>

      <label className="flex items-center gap-3 text-sm font-medium text-stone-700 dark:text-stone-300">
        <input type="checkbox" {...register("isActive")} className="h-4 w-4 rounded border-stone-300 text-emerald-600 focus:ring-emerald-500" />
        <span>Active</span>
      </label>

      <div className="flex justify-end gap-2">
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Saving..." : "Save category"}
        </Button>
      </div>
    </form>
  );
});

CategoryForm.displayName = "CategoryForm";
