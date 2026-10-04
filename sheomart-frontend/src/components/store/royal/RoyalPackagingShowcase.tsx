import { Award, CreditCard, Crown, Package, Ribbon } from "lucide-react";
import { royalTheme } from "./royalTheme";

const items = [
  {
    icon: Package,
    title: "Signature Matte Black Box",
    text: "Reinforced rigid box engineered for thermal insulation and structural protection.",
  },
  {
    icon: Ribbon,
    title: "Embossed Gold Ribbon",
    text: "Hand-tied champagne gold satin ribbon with our bespoke SheoMart emblem.",
  },
  {
    icon: CreditCard,
    title: "Wax-Sealed Patron Card",
    text: "A personal appreciation note and lot verification certificate inside every parcel.",
  },
  {
    icon: Award,
    title: "Authenticity Hallmark",
    text: "Unique tamper-evident seal ensuring uncompromised purity from store to doorstep.",
  },
];

export function RoyalPackagingShowcase() {
  return (
    <section className="space-y-4" aria-labelledby="royal-packaging-heading">
      <div>
        <p className={`flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] ${royalTheme.accent}`}>
          <Crown className="h-3.5 w-3.5" />
          The Unboxing Ritual
        </p>
        <h2 id="royal-packaging-heading" className={`mt-1 text-2xl font-bold tracking-tight ${royalTheme.panelText}`}>
          Luxury Packaging Experience
        </h2>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {items.map(({ icon: Icon, title, text }) => (
          <article
            key={title}
            className={`group rounded-2xl border border-amber-300/80 p-5 backdrop-blur-sm transition-all duration-300 dark:border-amber-400/30 ${royalTheme.panel} ${royalTheme.hover}`}
          >
            <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-amber-400/40 bg-amber-500/10 text-amber-600 dark:text-amber-400 transition-colors group-hover:bg-amber-400 group-hover:text-stone-950">
              <Icon className="h-5 w-5" />
            </div>
            <h3 className="mt-4 text-base font-bold text-stone-900 group-hover:text-amber-700 dark:text-white dark:group-hover:text-amber-200 transition-colors">{title}</h3>
            <p className="mt-1.5 text-xs leading-5 text-stone-600 dark:text-stone-300">{text}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
