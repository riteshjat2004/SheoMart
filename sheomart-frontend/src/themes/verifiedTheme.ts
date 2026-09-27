export const verifiedTheme = {
  hero: "border-emerald-300/50 bg-gradient-to-br from-emerald-950 via-emerald-900 to-slate-950 shadow-[0_24px_70px_-34px_rgba(16,185,129,0.65)] dark:border-emerald-800/70",
  cover: "border-emerald-200/30 bg-emerald-950/80 shadow-[0_0_34px_rgba(16,185,129,0.22)]",
  overlay: "bg-gradient-to-r from-slate-950/95 via-emerald-950/65 to-slate-950/45",
  logo: "border-white bg-emerald-100 text-emerald-800 shadow-[0_0_28px_rgba(16,185,129,0.45)] ring-2 ring-emerald-300/50",
  badge: "border-emerald-300/80 bg-emerald-500/20 text-emerald-100 shadow-[0_0_12px_rgba(16,185,129,0.3)]",
  accent: "text-emerald-300 dark:text-emerald-300",
  stat: "border-white/15 bg-white/10 text-white backdrop-blur-md hover:border-emerald-300/60 hover:bg-white/15 transition-all duration-200",
  trust: "border-emerald-300/20 bg-emerald-950/45 text-emerald-50 backdrop-blur-sm",
  primaryButton: "bg-emerald-500 text-white font-semibold hover:bg-emerald-400 shadow-md shadow-emerald-500/25 active:scale-[0.98] transition-all duration-200",
  secondaryButton: "border-white/25 bg-white/10 text-white hover:bg-white/20 hover:border-white/40 backdrop-blur-sm transition-all duration-200",
  panel: "border-emerald-200/60 bg-gradient-to-br from-white via-emerald-50/60 to-white shadow-[0_12px_45px_-30px_rgba(16,185,129,0.4)] dark:border-emerald-900/70 dark:from-emerald-950/60 dark:via-slate-950/80 dark:to-slate-950",
  panelMuted: "border-emerald-200/60 bg-emerald-50/60 dark:border-emerald-900/60 dark:bg-emerald-950/40",
  panelText: "text-slate-900 dark:text-emerald-50",
  panelMutedText: "text-slate-600 dark:text-emerald-200/70",
  icon: "text-emerald-600 dark:text-emerald-400",
  chip: "border-emerald-300/70 bg-emerald-50 text-emerald-800 dark:border-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-100 hover:border-emerald-400 transition-colors",
  motion: "animate-[verified-rise_500ms_ease-out_both] motion-reduce:animate-none",
  hover: "transition duration-300 hover:-translate-y-0.5 hover:border-emerald-400/80 hover:shadow-[0_12px_35px_-20px_rgba(16,185,129,0.5)] motion-reduce:transition-none",
  focus: "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-slate-950",
  card: "rounded-[1.6rem] border border-emerald-200/80 bg-white shadow-sm hover:border-emerald-400 hover:shadow-[0_16px_45px_-20px_rgba(16,185,129,0.35)] dark:border-emerald-900/60 dark:bg-zinc-900 transition-all duration-300",
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
