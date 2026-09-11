"use client";

import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { BadgeCheck, Image as ImageIcon, MapPin, Store as StoreIcon, Truck } from "lucide-react";
import { z } from "zod";
import { Breadcrumb } from "@/components/dashboard/layout/Breadcrumb";
import { DashboardContent } from "@/components/dashboard/layout/DashboardContent";
import { PageHeader } from "@/components/dashboard/layout/PageHeader";
import { DashboardCard } from "@/components/dashboard/DashboardCard";
import { EmptyState } from "@/components/dashboard/EmptyState";
import { LoadingSkeleton } from "@/components/dashboard/LoadingSkeleton";
import { ErrorState } from "@/components/common/error-state";
import { Button } from "@/components/ui/button";
import { fetchMyStore, updateMyStore, type DeliverySlot, type UpdateMyStorePayload } from "@/services/store";
import { useAuthStore } from "@/store/auth-store";
import type { StoreItem } from "@/types/marketplace";

const settingsSchema = z.object({
  logo: z.string().url("Enter a valid logo URL").or(z.literal("")),
  banner: z.string().url("Enter a valid banner URL").or(z.literal("")),
  description: z.string().max(1000, "Description must be 1000 characters or fewer"),
  phone: z.string().regex(/^[6-9]\d{9}$/, "Enter a valid 10-digit phone number"),
  address: z.string().max(200, "Address must be 200 characters or fewer"),
  city: z.string().max(100, "City must be 100 characters or fewer"),
  state: z.string().max(100, "State must be 100 characters or fewer"),
  pincode: z.string().regex(/^\d{6}$/, "Enter a valid 6-digit pincode"),
  pickupEnabled: z.boolean(),
  deliveryEnabled: z.boolean(),
  deliveryFee: z.number().min(0),
  freeDeliveryAbove: z.number().min(0),
  deliveryRadiusKm: z.number().min(0),
  preparationTimeMinutes: z.number().int().min(1),
  latitude: z.number().min(-90).max(90).optional(),
  longitude: z.number().min(-180).max(180).optional(),
  deliverySlots: z.array(z.object({ slotId: z.string(), label: z.string(), startTime: z.string(), endTime: z.string(), capacity: z.number().int().min(1).optional(), isActive: z.boolean() })),
});

type SettingsValues = z.infer<typeof settingsSchema>;
type Feedback = { type: "success" | "error"; message: string } | null;

function initialValues(store: StoreItem, fallbackPhone: string): SettingsValues {
  return {
    logo: store.logo ?? "",
    banner: store.banner ?? "",
    description: store.description ?? "",
    phone: store.phone ?? fallbackPhone,
    address: store.address ?? "",
    city: store.city ?? "",
    state: store.state ?? "",
    pincode: store.pincode ?? "",
    pickupEnabled: store.pickupEnabled !== false,
    deliveryEnabled: store.deliveryEnabled === true,
    deliveryFee: store.deliveryFee ?? 0,
    freeDeliveryAbove: store.freeDeliveryAbove ?? 0,
    deliveryRadiusKm: store.deliveryRadiusKm ?? 0,
    preparationTimeMinutes: store.preparationTimeMinutes ?? 30,
    latitude: store.latitude,
    longitude: store.longitude,
    deliverySlots: store.deliverySlots ?? [],
  };
}

function Field({ label, value, onChange, error, ...props }: { label: string; value: string; onChange: (value: string) => void; error?: string } & Omit<React.InputHTMLAttributes<HTMLInputElement>, "value" | "onChange">) {
  return (
    <label className="space-y-1.5 text-sm font-medium text-stone-700 dark:text-stone-300">
      <span>{label}</span>
      <input {...props} value={value} onChange={(event) => onChange(event.target.value)} className="min-h-10 w-full rounded-lg border border-stone-200 bg-white px-3 text-sm outline-none focus:border-emerald-500 dark:border-stone-800 dark:bg-stone-950" />
      {error ? <span className="text-xs font-normal text-rose-600">{error}</span> : null}
    </label>
  );
}

function StoreSettingsForm({ store, fallbackPhone, ownerName, ownerEmail }: { store: StoreItem; fallbackPhone: string; ownerName: string; ownerEmail: string }) {
  const queryClient = useQueryClient();
  const values = useMemo(() => initialValues(store, fallbackPhone), [store, fallbackPhone]);
  const [formValues, setFormValues] = useState<SettingsValues>(values);
  const [errors, setErrors] = useState<Partial<Record<keyof SettingsValues, string>>>({});
  const [feedback, setFeedback] = useState<Feedback>(null);
  const [isStoreOpen, setIsStoreOpen] = useState(true);
  const [openingTime, setOpeningTime] = useState("09:00");
  const [closingTime, setClosingTime] = useState("18:00");
  const [slotDraft, setSlotDraft] = useState<DeliverySlot>({ slotId: "", label: "", startTime: "09:00", endTime: "11:00", isActive: true });
  const [editingSlotId, setEditingSlotId] = useState<string | null>(null);

  const updateMutation = useMutation({
    mutationFn: (payload: UpdateMyStorePayload) => updateMyStore(payload),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["my-store"] });
      setFeedback({ type: "success", message: "Store settings updated successfully." });
    },
    onError: (error) => setFeedback({ type: "error", message: error instanceof Error ? error.message : "Unable to update store settings." }),
  });

  const setValue = (key: keyof SettingsValues, value: string) => setFormValues((current) => ({ ...current, [key]: value }));

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const result = settingsSchema.safeParse(formValues);
    if (!result.success) {
      const nextErrors: Partial<Record<keyof SettingsValues, string>> = {};
      for (const issue of result.error.issues) {
        const key = issue.path[0] as keyof SettingsValues;
        if (!nextErrors[key]) nextErrors[key] = issue.message;
      }
      setErrors(nextErrors);
      setFeedback({ type: "error", message: "Please correct the highlighted fields." });
      return;
    }

    setErrors({});
    setFeedback(null);
    updateMutation.mutate(result.data);
  };

  const previewAddress = [formValues.address, formValues.city, formValues.state, formValues.pincode].filter(Boolean).join(", ");

  return (
    <form className="space-y-6" onSubmit={handleSubmit}>
      {feedback ? <div className={`rounded-lg border p-3 text-sm ${feedback.type === "success" ? "border-emerald-200 bg-emerald-50 text-emerald-700" : "border-rose-200 bg-rose-50 text-rose-700"}`}>{feedback.message}</div> : null}

      <DashboardCard title="Business profile" description="Manage the public details customers see for your store.">
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-1.5 text-sm"><span className="font-medium text-stone-700 dark:text-stone-300">Store name</span><p className="rounded-lg bg-stone-50 px-3 py-2.5 text-stone-500 dark:bg-stone-950 dark:text-stone-400">{store.storeName ?? store.name ?? "-"}</p></div>
          <div className="space-y-1.5 text-sm"><span className="font-medium text-stone-700 dark:text-stone-300">Owner name</span><p className="rounded-lg bg-stone-50 px-3 py-2.5 text-stone-500 dark:bg-stone-950 dark:text-stone-400">{ownerName || "-"}</p></div>
          <div className="space-y-1.5 text-sm"><span className="font-medium text-stone-700 dark:text-stone-300">Email</span><p className="rounded-lg bg-stone-50 px-3 py-2.5 text-stone-500 dark:bg-stone-950 dark:text-stone-400">{ownerEmail || store.email || "-"}</p></div>
          <div className="space-y-1.5 text-sm"><span className="font-medium text-stone-700 dark:text-stone-300">Store status</span><p className="rounded-lg bg-stone-50 px-3 py-2.5 capitalize text-stone-500 dark:bg-stone-950 dark:text-stone-400">{store.status ?? "-"}</p></div>
        </div>
        <div className="mt-4 grid gap-4 md:grid-cols-2">
          <Field label="Logo URL" value={formValues.logo} onChange={(value) => setValue("logo", value)} error={errors.logo} type="url" placeholder="https://example.com/logo.png" />
          <Field label="Banner URL" value={formValues.banner} onChange={(value) => setValue("banner", value)} error={errors.banner} type="url" placeholder="https://example.com/banner.png" />
          <label className="space-y-1.5 text-sm font-medium text-stone-700 dark:text-stone-300 md:col-span-2"><span>Description</span><textarea value={formValues.description} onChange={(event) => setValue("description", event.target.value)} maxLength={1000} rows={4} className="w-full rounded-lg border border-stone-200 bg-white px-3 py-2 text-sm outline-none focus:border-emerald-500 dark:border-stone-800 dark:bg-stone-950" />{errors.description ? <span className="text-xs font-normal text-rose-600">{errors.description}</span> : null}</label>
          <Field label="Phone" value={formValues.phone} onChange={(value) => setValue("phone", value)} error={errors.phone} inputMode="numeric" />
          <div className="space-y-1.5 text-sm"><span className="font-medium text-stone-700 dark:text-stone-300">Verification status</span><p className="flex items-center gap-2 rounded-lg bg-stone-50 px-3 py-2.5 text-stone-500 dark:bg-stone-950 dark:text-stone-400"><BadgeCheck className="h-4 w-4 text-emerald-600" />{store.isVerified ? "Verified" : "Pending verification"}</p></div>
        </div>
      </DashboardCard>

      <DashboardCard title="Store address" description="Keep your customer-facing location details accurate.">
        <div className="grid gap-4 md:grid-cols-2">
          <Field label="Address" value={formValues.address} onChange={(value) => setValue("address", value)} error={errors.address} />
          <Field label="Area / locality" value="" onChange={() => undefined} placeholder="Not persisted by the current API" disabled />
          <Field label="City" value={formValues.city} onChange={(value) => setValue("city", value)} error={errors.city} />
          <Field label="District" value="" onChange={() => undefined} placeholder="Not persisted by the current API" disabled />
          <Field label="State" value={formValues.state} onChange={(value) => setValue("state", value)} error={errors.state} />
          <Field label="Pincode" value={formValues.pincode} onChange={(value) => setValue("pincode", value)} error={errors.pincode} inputMode="numeric" />
        </div>
      </DashboardCard>

      <div className="grid gap-6 xl:grid-cols-2">
        <DashboardCard title="Fulfillment settings" description="Choose how customers can receive orders from your store.">
          <div className="space-y-3">
            <label className="flex items-center justify-between rounded-lg border border-stone-200 p-3 text-sm dark:border-stone-800"><span className="flex items-center gap-2"><BadgeCheck className="h-4 w-4 text-emerald-600" />Pickup enabled</span><input type="checkbox" checked={formValues.pickupEnabled} onChange={(event) => setFormValues((current) => ({ ...current, pickupEnabled: event.target.checked }))} className="h-4 w-4 rounded border-stone-300 text-emerald-600" /></label>
            <label className="flex items-center justify-between rounded-lg border border-stone-200 p-3 text-sm dark:border-stone-800"><span className="flex items-center gap-2"><Truck className="h-4 w-4 text-emerald-600" />Delivery enabled</span><input type="checkbox" checked={formValues.deliveryEnabled} onChange={(event) => setFormValues((current) => ({ ...current, deliveryEnabled: event.target.checked }))} className="h-4 w-4 rounded border-stone-300 text-emerald-600" /></label>
            <div className="grid gap-4 sm:grid-cols-2"><Field label="Delivery fee" type="number" min="0" value={String(formValues.deliveryFee)} onChange={(value) => setFormValues((current) => ({ ...current, deliveryFee: Number(value) }))} /><Field label="Free delivery above" type="number" min="0" value={String(formValues.freeDeliveryAbove)} onChange={(value) => setFormValues((current) => ({ ...current, freeDeliveryAbove: Number(value) }))} /><Field label="Delivery radius (km)" type="number" min="0" value={String(formValues.deliveryRadiusKm)} onChange={(value) => setFormValues((current) => ({ ...current, deliveryRadiusKm: Number(value) }))} /><Field label="Preparation time (minutes)" type="number" min="1" value={String(formValues.preparationTimeMinutes)} onChange={(value) => setFormValues((current) => ({ ...current, preparationTimeMinutes: Number(value) }))} /><Field label="Store latitude" type="number" value={String(formValues.latitude ?? "")} onChange={(value) => setFormValues((current) => ({ ...current, latitude: value ? Number(value) : undefined }))} /><Field label="Store longitude" type="number" value={String(formValues.longitude ?? "")} onChange={(value) => setFormValues((current) => ({ ...current, longitude: value ? Number(value) : undefined }))} /></div>
            <div className="mt-5 border-t border-stone-200 pt-5 dark:border-stone-800"><div className="flex items-center justify-between"><p className="font-semibold">Delivery slot manager</p><button type="button" onClick={() => { setFormValues((current) => ({ ...current, deliverySlots: editingSlotId ? current.deliverySlots.map((slot) => slot.slotId === editingSlotId ? { ...slotDraft, slotId: editingSlotId } : slot) : [...current.deliverySlots, { ...slotDraft, slotId: crypto.randomUUID() }] })); setSlotDraft({ slotId: "", label: "", startTime: "09:00", endTime: "11:00", isActive: true }); setEditingSlotId(null); }} className="text-sm font-semibold text-emerald-700">{editingSlotId ? "Save slot" : "Add slot"}</button></div><div className="mt-3 grid gap-2">{formValues.deliverySlots.map((slot) => <div key={slot.slotId} className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-stone-200 p-3 text-sm dark:border-stone-800"><span><strong>{slot.label}</strong> <span className="text-stone-500">{slot.startTime} - {slot.endTime}{slot.capacity ? ` · ${slot.capacity} orders` : ""}</span></span><span className="flex items-center gap-3"><label className="flex items-center gap-1 text-xs"><input type="checkbox" checked={slot.isActive} onChange={(event) => setFormValues((current) => ({ ...current, deliverySlots: current.deliverySlots.map((item) => item.slotId === slot.slotId ? { ...item, isActive: event.target.checked } : item) }))} />Active</label><button type="button" onClick={() => { setSlotDraft(slot); setEditingSlotId(slot.slotId); }} className="text-xs font-semibold text-emerald-700">Edit</button><button type="button" onClick={() => setFormValues((current) => ({ ...current, deliverySlots: current.deliverySlots.filter((item) => item.slotId !== slot.slotId) }))} className="text-xs font-semibold text-rose-600">Delete</button></span></div>)}</div><div className="mt-3 grid gap-3 sm:grid-cols-4"><input placeholder="Label (9 AM - 11 AM)" value={slotDraft.label} onChange={(event) => setSlotDraft((current) => ({ ...current, label: event.target.value }))} className="rounded-lg border border-stone-200 bg-white px-3 py-2 text-sm dark:border-stone-800 dark:bg-stone-950" /><input type="time" value={slotDraft.startTime} onChange={(event) => setSlotDraft((current) => ({ ...current, startTime: event.target.value }))} className="rounded-lg border border-stone-200 bg-white px-3 py-2 text-sm dark:border-stone-800 dark:bg-stone-950" /><input type="time" value={slotDraft.endTime} onChange={(event) => setSlotDraft((current) => ({ ...current, endTime: event.target.value }))} className="rounded-lg border border-stone-200 bg-white px-3 py-2 text-sm dark:border-stone-800 dark:bg-stone-950" /><input type="number" min="1" placeholder="Capacity" value={slotDraft.capacity ?? ""} onChange={(event) => setSlotDraft((current) => ({ ...current, capacity: event.target.value ? Number(event.target.value) : undefined }))} className="rounded-lg border border-stone-200 bg-white px-3 py-2 text-sm dark:border-stone-800 dark:bg-stone-950" /></div></div>
          </div>
        </DashboardCard>

        <DashboardCard title="Store availability" description="These controls are prepared locally; opening hours are not exposed by the current API.">
          <label className="flex items-center justify-between rounded-lg border border-stone-200 p-3 text-sm dark:border-stone-800"><span>Store open <span className="ml-1 text-xs text-stone-500">Local only</span></span><input type="checkbox" checked={isStoreOpen} onChange={(event) => setIsStoreOpen(event.target.checked)} className="h-4 w-4 rounded border-stone-300 text-emerald-600 focus:ring-emerald-500" /></label>
          <div className="mt-4 grid gap-4 sm:grid-cols-2"><Field label="Opening time" type="time" value={openingTime} onChange={setOpeningTime} /><Field label="Closing time" type="time" value={closingTime} onChange={setClosingTime} /></div>
        </DashboardCard>
      </div>

      <DashboardCard title="Store preview" description="Preview the customer-facing store identity using the values above.">
        <div className="overflow-hidden rounded-xl border border-stone-200 dark:border-stone-800"><div className="h-32 bg-stone-100 dark:bg-stone-800">{formValues.banner ? <img src={formValues.banner} alt="Store banner preview" className="h-full w-full object-cover" /> : <div className="flex h-full items-center justify-center text-stone-400"><ImageIcon aria-hidden="true" className="h-6 w-6" /></div>}</div><div className="flex gap-4 p-4"><div className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-stone-200 bg-white dark:border-stone-700 dark:bg-stone-900">{formValues.logo ? <img src={formValues.logo} alt="Store logo preview" className="h-full w-full object-cover" /> : <StoreIcon className="h-6 w-6 text-emerald-600" />}</div><div className="min-w-0"><h3 className="font-semibold text-stone-900 dark:text-stone-50">{store.storeName ?? store.name ?? "Store"}</h3><p className="mt-1 text-sm text-stone-600 dark:text-stone-300">{formValues.phone || "Phone not set"}</p><p className="mt-1 flex items-center gap-1 text-sm text-stone-500"><MapPin className="h-3.5 w-3.5" />{previewAddress || "Address not set"}</p><div className="mt-3 flex gap-2">{formValues.pickupEnabled ? <span className="rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-semibold text-emerald-700">Pickup</span> : null}{formValues.deliveryEnabled ? <span className="rounded-full bg-sky-100 px-2.5 py-1 text-xs font-semibold text-sky-700">Delivery</span> : null}</div></div></div></div>
      </DashboardCard>

      <div className="flex justify-end"><Button type="submit" disabled={updateMutation.isPending}>{updateMutation.isPending ? "Saving..." : "Save store settings"}</Button></div>
    </form>
  );
}

export default function StoreSettingsPage() {
  const user = useAuthStore((state) => state.user);
  const storeQuery = useQuery<StoreItem | null, Error>({ queryKey: ["my-store"], queryFn: fetchMyStore, staleTime: 1000 * 60 * 5 });

  return (
    <DashboardContent className="space-y-6">
      <Breadcrumb items={[{ label: "Store" }, { label: "Settings" }]} />
      <PageHeader title="Store settings" description="Manage your store profile, location, and customer-facing presentation." />
      {storeQuery.isLoading ? <LoadingSkeleton rows={5} /> : null}
      {storeQuery.isError ? <ErrorState message={storeQuery.error.message} /> : null}
      {!storeQuery.isLoading && !storeQuery.isError && !storeQuery.data ? <EmptyState title="Store profile unavailable" description="Create or approve a store before managing its settings." /> : null}
      {storeQuery.data ? <StoreSettingsForm key={storeQuery.data.storeId ?? storeQuery.data._id} store={storeQuery.data} fallbackPhone={user?.mobile ?? ""} ownerName={user?.name ?? ""} ownerEmail={user?.email ?? ""} /> : null}
    </DashboardContent>
  );
}
