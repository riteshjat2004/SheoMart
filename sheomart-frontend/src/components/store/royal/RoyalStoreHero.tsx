"use client";

import Image from "next/image";
import { Clock3, Crown, Heart, MapPin, Phone, Share2, Sparkles, Star, Users, Zap, ShieldCheck, Gift } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { StoreItem, ProductItem } from "@/types/marketplace";
import { StoreSearchBar } from "@/components/store/shared/StoreSearchBar";
import { StoreDeliveryInfo } from "@/components/store/StoreDeliveryInfo";
import { royalTheme } from "./royalTheme";
import { RoyalIdentityBanner } from "./RoyalIdentityBanner";
import { RoyalMotion } from "./RoyalMotion";
import type { RefObject } from "react";

interface RoyalStoreHeroProps {
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
}

function RoyalStat({ icon: Icon, label, value }: { icon: typeof Star; label: string; value: string }) {
  return (
    <div className="min-w-[136px] rounded-2xl border border-amber-200/90 bg-white/90 p-3.5 shadow-xs backdrop-blur-md transition-all duration-200 hover:border-amber-400 hover:bg-amber-50/80 dark:border-amber-400/30 dark:bg-black/60 dark:hover:border-amber-400/70 dark:hover:bg-stone-900/80">
      <Icon className="h-4 w-4 text-amber-600 dark:text-amber-400" />
      <p className="mt-2.5 text-[10px] font-semibold uppercase tracking-[0.18em] text-amber-900/70 dark:text-amber-200/70">{label}</p>
      <p className="mt-1 text-sm font-bold text-stone-950 dark:text-white">{value}</p>
    </div>
  );
}

export function RoyalStoreHero({ store, search, stickySearchRef, scrollToStickySearch }: RoyalStoreHeroProps) {
  const storeName = store.storeName ?? store.name ?? "Store";
  const location = [store.city, store.state].filter(Boolean).join(", ") || "Local Flagship";

  const shareStore = async () => {
    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        await navigator.share({
          title: storeName,
          text: `Explore ${storeName} on SheoMart Royal`,
          url: window.location.href,
        });
        return;
      } catch {
        // User cancelled share
      }
    }
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      await navigator.clipboard.writeText(window.location.href);
    }
  };

  return (
    <RoyalMotion>
      <section
        className="overflow-hidden rounded-[2rem] border border-amber-300/80 bg-gradient-to-b from-[#FFFDF7] via-[#FFFBF0] to-[#FFF8E7] shadow-[0_24px_80px_-30px_rgba(217,119,6,0.18)] dark:border-amber-400/60 dark:from-stone-950 dark:via-black dark:to-zinc-950 dark:shadow-[0_24px_80px_-30px_rgba(212,175,55,0.45)]"
        aria-labelledby="royal-store-heading"
      >
        <RoyalIdentityBanner />

        <div className="relative isolate min-h-[460px] overflow-hidden p-6 sm:p-8 lg:p-10">
          {/* Banner Image or Luxury Gradient Backdrop */}
          {store.banner ? (
            <Image
              src={store.banner}
              alt={`${storeName} cover`}
              fill
              priority
              className="-z-20 object-cover opacity-25 dark:opacity-35"
            />
          ) : (
            <div className="absolute inset-0 -z-20 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-amber-200/50 via-amber-100/30 to-amber-50 dark:from-amber-950/70 dark:via-stone-950 dark:to-black" />
          )}

          {/* Luxury Vignette & Gold Ambient Light */}
          <div className="absolute inset-0 -z-10 bg-gradient-to-t from-[#FFFDF7] via-[#FFFDF7]/85 to-transparent dark:from-black dark:via-black/80 dark:to-transparent" />
          <div className="pointer-events-none absolute -right-20 -top-20 -z-10 h-80 w-80 rounded-full bg-amber-400/15 blur-3xl" />
          <div className="pointer-events-none absolute left-1/4 top-1/3 -z-10 h-64 w-64 rounded-full bg-yellow-500/10 blur-3xl" />

          <div className="flex min-h-[400px] flex-col justify-end">
            <div className="flex flex-col gap-6 md:flex-row md:items-end">
              {/* Double-Ring Royal Logo Avatar */}
              <div className="flex h-24 w-24 shrink-0 items-center justify-center overflow-hidden rounded-full border-2 border-amber-400 bg-amber-50 text-amber-900 shadow-md ring-4 ring-[#FFFDF7] dark:border-amber-400/90 dark:bg-stone-950 dark:text-amber-300 dark:ring-black/90 dark:shadow-[0_0_36px_rgba(212,175,55,0.5)] sm:h-28 sm:w-28">
                {store.logo ? (
                  <Image
                    src={store.logo}
                    alt={`${storeName} logo`}
                    width={112}
                    height={112}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <span className="text-4xl font-extrabold">{storeName.charAt(0).toUpperCase()}</span>
                )}
              </div>

              {/* Store Title & Badges */}
              <div className="min-w-0 max-w-3xl">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-300 bg-amber-100/90 px-3 py-1 text-xs font-bold text-amber-900 shadow-xs dark:border-amber-400/70 dark:bg-gradient-to-r dark:from-amber-500/25 dark:via-yellow-400/25 dark:to-amber-500/25 dark:text-amber-200 dark:shadow-[0_0_16px_rgba(212,175,55,0.35)]">
                    <Crown className="h-3.5 w-3.5 fill-amber-500 text-amber-500 dark:fill-amber-400 dark:text-amber-400" />
                    SheoMart Royal Flagship
                    <Sparkles className="h-3 w-3 text-amber-600 dark:text-amber-300" />
                  </span>
                  <span className="inline-flex items-center gap-1 rounded-full border border-amber-200/90 bg-white/90 px-2.5 py-1 text-[11px] font-medium text-amber-900 shadow-xs dark:border-amber-400/30 dark:bg-black/60 dark:text-amber-300">
                    <ShieldCheck className="h-3.5 w-3.5 text-amber-600 dark:text-amber-400" />
                    Certified Luxury Partner
                  </span>
                </div>

                <StoreDeliveryInfo
                  deliveryEnabled={store.deliveryEnabled === true}
                  variant="royal"
                  eta={store.deliveryTime}
                  city={store.city ?? "Sheopur"}
                />

                <h1
                  id="royal-store-heading"
                  className="mt-4 text-3xl font-extrabold tracking-tight text-stone-950 sm:text-5xl dark:text-white"
                >
                  {storeName}
                </h1>

                <p className="mt-2 text-sm font-medium text-amber-900/90 dark:text-amber-200/90">
                  Exclusive Flagship Collection <span className="text-amber-500">•</span> {location}
                </p>

                <p className="mt-3.5 max-w-2xl text-sm leading-6 text-stone-600 dark:text-stone-300">
                  {store.description ??
                    "A distinguished flagship store offering hand-selected collections, white-glove packaging, and same-day priority dispatch."}
                </p>
              </div>
            </div>

            {/* Quick Metrics */}
            <div
              className="mt-7 flex gap-3 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
              aria-label="Royal flagship statistics"
            >
              <RoyalStat
                icon={Star}
                label="Rating"
                value={typeof store.rating === "number" ? `${store.rating.toFixed(1)} / 5.0` : "New Flagship"}
              />
              <RoyalStat icon={Heart} label="Reviews" value={`${store.totalReviews ?? 0} VIP reviews`} />
              <RoyalStat
                icon={Clock3}
                label="Hours"
                value={`${store.pickupOpeningTime ?? "10:00"} - ${store.pickupClosingTime ?? "20:00"}`}
              />
              <RoyalStat icon={Zap} label="Dispatch" value="Same-Day Priority" />
              <RoyalStat icon={MapPin} label="Location" value={location} />
            </div>

            {/* CTA Buttons */}
            <div className="mt-6 flex flex-col gap-3 sm:flex-row">
              <Button
                type="button"
                className="bg-gradient-to-r from-amber-500 via-amber-400 to-yellow-500 font-bold text-stone-950 shadow-md shadow-amber-500/25 hover:from-amber-400 hover:to-yellow-400 sm:flex-1"
                aria-label={`Follow ${storeName}`}
              >
                Follow Flagship
              </Button>
              <Button
                type="button"
                onClick={shareStore}
                variant="outline"
                className="border-amber-300 bg-white/90 text-amber-950 backdrop-blur-sm hover:border-amber-400 hover:bg-amber-50 dark:border-amber-400/50 dark:bg-black/60 dark:text-amber-200 dark:hover:border-amber-400 dark:hover:bg-stone-900/90 dark:hover:text-white sm:flex-1"
              >
                <Share2 className="mr-2 h-4 w-4 text-amber-600 dark:text-amber-400" /> Share Store
              </Button>
              {store.phone ? (
                <Button
                  asChild
                  variant="outline"
                  className="border-amber-300 bg-white/90 text-amber-950 backdrop-blur-sm hover:border-amber-400 hover:bg-amber-50 dark:border-amber-400/50 dark:bg-black/60 dark:text-amber-200 dark:hover:border-amber-400 dark:hover:bg-stone-900/90 dark:hover:text-white sm:flex-1"
                >
                  <a href={`tel:${store.phone}`}>
                    <Phone className="mr-2 h-4 w-4 text-amber-600 dark:text-amber-400" /> Concierge Hotline
                  </a>
                </Button>
              ) : null}
            </div>

            {/* In-Store Search Bar */}
            {search ? (
              <div className="mt-5 w-full max-w-md">
                <StoreSearchBar
                  value={search.value}
                  onChange={search.onChange}
                  onClear={search.onClear}
                  results={search.results}
                  onSelect={search.onSelect}
                  theme={royalTheme}
                  mode="hero"
                  surface="hero"
                  scrollToStickySearch={scrollToStickySearch}
                />
              </div>
            ) : null}
          </div>
        </div>

        {/* Luxury Trust Badges Strip */}
        <div className="flex flex-wrap gap-2.5 border-t border-amber-200 bg-amber-50/80 p-4 backdrop-blur-md dark:border-amber-400/25 dark:bg-black/75">
          {[
            { label: "100% Royal Authenticity", icon: ShieldCheck },
            { label: "Priority VIP Dispatch", icon: Zap },
            { label: "Signature Gift Packaging", icon: Gift },
            { label: "24/7 Dedicated Concierge", icon: Crown },
          ].map(({ label, icon: Icon }) => (
            <span
              key={label}
              className="inline-flex items-center gap-1.5 rounded-full border border-amber-300 bg-white/90 px-3 py-1.5 text-xs font-semibold text-amber-900 shadow-xs dark:border-amber-400/30 dark:bg-amber-500/10 dark:text-amber-200/90"
            >
              <Icon className="h-3.5 w-3.5 text-amber-600 dark:text-amber-400" /> {label}
            </span>
          ))}
        </div>
      </section>
    </RoyalMotion>
  );
}
