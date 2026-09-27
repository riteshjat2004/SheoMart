export type SellerCouponDiscountType = "flat" | "percentage";
export type SellerCouponScope = "store" | "category" | "product";
export type SellerCouponStatus = "active" | "scheduled" | "draft" | "expired" | "disabled" | "deleted";

export interface SellerCouponItem {
  couponId: string;
  title: string;
  description?: string;
  code: string;
  discountType: SellerCouponDiscountType;
  discountValue: number;
  minimumCartValue: number;
  maximumDiscount: number | null;
  usageLimit: number | null;
  usageCount: number;
  oncePerCustomer: boolean;
  perUserLimit: number;
  newUsersOnly: boolean;
  verifiedOnly?: boolean;
  applicableScope: SellerCouponScope;
  storeId: string;
  storeName?: string | null;
  categoryId?: string | null;
  productId?: string | null;
  categoryIds?: string[];
  productIds?: string[];
  targetCategories?: Array<{ id: string; name: string }>;
  targetProducts?: Array<{ id: string; name: string }>;
  isFeatured: boolean;
  startsAt: string;
  endsAt: string;
  isActive: boolean;
  isDeleted: boolean;
  status: SellerCouponStatus;
  createdAt: string;
  updatedAt: string;
  revenueGenerated?: number;
  discountGiven?: number;
  ordersCount?: number;
  redemptionPercentage?: number | null;
}

export interface SellerCouponSummary {
  totalCoupons: number;
  activeCoupons: number;
  scheduledCoupons: number;
  expiredCoupons: number;
  couponsRedeemed: number;
  revenueGenerated: number;
}

export interface SellerCouponFilters {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
  discountType?: string;
  sortBy?: string;
}

export interface SellerCouponListResponse {
  coupons: SellerCouponItem[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  summary: SellerCouponSummary;
}

export interface SellerCouponAnalytics {
  cards: {
    totalRedemptions: number;
    totalDiscountGiven: number;
    revenueGenerated: number;
    averageBasketValue: number;
    topCoupon: {
      code: string;
      title: string;
      redemptions: number;
      revenue: number;
    } | null;
  };
  redemptionTrend: Array<{
    month: string;
    redemptions: number;
    revenue: number;
    discount: number;
  }>;
  topCoupons: Array<{
    code: string;
    title: string;
    discountType: SellerCouponDiscountType;
    discountValue: number;
    redemptions: number;
    totalRevenue: number;
    totalDiscount: number;
  }>;
}

export interface SellerCouponRedemption {
  orderId: string;
  couponCode: string;
  discountGiven: number;
  orderAmount: number;
  orderStatus: string;
  paymentStatus: string;
  date: string;
  customer: {
    customerId: string;
    name: string;
    email: string;
    mobile: string;
    isVerified: boolean;
  };
}

export interface SellerCouponRedemptionsResponse {
  redemptions: SellerCouponRedemption[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface CreateSellerCouponPayload {
  title: string;
  description?: string;
  code: string;
  discountType: SellerCouponDiscountType;
  discountValue: number;
  minimumCartValue?: number;
  maximumDiscount?: number | null;
  usageLimit?: number | null;
  oncePerCustomer?: boolean;
  perUserLimit?: number;
  newUsersOnly?: boolean;
  verifiedOnly?: boolean;
  applicableScope?: SellerCouponScope;
  categoryId?: string | null;
  productId?: string | null;
  categoryIds?: string[];
  productIds?: string[];
  isFeatured?: boolean;
  startsAt: string;
  endsAt: string;
  isActive?: boolean;
}

export interface UpdateSellerCouponPayload extends Partial<CreateSellerCouponPayload> {}
