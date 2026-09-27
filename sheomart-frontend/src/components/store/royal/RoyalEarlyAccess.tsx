import { Crown, Sparkles, Timer, Unlock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { royalTheme } from "./royalTheme";

export function RoyalEarlyAccess() {
  return (
    <section
      className={`relative overflow-hidden rounded-[2rem] border border-amber-400/50 p-6 sm:p-8 shadow-xl shadow-black/40 ${royalTheme.hero}`}
      aria-labelledby="royal-early-access-heading"
    >
      <div className="relative flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className={`flex items-center gap-2 text-xs font-bold uppercase tracking-[0.2em] ${royalTheme.accent}`}>
            <Crown className="h-4 w-4 fill-amber-400" />
            VIP Priority Window
          </p>
          <h2 id="royal-early-access-heading" className="mt-2 text-2xl font-extrabold text-white">
            Access Private Drops 24 Hours Ahead
          </h2>
          <p className="mt-1 text-sm text-stone-300">
            Royal members enjoy priority reservation windows on seasonal arrivals before public release.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <span className="inline-flex items-center rounded-full border border-amber-400/30 bg-black/70 px-3.5 py-2 text-xs font-mono font-semibold text-amber-200">
            <Timer className="mr-1.5 h-4 w-4 text-amber-400" /> 18h 42m Left
          </span>
          <Button
            type="button"
            className="bg-gradient-to-r from-amber-400 to-yellow-500 font-bold text-stone-950 shadow-md shadow-amber-500/25 hover:from-amber-300 hover:to-yellow-400"
          >
            <Unlock className="mr-1.5 h-4 w-4" /> Unlock Access
          </Button>
        </div>
      </div>
    </section>
  );
}
