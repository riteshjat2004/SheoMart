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

export interface AnalyticsOverview {
  range: AnalyticsRange;
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
}
