"use client";

import { Search, X } from "lucide-react";
import { forwardRef, useEffect, useRef, useState } from "react";
import type { ProductItem } from "@/types/marketplace";
import type { StoreTheme } from "@/themes/verifiedTheme";
import { StoreSearchSuggestions } from "./StoreSearchSuggestions";

type StoreSearchBarProps = { value: string; onChange: (value: string) => void; onClear: () => void; results: ProductItem[]; onSelect: (product: ProductItem) => void; theme: StoreTheme; mode?: "hero" | "sticky"; surface?: "hero" | "sticky"; activeSearchSurface?: "hero" | "sticky"; scrollToStickySearch?: () => void; label?: string };

export const StoreSearchBar = forwardRef<HTMLInputElement, StoreSearchBarProps>(function StoreSearchBar({ value, onChange, onClear, results, onSelect, theme, mode = "sticky", surface = mode, activeSearchSurface = surface, scrollToStickySearch, label = "Search products in this store..." }, forwardedRef) {
  const isActive = surface === activeSearchSurface;
  const isHeroShortcut = mode === "hero";
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  useEffect(() => { const timer = window.setTimeout(() => setOpen(!isHeroShortcut && isActive && Boolean(value.trim()) && results.length > 0), 175); return () => window.clearTimeout(timer); }, [isActive, isHeroShortcut, value, results.length]);
  const choose = (product: ProductItem) => { onSelect(product); setOpen(false); };
  const activateStickySearch = () => { if (isHeroShortcut) scrollToStickySearch?.(); };
  return <div className={`relative w-full ${surface === "sticky" ? "z-[120]" : "z-[100]"}`} onClick={activateStickySearch} onFocus={() => { if (!isHeroShortcut && isActive) setOpen(Boolean(value.trim()) && results.length > 0); }} onBlur={(event) => { if (!event.currentTarget.contains(event.relatedTarget)) setOpen(false); }}>
    <div className={`flex min-h-11 items-center gap-2 rounded-full border px-4 ${theme.panelMuted} ${theme.focus}`}>
      <Search className={`h-4 w-4 shrink-0 ${theme.icon}`} />
      <input ref={isHeroShortcut ? inputRef : forwardedRef} readOnly={isHeroShortcut} tabIndex={isHeroShortcut ? -1 : undefined} disabled={!isActive} value={value} onChange={(event) => { if (isHeroShortcut || !isActive) return; onChange(event.target.value); setActiveIndex(0); }} onKeyDown={(event) => { if (isHeroShortcut) { event.preventDefault(); activateStickySearch(); return; } if (!isActive) return; if (event.key === "Escape") { setOpen(false); event.currentTarget.blur(); } if (event.key === "ArrowDown") { event.preventDefault(); setActiveIndex((index) => Math.min(index + 1, results.length - 1)); } if (event.key === "ArrowUp") { event.preventDefault(); setActiveIndex((index) => Math.max(index - 1, 0)); } if (event.key === "Enter" && results[activeIndex]) { event.preventDefault(); choose(results[activeIndex]); } }} placeholder={label} aria-label={label} aria-expanded={!isHeroShortcut && isActive && open} aria-controls={!isHeroShortcut && isActive ? "store-product-suggestions" : undefined} className={`min-w-0 flex-1 bg-transparent py-2 text-sm outline-none ${theme.panelText}`} />
      {value && isActive ? <button type="button" onClick={() => { if (isHeroShortcut) { activateStickySearch(); return; } onClear(); setOpen(false); }} aria-label="Clear store product search" className={`${theme.focus} ${theme.icon}`}><X className="h-4 w-4" /></button> : null}
    </div>
    {!isHeroShortcut && isActive && open ? <StoreSearchSuggestions products={results} onSelect={choose} theme={theme} /> : null}
  </div>;
});
