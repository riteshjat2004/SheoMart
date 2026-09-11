"use client";

import { Flame, PackagePlus, Star } from "lucide-react";
import { ProductCard } from "@/components/marketplace/ProductCard";
import { verifiedTheme } from "@/themes/verifiedTheme";
import type { ProductItem } from "@/types/marketplace";
import { VerifiedSectionHeader } from "./VerifiedSectionHeader";

export function VerifiedProductStrip({ title, subtitle, products, mode }: { title: string; subtitle: string; products: ProductItem[]; mode: "best" | "new" | "trending" }) {
  const Icon = mode === "new" ? PackagePlus : mode === "trending" ? Flame : Star;
  const sorted = [...products].sort((first, second) => mode === "new" ? new Date(second.createdAt ?? 0).getTime() - new Date(first.createdAt ?? 0).getTime() : Number(second.rating ?? 0) - Number(first.rating ?? 0)).slice(0, 8);
  if (!sorted.length) return null;
  return <section className="space-y-4" aria-label={title}><VerifiedSectionHeader icon={Icon} title={title} subtitle={subtitle} /><div className="flex gap-4 overflow-x-auto pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">{sorted.map((product) => <div key={product.productId ?? product.name} className="w-[240px] shrink-0 sm:w-[260px]"><ProductCard product={product} /></div>)}</div><p className={`text-xs ${verifiedTheme.panelMutedText}`}>Showing a curated selection from this store.</p></section>;
}
