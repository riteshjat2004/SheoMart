import Link from "next/link";
import { Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { HeroCarousel } from "@/components/home/HeroCarousel";

export function Hero() {
  return (
    <section className="relative overflow-hidden rounded-[2rem] border border-emerald-100 bg-gradient-to-br from-emerald-50 via-white to-amber-50 p-6 shadow-[0_24px_80px_-40px_rgba(16,185,129,0.35)] sm:p-8 lg:p-10 dark:border-emerald-950/60 dark:from-zinc-950 dark:via-zinc-900 dark:to-zinc-950">
      <div className="absolute right-0 top-0 h-40 w-40 rounded-full bg-emerald-400/20 blur-3xl" />
      <div className="relative grid gap-6 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-white/80 px-3 py-1 text-sm font-medium text-emerald-700 backdrop-blur dark:border-emerald-900/70 dark:bg-zinc-950/70 dark:text-emerald-300">
            <Sparkles className="h-4 w-4" />
            Fresh, fast, and beautifully simple
          </div>
          <h1 className="mt-5 max-w-2xl text-4xl font-semibold tracking-tight text-stone-950 sm:text-5xl lg:text-6xl dark:text-stone-50">
            Your neighborhood market, reimagined for calm shopping.
          </h1>
          <p className="mt-4 max-w-xl text-base leading-8 text-stone-600 sm:text-lg dark:text-stone-300">
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
        <div className="relative rounded-[1.75rem] border border-emerald-200/70 bg-zinc-950 p-1 shadow-[0_0_34px_-12px_rgba(16,185,129,0.9)] dark:border-emerald-900/80">
          <HeroCarousel />
        </div>
      </div>
    </section>
  );
}
