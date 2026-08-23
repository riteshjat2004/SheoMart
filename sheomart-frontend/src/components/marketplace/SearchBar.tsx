"use client";

import { FormEvent, useEffect, useRef, useState } from "react";
import { LoaderCircle, Search } from "lucide-react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { useSearch } from "@/hooks/use-search";

interface SearchBarProps {
  className?: string;
  placeholder?: string;
  value?: string;
  onChange?: (value: string) => void;
  onSubmit?: () => void;
  enableSuggestions?: boolean;
}

export function SearchBar({ className, placeholder = "Search essentials, pantry, snacks...", value, onChange, onSubmit, enableSuggestions = false }: SearchBarProps) {
  const router = useRouter();
  const containerRef = useRef<HTMLDivElement>(null);
  const [internalValue, setInternalValue] = useState(value ?? "");

  useEffect(() => {
    if (typeof value === "string") {
      setInternalValue(value);
    }
  }, [value]);

  const currentValue = typeof value === "string" ? value : internalValue;
  const searchQuery = useSearch(enableSuggestions ? currentValue : "");
  const results = searchQuery.data;
  const showSuggestions = enableSuggestions && currentValue.trim().length >= 2;

  useEffect(() => {
    const closeSuggestions = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        onChange?.(currentValue);
      }
    };
    document.addEventListener("mousedown", closeSuggestions);
    return () => document.removeEventListener("mousedown", closeSuggestions);
  }, [currentValue, onChange]);

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const nextValue = event.target.value;
    if (typeof value !== "string") {
      setInternalValue(nextValue);
    }
    onChange?.(nextValue);
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    onSubmit?.();
  };

  const goTo = (path: string) => router.push(path);

  return (
    <div ref={containerRef} className="relative">
      <form onSubmit={handleSubmit} role="search" className={cn("group flex items-center gap-3 rounded-full border border-stone-200 bg-white px-4 py-3 shadow-sm transition focus-within:border-emerald-500 focus-within:ring-2 focus-within:ring-emerald-500/20 dark:border-stone-700 dark:bg-stone-900", className)}>
      <Search className="h-4 w-4 text-stone-400 transition group-focus-within:text-emerald-600" />
      <input
        type="search"
        aria-label={placeholder}
        placeholder={placeholder}
        value={currentValue}
        onChange={handleChange}
        className="w-full bg-transparent text-sm text-stone-700 outline-none placeholder:text-stone-400 dark:text-stone-200"
      />
      {showSuggestions && searchQuery.isFetching ? <LoaderCircle className="h-4 w-4 animate-spin text-emerald-600" /> : null}
      <button type="submit" aria-label="Search" className="rounded-full bg-emerald-600 px-3 py-2 text-sm font-medium text-white transition hover:bg-emerald-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/30">
        Search
      </button>
      </form>
      {showSuggestions && !searchQuery.isLoading && (
        <div className="absolute inset-x-0 top-full z-30 mt-2 overflow-hidden rounded-2xl border border-stone-200 bg-white p-2 shadow-xl dark:border-stone-700 dark:bg-stone-900">
          {results && results.products.length > 0 ? <p className="px-2 pb-1 pt-2 text-[10px] font-semibold uppercase tracking-[0.18em] text-stone-400">Products</p> : null}
          {results && results.products.slice(0, 5).map((product) => <button key={product.productId} type="button" onClick={() => goTo(`/products/${product.productId}`)} className="flex w-full items-center gap-3 rounded-xl p-2 text-left hover:bg-stone-50 dark:hover:bg-stone-800"><img src={product.thumbnail || "/placeholder.png"} alt="" className="h-10 w-10 rounded-lg object-cover" /><span className="text-sm font-medium text-stone-800 dark:text-stone-100">{product.name}</span></button>)}
          {results && results.stores.length > 0 ? <p className="px-2 pb-1 pt-2 text-[10px] font-semibold uppercase tracking-[0.18em] text-stone-400">Stores</p> : null}
          {results && results.stores.slice(0, 2).map((store) => <button key={store.storeId} type="button" onClick={() => goTo(`/stores/${store.storeId}`)} className="flex w-full items-center gap-3 rounded-xl p-2 text-left hover:bg-stone-50 dark:hover:bg-stone-800"><div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-100 text-sm font-semibold text-emerald-700">{store.storeName.charAt(0)}</div><span className="text-sm font-medium text-stone-800 dark:text-stone-100">{store.storeName}</span></button>)}
          {results && results.categories.length > 0 ? <p className="px-2 pb-1 pt-2 text-[10px] font-semibold uppercase tracking-[0.18em] text-stone-400">Categories</p> : null}
          {results && results.categories.slice(0, 1).map((category) => <button key={category.categoryId} type="button" onClick={() => goTo(`/category/${category.categoryId}`)} className="flex w-full items-center gap-3 rounded-xl p-2 text-left hover:bg-stone-50 dark:hover:bg-stone-800"><img src={category.image || "/placeholder.png"} alt="" className="h-10 w-10 rounded-lg object-cover" /><span className="text-sm font-medium text-stone-800 dark:text-stone-100">{category.name}</span></button>)}
          {results && !results.products.length && !results.stores.length && !results.categories.length ? <p className="p-3 text-sm text-stone-500">No products or stores found.</p> : null}
        </div>
      )}
    </div>
  );
}
