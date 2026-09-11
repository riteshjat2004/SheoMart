"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { BadgeCheck, Image as ImageIcon, Loader2, MapPin, Pencil, Plus, Store as StoreIcon, Trash2, Truck, X } from "lucide-react";
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
  pickupOpeningTime: z.string().regex(/^\d{2}:\d{2}$/),
  pickupClosingTime: z.string().regex(/^\d{2}:\d{2}$/),
  pickupEnabled: z.boolean(),
  deliveryEnabled: z.boolean(),
  supportsPickup: z.boolean(),
  supportsDelivery: z.boolean(),
  deliveryFee: z.number().min(0),
  freeDeliveryAbove: z.number().min(0),
  deliveryRadiusKm: z.number().min(0),
  preparationTimeMinutes: z.number().int().min(1),
  pickupInstructions: z.string().max(500),
  pickupAddress: z.string().max(300),
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
    pickupOpeningTime: store.pickupOpeningTime ?? "",
    pickupClosingTime: store.pickupClosingTime ?? "",
    pickupEnabled: store.supportsPickup ?? store.pickupEnabled ?? false,
    deliveryEnabled: store.supportsDelivery ?? store.deliveryEnabled ?? false,
    supportsPickup: store.supportsPickup ?? store.pickupEnabled ?? false,
    supportsDelivery: store.supportsDelivery ?? store.deliveryEnabled ?? false,
    deliveryFee: store.deliveryFee ?? 0,
    freeDeliveryAbove: store.freeDeliveryAbove ?? 0,
    deliveryRadiusKm: store.deliveryRadiusKm ?? 0,
    preparationTimeMinutes: store.preparationTimeMinutes ?? 30,
    pickupInstructions: store.pickupInstructions ?? "",
    pickupAddress: store.pickupAddress ?? "",
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
  const [slotDraft, setSlotDraft] = useState<DeliverySlot>({ slotId: "", label: "", startTime: "09:00", endTime: "11:00", isActive: true });
  const [editingSlotId, setEditingSlotId] = useState<string | null>(null);
  const [slotSaving, setSlotSaving] = useState(false);
  const [slotToast, setSlotToast] = useState<string | null>(null);
  const [slotToDelete, setSlotToDelete] = useState<string | null>(null);
  const [highlightedSlotId, setHighlightedSlotId] = useState<string | null>(null);
  const previousSlotCount = useRef(formValues.deliverySlots.length);

  useEffect(() => {
    const currentCount = formValues.deliverySlots.length;
    if (currentCount > previousSlotCount.current) {
      const addedSlot = formValues.deliverySlots[currentCount - 1];
      setHighlightedSlotId(addedSlot.slotId);
      window.setTimeout(() => setHighlightedSlotId(null), 700);
    }
    previousSlotCount.current = currentCount;
  }, [formValues.deliverySlots]);

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

    if (!result.data.supportsPickup && !result.data.supportsDelivery) {
      setFeedback({ type: "error", message: "Enable pickup or delivery before saving." });
      return;
    }
    for (let index = 0; index < result.data.deliverySlots.length; index += 1) {
      const slot = result.data.deliverySlots[index];
      if (slot.startTime >= slot.endTime) {
        setFeedback({ type: "error", message: "Each delivery slot must end after it starts." });
        return;
      }
      if (result.data.deliverySlots.some((other, otherIndex) => otherIndex > index && slot.startTime < other.endTime && other.startTime < slot.endTime)) {
        setFeedback({ type: "error", message: "Delivery slots cannot overlap." });
        return;
      }
    }
    setErrors({});
    setFeedback(null);
    updateMutation.mutate(result.data);
  };

  const previewAddress = [formValues.address, formValues.city, formValues.state, formValues.pincode].filter(Boolean).join(", ");
  const persistMode = (mode: "pickup" | "delivery" | "both") => {
    const supportsPickup = mode !== "delivery";
    const supportsDelivery = mode !== "pickup";
    setFormValues((current) => ({ ...current, pickupEnabled: supportsPickup, deliveryEnabled: supportsDelivery, supportsPickup, supportsDelivery }));
    updateMutation.mutate({ pickupEnabled: supportsPickup, deliveryEnabled: supportsDelivery, supportsPickup, supportsDelivery });
  };

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
            <div className="grid gap-3 sm:grid-cols-3">{([{ value: "pickup", label: "Pickup Only", icon: BadgeCheck }, { value: "delivery", label: "Delivery Only", icon: Truck }, { value: "both", label: "Pickup + Delivery", icon: StoreIcon }] as const).map(({ value, label, icon: Icon }) => <button key={value} type="button" onClick={() => persistMode(value)} className={`rounded-xl border p-4 text-left transition ${((value === "pickup" && formValues.supportsPickup && !formValues.supportsDelivery) || (value === "delivery" && formValues.supportsDelivery && !formValues.supportsPickup) || (value === "both" && formValues.supportsPickup && formValues.supportsDelivery)) ? "border-emerald-500 bg-emerald-50 dark:bg-emerald-500/10" : "border-stone-200 dark:border-stone-800"}`}><Icon className="h-5 w-5 text-emerald-600" /><span className="mt-2 block text-sm font-semibold">{label}</span></button>)}</div>
            <Field label="Preparation time (minutes)" type="number" min="1" value={String(formValues.preparationTimeMinutes)} onChange={(value) => setFormValues((current) => ({ ...current, preparationTimeMinutes: Number(value) }))} />
            {formValues.supportsDelivery ? <div className="grid gap-4 sm:grid-cols-2"><Field label="Delivery fee" type="number" min="0" value={String(formValues.deliveryFee)} onChange={(value) => setFormValues((current) => ({ ...current, deliveryFee: Number(value) }))} /><Field label="Free delivery above" type="number" min="0" value={String(formValues.freeDeliveryAbove)} onChange={(value) => setFormValues((current) => ({ ...current, freeDeliveryAbove: Number(value) }))} /><Field label="Delivery radius (km)" type="number" min="0" value={String(formValues.deliveryRadiusKm)} onChange={(value) => setFormValues((current) => ({ ...current, deliveryRadiusKm: Number(value) }))} /><Field label="Store latitude" type="number" value={String(formValues.latitude ?? "")} onChange={(value) => setFormValues((current) => ({ ...current, latitude: value ? Number(value) : undefined }))} /><Field label="Store longitude" type="number" value={String(formValues.longitude ?? "")} onChange={(value) => setFormValues((current) => ({ ...current, longitude: value ? Number(value) : undefined }))} /></div> : null}
            {formValues.supportsPickup ? <div className="grid gap-4"><Field label="Pickup address" value={formValues.pickupAddress} onChange={(value) => setFormValues((current) => ({ ...current, pickupAddress: value }))} /><label className="space-y-1.5 text-sm font-medium text-stone-700 dark:text-stone-300"><span>Pickup instructions</span><textarea value={formValues.pickupInstructions} onChange={(event) => setFormValues((current) => ({ ...current, pickupInstructions: event.target.value }))} maxLength={500} rows={3} className="w-full rounded-lg border border-stone-200 bg-white px-3 py-2 text-sm dark:border-stone-800 dark:bg-stone-950" /></label></div> : null}
            <div className="mt-5 border-t border-stone-200 pt-5 dark:border-stone-800">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div><p className="font-semibold">Delivery slot manager</p><p className="mt-1 text-xs text-stone-500">Create the windows customers can select at checkout.</p></div>
                <button type="button" disabled={slotSaving} onClick={() => { setFormValues((current) => ({ ...current, deliverySlots: editingSlotId ? current.deliverySlots.map((slot) => slot.slotId === editingSlotId ? { ...slotDraft, slotId: editingSlotId } : slot) : [...current.deliverySlots, { ...slotDraft, slotId: crypto.randomUUID() }] })); const nextId = editingSlotId ?? slotDraft.slotId; setSlotDraft({ slotId: "", label: "", startTime: "09:00", endTime: "11:00", isActive: true }); setEditingSlotId(null); setSlotSaving(true); setSlotToast(editingSlotId ? "Delivery slot updated." : "Delivery slot added."); setHighlightedSlotId(nextId || null); window.setTimeout(() => { setSlotSaving(false); setHighlightedSlotId(null); }, 500); }} className="inline-flex min-h-10 items-center justify-center gap-2 rounded-full bg-gradient-to-r from-emerald-600 to-emerald-500 px-4 text-sm font-semibold text-white shadow-sm shadow-emerald-500/20 transition duration-200 ease-in-out hover:scale-105 hover:shadow-lg hover:shadow-emerald-500/30 active:scale-95 disabled:pointer-events-none disabled:opacity-60 motion-reduce:transform-none motion-reduce:transition-none">{slotSaving ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> : <Plus className="h-4 w-4" aria-hidden="true" />}{slotSaving ? "Saving..." : editingSlotId ? "Save Slot" : "Add Delivery Slot"}</button>
              </div>
              {slotToast ? <div role="status" className="mt-3 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-700 dark:border-emerald-900/70 dark:bg-emerald-950/30 dark:text-emerald-300">{slotToast}</div> : null}
              {formValues.deliverySlots.length === 0 ? <div className="mt-4 rounded-2xl border border-dashed border-emerald-300 bg-emerald-50/60 p-8 text-center dark:border-emerald-900/70 dark:bg-emerald-950/20"><div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-300"><Truck className="h-6 w-6" aria-hidden="true" /></div><p className="mt-3 font-semibold">No delivery slots created yet.</p><p className="mt-1 text-sm text-stone-500">Add a delivery window for your customers.</p><button type="button" onClick={() => document.getElementById("delivery-slot-label")?.focus()} className="mt-4 rounded-full bg-emerald-600 px-4 py-2 text-sm font-semibold text-white transition duration-200 hover:bg-emerald-700 hover:shadow-lg hover:shadow-emerald-500/20 active:scale-95">Create First Slot</button></div> : <div className="mt-4 grid gap-3">{formValues.deliverySlots.map((slot) => <div key={slot.slotId} className={`group flex flex-wrap items-center justify-between gap-4 rounded-2xl border p-4 text-sm shadow-sm transition duration-200 ease-in-out hover:-translate-y-0.5 hover:border-emerald-400 hover:shadow-lg hover:shadow-emerald-500/10 motion-reduce:transform-none motion-reduce:transition-none ${highlightedSlotId === slot.slotId ? "animate-pulse border-emerald-400 bg-emerald-50/70 dark:bg-emerald-950/30" : "border-stone-200 dark:border-stone-800"}`}><div className="min-w-0"><p className="font-semibold text-stone-900 dark:text-stone-50">{slot.label || "Untitled slot"}</p><p className="mt-1 text-stone-500">{slot.startTime} - {slot.endTime}{slot.capacity ? ` · ${slot.capacity} orders` : " · Unlimited capacity"}</p></div><div className="flex items-center gap-2"><label className="flex cursor-pointer items-center gap-2 text-xs font-medium text-stone-600 dark:text-stone-300"><input type="checkbox" checked={slot.isActive} onChange={(event) => setFormValues((current) => ({ ...current, deliverySlots: current.deliverySlots.map((item) => item.slotId === slot.slotId ? { ...item, isActive: event.target.checked } : item) }))} className="peer sr-only" /><span className="relative h-6 w-11 rounded-full bg-stone-300 transition duration-250 peer-checked:bg-emerald-600 dark:bg-stone-700"><span className="absolute left-1 top-1 h-4 w-4 rounded-full bg-white shadow-sm transition duration-250 peer-checked:translate-x-5" /></span>{slot.isActive ? "Active" : "Inactive"}</label><button type="button" title="Edit delivery slot" aria-label={`Edit ${slot.label || "delivery slot"}`} onClick={() => { setSlotDraft(slot); setEditingSlotId(slot.slotId); }} className="rounded-full p-2 text-stone-500 transition duration-200 hover:bg-emerald-100 hover:text-emerald-700 dark:hover:bg-emerald-950/50"><Pencil className="h-4 w-4" aria-hidden="true" /></button><button type="button" title="Delete delivery slot" aria-label={`Delete ${slot.label || "delivery slot"}`} onClick={() => setSlotToDelete(slot.slotId)} className="rounded-full p-2 text-stone-500 transition duration-200 hover:bg-rose-100 hover:text-rose-700 dark:hover:bg-rose-950/50"><Trash2 className="h-4 w-4" aria-hidden="true" /></button></div></div>)}</div>}
              <div className="mt-4 grid gap-3 sm:grid-cols-4"><input id="delivery-slot-label" placeholder="Label (9 AM - 11 AM)" value={slotDraft.label} onChange={(event) => setSlotDraft((current) => ({ ...current, label: event.target.value }))} className="min-h-10 rounded-lg border border-stone-200 bg-white px-3 py-2 text-sm outline-none transition duration-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 dark:border-stone-800 dark:bg-stone-950" /><input aria-label="Start time" type="time" value={slotDraft.startTime} onChange={(event) => setSlotDraft((current) => ({ ...current, startTime: event.target.value }))} className="min-h-10 rounded-lg border border-stone-200 bg-white px-3 py-2 text-sm outline-none transition duration-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 dark:border-stone-800 dark:bg-stone-950" /><input aria-label="End time" type="time" value={slotDraft.endTime} onChange={(event) => setSlotDraft((current) => ({ ...current, endTime: event.target.value }))} className="min-h-10 rounded-lg border border-stone-200 bg-white px-3 py-2 text-sm outline-none transition duration-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 dark:border-stone-800 dark:bg-stone-950" /><input aria-label="Capacity" type="number" min="1" placeholder="Capacity" value={slotDraft.capacity ?? ""} onChange={(event) => setSlotDraft((current) => ({ ...current, capacity: event.target.value ? Number(event.target.value) : undefined }))} className="min-h-10 rounded-lg border border-stone-200 bg-white px-3 py-2 text-sm outline-none transition duration-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 dark:border-stone-800 dark:bg-stone-950" /></div>
            </div>
            {slotToDelete ? <div className="fixed inset-0 z-50 flex items-center justify-center bg-stone-950/60 p-4" role="dialog" aria-modal="true" aria-labelledby="delete-slot-title"><div className="w-full max-w-sm rounded-2xl border border-stone-700 bg-stone-900 p-6 text-stone-50 shadow-xl"><div className="flex items-start justify-between gap-4"><div><h2 id="delete-slot-title" className="font-semibold">Delete delivery slot?</h2><p className="mt-2 text-sm text-stone-400">This slot will be removed from your store settings.</p></div><button type="button" onClick={() => setSlotToDelete(null)} aria-label="Close confirmation" className="rounded-full p-2 text-stone-400 transition hover:bg-stone-800 hover:text-white"><X className="h-4 w-4" /></button></div><div className="mt-6 flex justify-end gap-2"><Button type="button" variant="outline" onClick={() => setSlotToDelete(null)}>Cancel</Button><Button type="button" onClick={() => { setFormValues((current) => ({ ...current, deliverySlots: current.deliverySlots.filter((slot) => slot.slotId !== slotToDelete) })); setSlotToDelete(null); setSlotToast("Delivery slot deleted."); }}>Delete Slot</Button></div></div></div> : null}
          </div>
        </DashboardCard>

        <DashboardCard title="Store availability" description="These controls are prepared locally; opening hours are not exposed by the current API.">
          <label className="flex items-center justify-between rounded-lg border border-stone-200 p-3 text-sm dark:border-stone-800"><span>Store open <span className="ml-1 text-xs text-stone-500">Local only</span></span><input type="checkbox" checked={isStoreOpen} onChange={(event) => setIsStoreOpen(event.target.checked)} className="h-4 w-4 rounded border-stone-300 text-emerald-600 focus:ring-emerald-500" /></label>
          <div className="mt-4 grid gap-4 sm:grid-cols-2"><Field label="Opening time" type="time" value={formValues.pickupOpeningTime} onChange={(value) => setValue("pickupOpeningTime", value)} /><Field label="Closing time" type="time" value={formValues.pickupClosingTime} onChange={(value) => setValue("pickupClosingTime", value)} /></div>
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
