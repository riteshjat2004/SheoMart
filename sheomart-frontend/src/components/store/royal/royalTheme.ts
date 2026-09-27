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
  hero: "border-[#D4AF37]/70 bg-gradient-to-br from-black via-zinc-950 to-stone-900 shadow-[0_24px_80px_-34px_rgba(212,175,55,0.55)]",
  cover: "border-[#D4AF37]/40 bg-black/90 shadow-[0_0_36px_rgba(212,175,55,0.24)]",
  overlay: "bg-gradient-to-r from-black/95 via-stone-950/75 to-black/55",
  logo: "border-[#E7C873] bg-stone-950 text-[#E7C873] shadow-[0_0_30px_rgba(212,175,55,0.45)] ring-2 ring-[#D4AF37]/40",
  badge: "border-[#D4AF37]/70 bg-gradient-to-r from-amber-500/20 via-yellow-400/20 to-amber-500/20 text-[#F8E7B0] shadow-[0_0_14px_rgba(212,175,55,0.3)]",
  accent: "text-[#E7C873]",
  stat: "border-[#D4AF37]/35 bg-black/60 text-[#F8E7B0] backdrop-blur-md hover:border-[#E7C873]/80 hover:bg-stone-900/80 transition-all duration-200",
  trust: "border-[#D4AF37]/35 bg-black/70 text-[#F8E7B0] backdrop-blur-sm",
  primaryButton: "bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500 text-stone-950 font-semibold hover:from-amber-300 hover:to-yellow-300 shadow-md shadow-amber-500/25 active:scale-[0.98] transition-all duration-200",
  secondaryButton: "border-[#D4AF37]/60 bg-black/60 text-[#F8E7B0] hover:bg-stone-900/90 hover:border-[#E7C873] hover:text-[#FFF] backdrop-blur-sm transition-all duration-200",
  panel: "border-[#D4AF37]/35 bg-gradient-to-br from-stone-950 via-black to-zinc-950 shadow-[0_18px_55px_-38px_rgba(212,175,55,0.7)] dark:border-[#D4AF37]/45 dark:from-stone-950 dark:via-black dark:to-zinc-950",
  panelMuted: "border-[#D4AF37]/35 bg-stone-950/90 dark:border-[#D4AF37]/45 dark:bg-black/80",
  panelText: "text-[#F8E7B0]",
  panelMutedText: "text-stone-300",
  icon: "text-[#D4AF37]",
  chip: "border-[#D4AF37]/60 bg-black text-[#F8E7B0] dark:border-[#D4AF37]/70 dark:bg-stone-950 dark:text-[#F8E7B0] hover:border-[#E7C873] transition-colors",
  motion: "animate-[royal-rise_500ms_ease-out_both] motion-reduce:animate-none",
  hover: "transition duration-300 hover:-translate-y-1 hover:border-[#D4AF37]/80 hover:shadow-[0_18px_45px_-20px_rgba(212,175,55,0.45)] motion-reduce:transition-none",
  focus: "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#E7C873] focus-visible:ring-offset-2 focus-visible:ring-offset-black",
  shimmer: "bg-[linear-gradient(110deg,transparent_20%,rgba(248,231,176,0.18)_45%,transparent_70%)] bg-[length:220%_100%] animate-[royal-shimmer_4s_linear_infinite] motion-reduce:animate-none",
  spotlight: "bg-[radial-gradient(circle_at_80%_15%,rgba(212,175,55,0.22),transparent_40%)]",
  dividerGradient: "bg-gradient-to-r from-transparent via-[#D4AF37]/70 to-transparent",
  hoverGlow: "hover:border-[#E7C873]/90 hover:shadow-[0_16px_40px_-20px_rgba(212,175,55,0.75)]",
  motionTokens: "animate-[royal-rise_520ms_ease-out_both] motion-reduce:animate-none",
  card: "rounded-[1.75rem] border border-[#D4AF37]/35 bg-gradient-to-b from-stone-950/95 via-black/95 to-zinc-950/95 shadow-[0_12px_40px_-20px_rgba(212,175,55,0.25)] hover:border-[#D4AF37]/75 hover:shadow-[0_20px_60px_-20px_rgba(212,175,55,0.4)] transition-all duration-300",
  goldGradient: "bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500",
  goldTextGradient: "bg-gradient-to-r from-amber-200 via-yellow-300 to-amber-400 bg-clip-text text-transparent",
};
