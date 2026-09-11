"use client";
import { Crown } from "lucide-react";
import { ProductCard } from "@/components/marketplace/ProductCard";
import { royalTheme } from "./royalTheme";
import { RoyalSectionHeader } from "./RoyalSectionHeader";
import type { ProductItem } from "@/types/marketplace";
export function RoyalRecommendations({ products }: { products: ProductItem[] }) { const items = products.slice(0, 8); if (!items.length) return null; return <section className="space-y-4" aria-labelledby="royal-recommendations-heading"><RoyalSectionHeader title="Curated Luxury Recommendations" subtitle="Handpicked for your next signature selection." /><h2 id="royal-recommendations-heading" className="sr-only">Curated luxury recommendations</h2><div className="flex gap-4 overflow-x-auto pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">{items.map((product) => <div key={product.productId ?? product.name} className="w-[240px] shrink-0"><div className={`mb-2 flex items-center gap-1 text-xs ${royalTheme.accent}`}><Crown className="h-3.5 w-3.5" /> Handpicked</div><ProductCard product={product} /></div>)}</div></section>; }
