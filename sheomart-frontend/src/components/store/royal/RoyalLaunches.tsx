import { Bell, Crown, Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { royalTheme } from "./royalTheme";
import { RoyalSectionHeader } from "./RoyalSectionHeader";
import type { ProductItem } from "@/types/marketplace";

export function RoyalLaunches({ products }: { products: ProductItem[] }) {
  const product = products[0]; if (!product) return null; const image = product.image?.url || product.thumbnail || product.images?.[0];
  return <section className="space-y-4" aria-labelledby="royal-launch-heading"><RoyalSectionHeader title="Royal Launches" subtitle="First access to considered new arrivals." /><div className={`relative isolate overflow-hidden rounded-[2rem] border p-5 sm:p-8 ${royalTheme.panel}`}><div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_85%_20%,rgba(212,175,55,0.2),transparent_35%)]" /><div className="grid gap-6 md:grid-cols-[0.8fr_1.2fr] md:items-center">{image ? <img src={image} alt={product.name} className="h-56 w-full rounded-3xl object-cover opacity-80" /> : <div className="h-56 rounded-3xl bg-black" />}<div><span className={`rounded-full border px-3 py-1 text-xs font-semibold ${royalTheme.badge}`}>Royal Launch</span><h2 id="royal-launch-heading" className={`mt-4 text-3xl font-semibold ${royalTheme.panelText}`}>{product.name}</h2><p className="mt-2 text-sm text-stone-400">Availability is limited. Notify me when this collection opens.</p><div className="mt-5 flex flex-wrap gap-2"><span className={`rounded-full border px-3 py-2 text-xs ${royalTheme.chip}`}>Coming soon</span><button type="button" aria-label="Add launch to wishlist" className={`rounded-full border p-2 ${royalTheme.chip}`}><Heart className="h-4 w-4" /></button><Button type="button" className={royalTheme.primaryButton}><Bell className="h-4 w-4" /> Notify me</Button></div></div></div></div></section>;
}
