import { ArrowRight, CheckCircle2 } from "lucide-react";
import { verifiedTheme } from "@/themes/verifiedTheme";
import type { ProductItem } from "@/types/marketplace";

export function VerifiedSpotlight({ product }: { product?: ProductItem }) {
  const image = product?.image?.url || product?.thumbnail || product?.images?.[0];

  return (
    <section
      className={`relative isolate overflow-hidden rounded-[2rem] border p-5 sm:p-7 ${verifiedTheme.panel}`}
      aria-labelledby="verified-spotlight-heading"
    >
      {image ? (
        <img
          src={image}
          alt=""
          className="absolute inset-0 -z-10 h-full w-full object-cover opacity-15"
        />
      ) : null}
      <div className="absolute inset-0 -z-10 bg-gradient-to-r from-emerald-50/90 via-emerald-50/40 to-transparent dark:from-emerald-950/80 dark:via-emerald-950/40" />
      <div className="max-w-xl">
        <p className={`flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] ${verifiedTheme.accent}`}>
          <CheckCircle2 className="h-4 w-4" /> Store Spotlight
        </p>
        <h2 id="verified-spotlight-heading" className={`mt-2 text-2xl font-bold ${verifiedTheme.panelText}`}>
          {product?.category ?? "Everyday Fresh Essentials"}
        </h2>
        <p className={`mt-2 text-sm leading-6 ${verifiedTheme.panelMutedText}`}>
          Explore carefully inspected products from this verified store, chosen for dependable quality and fair, honest pricing.
        </p>
        <button
          type="button"
          className={`mt-4 inline-flex items-center gap-2 text-sm font-semibold transition hover:gap-3 ${verifiedTheme.icon}`}
        >
          Browse spotlight <ArrowRight className="h-4 w-4" />
        </button>
      </div>
    </section>
  );
}
