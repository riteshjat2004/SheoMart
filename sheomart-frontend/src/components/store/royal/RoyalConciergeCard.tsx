"use client";

import Link from "next/link";
import { Clock, Headset, MessageCircle, MessageSquare, Phone, Sparkles } from "lucide-react";
import { royalTheme } from "./royalTheme";
import type { StoreItem } from "@/types/marketplace";

interface RoyalConciergeCardProps {
  store?: StoreItem;
}

export function RoyalConciergeCard({ store }: RoyalConciergeCardProps) {
  const storeName = store?.storeName ?? store?.name ?? "Royal Merchant";
  const rawPhone = store?.phone || "";
  const cleanPhone = rawPhone.replace(/\D/g, "");

  const whatsappUrl = cleanPhone
    ? `https://wa.me/91${cleanPhone.length === 10 ? cleanPhone : cleanPhone.slice(-10)}?text=${encodeURIComponent(
        `Hello ${storeName}, I would like assistance with an order on SheoMart Royal.`
      )}`
    : `https://wa.me/?text=${encodeURIComponent(
        `Hello ${storeName}, I would like assistance with an order on SheoMart Royal.`
      )}`;

  const callHref = rawPhone ? `tel:${rawPhone}` : "tel:1800123456";

  const timingText =
    store?.pickupOpeningTime && store?.pickupClosingTime
      ? `${store.pickupOpeningTime} – ${store.pickupClosingTime}`
      : "08:00 AM – 10:00 PM";

  return (
    <section
      className={`rounded-[2rem] border border-amber-300/80 p-6 sm:p-7 shadow-lg shadow-amber-500/10 dark:border-amber-400/40 dark:shadow-black/40 transition-all duration-300 ${royalTheme.panel} ${royalTheme.hover}`}
      aria-labelledby="royal-concierge-heading"
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-4">
          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border border-amber-400/60 bg-amber-500/10 text-amber-600 dark:text-amber-300 shadow-[0_0_20px_rgba(212,175,55,0.25)]">
            <Headset className="h-7 w-7" />
          </div>
          <div>
            <p className={`flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] ${royalTheme.accent}`}>
              <Sparkles className="h-4 w-4" />
              Dedicated VIP Desk
            </p>
            <h2 id="royal-concierge-heading" className="mt-1.5 text-xl font-bold tracking-tight text-stone-900 dark:text-white">
              {storeName} Concierge
            </h2>
          </div>
        </div>

        <div className="hidden sm:flex items-center gap-1.5 rounded-full border border-amber-300/80 bg-amber-50 px-3 py-1 text-[11px] font-medium text-amber-900 dark:border-amber-400/30 dark:bg-stone-900 dark:text-amber-300">
          <Clock className="h-3.5 w-3.5 text-amber-600 dark:text-amber-400" />
          <span>{timingText}</span>
        </div>
      </div>

      <p className="mt-4 text-sm leading-6 text-stone-600 dark:text-stone-300">
        Direct white-glove assistance, bespoke product requests, and priority order dispatch tailored specifically for this Royal flagship.
      </p>

      <div className="mt-6 flex flex-wrap items-center gap-2.5">
        <a
          href={whatsappUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 rounded-full border border-amber-300 bg-amber-50 px-4 py-2 text-xs font-bold text-amber-950 transition-colors hover:border-amber-400 hover:bg-amber-100 dark:border-amber-400/50 dark:bg-stone-900/80 dark:text-amber-200 dark:hover:border-amber-400 dark:hover:bg-amber-400 dark:hover:text-stone-950"
        >
          <MessageCircle className="h-4 w-4 text-emerald-600 dark:text-emerald-400" /> WhatsApp Merchant
        </a>

        {rawPhone ? (
          <a
            href={callHref}
            className="inline-flex items-center gap-2 rounded-full border border-amber-300 bg-amber-50 px-4 py-2 text-xs font-bold text-amber-950 transition-colors hover:border-amber-400 hover:bg-amber-100 dark:border-amber-400/50 dark:bg-stone-900/80 dark:text-amber-200 dark:hover:border-amber-400 dark:hover:bg-amber-400 dark:hover:text-stone-950"
          >
            <Phone className="h-4 w-4 text-amber-600 dark:text-amber-400" /> Call {rawPhone}
          </a>
        ) : null}

        <Link
          href="/support"
          className="inline-flex items-center gap-2 rounded-full border border-amber-300 bg-amber-500/10 px-4 py-2 text-xs font-bold text-amber-900 transition-colors hover:bg-amber-500/20 dark:border-amber-400/40 dark:bg-amber-500/20 dark:text-amber-200"
        >
          <MessageSquare className="h-4 w-4 text-amber-600 dark:text-amber-400" /> Live Support Desk
        </Link>
      </div>
    </section>
  );
}
