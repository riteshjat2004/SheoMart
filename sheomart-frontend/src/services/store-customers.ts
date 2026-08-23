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
  isPlusCustomer?: boolean;
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

export async function updatePlusCustomer(customerId: string, isPlusCustomer: boolean): Promise<StoreCustomerListResponse["customers"][number]> {
  const response = await api.patch<ApiResponse<{ customer: StoreCustomerListResponse["customers"][number] }>>(`/api/v1/billing/customers/${customerId}/plus`, { isPlusCustomer });
  return response.data.data?.customer ?? { customerId, isPlusCustomer };
}

export async function fetchStoreCustomer(customerId: string, storeId?: string): Promise<StoreCustomerDetails | null> {
  const response = await api.get<ApiResponse<StoreCustomerDetails>>(`/api/v1/billing/customers/${encodeURIComponent(customerId)}`, {
    params: storeId ? { storeId } : undefined,
  });
  return response.data.data ?? null;
}
