import { Crown, Gift, Headset, Rocket, Sparkles, Zap } from "lucide-react";
import { royalTheme } from "./royalTheme";

const privileges = [{ icon: Gift, label: "Free Luxury Gift Wrap" }, { icon: Rocket, label: "Priority Shipping" }, { icon: Headset, label: "VIP Customer Support" }, { icon: Zap, label: "Early Product Access" }, { icon: Crown, label: "Exclusive Launch Access" }, { icon: Sparkles, label: "Premium Packaging" }];

export function RoyalPrivileges() { return <section className="space-y-4" aria-labelledby="royal-privileges-heading"><h2 id="royal-privileges-heading" className={`text-2xl font-semibold ${royalTheme.panelText}`}>Royal Privileges</h2><div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">{privileges.map(({ icon: Icon, label }) => <article key={label} className={`rounded-2xl border p-4 ${royalTheme.panel} ${royalTheme.hover}`}><Icon className={`h-5 w-5 ${royalTheme.icon}`} /><p className={`mt-4 text-sm font-semibold ${royalTheme.panelText}`}>{label}</p><p className="mt-1 text-xs text-stone-400">Available to Royal customers.</p></article>)}</div></section>; }
