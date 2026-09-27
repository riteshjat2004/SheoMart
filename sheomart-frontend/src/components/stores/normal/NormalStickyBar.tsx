"use client";

import Image from "next/image";
import { Share2, Store } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { StoreItem, ProductItem } from "@/types/marketplace";
import { StoreSearchBar } from "@/components/store/shared/StoreSearchBar";
import { StoreBadge } from "@/components/store/StoreBadge";
import { normalTheme } from "@/themes/normalTheme";
import type { RefObject } from "react";
import { useState } from "react";

interface NormalStickyBarProps {
  store: StoreItem;
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

export function NormalStickyBar({
  store,
  search,
  stickySearchRef,
  visible = false,
}: NormalStickyBarProps) {
  const [copied, setCopied] = useState(false);
  const displayName = store.storeName ?? store.name ?? "Neighborhood Store";
  const initials = displayName.charAt(0).toUpperCase();

  const handleShare = async () => {
    if (typeof window !== "undefined") {
      try {
        if (navigator.share) {
          await navigator.share({
            title: displayName,
            text: `Shop groceries at ${displayName} on SheoMart!`,
            url: window.location.href,
          });
        } else {
          await navigator.clipboard.writeText(window.location.href);
          setCopied(true);
          setTimeout(() => setCopied(false), 2000);
        }
      } catch {
        // silently ignore
      }
    }
  };

  if (!visible) return null;

  return (
    <aside
      aria-label={`${displayName} quick navigation`}
      className="sticky top-20 z-40 mb-4 animate-[store-fade-in_250ms_ease-out_both] rounded-2xl border border-stone-200/90 bg-white/95 px-4 py-3 shadow-md backdrop-blur-md dark:border-stone-800 dark:bg-stone-900/95"
    >
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        {/* Store identity pill */}
        <div className="flex items-center gap-3">
          <div className="relative flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-full border border-emerald-300 bg-emerald-50 text-sm font-bold text-emerald-800 shadow-xs dark:border-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
            {store.logo ? (
              <Image
                src={store.logo}
                alt={`${displayName} logo`}
                width={40}
                height={40}
                className="h-full w-full object-cover"
              />
            ) : (
              <span>{initials}</span>
            )}
          </div>

          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h2 className="truncate text-sm font-bold text-stone-900 dark:text-stone-50">
                {displayName}
              </h2>
              <StoreBadge type="normal" size="sm" />
            </div>
            <p className="truncate text-[11px] text-stone-500 dark:text-stone-400">
              {store.city ?? "Local Market"} • Open {store.pickupOpeningTime ?? "10:00"} - {store.pickupClosingTime ?? "20:00"}
            </p>
          </div>
        </div>

        {/* Search bar & Share action */}
        <div className="flex flex-1 items-center justify-end gap-2.5 md:max-w-md">
          {search ? (
            <div className="w-full">
              <StoreSearchBar
                ref={stickySearchRef}
                value={search.value}
                onChange={search.onChange}
                onClear={search.onClear}
                results={search.results}
                onSelect={search.onSelect}
                theme={normalTheme}
                mode="sticky"
                surface="sticky"
                activeSearchSurface="sticky"
                label="Search products in this store..."
              />
            </div>
          ) : null}

          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleShare}
            className="shrink-0 rounded-full border-stone-200 text-xs font-medium text-stone-700 hover:bg-stone-50 dark:border-stone-700 dark:text-stone-200 dark:hover:bg-stone-800"
          >
            <Share2 className="h-3.5 w-3.5 sm:mr-1.5" />
            <span className="hidden sm:inline">{copied ? "Copied!" : "Share"}</span>
          </Button>
        </div>
      </div>
    </aside>
  );
}
