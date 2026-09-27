"use client";

import { useState } from "react";
import {
  Wallet,
  IndianRupee,
  CreditCard,
  QrCode,
  ShieldCheck,
  CheckCircle2,
  Lock,
} from "lucide-react";
import { Button } from "@/components/ui/button";

const money = (val?: number) => `₹${(val ?? 0).toLocaleString("en-IN")}`;

interface DailyCashSummaryProps {
  todaySales?: number;
  cashCollected?: number;
  upiCollected?: number;
  invoicesCount?: number;
}

export function DailyCashSummaryCard({
  todaySales = 0,
  cashCollected = 0,
  upiCollected = 0,
  invoicesCount = 0,
}: DailyCashSummaryProps) {
  const [openingCash, setOpeningCash] = useState<number>(2000);
  const [isSettled, setIsSettled] = useState(false);

  const totalCashDrawer = openingCash + cashCollected;

  return (
    <div className="rounded-2xl border border-stone-200 bg-white p-5 shadow-sm dark:border-stone-800 dark:bg-stone-900 space-y-4">
      <div className="flex items-center justify-between border-b border-stone-100 pb-3 dark:border-stone-800">
        <div className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 dark:bg-emerald-950/50 dark:text-emerald-400">
            <Wallet className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-stone-900 dark:text-stone-100">
              Daily Drawer & Cash Reconciliation
            </h3>
            <p className="text-xs text-stone-400">End-of-day register balancing</p>
          </div>
        </div>

        {isSettled ? (
          <span className="flex items-center gap-1 rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-bold text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300">
            <CheckCircle2 className="h-3.5 w-3.5" />
            Settled Today
          </span>
        ) : (
          <Button
            size="sm"
            onClick={() => setIsSettled(true)}
            className="h-8 text-xs bg-emerald-600 hover:bg-emerald-700 text-white"
          >
            <Lock className="mr-1.5 h-3.5 w-3.5" />
            Lock Register
          </Button>
        )}
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4 text-xs">
        <div className="rounded-xl bg-stone-50 p-3 dark:bg-stone-800/40 border border-stone-200/60 dark:border-stone-800">
          <span className="text-stone-400 block mb-1">Opening Float Cash</span>
          <span className="text-base font-bold text-stone-900 dark:text-stone-100">
            {money(openingCash)}
          </span>
        </div>

        <div className="rounded-xl bg-stone-50 p-3 dark:bg-stone-800/40 border border-stone-200/60 dark:border-stone-800">
          <span className="text-stone-400 block mb-1">Cash Inflows Today</span>
          <span className="text-base font-bold text-emerald-600 dark:text-emerald-400">
            +{money(cashCollected)}
          </span>
        </div>

        <div className="rounded-xl bg-stone-50 p-3 dark:bg-stone-800/40 border border-stone-200/60 dark:border-stone-800">
          <span className="text-stone-400 block mb-1">Digital UPI / Cards</span>
          <span className="text-base font-bold text-blue-600 dark:text-blue-400">
            {money(upiCollected)}
          </span>
        </div>

        <div className="rounded-xl bg-emerald-50/60 p-3 dark:bg-emerald-950/30 border border-emerald-200/80 dark:border-emerald-900/60">
          <span className="text-emerald-700 dark:text-emerald-300 block mb-1 font-semibold">
            Expected Cash in Register
          </span>
          <span className="text-lg font-black text-emerald-900 dark:text-emerald-200">
            {money(totalCashDrawer)}
          </span>
        </div>
      </div>
    </div>
  );
}
