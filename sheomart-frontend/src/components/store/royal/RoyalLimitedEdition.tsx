import { Crown, Heart, Sparkles } from "lucide-react";
import { royalTheme } from "./royalTheme";
import type { ProductItem } from "@/types/marketplace";

export function RoyalLimitedEdition({ products }: { products: ProductItem[] }) {
  const items = products.slice(0, 4);
  if (!items.length) return null;
  return <section className="space-y-4" aria-labelledby="royal-limited-heading"><div><p className={`flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] ${royalTheme.accent}`}><Sparkles className="h-4 w-4" /> Curated rarity</p><h2 id="royal-limited-heading" className={`mt-2 text-2xl font-semibold ${royalTheme.panelText}`}>Limited Edition Showcase</h2></div><div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">{items.map((product) => { const image = product.image?.url || product.thumbnail || product.images?.[0]; return <article key={product.productId ?? product.name} className={`relative overflow-hidden rounded-3xl border p-4 ${royalTheme.panel} ${royalTheme.hover}`}>{image ? <img src={image} alt={product.name} className="h-36 w-full rounded-2xl object-cover" /> : <div className="h-36 rounded-2xl bg-stone-900" />}<div className="mt-3 flex items-center justify-between gap-2"><span className={`rounded-full border px-2 py-1 text-[10px] font-semibold ${royalTheme.badge}`}>Limited Edition</span><Heart className={`h-4 w-4 ${royalTheme.icon}`} aria-label="Wishlist" /></div><h3 className={`mt-3 line-clamp-1 text-sm font-semibold ${royalTheme.panelText}`}>{product.name}</h3><p className="mt-1 text-xs text-stone-400">Availability subject to collection release.</p></article>; })}</div></section>;
}
