"use client";

import { useEffect, useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Search,
  UserRound,
  ShieldCheck,
  Crown,
  Eye,
  Receipt,
  StickyNote,
  MessageCircle,
  Phone,
  Mail,
  MoreVertical,
  ArrowUpDown,
  Filter,
  UserPlus,
} from "lucide-react";
import { DashboardCard } from "@/components/dashboard/DashboardCard";
import { EmptyState } from "@/components/dashboard/EmptyState";
import { LoadingSkeleton } from "@/components/dashboard/LoadingSkeleton";
import { Pagination } from "@/components/dashboard/Pagination";
import { StatusBadge } from "@/components/dashboard/StatusBadge";
import { Button } from "@/components/ui/button";
import { useStoreCustomers } from "@/hooks/use-store-customers";
import type { StoreCustomer, StoreCustomerFilters } from "@/types/store-customer";
import { CustomerDetailsDrawer } from "@/components/dashboard/store/CustomerDetailsDrawer";
import { CustomerPurchaseHistoryDrawer } from "@/components/dashboard/store/CustomerPurchaseHistoryDrawer";
import { CustomerNoteModal } from "@/components/dashboard/store/CustomerNoteModal";
import { fetchMyStore } from "@/services/store";
import { addPlusMember, fetchPlusMembers, removePlusMember } from "@/services/plus-members";

const PAGE_SIZE = 10;

const money = (val?: number) => `₹${(val ?? 0).toLocaleString("en-IN")}`;
const formatDate = (value?: string | null) =>
  value
    ? new Date(value).toLocaleDateString("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric",
      })
    : "-";

const identifierPattern = /^(?:[^\s@]+@[^\s@]+\.[^\s@]+|\d{10})$/;

interface CustomerManagementTableProps {
  onSummaryChange?: (summary: any) => void;
}

export function CustomerManagementTable({ onSummaryChange }: CustomerManagementTableProps) {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState<"all" | "new" | "repeat" | "vip" | "frequent" | "plus">("all");
  const [verifiedFilter, setVerifiedFilter] = useState<"all" | "verified" | "unverified">("all");
  const [sortBy, setSortBy] = useState<"recent_purchase" | "highest_spend" | "most_orders" | "alphabetical">("recent_purchase");

  // Drawers and Modals state
  const [selectedCustomer, setSelectedCustomer] = useState<StoreCustomer | null>(null);
  const [historyCustomer, setHistoryCustomer] = useState<StoreCustomer | null>(null);
  const [noteCustomer, setNoteCustomer] = useState<StoreCustomer | null>(null);
  const [isAddPlusOpen, setIsAddPlusOpen] = useState(false);
  const [plusIdentifier, setPlusIdentifier] = useState("");
  const [openDropdownId, setOpenDropdownId] = useState<string | null>(null);

  const [feedback, setFeedback] = useState<{ type: "success" | "error"; message: string } | null>(null);
  const [pendingCustomerId, setPendingCustomerId] = useState<string | null>(null);

  const queryClient = useQueryClient();
  const storeQuery = useQuery({ queryKey: ["my-store"], queryFn: fetchMyStore });
  const storeId = storeQuery.data?.storeId;
  const plusMembersQuery = useQuery({
    queryKey: ["plus-members", storeId],
    queryFn: () => fetchPlusMembers(storeId as string),
    enabled: Boolean(storeId),
  });

  const filters = useMemo<StoreCustomerFilters>(() => {
    return {
      page,
      limit: PAGE_SIZE,
      ...(search.trim() ? { search: search.trim() } : {}),
      ...(typeFilter === "plus"
        ? { isPlusCustomer: true }
        : typeFilter !== "all"
        ? { type: typeFilter }
        : {}),
      ...(verifiedFilter === "verified"
        ? { isVerified: true }
        : verifiedFilter === "unverified"
        ? { isVerified: false }
        : {}),
      sortBy,
    };
  }, [page, search, typeFilter, verifiedFilter, sortBy]);

  const customersQuery = useStoreCustomers(filters);
  const customers = customersQuery.data?.customers ?? [];
  const pagination = customersQuery.data?.pagination;
  const summary = customersQuery.data?.summary;

  useEffect(() => {
    if (summary) {
      onSummaryChange?.(summary);
    }
  }, [summary, onSummaryChange]);

  useEffect(() => {
    const openAddPlusMember = () => setIsAddPlusOpen(true);
    window.addEventListener("open-add-plus-member", openAddPlusMember);
    return () => window.removeEventListener("open-add-plus-member", openAddPlusMember);
  }, []);

  const togglePlus = async (customer: StoreCustomer) => {
    const nextValue = !customer.isPlusCustomer;
    const prompt = nextValue
      ? `Grant PLUS membership to ${customer.name || "this customer"}?`
      : `Remove PLUS membership from ${customer.name || "this customer"}?`;
    if (!window.confirm(prompt)) {
      return;
    }

    setFeedback(null);
    setPendingCustomerId(customer.customerId);
    try {
      if (nextValue) {
        const identifier = customer.email || customer.mobile || customer.phone;
        if (!identifier) {
          throw new Error("This customer has no email or phone number for PLUS membership.");
        }
        await addPlusMember(storeId as string, identifier);
      } else {
        const member = (plusMembersQuery.data ?? []).find(
          (item) => item.customerId === customer.customerId
        );
        if (member) {
          await removePlusMember(storeId as string, member.storeCustomerId);
        }
      }
      setFeedback({
        type: "success",
        message: `${customer.name || "Customer"} is now ${
          nextValue ? "a PLUS member" : "a regular customer"
        }.`,
      });
      await queryClient.invalidateQueries({ queryKey: ["store-customers"] });
      await queryClient.invalidateQueries({ queryKey: ["plus-members"] });
    } catch (error) {
      setFeedback({
        type: "error",
        message: error instanceof Error ? error.message : "Unable to update PLUS membership.",
      });
    } finally {
      setPendingCustomerId(null);
    }
  };

  const addPlusMutation = useMutation({
    mutationFn: () => addPlusMember(storeId as string, plusIdentifier.trim()),
    onSuccess: async () => {
      setPlusIdentifier("");
      setIsAddPlusOpen(false);
      setFeedback({ type: "success", message: "Plus membership granted successfully." });
      await queryClient.invalidateQueries({ queryKey: ["store-customers"] });
      await queryClient.invalidateQueries({ queryKey: ["plus-members"] });
    },
    onError: (error) =>
      setFeedback({
        type: "error",
        message: error instanceof Error ? error.message : "Unable to grant Plus membership.",
      }),
  });

  const identifier = plusIdentifier.trim();
  const identifierError =
    identifier && !identifierPattern.test(identifier)
      ? "Enter a valid email or 10-digit phone number."
      : null;
  const canGrantPlus = Boolean(storeId && identifier && !identifierError);

  return (
    <DashboardCard
      title="Store Customers Directory"
      description="Manage customers who have purchased or placed orders at your store. Data is strictly isolated to your store."
    >
      <div className="space-y-4">
        {feedback ? (
          <div
            className={`rounded-lg border p-4 text-sm ${
              feedback.type === "success"
                ? "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900/70 dark:bg-emerald-950/30 dark:text-emerald-300"
                : "border-red-200 bg-red-50 text-red-700 dark:border-red-900/70 dark:bg-red-950/30 dark:text-red-300"
            }`}
          >
            {feedback.message}
          </div>
        ) : null}

        {/* Filter Toolbar */}
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
          {/* Search */}
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-3 top-2.5 h-4 w-4 text-stone-400" />
            <input
              type="search"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              placeholder="Search by customer name, email, phone, or ID..."
              className="h-10 w-full rounded-xl border border-stone-200 bg-white pl-9 pr-3 text-sm text-stone-900 outline-none focus:border-emerald-500 dark:border-stone-800 dark:bg-stone-950 dark:text-stone-50"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Customer Type Filter */}
            <select
              value={typeFilter}
              onChange={(e) => {
                setTypeFilter(e.target.value as any);
                setPage(1);
              }}
              aria-label="Filter by customer type"
              className="h-10 rounded-xl border border-stone-200 bg-white px-3 text-xs font-medium text-stone-700 outline-none focus:border-emerald-500 dark:border-stone-800 dark:bg-stone-950 dark:text-stone-200"
            >
              <option value="all">All Customer Types</option>
              <option value="vip">VIP Customers</option>
              <option value="frequent">Frequent Buyers</option>
              <option value="repeat">Repeat Customers</option>
              <option value="new">New Customers</option>
              <option value="plus">PLUS Members</option>
            </select>

            {/* Verification Filter */}
            <select
              value={verifiedFilter}
              onChange={(e) => {
                setVerifiedFilter(e.target.value as any);
                setPage(1);
              }}
              aria-label="Filter by verification"
              className="h-10 rounded-xl border border-stone-200 bg-white px-3 text-xs font-medium text-stone-700 outline-none focus:border-emerald-500 dark:border-stone-800 dark:bg-stone-950 dark:text-stone-200"
            >
              <option value="all">All Verification</option>
              <option value="verified">Admin Verified</option>
              <option value="unverified">Unverified</option>
            </select>

            {/* Sort Dropdown */}
            <select
              value={sortBy}
              onChange={(e) => {
                setSortBy(e.target.value as any);
                setPage(1);
              }}
              aria-label="Sort customers"
              className="h-10 rounded-xl border border-stone-200 bg-white px-3 text-xs font-medium text-stone-700 outline-none focus:border-emerald-500 dark:border-stone-800 dark:bg-stone-950 dark:text-stone-200"
            >
              <option value="recent_purchase">Recent Purchase</option>
              <option value="highest_spend">Highest Spending</option>
              <option value="most_orders">Most Orders</option>
              <option value="alphabetical">Alphabetical (A-Z)</option>
            </select>

            {/* Reset Filters */}
            {(search || typeFilter !== "all" || verifiedFilter !== "all" || sortBy !== "recent_purchase") ? (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => {
                  setSearch("");
                  setTypeFilter("all");
                  setVerifiedFilter("all");
                  setSortBy("recent_purchase");
                  setPage(1);
                }}
                className="h-10 text-xs text-stone-500 hover:text-stone-900"
              >
                Reset
              </Button>
            ) : null}
          </div>
        </div>

        {/* Content Table */}
        {customersQuery.isLoading ? <LoadingSkeleton rows={6} /> : null}

        {customersQuery.isError ? (
          <div className="space-y-3">
            <EmptyState
              title="Unable to load store customers"
              description={customersQuery.error.message}
            />
            <Button type="button" variant="outline" onClick={() => customersQuery.refetch()}>
              Retry
            </Button>
          </div>
        ) : null}

        {!customersQuery.isLoading && !customersQuery.isError && customers.length === 0 ? (
          <EmptyState
            title="No customers found"
            description="No customers match your search or filter criteria."
          />
        ) : null}

        {!customersQuery.isLoading && !customersQuery.isError && customers.length > 0 ? (
          <div className="overflow-x-auto rounded-2xl border border-stone-200 bg-white shadow-sm dark:border-stone-800 dark:bg-stone-900">
            <table className="min-w-[1080px] w-full text-left text-xs">
              <thead className="sticky top-0 bg-stone-50/90 backdrop-blur-sm uppercase tracking-wider text-[11px] text-stone-500 dark:bg-stone-800/80 dark:text-stone-400">
                <tr>
                  <th className="px-4 py-3.5">Customer</th>
                  <th className="px-4 py-3.5">Contact</th>
                  <th className="px-4 py-3.5">Trust & Verification</th>
                  <th className="px-4 py-3.5">Store Orders</th>
                  <th className="px-4 py-3.5">Total Spend</th>
                  <th className="px-4 py-3.5">Last Order</th>
                  <th className="px-4 py-3.5">Status Badge</th>
                  <th className="px-4 py-3.5">PLUS Status</th>
                  <th className="px-4 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100 dark:divide-stone-800">
                {customers.map((c, index) => {
                  const initials = c.name
                    ? c.name
                        .split(" ")
                        .map((n) => n[0])
                        .join("")
                        .slice(0, 2)
                        .toUpperCase()
                    : "CU";

                  const cleanPhone = (c.mobile || c.phone || "").replace(/\D/g, "");
                  const isMenuOpen = openDropdownId === c.customerId;
                  const isNearBottom = customers.length > 2 ? index >= customers.length - 2 : index > 0;

                  return (
                    <tr
                      key={c.customerId}
                      className="transition-colors hover:bg-stone-50/60 dark:hover:bg-stone-800/40"
                    >
                      {/* Customer Info */}
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-600 to-teal-700 font-bold text-white shadow-sm">
                            {initials}
                          </div>
                          <div>
                            <div className="flex items-center gap-1.5">
                              <span className="font-semibold text-stone-900 dark:text-stone-100">
                                {c.name || "Customer"}
                              </span>
                              {c.isVip ? (
                                <span title="VIP Customer">
                                  <Crown className="h-3.5 w-3.5 text-amber-500" />
                                </span>
                              ) : null}
                            </div>
                            <p className="text-[11px] text-stone-400 truncate max-w-[180px]">
                              {c.email || c.customerId}
                            </p>
                            {c.notes ? (
                              <p className="mt-0.5 flex items-center gap-1 text-[10px] text-amber-600 dark:text-amber-400 truncate max-w-[180px]">
                                <StickyNote className="h-3 w-3 flex-shrink-0" />
                                {c.notes}
                              </p>
                            ) : null}
                          </div>
                        </div>
                      </td>

                      {/* Contact */}
                      <td className="px-4 py-3 text-stone-700 dark:text-stone-300">
                        <p className="font-medium">{c.mobile || c.phone || "-"}</p>
                      </td>

                      {/* Verification Badge */}
                      <td className="px-4 py-3">
                        {c.isVerified ? (
                          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-1 text-[11px] font-semibold text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300">
                            <ShieldCheck className="h-3.5 w-3.5" /> Verified
                          </span>
                        ) : (
                          <span className="text-[11px] text-stone-400">Unverified</span>
                        )}
                      </td>

                      {/* Store Orders */}
                      <td className="px-4 py-3">
                        <span className="font-semibold text-stone-900 dark:text-stone-100">
                          {c.totalOrders ?? 0}
                        </span>
                        <span className="text-[10px] text-stone-400 block">
                          {c.completedOrders ?? 0} Completed
                        </span>
                      </td>

                      {/* Total Spend */}
                      <td className="px-4 py-3">
                        <span className="font-bold text-stone-900 dark:text-stone-100">
                          {money(c.totalSpend)}
                        </span>
                        <span className="text-[10px] text-stone-400 block">
                          Avg {money(c.averageOrderValue)}
                        </span>
                      </td>

                      {/* Last Order Date */}
                      <td className="px-4 py-3 whitespace-nowrap text-stone-600 dark:text-stone-400">
                        {formatDate(c.lastPurchaseAt)}
                      </td>

                      {/* Customer Status Badge */}
                      <td className="px-4 py-3">
                        <span
                          className={`inline-block rounded-full px-2.5 py-0.5 text-[10px] font-semibold ${
                            c.statusBadge === "VIP"
                              ? "bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300"
                              : c.statusBadge === "Frequent Buyer"
                              ? "bg-blue-100 text-blue-800 dark:bg-blue-950/60 dark:text-blue-300"
                              : c.statusBadge === "Repeat Customer"
                              ? "bg-purple-100 text-purple-800 dark:bg-purple-950/60 dark:text-purple-300"
                              : c.statusBadge === "Inactive"
                              ? "bg-stone-100 text-stone-600 dark:bg-stone-800 dark:text-stone-400"
                              : "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300"
                          }`}
                        >
                          {c.statusBadge || "Customer"}
                        </span>
                      </td>

                      {/* PLUS Status & Quick Toggle */}
                      <td className="px-4 py-3">
                        <button
                          type="button"
                          onClick={() => togglePlus(c)}
                          disabled={pendingCustomerId === c.customerId}
                          className={`rounded-full px-2.5 py-1 text-[11px] font-semibold transition ${
                            c.isPlusCustomer
                              ? "bg-emerald-600 text-white hover:bg-emerald-700"
                              : "bg-stone-100 text-stone-600 hover:bg-stone-200 dark:bg-stone-800 dark:text-stone-300"
                          }`}
                        >
                          {pendingCustomerId === c.customerId
                            ? "Updating..."
                            : c.isPlusCustomer
                            ? "PLUS Member"
                            : "+ Make PLUS"}
                        </button>
                      </td>

                      {/* Row Actions Dropdown */}
                      <td className="px-4 py-3 text-right">
                        <div className="relative inline-block text-left">
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            onClick={() =>
                              setOpenDropdownId(isMenuOpen ? null : c.customerId)
                            }
                            aria-label="Open customer actions"
                            className="h-8 w-8"
                          >
                            <MoreVertical className="h-4 w-4" />
                          </Button>

                          {isMenuOpen ? (
                            <>
                              <button
                                type="button"
                                className="fixed inset-0 z-20"
                                onClick={() => setOpenDropdownId(null)}
                              />
                              <div className={`absolute right-0 z-30 w-48 rounded-xl border border-stone-200 bg-white py-1 shadow-xl dark:border-stone-800 dark:bg-stone-900 ${
                                isNearBottom ? "bottom-full mb-1 origin-bottom-right" : "mt-1 origin-top-right"
                              }`}>
                                <button
                                  type="button"
                                  onClick={() => {
                                    setOpenDropdownId(null);
                                    setSelectedCustomer(c);
                                  }}
                                  className="flex w-full items-center gap-2 px-3 py-2 text-left text-xs font-medium text-stone-700 hover:bg-stone-50 dark:text-stone-200 dark:hover:bg-stone-800"
                                >
                                  <Eye className="h-3.5 w-3.5 text-stone-400" />
                                  View Details
                                </button>
                                <button
                                  type="button"
                                  onClick={() => {
                                    setOpenDropdownId(null);
                                    setHistoryCustomer(c);
                                  }}
                                  className="flex w-full items-center gap-2 px-3 py-2 text-left text-xs font-medium text-stone-700 hover:bg-stone-50 dark:text-stone-200 dark:hover:bg-stone-800"
                                >
                                  <Receipt className="h-3.5 w-3.5 text-stone-400" />
                                  View Purchase History
                                </button>
                                <button
                                  type="button"
                                  onClick={() => {
                                    setOpenDropdownId(null);
                                    setNoteCustomer(c);
                                  }}
                                  className="flex w-full items-center gap-2 px-3 py-2 text-left text-xs font-medium text-stone-700 hover:bg-stone-50 dark:text-stone-200 dark:hover:bg-stone-800"
                                >
                                  <StickyNote className="h-3.5 w-3.5 text-amber-500" />
                                  Add / Edit Note
                                </button>

                                <div className="my-1 border-t border-stone-100 dark:border-stone-800" />

                                {cleanPhone ? (
                                  <a
                                    href={`https://wa.me/91${cleanPhone.slice(-10)}`}
                                    target="_blank"
                                    rel="noreferrer"
                                    onClick={() => setOpenDropdownId(null)}
                                    className="flex w-full items-center gap-2 px-3 py-2 text-left text-xs font-medium text-emerald-600 hover:bg-stone-50 dark:hover:bg-stone-800"
                                  >
                                    <MessageCircle className="h-3.5 w-3.5" />
                                    WhatsApp
                                  </a>
                                ) : null}

                                {cleanPhone ? (
                                  <a
                                    href={`tel:+91${cleanPhone.slice(-10)}`}
                                    onClick={() => setOpenDropdownId(null)}
                                    className="flex w-full items-center gap-2 px-3 py-2 text-left text-xs font-medium text-stone-700 hover:bg-stone-50 dark:text-stone-200 dark:hover:bg-stone-800"
                                  >
                                    <Phone className="h-3.5 w-3.5 text-stone-400" />
                                    Call Customer
                                  </a>
                                ) : null}

                                {c.email ? (
                                  <a
                                    href={`mailto:${c.email}`}
                                    onClick={() => setOpenDropdownId(null)}
                                    className="flex w-full items-center gap-2 px-3 py-2 text-left text-xs font-medium text-stone-700 hover:bg-stone-50 dark:text-stone-200 dark:hover:bg-stone-800"
                                  >
                                    <Mail className="h-3.5 w-3.5 text-stone-400" />
                                    Send Email
                                  </a>
                                ) : null}
                              </div>
                            </>
                          ) : null}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : null}

        {/* Pagination Footer */}
        {pagination && pagination.totalPages > 1 ? (
          <div className="pt-2">
            <Pagination
              page={pagination.page}
              totalPages={pagination.totalPages}
              onPageChange={setPage}
            />
          </div>
        ) : null}

        {/* Integrated Customer Details Drawer */}
        {selectedCustomer ? (
          <CustomerDetailsDrawer
            customer={selectedCustomer}
            onClose={() => setSelectedCustomer(null)}
          />
        ) : null}

        {/* Dedicated Purchase History Drawer */}
        {historyCustomer ? (
          <CustomerPurchaseHistoryDrawer
            customer={historyCustomer}
            onClose={() => setHistoryCustomer(null)}
          />
        ) : null}

        {/* Private Customer Note Modal */}
        {noteCustomer ? (
          <CustomerNoteModal
            customer={noteCustomer}
            onClose={() => setNoteCustomer(null)}
            onSuccess={() => {
              queryClient.invalidateQueries({ queryKey: ["store-customers"] });
            }}
          />
        ) : null}

        {/* Add PLUS Member Modal */}
        {isAddPlusOpen ? (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-stone-950/60 p-4"
            role="dialog"
            aria-modal="true"
            aria-labelledby="add-plus-title"
          >
            <div className="w-full max-w-md rounded-2xl border border-stone-200 bg-white p-6 shadow-2xl dark:border-stone-800 dark:bg-stone-900">
              <h2 id="add-plus-title" className="text-lg font-bold text-stone-900 dark:text-stone-50">
                Grant PLUS Membership
              </h2>
              <p className="mt-1 text-xs text-stone-500">
                Enter an existing customer&apos;s email address or 10-digit phone number to grant exclusive PLUS privileges at your store.
              </p>
              <input
                autoFocus
                value={plusIdentifier}
                onChange={(e) => setPlusIdentifier(e.target.value)}
                placeholder="Customer email or 10-digit mobile"
                aria-invalid={Boolean(identifierError)}
                className="mt-4 min-h-11 w-full rounded-xl border border-stone-200 bg-stone-50 px-3 text-sm text-stone-900 outline-none focus:border-emerald-500 focus:bg-white dark:border-stone-800 dark:bg-stone-950 dark:text-stone-50"
              />
              {identifierError ? (
                <p className="mt-2 text-xs text-red-600 dark:text-red-400">
                  {identifierError}
                </p>
              ) : null}
              <div className="mt-6 flex justify-end gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setIsAddPlusOpen(false);
                    setPlusIdentifier("");
                  }}
                >
                  Cancel
                </Button>
                <Button
                  type="button"
                  onClick={() => addPlusMutation.mutate()}
                  disabled={addPlusMutation.isPending || !canGrantPlus}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white"
                >
                  {addPlusMutation.isPending ? "Granting..." : "Grant PLUS"}
                </Button>
              </div>
            </div>
          </div>
        ) : null}
      </div>
    </DashboardCard>
  );
}
