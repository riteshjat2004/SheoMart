"use client";

import { useTheme } from "@/hooks/use-theme";
import { Sun, Moon } from "lucide-react";

interface ThemeToggleProps {
  className?: string;
  showLabel?: boolean;
}

export function ThemeToggle({ className = "", showLabel = false }: ThemeToggleProps) {
  const { theme, toggleTheme, mounted } = useTheme();

  if (!mounted) {
    return (
      <div
        className={`h-9 w-9 rounded-full border border-stone-200 bg-stone-100 dark:border-stone-800 dark:bg-stone-900 ${className}`}
        aria-hidden="true"
      />
    );
  }

  const isDark = theme === "dark";

  return (
    <button
      type="button"
      onClick={toggleTheme}
      className={`group relative inline-flex items-center gap-2 rounded-full border border-stone-200 bg-stone-50/80 p-2 text-stone-700 transition hover:border-emerald-500 hover:bg-emerald-50/50 hover:text-emerald-700 focus:outline-none dark:border-stone-800 dark:bg-stone-900/80 dark:text-stone-300 dark:hover:border-emerald-500/60 dark:hover:bg-emerald-950/40 dark:hover:text-emerald-300 ${className}`}
      aria-label={isDark ? "Switch to light theme" : "Switch to dark theme"}
      title={isDark ? "Switch to lightweight humanized theme" : "Switch to dark theme"}
    >
      <div className="relative flex h-5 w-5 items-center justify-center">
        <Sun
          className={`h-4 w-4 transition-all duration-300 ${
            isDark
              ? "rotate-90 scale-0 opacity-0"
              : "rotate-0 scale-100 opacity-100 text-amber-500"
          }`}
        />
        <Moon
          className={`absolute h-4 w-4 transition-all duration-300 ${
            isDark
              ? "rotate-0 scale-100 opacity-100 text-emerald-400"
              : "-rotate-90 scale-0 opacity-0"
          }`}
        />
      </div>
      {showLabel && (
        <span className="text-xs font-medium pr-1">
          {isDark ? "Dark Theme" : "Light Theme"}
        </span>
      )}
    </button>
  );
}
