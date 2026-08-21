"use client";

import { X } from "lucide-react";
import { DashboardCard } from "@/components/dashboard/DashboardCard";
import { EmptyState } from "@/components/dashboard/EmptyState";
import { LoadingSkeleton } from "@/components/dashboard/LoadingSkeleton";
import { StatusBadge } from "@/components/dashboard/StatusBadge";
import { Button } from "@/components/ui/button";
import { useStoreCustomer } from "@/hooks/use-store-customer";
import type { StoreCustomer } from "@/types/store-customer";

const money = (value?: number) => `₹${(value ?? 0).toLocaleString("en-IN")}`;
const formatDate = (value?: string | null) => value ? new Date(value).toLocaleDateString("en-IN", { dateStyle: "medium" }) : "Not available";

export function CustomerDetailsDrawer({ customer, onClose }: { customer: StoreCustomer; onClose: () => void }) {
  const customerQuery = useStoreCustomer(customer.customerId, customer);
  const details = customerQuery.data;
  const profile = details?.customer ?? customer;
  const purchases = details?.purchases ?? details?.purchaseHistory ?? [];
  const outstandingAmount = details?.outstandingAmount ?? profile.outstandingAmount ?? 0;
  const totalOrders = details?.totalOrders ?? profile.totalOrders ?? profile.totalOfflinePurchases ?? 0;
  const totalPurchases = details?.totalPurchases ?? profile.totalPurchase ?? profile.totalPurchases ?? 0;
  const totalOfflinePurchases = details?.totalOfflinePurchases ?? profile.totalOfflinePurchases ?? 0;

  return <>
    <button type="button" aria-label="Close customer details" className="fixed inset-0 z-40 bg-stone-950/50" onClick={onClose} />
    <aside className="fixed inset-x-0 bottom-0 z-50 max-h-[92vh] overflow-y-auto rounded-t-2xl border border-stone-200 bg-stone-50 p-5 shadow-2xl dark:border-stone-800 dark:bg-stone-950 sm:inset-y-0 sm:right-0 sm:left-auto sm:h-full sm:w-[min(100%,32rem)] sm:rounded-none sm:border-y-0 sm:border-r-0" role="dialog" aria-modal="true" aria-labelledby="customer-details-title">
      <div className="flex items-start justify-between gap-4"><div><p className="text-xs font-semibold uppercase tracking-[0.16em] text-emerald-600">Customer details</p><h2 id="customer-details-title" className="mt-2 text-xl font-semibold text-stone-900 dark:text-stone-50">{profile.name ?? "Customer"}</h2><p className="mt-1 text-sm text-stone-500">{profile.mobile ?? profile.phone ?? "Phone not available"}</p></div><Button type="button" variant="ghost" size="icon" onClick={onClose} aria-label="Close customer details"><X className="h-5 w-5" /></Button></div>
      <div className="mt-5 flex flex-wrap items-center gap-2">{profile.isPlusCustomer ? <StatusBadge status="PLUS" /> : <span className="text-sm text-stone-500">Regular customer</span>}<span className="text-xs text-stone-500">Since {formatDate(details?.customerSince ?? customer.lastPurchaseAt)}</span></div>
      <p className="mt-2 text-xs text-stone-500">Last purchase: {formatDate(details?.lastPurchaseAt ?? profile.lastPurchaseAt)}</p>
      {customerQuery.isLoading ? <div className="mt-6"><LoadingSkeleton rows={5} /></div> : null}
      {customerQuery.isError ? <div className="mt-6 space-y-3"><EmptyState title="Unable to load customer details" description={customerQuery.error.message} /><Button type="button" variant="outline" onClick={() => customerQuery.refetch()}>Retry</Button></div> : null}
      {!customerQuery.isLoading && !customerQuery.isError ? <div className="mt-6 space-y-5">
        <div className="grid grid-cols-2 gap-3"><DashboardCard title="Total orders"><p className="text-2xl font-semibold">{totalOrders}</p></DashboardCard><DashboardCard title="Total purchases"><p className="text-2xl font-semibold">{money(totalPurchases)}</p></DashboardCard><DashboardCard title="Offline purchases"><p className="text-2xl font-semibold">{money(totalOfflinePurchases)}</p></DashboardCard><DashboardCard title="Outstanding"><p className="text-2xl font-semibold">{money(outstandingAmount)}</p></DashboardCard></div>
        <DashboardCard title="Purchase history" description="Newest purchases first.">{purchases.length === 0 ? <EmptyState title="No purchase history available" description="Purchase history will appear when the backend provides it." /> : <div className="overflow-x-auto"><table className="min-w-[32rem] w-full text-left text-xs"><thead className="text-stone-500"><tr><th className="px-2 py-2">Date</th><th className="px-2 py-2">Order / Invoice</th><th className="px-2 py-2">Type</th><th className="px-2 py-2">Amount</th><th className="px-2 py-2">Payment</th></tr></thead><tbody className="divide-y divide-stone-200 dark:divide-stone-800">{purchases.map((purchase, index) => <tr key={`${purchase.orderId ?? purchase.invoiceId ?? "purchase"}-${index}`}><td className="px-2 py-2 whitespace-nowrap">{formatDate(purchase.date)}</td><td className="px-2 py-2">{purchase.orderId ?? purchase.invoiceId ?? "Not available"}</td><td className="px-2 py-2">{purchase.type ?? "Not available"}</td><td className="px-2 py-2">{money(purchase.amount)}</td><td className="px-2 py-2">{purchase.paymentStatus ?? "Not available"}</td></tr>)}</tbody></table></div>}</DashboardCard>
        <DashboardCard title="Credit" description="Read-only outstanding balance."><p className={`text-2xl font-semibold ${outstandingAmount > 0 ? "text-orange-600" : "text-emerald-600"}`}>{money(outstandingAmount)}</p><p className="mt-1 text-sm text-stone-500">{outstandingAmount > 0 ? "Pending amount" : "No outstanding amount"}</p></DashboardCard>
      </div> : null}
    </aside>
  </>;
}