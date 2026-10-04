import { ArrowRight, Crown, Sparkles } from "lucide-react";
import { royalTheme } from "./royalTheme";
import type { ProductItem } from "@/types/marketplace";

const collections = [
  { title: "Signature Selections", tag: "Handpicked" },
  { title: "Artisan & Gourmet", tag: "Premium" },
  { title: "Limited Harvest", tag: "Rare Finds" },
  { title: "Connoisseur's Choice", tag: "Exclusive" },
  { title: "Flagship Reserve", tag: "Curated" },
  { title: "Royal Pantry", tag: "Everyday Luxury" },
];

export function RoyalCollections({ products }: { products: ProductItem[] }) {
  return (
    <section className="space-y-4" aria-labelledby="royal-collections-heading">
      <div className="flex items-center justify-between">
        <div>
          <p className={`flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] ${royalTheme.accent}`}>
            <Crown className="h-3.5 w-3.5" />
            Curated Themes
          </p>
          <h2 id="royal-collections-heading" className={`mt-1 text-2xl font-bold tracking-tight ${royalTheme.panelText}`}>
            Royal Exclusive Collections
          </h2>
        </div>
        <span className="text-xs text-stone-500 dark:text-amber-200/70 hidden sm:inline">Handcrafted for premium lifestyles</span>
      </div>

      <div className="flex gap-4 overflow-x-auto pb-3 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {collections.map(({ title, tag }, index) => {
          const product = products[index % Math.max(products.length, 1)];
          const image = product?.image?.url || product?.thumbnail || product?.images?.[0];

          return (
            <article
              key={title}
              className={`group relative flex min-h-[200px] min-w-[260px] flex-col justify-between overflow-hidden rounded-3xl border border-amber-300/80 p-6 shadow-md shadow-amber-500/10 dark:border-amber-400/35 dark:shadow-black/40 transition-all duration-300 ${royalTheme.panel} ${royalTheme.hover}`}
            >
              {/* Product Background Image */}
              {image ? (
                <img
                  src={image}
                  alt=""
                  className="absolute inset-0 h-full w-full object-cover opacity-15 dark:opacity-20 transition-transform duration-500 group-hover:scale-110"
                />
              ) : null}
              <div className="absolute inset-0 bg-gradient-to-t from-white/95 via-white/80 to-transparent dark:from-black dark:via-black/75 dark:to-transparent" />

              <div className="relative flex items-center justify-between">
                <span className="inline-flex items-center gap-1 rounded-full border border-amber-300 bg-amber-50 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-amber-900 shadow-xs dark:border-amber-400/40 dark:bg-black/70 dark:text-amber-300">
                  <Sparkles className="h-2.5 w-2.5" />
                  {tag}
                </span>
                <Crown className="h-5 w-5 text-amber-600 dark:text-amber-400/70 group-hover:text-amber-700 dark:group-hover:text-amber-300 transition-colors" />
              </div>

              <div className="relative mt-auto pt-6">
                <h3 className="text-lg font-bold text-stone-900 group-hover:text-amber-700 dark:text-white dark:group-hover:text-amber-200 transition-colors">
                  {title}
                </h3>
                <p className="mt-1 flex items-center text-xs font-semibold text-stone-600 group-hover:text-amber-700 dark:text-stone-300 dark:group-hover:text-amber-300 transition-colors">
                  Explore Curated Picks <ArrowRight className="ml-1.5 h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
                </p>
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}
