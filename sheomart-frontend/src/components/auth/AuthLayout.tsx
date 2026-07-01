import Link from "next/link";
import { Sparkles } from "lucide-react";
import { Container } from "@/components/layout/container";

interface AuthLayoutProps {
  children: React.ReactNode;
  title: string;
  subtitle: string;
}

export function AuthLayout({ children, title, subtitle }: AuthLayoutProps) {
  return (
    <div className="min-h-[calc(100vh-5rem)] bg-[radial-gradient(circle_at_top,_rgba(16,185,129,0.15),_transparent_45%)] py-10 sm:py-16">
      <Container>
        <div className="mx-auto flex max-w-6xl flex-col items-center gap-8 lg:flex-row lg:items-center lg:justify-between">
          <div className="max-w-xl text-center lg:text-left">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-sm font-medium text-emerald-700 dark:border-emerald-900/70 dark:bg-emerald-950/50 dark:text-emerald-300">
              <Sparkles className="h-4 w-4" />
              {title}
            </div>
            <h2 className="text-3xl font-semibold tracking-tight text-stone-950 sm:text-4xl dark:text-stone-50">{subtitle}</h2>
            <p className="mt-4 text-base leading-7 text-stone-600 dark:text-stone-300">
              Sign in or create an account to access personalized shopping, saved preferences, and a faster checkout experience.
            </p>
            <div className="mt-6 flex items-center justify-center gap-3 lg:justify-start">
              <Link href="/" className="text-sm font-medium text-emerald-600 transition hover:text-emerald-700">
                Browse home
              </Link>
            </div>
          </div>
          {children}
        </div>
      </Container>
    </div>
  );
}
