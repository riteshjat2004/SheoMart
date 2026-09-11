import type { StoreItem } from "@/types/marketplace";
import { ApprovedStoreCard } from "@/components/store/ApprovedStoreCard";
import { RoyalStoreCard } from "@/components/store/RoyalStoreCard";
import { VerifiedStoreCard } from "@/components/store/VerifiedStoreCard";
import { getStoreBadge } from "@/components/store/storeCard.utils";

export type StoreCardProps = {
  store: StoreItem;
};

export function StoreCard({ store }: StoreCardProps) {
  const badge = getStoreBadge(store);

  switch (badge) {
    case "royal":
      return <RoyalStoreCard store={store} />;
    case "verified":
      return <VerifiedStoreCard store={store} />;
    default:
      return <ApprovedStoreCard store={store} />;
  }
}
