import { Layers3, PackageOpen } from "lucide-react";
import { verifiedTheme } from "@/themes/verifiedTheme";
import type { ProductItem } from "@/types/marketplace";
import { VerifiedSectionHeader } from "./VerifiedSectionHeader";

export function VerifiedCollections({ products }: { products: ProductItem[] }) {
  const collections = ["Best Sellers", "New Arrivals", "Premium Picks", "Budget Deals", "Trending Now"].map((title, index) => ({ title, product: products[index % Math.max(products.length, 1)] }));
  return <section className="space-y-4" aria-labelledby="verified-collections-heading"><VerifiedSectionHeader icon={Layers3} title="Featured Collections" subtitle="Curated shelves for a quicker, more considered shop." /><h2 id="verified-collections-heading" className="sr-only">Featured collections</h2><div className="flex snap-x gap-4 overflow-x-auto pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">{collections.map(({ title, product }) => <article key={title} className={`relative min-h-[170px] min-w-[245px] snap-start overflow-hidden rounded-3xl border p-5 ${verifiedTheme.hero}`}>{product?.image?.url || product?.thumbnail || product?.images?.[0] ? <img src={product.image?.url || product.thumbnail || product.images?.[0]} alt="" className="absolute inset-0 h-full w-full object-cover opacity-35" /> : <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(231,200,115,0.25),transparent_45%)]" />}<div className="absolute inset-0 bg-slate-950/45" /><div className="relative flex h-full flex-col justify-between text-white"><PackageOpen className="h-6 w-6 text-emerald-200" /><div><h3 className="text-lg font-semibold">{title}</h3><p className="mt-1 text-sm text-emerald-100">{products.length} products</p></div></div></article>)}</div></section>;
}
