"use client";

import { useTheme } from "@/hooks/use-theme";

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  // Root level invocation listens to route changes (/login, /register) and account switches
  useTheme();

  return <>{children}</>;
}
