"use client";

import Link from "next/link";
import { Moon, Sparkles, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Container } from "@/components/layout/container";
import { useTheme } from "@/providers/theme-provider";

export function Navbar() {
  const { theme, toggleTheme } = useTheme();

  return (
    <header className="sticky top-0 z-40 border-b border-stone-200/70 bg-white/80 backdrop-blur-xl dark:border-stone-800 dark:bg-stone-950/80">
      <Container className="flex items-center justify-between py-4">
        <Link href="/" className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-emerald-600 text-white shadow-lg shadow-emerald-600/20">
            <Sparkles className="h-5 w-5" />
          </div>
          <div>
            <p className="text-base font-semibold tracking-tight text-stone-900 dark:text-stone-50">SheoMart</p>
            <p className="text-xs text-stone-500 dark:text-stone-400">Fresh essentials, beautifully delivered</p>
          </div>
        </Link>

        <nav className="hidden items-center gap-6 text-sm font-medium text-stone-600 md:flex dark:text-stone-300">
          <Link href="/" className="transition hover:text-emerald-600">Home</Link>
          <Link href="/explore" className="transition hover:text-emerald-600">Explore</Link>
          <Link href="/about" className="transition hover:text-emerald-600">About</Link>
        </nav>

        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" aria-label="Toggle theme" onClick={toggleTheme}>
            {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </Button>
          <Button variant="ghost" size="sm">Sign in</Button>
          <Button size="sm">Get started</Button>
        </div>
      </Container>
    </header>
  );
}
