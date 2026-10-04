import { ArrowRight, Crown, Sparkles, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { royalTheme } from "./royalTheme";

export function RoyalMembershipBanner() {
  return (
    <section
      className={`relative overflow-hidden rounded-[2rem] border border-amber-300/80 p-7 sm:p-9 shadow-xl shadow-amber-500/10 dark:border-amber-400/60 dark:shadow-black/50 ${royalTheme.hero}`}
      aria-labelledby="royal-membership-heading"
    >
      <div className="pointer-events-none absolute -right-12 -top-20 h-64 w-64 rounded-full bg-amber-400/15 blur-3xl" />
      <div className="pointer-events-none absolute left-1/3 bottom-0 h-40 w-40 rounded-full bg-yellow-500/10 blur-2xl" />

      <div className="relative flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
        <div className="max-w-xl">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-300 bg-amber-100/90 text-amber-900 px-3 py-1 text-xs font-bold uppercase tracking-[0.2em] shadow-xs dark:border-amber-400/50 dark:bg-black/60 dark:text-amber-300">
              <Crown className="h-3.5 w-3.5 fill-amber-500 text-amber-500 dark:fill-amber-400 dark:text-amber-400" />
              SheoMart Royal Circle
            </span>
          </div>

          <h2 id="royal-membership-heading" className="mt-3 text-2xl font-extrabold tracking-tight text-stone-900 dark:text-white sm:text-3xl">
            Unlock Lifetime Royal Privileges
          </h2>

          <p className="mt-2 text-sm leading-6 text-stone-600 dark:text-stone-300">
            Enjoy priority order fulfillment, zero delivery surcharges on flagship stores, bespoke gift wrap, and invitations to private seasonal launches.
          </p>

          <div className="mt-4 flex flex-wrap gap-2 text-xs text-amber-900/80 dark:text-amber-200/80 font-medium">
            <span className="flex items-center gap-1">
              <Sparkles className="h-3 w-3 text-amber-600 dark:text-amber-400" /> Unlimited Free Express Delivery
            </span>
            <span>•</span>
            <span className="flex items-center gap-1">
              <Star className="h-3 w-3 fill-amber-500 text-amber-500 dark:fill-amber-400 dark:text-amber-400" /> VIP Concierge Access
            </span>
          </div>
        </div>

        <Button
          type="button"
          className="shrink-0 bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500 px-6 py-6 font-bold text-stone-950 shadow-lg shadow-amber-500/30 transition-transform hover:scale-105 hover:from-amber-300 hover:to-yellow-300"
        >
          Join Royal Circle <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </div>
    </section>
  );
}
