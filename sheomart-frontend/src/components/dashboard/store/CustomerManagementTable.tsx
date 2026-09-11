"use client";

import { useEffect, useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Search, UserRound } from "lucide-react";
import { DashboardCard } from "@/components/dashboard/DashboardCard";
import { EmptyState } from "@/components/dashboard/EmptyState";
import { LoadingSkeleton } from "@/components/dashboard/LoadingSkeleton";
import { Pagination } from "@/components/dashboard/Pagination";
import { StatusBadge } from "@/components/dashboard/StatusBadge";
import { Button } from "@/components/ui/button";
import { useStoreCustomers } from "@/hooks/use-store-customers";
import type { StoreCustomerFilters } from "@/types/store-customer";
import type { StoreCustomer } from "@/types/store-customer";
import { CustomerDetailsDrawer } from "@/components/dashboard/store/CustomerDetailsDrawer";
import { fetchMyStore } from "@/services/store";
import { addPlusMember, fetchPlusMembers, removePlusMember } from "@/services/plus-members";

const PAGE_SIZE = 10;

const formatDate = (value?: string | null) => value ? new Date(value).toLocaleDateString() : "-";
const identifierPattern = /^(?:[^\s@]+@[^\s@]+\.[^\s@]+|\d{10})$/;

export function CustomerManagementTable({ onCustomerCountChange, onPlusCountChange }: { onCustomerCountChange?: (count: number) => void; onPlusCountChange?: (count: number) => void }) {
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
  const queryClient = useQueryClient();
  const storeQuery = useQuery({ queryKey: ["my-store"], queryFn: fetchMyStore });
  const storeId = storeQuery.data?.storeId;
  const plusMembersQuery = useQuery({ queryKey: ["plus-members", storeId], queryFn: () => fetchPlusMembers(storeId as string), enabled: Boolean(storeId) });
  const [localPlusState, setLocalPlusState] = useState<Record<string, boolean>>({});
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; message: string } | null>(null);
  const [pendingCustomerId, setPendingCustomerId] = useState<string | null>(null);
  const [isAddPlusOpen, setIsAddPlusOpen] = useState(false);
  const [plusIdentifier, setPlusIdentifier] = useState("");
  const [selectedCustomer, setSelectedCustomer] = useState<StoreCustomer | null>(null);
  const customers = customersQuery.data?.customers ?? [];
  const plusMembers = plusMembersQuery.data ?? [];
  const pendingMembers = plusMembers.filter((member) => !member.customerId && (!search || [member.pendingEmail, member.pendingPhone].filter(Boolean).some((value) => value?.toLowerCase().includes(search.toLowerCase()))));
  const displayCustomers = [...customers, ...pendingMembers.map((member) => ({ storeCustomerId: member.storeCustomerId, customerId: `pending:${member.storeCustomerId}`, name: "Pending Customer", email: member.pendingEmail ?? undefined, mobile: member.pendingPhone ?? undefined, isPlusCustomer: true } as StoreCustomer))];
  const pagination = customersQuery.data?.pagination;
  useEffect(() => {
    onCustomerCountChange?.(pagination?.total ?? 0);
    onPlusCountChange?.(plusMembers.length);
  }, [onCustomerCountChange, onPlusCountChange, pagination?.total, plusMembers.length]);

  useEffect(() => {
    const openAddPlusMember = () => setIsAddPlusOpen(true);
    window.addEventListener("open-add-plus-member", openAddPlusMember);
    return () => window.removeEventListener("open-add-plus-member", openAddPlusMember);
  }, []);

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
      if (nextValue) {
        const customer = customers.find((item) => item.customerId === customerId);
        const identifier = customer?.email ?? customer?.mobile ?? customer?.phone;
        if (!identifier) {
          throw new Error("This customer has no email or phone number for PLUS membership.");
        }
        await addPlusMember(storeId as string, identifier);
      } else {
        const member = plusMembers.find((item) => item.customerId === customerId);
        if (!member) {
          throw new Error("PLUS membership could not be found.");
        }
        await removePlusMember(storeId as string, member.storeCustomerId);
      }
      setLocalPlusState((current) => ({ ...current, [customerId]: nextValue }));
      setFeedback({ type: "success", message: `${customerName ?? "Customer"} is now ${nextValue ? "a PLUS customer" : "a regular customer"}.` });
      await queryClient.invalidateQueries({ queryKey: ["plus-members"] });
      await queryClient.invalidateQueries({ queryKey: ["store-customers"] });
    } catch (error) {
      setFeedback({ type: "error", message: error instanceof Error ? error.message : "Unable to update PLUS membership." });
    } finally {
      setPendingCustomerId(null);
    }
  };

  const addPlusMutation = useMutation({ mutationFn: () => addPlusMember(storeId as string, plusIdentifier.trim()), onSuccess: async () => { setPlusIdentifier(""); setIsAddPlusOpen(false); setFeedback({ type: "success", message: "Plus membership granted." }); await queryClient.invalidateQueries({ queryKey: ["plus-members"] }); await queryClient.invalidateQueries({ queryKey: ["store-customers"] }); }, onError: (error) => setFeedback({ type: "error", message: error instanceof Error ? error.message : "Unable to grant Plus membership." }) });
  const removePendingMutation = useMutation({ mutationFn: (memberId: string) => removePlusMember(storeId as string, memberId), onSuccess: async () => { setFeedback({ type: "success", message: "Plus membership removed." }); await queryClient.invalidateQueries({ queryKey: ["plus-members"] }); await queryClient.invalidateQueries({ queryKey: ["store-customers"] }); } });

  const identifier = plusIdentifier.trim();
  const identifierError = identifier && !identifierPattern.test(identifier) ? "Enter a valid email or 10-digit phone number." : null;
  const canGrantPlus = Boolean(storeId && identifier && !identifierError);

  return (
    <DashboardCard title="Store customers" description="Review customers linked to your store and manage store-specific Plus membership.">
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
        {!customersQuery.isLoading && !customersQuery.isError && displayCustomers.length === 0 ? <EmptyState title="No customers found" description="Try changing your search or filter." /> : null}
        {!customersQuery.isLoading && !customersQuery.isError && displayCustomers.length > 0 ? (
          <div className="overflow-x-auto rounded-[1.25rem] border border-stone-200 dark:border-stone-800">
            <table className="min-w-[1050px] w-full text-left text-sm">
              <thead className="bg-stone-50 text-xs uppercase tracking-[0.12em] text-stone-500 dark:bg-stone-900/70 dark:text-stone-400"><tr><th className="px-4 py-3">Customer</th><th className="px-4 py-3">Phone</th><th className="px-4 py-3">PLUS</th><th className="px-4 py-3">Outstanding Amount</th><th className="px-4 py-3">Total Orders</th><th className="px-4 py-3">Total Purchase</th><th className="px-4 py-3">Last Purchase</th><th className="px-4 py-3">PLUS Action</th><th className="px-4 py-3">View</th></tr></thead>
              <tbody className="divide-y divide-stone-200 dark:divide-stone-800">
                {displayCustomers.map((customer) => {
                  const outstanding = customer.outstandingAmount ?? 0;
                  const totalPurchase = customer.totalPurchase ?? customer.totalPurchases ?? 0;
                  const isPlusCustomer = localPlusState[customer.customerId] ?? customer.isPlusCustomer;
                  const pendingMember = customer.customerId.startsWith("pending:");
                  return <tr key={customer.storeCustomerId ?? customer.customerId} className="text-stone-700 dark:text-stone-200"><td className="px-4 py-3"><div className="flex items-center gap-3"><div className="flex h-9 w-9 items-center justify-center rounded-full bg-stone-100 text-stone-500 dark:bg-stone-800"><UserRound className="h-4 w-4" /></div><div><p className="font-semibold text-stone-900 dark:text-stone-50">{customer.name ?? "Customer"}</p><p className="text-xs text-stone-500 dark:text-stone-400">{customer.email ?? (pendingMember ? "Pending Customer" : customer.customerId)}</p></div></div></td><td className="px-4 py-3">{customer.mobile ?? customer.phone ?? "-"}</td><td className="px-4 py-3">{isPlusCustomer ? <StatusBadge status={pendingMember ? "Pending PLUS" : "PLUS"} /> : <span className="text-stone-500">Regular</span>}</td><td className="px-4 py-3">{pendingMember ? "—" : outstanding > 0 ? <span className="rounded-full bg-red-100 px-2.5 py-1 text-xs font-semibold text-red-700 dark:bg-red-950/40 dark:text-red-300">₹{outstanding}</span> : <span>₹0</span>}</td><td className="px-4 py-3">{pendingMember ? "—" : customer.totalOrders ?? customer.totalOfflinePurchases ?? 0}</td><td className="px-4 py-3 font-semibold">{pendingMember ? "—" : `₹${totalPurchase}`}</td><td className="px-4 py-3 whitespace-nowrap">{pendingMember ? "—" : formatDate(customer.lastPurchaseAt)}</td><td className="px-4 py-3"><Button type="button" variant="outline" size="sm" disabled={pendingMember ? removePendingMutation.isPending : pendingCustomerId === customer.customerId} onClick={() => pendingMember ? window.confirm("Remove Plus Membership?") && removePendingMutation.mutate(customer.storeCustomerId as string) : togglePlus(customer.customerId, isPlusCustomer, customer.name)}>{pendingMember ? "Remove PLUS" : pendingCustomerId === customer.customerId ? "Updating..." : isPlusCustomer ? "Remove PLUS" : "Make PLUS"}</Button></td><td className="px-4 py-3">{pendingMember ? "—" : <Button type="button" variant="outline" size="sm" onClick={() => setSelectedCustomer({ ...customer, isPlusCustomer })}>View Details</Button>}</td></tr>;
                })}
              </tbody>
            </table>
          </div>
        ) : null}
        {pagination && pagination.total > 0 ? <Pagination page={pagination.page} totalPages={pagination.totalPages} onPageChange={setPage} /> : null}
        {selectedCustomer ? <CustomerDetailsDrawer customer={selectedCustomer} onClose={() => setSelectedCustomer(null)} /> : null}
        {isAddPlusOpen ? <div className="fixed inset-0 z-50 flex items-center justify-center bg-stone-950/60 p-4" role="dialog" aria-modal="true" aria-labelledby="add-plus-title"><div className="w-full max-w-md rounded-2xl border border-stone-700 bg-stone-900 p-6 text-stone-50 shadow-xl"><h2 id="add-plus-title" className="text-lg font-semibold">Add PLUS Member</h2><p className="mt-1 text-sm text-stone-400">Enter an email address or 10-digit phone number.</p><input autoFocus value={plusIdentifier} onChange={(event) => setPlusIdentifier(event.target.value)} placeholder="Email or phone" aria-invalid={Boolean(identifierError)} className="mt-5 min-h-11 w-full rounded-lg border border-stone-700 bg-stone-950 px-3 text-sm outline-none focus:border-emerald-500" />{identifierError ? <p className="mt-2 text-sm text-amber-300">{identifierError}</p> : null}<div className="mt-6 flex justify-end gap-2"><Button type="button" variant="outline" onClick={() => { setIsAddPlusOpen(false); setPlusIdentifier(""); }}>Cancel</Button><Button type="button" onClick={() => addPlusMutation.mutate()} disabled={addPlusMutation.isPending || !canGrantPlus}>{addPlusMutation.isPending ? "Granting..." : "Grant PLUS"}</Button></div></div></div> : null}
      </div>
    </DashboardCard>
  );
}
