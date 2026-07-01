"use client";

import { Search } from "lucide-react";
import { cn } from "@/lib/utils";

interface SearchBarProps {
  className?: string;
}

export function SearchBar({ className }: SearchBarProps) {
  return (
    <label className={cn("group flex items-center gap-3 rounded-full border border-stone-200 bg-white px-4 py-3 shadow-sm transition focus-within:border-emerald-500 focus-within:ring-2 focus-within:ring-emerald-500/20 dark:border-stone-700 dark:bg-stone-900", className)}>
      <Search className="h-4 w-4 text-stone-400 transition group-focus-within:text-emerald-600" />
      <input
        type="search"
        aria-label="Search products and stores"
        placeholder="Search essentials, pantry, snacks..."
        className="w-full bg-transparent text-sm text-stone-700 outline-none placeholder:text-stone-400 dark:text-stone-200"
      />
    </label>
  );
}
