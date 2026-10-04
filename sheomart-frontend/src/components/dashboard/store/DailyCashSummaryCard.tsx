"use client";

import { useMemo, useState, useEffect } from "react";
import {
  Wallet,
  IndianRupee,
  CreditCard,
  QrCode,
  ShieldCheck,
  CheckCircle2,
  Lock,
  Unlock,
  AlertTriangle,
  RefreshCw,
  Printer,
  Calculator,
  Coins,
  ArrowUpRight,
  ArrowDownRight,
  Receipt,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useBillingInvoices } from "@/hooks/use-billing-invoices";
import { useStoreOrders } from "@/hooks/use-store-orders";
import { useSellerAnalytics } from "@/hooks/use-seller-analytics";

const money = (val?: number) => `₹${(val ?? 0).toLocaleString("en-IN")}`;

interface DailyCashSummaryProps {
  todaySales?: number;
  cashCollected?: number;
  upiCollected?: number;
  invoicesCount?: number;
}

interface Denominations {
  d500: number;
  d200: number;
  d100: number;
  d50: number;
  d20: number;
  d10: number;
  coins: number;
}

export function DailyCashSummaryCard({
  todaySales: propTodaySales,
  cashCollected: propCashCollected,
  upiCollected: propUpiCollected,
  invoicesCount: propInvoicesCount,
}: DailyCashSummaryProps) {
  const todayKey = useMemo(() => new Date().toISOString().split("T")[0], []);

  const { data: invoicesData, isLoading: loadingInvoices, refetch: refetchInvoices } =
    useBillingInvoices({
      page: 1,
      limit: 100,
    });
  const { data: pickupOrdersData, refetch: refetchPickupOrders } = useStoreOrders({
    page: 1,
    limit: 100,
    fulfillmentType: "pickup",
  });
  const { data: analyticsData } = useSellerAnalytics({ range: "today" });

  const refetch = () => {
    void refetchInvoices();
    void refetchPickupOrders();
  };

  const [openingCash, setOpeningCash] = useState<number>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem(`sheomart_opening_float_${todayKey}`);
      if (saved) return Number(saved) || 2000;
    }
    return 2000;
  });

  const [useDenominations, setUseDenominations] = useState(false);
  const [denominations, setDenominations] = useState<Denominations>({
    d500: 0,
    d200: 0,
    d100: 0,
    d50: 0,
    d20: 0,
    d10: 0,
    coins: 0,
  });

  const [manualCountedCash, setManualCountedCash] = useState<string>("");
  const [notes, setNotes] = useState<string>("");
  const [isSettled, setIsSettled] = useState(false);
  const [settledAt, setSettledAt] = useState<string | null>(null);

  // Load settlement status from localStorage on mount
  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedSettlement = localStorage.getItem(`sheomart_register_settlement_${todayKey}`);
      if (savedSettlement) {
        try {
          const parsed = JSON.parse(savedSettlement);
          setIsSettled(true);
          setSettledAt(parsed.settledAt);
          if (parsed.openingCash !== undefined) setOpeningCash(parsed.openingCash);
          if (parsed.countedCash !== undefined) setManualCountedCash(String(parsed.countedCash));
          if (parsed.notes) setNotes(parsed.notes);
        } catch {
          // ignore corrupted data
        }
      }
    }
  }, [todayKey]);

  // Compute transactions from live invoices
  const allInvoices = invoicesData?.invoices || [];
  const todayInvoices = useMemo(() => {
    const todayStr = new Date().toDateString();
    return allInvoices.filter((inv) => {
      try {
        return new Date(inv.createdAt).toDateString() === todayStr;
      } catch {
        return false;
      }
    });
  }, [allInvoices]);

  // Compute transactions from pickup orders
  const allPickupOrders = pickupOrdersData?.orders || [];
  const todayPickupOrders = useMemo(() => {
    const todayStr = new Date().toDateString();
    return allPickupOrders.filter((ord) => {
      try {
        return (
          Boolean(ord.createdAt) &&
          new Date(ord.createdAt as string).toDateString() === todayStr &&
          (ord.pickupStatus === "PICKED_UP" ||
            ord.pickupStatus === "DELIVERED" ||
            ord.status === "DELIVERED") &&
          ord.paymentStatus === "PAID"
        );
      } catch {
        return false;
      }
    });
  }, [allPickupOrders]);

  const livePickupCash = useMemo(() => {
    return todayPickupOrders
      .filter((ord) => ord.paymentReceivedMethod === "CASH" || ord.paymentMethod === "CASH")
      .reduce((sum, ord) => sum + (ord.grandTotal ?? 0), 0);
  }, [todayPickupOrders]);

  const livePickupUpi = useMemo(() => {
    return todayPickupOrders
      .filter((ord) => ord.paymentReceivedMethod === "UPI" || ord.paymentMethod === "UPI")
      .reduce((sum, ord) => sum + (ord.grandTotal ?? 0), 0);
  }, [todayPickupOrders]);

  const liveCash = useMemo(() => {
    return todayInvoices
      .filter((inv) => inv.paymentMethod === "CASH" && inv.paymentStatus !== "CANCELLED")
      .reduce((sum, inv) => sum + inv.grandTotal, 0);
  }, [todayInvoices]);

  const liveUpi = useMemo(() => {
    return todayInvoices
      .filter((inv) => inv.paymentMethod === "UPI" && inv.paymentStatus !== "CANCELLED")
      .reduce((sum, inv) => sum + inv.grandTotal, 0);
  }, [todayInvoices]);

  const liveCredit = useMemo(() => {
    return todayInvoices
      .filter((inv) => inv.paymentMethod === "CREDIT" && inv.paymentStatus !== "CANCELLED")
      .reduce((sum, inv) => sum + inv.grandTotal, 0);
  }, [todayInvoices]);

  const cashCollected = liveCash + livePickupCash || (propCashCollected ?? 0);
  const upiCollected = liveUpi + livePickupUpi || (propUpiCollected ?? 0);
  const totalInvoices = todayInvoices.length + todayPickupOrders.length || (propInvoicesCount ?? 0);
  const grossSales =
    liveCash + liveUpi + liveCredit + livePickupCash + livePickupUpi ||
    (propTodaySales ?? analyticsData?.kpis.todayRevenue ?? 0);

  const totalExpectedCashDrawer = openingCash + cashCollected;

  // Compute counted cash from denominations or manual input
  const denominationTotal = useMemo(() => {
    return (
      denominations.d500 * 500 +
      denominations.d200 * 200 +
      denominations.d100 * 100 +
      denominations.d50 * 50 +
      denominations.d20 * 20 +
      denominations.d10 * 10 +
      denominations.coins
    );
  }, [denominations]);

  const countedPhysicalCash = useDenominations
    ? denominationTotal
    : manualCountedCash !== ""
    ? Number(manualCountedCash) || 0
    : 0;

  const variance = countedPhysicalCash - totalExpectedCashDrawer;

  const handleOpeningCashChange = (val: number) => {
    setOpeningCash(val);
    if (typeof window !== "undefined") {
      localStorage.setItem(`sheomart_opening_float_${todayKey}`, String(val));
    }
  };

  const handleLockRegister = () => {
    const timestamp = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    setIsSettled(true);
    setSettledAt(timestamp);
    if (typeof window !== "undefined") {
      localStorage.setItem(
        `sheomart_register_settlement_${todayKey}`,
        JSON.stringify({
          settledAt: timestamp,
          openingCash,
          cashCollected,
          upiCollected,
          expectedCash: totalExpectedCashDrawer,
          countedCash: countedPhysicalCash,
          variance,
          notes,
        })
      );
    }
  };

  const handleUnlockRegister = () => {
    setIsSettled(false);
    setSettledAt(null);
    if (typeof window !== "undefined") {
      localStorage.removeItem(`sheomart_register_settlement_${todayKey}`);
    }
  };

  const handlePrintSummary = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      {/* Top Header Card */}
      <div className="rounded-2xl border border-stone-200 bg-white p-5 shadow-sm dark:border-stone-800 dark:bg-stone-900 space-y-5">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-b border-stone-100 pb-4 dark:border-stone-800">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 dark:bg-emerald-950/50 dark:text-emerald-400">
              <Wallet className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-stone-900 dark:text-stone-100">
                  Daily Drawer & Cash Reconciliation
                </h3>
                <span className="rounded-md bg-stone-100 px-2 py-0.5 text-[11px] font-medium text-stone-600 dark:bg-stone-800 dark:text-stone-400">
                  {new Date().toLocaleDateString("en-IN", {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                  })}
                </span>
              </div>
              <p className="text-xs text-stone-500 dark:text-stone-400">
                End-of-day register balancing, physical cash count, and float reconciliation
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-center">
            <Button
              variant="outline"
              size="sm"
              onClick={() => refetch()}
              disabled={loadingInvoices}
              className="h-8 text-xs gap-1.5"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${loadingInvoices ? "animate-spin" : ""}`} />
              Sync Sales
            </Button>

            {isSettled ? (
              <div className="flex items-center gap-2">
                <span className="flex items-center gap-1 rounded-full bg-emerald-100 px-3 py-1 text-xs font-bold text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300">
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  Locked at {settledAt || "End of Day"}
                </span>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleUnlockRegister}
                  className="h-8 text-xs text-stone-600 hover:text-stone-900 dark:text-stone-300"
                >
                  <Unlock className="mr-1 h-3.5 w-3.5" />
                  Unlock
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handlePrintSummary}
                  className="h-8 text-xs text-stone-700 dark:text-stone-200"
                >
                  <Printer className="mr-1 h-3.5 w-3.5" />
                  Print
                </Button>
              </div>
            ) : (
              <Button
                size="sm"
                onClick={handleLockRegister}
                className="h-8 text-xs bg-emerald-600 hover:bg-emerald-700 text-white gap-1.5"
              >
                <Lock className="h-3.5 w-3.5" />
                Close & Lock Register
              </Button>
            )}
          </div>
        </div>

        {/* 4 Summary KPIs */}
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-xl bg-stone-50 p-3.5 dark:bg-stone-800/40 border border-stone-200/60 dark:border-stone-800 flex flex-col justify-between">
            <div className="flex items-center justify-between text-xs text-stone-500 mb-1">
              <span>Opening Float Cash</span>
              <Coins className="h-4 w-4 text-stone-400" />
            </div>
            {!isSettled ? (
              <div className="flex items-center gap-1 mt-1">
                <span className="text-xs text-stone-400 font-medium">₹</span>
                <input
                  type="number"
                  min="0"
                  step="100"
                  value={openingCash}
                  onChange={(e) => handleOpeningCashChange(Math.max(0, Number(e.target.value) || 0))}
                  className="h-7 w-28 rounded-md border border-stone-300 bg-white px-2 text-sm font-bold text-stone-900 outline-none focus:border-emerald-500 dark:border-stone-700 dark:bg-stone-950 dark:text-stone-100"
                  placeholder="2000"
                />
              </div>
            ) : (
              <span className="text-base font-bold text-stone-900 dark:text-stone-100">
                {money(openingCash)}
              </span>
            )}
            <span className="text-[10px] text-stone-400 mt-1">Drawer starting reserve balance</span>
          </div>

          <div className="rounded-xl bg-stone-50 p-3.5 dark:bg-stone-800/40 border border-stone-200/60 dark:border-stone-800 flex flex-col justify-between">
            <div className="flex items-center justify-between text-xs text-stone-500 mb-1">
              <span>Cash Inflows Today</span>
              <IndianRupee className="h-4 w-4 text-emerald-500" />
            </div>
            <span className="text-lg font-bold text-emerald-600 dark:text-emerald-400">
              +{money(cashCollected)}
            </span>
            <span className="text-[10px] text-stone-400 mt-1">
              From {todayInvoices.filter((i) => i.paymentMethod === "CASH").length} cash bills
            </span>
          </div>

          <div className="rounded-xl bg-stone-50 p-3.5 dark:bg-stone-800/40 border border-stone-200/60 dark:border-stone-800 flex flex-col justify-between">
            <div className="flex items-center justify-between text-xs text-stone-500 mb-1">
              <span>Digital Collections</span>
              <QrCode className="h-4 w-4 text-blue-500" />
            </div>
            <span className="text-lg font-bold text-blue-600 dark:text-blue-400">
              {money(upiCollected)}
            </span>
            <span className="text-[10px] text-stone-400 mt-1">
              Direct to store bank / UPI QR
            </span>
          </div>

          <div className="rounded-xl bg-emerald-50/70 p-3.5 dark:bg-emerald-950/30 border border-emerald-200/80 dark:border-emerald-900/60 flex flex-col justify-between">
            <div className="flex items-center justify-between text-xs text-emerald-800 dark:text-emerald-300 font-semibold mb-1">
              <span>Expected In Drawer</span>
              <ShieldCheck className="h-4 w-4 text-emerald-600" />
            </div>
            <span className="text-xl font-black text-emerald-900 dark:text-emerald-200">
              {money(totalExpectedCashDrawer)}
            </span>
            <span className="text-[10px] text-emerald-700/80 dark:text-emerald-400 mt-1">
              Opening Float ({money(openingCash)}) + Cash ({money(cashCollected)})
            </span>
          </div>
        </div>
      </div>

      {/* Reconciliation & Physical Count Section */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Left Column: Physical Cash Count */}
        <div className="rounded-2xl border border-stone-200 bg-white p-5 shadow-sm dark:border-stone-800 dark:bg-stone-900 space-y-4">
          <div className="flex items-center justify-between border-b border-stone-100 pb-3 dark:border-stone-800">
            <div className="flex items-center gap-2">
              <Calculator className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
              <h4 className="text-sm font-bold text-stone-900 dark:text-stone-100">
                Count Physical Cash in Drawer
              </h4>
            </div>

            <button
              type="button"
              disabled={isSettled}
              onClick={() => setUseDenominations(!useDenominations)}
              className="text-xs font-semibold text-emerald-600 hover:text-emerald-700 dark:text-emerald-400 disabled:opacity-50"
            >
              {useDenominations ? "Switch to Quick Total" : "Count by Note Denominations"}
            </button>
          </div>

          {useDenominations ? (
            <div className="space-y-2.5">
              <p className="text-xs text-stone-500">
                Count notes in your cash tray to compute total physical cash:
              </p>
              <div className="grid grid-cols-2 gap-2 text-xs">
                {(
                  [
                    ["d500", 500],
                    ["d200", 200],
                    ["d100", 100],
                    ["d50", 50],
                    ["d20", 20],
                    ["d10", 10],
                  ] as const
                ).map(([key, val]) => (
                  <div
                    key={key}
                    className="flex items-center justify-between rounded-lg border border-stone-200 bg-stone-50 px-2.5 py-1.5 dark:border-stone-800 dark:bg-stone-950"
                  >
                    <span className="font-bold text-stone-700 dark:text-stone-300">
                      ₹{val} ×
                    </span>
                    <input
                      type="number"
                      min="0"
                      disabled={isSettled}
                      value={denominations[key] || ""}
                      onChange={(e) =>
                        setDenominations({
                          ...denominations,
                          [key]: Math.max(0, parseInt(e.target.value) || 0),
                        })
                      }
                      className="h-7 w-16 rounded border border-stone-300 bg-white px-1.5 text-right font-medium text-stone-900 outline-none focus:border-emerald-500 dark:border-stone-700 dark:bg-stone-900 dark:text-stone-100 disabled:opacity-50"
                      placeholder="0"
                    />
                  </div>
                ))}
                <div className="col-span-2 flex items-center justify-between rounded-lg border border-stone-200 bg-stone-50 px-2.5 py-1.5 dark:border-stone-800 dark:bg-stone-950">
                  <span className="font-bold text-stone-700 dark:text-stone-300">
                    Coins / Loose Change Total (₹)
                  </span>
                  <input
                    type="number"
                    min="0"
                    disabled={isSettled}
                    value={denominations.coins || ""}
                    onChange={(e) =>
                      setDenominations({
                        ...denominations,
                        coins: Math.max(0, parseInt(e.target.value) || 0),
                      })
                    }
                    className="h-7 w-20 rounded border border-stone-300 bg-white px-1.5 text-right font-medium text-stone-900 outline-none focus:border-emerald-500 dark:border-stone-700 dark:bg-stone-900 dark:text-stone-100 disabled:opacity-50"
                    placeholder="₹0"
                  />
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              <label className="block text-xs font-medium text-stone-600 dark:text-stone-300">
                Enter total physical cash counted in register:
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-2.5 text-stone-400 font-bold">₹</span>
                <input
                  type="number"
                  min="0"
                  disabled={isSettled}
                  value={manualCountedCash}
                  onChange={(e) => setManualCountedCash(e.target.value)}
                  placeholder={String(totalExpectedCashDrawer)}
                  className="h-11 w-full rounded-xl border border-stone-300 bg-white pl-8 pr-3 text-base font-bold text-stone-900 outline-none focus:border-emerald-500 dark:border-stone-700 dark:bg-stone-950 dark:text-stone-100 disabled:opacity-60"
                />
              </div>
              <p className="text-[11px] text-stone-400">
                Tip: If closing without note breakdown, count all currency notes and coins together.
              </p>
            </div>
          )}

          {/* Variance Status Box */}
          <div
            className={`rounded-xl p-3.5 border ${
              variance === 0
                ? "bg-emerald-50/60 border-emerald-200 text-emerald-900 dark:bg-emerald-950/30 dark:border-emerald-900/60 dark:text-emerald-200"
                : variance > 0
                ? "bg-blue-50/60 border-blue-200 text-blue-900 dark:bg-blue-950/30 dark:border-blue-900/60 dark:text-blue-200"
                : "bg-amber-50/60 border-amber-200 text-amber-900 dark:bg-amber-950/30 dark:border-amber-900/60 dark:text-amber-200"
            }`}
          >
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs font-semibold block">
                  {variance === 0
                    ? "Drawer Status: Perfectly Balanced"
                    : variance > 0
                    ? "Drawer Status: Cash Surplus (Over)"
                    : "Drawer Status: Cash Shortage (Short)"}
                </span>
                <span className="text-[11px] opacity-80">
                  Counted: {money(countedPhysicalCash)} | Expected: {money(totalExpectedCashDrawer)}
                </span>
              </div>
              <div className="text-right">
                <span
                  className={`text-base font-black flex items-center justify-end ${
                    variance === 0
                      ? "text-emerald-700 dark:text-emerald-300"
                      : variance > 0
                      ? "text-blue-700 dark:text-blue-300"
                      : "text-amber-700 dark:text-amber-400"
                  }`}
                >
                  {variance > 0 ? (
                    <ArrowUpRight className="h-4 w-4 mr-0.5" />
                  ) : variance < 0 ? (
                    <ArrowDownRight className="h-4 w-4 mr-0.5" />
                  ) : (
                    <CheckCircle2 className="h-4 w-4 mr-0.5" />
                  )}
                  {variance >= 0 ? `+${money(variance)}` : money(variance)}
                </span>
                <span className="text-[10px] font-bold uppercase tracking-wider opacity-70">
                  {variance === 0 ? "No Variance" : "Discrepancy"}
                </span>
              </div>
            </div>
          </div>

          {/* Notes */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-stone-600 dark:text-stone-300">
              Closing Notes / Discrepancy Reason (Optional)
            </label>
            <input
              type="text"
              disabled={isSettled}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g., ₹50 petty cash taken for store cleaning, change rounded"
              className="h-9 w-full rounded-lg border border-stone-200 bg-white px-3 text-xs text-stone-800 outline-none focus:border-emerald-500 dark:border-stone-700 dark:bg-stone-950 dark:text-stone-200 disabled:opacity-60"
            />
          </div>
        </div>

        {/* Right Column: Today's Billing Summary & Transactions */}
        <div className="rounded-2xl border border-stone-200 bg-white p-5 shadow-sm dark:border-stone-800 dark:bg-stone-900 space-y-4">
          <div className="flex items-center justify-between border-b border-stone-100 pb-3 dark:border-stone-800">
            <div className="flex items-center gap-2">
              <Receipt className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
              <h4 className="text-sm font-bold text-stone-900 dark:text-stone-100">
                Today's Settlement Breakdown
              </h4>
            </div>
            <span className="text-xs font-semibold text-stone-500">
              {totalInvoices} Invoices Generated
            </span>
          </div>

          <div className="divide-y divide-stone-100 dark:divide-stone-800 text-xs">
            <div className="flex items-center justify-between py-2">
              <span className="text-stone-500">Gross Offline Billings</span>
              <span className="font-bold text-stone-900 dark:text-stone-100">
                {money(grossSales)}
              </span>
            </div>
            <div className="flex items-center justify-between py-2">
              <span className="text-stone-500 flex items-center gap-1.5">
                <IndianRupee className="h-3.5 w-3.5 text-emerald-600" />
                Physical Cash Collected
              </span>
              <span className="font-bold text-emerald-600 dark:text-emerald-400">
                {money(cashCollected)}
              </span>
            </div>
            <div className="flex items-center justify-between py-2">
              <span className="text-stone-500 flex items-center gap-1.5">
                <QrCode className="h-3.5 w-3.5 text-blue-600" />
                Digital UPI / QR Collected
              </span>
              <span className="font-bold text-blue-600 dark:text-blue-400">
                {money(upiCollected)}
              </span>
            </div>
            <div className="flex items-center justify-between py-2">
              <span className="text-stone-500 flex items-center gap-1.5">
                <CreditCard className="h-3.5 w-3.5 text-purple-600" />
                Store Credit / Khata
              </span>
              <span className="font-bold text-purple-600 dark:text-purple-400">
                {money(liveCredit)}
              </span>
            </div>
            <div className="flex items-center justify-between py-2 font-bold bg-stone-50/60 dark:bg-stone-800/30 px-2 rounded-lg mt-1">
              <span className="text-stone-700 dark:text-stone-300">Total Counted in Register</span>
              <span className="text-sm font-black text-stone-900 dark:text-stone-100">
                {money(countedPhysicalCash)}
              </span>
            </div>
          </div>

          {/* Mini Recent Transactions */}
          <div className="space-y-2 pt-2">
            <span className="text-xs font-bold text-stone-700 dark:text-stone-300 block">
              Today's Invoice Transactions
            </span>
            {todayInvoices.length === 0 ? (
              <div className="rounded-lg border border-dashed border-stone-200 dark:border-stone-800 p-4 text-center text-xs text-stone-400">
                No offline POS invoices generated today yet.
              </div>
            ) : (
              <div className="max-h-48 overflow-y-auto space-y-1.5 pr-1 text-xs">
                {todayInvoices.slice(0, 8).map((inv) => (
                  <div
                    key={inv.invoiceId}
                    className="flex items-center justify-between rounded-lg border border-stone-100 bg-stone-50/60 p-2 dark:border-stone-800 dark:bg-stone-950/40"
                  >
                    <div>
                      <div className="font-semibold text-stone-800 dark:text-stone-200">
                        {inv.customerDisplayName || "Walk-in Customer"}
                      </div>
                      <div className="text-[10px] text-stone-400 flex items-center gap-1.5">
                        <span>{inv.invoiceNumber}</span>
                        <span>•</span>
                        <span>{inv.paymentMethod}</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="font-bold text-stone-900 dark:text-stone-100">
                        ₹{inv.grandTotal}
                      </span>
                      <span className="block text-[10px] text-emerald-600 font-medium">
                        {inv.paymentStatus}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
