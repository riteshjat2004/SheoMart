import { ArrowRight, Crown } from "lucide-react";
import { royalTheme } from "./royalTheme";
import type { ProductItem } from "@/types/marketplace";

export function RoyalCollections({ products }: { products: ProductItem[] }) {
  const collections = ["Luxury Collection", "Signature Picks", "Limited Editions", "Royal Fashion", "Imported Collection", "Premium Electronics"];
  return <section className="space-y-4" aria-labelledby="royal-collections-heading"><h2 id="royal-collections-heading" className={`text-2xl font-semibold ${royalTheme.panelText}`}>Royal Exclusive Collections</h2><div className="flex gap-4 overflow-x-auto pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">{collections.map((title, index) => { const product = products[index % Math.max(products.length, 1)]; const image = product?.image?.url || product?.thumbnail || product?.images?.[0]; return <article key={title} className={`relative min-h-[190px] min-w-[250px] overflow-hidden rounded-3xl border p-5 ${royalTheme.panel} ${royalTheme.hover}`}>{image ? <img src={image} alt="" className="absolute inset-0 h-full w-full object-cover opacity-25" /> : null}<div className="absolute inset-0 bg-black/45" /><div className="relative flex h-full flex-col justify-between text-[#F8E7B0]"><Crown className={`h-6 w-6 ${royalTheme.icon}`} /><div><h3 className="text-lg font-semibold">{title}</h3><p className="mt-1 text-sm text-stone-300">{products.length} products <ArrowRight className="ml-1 inline h-4 w-4" /></p></div></div></article>; })}</div></section>;
}
