"use client";

import { Search } from "lucide-react";

interface SearchBarProps {
  placeholder?: string;
  value?: string;
  onChange?: (value: string) => void;
}

export function SearchBar({ placeholder = "Search", value, onChange }: SearchBarProps) {
  return (
    <label className="flex items-center gap-2 rounded-full border border-stone-200 bg-white px-3 py-2 text-sm text-stone-500 shadow-sm dark:border-stone-800 dark:bg-stone-900 dark:text-stone-400">
      <Search className="h-4 w-4" />
      <input
        type="search"
        value={value ?? ""}
        onChange={(event) => onChange?.(event.target.value)}
        placeholder={placeholder}
        className="w-full bg-transparent outline-none placeholder:text-stone-400"
      />
    </label>
  );
}
