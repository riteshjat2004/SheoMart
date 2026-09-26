"use client";

import {
  CalendarDays,
  CheckCircle2,
  Edit2,
  Flame,
  Globe,
  Layers,
  Sparkles,
  Store,
  Tag,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import type { OfferItem } from "@/services/promotions";

interface OfferDetailsModalProps {
  open: boolean;
  offer: OfferItem | null;
  onClose: () => void;
  onEdit: (offer: OfferItem) => void;
}

export function OfferDetailsModal({
  open,
  offer,
  onClose,
  onEdit,
}: OfferDetailsModalProps) {
  if (!open || !offer) return null;

  const discountBadge =
    offer.offerType === "bogo"
      ? "Buy 1 Get 1 Free"
      : offer.offerType === "buy_x_get_y"
        ? `Buy ${offer.buyQuantity || 1} Get ${offer.getQuantity || 1} Free`
        : offer.offerType === "free_delivery"
          ? "Free Delivery"
          : offer.discountType === "percentage"
            ? `${offer.discountValue}% OFF`
            : `₹${offer.discountValue} OFF`;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-stone-950/70 p-4 backdrop-blur-sm animate-in fade-in duration-200"
      role="dialog"
      aria-modal="true"
    >
      <div className="relative flex max-h-[92vh] w-full max-w-2xl flex-col rounded-2xl border border-stone-200 bg-white shadow-2xl dark:border-stone-800 dark:bg-stone-950">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-stone-100 px-6 py-4 dark:border-stone-800">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400">
              <Sparkles className="h-4 w-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-stone-900 dark:text-stone-100">Campaign Details</h2>
              <p className="text-xs text-stone-500 dark:text-stone-400">{offer.festivalName}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 text-stone-400 transition hover:bg-stone-100 hover:text-stone-600 dark:hover:bg-stone-800 dark:hover:text-stone-200"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-5">
          {/* Banner Graphic */}
          <div className="relative h-48 w-full overflow-hidden rounded-2xl border border-stone-200 bg-stone-100 dark:border-stone-800 dark:bg-stone-900">
            {offer.bannerImage ? (
              <img src={offer.bannerImage} alt={offer.title} className="h-full w-full object-cover" />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-stone-400">
                No Banner Image
              </div>
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
            <div className="absolute bottom-4 left-4 right-4 flex items-end justify-between">
              <div>
                <span className="rounded-full bg-emerald-600 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-white">
                  {offer.festivalName}
                </span>
                <h3 className="mt-1 text-lg font-bold text-white drop-shadow-sm">{offer.title}</h3>
                {offer.subtitle && <p className="text-xs text-stone-200 line-clamp-1">{offer.subtitle}</p>}
              </div>
              <span className="rounded-xl bg-white/95 px-3 py-1.5 text-xs font-bold text-emerald-700 shadow-md backdrop-blur dark:bg-stone-900/95 dark:text-emerald-400">
                {discountBadge}
              </span>
            </div>
          </div>

          {/* Key Metrics */}
          <div className="grid gap-3 sm:grid-cols-3">
            <div className="rounded-xl border border-stone-100 bg-stone-50/60 p-3 dark:border-stone-800/80 dark:bg-stone-900/40">
              <span className="text-[11px] font-medium uppercase text-stone-400">Campaign Type</span>
              <p className="mt-1 text-sm font-bold capitalize text-stone-800 dark:text-stone-200">
                {offer.offerType?.replace(/_/g, " ") || "Percentage"}
              </p>
            </div>
            <div className="rounded-xl border border-stone-100 bg-stone-50/60 p-3 dark:border-stone-800/80 dark:bg-stone-900/40">
              <span className="text-[11px] font-medium uppercase text-stone-400">Priority Score</span>
              <p className="mt-1 text-sm font-bold text-stone-800 dark:text-stone-200">
                {offer.priority ?? 0}
              </p>
            </div>
            <div className="rounded-xl border border-stone-100 bg-stone-50/60 p-3 dark:border-stone-800/80 dark:bg-stone-900/40">
              <span className="text-[11px] font-medium uppercase text-stone-400">Status</span>
              <p className="mt-1 text-sm font-bold capitalize text-emerald-600 dark:text-emerald-400">
                {offer.status || (offer.isActive ? "Active" : "Inactive")}
              </p>
            </div>
          </div>

          {/* Description */}
          {offer.description && (
            <div className="rounded-xl border border-stone-200 bg-white p-4 dark:border-stone-800 dark:bg-stone-900/50 space-y-1.5">
              <h4 className="text-xs font-semibold uppercase tracking-wider text-stone-400">Description</h4>
              <p className="text-xs text-stone-600 dark:text-stone-300 leading-relaxed">{offer.description}</p>
            </div>
          )}

          {/* Target Audience / Scopes */}
          <div className="rounded-xl border border-stone-200 bg-white p-4 dark:border-stone-800 dark:bg-stone-900/50 space-y-3">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-stone-400">Targeting & Placements</h4>

            <div className="space-y-2 text-xs">
              <div className="flex items-center gap-2">
                <Globe className="h-4 w-4 text-stone-400" />
                <span className="text-stone-500">Scope:</span>
                <span className="font-semibold capitalize text-stone-800 dark:text-stone-200">
                  {offer.targetScope || "Marketplace"}
                </span>
              </div>

              {offer.targetCategories && offer.targetCategories.length > 0 && (
                <div className="flex items-start gap-2 pt-1">
                  <Layers className="h-4 w-4 text-stone-400 mt-0.5 shrink-0" />
                  <div>
                    <span className="text-stone-500">Categories ({offer.targetCategories.length}):</span>
                    <div className="mt-1 flex flex-wrap gap-1">
                      {offer.targetCategories.map((c) => (
                        <span
                          key={c.id}
                          className="rounded-full bg-stone-100 px-2 py-0.5 text-[11px] font-medium text-stone-700 dark:bg-stone-800 dark:text-stone-300"
                        >
                          {c.name}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {offer.targetStores && offer.targetStores.length > 0 && (
                <div className="flex items-start gap-2 pt-1">
                  <Store className="h-4 w-4 text-stone-400 mt-0.5 shrink-0" />
                  <div>
                    <span className="text-stone-500">Stores ({offer.targetStores.length}):</span>
                    <div className="mt-1 flex flex-wrap gap-1">
                      {offer.targetStores.map((s) => (
                        <span
                          key={s.id}
                          className="rounded-full bg-stone-100 px-2 py-0.5 text-[11px] font-medium text-stone-700 dark:bg-stone-800 dark:text-stone-300"
                        >
                          {s.name}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Homepage Placements */}
              <div className="pt-2 border-t border-stone-100 dark:border-stone-800 flex flex-wrap gap-2">
                {offer.showOnHero && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-1 text-[11px] font-semibold text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400">
                    <CheckCircle2 className="h-3 w-3" /> Hero Carousel
                  </span>
                )}
                {offer.showOnFeatured && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-1 text-[11px] font-semibold text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400">
                    <CheckCircle2 className="h-3 w-3" /> Featured Section
                  </span>
                )}
                {offer.isFlashSale && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2.5 py-1 text-[11px] font-semibold text-amber-700 dark:bg-amber-950/40 dark:text-amber-400">
                    <Flame className="h-3 w-3" /> Flash Sale
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Validity Timeline */}
          <div className="flex items-center gap-2 rounded-xl bg-stone-50 p-3 text-xs text-stone-600 dark:bg-stone-900/60 dark:text-stone-400">
            <CalendarDays className="h-4 w-4 text-emerald-600" />
            <span>
              Runs from <strong className="text-stone-800 dark:text-stone-200">{new Date(offer.startsAt).toLocaleString()}</strong> to{" "}
              <strong className="text-stone-800 dark:text-stone-200">{new Date(offer.endsAt).toLocaleString()}</strong>
            </span>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between border-t border-stone-100 px-6 py-4 dark:border-stone-800">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => {
              onClose();
              onEdit(offer);
            }}
            className="gap-1.5"
          >
            <Edit2 className="h-3.5 w-3.5" />
            Edit Campaign
          </Button>
          <Button type="button" size="sm" onClick={onClose}>
            Close
          </Button>
        </div>
      </div>
    </div>
  );
}
