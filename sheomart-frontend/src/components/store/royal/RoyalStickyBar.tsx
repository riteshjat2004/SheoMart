"use client";

import Image from "next/image";
import { Crown, Share2, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { StoreItem, ProductItem } from "@/types/marketplace";
import { StoreSearchBar } from "@/components/store/shared/StoreSearchBar";
import { royalTheme } from "./royalTheme";
import type { RefObject } from "react";

interface RoyalStickyBarProps {
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

export function RoyalStickyBar({ store, search, stickySearchRef, visible = false }: RoyalStickyBarProps) {
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
      className={`fixed inset-x-0 top-0 z-[200] border-b border-amber-400/40 bg-stone-950/95 px-4 py-3 shadow-[0_10px_30px_-15px_rgba(212,175,55,0.4)] backdrop-blur-xl transition duration-300 motion-reduce:transition-none ${
        visible ? "translate-y-0 opacity-100" : "pointer-events-none -translate-y-full opacity-0"
      }`}
      aria-hidden={!visible}
    >
      <div className="mx-auto flex max-w-7xl flex-wrap items-center gap-3">
        {/* Double Gold Ring Logo */}
        <div className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-full border-2 border-amber-400/90 bg-stone-900 text-sm font-bold text-amber-300 ring-2 ring-black">
          {store.logo ? (
            <Image src={store.logo} alt="" width={40} height={40} className="h-full w-full object-cover" />
          ) : (
            storeName.charAt(0).toUpperCase()
          )}
        </div>

        {/* Store Title & Badge */}
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-bold text-white">{storeName}</p>
          <p className="flex items-center gap-1 text-[11px] font-semibold text-amber-300">
            <Crown className="h-3 w-3 fill-amber-400 text-amber-400" /> SheoMart Royal Flagship
            <Sparkles className="h-2.5 w-2.5 text-amber-400" />
          </p>
        </div>

        {/* Search */}
        {search ? (
          <div className="order-3 w-full md:order-none md:w-[340px]">
            <StoreSearchBar
              ref={stickySearchRef}
              value={search.value}
              onChange={search.onChange}
              onClear={search.onClear}
              results={search.results}
              onSelect={search.onSelect}
              theme={royalTheme}
              mode="sticky"
              surface="sticky"
              activeSearchSurface="sticky"
            />
          </div>
        ) : null}

        {/* Action Buttons */}
        <Button
          type="button"
          className="hidden min-h-10 sm:inline-flex bg-gradient-to-r from-amber-400 to-yellow-500 font-bold text-stone-950 shadow-md shadow-amber-500/20 hover:from-amber-300 hover:to-yellow-400"
        >
          Follow Flagship
        </Button>
        <Button
          type="button"
          onClick={shareStore}
          variant="outline"
          size="icon"
          aria-label={`Share ${storeName}`}
          className="border-amber-400/50 bg-black/60 text-amber-200 hover:border-amber-400 hover:bg-stone-900 hover:text-white"
        >
          <Share2 className="h-4 w-4 text-amber-400" />
        </Button>
      </div>
    </div>
  );
}
