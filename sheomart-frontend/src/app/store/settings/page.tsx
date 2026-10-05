"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  BadgeCheck,
  Image as ImageIcon,
  Loader2,
  MapPin,
  Pencil,
  Plus,
  Store as StoreIcon,
  Trash2,
  Truck,
  X,
  Clock,
  Shield,
  FileText,
  CreditCard,
  Crown,
  CheckCircle2,
  Calendar,
  Upload,
} from "lucide-react";
import { z } from "zod";
import { Breadcrumb } from "@/components/dashboard/layout/Breadcrumb";
import { DashboardContent } from "@/components/dashboard/layout/DashboardContent";
import { PageHeader } from "@/components/dashboard/layout/PageHeader";
import { DashboardCard } from "@/components/dashboard/DashboardCard";
import { LoadingSkeleton } from "@/components/dashboard/LoadingSkeleton";
import { ErrorState } from "@/components/common/error-state";
import { Button } from "@/components/ui/button";
import { fetchMyStore, updateMyStore, uploadStoreAsset, type DeliverySlot, type UpdateMyStorePayload } from "@/services/store";
import { useAuthStore } from "@/store/auth-store";
import type { StoreItem } from "@/types/marketplace";
import { SellerSecurityRequestCard } from "@/components/security/SellerSecurityRequestCard";
import { ThemeSelectionCard } from "@/components/common/ThemeSelectionCard";

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
  deliverySlots: z.array(
    z.object({
      slotId: z.string(),
      label: z.string(),
      startTime: z.string(),
      endTime: z.string(),
      capacity: z.number().int().min(1).optional(),
      isActive: z.boolean(),
    })
  ),
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
    pickupOpeningTime: store.pickupOpeningTime ?? "08:00",
    pickupClosingTime: store.pickupClosingTime ?? "22:00",
    pickupEnabled: store.supportsPickup ?? store.pickupEnabled ?? true,
    deliveryEnabled: store.supportsDelivery ?? store.deliveryEnabled ?? true,
    supportsPickup: store.supportsPickup ?? store.pickupEnabled ?? true,
    supportsDelivery: store.supportsDelivery ?? store.deliveryEnabled ?? true,
    deliveryFee: store.deliveryFee ?? 0,
    freeDeliveryAbove: store.freeDeliveryAbove ?? 0,
    deliveryRadiusKm: store.deliveryRadiusKm ?? 8,
    preparationTimeMinutes: store.preparationTimeMinutes ?? 20,
    pickupInstructions: store.pickupInstructions ?? "",
    pickupAddress: store.pickupAddress ?? "",
    latitude: store.latitude,
    longitude: store.longitude,
    deliverySlots: store.deliverySlots ?? [],
  };
}

function Field({
  label,
  value,
  onChange,
  error,
  ...props
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  error?: string;
} & Omit<React.InputHTMLAttributes<HTMLInputElement>, "value" | "onChange">) {
  return (
    <label className="space-y-1.5 text-xs font-semibold text-stone-700 dark:text-stone-300">
      <span>{label}</span>
      <input
        {...props}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="min-h-10 w-full rounded-xl border border-stone-200 bg-white px-3 text-xs outline-none focus:border-emerald-500 dark:border-stone-800 dark:bg-stone-950"
      />
      {error ? <span className="text-[11px] font-normal text-rose-600">{error}</span> : null}
    </label>
  );
}

type TabType = "profile" | "fulfillment" | "hours" | "appearance" | "security" | "policies";

function StoreSettingsForm({
  store,
  fallbackPhone,
  ownerName,
  ownerEmail,
}: {
  store: StoreItem;
  fallbackPhone: string;
  ownerName: string;
  ownerEmail: string;
}) {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<TabType>("profile");
  const values = useMemo(() => initialValues(store, fallbackPhone), [store, fallbackPhone]);
  const [formValues, setFormValues] = useState<SettingsValues>(values);
  const [errors, setErrors] = useState<Partial<Record<keyof SettingsValues, string>>>({});
  const [feedback, setFeedback] = useState<Feedback>(null);
  const [isStoreOpen, setIsStoreOpen] = useState(true);
  const [slotDraft, setSlotDraft] = useState<DeliverySlot>({
    slotId: "",
    label: "",
    startTime: "09:00",
    endTime: "11:00",
    isActive: true,
  });
  const [editingSlotId, setEditingSlotId] = useState<string | null>(null);
  const [slotSaving, setSlotSaving] = useState(false);
  const [slotToast, setSlotToast] = useState<string | null>(null);
  const [slotToDelete, setSlotToDelete] = useState<string | null>(null);
  const [highlightedSlotId, setHighlightedSlotId] = useState<string | null>(null);
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [uploadingBanner, setUploadingBanner] = useState(false);
  const logoInputRef = useRef<HTMLInputElement>(null);
  const bannerInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>, assetType: "logo" | "banner") => {
    const file = event.target.files?.[0];
    if (!file) return;

    event.target.value = "";

    if (file.size > 5 * 1024 * 1024) {
      setFeedback({ type: "error", message: "File size exceeds 5MB limit. Please choose a smaller image." });
      return;
    }

    try {
      if (assetType === "logo") {
        setUploadingLogo(true);
      } else {
        setUploadingBanner(true);
      }
      setFeedback(null);

      const res = await uploadStoreAsset(file, assetType);
      if (res?.url) {
        setValue(assetType, res.url);
        await queryClient.invalidateQueries({ queryKey: ["my-store"] });
        setFeedback({
          type: "success",
          message: `${assetType === "logo" ? "Store Logo" : "Store Banner"} uploaded successfully to Cloudinary!`,
        });
      }
    } catch (err: any) {
      setFeedback({
        type: "error",
        message: err?.response?.data?.message || err?.message || `Failed to upload ${assetType}.`,
      });
    } finally {
      if (assetType === "logo") {
        setUploadingLogo(false);
      } else {
        setUploadingBanner(false);
      }
    }
  };

  const updateMutation = useMutation({
    mutationFn: (payload: UpdateMyStorePayload) => updateMyStore(payload),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["my-store"] });
      setFeedback({ type: "success", message: "Store settings updated successfully." });
    },
    onError: (error) =>
      setFeedback({
        type: "error",
        message: error instanceof Error ? error.message : "Unable to update store settings.",
      }),
  });

  const setValue = (key: keyof SettingsValues, value: string) =>
    setFormValues((current) => ({ ...current, [key]: value }));

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
      setFeedback({ type: "error", message: "Please correct highlighted fields before saving." });
      return;
    }

    if (!result.data.supportsPickup && !result.data.supportsDelivery) {
      setFeedback({ type: "error", message: "Enable either pickup or delivery fulfillment." });
      return;
    }

    setErrors({});
    setFeedback(null);
    updateMutation.mutate(result.data);
  };

  const previewAddress = [formValues.address, formValues.city, formValues.state, formValues.pincode]
    .filter(Boolean)
    .join(", ");

  const persistMode = (mode: "pickup" | "delivery" | "both") => {
    const supportsPickup = mode !== "delivery";
    const supportsDelivery = mode !== "pickup";
    setFormValues((current) => ({
      ...current,
      pickupEnabled: supportsPickup,
      deliveryEnabled: supportsDelivery,
      supportsPickup,
      supportsDelivery,
    }));
    updateMutation.mutate({
      pickupEnabled: supportsPickup,
      deliveryEnabled: supportsDelivery,
      supportsPickup,
      supportsDelivery,
    });
  };

  const tabs: Array<{ id: TabType; label: string; icon: any }> = [
    { id: "profile", label: "Store Profile", icon: StoreIcon },
    { id: "fulfillment", label: "Delivery & Slots", icon: Truck },
    { id: "hours", label: "Business Hours", icon: Clock },
    { id: "appearance", label: "Branding Preview", icon: ImageIcon },
    { id: "security", label: "Security & Login", icon: Shield },
    { id: "policies", label: "Store Policies", icon: FileText },
  ];

  return (
    <div className="space-y-6">
      {/* Sub-navigation tabs */}
      <div className="flex flex-wrap gap-2 border-b border-stone-200 dark:border-stone-800">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = tab.id === activeTab;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 border-b-2 px-3 py-2.5 text-xs font-semibold transition ${
                isActive
                  ? "border-emerald-600 text-emerald-700 dark:border-emerald-400 dark:text-emerald-300"
                  : "border-transparent text-stone-600 hover:text-stone-900 dark:text-stone-400 dark:hover:text-stone-200"
              }`}
            >
              <Icon className="h-4 w-4" />
              {tab.label}
            </button>
          );
        })}
      </div>

      <form className="space-y-6" onSubmit={handleSubmit}>
        {feedback && (
          <div
            className={`rounded-2xl border p-4 text-xs font-semibold ${
              feedback.type === "success"
                ? "border-emerald-200 bg-emerald-50 text-emerald-800 dark:border-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-300"
                : "border-rose-200 bg-rose-50 text-rose-800 dark:border-rose-900 dark:bg-rose-950/40 dark:text-rose-300"
            }`}
          >
            {feedback.message}
          </div>
        )}

        {/* Tab 1: Profile & Address */}
        {activeTab === "profile" && (
          <>
            <DashboardCard title="Store Profile" description="Basic information displayed to shoppers on the SheoMart app.">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-1.5 text-xs">
                  <span className="font-semibold text-stone-700 dark:text-stone-300">Store Name</span>
                  <p className="rounded-xl bg-stone-50 px-3 py-2.5 text-stone-700 dark:bg-stone-950 dark:text-stone-300 font-bold">
                    {store.storeName ?? store.name ?? "-"}
                  </p>
                </div>
                <div className="space-y-1.5 text-xs">
                  <span className="font-semibold text-stone-700 dark:text-stone-300">Merchant Owner</span>
                  <p className="rounded-xl bg-stone-50 px-3 py-2.5 text-stone-700 dark:bg-stone-950 dark:text-stone-300">
                    {ownerName || "-"}
                  </p>
                </div>
                <div className="space-y-1.5 text-xs">
                  <span className="font-semibold text-stone-700 dark:text-stone-300">Email Address</span>
                  <p className="rounded-xl bg-stone-50 px-3 py-2.5 text-stone-700 dark:bg-stone-950 dark:text-stone-300">
                    {ownerEmail || store.email || "-"}
                  </p>
                </div>
                <div className="space-y-1.5 text-xs">
                  <span className="font-semibold text-stone-700 dark:text-stone-300">Verification Tier</span>
                  <p className="flex items-center gap-1.5 rounded-xl bg-stone-50 px-3 py-2.5 text-stone-700 dark:bg-stone-950 dark:text-stone-300">
                    <BadgeCheck className="h-4 w-4 text-blue-500" />
                    {store.badge === "royal" ? "Royal Merchant" : store.badge === "verified" ? "Verified Store" : "Standard Store"}
                  </p>
                </div>
              </div>

              <div className="mt-4 grid gap-5 md:grid-cols-2">
                {/* Store Logo Section */}
                <div className="space-y-3 rounded-2xl border border-stone-200/80 bg-stone-50/50 p-4 dark:border-stone-800 dark:bg-stone-900/40">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-xs font-semibold text-stone-900 dark:text-stone-100">Store Logo</h4>
                      <p className="text-[11px] text-stone-500 dark:text-stone-400">Direct Cloudinary upload or paste URL</p>
                    </div>
                    {formValues.logo ? (
                      <button
                        type="button"
                        onClick={() => setValue("logo", "")}
                        className="inline-flex items-center gap-1 rounded-lg px-2 py-1 text-[10px] font-medium text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition"
                      >
                        <Trash2 className="h-3 w-3" /> Clear
                      </button>
                    ) : null}
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-2xl border border-stone-200 bg-white shadow-sm dark:border-stone-800 dark:bg-stone-950 flex items-center justify-center">
                      {formValues.logo ? (
                        <img
                          src={formValues.logo}
                          alt="Store Logo"
                          className="h-full w-full object-cover"
                          onError={(e) => {
                            (e.target as HTMLElement).style.display = "none";
                          }}
                        />
                      ) : (
                        <StoreIcon className="h-7 w-7 text-stone-400" />
                      )}
                    </div>
                    <div className="flex-1 space-y-1.5">
                      <input
                        type="file"
                        ref={logoInputRef}
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => handleFileUpload(e, "logo")}
                      />
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        disabled={uploadingLogo}
                        onClick={() => logoInputRef.current?.click()}
                        className="w-full text-xs font-medium border-emerald-300 text-emerald-700 hover:bg-emerald-50 dark:border-emerald-800/70 dark:text-emerald-300 dark:hover:bg-emerald-950/40"
                      >
                        {uploadingLogo ? (
                          <>
                            <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
                            Uploading to Cloudinary...
                          </>
                        ) : (
                          <>
                            <Upload className="mr-1.5 h-3.5 w-3.5" />
                            Upload Logo (Cloudinary)
                          </>
                        )}
                      </Button>
                      <p className="text-[10px] text-stone-400 dark:text-stone-500">Max size: 5MB (PNG, JPG, WebP)</p>
                    </div>
                  </div>

                  <Field
                    label="Store Logo Image URL"
                    value={formValues.logo}
                    onChange={(value) => setValue("logo", value)}
                    error={errors.logo}
                    type="url"
                    placeholder="https://..."
                  />
                </div>

                {/* Store Banner Section */}
                <div className="space-y-3 rounded-2xl border border-stone-200/80 bg-stone-50/50 p-4 dark:border-stone-800 dark:bg-stone-900/40">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-xs font-semibold text-stone-900 dark:text-stone-100">Store Banner Cover</h4>
                      <p className="text-[11px] text-stone-500 dark:text-stone-400">Direct Cloudinary upload or paste URL</p>
                    </div>
                    {formValues.banner ? (
                      <button
                        type="button"
                        onClick={() => setValue("banner", "")}
                        className="inline-flex items-center gap-1 rounded-lg px-2 py-1 text-[10px] font-medium text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition"
                      >
                        <Trash2 className="h-3 w-3" /> Clear
                      </button>
                    ) : null}
                  </div>

                  <div className="relative h-20 w-full overflow-hidden rounded-xl border border-stone-200 bg-white shadow-sm dark:border-stone-800 dark:bg-stone-950 flex items-center justify-center">
                    {formValues.banner ? (
                      <img
                        src={formValues.banner}
                        alt="Store Banner"
                        className="h-full w-full object-cover"
                        onError={(e) => {
                          (e.target as HTMLElement).style.display = "none";
                        }}
                      />
                    ) : (
                      <div className="flex items-center gap-2 text-stone-400 text-xs">
                        <ImageIcon className="h-5 w-5" />
                        <span>No banner set</span>
                      </div>
                    )}
                  </div>

                  <div className="space-y-1.5">
                    <input
                      type="file"
                      ref={bannerInputRef}
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => handleFileUpload(e, "banner")}
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      disabled={uploadingBanner}
                      onClick={() => bannerInputRef.current?.click()}
                      className="w-full text-xs font-medium border-emerald-300 text-emerald-700 hover:bg-emerald-50 dark:border-emerald-800/70 dark:text-emerald-300 dark:hover:bg-emerald-950/40"
                    >
                      {uploadingBanner ? (
                        <>
                          <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
                          Uploading to Cloudinary...
                        </>
                      ) : (
                        <>
                          <Upload className="mr-1.5 h-3.5 w-3.5" />
                          Upload Banner (Cloudinary)
                        </>
                      )}
                    </Button>
                    <p className="text-[10px] text-stone-400 dark:text-stone-500">Max size: 5MB (PNG, JPG, WebP)</p>
                  </div>

                  <Field
                    label="Store Banner Cover URL"
                    value={formValues.banner}
                    onChange={(value) => setValue("banner", value)}
                    error={errors.banner}
                    type="url"
                    placeholder="https://..."
                  />
                </div>
                <label className="space-y-1.5 text-xs font-semibold text-stone-700 dark:text-stone-300 md:col-span-2">
                  <span>Store Description & Specialties</span>
                  <textarea
                    value={formValues.description}
                    onChange={(event) => setValue("description", event.target.value)}
                    maxLength={1000}
                    rows={3}
                    className="w-full rounded-xl border border-stone-200 bg-white px-3 py-2 text-xs outline-none focus:border-emerald-500 dark:border-stone-800 dark:bg-stone-950"
                  />
                </label>
                <Field
                  label="Contact Phone"
                  value={formValues.phone}
                  onChange={(value) => setValue("phone", value)}
                  error={errors.phone}
                  inputMode="numeric"
                />
              </div>
            </DashboardCard>

            <DashboardCard title="Store Location" description="Physical address used for route dispatch and customer self-pickup.">
              <div className="grid gap-4 md:grid-cols-2">
                <Field label="Address / Street" value={formValues.address} onChange={(value) => setValue("address", value)} error={errors.address} />
                <Field label="City" value={formValues.city} onChange={(value) => setValue("city", value)} error={errors.city} />
                <Field label="State" value={formValues.state} onChange={(value) => setValue("state", value)} error={errors.state} />
                <Field label="Pincode" value={formValues.pincode} onChange={(value) => setValue("pincode", value)} error={errors.pincode} inputMode="numeric" />
              </div>
            </DashboardCard>
          </>
        )}

        {/* Tab 2: Delivery & Slots */}
        {activeTab === "fulfillment" && (
          <DashboardCard title="Delivery & Fulfillment Controls" description="Configure radius, delivery charges, and hourly delivery windows.">
            <div className="space-y-4">
              <div className="grid gap-3 sm:grid-cols-3">
                {[
                  { value: "pickup", label: "Self-Pickup Only", icon: StoreIcon },
                  { value: "delivery", label: "Doorstep Delivery Only", icon: Truck },
                  { value: "both", label: "Both Pickup & Delivery", icon: CheckCircle2 },
                ].map(({ value, label, icon: Icon }) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() => persistMode(value as any)}
                    className={`rounded-2xl border p-4 text-left transition ${
                      (value === "pickup" && formValues.supportsPickup && !formValues.supportsDelivery) ||
                      (value === "delivery" && formValues.supportsDelivery && !formValues.supportsPickup) ||
                      (value === "both" && formValues.supportsPickup && formValues.supportsDelivery)
                        ? "border-emerald-500 bg-emerald-50/60 dark:bg-emerald-950/30 ring-2 ring-emerald-500/20"
                        : "border-stone-200 dark:border-stone-800"
                    }`}
                  >
                    <Icon className="h-5 w-5 text-emerald-600" />
                    <span className="mt-2 block text-xs font-bold text-stone-900 dark:text-stone-100">
                      {label}
                    </span>
                  </button>
                ))}
              </div>

              <div className="grid gap-4 sm:grid-cols-3">
                <Field
                  label="Preparation Time (Minutes)"
                  type="number"
                  min="1"
                  value={String(formValues.preparationTimeMinutes)}
                  onChange={(v) => setFormValues((c) => ({ ...c, preparationTimeMinutes: Number(v) }))}
                />
                <Field
                  label="Delivery Radius (Kilometers)"
                  type="number"
                  min="1"
                  value={String(formValues.deliveryRadiusKm)}
                  onChange={(v) => setFormValues((c) => ({ ...c, deliveryRadiusKm: Number(v) }))}
                />
                <Field
                  label="Standard Delivery Fee (₹)"
                  type="number"
                  min="0"
                  value={String(formValues.deliveryFee)}
                  onChange={(v) => setFormValues((c) => ({ ...c, deliveryFee: Number(v) }))}
                />
                <Field
                  label="Free Delivery Above (₹)"
                  type="number"
                  min="0"
                  value={String(formValues.freeDeliveryAbove)}
                  onChange={(v) => setFormValues((c) => ({ ...c, freeDeliveryAbove: Number(v) }))}
                />
              </div>

              {/* Delivery Slots Section */}
              <div className="mt-6 border-t border-stone-200 pt-5 dark:border-stone-800">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <h4 className="text-xs font-bold text-stone-900 dark:text-stone-100">
                      Customer Delivery Slots
                    </h4>
                    <p className="text-[11px] text-stone-400">Time windows selectable at checkout</p>
                  </div>
                </div>

                <div className="grid gap-2">
                  {formValues.deliverySlots.map((slot) => (
                    <div
                      key={slot.slotId}
                      className="flex items-center justify-between rounded-xl border border-stone-200 bg-stone-50 p-3 text-xs dark:border-stone-800 dark:bg-stone-950"
                    >
                      <div>
                        <span className="font-bold text-stone-900 dark:text-stone-100">{slot.label}</span>
                        <p className="text-[11px] text-stone-400">
                          {slot.startTime} - {slot.endTime} • {slot.capacity ? `${slot.capacity} orders max` : "Unlimited capacity"}
                        </p>
                      </div>
                      <span className={`rounded-md px-2 py-0.5 text-[10px] font-bold ${
                        slot.isActive
                          ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300"
                          : "bg-stone-200 text-stone-600 dark:bg-stone-800"
                      }`}>
                        {slot.isActive ? "Active Slot" : "Disabled"}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </DashboardCard>
        )}

        {/* Tab 3: Business Hours */}
        {activeTab === "hours" && (
          <DashboardCard title="Operating Hours & Availability" description="Set your daily opening and closing hours for orders and counter pickups.">
            <div className="space-y-4">
              <label className="flex items-center justify-between rounded-2xl border border-stone-200 p-4 text-xs font-semibold dark:border-stone-800 bg-stone-50/50 dark:bg-stone-950/50">
                <div>
                  <span className="text-stone-900 dark:text-stone-100 block">Accepting Orders Today</span>
                  <span className="text-[11px] text-stone-400">Toggle offline during holidays or maintenance</span>
                </div>
                <input
                  type="checkbox"
                  checked={isStoreOpen}
                  onChange={(e) => setIsStoreOpen(e.target.checked)}
                  className="h-4 w-4 rounded border-stone-300 text-emerald-600 focus:ring-emerald-500"
                />
              </label>

              <div className="grid gap-4 sm:grid-cols-2">
                <Field
                  label="Daily Opening Time"
                  type="time"
                  value={formValues.pickupOpeningTime}
                  onChange={(v) => setValue("pickupOpeningTime", v)}
                />
                <Field
                  label="Daily Closing Time"
                  type="time"
                  value={formValues.pickupClosingTime}
                  onChange={(v) => setValue("pickupClosingTime", v)}
                />
              </div>
            </div>
          </DashboardCard>
        )}

        {/* Tab 4: Appearance & Preview */}
        {activeTab === "appearance" && (
          <div className="space-y-6">
            <ThemeSelectionCard />
            <DashboardCard title="Store Branding Preview" description="How your store appears to customers browsing the SheoMart app.">
            <div className="overflow-hidden rounded-2xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 shadow-sm">
              <div className="h-36 bg-stone-100 dark:bg-stone-800 relative">
                {formValues.banner ? (
                  <img src={formValues.banner} alt="Store banner" className="h-full w-full object-cover" />
                ) : (
                  <div className="flex h-full items-center justify-center text-stone-400">
                    <ImageIcon className="h-8 w-8" />
                  </div>
                )}
              </div>
              <div className="flex gap-4 p-5">
                <div className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-2xl border border-stone-200 bg-white dark:border-stone-700 dark:bg-stone-950 -mt-8 shadow-md">
                  {formValues.logo ? (
                    <img src={formValues.logo} alt="Store logo" className="h-full w-full object-cover" />
                  ) : (
                    <StoreIcon className="h-8 w-8 text-emerald-600" />
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="text-base font-bold text-stone-900 dark:text-stone-50">
                      {store.storeName ?? store.name ?? "My Store"}
                    </h3>
                    {store.badge === "royal" ? (
                      <span className="rounded-full bg-amber-50 px-2 py-0.5 text-[10px] font-bold text-amber-700 border border-amber-300">Royal</span>
                    ) : (
                      <span className="rounded-full bg-blue-50 px-2 py-0.5 text-[10px] font-bold text-blue-700 border border-blue-300">Verified</span>
                    )}
                  </div>
                  <p className="mt-1 text-xs text-stone-500 line-clamp-2">
                    {formValues.description || "No description set yet."}
                  </p>
                  <p className="mt-1.5 flex items-center gap-1 text-[11px] text-stone-400">
                    <MapPin className="h-3 w-3" />
                    {previewAddress || "Address not specified"}
                  </p>
                </div>
              </div>
            </div>
          </DashboardCard>
          </div>
        )}

        {/* Tab 5: Security */}
        {activeTab === "security" && (
          <DashboardCard title="Store Security & Password Reset" description="Request an admin-approved security token to change merchant credentials.">
            <SellerSecurityRequestCard
              email={ownerEmail || ""}
              storeName={store.storeName ?? store.name ?? ""}
            />
          </DashboardCard>
        )}

        {/* Tab 6: Policies */}
        {activeTab === "policies" && (
          <DashboardCard title="Store Customer Policies" description="Standard store guidelines shown to shoppers before checkout.">
            <div className="space-y-4 text-xs">
              <div className="rounded-xl border border-stone-200 bg-stone-50 p-4 dark:border-stone-800 dark:bg-stone-950">
                <h4 className="font-bold text-stone-900 dark:text-stone-100 mb-1">Return & Replacement Policy</h4>
                <p className="text-stone-500 leading-relaxed">
                  Perishable grocery items (dairy, fruits, vegetables) must be verified at counter pickup or delivery doorstep. Non-perishable items can be returned within 24 hours in sealed condition.
                </p>
              </div>

              <div className="rounded-xl border border-stone-200 bg-stone-50 p-4 dark:border-stone-800 dark:bg-stone-950">
                <h4 className="font-bold text-stone-900 dark:text-stone-100 mb-1">Cancellation Policy</h4>
                <p className="text-stone-500 leading-relaxed">
                  Orders may be cancelled freely prior to order acceptance by the merchant. Once packing is initiated, cancellation requires store approval.
                </p>
              </div>
            </div>
          </DashboardCard>
        )}

        {/* Bottom Save Bar */}
        <div className="flex justify-end pt-4 border-t border-stone-200 dark:border-stone-800">
          <Button
            type="submit"
            disabled={updateMutation.isPending}
            className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold"
          >
            {updateMutation.isPending ? "Saving changes..." : "Save Store Settings"}
          </Button>
        </div>
      </form>
    </div>
  );
}

export default function StoreSettingsPage() {
  const user = useAuthStore((state) => state.user);
  const storeQuery = useQuery<StoreItem | null, Error>({
    queryKey: ["my-store"],
    queryFn: fetchMyStore,
    staleTime: 1000 * 60 * 5,
  });

  return (
    <DashboardContent className="space-y-6">
      <Breadcrumb items={[{ label: "Settings" }]} />
      <PageHeader
        category="SETTINGS"
        title="Store Control Center & Settings"
        description="Configure your retail profile, delivery perimeter, operating hours, and appearance."
      />
      {storeQuery.isLoading ? <LoadingSkeleton rows={5} /> : null}
      {storeQuery.isError ? <ErrorState message={storeQuery.error.message} /> : null}
      {storeQuery.data ? (
        <StoreSettingsForm
          key={storeQuery.data.storeId ?? storeQuery.data._id}
          store={storeQuery.data}
          fallbackPhone={user?.mobile ?? ""}
          ownerName={user?.name ?? ""}
          ownerEmail={user?.email ?? ""}
        />
      ) : null}
    </DashboardContent>
  );
}
