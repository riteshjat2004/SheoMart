import Link from "next/link";
import { Container } from "@/components/layout/container";

export function Footer() {
  return (
    <footer className="border-t border-stone-200/70 bg-white/70 dark:border-stone-800 dark:bg-stone-950/70">
      <Container className="flex flex-col gap-4 py-8 text-sm text-stone-600 sm:flex-row sm:items-center sm:justify-between dark:text-stone-300">
        <p>© 2026 SheoMart. Fresh, calm, and ready for modern commerce.</p>
        <div className="flex items-center gap-4">
          <Link href="/privacy" className="transition hover:text-emerald-600">Privacy</Link>
          <Link href="/terms" className="transition hover:text-emerald-600">Terms</Link>
        </div>
      </Container>
    </footer>
  );
}
