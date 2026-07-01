import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="flex min-h-[calc(100vh-5rem)] items-center justify-center bg-stone-50 px-4 py-10 dark:bg-stone-950">
      <div className="w-full max-w-md rounded-[2rem] border border-stone-200 bg-white p-8 text-center shadow-sm dark:border-stone-800 dark:bg-stone-900">
        <p className="text-sm font-semibold uppercase tracking-[0.3em] text-emerald-600">404</p>
        <h1 className="mt-4 text-3xl font-semibold text-stone-900 dark:text-stone-50">Page not found</h1>
        <p className="mt-3 text-sm leading-6 text-stone-600 dark:text-stone-300">
          The page you are looking for does not exist or has moved.
        </p>
        <div className="mt-8 flex justify-center">
          <Button asChild>
            <Link href="/">Return home</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
