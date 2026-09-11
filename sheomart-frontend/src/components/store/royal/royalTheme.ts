import type { StoreTheme } from "@/themes/verifiedTheme";

type RoyalTheme = StoreTheme & {
  shimmer: string;
  spotlight: string;
  dividerGradient: string;
  hoverGlow: string;
  motionTokens: string;
};

export const royalTheme: RoyalTheme = {
  hero: "border-[#D4AF37]/70 bg-gradient-to-br from-black via-zinc-950 to-stone-900 shadow-[0_24px_80px_-34px_rgba(212,175,55,0.55)]",
  cover: "border-[#D4AF37]/40 bg-black/90 shadow-[0_0_36px_rgba(212,175,55,0.24)]",
  overlay: "bg-gradient-to-r from-black/95 via-stone-950/75 to-black/55",
  logo: "border-[#E7C873] bg-stone-950 text-[#E7C873] shadow-[0_0_30px_rgba(212,175,55,0.45)]",
  badge: "border-[#D4AF37] bg-black/80 text-[#F8E7B0]",
  accent: "text-[#E7C873]",
  stat: "border-[#D4AF37]/35 bg-black/55 text-[#F8E7B0] backdrop-blur-md hover:border-[#E7C873]/80 hover:bg-stone-900",
  trust: "border-[#D4AF37]/35 bg-black/70 text-[#F8E7B0]",
  primaryButton: "bg-[#D4AF37] text-black hover:bg-[#E7C873]",
  secondaryButton: "border-[#D4AF37]/60 bg-black/60 text-[#F8E7B0] hover:bg-stone-900 hover:text-[#F8E7B0]",
  panel: "border-[#D4AF37]/35 bg-gradient-to-br from-stone-950 via-black to-zinc-950 shadow-[0_18px_55px_-38px_rgba(212,175,55,0.7)] dark:border-[#D4AF37]/45 dark:from-stone-950 dark:via-black dark:to-zinc-950",
  panelMuted: "border-[#D4AF37]/35 bg-stone-950/90 dark:border-[#D4AF37]/45 dark:bg-black/80",
  panelText: "text-[#F8E7B0]",
  panelMutedText: "text-stone-300",
  icon: "text-[#D4AF37]",
  chip: "border-[#D4AF37]/60 bg-black text-[#F8E7B0] dark:border-[#D4AF37]/70 dark:bg-stone-950 dark:text-[#F8E7B0]",
  motion: "animate-[verified-rise_500ms_ease-out_both] motion-reduce:animate-none",
  hover: "transition duration-200 hover:-translate-y-0.5 hover:scale-[1.01] hover:shadow-[0_14px_35px_-24px_rgba(212,175,55,0.75)] active:scale-[0.99] motion-reduce:transition-none",
  focus: "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#E7C873] focus-visible:ring-offset-2 focus-visible:ring-offset-black",
  shimmer: "bg-[linear-gradient(110deg,transparent_20%,rgba(248,231,176,0.16)_45%,transparent_70%)] bg-[length:220%_100%] motion-reduce:animate-none",
  spotlight: "bg-[radial-gradient(circle_at_80%_15%,rgba(212,175,55,0.18),transparent_34%)]",
  dividerGradient: "bg-gradient-to-r from-transparent via-[#D4AF37]/70 to-transparent",
  hoverGlow: "hover:border-[#E7C873]/80 hover:shadow-[0_16px_40px_-24px_rgba(212,175,55,0.8)]",
  motionTokens: "animate-[royal-rise_520ms_ease-out_both] motion-reduce:animate-none",
};
