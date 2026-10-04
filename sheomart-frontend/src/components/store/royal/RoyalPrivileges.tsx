import { Crown, Gift, Headset, Rocket, Sparkles, Zap } from "lucide-react";
import { royalTheme } from "./royalTheme";

const privileges = [
  {
    icon: Gift,
    label: "Free Luxury Gift Wrap",
    desc: "Signature matte-black presentation with custom metallic cards.",
  },
  {
    icon: Rocket,
    label: "Priority Express Dispatch",
    desc: "Immediate fulfillment with same-day royal delivery priority.",
  },
  {
    icon: Headset,
    label: "Dedicated VIP Concierge",
    desc: "Instant hotline and WhatsApp assistance from personal specialists.",
  },
  {
    icon: Zap,
    label: "Exclusive Early Access",
    desc: "First rights to limited releases, seasonal harvests, and drops.",
  },
  {
    icon: Crown,
    label: "Royal Authenticity Certified",
    desc: "100% verified genuine provenance with SheoMart seal.",
  },
  {
    icon: Sparkles,
    label: "White-Glove Care",
    desc: "Temperature-monitored, hand-packed with signature seals.",
  },
];

export function RoyalPrivileges() {
  return (
    <section className="space-y-4" aria-labelledby="royal-privileges-heading">
      <div>
        <p className={`flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] ${royalTheme.accent}`}>
          <Crown className="h-3.5 w-3.5" />
          The Royal Standard
        </p>
        <h2 id="royal-privileges-heading" className={`mt-1 text-2xl font-bold tracking-tight ${royalTheme.panelText}`}>
          Flagship Royal Privileges
        </h2>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {privileges.map(({ icon: Icon, label, desc }) => (
          <article
            key={label}
            className={`group rounded-2xl border border-amber-300/80 p-5 backdrop-blur-sm transition-all duration-300 dark:border-amber-400/30 ${royalTheme.panel} ${royalTheme.hover}`}
          >
            <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-amber-400/40 bg-amber-500/10 text-amber-600 dark:text-amber-400 shadow-sm transition-colors group-hover:bg-amber-400 group-hover:text-stone-950">
              <Icon className="h-5 w-5" />
            </div>
            <p className="mt-4 text-base font-bold text-stone-900 group-hover:text-amber-700 dark:text-white dark:group-hover:text-amber-200 transition-colors">{label}</p>
            <p className="mt-1.5 text-xs leading-5 text-stone-600 dark:text-stone-300">{desc}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
