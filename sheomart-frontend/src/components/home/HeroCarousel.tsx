"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { ChevronLeft, ChevronRight, LoaderCircle, Star } from "lucide-react";
import { useHeroCarousel } from "@/hooks/use-home";
import type { HeroShowcaseItem } from "@/services/home";
import { DeliveryBadge } from "@/components/store/DeliveryBadge";

const labels: Record<HeroShowcaseItem["type"], string> = {
  product: "Product",
  category: "Category",
  store: "Store",
};

const badgeColors: Record<HeroShowcaseItem["type"], string> = {
  product: "bg-emerald-500 text-emerald-950",
  category: "bg-green-500 text-green-950",
  store: "bg-cyan-400 text-cyan-950",
};

const emptyItems: HeroShowcaseItem[] = [];

export function HeroCarousel() {
  const router = useRouter();
  const carouselQuery = useHeroCarousel();
  const items = carouselQuery.data ?? emptyItems;
  const [activeIndex, setActiveIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const touchStartX = useRef<number | null>(null);

  useEffect(() => {
    const safeIndex = items.length ? activeIndex % items.length : 0;
    const nextItem = items[(safeIndex + 1) % items.length];
    if (nextItem?.image) {
      const image = new Image();
      image.src = nextItem.image;
    }
  }, [activeIndex, items]);

  useEffect(() => {
    if (isPaused || items.length < 2) return;
    const timer = window.setInterval(() => setActiveIndex((index) => (index + 1) % items.length), 3000);
    return () => window.clearInterval(timer);
  }, [isPaused, items.length]);

  const navigateToItem = (item: HeroShowcaseItem) => {
    if (item.type === "product" && item.productId) router.push(`/products/${item.productId}`);
    if (item.type === "category" && item.categoryId) router.push(`/category/${item.categoryId}`);
    if (item.type === "store" && item.storeId) router.push(`/stores/${item.storeId}`);
  };

  if (carouselQuery.isLoading) {
    return <div className="flex h-[300px] items-center justify-center rounded-2xl bg-zinc-900 text-emerald-400 sm:h-[380px] lg:h-[430px]"><LoaderCircle className="h-6 w-6 animate-spin" /></div>;
  }

  if (!items.length) {
    return <div className="flex h-[300px] items-center justify-center rounded-2xl bg-zinc-900 text-sm text-zinc-400 sm:h-[380px] lg:h-[430px]">Carousel unavailable</div>;
  }

  const safeIndex = activeIndex % items.length;
  const item = items[safeIndex];
  const previous = () => setActiveIndex((index) => (index - 1 + items.length) % items.length);
  const next = () => setActiveIndex((index) => (index + 1) % items.length);

  return (
    <div
      className="group relative overflow-hidden rounded-2xl bg-zinc-950"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onPointerDown={(event) => { touchStartX.current = event.clientX; }}
      onPointerUp={(event) => {
        if (touchStartX.current !== null && Math.abs(event.clientX - touchStartX.current) > 50) {
          if (event.clientX < touchStartX.current) next(); else previous();
        }
        touchStartX.current = null;
      }}
    >
      <button type="button" onClick={() => navigateToItem(item)} className="block h-[300px] w-full text-left sm:h-[380px] lg:h-[430px]">
        {item.image ? <img src={item.image} alt={item.name} className="h-full w-full object-cover transition duration-300 ease-out" fetchPriority="high" /> : <div className="h-full w-full bg-emerald-950" />}
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/15 to-transparent" />
        {item.type === "store" ? <div className="absolute right-5 top-5"><DeliveryBadge deliveryEnabled={item.deliveryEnabled === true} variant={item.badge ?? "normal"} /></div> : null}
        <div className="absolute inset-x-5 bottom-7 text-white sm:inset-x-8 sm:bottom-9">
          <span className={`inline-flex rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-[0.18em] ${badgeColors[item.type]}`}>{labels[item.type]}</span>
          <p className="mt-3 max-w-[85%] text-2xl font-semibold leading-tight sm:text-3xl">{item.name}</p>
          {item.type === "store" && typeof item.rating === "number" ? <span className="mt-2 flex items-center gap-1 text-sm text-amber-200"><Star className="h-4 w-4 fill-current" />{item.rating.toFixed(1)}</span> : null}
        </div>
      </button>
      {items.length > 1 ? <>
        <button type="button" aria-label="Previous carousel item" onClick={previous} className="absolute left-3 top-1/2 hidden h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-black/55 text-white transition hover:scale-105 hover:border hover:border-emerald-400 sm:flex"><ChevronLeft className="h-5 w-5" /></button>
        <button type="button" aria-label="Next carousel item" onClick={next} className="absolute right-3 top-1/2 hidden h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-black/55 text-white transition hover:scale-105 hover:border hover:border-emerald-400 sm:flex"><ChevronRight className="h-5 w-5" /></button>
        <div className="absolute bottom-3 left-1/2 flex -translate-x-1/2 gap-[10px]" aria-label="Carousel pagination">
          {items.slice(0, 5).map((carouselItem, index) => <button key={`${carouselItem.id}-${index}`} type="button" aria-label={`Show ${carouselItem.name}`} onClick={() => setActiveIndex(index)} className={`h-2 w-2 rounded-full transition-colors ${index === activeIndex ? "bg-emerald-400" : "bg-zinc-400/80"}`} />)}
        </div>
      </> : null}
    </div>
  );
}