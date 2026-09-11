"use client";

import { useMemo, useRef, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { CalendarDays, Check, ImagePlus, Pencil, Plus, Search, Tag, Trash2, Upload, X } from "lucide-react";
import { Breadcrumb } from "@/components/dashboard/layout/Breadcrumb";
import { DashboardCard } from "@/components/dashboard/DashboardCard";
import { DashboardContent } from "@/components/dashboard/layout/DashboardContent";
import { PageHeader } from "@/components/dashboard/layout/PageHeader";
import { Button } from "@/components/ui/button";
import { fetchCategories } from "@/services/category";
import {
  createCoupon,
  createOffer,
  deleteCoupon,
  deleteOffer,
  fetchAdminCoupons,
  fetchAdminOffers,
  updateCoupon,
  updateOffer,
  type CouponItem,
  type DiscountType,
  type OfferItem,
  type PromotionStatus,
} from "@/services/promotions";

type PromotionKind = "coupons" | "offers";
type Promotion = CouponItem | OfferItem;
type FormState = Record<string, string | number | boolean | string[]>;

const inputClass = "min-h-11 w-full rounded-lg border border-stone-200 bg-white px-3 py-2 text-sm text-stone-900 outline-none transition focus:border-emerald-500 dark:border-stone-700 dark:bg-stone-950 dark:text-stone-100";
const labelClass = "space-y-1.5 text-sm font-medium text-stone-700 dark:text-stone-200";

function toDateInput(value?: string) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  const offset = date.getTimezoneOffset();
  return new Date(date.getTime() - offset * 60000).toISOString().slice(0, 16);
}

function fromDateInput(value: string) {
  return new Date(value).toISOString();
}

function statusLabel(item: Promotion): PromotionStatus {
  if (!item.isActive) return "inactive";
  const now = Date.now();
  if (new Date(item.startsAt).getTime() > now) return "scheduled";
  if (new Date(item.endsAt).getTime() < now) return "expired";
  return "active";
}

function statusStyles(status: PromotionStatus) {
  if (status === "active") return "bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300";
  if (status === "scheduled") return "bg-sky-50 text-sky-700 dark:bg-sky-500/10 dark:text-sky-300";
  if (status === "expired") return "bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-300";
  return "bg-stone-100 text-stone-600 dark:bg-stone-800 dark:text-stone-300";
}

function discountText(item: Promotion) {
  return item.discountType === "percentage" ? `${item.discountValue}% off` : `₹${item.discountValue} off`;
}

function initialForm(kind: PromotionKind, item?: Promotion): FormState {
  if (kind === "coupons") {
    const coupon = item as CouponItem | undefined;
    return {
      title: coupon?.title ?? "",
      code: coupon?.code ?? "",
      discountType: coupon?.discountType ?? "percentage",
      discountValue: coupon?.discountValue ?? 10,
      minimumCartValue: coupon?.minimumCartValue ?? 0,
      maximumDiscount: coupon?.maximumDiscount ?? "",
      usageLimit: coupon?.usageLimit ?? "",
      oncePerCustomer: coupon?.oncePerCustomer ?? true,
      startsAt: toDateInput(coupon?.startsAt) || toDateInput(new Date().toISOString()),
      endsAt: toDateInput(coupon?.endsAt),
      isActive: coupon?.isActive ?? true,
    };
  }

  const offer = item as OfferItem | undefined;
  return {
    title: offer?.title ?? "",
    festivalName: offer?.festivalName ?? "",
    categoryIds: offer?.categoryIds ?? [],
    discountType: offer?.discountType ?? "percentage",
    discountValue: offer?.discountValue ?? 10,
    bannerImage: offer?.bannerImage ?? "",
    priority: offer?.priority ?? 0,
    startsAt: toDateInput(offer?.startsAt) || toDateInput(new Date().toISOString()),
    endsAt: toDateInput(offer?.endsAt),
    isActive: offer?.isActive ?? true,
  };
}

function PromotionDialog({ kind, item, categories, onClose, onSave, isSaving }: { kind: PromotionKind; item?: Promotion | null; categories: Array<{ categoryId?: string; name: string }>; onClose: () => void; onSave: (form: FormState) => void; isSaving: boolean }) {
  const [form, setForm] = useState<FormState>(() => initialForm(kind, item ?? undefined));
  const [preview, setPreview] = useState((item as OfferItem | undefined)?.bannerImage ?? "");
  const fileRef = useRef<HTMLInputElement | null>(null);
  const set = (key: string, value: string | number | boolean | string[]) => setForm((current) => ({ ...current, [key]: value }));
  const isCoupon = kind === "coupons";

  const submit = (event: React.FormEvent) => {
    event.preventDefault();
    onSave(form);
  };

  const pickBanner = (file?: File) => {
    if (!file) return;
    setPreview(URL.createObjectURL(file));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-stone-950/70 p-4" role="dialog" aria-modal="true" aria-labelledby="promotion-dialog-title">
      <form onSubmit={submit} className="my-8 w-full max-w-3xl rounded-xl border border-stone-200 bg-white p-5 shadow-2xl dark:border-stone-800 dark:bg-stone-950 sm:p-7">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 id="promotion-dialog-title" className="text-xl font-semibold text-stone-900 dark:text-stone-50">{item ? "Edit" : "Create"} {isCoupon ? "coupon" : "festival offer"}</h2>
            <p className="mt-1 text-sm text-stone-500 dark:text-stone-400">Configure the promotion details, timing, and visibility.</p>
          </div>
          <Button type="button" variant="ghost" size="icon" onClick={onClose} aria-label="Close promotion dialog"><X className="h-4 w-4" /></Button>
        </div>

        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          <label className={labelClass}><span>{isCoupon ? "Title" : "Offer title"}</span><input required className={inputClass} value={String(form.title ?? "")} onChange={(event) => set("title", event.target.value)} /></label>
          {isCoupon ? <label className={labelClass}><span>Coupon code</span><input required className={`${inputClass} uppercase`} value={String(form.code ?? "")} onChange={(event) => set("code", event.target.value.toUpperCase())} /></label> : <label className={labelClass}><span>Festival</span><input required className={inputClass} value={String(form.festivalName ?? "")} onChange={(event) => set("festivalName", event.target.value)} /></label>}
          <label className={labelClass}><span>Discount type</span><select className={inputClass} value={String(form.discountType)} onChange={(event) => set("discountType", event.target.value as DiscountType)}><option value="percentage">Percentage</option><option value="flat">Flat ₹</option></select></label>
          <label className={labelClass}><span>Discount value</span><input required min="0" step="0.01" type="number" className={inputClass} value={String(form.discountValue)} onChange={(event) => set("discountValue", Number(event.target.value))} /></label>
          {isCoupon ? <>
            <label className={labelClass}><span>Minimum purchase (₹)</span><input min="0" step="0.01" type="number" className={inputClass} value={String(form.minimumCartValue)} onChange={(event) => set("minimumCartValue", Number(event.target.value))} /></label>
            <label className={labelClass}><span>Maximum discount (₹, optional)</span><input min="0" step="0.01" type="number" className={inputClass} value={String(form.maximumDiscount)} onChange={(event) => set("maximumDiscount", event.target.value ? Number(event.target.value) : "")} /></label>
            <label className={labelClass}><span>Usage limit (optional)</span><input min="1" step="1" type="number" className={inputClass} value={String(form.usageLimit)} onChange={(event) => set("usageLimit", event.target.value ? Number(event.target.value) : "")} /></label>
            <label className="flex min-h-11 items-center gap-3 rounded-lg border border-stone-200 px-3 text-sm dark:border-stone-700"><input type="checkbox" checked={Boolean(form.oncePerCustomer)} onChange={(event) => set("oncePerCustomer", event.target.checked)} className="h-4 w-4 accent-emerald-600" /><span>Once per customer</span></label>
          </> : <>
            <label className={labelClass}><span>Priority</span><input min="0" step="1" type="number" className={inputClass} value={String(form.priority)} onChange={(event) => set("priority", Number(event.target.value))} /></label>
            <div className="sm:col-span-2"><span className="mb-1.5 block text-sm font-medium text-stone-700 dark:text-stone-200">Categories</span><div className="flex max-h-28 flex-wrap gap-2 overflow-y-auto rounded-lg border border-stone-200 p-3 dark:border-stone-700">{categories.map((category) => { const id = category.categoryId ?? category.name; const selected = (form.categoryIds as string[]).includes(id); return <button key={id} type="button" onClick={() => set("categoryIds", selected ? (form.categoryIds as string[]).filter((value) => value !== id) : [...(form.categoryIds as string[]), id])} className={`rounded-full border px-3 py-1.5 text-xs ${selected ? "border-emerald-500 bg-emerald-500 text-white" : "border-stone-200 text-stone-600 dark:border-stone-700 dark:text-stone-300"}`}>{selected ? <Check className="mr-1 inline h-3 w-3" /> : null}{category.name}</button>; })}</div></div>
            <label className={labelClass}><span>Banner image URL</span><input required className={inputClass} value={String(form.bannerImage ?? "")} onChange={(event) => { set("bannerImage", event.target.value); setPreview(event.target.value); }} placeholder="https://..." /></label>
            <label className="flex min-h-11 cursor-pointer items-center justify-center gap-2 rounded-lg border border-dashed border-emerald-300 px-3 text-sm text-emerald-700 dark:border-emerald-800 dark:text-emerald-300"><Upload className="h-4 w-4" />Choose banner preview<input ref={fileRef} type="file" accept="image/*" className="sr-only" onChange={(event) => pickBanner(event.target.files?.[0])} /></label>
            {preview ? <div className="sm:col-span-2"><img src={preview} alt="Offer banner preview" className="h-32 w-full rounded-lg object-cover" onError={() => setPreview("")} /></div> : null}
          </>}
          <label className={labelClass}><span>Start date</span><span className="relative block"><CalendarDays className="pointer-events-none absolute left-3 top-3 h-4 w-4 text-stone-400" /><input required type="datetime-local" className={`${inputClass} pl-10`} value={String(form.startsAt)} onChange={(event) => set("startsAt", event.target.value)} /></span></label>
          <label className={labelClass}><span>End date</span><span className="relative block"><CalendarDays className="pointer-events-none absolute left-3 top-3 h-4 w-4 text-stone-400" /><input required type="datetime-local" className={`${inputClass} pl-10`} value={String(form.endsAt)} onChange={(event) => set("endsAt", event.target.value)} /></span></label>
          <label className="flex min-h-11 items-center gap-3 rounded-lg border border-stone-200 px-3 text-sm dark:border-stone-700"><input type="checkbox" checked={Boolean(form.isActive)} onChange={(event) => set("isActive", event.target.checked)} className="h-4 w-4 accent-emerald-600" /><span>{form.isActive ? "Active" : "Draft"}</span></label>
        </div>
        <div className="mt-6 flex justify-end gap-2"><Button type="button" variant="outline" onClick={onClose}>Cancel</Button><Button type="submit" disabled={isSaving}>{isSaving ? "Saving..." : item ? "Save changes" : "Create promotion"}</Button></div>
      </form>
    </div>
  );
}

export function PromotionsManager({ kind }: { kind: PromotionKind }) {
  const queryClient = useQueryClient();
  const isCoupon = kind === "coupons";
  const queryKey = [kind === "coupons" ? "admin-coupons" : "admin-offers"];
  const [query, setQuery] = useState("");
  const [editing, setEditing] = useState<Promotion | null | undefined>(undefined);
  const [pendingDelete, setPendingDelete] = useState<Promotion | null>(null);
  const [feedback, setFeedback] = useState<string | null>(null);
  const { data: items = [], isLoading, isError, error } = useQuery<Promotion[], Error>({ queryKey, queryFn: isCoupon ? fetchAdminCoupons : fetchAdminOffers });
  const { data: categories = [] } = useQuery({ queryKey: ["categories"], queryFn: fetchCategories, staleTime: 300000, enabled: !isCoupon });

  const saveMutation = useMutation({
    mutationFn: async (form: FormState) => {
      const payload: Record<string, unknown> = { ...form, startsAt: fromDateInput(String(form.startsAt)), endsAt: fromDateInput(String(form.endsAt)) };
      for (const key of ["maximumDiscount", "usageLimit"]) if (payload[key] === "") payload[key] = null;
      if (isCoupon) return editing && "couponId" in editing ? updateCoupon(editing.couponId, payload) : createCoupon(payload);
      return editing && "offerId" in editing ? updateOffer(editing.offerId, payload) : createOffer(payload);
    },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey }); queryClient.invalidateQueries({ queryKey: [isCoupon ? "coupons" : "offers"] }); setEditing(undefined); setFeedback(`${isCoupon ? "Coupon" : "Offer"} saved successfully.`); },
    onError: (mutationError: unknown) => setFeedback(mutationError instanceof Error ? mutationError.message : "Unable to save promotion."),
  });

  const deleteMutation = useMutation<Promotion | undefined, Error, void>({
    mutationFn: () => isCoupon ? deleteCoupon((pendingDelete as CouponItem).couponId) : deleteOffer((pendingDelete as OfferItem).offerId),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey }); queryClient.invalidateQueries({ queryKey: [isCoupon ? "coupons" : "offers"] }); setPendingDelete(null); setFeedback(`${isCoupon ? "Coupon" : "Offer"} deactivated.`); },
    onError: (mutationError: unknown) => setFeedback(mutationError instanceof Error ? mutationError.message : "Unable to delete promotion."),
  });

  const filtered = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    if (!normalized) return items;
    return items.filter((item) => `${"title" in item ? item.title : ""} ${"code" in item ? item.code : ""} ${"festivalName" in item ? item.festivalName : ""}`.toLowerCase().includes(normalized));
  }, [items, query]);
  const activeCount = items.filter((item) => statusLabel(item) === "active").length;
  const scheduledCount = items.filter((item) => statusLabel(item) === "scheduled").length;
  const totalUsage = items.reduce((sum, item) => sum + ("usageCount" in item ? item.usageCount : 0), 0);

  return <DashboardContent className="space-y-6">
    <Breadcrumb items={[{ label: "Admin" }, { label: isCoupon ? "Coupons" : "Festival offers" }]} />
    <PageHeader title={isCoupon ? "Coupon management" : "Festival offer management"} description={isCoupon ? "Create and manage discount codes, usage limits, and customer eligibility." : "Schedule seasonal campaigns, target categories, and manage offer visibility."} actions={<Button onClick={() => setEditing(null)}><Plus className="h-4 w-4" />New {isCoupon ? "coupon" : "offer"}</Button>} />
    {feedback ? <div className="flex items-center justify-between rounded-lg border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-700 dark:border-emerald-900/70 dark:bg-emerald-950/40 dark:text-emerald-300">{feedback}<button type="button" onClick={() => setFeedback(null)} aria-label="Dismiss notification"><X className="h-4 w-4" /></button></div> : null}
    <div className="grid gap-3 sm:grid-cols-3"><DashboardCard title="Total" description="All promotions"><p className="text-3xl font-semibold text-emerald-600 dark:text-emerald-400">{items.length}</p></DashboardCard><DashboardCard title="Active" description="Live right now"><p className="text-3xl font-semibold text-emerald-600 dark:text-emerald-400">{activeCount}</p></DashboardCard><DashboardCard title={isCoupon ? "Redemptions" : "Scheduled"} description={isCoupon ? "Total recorded usage" : "Upcoming campaigns"}><p className="text-3xl font-semibold text-emerald-600 dark:text-emerald-400">{isCoupon ? totalUsage : scheduledCount}</p></DashboardCard></div>
    <DashboardCard title={isCoupon ? "Coupons" : "Festival offers"} description="Use the controls below to manage your promotions.">
      <label className="mb-5 flex max-w-md items-center gap-2 rounded-lg border border-stone-200 bg-white px-3 py-2 text-sm text-stone-500 dark:border-stone-700 dark:bg-stone-900 dark:text-stone-400"><Search className="h-4 w-4" /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder={`Search ${isCoupon ? "coupons" : "offers"}`} className="w-full bg-transparent outline-none" /></label>
      {isLoading ? <p className="py-10 text-center text-sm text-stone-500">Loading promotions...</p> : isError ? <p className="rounded-lg border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700 dark:border-rose-900/70 dark:bg-rose-950/40 dark:text-rose-300">{error?.message ?? "Unable to load promotions."}</p> : filtered.length === 0 ? <p className="py-10 text-center text-sm text-stone-500">No promotions found.</p> : <div className="space-y-3">{filtered.map((item) => { const status = statusLabel(item); const id = isCoupon ? (item as CouponItem).couponId : (item as OfferItem).offerId; return <article key={id} className="flex flex-col gap-4 rounded-lg border border-stone-200 bg-white p-4 dark:border-stone-800 dark:bg-stone-900/80 sm:flex-row sm:items-center sm:justify-between"><div className="flex min-w-0 items-start gap-3">{!isCoupon ? <div className="flex h-14 w-20 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-stone-100 dark:bg-stone-800">{(item as OfferItem).bannerImage ? <img src={(item as OfferItem).bannerImage} alt="" className="h-full w-full object-cover" /> : <ImagePlus className="h-5 w-5 text-stone-400" />}</div> : <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-300"><Tag className="h-5 w-5" /></div>}<div className="min-w-0"><div className="flex flex-wrap items-center gap-2"><h3 className="truncate font-semibold text-stone-900 dark:text-stone-50">{"title" in item ? item.title : "Promotion"}</h3><span className={`rounded-full px-2.5 py-1 text-xs font-medium capitalize ${statusStyles(status)}`}>{status}</span></div><p className="mt-1 text-sm text-stone-500 dark:text-stone-400">{isCoupon ? (item as CouponItem).code : (item as OfferItem).festivalName} · {discountText(item)}</p><p className="mt-1 flex items-center gap-1 text-xs text-stone-400"><CalendarDays className="h-3.5 w-3.5" />{new Date(item.startsAt).toLocaleDateString()} – {new Date(item.endsAt).toLocaleDateString()}{isCoupon ? ` · ${(item as CouponItem).usageCount} used` : ` · Priority ${(item as OfferItem).priority}`}</p></div></div><div className="flex shrink-0 gap-2"><Button variant="outline" size="sm" onClick={() => setEditing(item)}><Pencil className="h-4 w-4" />Edit</Button><Button variant="outline" size="sm" onClick={() => setPendingDelete(item)}><Trash2 className="h-4 w-4" />Delete</Button></div></article>; })}</div>}
    </DashboardCard>
    {editing !== undefined ? <PromotionDialog kind={kind} item={editing} categories={categories} onClose={() => setEditing(undefined)} onSave={(form) => saveMutation.mutate(form)} isSaving={saveMutation.isPending} /> : null}
    {pendingDelete ? <div className="fixed inset-0 z-50 flex items-center justify-center bg-stone-950/70 p-4" role="dialog" aria-modal="true"><div className="w-full max-w-md rounded-xl border border-stone-200 bg-white p-6 shadow-2xl dark:border-stone-800 dark:bg-stone-950"><h2 className="text-lg font-semibold text-stone-900 dark:text-stone-50">Deactivate this {isCoupon ? "coupon" : "offer"}?</h2><p className="mt-2 text-sm text-stone-500 dark:text-stone-400">It will no longer be available to shoppers, but its record will remain available for reporting.</p><div className="mt-6 flex justify-end gap-2"><Button variant="outline" onClick={() => setPendingDelete(null)}>Cancel</Button><Button onClick={() => deleteMutation.mutate()} disabled={deleteMutation.isPending}><Trash2 className="h-4 w-4" />{deleteMutation.isPending ? "Deleting..." : "Deactivate"}</Button></div></div></div> : null}
  </DashboardContent>;
}
