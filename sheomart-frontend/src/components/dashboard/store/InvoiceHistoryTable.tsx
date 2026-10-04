"use client";

import { useMemo, useState } from "react";
import {
  FileText,
  Loader2,
  Search,
  IndianRupee,
  CheckCircle2,
  AlertCircle,
  X,
} from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { DashboardCard } from "@/components/dashboard/DashboardCard";
import { EmptyState } from "@/components/dashboard/EmptyState";
import { LoadingSkeleton } from "@/components/dashboard/LoadingSkeleton";
import { StatusBadge } from "@/components/dashboard/StatusBadge";
import { Button } from "@/components/ui/button";
import { useBillingInvoices } from "@/hooks/use-billing-invoices";
import {
  fetchInvoiceById,
  type BillingInvoiceFilters,
  type BillingInvoiceHistoryItem,
} from "@/services/billing-history";
import {
  InvoiceReceiptModal,
  type InvoiceReceiptData,
} from "@/components/dashboard/store/InvoiceReceiptModal";
import { ConfirmInvoicePaymentModal } from "@/components/dashboard/store/ConfirmInvoicePaymentModal";

const PAGE_SIZE = 10;

const formatLabel = (value: string): string =>
  value
    .toLowerCase()
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");

export function InvoiceHistoryTable() {
  const queryClient = useQueryClient();

  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [paymentStatus, setPaymentStatus] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");

  const [selectedInvoice, setSelectedInvoice] = useState<InvoiceReceiptData | null>(null);
  const [isReceiptOpen, setIsReceiptOpen] = useState(false);
  const [loadingInvoiceId, setLoadingInvoiceId] = useState<string | null>(null);

  const [paymentInvoice, setPaymentInvoice] = useState<BillingInvoiceHistoryItem | null>(null);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [toast, setToast] = useState<{ type: "success" | "error"; message: string } | null>(null);

  const filters = useMemo<BillingInvoiceFilters>(
    () => ({
      page,
      limit: PAGE_SIZE,
      ...(search ? { search } : {}),
      ...(paymentStatus ? { paymentStatus } : {}),
      ...(paymentMethod ? { paymentMethod } : {}),
      ...(from ? { from } : {}),
      ...(to ? { to } : {}),
    }),
    [from, page, paymentMethod, paymentStatus, search, to]
  );

  const invoicesQuery = useBillingInvoices(filters);
  const invoices = invoicesQuery.data?.invoices ?? [];
  const pagination = invoicesQuery.data?.pagination;
  const totalPages = pagination?.totalPages ?? 0;

  const updateFilter = (setter: (value: string) => void, value: string) => {
    setter(value);
    setPage(1);
  };

  const handleOpenConfirmPayment = (invoice: BillingInvoiceHistoryItem) => {
    setPaymentInvoice(invoice);
    setIsConfirmModalOpen(true);
  };

  const handlePaymentSuccess = () => {
    void invoicesQuery.refetch();
    void queryClient.invalidateQueries({ queryKey: ["billing-invoices"] });
    void queryClient.invalidateQueries({ queryKey: ["seller-analytics"] });
    void queryClient.invalidateQueries({ queryKey: ["daily-cash-summary"] });
    setToast({
      type: "success",
      message: `Payment confirmed successfully for invoice #${paymentInvoice?.invoiceNumber}. Balances updated!`,
    });
    setTimeout(() => setToast(null), 5000);
  };

  const handleViewInvoice = async (invoice: BillingInvoiceHistoryItem) => {
    try {
      setLoadingInvoiceId(invoice.invoiceId);
      const data = await fetchInvoiceById(invoice.invoiceId);
      const inv = (data?.invoice || {}) as Record<string, unknown>;
      const rawItems = (Array.isArray(data?.items) ? data.items : []) as Array<
        Record<string, unknown>
      >;

      const receiptData: InvoiceReceiptData = {
        invoiceId: invoice.invoiceId,
        invoiceNumber: (inv.invoiceNumber as string) || invoice.invoiceNumber,
        storeName: "SheoMart Store POS",
        createdAt: (inv.createdAt as string) || invoice.createdAt,
        customerName:
          (inv.walkInCustomerName as string) ||
          invoice.customerDisplayName ||
          "Walk-in Customer",
        customerPhone: (inv.walkInCustomerPhone as string) || undefined,
        paymentMethod: (inv.paymentMethod as string) || invoice.paymentMethod,
        paymentStatus: (inv.paymentStatus as string) || invoice.paymentStatus,
        subtotal: (inv.subtotal as number) || invoice.grandTotal,
        discount: (inv.discountAmount as number) || 0,
        grandTotal: (inv.grandTotal as number) || invoice.grandTotal,
        amountPaid: (inv.amountPaid as number) ?? invoice.amountPaid ?? invoice.grandTotal,
        remainingAmount: (inv.remainingAmount as number) ?? invoice.remainingAmount ?? 0,
        items: rawItems.map((item) => ({
          name: (item.productName as string) || (item.name as string) || "Item",
          sku: item.sku as string | undefined,
          quantity: (item.quantity as number) || 1,
          price: (item.unitPrice as number) || (item.price as number) || 0,
          lineTotal:
            (item.lineTotal as number) ||
            ((item.quantity as number) || 1) *
              ((item.unitPrice as number) || (item.price as number) || 0),
        })),
      };

      setSelectedInvoice(receiptData);
      setIsReceiptOpen(true);
    } catch {
      setSelectedInvoice({
        invoiceId: invoice.invoiceId,
        invoiceNumber: invoice.invoiceNumber,
        storeName: "SheoMart Store POS",
        createdAt: invoice.createdAt,
        customerName: invoice.customerDisplayName,
        paymentMethod: invoice.paymentMethod,
        paymentStatus: invoice.paymentStatus,
        subtotal: invoice.grandTotal,
        grandTotal: invoice.grandTotal,
        amountPaid: invoice.amountPaid ?? invoice.grandTotal,
        remainingAmount: invoice.remainingAmount ?? 0,
        items: [
          {
            name: "POS Counter Goods",
            quantity: 1,
            price: invoice.grandTotal,
            lineTotal: invoice.grandTotal,
          },
        ],
      });
      setIsReceiptOpen(true);
    } finally {
      setLoadingInvoiceId(null);
    }
  };

  return (
    <DashboardCard
      title="Invoice History"
      description="Review completed offline invoices, track payment status, and confirm pending customer payments."
    >
      <div className="space-y-4">
        {/* Toast Feedback */}
        {toast ? (
          <div
            className={`flex items-center justify-between rounded-xl border p-3 text-xs font-medium transition-all ${
              toast.type === "success"
                ? "border-emerald-200 bg-emerald-50 text-emerald-800 dark:border-emerald-900/60 dark:bg-emerald-950/40 dark:text-emerald-300"
                : "border-rose-200 bg-rose-50 text-rose-800 dark:border-rose-900/60 dark:bg-rose-950/40 dark:text-rose-300"
            }`}
          >
            <div className="flex items-center gap-2">
              {toast.type === "success" ? (
                <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600 dark:text-emerald-400" />
              ) : (
                <AlertCircle className="h-4 w-4 shrink-0 text-rose-600 dark:text-rose-400" />
              )}
              <span>{toast.message}</span>
            </div>
            <button
              type="button"
              onClick={() => setToast(null)}
              className="text-stone-400 hover:text-stone-600 dark:hover:text-stone-200"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        ) : null}

        {/* Filters Bar */}
        <div className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_repeat(2,minmax(150px,0.25fr))_repeat(2,minmax(140px,0.2fr))]">
          <label className="relative">
            <Search className="pointer-events-none absolute left-3 top-3 h-4 w-4 text-stone-400" />
            <input
              type="search"
              value={search}
              onChange={(event) => updateFilter(setSearch, event.target.value)}
              placeholder="Search invoice, customer, or phone"
              className="h-10 w-full rounded-lg border border-stone-200 bg-white pl-9 pr-3 text-sm text-stone-900 outline-none focus:border-emerald-500 dark:border-stone-700 dark:bg-stone-950 dark:text-stone-50"
            />
          </label>
          <select
            value={paymentStatus}
            onChange={(event) => updateFilter(setPaymentStatus, event.target.value)}
            aria-label="Filter by payment status"
            className="h-10 rounded-lg border border-stone-200 bg-white px-3 text-sm text-stone-700 outline-none focus:border-emerald-500 dark:border-stone-700 dark:bg-stone-950 dark:text-stone-200"
          >
            <option value="">All payment statuses</option>
            <option value="PENDING">Pending (Unpaid)</option>
            <option value="PARTIALLY_PAID">Partially Paid</option>
            <option value="PAID">Paid</option>
            <option value="CANCELLED">Cancelled</option>
          </select>
          <select
            value={paymentMethod}
            onChange={(event) => updateFilter(setPaymentMethod, event.target.value)}
            aria-label="Filter by payment method"
            className="h-10 rounded-lg border border-stone-200 bg-white px-3 text-sm text-stone-700 outline-none focus:border-emerald-500 dark:border-stone-700 dark:bg-stone-950 dark:text-stone-200"
          >
            <option value="">All payment methods</option>
            <option value="CASH">Cash</option>
            <option value="UPI">UPI</option>
            <option value="CREDIT">Credit</option>
          </select>
          <label className="flex items-center gap-2 text-xs font-medium text-stone-500 dark:text-stone-400">
            From
            <input
              type="date"
              value={from}
              onChange={(event) => updateFilter(setFrom, event.target.value)}
              className="h-10 min-w-0 flex-1 rounded-lg border border-stone-200 bg-white px-2 text-sm text-stone-700 dark:border-stone-700 dark:bg-stone-950 dark:text-stone-200"
            />
          </label>
          <label className="flex items-center gap-2 text-xs font-medium text-stone-500 dark:text-stone-400">
            To
            <input
              type="date"
              value={to}
              onChange={(event) => updateFilter(setTo, event.target.value)}
              className="h-10 min-w-0 flex-1 rounded-lg border border-stone-200 bg-white px-2 text-sm text-stone-700 dark:border-stone-700 dark:bg-stone-950 dark:text-stone-200"
            />
          </label>
        </div>

        {invoicesQuery.isLoading ? <LoadingSkeleton rows={5} /> : null}
        {invoicesQuery.isError ? (
          <EmptyState
            title="Unable to load invoice history"
            description={invoicesQuery.error.message}
          />
        ) : null}
        {!invoicesQuery.isLoading && !invoicesQuery.isError && invoices.length === 0 ? (
          <EmptyState
            title="No invoices found"
            description="Try changing your search or filters."
          />
        ) : null}
        {!invoicesQuery.isLoading && !invoicesQuery.isError && invoices.length > 0 ? (
          <div className="overflow-x-auto rounded-lg border border-stone-200 dark:border-stone-800">
            <table className="w-full min-w-[820px] text-left text-sm">
              <thead className="bg-stone-50 text-xs uppercase tracking-[0.12em] text-stone-500 dark:bg-stone-950/60 dark:text-stone-400">
                <tr>
                  <th className="px-4 py-3">Invoice Number</th>
                  <th className="px-4 py-3">Customer</th>
                  <th className="px-4 py-3">Payment Method</th>
                  <th className="px-4 py-3">Payment Status</th>
                  <th className="px-4 py-3">Total / Balance</th>
                  <th className="px-4 py-3">Date</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-200 dark:divide-stone-800">
                {invoices.map((invoice) => {
                  const isPendingOrPartial =
                    invoice.paymentStatus === "PENDING" ||
                    invoice.paymentStatus === "PARTIALLY_PAID" ||
                    (invoice.remainingAmount !== undefined && invoice.remainingAmount > 0);

                  const dueBalance =
                    invoice.remainingAmount !== undefined
                      ? invoice.remainingAmount
                      : invoice.paymentStatus === "PENDING"
                      ? invoice.grandTotal
                      : 0;

                  return (
                    <tr
                      key={invoice.invoiceId}
                      className="text-stone-700 dark:text-stone-200 transition-colors hover:bg-stone-50/50 dark:hover:bg-stone-900/40"
                    >
                      <td className="px-4 py-3 font-semibold text-stone-900 dark:text-stone-50">
                        {invoice.invoiceNumber}
                      </td>
                      <td className="px-4 py-3">{invoice.customerDisplayName}</td>
                      <td className="px-4 py-3">{formatLabel(invoice.paymentMethod)}</td>
                      <td className="px-4 py-3">
                        <StatusBadge status={formatLabel(invoice.paymentStatus)} />
                      </td>
                      <td className="px-4 py-3">
                        <div className="font-semibold text-stone-900 dark:text-stone-100">
                          ₹{invoice.grandTotal.toLocaleString("en-IN")}
                        </div>
                        {isPendingOrPartial && dueBalance > 0 ? (
                          <div className="text-[11px] font-bold text-amber-600 dark:text-amber-400">
                            Due: ₹{dueBalance.toLocaleString("en-IN")}
                          </div>
                        ) : invoice.paymentStatus === "PAID" ? (
                          <div className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium">
                            Fully Paid
                          </div>
                        ) : null}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        {new Date(invoice.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-2">
                          {isPendingOrPartial ? (
                            <Button
                              type="button"
                              size="sm"
                              onClick={() => handleOpenConfirmPayment(invoice)}
                              className="h-8 bg-amber-600 hover:bg-amber-700 text-white text-xs gap-1 font-semibold shadow-xs"
                            >
                              <IndianRupee className="h-3.5 w-3.5" />
                              Confirm Payment
                            </Button>
                          ) : null}
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            disabled={loadingInvoiceId === invoice.invoiceId}
                            onClick={() => handleViewInvoice(invoice)}
                            className="h-8 text-xs"
                          >
                            {loadingInvoiceId === invoice.invoiceId ? (
                              <Loader2 className="h-3.5 w-3.5 mr-1 animate-spin" />
                            ) : (
                              <FileText className="h-3.5 w-3.5 mr-1" />
                            )}
                            View
                          </Button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : null}

        {pagination && pagination.total > 0 ? (
          <div className="flex items-center justify-between gap-3 text-sm text-stone-600 dark:text-stone-300">
            <span>
              Page {pagination.page} of {totalPages}
            </span>
            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={page <= 1 || invoicesQuery.isFetching}
                onClick={() => setPage((current) => current - 1)}
              >
                Previous
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={page >= totalPages || invoicesQuery.isFetching}
                onClick={() => setPage((current) => current + 1)}
              >
                Next
              </Button>
            </div>
          </div>
        ) : null}

        {/* View Thermal Receipt Modal */}
        <InvoiceReceiptModal
          isOpen={isReceiptOpen}
          onClose={() => setIsReceiptOpen(false)}
          invoice={selectedInvoice}
          onConfirmPayment={(inv) => {
            if (inv.invoiceId) {
              const matched = invoices.find((i) => i.invoiceId === inv.invoiceId);
              if (matched) {
                handleOpenConfirmPayment(matched);
              } else {
                handleOpenConfirmPayment({
                  invoiceId: inv.invoiceId,
                  invoiceNumber: inv.invoiceNumber,
                  customerDisplayName: inv.customerName || "Customer",
                  paymentMethod: inv.paymentMethod,
                  paymentStatus: inv.paymentStatus,
                  grandTotal: inv.grandTotal,
                  amountPaid: inv.amountPaid,
                  remainingAmount: inv.remainingAmount,
                  createdAt: inv.createdAt || new Date().toISOString(),
                });
              }
            }
          }}
        />

        {/* Confirm Pending Payment Modal */}
        <ConfirmInvoicePaymentModal
          isOpen={isConfirmModalOpen}
          onClose={() => setIsConfirmModalOpen(false)}
          invoice={paymentInvoice}
          onPaymentConfirmed={handlePaymentSuccess}
        />
      </div>
    </DashboardCard>
  );
}
