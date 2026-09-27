"use client";

import Image from "next/image";
import { Share2, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { verifiedTheme, type StoreTheme } from "@/themes/verifiedTheme";
import type { StoreItem, ProductItem } from "@/types/marketplace";
import { StoreSearchBar } from "@/components/store/shared/StoreSearchBar";
import type { RefObject } from "react";

interface VerifiedStickyBarProps {
  store: StoreItem;
  theme?: StoreTheme;
  badgeLabel?: string;
  BadgeIcon?: typeof ShieldCheck;
  search?: {
    value: string;
    onChange: (value: string) => void;
    onClear: () => void;
    results: ProductItem[];
    onSelect: (product: ProductItem) => void;
  };
  stickySearchRef?: RefObject<HTMLInputElement | null>;
  visible?: boolean;
}

export function VerifiedStickyBar({
  store,
  theme = verifiedTheme,
  badgeLabel = "Verified Store",
  BadgeIcon = ShieldCheck,
  search,
  stickySearchRef,
  visible = false,
}: VerifiedStickyBarProps) {
  const storeName = store.storeName ?? store.name ?? "Store";

  const shareStore = async () => {
    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        await navigator.share({ title: storeName, url: window.location.href });
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
    <div
      className={`fixed inset-x-0 top-0 z-[200] border-b border-emerald-500/30 bg-slate-950/95 px-4 py-3 shadow-[0_8px_30px_-10px_rgba(16,185,129,0.3)] backdrop-blur-xl transition duration-300 motion-reduce:transition-none ${
        visible ? "translate-y-0 opacity-100" : "pointer-events-none -translate-y-full opacity-0"
      }`}
      aria-hidden={!visible}
    >
      <div className="mx-auto flex max-w-7xl flex-wrap items-center gap-3">
        {/* Store Avatar */}
        <div className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-full border-2 border-emerald-400 bg-emerald-100 text-sm font-bold text-emerald-900 ring-2 ring-slate-950">
          {store.logo ? (
            <Image src={store.logo} alt="" width={40} height={40} className="h-full w-full object-cover" />
          ) : (
            storeName.charAt(0).toUpperCase()
          )}
        </div>

        {/* Store Title & Badge */}
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-bold text-white">{storeName}</p>
          <p className="flex items-center gap-1 text-[11px] font-semibold text-emerald-300">
            <BadgeIcon className="h-3 w-3 text-emerald-400" /> {badgeLabel}
          </p>
        </div>

        {/* Search */}
        {search ? (
          <div className="order-3 w-full md:order-none md:w-[320px]">
            <StoreSearchBar
              ref={stickySearchRef}
              value={search.value}
              onChange={search.onChange}
              onClear={search.onClear}
              results={search.results}
              onSelect={search.onSelect}
              theme={theme}
              mode="sticky"
              surface="sticky"
              activeSearchSurface="sticky"
            />
          </div>
        ) : null}

        {/* CTA */}
        <Button
          type="button"
          className="hidden min-h-10 sm:inline-flex bg-emerald-500 font-bold text-white shadow-md shadow-emerald-500/25 hover:bg-emerald-400"
        >
          Follow Store
        </Button>
        <Button
          type="button"
          onClick={shareStore}
          variant="outline"
          size="icon"
          aria-label={`Share ${storeName}`}
          className="border-white/20 bg-white/10 text-white hover:border-white/40 hover:bg-white/20"
        >
          <Share2 className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}