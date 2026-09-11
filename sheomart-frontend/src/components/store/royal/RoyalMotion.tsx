import type { ReactNode } from "react";
import { royalTheme } from "./royalTheme";

export function RoyalMotion({ children, delay = 0 }: { children: ReactNode; delay?: number }) {
  return <div className={royalTheme.motionTokens} style={{ animationDelay: `${delay}ms` }}>{children}</div>;
}