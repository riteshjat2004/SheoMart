"use client";

import { QueryProvider } from "./query-provider";
import { ThemeProvider } from "./theme-provider";
import { useAuthBootstrap } from "@/hooks/use-auth-bootstrap";

function AuthBootstrap() {
  useAuthBootstrap();
  return null;
}

export function GlobalProviders({ children }: { children: React.ReactNode }) {
  return (
    <QueryProvider>
      <ThemeProvider>
        <AuthBootstrap />
        {children}
      </ThemeProvider>
    </QueryProvider>
  );
}
