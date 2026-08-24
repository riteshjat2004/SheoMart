import type { StoreItem } from "@/types/marketplace";
import { ApprovedStoreCard } from "@/components/store/ApprovedStoreCard";
import { RoyalStoreCard } from "@/components/store/RoyalStoreCard";
import { VerifiedStoreCard } from "@/components/store/VerifiedStoreCard";
import { getHighestStoreTier } from "@/components/store/storeCard.utils";

export type StoreCardProps = {
  store: StoreItem;
};

export function StoreCard({ store }: StoreCardProps) {
  const tier = getHighestStoreTier(store);

  if (tier === "royal") {
    return <RoyalStoreCard store={store} />;
  }

  if (tier === "verified") {
    return <VerifiedStoreCard store={store} />;
  }

  return <ApprovedStoreCard store={store} />;
}
