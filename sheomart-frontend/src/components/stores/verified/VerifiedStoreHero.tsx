"use client";

import Image from "next/image";
import { Clock3, Heart, MapPin, Phone, Share2, ShieldCheck, Sparkles, Star, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { verifiedTheme } from "@/themes/verifiedTheme";
import type { StoreItem } from "@/types/marketplace";

function Stat({ icon: Icon, label, value }: { icon: typeof Star; label: string; value: string }) {
  return (
    <div className={`min-w-[132px] rounded-2xl border p-3 transition ${verifiedTheme.stat}`}>
      <Icon className={`h-4 w-4 ${verifiedTheme.accent}`} />
      <p className="mt-3 text-[10px] font-semibold uppercase tracking-[0.16em] text-emerald-100/70">{label}</p>
      <p className="mt-1 text-sm font-semibold">{value}</p>
    </div>
  );
}

export function VerifiedStoreHero({ store }: { store: StoreItem }) {
  const storeName = store.storeName ?? store.name ?? "Store";
  const location = [store.city, store.state].filter(Boolean).join(", ") || "Local store";
  const shareStore = async () => {
    if (navigator.share) {
      await navigator.share({ title: storeName, text: `Explore ${storeName} on SheoMart`, url: window.location.href });
      return;
    }
    await navigator.clipboard?.writeText(window.location.href);
  };

  return (
    <section className={`overflow-hidden rounded-[2rem] border ${verifiedTheme.hero}`} aria-labelledby="verified-store-heading">
      <div className="relative isolate min-h-[440px] overflow-hidden p-5 sm:p-8 lg:p-10">
        {store.banner ? <Image src={store.banner} alt={`${storeName} cover`} fill priority className={`-z-20 object-cover ${verifiedTheme.cover}`} /> : <div className="absolute inset-0 -z-20 bg-[radial-gradient(circle_at_15%_20%,rgba(52,211,153,0.35),transparent_36%),radial-gradient(circle_at_80%_0%,rgba(231,200,115,0.18),transparent_30%)]" />}
        <div className={`absolute inset-0 -z-10 ${verifiedTheme.overlay}`} />
        <div className="absolute -right-20 -top-24 -z-10 h-72 w-72 rounded-full border border-emerald-300/10 bg-emerald-400/10 blur-3xl" />

        <div className="flex min-h-[390px] flex-col justify-end">
          <div className="flex flex-col gap-6 md:flex-row md:items-end">
            <div className={`flex h-24 w-24 shrink-0 items-center justify-center overflow-hidden rounded-full border-4 ${verifiedTheme.logo} sm:h-28 sm:w-28`}>
              {store.logo ? <Image src={store.logo} alt={`${storeName} logo`} width={112} height={112} className="h-full w-full object-cover" /> : <span className="text-4xl font-semibold">{storeName.charAt(0).toUpperCase()}</span>}
            </div>
            <div className="min-w-0 max-w-3xl">
              <span className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-semibold ${verifiedTheme.badge}`}>
                <ShieldCheck className="h-4 w-4" /> Verified Store <Sparkles className="h-3 w-3" />
              </span>
              <h1 id="verified-store-heading" className="mt-4 text-3xl font-semibold tracking-tight text-white sm:text-5xl">{storeName}</h1>
              <p className="mt-2 text-sm font-medium text-emerald-100">Fresh essentials <span className={verifiedTheme.accent}>•</span> {location}</p>
              <p className="mt-4 max-w-2xl text-sm leading-6 text-emerald-50/85">{store.description ?? "Fresh products from this trusted local seller, curated for your everyday needs."}</p>
            </div>
          </div>

          <div className="mt-7 flex gap-3 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden" aria-label="Store quick statistics">
            <Stat icon={Star} label="Rating" value={typeof store.rating === "number" ? `${store.rating.toFixed(1)} / 5` : "New"} />
            <Stat icon={Heart} label="Reviews" value={`${store.totalReviews ?? 0}`} />
            <Stat icon={Clock3} label="Pickup" value={`${store.pickupOpeningTime ?? "10:00"} - ${store.pickupClosingTime ?? "20:00"}`} />
            <Stat icon={Users} label="Followers" value="Not available" />
            <Stat icon={MapPin} label="Location" value={location} />
          </div>

          <div className="mt-6 flex flex-col gap-3 sm:flex-row">
            <Button type="button" className={`sm:flex-1 ${verifiedTheme.primaryButton}`} aria-label={`Follow ${storeName}`}>
              Follow Store
            </Button>
            <Button type="button" onClick={shareStore} variant="outline" className={`sm:flex-1 ${verifiedTheme.secondaryButton}`}>
              <Share2 className="h-4 w-4" /> Share Store
            </Button>
            {store.phone ? <Button asChild variant="outline" className={`sm:flex-1 ${verifiedTheme.secondaryButton}`}><a href={`tel:${store.phone}`}><Phone className="h-4 w-4" /> Contact Seller</a></Button> : null}
          </div>
        </div>
      </div>

      <div className="flex flex-wrap gap-2 border-t border-emerald-300/15 bg-slate-950/45 p-4">
        {["Trusted Seller", "Fast Delivery", "Genuine Products", "Secure Payments"].map((label) => (
          <span key={label} className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium ${verifiedTheme.trust}`}>
            <ShieldCheck className="h-3.5 w-3.5 text-emerald-300" /> {label}
          </span>
        ))}
      </div>
    </section>
  );
}
