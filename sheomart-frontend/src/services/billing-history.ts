import api from "./api";
import type { ApiResponse } from "@/types/api";

export interface BillingInvoiceFilters {
  page: number;
  limit: number;
  status?: string;
  paymentStatus?: string;
  paymentMethod?: string;
  search?: string;
  from?: string;
  to?: string;
}

export interface BillingInvoiceHistoryItem {
  invoiceId: string;
  invoiceNumber: string;
  customerDisplayName: string;
  paymentMethod: string;
  paymentStatus: string;
  grandTotal: number;
  amountPaid?: number;
  remainingAmount?: number;
  createdAt: string;
}

export interface BillingInvoiceHistoryResponse {
  invoices: BillingInvoiceHistoryItem[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export async function fetchBillingInvoices(filters: BillingInvoiceFilters): Promise<BillingInvoiceHistoryResponse> {
  const response = await api.get<ApiResponse<BillingInvoiceHistoryResponse>>("/api/v1/billing/invoices", {
    params: filters,
  });

  return response.data.data ?? {
    invoices: [],
    pagination: { page: filters.page, limit: filters.limit, total: 0, totalPages: 0 },
  };
}

export async function fetchInvoiceById(invoiceId: string) {
  const response = await api.get<ApiResponse<{ invoice: Record<string, unknown>; items: Array<Record<string, unknown>> }>>(
    `/api/v1/billing/invoices/${encodeURIComponent(invoiceId)}`
  );
  return response.data.data;
}

export interface ConfirmInvoicePaymentPayload {
  paymentMethod?: "CASH" | "UPI" | "CREDIT";
  amount?: number;
  notes?: string;
}

export async function confirmInvoicePayment(
  invoiceId: string,
  payload: ConfirmInvoicePaymentPayload
) {
  const response = await api.patch<ApiResponse<{
    invoiceId: string;
    invoiceNumber: string;
    paymentMethod: string;
    paymentStatus: string;
    grandTotal: number;
    amountPaid: number;
    remainingAmount: number;
  }>>(`/api/v1/billing/invoices/${encodeURIComponent(invoiceId)}/payment`, payload);
  return response.data.data;
}

