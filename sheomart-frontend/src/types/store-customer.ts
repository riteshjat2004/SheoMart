export interface StoreCustomer {
  customerId: string;
  storeCustomerId?: string;
  name: string;
  email: string;
  mobile: string;
  phone?: string;
  avatar?: string | null;
  isEmailVerified?: boolean;
  isPhoneVerified?: boolean;
  isVerified?: boolean;
  customerSince?: string;
  isPlusCustomer: boolean;
  notes?: string;
  totalOrders?: number;
  completedOrders?: number;
  cancelledOrders?: number;
  pendingOrders?: number;
  totalOnlinePurchases?: number;
  totalOfflinePurchases?: number;
  totalSpend?: number;
  totalPurchase?: number;
  totalPurchases?: number;
  outstandingAmount?: number;
  averageOrderValue?: number;
  lastPurchaseAt?: string | null;
  firstPurchaseAt?: string | null;
  isVip?: boolean;
  isRepeat?: boolean;
  isNew?: boolean;
  isFrequent?: boolean;
  statusBadge?: "VIP" | "Frequent Buyer" | "Repeat Customer" | "New Customer" | "Inactive";
  status?: string;
}

export interface StoreCustomerSummary {
  totalCustomers: number;
  activeCustomers: number;
  newCustomersThisMonth: number;
  repeatCustomers: number;
  verifiedCustomers: number;
  vipCustomers: number;
}

export interface StoreCustomerFilters {
  page: number;
  limit: number;
  search?: string;
  isPlusCustomer?: boolean;
  isVerified?: boolean;
  type?: "all" | "new" | "repeat" | "vip" | "frequent";
  sortBy?: "highest_spend" | "most_orders" | "recent_purchase" | "alphabetical";
  spendingMin?: number;
  spendingMax?: number;
}

export interface StoreCustomerListResponse {
  customers: StoreCustomer[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  summary?: StoreCustomerSummary;
}

export interface StoreCustomerFavoriteProduct {
  productId: string;
  name: string;
  sku: string;
  quantity: number;
  totalSpent: number;
}

export interface StoreCustomerFavoriteCategory {
  category: string;
  quantity: number;
  totalSpent: number;
}

export interface StoreCustomerTimelineItem {
  orderId: string;
  invoiceNumber?: string;
  date: string;
  status: string;
  fulfillmentType: string;
  grandTotal: number;
  paymentMethod: string;
  paymentStatus: string;
  totalItems: number;
  productsCount: number;
}

export interface StoreCustomerInsights {
  mostPurchasedProduct: string;
  favoriteCategory: string;
  averageBasketSize: number;
  lifetimeSpend: number;
  couponUsageCount: number;
  lastActiveDate: string | null;
}

export interface StoreCustomerDetails {
  customer: StoreCustomer;
  sellerRelationship: {
    totalOrders: number;
    completedOrders: number;
    cancelledOrders: number;
    pendingOrders: number;
    totalSpending: number;
    totalOnlinePurchases: number;
    totalOfflinePurchases: number;
    averageOrderValue: number;
    lastPurchase: string | null;
    firstPurchase: string | null;
  };
  favoriteProducts: StoreCustomerFavoriteProduct[];
  favoriteCategories: StoreCustomerFavoriteCategory[];
  timeline: StoreCustomerTimelineItem[];
  insights: StoreCustomerInsights;
  isPlusCustomer: boolean;
  outstandingAmount?: number;
  purchases?: Array<{
    date?: string;
    orderId?: string;
    invoiceId?: string;
    type?: "ONLINE" | "OFFLINE" | "PICKUP" | "DELIVERY" | string;
    amount?: number;
    paymentStatus?: string;
  }>;
  totalOrders?: number;
  totalPurchases?: number;
  totalOfflinePurchases?: number;
  customerSince?: string;
  lastPurchaseAt?: string | null;
}

export interface StoreCustomerOrderRecord {
  orderId: string;
  invoiceNumber?: string;
  createdAt: string;
  status: string;
  paymentStatus: string;
  paymentMethod: string;
  fulfillmentType: string;
  grandTotal: number;
  couponCode?: string;
  couponDiscount?: number;
  totalItems: number;
  orderItems: Array<{
    orderItemId: string;
    productId: string;
    name: string;
    sku: string;
    quantity: number;
    price: number;
    discountPrice: number;
    totalPrice: number;
  }>;
}

export interface StoreCustomerOrdersResponse {
  orders: StoreCustomerOrderRecord[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface StoreCustomerAnalytics {
  cards: {
    totalRevenue: number;
    averageCustomerSpend: number;
    repeatPurchaseRate: number;
    newCustomersCount: number;
    repeatCustomersCount: number;
    totalCustomers: number;
  };
  spendingTrend: Array<{
    month: string;
    revenue: number;
    orders: number;
  }>;
  topCustomers: Array<{
    customerId: string;
    name: string;
    email: string;
    mobile: string;
    totalOrders: number;
    totalSpend: number;
    isVip: boolean;
    isVerified: boolean;
    lastPurchaseAt: string | null;
  }>;
  categorySpending: Array<{
    category: string;
    spending: number;
    quantity: number;
  }>;
}
