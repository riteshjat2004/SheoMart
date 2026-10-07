import type { StoreBadge, StoreItem } from "@/types/marketplace";

export function getStoreBadge(store?: Pick<StoreItem, "badge"> | null): StoreBadge {
  return store?.badge ?? "normal";
}

export function getStoreHref(store: Pick<StoreItem, "storeId" | "_id" | "slug">): string {
  const identifier = store.storeId ?? store._id ?? store.slug;
  return identifier ? `/stores/${encodeURIComponent(identifier)}` : "/stores";
}
