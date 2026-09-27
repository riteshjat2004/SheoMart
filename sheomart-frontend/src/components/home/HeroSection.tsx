"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Sparkles,
  MapPin,
  Clock,
  Search,
  ArrowRight,
  TrendingUp,
  ShieldCheck,
  ShoppingBag,
  Zap,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { HeroCarousel } from "@/components/home/HeroCarousel";

interface HeroSectionProps {
  initialSearch?: string;
  onSearch?: (query: string) => void;
}

export function HeroSection({ initialSearch = "", onSearch }: HeroSectionProps) {
  const router = useRouter();
  const [greeting, setGreeting] = useState("Hello, Sheopur!");
  const [searchVal, setSearchVal] = useState(initialSearch);

  useEffect(() => {
    const hour = new Date().getHours();
    if (hour >= 5 && hour < 12) {
      setGreeting("Good morning, Sheopur! ☀️");
    } else if (hour >= 12 && hour < 17) {
      setGreeting("Good afternoon, Sheopur! 🌤️");
    } else {
      setGreeting("Good evening, Sheopur! 🌙");
    }
  }, []);

  const handleSearchSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const query = searchVal.trim();
    if (!query) return;
    if (onSearch) {
      onSearch(query);
    } else {
      router.push(`/explore?query=${encodeURIComponent(query)}`);
    }
  };

  const trendingTags = [
    "Amul Milk",
    "Fresh Tomatoes",
    "Aashirvaad Atta",
    "Fortune Mustard Oil",
    "Green Peas",
    "Lays Classic",
  ];

  const quickCategories = [
    { label: "Veggies", icon: "🥦", href: "/explore?category=vegetables" },
    { label: "Fruits", icon: "🍎", href: "/explore?category=fruits" },
    { label: "Dairy & Milk", icon: "🥛", href: "/explore?category=dairy" },
    { label: "Bakery", icon: "🍞", href: "/explore?category=bakery" },
    { label: "Snacks", icon: "🥨", href: "/explore?category=snacks" },
    { label: "Cold Drinks", icon: "🧃", href: "/explore?category=beverages" },
    { label: "Atta & Rice", icon: "🌾", href: "/explore?category=staples" },
  ];

  return (
    <section className="relative overflow-hidden rounded-[2.5rem] border border-emerald-900/40 bg-gradient-to-br from-stone-950 via-zinc-900 to-emerald-950/60 p-6 sm:p-8 lg:p-12 shadow-[0_30px_90px_-40px_rgba(16,185,129,0.3)]">
      {/* Background ambient radial glows */}
      <div className="pointer-events-none absolute -right-20 -top-20 h-96 w-96 rounded-full bg-emerald-500/15 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-20 -left-20 h-96 w-96 rounded-full bg-teal-500/10 blur-3xl" />

      <div className="relative grid gap-10 lg:grid-cols-[1.15fr_0.85fr] lg:items-center">
        {/* Left Column: Human Storytelling, Location, Search, Category Chips */}
        <div className="space-y-6">
          {/* Dynamic Human Greeting & Delivery Widget */}
          <div className="flex flex-wrap items-center gap-3">
            <span className="inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-950/60 px-3.5 py-1.5 text-xs font-semibold uppercase tracking-wider text-emerald-300 backdrop-blur-md">
              <Sparkles className="h-3.5 w-3.5 text-emerald-400" />
              {greeting}
            </span>

            <div className="inline-flex items-center gap-2 rounded-full border border-stone-800 bg-stone-900/80 px-3.5 py-1.5 text-xs text-stone-300">
              <MapPin className="h-3.5 w-3.5 text-emerald-400" />
              <span>Delivering to <strong>Sheopur City</strong></span>
              <span className="flex items-center gap-1 rounded-full bg-emerald-500/20 px-2 py-0.5 font-medium text-emerald-300 text-[11px]">
                <Clock className="h-3 w-3" /> 15–30 Mins
              </span>
            </div>
          </div>

          {/* Main Headline */}
          <div className="space-y-3">
            <h1 className="text-4xl font-extrabold tracking-tight text-white sm:text-5xl lg:text-6xl leading-[1.12]">
              Fresh groceries from your{" "}
              <span className="bg-gradient-to-r from-emerald-400 via-teal-300 to-emerald-200 bg-clip-text text-transparent">
                trusted local stores
              </span>.
            </h1>
            <p className="max-w-xl text-base text-stone-300 sm:text-lg leading-relaxed">
              Skip the market rush. Get handpicked vegetables, dairy, pantry staples, and household favorites delivered with care across Sheopur district.
            </p>
          </div>

          {/* Search Box with Integrated Trending Searches */}
          <div className="space-y-3">
            <form
              onSubmit={handleSearchSubmit}
              className="relative flex items-center rounded-2xl border border-stone-700/80 bg-stone-900/90 p-1.5 shadow-lg backdrop-blur-md transition-all focus-within:border-emerald-500 focus-within:ring-2 focus-within:ring-emerald-500/20"
            >
              <div className="flex h-11 w-11 shrink-0 items-center justify-center text-emerald-400">
                <Search className="h-5 w-5" />
              </div>
              <input
                type="text"
                value={searchVal}
                onChange={(e) => setSearchVal(e.target.value)}
                placeholder="Search fresh veggies, milk, fruits, atta, snacks..."
                className="w-full bg-transparent px-2 text-sm sm:text-base text-white placeholder-stone-400 focus:outline-none"
              />
              <Button
                type="submit"
                className="shrink-0 rounded-xl bg-emerald-600 px-5 text-sm font-semibold text-white shadow-md hover:bg-emerald-500 transition-colors"
              >
                Search
              </Button>
            </form>

            {/* Trending tags */}
            <div className="flex flex-wrap items-center gap-1.5 text-xs text-stone-400">
              <span className="inline-flex items-center gap-1 text-emerald-400 font-medium">
                <TrendingUp className="h-3 w-3" /> Trending:
              </span>
              {trendingTags.map((tag) => (
                <button
                  key={tag}
                  type="button"
                  onClick={() => {
                    setSearchVal(tag);
                    router.push(`/explore?query=${encodeURIComponent(tag)}`);
                  }}
                  className="rounded-lg border border-stone-800 bg-stone-900/60 px-2 py-1 text-stone-300 transition hover:border-emerald-500/50 hover:text-emerald-300"
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>

          {/* Instant Quick Category Chips */}
          <div className="pt-2">
            <p className="text-xs font-semibold uppercase tracking-wider text-stone-400 mb-2.5">
              Quick Categories
            </p>
            <div className="flex flex-wrap gap-2">
              {quickCategories.map((cat) => (
                <Link
                  key={cat.label}
                  href={cat.href}
                  className="group flex items-center gap-2 rounded-xl border border-stone-800 bg-stone-900/80 px-3 py-2 text-xs font-medium text-stone-200 shadow-sm transition hover:border-emerald-500/50 hover:bg-emerald-950/40 hover:text-white"
                >
                  <span className="text-sm transition group-hover:scale-110">{cat.icon}</span>
                  <span>{cat.label}</span>
                </Link>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Hero Visual Showcase with Floating Cards */}
        <div className="relative">
          {/* Main Showcase Container */}
          <div className="relative rounded-[2rem] border border-emerald-500/20 bg-stone-900/80 p-2 shadow-2xl backdrop-blur-xl">
            <HeroCarousel />
          </div>

          {/* Floating Pill 1: Fresh Veggies */}
          <div className="animate-float-subtle absolute -left-4 -top-4 hidden sm:flex items-center gap-2.5 rounded-2xl border border-emerald-500/30 bg-stone-900/90 px-3.5 py-2.5 shadow-xl backdrop-blur-md">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-emerald-500/20 text-emerald-400">
              <Zap className="h-4 w-4" />
            </div>
            <div>
              <p className="text-xs font-bold text-white">15–30 Mins Delivery</p>
              <p className="text-[11px] text-stone-400">Across all Sheopur wards</p>
            </div>
          </div>

          {/* Floating Pill 2: Verified Stores */}
          <div className="animate-float-alt absolute -right-3 -bottom-4 hidden sm:flex items-center gap-2.5 rounded-2xl border border-emerald-500/30 bg-stone-900/90 px-3.5 py-2.5 shadow-xl backdrop-blur-md">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-emerald-500/20 text-emerald-400">
              <ShieldCheck className="h-4 w-4" />
            </div>
            <div>
              <p className="text-xs font-bold text-white">Verified Local Kiranas</p>
              <p className="text-[11px] text-emerald-300">100% genuine products</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
