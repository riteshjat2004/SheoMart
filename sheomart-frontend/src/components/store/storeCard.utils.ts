import type { StoreItem } from "@/types/marketplace";

export type StoreTier = "royal" | "verified" | "approved";

export function isRoyal(store?: Pick<StoreItem, "badges"> | null) {
  return Array.isArray(store?.badges) && store.badges.includes("royal");
}

export function isVerified(store?: Pick<StoreItem, "badges"> | null) {
  return Array.isArray(store?.badges) && store.badges.includes("verified");
}

export function getHighestStoreTier(store?: Pick<StoreItem, "badges"> | null): StoreTier {
  if (isRoyal(store)) return "royal";
  if (isVerified(store)) return "verified";
  return "approved";
}
