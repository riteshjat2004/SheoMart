"use client";
import { useTheme } from "@/hooks/use-theme";
import { Sun, Moon, Check, Sparkles, RotateCcw } from "lucide-react";

export function ThemeSelectionCard() {
  const {
    theme,
    setTheme,
    resetToDefault,
    platformDefaultTheme,
    hasCustomTheme,
    mounted,
  } = useTheme();

  if (!mounted) {
    return (
      <div className="rounded-[1.75rem] border border-stone-200 bg-white p-6 shadow-sm dark:border-stone-800 dark:bg-stone-900 animate-pulse">
        <div className="h-6 w-40 rounded-md bg-stone-200 dark:bg-stone-800 mb-2" />
        <div className="h-4 w-64 rounded-md bg-stone-100 dark:bg-stone-800" />
      </div>
    );
  }

  return (
    <div className="rounded-[1.75rem] border border-stone-200/90 bg-white p-6 shadow-xs dark:border-stone-800 dark:bg-stone-900 transition-colors">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400">
              <Sparkles className="h-4 w-4" />
            </span>
            <h3 className="text-base font-bold text-stone-900 dark:text-white">
              My Personal Display Theme
            </h3>
          </div>
          <p className="mt-1 text-xs text-stone-500 dark:text-stone-400">
            Choose your preferred theme for this device. Switches instantly without reloading.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {hasCustomTheme ? (
            <button
              type="button"
              onClick={resetToDefault}
              className="inline-flex items-center gap-1.5 rounded-xl border border-stone-200 bg-stone-50 px-3 py-1.5 text-xs font-semibold text-stone-600 transition hover:bg-stone-100 hover:text-stone-900 dark:border-stone-800 dark:bg-stone-800/60 dark:text-stone-300 dark:hover:bg-stone-800"
              title={`Reset to platform default theme (${platformDefaultTheme})`}
            >
              <RotateCcw className="h-3.5 w-3.5" />
              <span>Use Marketplace Default ({platformDefaultTheme})</span>
            </button>
          ) : (
            <span className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-500/10 px-2.5 py-1 text-[11px] font-semibold text-emerald-700 border border-emerald-500/20 dark:text-emerald-400">
              Following Platform Default ({platformDefaultTheme})
            </span>
          )}
        </div>
      </div>

      <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2">
        {/* Light Theme Option */}
        <button
          type="button"
          onClick={() => setTheme("light")}
          className={`relative flex flex-col items-start rounded-2xl border p-4 text-left transition-all duration-200 ${
            theme === "light"
              ? "border-emerald-600 bg-emerald-50/40 ring-2 ring-emerald-500/20 shadow-xs"
              : "border-stone-200 bg-stone-50/60 hover:border-stone-300 hover:bg-stone-100/60 dark:border-stone-800 dark:bg-stone-950/50 dark:hover:border-stone-700"
          }`}
        >
          <div className="flex w-full items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-amber-100 text-amber-600 shadow-2xs">
                <Sun className="h-4 w-4" />
              </span>
              <div>
                <p className="text-sm font-bold text-stone-900 dark:text-white">
                  Light Theme
                </p>
                <span className="text-[10px] font-semibold uppercase tracking-wider text-emerald-700 dark:text-emerald-400">
                  Fresh Market
                </span>
              </div>
            </div>

            {theme === "light" && (
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-600 text-white">
                <Check className="h-3 w-3 stroke-[3]" />
              </span>
            )}
          </div>

          <p className="mt-3 text-xs leading-relaxed text-stone-600 dark:text-stone-400">
            Warm, airy alabaster canvas with soft contrast. High readability for day shopping and local order management.
          </p>
        </button>

        {/* Dark Theme Option */}
        <button
          type="button"
          onClick={() => setTheme("dark")}
          className={`relative flex flex-col items-start rounded-2xl border p-4 text-left transition-all duration-200 ${
            theme === "dark"
              ? "border-emerald-500 bg-emerald-950/20 ring-2 ring-emerald-500/20 shadow-xs dark:bg-emerald-950/30"
              : "border-stone-200 bg-stone-50/60 hover:border-stone-300 hover:bg-stone-100/60 dark:border-stone-800 dark:bg-stone-950/50 dark:hover:border-stone-700"
          }`}
        >
          <div className="flex w-full items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-emerald-950 text-emerald-400 shadow-2xs">
                <Moon className="h-4 w-4" />
              </span>
              <div>
                <p className="text-sm font-bold text-stone-900 dark:text-white">
                  Dark Theme
                </p>
                <span className="text-[10px] font-semibold uppercase tracking-wider text-stone-500 dark:text-stone-400">
                  Night Market
                </span>
              </div>
            </div>

            {theme === "dark" && (
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-600 text-white">
                <Check className="h-3 w-3 stroke-[3]" />
              </span>
            )}
          </div>

          <p className="mt-3 text-xs leading-relaxed text-stone-600 dark:text-stone-400">
            Obsidian canvas with neon emerald highlights. Easy on the eyes for evening shopping and late-night operations.
          </p>
        </button>
      </div>
    </div>
  );
}
