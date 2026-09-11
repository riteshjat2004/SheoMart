"use client";

import { Search } from "lucide-react";
import { verifiedTheme } from "@/themes/verifiedTheme";

const suggestions = ["Organic", "Handmade", "Electronics", "Fashion", "Grocery", "Local Specials"];

export function VerifiedSearchSuggestions({ onSelect }: { onSelect: (value: string) => void }) {
  return <section className={`rounded-2xl border p-4 ${verifiedTheme.panelMuted}`} aria-labelledby="verified-search-suggestions-heading"><div className="flex items-center gap-2"><Search className={`h-4 w-4 ${verifiedTheme.icon}`} /><h2 id="verified-search-suggestions-heading" className={`text-sm font-semibold ${verifiedTheme.panelText}`}>Browse by interest</h2></div><div className="mt-3 flex gap-2 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">{suggestions.map((suggestion) => <button key={suggestion} type="button" onClick={() => onSelect(suggestion)} className={`shrink-0 rounded-full border px-3 py-1.5 text-xs font-medium transition hover:bg-emerald-100 dark:hover:bg-emerald-900/60 ${verifiedTheme.chip}`}>{suggestion}</button>)}</div></section>;
}
