"use client";

import Image from "next/image";
import {
  Clock3,
  Heart,
  MapPin,
  Phone,
  Share2,
  ShoppingBag,
  Star,
  Store,
  Truck,
  CheckCircle2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { normalTheme } from "@/themes/normalTheme";
import type { StoreItem, ProductItem } from "@/types/marketplace";
import { StoreSearchBar } from "@/components/store/shared/StoreSearchBar";
import { StoreDeliveryInfo } from "@/components/store/StoreDeliveryInfo";
import { StoreBadge } from "@/components/store/StoreBadge";
import type { RefObject } from "react";
import { useState } from "react";

function NormalStat({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof Star;
  label: string;
  value: string;
}) {
  return (
    <div className="min-w-[130px] rounded-2xl border border-white/20 bg-stone-900/50 p-3.5 backdrop-blur-md transition-all duration-200 hover:border-emerald-300/40 hover:bg-stone-900/70">
      <Icon className="h-4 w-4 text-emerald-400" />
      <p className="mt-2 text-[10px] font-semibold uppercase tracking-[0.16em] text-stone-300">
        {label}
      </p>
      <p className="mt-1 text-sm font-bold text-white">{value}</p>
    </div>
  );
}

export function NormalStoreHero({
  store,
  search,
  stickySearchRef,
  scrollToStickySearch,
}: {
  store: StoreItem;
  search?: {
    value: string;
    onChange: (value: string) => void;
    onClear: () => void;
    results: ProductItem[];
    onSelect: (product: ProductItem) => void;
  };
  stickySearchRef?: RefObject<HTMLInputElement | null>;
  scrollToStickySearch?: () => void;
}) {
  const [copied, setCopied] = useState(false);
  const [following, setFollowing] = useState(false);

  const displayName = store.storeName ?? store.name ?? "Neighborhood Store";
  const initials = displayName.charAt(0).toUpperCase();
  const ratingLabel = typeof store.rating === "number" ? store.rating.toFixed(1) : "New";
  const locationText =
    [store.address, store.city, store.state].filter(Boolean).join(", ") ||
    "Local Area, Sheopur";

  const handleShare = async () => {
    if (typeof window !== "undefined") {
      try {
        if (navigator.share) {
          await navigator.share({
            title: displayName,
            text: `Shop fresh groceries at ${displayName} on SheoMart!`,
            url: window.location.href,
          });
        } else {
          await navigator.clipboard.writeText(window.location.href);
          setCopied(true);
          setTimeout(() => setCopied(false), 2000);
        }
      } catch {
        // user cancelled or share failed silently
      }
    }
  };

  return (
    <section
      className={`overflow-hidden rounded-[2rem] border ${normalTheme.hero} relative`}
      aria-label={`${displayName} store banner and details`}
    >
      {/* Cover / Banner Area */}
      <div className="relative h-64 sm:h-72 lg:h-84 overflow-hidden bg-gradient-to-r from-stone-900 via-stone-850 to-emerald-950">
        {store.banner ? (
          <Image
            src={store.banner}
            alt={`${displayName} storefront`}
            fill
            className="object-cover"
            priority
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center opacity-20">
            <Store className="h-28 w-28 text-emerald-300" />
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-stone-950 via-stone-950/60 to-transparent sm:bg-gradient-to-r sm:from-stone-950/90 sm:via-stone-900/60 sm:to-stone-950/70" />

        {/* Top Badges & Actions */}
        <div className="absolute inset-x-0 top-0 flex items-center justify-between p-4 sm:p-6">
          <StoreBadge type="normal" size="md" />

          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleShare}
              className="rounded-full border-white/25 bg-black/40 text-xs font-medium text-white backdrop-blur-md hover:bg-black/60"
            >
              <Share2 className="mr-1.5 h-3.5 w-3.5" />
              {copied ? "Link Copied!" : "Share"}
            </Button>
            <Button
              type="button"
              size="sm"
              onClick={() => setFollowing(!following)}
              className={`rounded-full text-xs font-semibold shadow-sm transition ${
                following
                  ? "bg-emerald-600 text-white hover:bg-emerald-700"
                  : "bg-white text-stone-900 hover:bg-stone-100"
              }`}
            >
              <Heart
                className={`mr-1.5 h-3.5 w-3.5 ${following ? "fill-current text-white" : "text-stone-700"}`}
              />
              {following ? "Following" : "Follow"}
            </Button>
          </div>
        </div>

        {/* Hero Bottom Information */}
        <div className="absolute inset-x-0 bottom-0 p-4 sm:p-6 lg:p-8">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div className="flex items-end gap-4">
              {/* Overlapping circular store avatar */}
              <div className="relative flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-full border-4 border-white bg-emerald-50 text-2xl font-bold text-emerald-800 shadow-xl ring-2 ring-emerald-300/60 sm:h-24 sm:w-24 sm:text-3xl dark:border-stone-900 dark:bg-emerald-950 dark:text-emerald-300">
                {store.logo ? (
                  <Image
                    src={store.logo}
                    alt={`${displayName} logo`}
                    width={96}
                    height={96}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <span>{initials}</span>
                )}
              </div>

              {/* Title & Tagline */}
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <span className="rounded-full bg-emerald-500/20 px-2.5 py-0.5 text-[10.5px] font-semibold uppercase tracking-wider text-emerald-300">
                    Friendly Local Mart
                  </span>
                </div>
                <h1 className="mt-1.5 text-2xl font-bold text-white sm:text-3xl lg:text-4xl">
                  {displayName}
                </h1>
                <p className="mt-1 line-clamp-1 text-xs text-stone-300 sm:text-sm">
                  {store.description ?? "Your trusted neighborhood kirana for fresh grocery essentials and fast fulfillment."}
                </p>
              </div>
            </div>

            {/* Quick Metrics Bar */}
            <div className="hidden gap-2.5 sm:flex">
              <NormalStat
                icon={Star}
                label="Rating"
                value={`${ratingLabel} ★`}
              />
              <NormalStat
                icon={Clock3}
                label="Hours"
                value={`${store.pickupOpeningTime ?? "10:00"} - ${store.pickupClosingTime ?? "20:00"}`}
              />
              <NormalStat
                icon={Truck}
                label="Delivery"
                value={store.deliveryEnabled ? "Available" : "Pickup"}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Details & In-Store Search Bar */}
      <div className="border-t border-stone-800 bg-stone-950/80 p-4 sm:p-6 lg:p-8">
        <div className="grid gap-6 lg:grid-cols-[1fr_auto]">
          {/* Location & Delivery Information */}
          <div className="space-y-4">
            <div className="flex flex-wrap items-center gap-4 text-xs sm:text-sm text-stone-300">
              <div className="flex items-center gap-1.5">
                <MapPin className="h-4 w-4 shrink-0 text-emerald-400" />
                <span>{locationText}</span>
              </div>
              <span>•</span>
              <div className="flex items-center gap-1.5">
                <Clock3 className="h-4 w-4 shrink-0 text-emerald-400" />
                <span>Open {store.pickupOpeningTime ?? "10:00"} to {store.pickupClosingTime ?? "20:00"}</span>
              </div>
              {store.phone ? (
                <>
                  <span>•</span>
                  <div className="flex items-center gap-1.5">
                    <Phone className="h-4 w-4 shrink-0 text-emerald-400" />
                    <span>{store.phone}</span>
                  </div>
                </>
              ) : null}
            </div>

            {/* Delivery Ribbon */}
            <div>
              <StoreDeliveryInfo deliveryEnabled={store.deliveryEnabled === true} variant="normal" />
            </div>
          </div>

          {/* In-Store Search Form */}
          {search ? (
            <div className="flex items-center lg:min-w-[340px]">
              <StoreSearchBar
                value={search.value}
                onChange={search.onChange}
                onClear={search.onClear}
                results={search.results}
                onSelect={search.onSelect}
                theme={normalTheme}
                mode="hero"
                surface="hero"
                scrollToStickySearch={scrollToStickySearch}
                label={`Search products in ${displayName}...`}
              />
            </div>
          ) : null}
        </div>

        {/* Community Trust Strip */}
        <div className="mt-6 flex flex-wrap items-center justify-between gap-3 border-t border-stone-800/80 pt-4 text-xs font-medium text-stone-300">
          <div className="flex items-center gap-1.5">
            <CheckCircle2 className="h-4 w-4 text-emerald-400" />
            <span>Fresh Everyday Groceries</span>
          </div>
          <div className="flex items-center gap-1.5">
            <CheckCircle2 className="h-4 w-4 text-emerald-400" />
            <span>Fair Neighborhood Prices</span>
          </div>
          <div className="flex items-center gap-1.5">
            <CheckCircle2 className="h-4 w-4 text-emerald-400" />
            <span>Direct Storefront Pickup</span>
          </div>
          <div className="flex items-center gap-1.5">
            <CheckCircle2 className="h-4 w-4 text-emerald-400" />
            <span>Hassle-Free Local Support</span>
          </div>
        </div>
      </div>
    </section>
  );
}
