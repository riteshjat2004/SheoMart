import { Crown } from "lucide-react";
import type { StoreItem } from "@/types/marketplace";
import { VerifiedStoreHero } from "@/components/stores/verified/VerifiedStoreHero";
import { royalTheme } from "./royalTheme";
import { RoyalIdentityBanner } from "./RoyalIdentityBanner";
import { RoyalMotion } from "./RoyalMotion";
import type { ProductItem } from "@/types/marketplace";

export function RoyalStoreHero({ store, search, stickySearchRef, scrollToStickySearch }: { store: StoreItem; search?: { value: string; onChange: (value: string) => void; onClear: () => void; results: ProductItem[]; onSelect: (product: ProductItem) => void }; stickySearchRef?: React.RefObject<HTMLInputElement | null>; scrollToStickySearch?: () => void }) {
  return <RoyalMotion><div className="overflow-hidden rounded-[2rem] border border-[#D4AF37]/60 bg-black shadow-[0_24px_80px_-34px_rgba(212,175,55,0.5)]"><RoyalIdentityBanner /><VerifiedStoreHero store={store} theme={royalTheme} badgeLabel="Royal Store" BadgeIcon={Crown} identityBanner="Luxury Collection" deliveryVariant="royal" search={search} stickySearchRef={stickySearchRef} scrollToStickySearch={scrollToStickySearch} /></div></RoyalMotion>;
}
