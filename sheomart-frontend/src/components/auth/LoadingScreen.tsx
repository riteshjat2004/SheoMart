"use client";

import { Loader2 } from "lucide-react";

export function LoadingScreen() {
  return (
    <div className="flex min-h-[calc(100vh-5rem)] items-center justify-center bg-stone-50 px-4 dark:bg-stone-950">
      <div className="flex flex-col items-center gap-4 rounded-3xl border border-stone-200 bg-white/80 px-8 py-10 text-center shadow-sm backdrop-blur dark:border-stone-800 dark:bg-stone-900/80">
        <Loader2 className="h-8 w-8 animate-spin text-emerald-600" />
        <div>
          <p className="text-base font-semibold text-stone-900 dark:text-stone-50">Restoring your session</p>
          <p className="mt-1 text-sm text-stone-600 dark:text-stone-300">Checking your access and preparing the right experience.</p>
        </div>
      </div>
    </div>
  );
}
