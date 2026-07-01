import Link from "next/link";
import { ShieldAlert } from "lucide-react";
import { Button } from "@/components/ui/button";

export function Unauthorized() {
  return (
    <div className="flex min-h-[calc(100vh-5rem)] items-center justify-center bg-stone-50 px-4 py-10 dark:bg-stone-950">
      <div className="w-full max-w-md rounded-[2rem] border border-stone-200 bg-white p-8 text-center shadow-sm dark:border-stone-800 dark:bg-stone-900">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300">
          <ShieldAlert className="h-7 w-7" />
        </div>
        <h1 className="mt-6 text-2xl font-semibold text-stone-900 dark:text-stone-50">Access restricted</h1>
        <p className="mt-3 text-sm leading-6 text-stone-600 dark:text-stone-300">
          You need to sign in to view this area of the experience.
        </p>
        <div className="mt-8 flex justify-center gap-3">
          <Button asChild>
            <Link href="/login">Sign in</Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/">Go home</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
