import api from "./api";
import type { ApiResponse } from "@/types/api";
import type { StoreCustomerFilters, StoreCustomerListResponse } from "@/types/store-customer";

export interface StoreCustomerPurchase {
  date?: string;
  orderId?: string;
  invoiceId?: string;
  type?: "ONLINE" | "OFFLINE" | string;
  amount?: number;
  paymentStatus?: string;
}

export interface StoreCustomerDetails {
  customer?: StoreCustomerListResponse["customers"][number];
  totalOrders?: number;
  totalPurchases?: number;
  totalOfflinePurchases?: number;
  outstandingAmount?: number;
  customerSince?: string;
  lastPurchaseAt?: string | null;
  purchases?: StoreCustomerPurchase[];
  purchaseHistory?: StoreCustomerPurchase[];
}

export async function fetchStoreCustomers(filters: StoreCustomerFilters): Promise<StoreCustomerListResponse> {
  const response = await api.get<ApiResponse<StoreCustomerListResponse>>("/api/v1/billing/customers", {
    params: filters,
  });

  return response.data.data ?? {
    customers: [],
    pagination: { page: filters.page, limit: filters.limit, total: 0, totalPages: 0 },
  };
}

export async function updatePlusCustomer(customerId: string, isPlusCustomer: boolean): Promise<void> {
  await api.patch(`/api/v1/billing/customers/${customerId}/plus`, { isPlusCustomer });
}

export async function fetchStoreCustomer(customerId: string): Promise<StoreCustomerDetails | null> {
  const response = await api.get<ApiResponse<StoreCustomerDetails>>(`/api/v1/billing/customers/${encodeURIComponent(customerId)}`);
  return response.data.data ?? null;
}
