"use client";

import Link from "next/link";
import { Heart, ArrowRight, Store, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

export function LocalStorySection() {
  return (
    <section className="relative overflow-hidden rounded-[2.5rem] border border-emerald-200/70 bg-gradient-to-br from-emerald-50/70 via-stone-50/80 to-teal-50/50 p-6 sm:p-10 lg:p-12 shadow-sm dark:border-stone-800 dark:bg-gradient-to-br dark:from-stone-900 dark:via-stone-950 dark:to-emerald-950/80 dark:shadow-xl">
      <div className="grid gap-8 lg:grid-cols-[1.2fr_0.8fr] lg:items-center">
        <div className="space-y-5">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/20 bg-emerald-50 px-3.5 py-1 text-xs font-semibold uppercase tracking-wider text-emerald-800 dark:border-emerald-500/30 dark:bg-emerald-950/60 dark:text-emerald-300">
            <Heart className="h-3.5 w-3.5 text-rose-500 fill-rose-500" />
            The Sheopur Story
          </span>

          <h2 className="text-3xl font-extrabold text-stone-900 sm:text-4xl leading-tight dark:text-white">
            Rooted in Sheopur, <br className="hidden sm:inline" />
            <span className="bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent dark:from-emerald-400 dark:to-teal-300">
              built for our own community
            </span>.
          </h2>

          <p className="text-sm sm:text-base leading-relaxed text-stone-600 dark:text-stone-300">
            SheoMart is not an impersonal mega-warehouse. We are a community platform connecting you directly with the trusted neighborhood shopkeepers who have served Sheopur families for generations.
          </p>

          <div className="grid gap-3 pt-2 text-xs sm:text-sm text-stone-700 dark:text-stone-300 sm:grid-cols-2">
            <div className="flex items-center gap-2.5">
              <CheckCircle className="h-4 w-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
              <span>Empowering local store owners</span>
            </div>
            <div className="flex items-center gap-2.5">
              <CheckCircle className="h-4 w-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
              <span>Farm-to-kitchen fresh daily harvest</span>
            </div>
            <div className="flex items-center gap-2.5">
              <CheckCircle className="h-4 w-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
              <span>Fair prices with zero hidden markups</span>
            </div>
            <div className="flex items-center gap-2.5">
              <CheckCircle className="h-4 w-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
              <span>Supporting our district economy</span>
            </div>
          </div>

          <div className="flex flex-wrap gap-3 pt-3">
            <Button asChild className="rounded-xl bg-emerald-600 px-6 font-semibold text-white hover:bg-emerald-500">
              <Link href="/explore">
                Shop Local Stores
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button asChild variant="outline" className="rounded-xl border-stone-300 text-stone-700 hover:bg-stone-100 dark:border-stone-700 dark:text-stone-200 dark:hover:bg-stone-800">
              <Link href="/become-seller">
                <Store className="mr-2 h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                Register Your Store
              </Link>
            </Button>
          </div>
        </div>

        {/* Visual Badge Card */}
        <div className="relative rounded-3xl border border-emerald-100 bg-white/90 p-6 sm:p-8 shadow-sm backdrop-blur-md space-y-4 dark:border-stone-800 dark:bg-stone-900/80">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-50 text-2xl dark:bg-emerald-500/20">
              🌾
            </div>
            <div>
              <p className="text-base font-bold text-stone-900 dark:text-white">Sheopur Local Promise</p>
              <p className="text-xs text-emerald-700 dark:text-emerald-400">Pure • Fresh • Trustworthy</p>
            </div>
          </div>

          <blockquote className="border-l-2 border-emerald-500 pl-4 text-xs italic leading-relaxed text-stone-600 dark:text-stone-300">
            &ldquo;When you order on SheoMart, you are directly supporting a local merchant on Pali Road, Main Market, or Station Road. Every rupee stays within our town.&rdquo;
          </blockquote>

          <div className="pt-2 flex items-center justify-between text-xs text-stone-500 border-t border-stone-100 dark:border-stone-800 dark:text-stone-400">
            <span>Made with pride in Sheopur, MP</span>
            <span className="font-semibold text-emerald-700 dark:text-emerald-300">PIN: 476337</span>
          </div>
        </div>
      </div>
    </section>
  );
}
