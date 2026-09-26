export interface AdminAnalyticsFilters {
  from?: string;
  to?: string;
  timezone?: string;
}

export interface AnalyticsRange {
  from: string;
  to: string;
  timezone: string;
}

export interface AnalyticsTrendPoint {
  date: string;
  value: number;
}

export interface AnalyticsBreakdownPoint {
  status: string;
  count: number;
}

export interface RevenueAnalytics {
  trend: AnalyticsTrendPoint[];
  byStore: Array<{ storeId: string; storeName: string; revenue: number; orders: number }>;
  byCategory: Array<{ categoryId: string; categoryName: string; revenue: number }>;
  byPaymentMethod: Array<{ method: string; count: number; revenue: number }>;
}

export interface OrderAnalytics {
  kpis: {
    totalOrders: number;
    completedOrders: number;
    cancelledOrders: number;
    pendingOrders: number;
    deliveredOrders: number;
    avgOrderValue: number;
  };
  trend: AnalyticsTrendPoint[];
  byStatus: AnalyticsBreakdownPoint[];
  byCity: Array<{ city: string; count: number; revenue: number }>;
  topProducts: Array<{ productId: string; name: string; quantity: number; revenue: number }>;
  topStores: Array<{ storeId: string; storeName: string; orders: number; revenue: number }>;
}

export interface CustomerAnalytics {
  kpis: {
    totalCustomers: number;
    verifiedCustomers: number;
    newCustomersInRange: number;
    returningCustomers: number;
    repeatPurchaseRate: number;
  };
  trend: AnalyticsTrendPoint[];
  topCities: Array<{ city: string; count: number }>;
  topDistricts: Array<{ district: string; count: number }>;
}

export interface SellerAnalytics {
  kpis: {
    totalSellers: number;
    activeSellers: number;
    pendingSellers: number;
    royalStores: number;
    verifiedStores: number;
  };
  trend: AnalyticsTrendPoint[];
  topSellersByRevenue: Array<{ storeId: string; storeName: string; revenue: number }>;
  topSellersByOrders: Array<{ storeId: string; storeName: string; orders: number }>;
}

export interface ProductInventoryAnalytics {
  kpis: {
    totalProducts: number;
    activeProducts: number;
    outOfStock: number;
    lowStock: number;
    featuredProducts: number;
  };
  lowStockAlerts: Array<{ productId: string; name: string; sku: string; storeName: string; quantity: number }>;
  stockByCategory: Array<{ categoryName: string; totalStock: number; productCount: number }>;
}

export interface CouponOfferAnalytics {
  kpis: {
    couponsCreated: number;
    couponsRedeemed: number;
    activeOffers: number;
    homepageOffers: number;
    revenueSaved: number;
  };
  mostUsedCoupons: Array<{ code: string; usageCount: number; discountValue: number; discountType: string }>;
}

export interface ReviewAnalyticsData {
  kpis: {
    averageRating: number;
    totalReviews: number;
    pendingReviews: number;
    hiddenReviews: number;
    reportedReviews: number;
  };
  distribution: { 1: number; 2: number; 3: number; 4: number; 5: number };
  trend: AnalyticsTrendPoint[];
  topRatedProducts: Array<{ productId: string; name: string; rating: number; totalReviews: number }>;
  lowestRatedProducts: Array<{ productId: string; name: string; rating: number; totalReviews: number }>;
  topRatedStores: Array<{ storeId: string; storeName: string; rating: number; totalReviews: number }>;
}

export interface MarketplaceHealthData {
  activeStores: number;
  inactiveStores: number;
  suspendedStores: number;
  activeUsers: number;
  suspendedUsers: number;
  ordersToday: number;
  failedOrdersToday: number;
  healthScore: number;
  status: "healthy" | "attention" | "critical";
}

export interface ActivityFeedItem {
  id: string;
  type: "user_joined" | "store_approved" | "product_added" | "coupon_created" | "review_submitted" | "order_completed";
  title: string;
  description: string;
  timestamp: string;
}

export interface TopListsData {
  topProducts: Array<{ id: string; name: string; value: number; secondary: string }>;
  topStores: Array<{ id: string; name: string; value: number; secondary: string }>;
  topCustomers: Array<{ id: string; name: string; value: number; secondary: string }>;
  topCategories: Array<{ id: string; name: string; value: number; secondary: string }>;
  topCoupons: Array<{ id: string; name: string; value: number; secondary: string }>;
  topCities: Array<{ id: string; name: string; value: number; secondary: string }>;
}

export interface AdminAnalyticsOverview {
  range: AnalyticsRange;
  overviewKpis: {
    marketplace: {
      totalRevenue: number;
      totalOrders: number;
      totalUsers: number;
      totalStores: number;
    };
    business: {
      totalProducts: number;
      activeProducts: number;
      couponsUsed: number;
      reviewsSubmitted: number;
    };
    growth: {
      revenueToday: number;
      revenueThisWeek: number;
      revenueThisMonth: number;
      newCustomersToday: number;
    };
  };
  kpis: {
    customers: number;
    stores: number;
    products: number;
    orders: number;
    revenue: number;
  };
  trends: {
    orders: AnalyticsTrendPoint[];
    revenue: AnalyticsTrendPoint[];
    newCustomers: AnalyticsTrendPoint[];
    newStores: AnalyticsTrendPoint[];
  };
  breakdowns: {
    ordersByStatus: AnalyticsBreakdownPoint[];
    storesByStatus: AnalyticsBreakdownPoint[];
    productsByStatus: AnalyticsBreakdownPoint[];
  };
  revenue: RevenueAnalytics;
  orderAnalytics: OrderAnalytics;
  customerAnalytics: CustomerAnalytics;
  sellerAnalytics: SellerAnalytics;
  productInventory: ProductInventoryAnalytics;
  couponAnalytics: CouponOfferAnalytics;
  reviewAnalytics: ReviewAnalyticsData;
  marketplaceHealth: MarketplaceHealthData;
  activityFeed: ActivityFeedItem[];
  topLists: TopListsData;
}
