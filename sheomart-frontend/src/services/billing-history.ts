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
