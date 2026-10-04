"use client";

import Image from "next/image";
import { Clock3, Heart, MapPin, Phone, Share2, ShieldCheck, Star, Truck, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { verifiedTheme, type StoreTheme } from "@/themes/verifiedTheme";
import type { StoreItem, ProductItem, StoreBadge } from "@/types/marketplace";
import { StoreSearchBar } from "@/components/store/shared/StoreSearchBar";
import { StoreDeliveryInfo } from "@/components/store/StoreDeliveryInfo";
import type { RefObject } from "react";

function VerifiedStat({
  icon: Icon,
  label,
  value,
  theme,
}: {
  icon: typeof Star;
  label: string;
  value: string;
  theme: StoreTheme;
}) {
  return (
    <div className="min-w-[136px] rounded-2xl border border-emerald-200/80 bg-white/85 p-3.5 backdrop-blur-md transition-all duration-200 hover:border-emerald-300 hover:bg-white dark:border-emerald-300/20 dark:bg-emerald-950/40 dark:hover:border-emerald-300/50 dark:hover:bg-emerald-950/60 shadow-sm dark:shadow-none">
      <Icon className={`h-4 w-4 ${theme.accent}`} />
      <p className="mt-2.5 text-[10px] font-semibold uppercase tracking-[0.16em] text-emerald-900/70 dark:text-emerald-100/70">{label}</p>
      <p className="mt-1 text-sm font-bold text-stone-900 dark:text-white">{value}</p>
    </div>
  );
}

export function VerifiedStoreHero({
  store,
  theme = verifiedTheme,
  badgeLabel = "Verified Store",
  BadgeIcon = ShieldCheck,
  identityBanner = "Quality Local Grocery & Daily Essentials",
  deliveryVariant = "verified",
  search,
  stickySearchRef,
  scrollToStickySearch,
}: {
  store: StoreItem;
  theme?: StoreTheme;
  badgeLabel?: string;
  BadgeIcon?: typeof ShieldCheck;
  identityBanner?: string;
  deliveryVariant?: StoreBadge;
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
  const storeName = store.storeName ?? store.name ?? "Store";
  const location = [store.city, store.state].filter(Boolean).join(", ") || "Sheopur, MP";

  const shareStore = async () => {
    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        await navigator.share({
          title: storeName,
          text: `Explore ${storeName} on SheoMart`,
          url: window.location.href,
        });
        return;
      } catch {
        // user cancelled
      }
    }
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      await navigator.clipboard.writeText(window.location.href);
    }
  };

  return (
    <section
      className="overflow-hidden rounded-[2rem] border border-emerald-200 bg-gradient-to-br from-emerald-50/90 via-teal-50/50 to-white shadow-[0_20px_50px_-25px_rgba(16,185,129,0.2)] dark:border-emerald-400/40 dark:bg-gradient-to-br dark:from-emerald-950 dark:via-teal-950 dark:to-slate-950 dark:shadow-[0_20px_60px_-25px_rgba(16,185,129,0.45)]"
      aria-labelledby="verified-store-heading"
    >
      <div className="relative isolate min-h-[440px] overflow-hidden p-6 sm:p-8 lg:p-10">
        {/* Banner Cover or Fresh Gradient */}
        {store.banner ? (
          <Image
            src={store.banner}
            alt={`${storeName} cover`}
            fill
            priority
            className="-z-20 object-cover opacity-25 dark:opacity-30"
          />
        ) : (
          <div className="absolute inset-0 -z-20 bg-[radial-gradient(circle_at_15%_20%,rgba(16,185,129,0.15),transparent_40%),radial-gradient(circle_at_85%_10%,rgba(20,184,166,0.12),transparent_40%)] dark:bg-[radial-gradient(circle_at_15%_20%,rgba(16,185,129,0.4),transparent_40%),radial-gradient(circle_at_85%_10%,rgba(20,184,166,0.25),transparent_40%)]" />
        )}

        <div className="absolute inset-0 -z-10 bg-gradient-to-t from-white/95 via-white/80 to-white/40 dark:from-slate-950 dark:via-slate-950/75 dark:to-slate-950/40" />
        <div className="pointer-events-none absolute -right-20 -top-24 -z-10 h-72 w-72 rounded-full border border-emerald-300/20 bg-emerald-400/10 blur-3xl dark:border-emerald-300/10" />

        <div className="flex min-h-[380px] flex-col justify-end">
          <div className="flex flex-col gap-6 md:flex-row md:items-end">
            {/* Store Avatar with Emerald Ring */}
            <div className="flex h-24 w-24 shrink-0 items-center justify-center overflow-hidden rounded-full border-2 border-emerald-500 bg-emerald-100 text-emerald-900 shadow-[0_0_28px_rgba(16,185,129,0.25)] ring-4 ring-white dark:border-emerald-400 dark:bg-emerald-950 dark:text-emerald-300 dark:shadow-[0_0_28px_rgba(16,185,129,0.35)] dark:ring-slate-950 sm:h-28 sm:w-28">
              {store.logo ? (
                <Image
                  src={store.logo}
                  alt={`${storeName} logo`}
                  width={112}
                  height={112}
                  className="h-full w-full object-cover"
                />
              ) : (
                <span className="text-4xl font-extrabold text-emerald-900 dark:text-emerald-200">{storeName.charAt(0).toUpperCase()}</span>
              )}
            </div>

            {/* Store Details */}
            <div className="min-w-0 max-w-3xl">
              <div className="flex flex-wrap items-center gap-2">
                <span
                  title="Verified by SheoMart — Authenticity & Quality Inspected"
                  className="inline-flex items-center gap-1.5 rounded-full border border-emerald-300/80 bg-emerald-100/80 px-3 py-1 text-xs font-bold text-emerald-900 shadow-sm dark:border-emerald-400/60 dark:bg-emerald-500/20 dark:text-emerald-200"
                >
                  <BadgeIcon className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-300" />
                  {badgeLabel}
                </span>
                <span className="inline-flex items-center gap-1 rounded-full border border-emerald-200 bg-white/80 px-2.5 py-1 text-[11px] font-medium text-emerald-800 shadow-sm dark:border-emerald-300/30 dark:bg-black/40 dark:text-emerald-200">
                  <CheckCircle2 className="h-3 w-3 text-emerald-600 dark:text-emerald-400" />
                  SheoMart Verified Partner
                </span>
              </div>

              <StoreDeliveryInfo
                deliveryEnabled={store.deliveryEnabled === true}
                variant={deliveryVariant}
                eta={store.deliveryTime}
                city={store.city ?? "Sheopur"}
              />

              <h1
                id="verified-store-heading"
                className="mt-3.5 text-3xl font-extrabold tracking-tight text-stone-900 dark:text-white sm:text-5xl"
              >
                {storeName}
              </h1>

              <p className="mt-2 text-sm font-semibold text-emerald-800 dark:text-emerald-100">
                {identityBanner} <span className="text-emerald-500 dark:text-emerald-400">•</span> {location}
              </p>

              <p className="mt-3.5 max-w-2xl text-sm leading-6 text-stone-600 dark:text-emerald-50/85">
                {store.description ??
                  "Your dependable neighborhood grocery seller, stocked daily with fresh produce, dairy, staples, and household necessities."}
              </p>
            </div>
          </div>

          {/* Quick Statistics Bar */}
          <div
            className="mt-7 flex gap-3 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
            aria-label="Store quick statistics"
          >
            <VerifiedStat
              theme={theme}
              icon={Star}
              label="Rating"
              value={typeof store.rating === "number" ? `${store.rating.toFixed(1)} / 5.0` : "New Seller"}
            />
            <VerifiedStat
              theme={theme}
              icon={Heart}
              label="Reviews"
              value={`${store.totalReviews ?? 0} reviews`}
            />
            <VerifiedStat
              theme={theme}
              icon={Clock3}
              label="Pickup Hours"
              value={`${store.pickupOpeningTime ?? "10:00"} - ${store.pickupClosingTime ?? "20:00"}`}
            />
            <VerifiedStat
              theme={theme}
              icon={Truck}
              label="Fulfillment"
              value="Daily Fresh Dispatch"
            />
            <VerifiedStat theme={theme} icon={MapPin} label="Location" value={location} />
          </div>

          {/* CTAs */}
          <div className="mt-6 flex flex-col gap-3 sm:flex-row">
            <Button
              type="button"
              className="bg-emerald-600 font-bold text-white shadow-md shadow-emerald-600/20 hover:bg-emerald-500 dark:bg-emerald-500 dark:hover:bg-emerald-400 sm:flex-1"
              aria-label={`Follow ${storeName}`}
            >
              Follow Store
            </Button>
            <Button
              type="button"
              onClick={shareStore}
              variant="outline"
              className="border-emerald-200 bg-white/80 text-emerald-900 backdrop-blur-sm hover:border-emerald-300 hover:bg-emerald-50 dark:border-white/20 dark:bg-white/10 dark:text-white dark:hover:border-white/40 dark:hover:bg-white/20 sm:flex-1"
            >
              <Share2 className="mr-2 h-4 w-4" /> Share Store
            </Button>
            {store.phone ? (
              <Button
                asChild
                variant="outline"
                className="border-emerald-200 bg-white/80 text-emerald-900 backdrop-blur-sm hover:border-emerald-300 hover:bg-emerald-50 dark:border-white/20 dark:bg-white/10 dark:text-white dark:hover:border-white/40 dark:hover:bg-white/20 sm:flex-1"
              >
                <a href={`tel:${store.phone}`}>
                  <Phone className="mr-2 h-4 w-4" /> Contact Store
                </a>
              </Button>
            ) : null}
          </div>

          {/* In-store Search Bar */}
          {search ? (
            <div className="mt-5 w-full max-w-md">
              <StoreSearchBar
                value={search.value}
                onChange={search.onChange}
                onClear={search.onClear}
                results={search.results}
                onSelect={search.onSelect}
                theme={theme}
                mode="hero"
                surface="hero"
                scrollToStickySearch={scrollToStickySearch}
              />
            </div>
          ) : null}
        </div>
      </div>

      {/* Trust Badges Strip */}
      <div className="flex flex-wrap gap-2.5 border-t border-emerald-200/80 bg-emerald-50/60 p-4 backdrop-blur-md dark:border-emerald-400/20 dark:bg-slate-950/70">
        {[
          "100% Quality Inspected",
          "Fresh Daily Inventory",
          "Hygienic Packaging",
          "Prompt Local Delivery",
          "Secure Online & Cash Payments",
        ].map((label) => (
          <span
            key={label}
            className="inline-flex items-center gap-1.5 rounded-full border border-emerald-200 bg-white/90 px-3 py-1.5 text-xs font-semibold text-emerald-900 shadow-sm dark:border-emerald-400/25 dark:bg-emerald-950/50 dark:text-emerald-100"
          >
            <ShieldCheck className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" /> {label}
          </span>
        ))}
      </div>
    </section>
  );
}
