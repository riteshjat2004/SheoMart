export interface StoreCustomer {
  storeCustomerId?: string;
  customerId: string;
  name?: string;
  email?: string;
  mobile?: string;
  phone?: string;
  isPlusCustomer: boolean;
  outstandingAmount?: number;
  totalOrders?: number;
  totalPurchase?: number;
  totalPurchases?: number;
  totalOfflinePurchases?: number;
  lastPurchaseAt?: string | null;
}

export interface StoreCustomerFilters {
  page: number;
  limit: number;
  search?: string;
  isPlusCustomer?: boolean;
}

export interface StoreCustomerListResponse {
  customers: StoreCustomer[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}
