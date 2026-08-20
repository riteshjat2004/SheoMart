"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { FileText, Search } from "lucide-react";
import { DashboardCard } from "@/components/dashboard/DashboardCard";
import { EmptyState } from "@/components/dashboard/EmptyState";
import { LoadingSkeleton } from "@/components/dashboard/LoadingSkeleton";
import { StatusBadge } from "@/components/dashboard/StatusBadge";
import { Button } from "@/components/ui/button";
import { useBillingInvoices } from "@/hooks/use-billing-invoices";
import type { BillingInvoiceFilters } from "@/services/billing-history";

const PAGE_SIZE = 10;

const formatLabel = (value: string): string => value
  .toLowerCase()
  .split("_")
  .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
  .join(" ");

export function InvoiceHistoryTable() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [paymentStatus, setPaymentStatus] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");

  const filters = useMemo<BillingInvoiceFilters>(() => ({
    page,
    limit: PAGE_SIZE,
    ...(search ? { search } : {}),
    ...(paymentStatus ? { paymentStatus } : {}),
    ...(paymentMethod ? { paymentMethod } : {}),
    ...(from ? { from } : {}),
    ...(to ? { to } : {}),
  }), [from, page, paymentMethod, paymentStatus, search, to]);
  const invoicesQuery = useBillingInvoices(filters);
  const invoices = invoicesQuery.data?.invoices ?? [];
  const pagination = invoicesQuery.data?.pagination;
  const totalPages = pagination?.totalPages ?? 0;

  const updateFilter = (setter: (value: string) => void, value: string) => {
    setter(value);
    setPage(1);
  };

  return (
    <DashboardCard title="Invoice History" description="Review completed offline invoices and payment records.">
      <div className="space-y-4">
        <div className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_repeat(2,minmax(150px,0.25fr))_repeat(2,minmax(140px,0.2fr))]">
          <label className="relative">
            <Search className="pointer-events-none absolute left-3 top-3 h-4 w-4 text-stone-400" />
            <input type="search" value={search} onChange={(event) => updateFilter(setSearch, event.target.value)} placeholder="Search invoice, customer, or phone" className="h-10 w-full rounded-lg border border-stone-200 bg-white pl-9 pr-3 text-sm text-stone-900 outline-none focus:border-emerald-500 dark:border-stone-700 dark:bg-stone-950 dark:text-stone-50" />
          </label>
          <select value={paymentStatus} onChange={(event) => updateFilter(setPaymentStatus, event.target.value)} aria-label="Filter by payment status" className="h-10 rounded-lg border border-stone-200 bg-white px-3 text-sm text-stone-700 outline-none focus:border-emerald-500 dark:border-stone-700 dark:bg-stone-950 dark:text-stone-200">
            <option value="">All payment statuses</option>
            <option value="PENDING">Pending</option>
            <option value="PARTIALLY_PAID">Partially Paid</option>
            <option value="PAID">Paid</option>
            <option value="CANCELLED">Cancelled</option>
          </select>
          <select value={paymentMethod} onChange={(event) => updateFilter(setPaymentMethod, event.target.value)} aria-label="Filter by payment method" className="h-10 rounded-lg border border-stone-200 bg-white px-3 text-sm text-stone-700 outline-none focus:border-emerald-500 dark:border-stone-700 dark:bg-stone-950 dark:text-stone-200">
            <option value="">All payment methods</option>
            <option value="CASH">Cash</option>
            <option value="UPI">UPI</option>
            <option value="CREDIT">Credit</option>
          </select>
          <label className="flex items-center gap-2 text-xs font-medium text-stone-500 dark:text-stone-400">From<input type="date" value={from} onChange={(event) => updateFilter(setFrom, event.target.value)} className="h-10 min-w-0 flex-1 rounded-lg border border-stone-200 bg-white px-2 text-sm text-stone-700 dark:border-stone-700 dark:bg-stone-950 dark:text-stone-200" /></label>
          <label className="flex items-center gap-2 text-xs font-medium text-stone-500 dark:text-stone-400">To<input type="date" value={to} onChange={(event) => updateFilter(setTo, event.target.value)} className="h-10 min-w-0 flex-1 rounded-lg border border-stone-200 bg-white px-2 text-sm text-stone-700 dark:border-stone-700 dark:bg-stone-950 dark:text-stone-200" /></label>
        </div>

        {invoicesQuery.isLoading ? <LoadingSkeleton rows={5} /> : null}
        {invoicesQuery.isError ? <EmptyState title="Unable to load invoice history" description={invoicesQuery.error.message} /> : null}
        {!invoicesQuery.isLoading && !invoicesQuery.isError && invoices.length === 0 ? <EmptyState title="No invoices found" description="Try changing your search or filters." /> : null}
        {!invoicesQuery.isLoading && !invoicesQuery.isError && invoices.length > 0 ? (
          <div className="overflow-x-auto rounded-lg border border-stone-200 dark:border-stone-800">
            <table className="w-full min-w-[760px] text-left text-sm">
              <thead className="bg-stone-50 text-xs uppercase tracking-[0.12em] text-stone-500 dark:bg-stone-950/60 dark:text-stone-400">
                <tr><th className="px-4 py-3">Invoice Number</th><th className="px-4 py-3">Customer</th><th className="px-4 py-3">Payment Method</th><th className="px-4 py-3">Payment Status</th><th className="px-4 py-3">Grand Total</th><th className="px-4 py-3">Date</th><th className="px-4 py-3">View</th></tr>
              </thead>
              <tbody className="divide-y divide-stone-200 dark:divide-stone-800">
                {invoices.map((invoice) => (
                  <tr key={invoice.invoiceId} className="text-stone-700 dark:text-stone-200">
                    <td className="px-4 py-3 font-semibold text-stone-900 dark:text-stone-50">{invoice.invoiceNumber}</td>
                    <td className="px-4 py-3">{invoice.customerDisplayName}</td>
                    <td className="px-4 py-3">{formatLabel(invoice.paymentMethod)}</td>
                    <td className="px-4 py-3"><StatusBadge status={formatLabel(invoice.paymentStatus)} /></td>
                    <td className="px-4 py-3 font-semibold">₹{invoice.grandTotal}</td>
                    <td className="px-4 py-3 whitespace-nowrap">{new Date(invoice.createdAt).toLocaleDateString()}</td>
                    <td className="px-4 py-3"><Button asChild variant="outline" size="sm"><Link href={`/store/billing/invoices/${invoice.invoiceId}`}><FileText className="h-4 w-4" />View</Link></Button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : null}

        {pagination && pagination.total > 0 ? (
          <div className="flex items-center justify-between gap-3 text-sm text-stone-600 dark:text-stone-300">
            <span>Page {pagination.page} of {totalPages}</span>
            <div className="flex gap-2"><Button type="button" variant="outline" size="sm" disabled={page <= 1 || invoicesQuery.isFetching} onClick={() => setPage((current) => current - 1)}>Previous</Button><Button type="button" variant="outline" size="sm" disabled={page >= totalPages || invoicesQuery.isFetching} onClick={() => setPage((current) => current + 1)}>Next</Button></div>
          </div>
        ) : null}
      </div>
    </DashboardCard>
  );
}
