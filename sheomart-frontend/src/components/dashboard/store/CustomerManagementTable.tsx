"use client";

import { useMemo, useState } from "react";
import { Search, UserRound } from "lucide-react";
import { DashboardCard } from "@/components/dashboard/DashboardCard";
import { EmptyState } from "@/components/dashboard/EmptyState";
import { LoadingSkeleton } from "@/components/dashboard/LoadingSkeleton";
import { Pagination } from "@/components/dashboard/Pagination";
import { StatusBadge } from "@/components/dashboard/StatusBadge";
import { Button } from "@/components/ui/button";
import { useStoreCustomers } from "@/hooks/use-store-customers";
import { useUpdatePlusCustomer } from "@/hooks/use-update-plus-customer";
import type { StoreCustomerFilters } from "@/types/store-customer";
import type { StoreCustomer } from "@/types/store-customer";
import { CustomerDetailsDrawer } from "@/components/dashboard/store/CustomerDetailsDrawer";

const PAGE_SIZE = 10;

const formatDate = (value?: string | null) => value ? new Date(value).toLocaleDateString() : "-";

export function CustomerManagementTable() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");
  const filters = useMemo<StoreCustomerFilters>(() => ({
    page,
    limit: PAGE_SIZE,
    ...(search ? { search } : {}),
    ...(filter === "plus" ? { isPlusCustomer: true } : filter === "regular" ? { isPlusCustomer: false } : {}),
  }), [filter, page, search]);
  const customersQuery = useStoreCustomers(filters);
  const plusMutation = useUpdatePlusCustomer();
  const [localPlusState, setLocalPlusState] = useState<Record<string, boolean>>({});
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; message: string } | null>(null);
  const [pendingCustomerId, setPendingCustomerId] = useState<string | null>(null);
  const [selectedCustomer, setSelectedCustomer] = useState<StoreCustomer | null>(null);
  const customers = customersQuery.data?.customers ?? [];
  const pagination = customersQuery.data?.pagination;

  const updateSearch = (value: string) => {
    setSearch(value);
    setPage(1);
  };
  const updateFilter = (value: string) => {
    setFilter(value);
    setPage(1);
  };

  const togglePlus = async (customerId: string, currentValue: boolean, customerName?: string) => {
    const nextValue = !currentValue;
    const prompt = nextValue
      ? "Grant PLUS membership to this customer?"
      : "Remove PLUS membership from this customer?";
    if (!window.confirm(prompt)) {
      return;
    }

    setFeedback(null);
    setPendingCustomerId(customerId);
    try {
      await plusMutation.mutateAsync({ customerId, isPlusCustomer: nextValue });
      setLocalPlusState((current) => ({ ...current, [customerId]: nextValue }));
      setFeedback({ type: "success", message: `${customerName ?? "Customer"} is now ${nextValue ? "a PLUS customer" : "a regular customer"}.` });
      await customersQuery.refetch();
    } catch (error) {
      setFeedback({ type: "error", message: error instanceof Error ? error.message : "Unable to update PLUS membership." });
    } finally {
      setPendingCustomerId(null);
    }
  };

  return (
    <DashboardCard title="Store customers" description="Review customers linked to your store. Customer records are read-only in this view.">
      <div className="space-y-4">
        {feedback ? <div className={`rounded-lg border p-4 text-sm ${feedback.type === "success" ? "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900/70 dark:bg-emerald-950/30 dark:text-emerald-300" : "border-red-200 bg-red-50 text-red-700 dark:border-red-900/70 dark:bg-red-950/30 dark:text-red-300"}`}>{feedback.message}</div> : null}
        <div className="flex flex-col gap-3 sm:flex-row">
          <label className="relative flex-1">
            <Search className="pointer-events-none absolute left-3 top-3 h-4 w-4 text-stone-400" />
            <input type="search" value={search} onChange={(event) => updateSearch(event.target.value)} placeholder="Search name or phone" className="h-10 w-full rounded-lg border border-stone-200 bg-white pl-9 pr-3 text-sm text-stone-900 outline-none focus:border-emerald-500 dark:border-stone-700 dark:bg-stone-950 dark:text-stone-50" />
          </label>
          <select value={filter} onChange={(event) => updateFilter(event.target.value)} aria-label="Filter customers" className="h-10 rounded-lg border border-stone-200 bg-white px-3 text-sm text-stone-700 outline-none focus:border-emerald-500 dark:border-stone-700 dark:bg-stone-950 dark:text-stone-200">
            <option value="all">All Customers</option>
            <option value="plus">PLUS Customers</option>
            <option value="regular">Regular Customers</option>
          </select>
        </div>

        {customersQuery.isLoading ? <LoadingSkeleton rows={5} /> : null}
        {customersQuery.isError ? <div className="space-y-3"><EmptyState title="Unable to load customers" description={customersQuery.error.message} /><Button type="button" variant="outline" onClick={() => customersQuery.refetch()}>Retry</Button></div> : null}
        {!customersQuery.isLoading && !customersQuery.isError && customers.length === 0 ? <EmptyState title="No customers found" description="Try changing your search or filter." /> : null}
        {!customersQuery.isLoading && !customersQuery.isError && customers.length > 0 ? (
          <div className="overflow-x-auto rounded-[1.25rem] border border-stone-200 dark:border-stone-800">
            <table className="min-w-[1050px] w-full text-left text-sm">
              <thead className="bg-stone-50 text-xs uppercase tracking-[0.12em] text-stone-500 dark:bg-stone-900/70 dark:text-stone-400"><tr><th className="px-4 py-3">Customer</th><th className="px-4 py-3">Phone</th><th className="px-4 py-3">PLUS</th><th className="px-4 py-3">Outstanding Amount</th><th className="px-4 py-3">Total Orders</th><th className="px-4 py-3">Total Purchase</th><th className="px-4 py-3">Last Purchase</th><th className="px-4 py-3">PLUS Action</th><th className="px-4 py-3">View</th></tr></thead>
              <tbody className="divide-y divide-stone-200 dark:divide-stone-800">
                {customers.map((customer) => {
                  const outstanding = customer.outstandingAmount ?? 0;
                  const totalPurchase = customer.totalPurchase ?? customer.totalPurchases ?? 0;
                  const isPlusCustomer = localPlusState[customer.customerId] ?? customer.isPlusCustomer;
                  return <tr key={customer.storeCustomerId ?? customer.customerId} className="text-stone-700 dark:text-stone-200"><td className="px-4 py-3"><div className="flex items-center gap-3"><div className="flex h-9 w-9 items-center justify-center rounded-full bg-stone-100 text-stone-500 dark:bg-stone-800"><UserRound className="h-4 w-4" /></div><div><p className="font-semibold text-stone-900 dark:text-stone-50">{customer.name ?? "Customer"}</p><p className="text-xs text-stone-500 dark:text-stone-400">{customer.email ?? customer.customerId}</p></div></div></td><td className="px-4 py-3">{customer.mobile ?? customer.phone ?? "-"}</td><td className="px-4 py-3">{isPlusCustomer ? <StatusBadge status="PLUS" /> : <span className="text-stone-500">Regular</span>}</td><td className="px-4 py-3">{outstanding > 0 ? <span className="rounded-full bg-red-100 px-2.5 py-1 text-xs font-semibold text-red-700 dark:bg-red-950/40 dark:text-red-300">₹{outstanding}</span> : <span>₹0</span>}</td><td className="px-4 py-3">{customer.totalOrders ?? customer.totalOfflinePurchases ?? 0}</td><td className="px-4 py-3 font-semibold">₹{totalPurchase}</td><td className="px-4 py-3 whitespace-nowrap">{formatDate(customer.lastPurchaseAt)}</td><td className="px-4 py-3"><Button type="button" variant="outline" size="sm" disabled={pendingCustomerId === customer.customerId} onClick={() => togglePlus(customer.customerId, isPlusCustomer, customer.name)}>{pendingCustomerId === customer.customerId ? "Updating..." : isPlusCustomer ? "Remove PLUS" : "Make PLUS"}</Button></td><td className="px-4 py-3"><Button type="button" variant="outline" size="sm" onClick={() => setSelectedCustomer({ ...customer, isPlusCustomer })}>View Details</Button></td></tr>;
                })}
              </tbody>
            </table>
          </div>
        ) : null}
        {pagination && pagination.total > 0 ? <Pagination page={pagination.page} totalPages={pagination.totalPages} onPageChange={setPage} /> : null}
        {selectedCustomer ? <CustomerDetailsDrawer customer={selectedCustomer} onClose={() => setSelectedCustomer(null)} /> : null}
      </div>
    </DashboardCard>
  );
}
