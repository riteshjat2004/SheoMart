export interface AdminAnalyticsFilters {
  from?: string;
  to?: string;
  timezone: string;
}

export interface AdminAnalyticsRange {
  from: string;
  to: string;
  timezone: string;
}

export interface AdminAnalyticsKpis {
  customers: number;
  stores: number;
  products: number;
  orders: number;
  revenue: number;
}

export interface AdminAnalyticsTrendPoint {
  date: string;
  value: number;
}

export interface AdminAnalyticsBreakdownPoint {
  status: string;
  count: number;
}

export interface AdminAnalyticsBreakdowns {
  ordersByStatus: AdminAnalyticsBreakdownPoint[];
  storesByStatus: AdminAnalyticsBreakdownPoint[];
  productsByStatus: AdminAnalyticsBreakdownPoint[];
}

export interface AdminAnalyticsOverview {
  range: AdminAnalyticsRange;
  kpis: AdminAnalyticsKpis;
  trends: {
    orders: AdminAnalyticsTrendPoint[];
    revenue: AdminAnalyticsTrendPoint[];
    newCustomers: AdminAnalyticsTrendPoint[];
    newStores: AdminAnalyticsTrendPoint[];
  };
  breakdowns: AdminAnalyticsBreakdowns;
}
