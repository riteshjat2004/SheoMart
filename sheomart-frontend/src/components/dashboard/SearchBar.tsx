"use client";

import { Search } from "lucide-react";

interface SearchBarProps {
  placeholder?: string;
  value?: string;
  onChange?: (value: string) => void;
}

export function SearchBar({ placeholder = "Search", value, onChange }: SearchBarProps) {
  return (
    <label className="flex items-center gap-2 rounded-xl border border-stone-200 bg-white/90 px-3 py-2 text-xs text-stone-500 transition-colors focus-within:border-emerald-500/50 focus-within:ring-1 focus-within:ring-emerald-500/20 dark:border-stone-800 dark:bg-stone-900 dark:text-stone-400 dark:focus-within:border-emerald-500/50">
      <Search className="h-3.5 w-3.5 text-stone-400 shrink-0" />
      <input
        type="search"
        value={value ?? ""}
        onChange={(event) => onChange?.(event.target.value)}
        placeholder={placeholder}
        className="w-full bg-transparent text-xs outline-none placeholder:text-stone-400 dark:placeholder:text-stone-500"
      />
    </label>
  );
}
