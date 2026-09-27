import type { StoreTheme } from "@/themes/verifiedTheme";

export const normalTheme: StoreTheme & {
  accentOrange: string;
  iconOrange: string;
  warmCreamBg: string;
  freshBadge: string;
  offerBadge: string;
} = {
  hero: "border-stone-200 bg-gradient-to-br from-stone-900 via-stone-850 to-emerald-950 text-white shadow-sm dark:border-stone-800",
  cover: "border-stone-200/60 bg-stone-100 dark:bg-stone-850",
  overlay: "bg-gradient-to-r from-stone-950/90 via-stone-900/60 to-stone-950/70",
  logo: "border-4 border-white bg-emerald-50 text-emerald-800 shadow-md ring-2 ring-emerald-200 dark:border-stone-900 dark:bg-emerald-950 dark:text-emerald-200 dark:ring-emerald-800/50",
  badge: "border-emerald-200 bg-emerald-50/90 text-emerald-800 dark:border-emerald-800/40 dark:bg-emerald-950/60 dark:text-emerald-300",
  accent: "text-emerald-600 dark:text-emerald-400",
  accentOrange: "text-orange-500 dark:text-orange-400",
  stat: "border-stone-200/80 bg-white/90 text-stone-800 shadow-sm backdrop-blur-sm dark:border-stone-800 dark:bg-stone-900/80 dark:text-stone-100 hover:border-emerald-300 transition-all duration-200",
  trust: "border-stone-200/70 bg-stone-50/80 text-stone-700 dark:border-stone-800 dark:bg-stone-900/60 dark:text-stone-200",
  primaryButton: "bg-emerald-600 text-white font-semibold hover:bg-emerald-500 shadow-sm hover:shadow active:scale-[0.98] transition-all duration-200",
  secondaryButton: "border-stone-300 bg-white text-stone-700 hover:bg-stone-50 hover:border-stone-400 dark:border-stone-700 dark:bg-stone-900 dark:text-stone-200 dark:hover:bg-stone-800 transition-all duration-200",
  panel: "border-stone-200 bg-white shadow-sm dark:border-stone-800 dark:bg-stone-900",
  panelMuted: "border-stone-200/80 bg-stone-50/70 dark:border-stone-800 dark:bg-stone-950/60",
  panelText: "text-stone-900 dark:text-stone-50",
  panelMutedText: "text-stone-600 dark:text-stone-400",
  icon: "text-emerald-600 dark:text-emerald-400",
  iconOrange: "text-orange-500 dark:text-orange-400",
  chip: "border-stone-200 bg-white text-stone-700 hover:border-emerald-300 hover:bg-emerald-50/50 dark:border-stone-800 dark:bg-stone-950 dark:text-stone-300 transition-colors",
  motion: "animate-[store-fade-in_400ms_ease-out_both] motion-reduce:animate-none",
  hover: "transition duration-200 hover:-translate-y-0.5 hover:shadow-md motion-reduce:transition-none",
  focus: "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-stone-950",
  card: "rounded-[1.5rem] border border-stone-200 bg-white shadow-sm hover:border-emerald-300 hover:shadow-md dark:border-stone-800 dark:bg-stone-900 transition-all duration-200",
  warmCreamBg: "bg-[#FDFBF7] dark:bg-stone-900",
  freshBadge: "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-300",
  offerBadge: "border-orange-200 bg-orange-50 text-orange-700 dark:border-orange-800 dark:bg-orange-950/50 dark:text-orange-300",
};
