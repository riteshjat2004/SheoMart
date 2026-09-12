"use client";

import { type FormEvent, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { LoaderCircle, Search, Truck } from "lucide-react";
import { useSearch } from "@/hooks/use-search";
import type { SearchCategorySuggestion, SearchProductSuggestion, SearchStoreSuggestion } from "@/services/search";

interface NavbarSearchProps {
  className?: string;
}

type Result =
  | { type: "Product"; item: SearchProductSuggestion }
  | { type: "Store"; item: SearchStoreSuggestion }
  | { type: "Category"; item: SearchCategorySuggestion };

const badgeColors = {
  Product: "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/70 dark:text-emerald-300",
  Store: "bg-cyan-100 text-cyan-700 dark:bg-cyan-950/70 dark:text-cyan-300",
  Category: "bg-green-100 text-green-700 dark:bg-green-950/70 dark:text-green-300",
};

export function NavbarSearch({ className = "" }: NavbarSearchProps) {
  const router = useRouter();
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const [query, setQuery] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const searchQuery = useSearch(query);
  const normalizedQuery = query.trim();
  const results: Result[] = [
    ...(searchQuery.data?.products.slice(0, 5).map((item) => ({ type: "Product" as const, item })) ?? []),
    ...(searchQuery.data?.stores.slice(0, 2).map((item) => ({ type: "Store" as const, item })) ?? []),
    ...(searchQuery.data?.categories.slice(0, 1).map((item) => ({ type: "Category" as const, item })) ?? []),
  ];

  useEffect(() => {
    const closeOnOutsideClick = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) setIsOpen(false);
    };
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsOpen(false);
        inputRef.current?.blur();
      }
    };
    document.addEventListener("mousedown", closeOnOutsideClick);
    document.addEventListener("keydown", closeOnEscape);
    return () => {
      document.removeEventListener("mousedown", closeOnOutsideClick);
      document.removeEventListener("keydown", closeOnEscape);
    };
  }, []);

  const submitSearch = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (normalizedQuery.length >= 2) {
      setIsOpen(false);
      router.push(`/explore?query=${encodeURIComponent(normalizedQuery)}`);
    }
  };

  const navigateToResult = (result: Result) => {
    setIsOpen(false);
    if (result.type === "Product") router.push(`/products/${result.item.productId}`);
    if (result.type === "Store") router.push(`/stores/${result.item.storeId}`);
    if (result.type === "Category") router.push(`/category/${result.item.categoryId}`);
  };

  const getResultImage = (result: Result) => {
    if (result.type === "Product") return result.item.thumbnail;
    if (result.type === "Store") return result.item.logo;
    return result.item.image;
  };

  const getResultName = (result: Result) => result.type === "Store" ? result.item.storeName : result.item.name;

  return (
    <div ref={containerRef} className={`relative w-full ${className}`}>
      <form onSubmit={submitSearch} role="search" className="group flex h-10 items-center gap-2 rounded-full border border-stone-200 bg-white px-3 shadow-sm transition focus-within:border-emerald-500 focus-within:ring-2 focus-within:ring-emerald-500/20 dark:border-stone-700 dark:bg-stone-900">
        <Search className="h-4 w-4 shrink-0 text-stone-400 transition group-focus-within:text-emerald-600" />
        <input ref={inputRef} type="search" value={query} onChange={(event) => { setQuery(event.target.value); setIsOpen(true); }} onFocus={() => setIsOpen(true)} placeholder="Search products, stores, categories..." aria-label="Search products, stores, categories" className="min-w-0 flex-1 bg-transparent text-sm text-stone-700 outline-none placeholder:text-stone-400 dark:text-stone-200" />
        {isOpen && normalizedQuery.length >= 2 && searchQuery.isFetching ? <LoaderCircle className="h-4 w-4 shrink-0 animate-spin text-emerald-600" /> : null}
      </form>
      {isOpen && normalizedQuery.length >= 2 && !searchQuery.isLoading ? (
        <div className="absolute inset-x-0 top-full z-50 mt-2 max-h-[min(26rem,calc(100vh-6rem))] overflow-y-auto rounded-2xl border border-stone-200 bg-white p-2 shadow-xl dark:border-stone-700 dark:bg-stone-900">
          {results.length ? results.map((result) => {
            const image = getResultImage(result);
            return <button key={`${result.type}-${result.type === "Product" ? result.item.productId : result.type === "Store" ? result.item.storeId : result.item.categoryId}`} type="button" onClick={() => navigateToResult(result)} className="flex w-full items-center gap-3 rounded-xl p-2 text-left transition hover:bg-stone-50 dark:hover:bg-stone-800">
              {image ? <img src={image} alt="" className="h-9 w-9 shrink-0 rounded-lg object-cover" /> : <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-emerald-100 text-sm font-semibold text-emerald-700 dark:bg-emerald-950/70 dark:text-emerald-300">{getResultName(result).charAt(0)}</div>}
              <span className="min-w-0 flex-1 truncate text-sm font-medium text-stone-800 dark:text-stone-100">{getResultName(result)}</span>
              {result.type === "Store" && result.item.deliveryEnabled === true ? <span className="inline-flex shrink-0 items-center gap-1 text-[10px] font-semibold text-emerald-600 dark:text-emerald-400"><Truck className="h-3 w-3" />Delivery</span> : null}
              <span className={`shrink-0 rounded-full px-2 py-1 text-[10px] font-semibold uppercase tracking-wide ${badgeColors[result.type]}`}>{result.type}</span>
            </button>;
          }) : <p className="p-3 text-sm text-stone-500">No results found.</p>}
        </div>
      ) : null}
    </div>
  );
}