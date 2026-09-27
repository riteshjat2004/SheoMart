import { CalendarDays, MapPin, Store } from "lucide-react";
import { verifiedTheme } from "@/themes/verifiedTheme";
import type { StoreItem } from "@/types/marketplace";

export function VerifiedAboutStore({ store }: { store: StoreItem }) {
  const location = [store.city, store.state].filter(Boolean).join(", ") || "Sheopur, Madhya Pradesh";

  return (
    <section
      className={`grid gap-6 rounded-[2rem] border p-5 sm:p-6 lg:grid-cols-[1.4fr_0.6fr] ${verifiedTheme.panel}`}
      aria-labelledby="verified-about-heading"
    >
      <div>
        <p className={`text-xs font-semibold uppercase tracking-[0.2em] ${verifiedTheme.accent}`}>
          About the seller
        </p>
        <h2 id="verified-about-heading" className={`mt-2 text-2xl font-semibold ${verifiedTheme.panelText}`}>
          A store built around dependable essentials
        </h2>
        <p className={`mt-4 text-sm leading-7 ${verifiedTheme.panelMutedText}`}>
          {store.description ??
            "This verified seller curates everyday essentials with a focus on dependable quality, transparent pricing, and prompt local fulfillment."}
        </p>
      </div>

      <div className={`space-y-4 rounded-2xl border p-4 ${verifiedTheme.panelMuted}`}>
        <div className="flex gap-3">
          <Store className={`h-5 w-5 shrink-0 ${verifiedTheme.icon}`} />
          <div>
            <p className={`text-xs uppercase tracking-wider ${verifiedTheme.panelMutedText}`}>Store Specialization</p>
            <p className={`mt-1 text-sm font-semibold ${verifiedTheme.panelText}`}>Everyday Groceries &amp; Essentials</p>
          </div>
        </div>

        <div className="flex gap-3">
          <MapPin className={`h-5 w-5 shrink-0 ${verifiedTheme.icon}`} />
          <div>
            <p className={`text-xs uppercase tracking-wider ${verifiedTheme.panelMutedText}`}>Location</p>
            <p className={`mt-1 text-sm font-semibold ${verifiedTheme.panelText}`}>{location}</p>
          </div>
        </div>

        <div className="flex gap-3">
          <CalendarDays className={`h-5 w-5 shrink-0 ${verifiedTheme.icon}`} />
          <div>
            <p className={`text-xs uppercase tracking-wider ${verifiedTheme.panelMutedText}`}>Verification Status</p>
            <p className={`mt-1 text-sm font-semibold ${verifiedTheme.panelText}`}>SheoMart Verified Merchant</p>
          </div>
        </div>
      </div>
    </section>
  );
}