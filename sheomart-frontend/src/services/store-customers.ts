import api from "./api";
import type { ApiResponse } from "@/types/api";
import type {
  StoreCustomer,
  StoreCustomerFilters,
  StoreCustomerListResponse,
  StoreCustomerSummary,
  StoreCustomerDetails,
  StoreCustomerAnalytics,
  StoreCustomerOrdersResponse,
} from "@/types/store-customer";

export type { StoreCustomerDetails };

export async function fetchStoreCustomers(
  filters: StoreCustomerFilters
): Promise<StoreCustomerListResponse> {
  const response = await api.get<ApiResponse<StoreCustomerListResponse>>(
    "/api/v1/billing/customers",
    { params: filters }
  );

  return (
    response.data.data ?? {
      customers: [],
      pagination: { page: filters.page, limit: filters.limit, total: 0, totalPages: 0 },
      summary: {
        totalCustomers: 0,
        activeCustomers: 0,
        newCustomersThisMonth: 0,
        repeatCustomers: 0,
        verifiedCustomers: 0,
        vipCustomers: 0,
      },
    }
  );
}

export async function fetchStoreCustomersSummary(): Promise<StoreCustomerSummary> {
  const response = await api.get<ApiResponse<StoreCustomerSummary>>(
    "/api/v1/billing/customers/summary"
  );
  return (
    response.data.data ?? {
      totalCustomers: 0,
      activeCustomers: 0,
      newCustomersThisMonth: 0,
      repeatCustomers: 0,
      verifiedCustomers: 0,
      vipCustomers: 0,
    }
  );
}

export async function fetchStoreCustomersAnalytics(): Promise<StoreCustomerAnalytics> {
  const response = await api.get<ApiResponse<StoreCustomerAnalytics>>(
    "/api/v1/billing/customers/analytics"
  );
  return (
    response.data.data ?? {
      cards: {
        totalRevenue: 0,
        averageCustomerSpend: 0,
        repeatPurchaseRate: 0,
        newCustomersCount: 0,
        repeatCustomersCount: 0,
        totalCustomers: 0,
      },
      spendingTrend: [],
      topCustomers: [],
      categorySpending: [],
    }
  );
}

export async function fetchStoreCustomer(
  customerId: string,
  storeId?: string
): Promise<StoreCustomerDetails | null> {
  const response = await api.get<ApiResponse<StoreCustomerDetails>>(
    `/api/v1/billing/customers/${encodeURIComponent(customerId)}`,
    {
      params: storeId ? { storeId } : undefined,
    }
  );
  return response.data.data ?? null;
}

export async function updateStoreCustomerNotes(
  customerId: string,
  notes: string
): Promise<{ success: boolean; notes: string }> {
  const response = await api.patch<ApiResponse<{ success: boolean; notes: string }>>(
    `/api/v1/billing/customers/${encodeURIComponent(customerId)}/notes`,
    { notes }
  );
  return response.data.data ?? { success: true, notes };
}

export async function fetchStoreCustomerOrders(
  customerId: string,
  params?: {
    page?: number;
    limit?: number;
    orderStatus?: string;
    paymentStatus?: string;
    sortBy?: string;
  }
): Promise<StoreCustomerOrdersResponse> {
  const response = await api.get<ApiResponse<StoreCustomerOrdersResponse>>(
    `/api/v1/billing/customers/${encodeURIComponent(customerId)}/orders`,
    { params }
  );
  return (
    response.data.data ?? {
      orders: [],
      pagination: { page: params?.page || 1, limit: params?.limit || 10, total: 0, totalPages: 0 },
    }
  );
}

export async function updatePlusCustomer(
  customerId: string,
  isPlusCustomer: boolean
): Promise<StoreCustomer> {
  const response = await api.patch<ApiResponse<{ customer: StoreCustomer }>>(
    `/api/v1/billing/customers/${encodeURIComponent(customerId)}/plus`,
    { isPlusCustomer }
  );
  return response.data.data?.customer ?? ({ customerId, isPlusCustomer } as StoreCustomer);
}
