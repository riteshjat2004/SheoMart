import { Gift, Mail, PackageCheck, Sparkles } from "lucide-react";
import { royalTheme } from "./royalTheme";

const gifts = [{ icon: Gift, label: "Gift Wrap" }, { icon: Mail, label: "Personalized Note" }, { icon: PackageCheck, label: "Premium Packaging" }, { icon: Sparkles, label: "Surprise Gift Option" }];

export function RoyalGiftExperience() { return <section className="space-y-4" aria-labelledby="royal-gift-heading"><h2 id="royal-gift-heading" className={`text-2xl font-semibold ${royalTheme.panelText}`}>The Royal Gift Experience</h2><div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">{gifts.map(({ icon: Icon, label }) => <article key={label} className={`rounded-2xl border p-4 text-center ${royalTheme.panel} ${royalTheme.hover}`}><Icon className={`mx-auto h-6 w-6 ${royalTheme.icon}`} /><p className={`mt-3 text-sm font-semibold ${royalTheme.panelText}`}>{label}</p></article>)}</div></section>; }
