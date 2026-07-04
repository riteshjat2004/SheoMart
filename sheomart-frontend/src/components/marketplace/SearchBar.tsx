"use client";

import { FormEvent, useEffect, useState } from "react";
import { Search } from "lucide-react";
import { cn } from "@/lib/utils";

interface SearchBarProps {
  className?: string;
  placeholder?: string;
  value?: string;
  onChange?: (value: string) => void;
  onSubmit?: () => void;
}

export function SearchBar({ className, placeholder = "Search essentials, pantry, snacks...", value, onChange, onSubmit }: SearchBarProps) {
  const [internalValue, setInternalValue] = useState(value ?? "");

  useEffect(() => {
    if (typeof value === "string") {
      setInternalValue(value);
    }
  }, [value]);

  const currentValue = typeof value === "string" ? value : internalValue;

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

  return (
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
    </form>
  );
}
