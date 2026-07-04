"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import type { ProfileUser, ProfileUpdatePayload } from "@/types/profile";

interface EditProfileDialogProps {
  user: ProfileUser;
  open: boolean;
  onClose: () => void;
  onSubmit: (values: EditProfileForm) => void;
  isSubmitting?: boolean;
}

const schema = z.object({
  name: z.string().trim().min(2, "Name must be at least 2 characters"),
  mobile: z.string().trim().optional(),
  address: z.string().trim().optional(),
  city: z.string().trim().optional(),
  state: z.string().trim().optional(),
  pincode: z.string().trim().optional(),
});

type EditProfileForm = z.infer<typeof schema>;

export function EditProfileDialog({ user, open, onClose, onSubmit, isSubmitting = false }: EditProfileDialogProps) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<EditProfileForm>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: user.name ?? "",
      mobile: user.mobile ?? "",
      address: user.address ?? "",
      city: user.city ?? "",
      state: user.state ?? "",
      pincode: user.pincode ?? "",
    },
  });

  useEffect(() => {
    if (open) {
      reset({
        name: user.name ?? "",
        mobile: user.mobile ?? "",
        address: user.address ?? "",
        city: user.city ?? "",
        state: user.state ?? "",
        pincode: user.pincode ?? "",
      });
    }
  }, [open, reset, user]);

  if (!open) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-stone-950/60 p-4" role="dialog" aria-modal="true" aria-label="Edit profile">
      <div className="w-full max-w-2xl rounded-[2rem] border border-stone-200 bg-white p-6 shadow-2xl dark:border-stone-800 dark:bg-stone-950">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h3 className="text-lg font-semibold text-stone-900 dark:text-stone-50">Edit your profile</h3>
            <p className="mt-2 text-sm text-stone-600 dark:text-stone-300">Update your basic details and contact information.</p>
          </div>
          <Button type="button" variant="ghost" onClick={onClose}>Close</Button>
        </div>

        <form
            className="mt-6 space-y-4"
            onSubmit={handleSubmit((values) => {
                onSubmit(values);
            })}
        >
          <div className="grid gap-4 md:grid-cols-2">
            <label className="space-y-2 text-sm font-medium text-stone-700 dark:text-stone-300">
              <span>Name</span>
              <input {...register("name")} className="w-full rounded-2xl border border-stone-200 bg-white px-3 py-2 text-sm outline-none transition focus:border-emerald-500 dark:border-stone-800 dark:bg-stone-950" />
              {errors.name ? <p className="text-sm text-rose-600">{errors.name.message}</p> : null}
            </label>
            <label className="space-y-2 text-sm font-medium text-stone-700 dark:text-stone-300">
              <span>Mobile</span>
              <input {...register("mobile")} className="w-full rounded-2xl border border-stone-200 bg-white px-3 py-2 text-sm outline-none transition focus:border-emerald-500 dark:border-stone-800 dark:bg-stone-950" />
            </label>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <label className="space-y-2 text-sm font-medium text-stone-700 dark:text-stone-300">
              <span>Address</span>
              <input {...register("address")} className="w-full rounded-2xl border border-stone-200 bg-white px-3 py-2 text-sm outline-none transition focus:border-emerald-500 dark:border-stone-800 dark:bg-stone-950" />
            </label>
            <label className="space-y-2 text-sm font-medium text-stone-700 dark:text-stone-300">
              <span>City</span>
              <input {...register("city")} className="w-full rounded-2xl border border-stone-200 bg-white px-3 py-2 text-sm outline-none transition focus:border-emerald-500 dark:border-stone-800 dark:bg-stone-950" />
            </label>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <label className="space-y-2 text-sm font-medium text-stone-700 dark:text-stone-300">
              <span>State</span>
              <input {...register("state")} className="w-full rounded-2xl border border-stone-200 bg-white px-3 py-2 text-sm outline-none transition focus:border-emerald-500 dark:border-stone-800 dark:bg-stone-950" />
            </label>
            <label className="space-y-2 text-sm font-medium text-stone-700 dark:text-stone-300">
              <span>Pincode</span>
              <input {...register("pincode")} className="w-full rounded-2xl border border-stone-200 bg-white px-3 py-2 text-sm outline-none transition focus:border-emerald-500 dark:border-stone-800 dark:bg-stone-950" />
            </label>
          </div>

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
            <Button type="submit" disabled={isSubmitting}>{isSubmitting ? "Saving..." : "Save changes"}</Button>
          </div>
        </form>
      </div>
    </div>
  );
}
