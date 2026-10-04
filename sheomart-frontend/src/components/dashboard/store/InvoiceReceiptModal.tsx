"use client";

import { useRef } from "react";
import { CheckCircle2, Copy, Download, IndianRupee, Printer, ShoppingBag, User, X } from "lucide-react";
import { Button } from "@/components/ui/button";

export interface InvoiceReceiptItem {
  name: string;
  sku?: string;
  quantity: number;
  price: number;
  lineTotal: number;
}

export interface InvoiceReceiptData {
  invoiceId?: string;
  invoiceNumber: string;
  storeName?: string;
  createdAt?: string;
  customerName?: string;
  customerPhone?: string;
  customerEmail?: string;
  customerType?: "walk-in" | "registered" | "plus";
  isPlusCustomer?: boolean;
  paymentMethod: string;
  paymentStatus: string;
  subtotal: number;
  discount?: number;
  grandTotal: number;
  amountPaid: number;
  remainingAmount: number;
  items: InvoiceReceiptItem[];
}

interface InvoiceReceiptModalProps {
  isOpen: boolean;
  onClose: () => void;
  invoice: InvoiceReceiptData | null;
  onNewSale?: () => void;
  onConfirmPayment?: (invoice: InvoiceReceiptData) => void;
}

export function InvoiceReceiptModal({
  isOpen,
  onClose,
  invoice,
  onNewSale,
  onConfirmPayment,
}: InvoiceReceiptModalProps) {
  const receiptRef = useRef<HTMLDivElement>(null);

  if (!isOpen || !invoice) return null;

  const handlePrint = () => {
    window.print();
  };

  const copyInvoiceNumber = () => {
    if (invoice.invoiceNumber) {
      void navigator.clipboard.writeText(invoice.invoiceNumber);
    }
  };

  const formattedDate = invoice.createdAt
    ? new Date(invoice.createdAt).toLocaleString("en-IN", {
        dateStyle: "medium",
        timeStyle: "short",
      })
    : new Date().toLocaleString("en-IN", {
        dateStyle: "medium",
        timeStyle: "short",
      });

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-xs animate-in fade-in duration-200"
    >
      <div className="relative w-full max-w-lg rounded-2xl border border-stone-200 bg-white shadow-2xl dark:border-stone-800 dark:bg-stone-900 flex flex-col max-h-[92vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-stone-100 p-4 sm:px-6 dark:border-stone-800">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300">
              <CheckCircle2 className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-stone-900 dark:text-stone-100">
                Invoice Generated Successfully
              </h2>
              <p className="text-xs text-stone-500 dark:text-stone-400">
                POS receipt ready for counter handover
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close invoice modal"
            className="rounded-lg p-1.5 text-stone-400 hover:bg-stone-100 hover:text-stone-700 dark:hover:bg-stone-800 dark:hover:text-stone-200 transition"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Printable Receipt Body */}
        <div ref={receiptRef} className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 text-xs font-mono">
          {/* Top Brand / Meta */}
          <div className="text-center pb-3 border-b border-dashed border-stone-200 dark:border-stone-800 space-y-1">
            <h3 className="text-sm font-black uppercase tracking-wider text-stone-900 dark:text-white">
              {invoice.storeName || "SheoMart Retail POS"}
            </h3>
            <p className="text-stone-500 font-sans text-[11px]">Retail Counter Tax Invoice</p>
            <div className="inline-flex items-center gap-1.5 mt-1 rounded-full bg-stone-100 px-2.5 py-0.5 font-sans font-bold text-stone-800 dark:bg-stone-800 dark:text-stone-200">
              <span>#{invoice.invoiceNumber}</span>
              <button
                type="button"
                onClick={copyInvoiceNumber}
                title="Copy invoice number"
                className="text-stone-400 hover:text-stone-600 dark:hover:text-stone-200"
              >
                <Copy className="h-3 w-3" />
              </button>
            </div>
            <p className="text-stone-400 text-[10px] pt-1">{formattedDate}</p>
          </div>

          {/* Customer info */}
          <div className="rounded-xl bg-stone-50 p-3 dark:bg-stone-800/50 border border-stone-100 dark:border-stone-800/80 font-sans space-y-1 text-xs">
            <div className="flex items-center justify-between">
              <span className="text-stone-500">Customer:</span>
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-stone-900 dark:text-stone-100">
                  {invoice.customerName || "Walk-in Customer"}
                </span>
                {invoice.isPlusCustomer ? (
                  <span className="rounded-md bg-emerald-600 px-1.5 py-0.2 text-[10px] font-bold text-white">
                    PLUS
                  </span>
                ) : null}
              </div>
            </div>
            {invoice.customerPhone ? (
              <div className="flex items-center justify-between text-stone-500">
                <span>Phone:</span>
                <span className="font-medium text-stone-800 dark:text-stone-200">
                  {invoice.customerPhone}
                </span>
              </div>
            ) : null}
            <div className="flex items-center justify-between text-stone-500">
              <span>Payment Mode:</span>
              <span className="font-bold text-stone-800 dark:text-stone-200">
                {invoice.paymentMethod} ({invoice.paymentStatus})
              </span>
            </div>
          </div>

          {/* Billed Items Table */}
          <div className="space-y-1.5">
            <div className="flex justify-between font-bold text-stone-600 dark:text-stone-400 border-b border-stone-200 pb-1 dark:border-stone-800">
              <span className="w-1/2">Item</span>
              <span className="w-1/6 text-center">Qty</span>
              <span className="w-1/6 text-right">Price</span>
              <span className="w-1/6 text-right">Total</span>
            </div>
            <div className="divide-y divide-stone-100 dark:divide-stone-800/60 max-h-48 overflow-y-auto">
              {invoice.items.map((item, idx) => (
                <div key={idx} className="flex justify-between py-1.5 text-stone-800 dark:text-stone-200">
                  <span className="w-1/2 truncate font-sans font-medium">{item.name}</span>
                  <span className="w-1/6 text-center">{item.quantity}</span>
                  <span className="w-1/6 text-right">₹{item.price.toFixed(2)}</span>
                  <span className="w-1/6 text-right font-bold">₹{item.lineTotal.toFixed(2)}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Totals Calculation */}
          <div className="pt-2 border-t border-dashed border-stone-200 dark:border-stone-800 font-sans space-y-1.5 text-xs">
            <div className="flex justify-between text-stone-600 dark:text-stone-400">
              <span>Subtotal</span>
              <span>₹{invoice.subtotal.toFixed(2)}</span>
            </div>
            {invoice.discount && invoice.discount > 0 ? (
              <div className="flex justify-between text-emerald-600 dark:text-emerald-400">
                <span>Discount</span>
                <span>-₹{invoice.discount.toFixed(2)}</span>
              </div>
            ) : null}
            <div className="flex justify-between border-t border-stone-200 pt-1 text-sm font-bold text-stone-900 dark:text-stone-50">
              <span>Grand Total</span>
              <span className="text-emerald-700 dark:text-emerald-400 font-black">
                ₹{invoice.grandTotal.toFixed(2)}
              </span>
            </div>
            <div className="flex justify-between text-stone-600 dark:text-stone-400 text-[11px]">
              <span>Amount Paid ({invoice.paymentMethod})</span>
              <span>₹{invoice.amountPaid.toFixed(2)}</span>
            </div>
            {invoice.remainingAmount > 0 ? (
              <div className="flex justify-between font-bold text-amber-700 dark:text-amber-400 text-xs bg-amber-50 dark:bg-amber-950/40 p-1.5 rounded-lg">
                <span>Balance Due (Credit)</span>
                <span>₹{invoice.remainingAmount.toFixed(2)}</span>
              </div>
            ) : (
              <div className="flex justify-between text-emerald-700 dark:text-emerald-400 font-semibold text-[11px]">
                <span>Status</span>
                <span>Fully Paid ✓</span>
              </div>
            )}
          </div>

          <div className="text-center pt-2 text-stone-400 font-sans text-[10px]">
            Thank you for shopping with us! Please retain this receipt.
          </div>
        </div>

        {/* Action Buttons */}
        <div className="border-t border-stone-100 p-4 sm:px-6 dark:border-stone-800 flex flex-wrap gap-2.5 bg-stone-50/50 dark:bg-stone-900/50">
          <Button
            type="button"
            onClick={handlePrint}
            className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white"
          >
            <Printer className="mr-2 h-4 w-4" />
            Print Receipt
          </Button>

          {onConfirmPayment &&
          (invoice.paymentStatus === "PENDING" ||
            invoice.paymentStatus === "PARTIALLY_PAID" ||
            invoice.remainingAmount > 0) ? (
            <Button
              type="button"
              onClick={() => {
                onClose();
                onConfirmPayment(invoice);
              }}
              className="flex-1 bg-amber-600 hover:bg-amber-700 text-white"
            >
              <IndianRupee className="mr-1.5 h-4 w-4" />
              Collect Payment (₹{invoice.remainingAmount || invoice.grandTotal})
            </Button>
          ) : null}

          {onNewSale ? (
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                onClose();
                onNewSale();
              }}
              className="flex-1 border-stone-300 dark:border-stone-700"
            >
              Start New Sale
            </Button>
          ) : (
            <Button type="button" variant="outline" onClick={onClose}>
              Close
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
