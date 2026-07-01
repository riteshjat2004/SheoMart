import Link from "next/link";
import { Globe2, MessageCircle, Share2 } from "lucide-react";

export function Footer() {
  return (
    <footer className="border-t border-stone-200/70 bg-white/70 py-8 dark:border-stone-800 dark:bg-stone-950/70">
      <div className="mx-auto flex max-w-7xl flex-col gap-8 px-4 sm:px-6 lg:flex-row lg:items-start lg:justify-between lg:px-8">
        <div className="max-w-md">
          <p className="text-lg font-semibold text-stone-900 dark:text-stone-50">SheoMart</p>
          <p className="mt-3 text-sm leading-7 text-stone-600 dark:text-stone-300">Premium essentials, trusted stores, and a calmer way to shop every day.</p>
        </div>
        <div className="grid gap-8 sm:grid-cols-3">
          <div>
            <p className="text-sm font-semibold text-stone-900 dark:text-stone-50">Explore</p>
            <div className="mt-3 space-y-2 text-sm text-stone-600 dark:text-stone-300">
              <Link href="/" className="block transition hover:text-emerald-600">Home</Link>
              <Link href="/explore" className="block transition hover:text-emerald-600">Explore</Link>
              <Link href="/about" className="block transition hover:text-emerald-600">About</Link>
            </div>
          </div>
          <div>
            <p className="text-sm font-semibold text-stone-900 dark:text-stone-50">Policies</p>
            <div className="mt-3 space-y-2 text-sm text-stone-600 dark:text-stone-300">
              <Link href="/privacy" className="block transition hover:text-emerald-600">Privacy</Link>
              <Link href="/terms" className="block transition hover:text-emerald-600">Terms</Link>
              <Link href="/contact" className="block transition hover:text-emerald-600">Support</Link>
            </div>
          </div>
          <div>
            <p className="text-sm font-semibold text-stone-900 dark:text-stone-50">Follow</p>
            <div className="mt-3 flex gap-3 text-stone-600 dark:text-stone-300">
              <a href="#" aria-label="Website" className="rounded-full border border-stone-200 p-2 transition hover:border-emerald-500 hover:text-emerald-600 dark:border-stone-700"><Globe2 className="h-4 w-4" /></a>
              <a href="#" aria-label="Contact" className="rounded-full border border-stone-200 p-2 transition hover:border-emerald-500 hover:text-emerald-600 dark:border-stone-700"><MessageCircle className="h-4 w-4" /></a>
              <a href="#" aria-label="Share" className="rounded-full border border-stone-200 p-2 transition hover:border-emerald-500 hover:text-emerald-600 dark:border-stone-700"><Share2 className="h-4 w-4" /></a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
