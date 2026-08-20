import api from "./api";
import type { ApiResponse } from "@/types/api";

export interface CreateOfflineInvoiceItemPayload {
  productId: string;
  quantity: number;
  unitPrice: number;
  discount: number;
}

export interface CreateOfflineInvoicePayload {
  customerId?: string;
  walkInCustomerName?: string;
  walkInCustomerPhone?: string;
  paymentMethod: "CASH" | "UPI" | "CREDIT";
  amountPaid: number;
  items: CreateOfflineInvoiceItemPayload[];
}

export interface OfflineInvoiceResponse {
  invoiceId: string;
  invoiceNumber: string;
  grandTotal: number;
  paymentStatus: string;
}

export async function createOfflineInvoice(payload: CreateOfflineInvoicePayload): Promise<OfflineInvoiceResponse> {
  const response = await api.post<ApiResponse<{ invoice: OfflineInvoiceResponse }>>(
    "/api/v1/billing/invoices",
    payload
  );

  const invoice = response.data.data?.invoice;
  if (!invoice) {
    throw new Error("Invoice creation response was incomplete.");
  }

  return invoice;
}
