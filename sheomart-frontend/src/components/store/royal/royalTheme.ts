import type { StoreTheme } from "@/themes/verifiedTheme";

type RoyalTheme = StoreTheme & {
  shimmer: string;
  spotlight: string;
  dividerGradient: string;
  hoverGlow: string;
  motionTokens: string;
  card: string;
  goldGradient: string;
  goldTextGradient: string;
};

export const royalTheme: RoyalTheme = {
  hero: "border-amber-300/80 bg-gradient-to-br from-[#FFFDF7] via-[#FFFBF0] to-[#FFF8E7] shadow-[0_24px_80px_-34px_rgba(217,119,6,0.18)] dark:border-[#D4AF37]/70 dark:bg-gradient-to-br dark:from-black dark:via-zinc-950 dark:to-stone-900 dark:shadow-[0_24px_80px_-34px_rgba(212,175,55,0.55)]",
  cover: "border-amber-300/50 bg-amber-50/90 shadow-[0_0_36px_rgba(217,119,6,0.12)] dark:border-[#D4AF37]/40 dark:bg-black/90 dark:shadow-[0_0_36px_rgba(212,175,55,0.24)]",
  overlay: "bg-gradient-to-r from-[#FFFDF7]/95 via-[#FFFDF7]/80 to-[#FFFDF7]/40 dark:from-black/95 dark:via-stone-950/75 dark:to-black/55",
  logo: "border-amber-400 bg-amber-50 text-amber-900 shadow-[0_0_24px_rgba(217,119,6,0.2)] ring-2 ring-amber-300/60 dark:border-[#E7C873] dark:bg-stone-950 dark:text-[#E7C873] dark:shadow-[0_0_30px_rgba(212,175,55,0.45)] dark:ring-2 dark:ring-[#D4AF37]/40",
  badge: "border-amber-300/80 bg-gradient-to-r from-amber-500/15 via-yellow-400/25 to-amber-500/15 text-amber-900 shadow-xs dark:border-[#D4AF37]/70 dark:from-amber-500/20 dark:via-yellow-400/20 dark:to-amber-500/20 dark:text-[#F8E7B0] dark:shadow-[0_0_14px_rgba(212,175,55,0.3)]",
  accent: "text-amber-700 dark:text-[#E7C873]",
  stat: "border-amber-200/90 bg-white/90 text-amber-950 backdrop-blur-md hover:border-amber-400 hover:bg-amber-50/80 shadow-xs transition-all duration-200 dark:border-[#D4AF37]/35 dark:bg-black/60 dark:text-[#F8E7B0] dark:hover:border-[#E7C873]/80 dark:hover:bg-stone-900/80",
  trust: "border-amber-200/90 bg-amber-50/80 text-amber-950 backdrop-blur-sm dark:border-[#D4AF37]/35 dark:bg-black/70 dark:text-[#F8E7B0]",
  primaryButton: "bg-gradient-to-r from-amber-500 via-amber-400 to-yellow-500 text-stone-950 font-bold hover:from-amber-400 hover:to-yellow-400 shadow-md shadow-amber-500/25 active:scale-[0.98] transition-all duration-200",
  secondaryButton: "border-amber-300/90 bg-white/90 text-amber-950 hover:bg-amber-50 hover:border-amber-400 backdrop-blur-sm transition-all duration-200 dark:border-[#D4AF37]/60 dark:bg-black/60 dark:text-[#F8E7B0] dark:hover:bg-stone-900/90 dark:hover:border-[#E7C873] dark:hover:text-[#FFF]",
  panel: "border-amber-200/80 bg-gradient-to-br from-[#FFFDF7] via-amber-50/50 to-white shadow-[0_18px_55px_-38px_rgba(217,119,6,0.2)] dark:border-[#D4AF37]/45 dark:bg-gradient-to-br dark:from-stone-950 dark:via-black dark:to-zinc-950 dark:shadow-[0_18px_55px_-38px_rgba(212,175,55,0.7)]",
  panelMuted: "border-amber-200/80 bg-amber-50/60 dark:border-[#D4AF37]/45 dark:bg-stone-950/90",
  panelText: "text-amber-950 dark:text-[#F8E7B0]",
  panelMutedText: "text-stone-600 dark:text-stone-300",
  icon: "text-amber-600 dark:text-[#D4AF37]",
  chip: "border-amber-300/80 bg-amber-50 text-amber-900 hover:border-amber-400 dark:border-[#D4AF37]/70 dark:bg-stone-950 dark:text-[#F8E7B0] dark:hover:border-[#E7C873] transition-colors",
  motion: "animate-[royal-rise_500ms_ease-out_both] motion-reduce:animate-none",
  hover: "transition duration-300 hover:-translate-y-1 hover:border-amber-400 hover:shadow-[0_18px_45px_-20px_rgba(217,119,6,0.25)] dark:hover:border-[#D4AF37]/80 dark:hover:shadow-[0_18px_45px_-20px_rgba(212,175,55,0.45)] motion-reduce:transition-none",
  focus: "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:ring-offset-2 focus-visible:ring-offset-white dark:focus-visible:ring-[#E7C873] dark:focus-visible:ring-offset-black",
  shimmer: "bg-[linear-gradient(110deg,transparent_20%,rgba(245,158,11,0.15)_45%,transparent_70%)] dark:bg-[linear-gradient(110deg,transparent_20%,rgba(248,231,176,0.18)_45%,transparent_70%)] bg-[length:220%_100%] animate-[royal-shimmer_4s_linear_infinite] motion-reduce:animate-none",
  spotlight: "bg-[radial-gradient(circle_at_80%_15%,rgba(245,158,11,0.15),transparent_40%)] dark:bg-[radial-gradient(circle_at_80%_15%,rgba(212,175,55,0.22),transparent_40%)]",
  dividerGradient: "bg-gradient-to-r from-transparent via-amber-300/80 to-transparent dark:via-[#D4AF37]/70",
  hoverGlow: "hover:border-amber-400 hover:shadow-[0_16px_40px_-20px_rgba(217,119,6,0.35)] dark:hover:border-[#E7C873]/90 dark:hover:shadow-[0_16px_40px_-20px_rgba(212,175,55,0.75)]",
  motionTokens: "animate-[royal-rise_520ms_ease-out_both] motion-reduce:animate-none",
  card: "rounded-[1.75rem] border border-amber-200/90 bg-gradient-to-b from-[#FFFDF7] via-[#FFFBF0] to-[#FFF8E7] text-stone-900 shadow-[0_12px_40px_-20px_rgba(217,119,6,0.15)] hover:border-amber-400 hover:shadow-[0_20px_60px_-20px_rgba(217,119,6,0.25)] dark:border-[#D4AF37]/35 dark:from-stone-950/95 dark:via-black/95 dark:to-zinc-950/95 dark:text-stone-100 dark:shadow-[0_12px_40px_-20px_rgba(212,175,55,0.25)] dark:hover:border-[#D4AF37]/75 dark:hover:shadow-[0_20px_60px_-20px_rgba(212,175,55,0.4)] transition-all duration-300",
  goldGradient: "bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-500",
  goldTextGradient: "bg-gradient-to-r from-amber-600 via-amber-700 to-yellow-600 dark:from-amber-200 dark:via-yellow-300 dark:to-amber-400 bg-clip-text text-transparent",
};
