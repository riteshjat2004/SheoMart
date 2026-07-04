"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { AlertCircle, CheckCircle2, Loader2, Store } from "lucide-react";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { createStoreApplication, fetchMyStore } from "@/services/store";
import { useAuthStore } from "@/store/auth-store";
import type { AuthUser } from "@/types/auth";

const sellerApplicationSchema = z.object({
  storeName: z.string().trim().min(2, "Store name must be at least 2 characters"),
  description: z.string().trim().max(1000),
  email: z.string().trim().email("Please enter a valid email"),
  phone: z.string().trim().min(8, "Phone number is required"),
  address: z.string().trim().min(3, "Address is required"),
  city: z.string().trim().min(2, "City is required"),
  state: z.string().trim().min(2, "State is required"),
  pincode: z.string().trim().min(4, "Pincode is required"),
});

type SellerApplicationFormValues = z.infer<typeof sellerApplicationSchema>;

interface SellerApplicationFormProps {
  user: AuthUser | null;
}

export function SellerApplicationForm({ user }: SellerApplicationFormProps) {
  const queryClient = useQueryClient();
  const { user: authUser } = useAuthStore();
  const [serverError, setServerError] = useState<string | null>(null);
  const [serverMessage, setServerMessage] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<SellerApplicationFormValues>({
    resolver: zodResolver(sellerApplicationSchema),
    defaultValues: {
      storeName: "",
      description: "",
      email: user?.email ?? authUser?.email ?? "",
      phone: user?.mobile ?? authUser?.mobile ?? "",
      address: "",
      city: "",
      state: "",
      pincode: "",
    },
  });

  useEffect(() => {
    reset({
      storeName: "",
      description: "",
      email: user?.email ?? authUser?.email ?? "",
      phone: user?.mobile ?? authUser?.mobile ?? "",
      address: "",
      city: "",
      state: "",
      pincode: "",
    });
  }, [authUser, reset, user]);

  const { data: existingStore, isLoading: isCheckingStore } = useQuery({
    queryKey: ["my-store"],
    queryFn: fetchMyStore,
    enabled: Boolean(authUser?.userId || user?.userId),
    retry: false,
  });

  const mutation = useMutation({
    mutationFn: createStoreApplication,
    onSuccess: () => {
      setServerError(null);
      setServerMessage("Thanks! Your store application has been submitted and is waiting for approval.");
      queryClient.invalidateQueries({ queryKey: ["my-store"] });
    },
    onError: (error: unknown) => {
      setServerMessage(null);
      setServerError(error instanceof Error ? error.message : "Unable to submit your store application.");
    },
  });

  const onSubmit = (values: SellerApplicationFormValues) => {
    setServerError(null);
    setServerMessage(null);
    mutation.mutate(values);
  };

  if (isCheckingStore) {
    return <div className="rounded-2xl border border-stone-200 bg-white p-4 text-sm text-stone-600 dark:border-stone-800 dark:bg-stone-950 dark:text-stone-300">Checking your seller status…</div>;
  }

  if (existingStore) {
    return (
      <div className="space-y-4 rounded-2xl border border-emerald-200 bg-emerald-50 p-5 text-sm text-emerald-800 dark:border-emerald-900/70 dark:bg-emerald-950/40 dark:text-emerald-300">
        <div className="flex items-center gap-2 font-semibold">
          <Store className="h-4 w-4" />
          You already have a store application or store in progress.
        </div>
        <p>
          Your request is already being tracked. Please wait for approval or contact support if you need to update your application.
        </p>
      </div>
    );
  }

  return (
    <form className="space-y-5" onSubmit={handleSubmit(onSubmit)} noValidate>
      {serverError ? (
        <div className="flex items-start gap-2 rounded-2xl border border-red-200 bg-red-50 p-3 text-sm text-red-700 dark:border-red-900/70 dark:bg-red-950/40 dark:text-red-300" role="alert">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
          <span>{serverError}</span>
        </div>
      ) : null}

      {serverMessage ? (
        <div className="flex items-start gap-2 rounded-2xl border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-700 dark:border-emerald-900/70 dark:bg-emerald-950/40 dark:text-emerald-300">
          <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" />
          <span>{serverMessage}</span>
        </div>
      ) : null}

      <div className="grid gap-4 md:grid-cols-2">
        <label className="space-y-2 text-sm font-medium text-stone-700 dark:text-stone-200">
          <span>Store name</span>
          <input
            type="text"
            className="w-full rounded-2xl border border-stone-200 bg-white px-4 py-3 outline-none ring-0 transition focus:border-emerald-500 dark:border-stone-800 dark:bg-stone-950"
            placeholder="e.g. Fresh Basket"
            {...register("storeName")}
          />
          {errors.storeName ? <p className="text-sm text-red-600">{errors.storeName.message}</p> : null}
        </label>

        <label className="space-y-2 text-sm font-medium text-stone-700 dark:text-stone-200">
          <span>Email</span>
          <input
            type="email"
            className="w-full rounded-2xl border border-stone-200 bg-white px-4 py-3 outline-none ring-0 transition focus:border-emerald-500 dark:border-stone-800 dark:bg-stone-950"
            placeholder="store@sheomart.com"
            {...register("email")}
          />
          {errors.email ? <p className="text-sm text-red-600">{errors.email.message}</p> : null}
        </label>

        <label className="space-y-2 text-sm font-medium text-stone-700 dark:text-stone-200">
          <span>Phone</span>
          <input
            type="tel"
            className="w-full rounded-2xl border border-stone-200 bg-white px-4 py-3 outline-none ring-0 transition focus:border-emerald-500 dark:border-stone-800 dark:bg-stone-950"
            placeholder="9876543210"
            {...register("phone")}
          />
          {errors.phone ? <p className="text-sm text-red-600">{errors.phone.message}</p> : null}
        </label>

        <label className="space-y-2 text-sm font-medium text-stone-700 dark:text-stone-200">
          <span>Pincode</span>
          <input
            type="text"
            className="w-full rounded-2xl border border-stone-200 bg-white px-4 py-3 outline-none ring-0 transition focus:border-emerald-500 dark:border-stone-800 dark:bg-stone-950"
            placeholder="560001"
            {...register("pincode")}
          />
          {errors.pincode ? <p className="text-sm text-red-600">{errors.pincode.message}</p> : null}
        </label>
      </div>

      <label className="block space-y-2 text-sm font-medium text-stone-700 dark:text-stone-200">
        <span>Address</span>
        <input
          type="text"
          className="w-full rounded-2xl border border-stone-200 bg-white px-4 py-3 outline-none ring-0 transition focus:border-emerald-500 dark:border-stone-800 dark:bg-stone-950"
          placeholder="Street, building, apartment"
          {...register("address")}
        />
        {errors.address ? <p className="text-sm text-red-600">{errors.address.message}</p> : null}
      </label>

      <div className="grid gap-4 md:grid-cols-2">
        <label className="space-y-2 text-sm font-medium text-stone-700 dark:text-stone-200">
          <span>City</span>
          <input
            type="text"
            className="w-full rounded-2xl border border-stone-200 bg-white px-4 py-3 outline-none ring-0 transition focus:border-emerald-500 dark:border-stone-800 dark:bg-stone-950"
            placeholder="Bengaluru"
            {...register("city")}
          />
          {errors.city ? <p className="text-sm text-red-600">{errors.city.message}</p> : null}
        </label>

        <label className="space-y-2 text-sm font-medium text-stone-700 dark:text-stone-200">
          <span>State</span>
          <input
            type="text"
            className="w-full rounded-2xl border border-stone-200 bg-white px-4 py-3 outline-none ring-0 transition focus:border-emerald-500 dark:border-stone-800 dark:bg-stone-950"
            placeholder="Karnataka"
            {...register("state")}
          />
          {errors.state ? <p className="text-sm text-red-600">{errors.state.message}</p> : null}
        </label>
      </div>

      <label className="block space-y-2 text-sm font-medium text-stone-700 dark:text-stone-200">
        <span>Tell us about your store</span>
        <textarea
          rows={4}
          className="w-full rounded-2xl border border-stone-200 bg-white px-4 py-3 outline-none ring-0 transition focus:border-emerald-500 dark:border-stone-800 dark:bg-stone-950"
          placeholder="Describe the products you plan to sell and what makes your store special."
          {...register("description")}
        />
      </label>

      <div className="rounded-2xl border border-emerald-100 bg-emerald-50/80 p-4 text-sm text-emerald-700 dark:border-emerald-950/70 dark:bg-emerald-950/30 dark:text-emerald-300">
        <div className="flex items-center gap-2 font-semibold">
          <Store className="h-4 w-4" />
          Approval usually takes a short time after submission.
        </div>
        <p className="mt-2 text-emerald-700/90 dark:text-emerald-300/90">
          We’ll review your application and upgrade your account once the store is approved.
        </p>
      </div>

      <Button type="submit" className="w-full" disabled={mutation.isPending}>
        {mutation.isPending ? (
          <span className="flex items-center justify-center gap-2">
            <Loader2 className="h-4 w-4 animate-spin" />
            Submitting request...
          </span>
        ) : (
          "Submit seller application"
        )}
      </Button>
    </form>
  );
}
