import Link from "next/link";
import { ArrowRight, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SearchBar } from "@/components/marketplace/SearchBar";

export function Hero() {
  return (
    <section className="relative overflow-hidden rounded-[2rem] border border-emerald-100 bg-gradient-to-br from-emerald-50 via-white to-amber-50 p-6 shadow-[0_24px_80px_-40px_rgba(16,185,129,0.35)] sm:p-8 lg:p-10 dark:border-emerald-950/60 dark:from-emerald-950/40 dark:via-stone-950 dark:to-stone-900">
      <div className="absolute right-0 top-0 h-40 w-40 rounded-full bg-emerald-400/20 blur-3xl" />
      <div className="relative grid gap-8 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-white/80 px-3 py-1 text-sm font-medium text-emerald-700 backdrop-blur dark:border-emerald-900/70 dark:bg-stone-950/70 dark:text-emerald-300">
            <Sparkles className="h-4 w-4" />
            Fresh, fast, and beautifully simple
          </div>
          <h1 className="mt-5 max-w-2xl text-4xl font-semibold tracking-tight text-stone-950 sm:text-5xl lg:text-6xl dark:text-stone-50">
            Your neighborhood market, reimagined for calm shopping.
          </h1>
          <p className="mt-4 max-w-xl text-lg leading-8 text-stone-600 dark:text-stone-300">
            Discover verified stores, handpicked groceries, and thoughtful essentials delivered with care.
          </p>
          <div className="mt-7 flex flex-wrap gap-3">
            <Button asChild size="lg">
              <Link href="/explore">Shop now</Link>
            </Button>
            <Button asChild size="lg" variant="outline">
              <Link href="/become-seller">Become a seller</Link>
            </Button>
          </div>
        </div>
        <div className="rounded-[1.75rem] border border-white/70 bg-white/80 p-4 shadow-lg backdrop-blur dark:border-stone-800 dark:bg-stone-900/80">
          <div className="rounded-[1.35rem] bg-[radial-gradient(circle_at_top,_rgba(16,185,129,0.18),_transparent_55%)] p-5">
            <p className="text-sm font-semibold uppercase tracking-[0.28em] text-stone-500 dark:text-stone-400">Search essentials</p>
            <div className="mt-4">
              <SearchBar />
            </div>
            <div className="mt-5 flex items-center justify-between rounded-2xl border border-stone-200 bg-stone-50 px-4 py-3 dark:border-stone-800 dark:bg-stone-950/70">
              <div>
                <p className="text-sm font-semibold text-stone-800 dark:text-stone-100">Today’s top pick</p>
                <p className="text-sm text-stone-500 dark:text-stone-400">Free delivery above ₹499</p>
              </div>
              <Button variant="ghost" size="sm" className="gap-1">
                View <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
