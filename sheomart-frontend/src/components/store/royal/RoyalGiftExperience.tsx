import { Gift, Mail, PackageCheck, Sparkles, Crown } from "lucide-react";
import { royalTheme } from "./royalTheme";

const gifts = [
  { icon: Gift, label: "Signature Gift Wrap", desc: "Matte black box with gold satin ribbon" },
  { icon: Mail, label: "Personalized Card", desc: "Handwritten note embossed with wax seal" },
  { icon: PackageCheck, label: "Pristine Sealed Box", desc: "Tamper-proof security strip & thermal liner" },
  { icon: Sparkles, label: "Surprise Extras", desc: "Curated gourmet treats on select hampers" },
];

export function RoyalGiftExperience() {
  return (
    <section className="space-y-4" aria-labelledby="royal-gift-heading">
      <div>
        <p className={`flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] ${royalTheme.accent}`}>
          <Crown className="h-3.5 w-3.5" />
          Memorable Gifting
        </p>
        <h2 id="royal-gift-heading" className={`mt-1 text-2xl font-bold tracking-tight ${royalTheme.panelText}`}>
          The Royal Gift Experience
        </h2>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {gifts.map(({ icon: Icon, label, desc }) => (
          <article
            key={label}
            className={`group rounded-2xl border border-amber-400/30 p-5 text-center transition-all duration-300 ${royalTheme.panel} ${royalTheme.hover}`}
          >
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl border border-amber-400/40 bg-amber-500/10 text-amber-400 transition-colors group-hover:bg-amber-400 group-hover:text-stone-950">
              <Icon className="h-6 w-6" />
            </div>
            <p className="mt-3.5 text-sm font-bold text-white group-hover:text-amber-200 transition-colors">{label}</p>
            <p className="mt-1 text-xs text-stone-300">{desc}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
