"use client";

import { Crown } from "lucide-react";
import { VerifiedStickyBar } from "@/components/stores/verified/VerifiedStickyBar";
import type { StoreItem } from "@/types/marketplace";
import { royalTheme } from "./royalTheme";
import type { ProductItem } from "@/types/marketplace";
import type { RefObject } from "react";

export function RoyalStickyBar({ store, search, stickySearchRef, visible }: { store: StoreItem; search?: { value: string; onChange: (value: string) => void; onClear: () => void; results: ProductItem[]; onSelect: (product: ProductItem) => void }; stickySearchRef?: RefObject<HTMLInputElement | null>; visible?: boolean }) {
  return <VerifiedStickyBar store={store} theme={royalTheme} badgeLabel="Royal Store" BadgeIcon={Crown} search={search} stickySearchRef={stickySearchRef} visible={visible} />;
}
