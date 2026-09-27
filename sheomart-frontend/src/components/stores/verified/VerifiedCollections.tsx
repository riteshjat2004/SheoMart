import { ArrowRight, Layers3, PackageOpen } from "lucide-react";
import { verifiedTheme } from "@/themes/verifiedTheme";
import type { ProductItem } from "@/types/marketplace";
import { VerifiedSectionHeader } from "./VerifiedSectionHeader";

const collectionNames = [
  { title: "Daily Kitchen Staples", count: "Essential Items" },
  { title: "Dairy & Fresh Bakery", count: "Fresh Daily" },
  { title: "Snacks & Refreshments", count: "Quick Bites" },
  { title: "Household & Hygiene", count: "Home Care" },
  { title: "Local Specialty Picks", count: "Neighborhood Best" },
];

export function VerifiedCollections({ products }: { products: ProductItem[] }) {
  const collections = collectionNames.map((col, index) => ({
    ...col,
    product: products[index % Math.max(products.length, 1)],
  }));

  return (
    <section className="space-y-4" aria-labelledby="verified-collections-heading">
      <VerifiedSectionHeader
        icon={Layers3}
        title="Featured Aisles"
        subtitle="Explore organized grocery aisles for a faster, simpler shopping trip."
      />
      <h2 id="verified-collections-heading" className="sr-only">
        Featured aisles
      </h2>

      <div className="flex snap-x gap-4 overflow-x-auto pb-3 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {collections.map(({ title, count, product }) => {
          const image = product?.image?.url || product?.thumbnail || product?.images?.[0];

          return (
            <article
              key={title}
              className="group relative flex min-h-[180px] min-w-[250px] snap-start flex-col justify-between overflow-hidden rounded-3xl border border-emerald-300/40 bg-gradient-to-br from-emerald-950 via-teal-950 to-slate-950 p-5 shadow-sm transition-all duration-300 hover:border-emerald-400 hover:shadow-md"
            >
              {image ? (
                <img
                  src={image}
                  alt=""
                  className="absolute inset-0 h-full w-full object-cover opacity-25 transition-transform duration-500 group-hover:scale-105"
                />
              ) : (
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(16,185,129,0.3),transparent_50%)]" />
              )}
              <div className="absolute inset-0 bg-slate-950/50" />

              <div className="relative flex items-center justify-between">
                <PackageOpen className="h-6 w-6 text-emerald-300" />
                <span className="rounded-full bg-emerald-500/20 px-2.5 py-0.5 text-[10px] font-bold text-emerald-200 border border-emerald-400/30">
                  {count}
                </span>
              </div>

              <div className="relative mt-auto pt-4">
                <h3 className="text-base font-bold text-white group-hover:text-emerald-200 transition-colors">
                  {title}
                </h3>
                <p className="mt-1 flex items-center text-xs font-medium text-emerald-100/80 group-hover:text-emerald-300 transition-colors">
                  Browse aisle <ArrowRight className="ml-1 h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
                </p>
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}
