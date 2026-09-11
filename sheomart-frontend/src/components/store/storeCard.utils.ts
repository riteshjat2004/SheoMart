import type { StoreBadge, StoreItem } from "@/types/marketplace";

export function getStoreBadge(store?: Pick<StoreItem, "badge"> | null): StoreBadge {
  return store?.badge ?? "normal";
}
