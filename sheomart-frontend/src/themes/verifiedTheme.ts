export const verifiedTheme = {
  hero: "border-emerald-300/80 bg-gradient-to-br from-emerald-50/90 via-teal-50/60 to-white shadow-[0_24px_70px_-34px_rgba(16,185,129,0.2)] dark:border-emerald-800/70 dark:bg-gradient-to-br dark:from-emerald-950 dark:via-emerald-900 dark:to-slate-950 dark:shadow-[0_24px_70px_-34px_rgba(16,185,129,0.65)]",
  cover: "border-emerald-200/60 bg-emerald-100/40 shadow-[0_0_34px_rgba(16,185,129,0.1)] dark:border-emerald-200/30 dark:bg-emerald-950/80 dark:shadow-[0_0_34px_rgba(16,185,129,0.22)]",
  overlay: "bg-gradient-to-r from-white/95 via-white/80 to-white/40 dark:from-slate-950/95 dark:via-emerald-950/65 dark:to-slate-950/45",
  logo: "border-emerald-400 bg-emerald-50 text-emerald-800 shadow-[0_0_24px_rgba(16,185,129,0.2)] ring-2 ring-emerald-300/50 dark:border-white dark:bg-emerald-100 dark:text-emerald-800 dark:shadow-[0_0_28px_rgba(16,185,129,0.45)] dark:ring-2 dark:ring-emerald-300/50",
  badge: "border-emerald-300/80 bg-emerald-100/90 text-emerald-800 shadow-xs dark:border-emerald-300/80 dark:bg-emerald-500/20 dark:text-emerald-100 dark:shadow-[0_0_12px_rgba(16,185,129,0.3)]",
  accent: "text-emerald-600 dark:text-emerald-300",
  stat: "border-emerald-200 bg-white/90 text-stone-900 shadow-xs backdrop-blur-md hover:border-emerald-400 hover:bg-emerald-50/60 transition-all duration-200 dark:border-white/15 dark:bg-white/10 dark:text-white dark:hover:border-emerald-300/60 dark:hover:bg-white/15",
  trust: "border-emerald-200 bg-emerald-50/80 text-emerald-900 backdrop-blur-sm dark:border-emerald-300/20 dark:bg-emerald-950/45 dark:text-emerald-50",
  primaryButton: "bg-emerald-600 text-white font-semibold hover:bg-emerald-700 shadow-md shadow-emerald-600/25 active:scale-[0.98] transition-all duration-200 dark:bg-emerald-500 dark:hover:bg-emerald-400",
  secondaryButton: "border-emerald-300/80 bg-white/90 text-emerald-800 hover:bg-emerald-50 hover:border-emerald-400 backdrop-blur-sm transition-all duration-200 dark:border-white/25 dark:bg-white/10 dark:text-white dark:hover:bg-white/20 dark:hover:border-white/40",
  panel: "border-emerald-200/80 bg-gradient-to-br from-white via-emerald-50/40 to-white shadow-[0_12px_45px_-30px_rgba(16,185,129,0.2)] dark:border-emerald-900/70 dark:from-emerald-950/60 dark:via-slate-950/80 dark:to-slate-950",
  panelMuted: "border-emerald-200/70 bg-emerald-50/60 dark:border-emerald-900/60 dark:bg-emerald-950/40",
  panelText: "text-stone-900 dark:text-emerald-50",
  panelMutedText: "text-stone-600 dark:text-emerald-200/70",
  icon: "text-emerald-600 dark:text-emerald-400",
  chip: "border-emerald-300/70 bg-emerald-50/80 text-emerald-800 hover:border-emerald-400 dark:border-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-100 transition-colors",
  motion: "animate-[verified-rise_500ms_ease-out_both] motion-reduce:animate-none",
  hover: "transition duration-300 hover:-translate-y-0.5 hover:border-emerald-400 hover:shadow-[0_12px_35px_-20px_rgba(16,185,129,0.25)] motion-reduce:transition-none dark:hover:border-emerald-400/80 dark:hover:shadow-[0_12px_35px_-20px_rgba(16,185,129,0.5)]",
  focus: "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-slate-950",
  card: "rounded-[1.6rem] border border-emerald-200/80 bg-white shadow-sm hover:border-emerald-400 hover:shadow-[0_16px_45px_-20px_rgba(16,185,129,0.25)] dark:border-emerald-900/60 dark:bg-zinc-900 transition-all duration-300",
  emeraldGradient: "bg-gradient-to-r from-emerald-600 to-teal-600",
} as const;

export type StoreTheme = {
  hero: string;
  cover: string;
  overlay: string;
  logo: string;
  badge: string;
  accent: string;
  stat: string;
  trust: string;
  primaryButton: string;
  secondaryButton: string;
  panel: string;
  panelMuted: string;
  panelText: string;
  panelMutedText: string;
  icon: string;
  chip: string;
  motion: string;
  hover: string;
  focus: string;
  card: string;
  emeraldGradient?: string;
};
