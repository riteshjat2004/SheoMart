import { AppError } from "../errors/AppError";
import { ORDER_STATUS, PAYMENT_STATUS, Order } from "../models/order.model";
import { Product } from "../models/product.model";
import { Store } from "../models/store.model";
import { User } from "../models/user.model";
import { Review, REVIEW_STATUS } from "../models/review.model";
import { Coupon } from "../models/coupon.model";
import { Offer } from "../models/offer.model";
import { Category } from "../models/category.model";
import type {
  ActivityFeedItem,
  AnalyticsBreakdownPoint,
  AnalyticsOverview,
  AnalyticsTrendPoint,
  CouponOfferAnalytics,
  CustomerAnalytics,
  MarketplaceHealthData,
  OrderAnalytics,
  ProductInventoryAnalytics,
  RevenueAnalytics,
  ReviewAnalyticsData,
  SellerAnalytics,
  TopListsData,
} from "../types/analytics";
import type { AdminAnalyticsOverviewQuery, AnalyticsExportQuery } from "../validators/analytics.validator";

interface RangeQuery {
  from: Date;
  to: Date;
  timezone: string;
}

function parseBoundary(value: string | undefined, boundary: "from" | "to", fallback: Date) {
  if (!value) {
    return fallback;
  }

  const isDateOnly = /^\d{4}-\d{2}-\d{2}$/.test(value);
  const parsed = new Date(isDateOnly ? `${value}T00:00:00.000Z` : value);

  if (Number.isNaN(parsed.getTime())) {
    throw new AppError(`Invalid analytics ${boundary} date`, 400);
  }

  if (isDateOnly && boundary === "to") {
    parsed.setUTCDate(parsed.getUTCDate() + 1);
  }

  return parsed;
}

function mapTrend(points: Array<{ _id: string; value: number }>): AnalyticsTrendPoint[] {
  return points.map((point) => ({ date: point._id, value: point.value }));
}

function mapBreakdown(points: Array<{ _id: string; count: number }>): AnalyticsBreakdownPoint[] {
  return points.map((point) => ({ status: point._id, count: point.count }));
}

function fillDailyTrend(
  points: AnalyticsTrendPoint[],
  from: Date,
  to: Date,
  timezone: string
) {
  const values = new Map(points.map((point) => [point.date, point.value]));
  const formatter = new Intl.DateTimeFormat("en-CA", {
    timeZone: timezone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
  const filled: AnalyticsTrendPoint[] = [];
  const cursor = new Date(from);

  while (cursor < to) {
    const date = formatter.format(cursor);
    filled.push({ date, value: values.get(date) ?? 0 });
    cursor.setUTCDate(cursor.getUTCDate() + 1);
  }

  return filled;
}

function dateGroup(dateField: string, timezone: string) {
  return {
    $dateToString: {
      format: "%Y-%m-%d",
      date: dateField,
      timezone,
    },
  };
}

function roundCurrency(value: number) {
  return Number((value || 0).toFixed(2));
}

export class AnalyticsService {
  static async getAdminOverview(query: AdminAnalyticsOverviewQuery): Promise<AnalyticsOverview> {
    const now = new Date();
    const defaultFrom = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    const from = parseBoundary(query.from, "from", defaultFrom);
    const to = parseBoundary(query.to, "to", now);

    if (from >= to) {
      throw new AppError("Analytics 'from' must be earlier than 'to'.", 400);
    }

    const range: RangeQuery = { from, to, timezone: query.timezone };
    const createdAtMatch = { createdAt: { $gte: range.from, $lt: range.to } };
    const qualifyingOrderMatch = {
      paymentStatus: PAYMENT_STATUS.PAID,
      status: {
        $nin: [
          ORDER_STATUS.DRAFT,
          ORDER_STATUS.PENDING_PAYMENT,
          ORDER_STATUS.CANCELLED,
          ORDER_STATUS.FAILED,
          ORDER_STATUS.REFUNDED,
        ],
      },
    };

    // Calculate dates for Growth KPIs
    const startOfToday = new Date(now);
    startOfToday.setUTCHours(0, 0, 0, 0);

    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    // Parallel aggregate queries across domains
    const [
      // 1. Overall Lifetime & Growth KPIs
      lifetimeRevenueAgg,
      totalOrdersLifetime,
      totalUsersLifetime,
      totalStoresLifetime,
      totalProductsLifetime,
      activeProductsLifetime,
      couponsUsedLifetime,
      reviewsSubmittedLifetime,
      revenueTodayAgg,
      revenueWeekAgg,
      revenueMonthAgg,
      newCustomersToday,

      // 2. Base range analytics
      userData,
      storeData,
      productData,
      orderData,

      // 3. Domain Specific Aggregations
      revenueByStoreAgg,
      revenueByCategoryAgg,
      revenueByPaymentMethodAgg,
      ordersByCityAgg,
      topProductsAgg,
      topStoresByOrdersAgg,
      customerLocationAgg,
      repeatBuyersAgg,
      storeBadgeAgg,
      lowStockAlertsAgg,
      stockByCategoryAgg,
      couponStatsAgg,
      mostUsedCouponsAgg,
      reviewStatsAgg,
      topRatedProductsAgg,
      lowestRatedProductsAgg,
      topRatedStoresAgg,
      marketplaceHealthAgg,
      activityFeedAgg,
    ] = await Promise.all([
      // 1. Lifetime & Growth
      Order.aggregate([
        { $match: { ...qualifyingOrderMatch } },
        { $group: { _id: null, total: { $sum: "$grandTotal" } } },
      ]),
      Order.countDocuments({ status: { $ne: ORDER_STATUS.DRAFT } }),
      User.countDocuments({ isDeleted: { $ne: true } }),
      Store.countDocuments({ isDeleted: { $ne: true } }),
      Product.countDocuments({ isDeleted: { $ne: true } }),
      Product.countDocuments({ isActive: true, isPublished: true, isDeleted: { $ne: true } }),
      Coupon.aggregate([
        { $match: { isDeleted: { $ne: true } } },
        { $group: { _id: null, total: { $sum: "$usageCount" } } },
      ]),
      Review.countDocuments({ isDeleted: { $ne: true } }),
      Order.aggregate([
        { $match: { ...qualifyingOrderMatch, paidAt: { $gte: startOfToday } } },
        { $group: { _id: null, total: { $sum: "$grandTotal" } } },
      ]),
      Order.aggregate([
        { $match: { ...qualifyingOrderMatch, paidAt: { $gte: sevenDaysAgo } } },
        { $group: { _id: null, total: { $sum: "$grandTotal" } } },
      ]),
      Order.aggregate([
        { $match: { ...qualifyingOrderMatch, paidAt: { $gte: thirtyDaysAgo } } },
        { $group: { _id: null, total: { $sum: "$grandTotal" } } },
      ]),
      User.countDocuments({ role: "customer", createdAt: { $gte: startOfToday } }),

      // 2. Base range aggregates
      User.aggregate([
        { $match: { ...createdAtMatch, role: "customer" } },
        {
          $facet: {
            kpi: [{ $count: "value" }],
            trends: [
              { $group: { _id: dateGroup("$createdAt", range.timezone), value: { $sum: 1 } } },
              { $sort: { _id: 1 } },
            ],
          },
        },
      ]),
      Store.aggregate([
        { $match: createdAtMatch },
        {
          $facet: {
            kpi: [{ $count: "value" }],
            trends: [
              { $group: { _id: dateGroup("$createdAt", range.timezone), value: { $sum: 1 } } },
              { $sort: { _id: 1 } },
            ],
            breakdowns: [
              { $group: { _id: "$status", count: { $sum: 1 } } },
              { $sort: { _id: 1 } },
            ],
          },
        },
      ]),
      Product.aggregate([
        { $match: createdAtMatch },
        {
          $facet: {
            kpi: [{ $count: "value" }],
            breakdowns: [
              {
                $project: {
                  statuses: [
                    { $cond: ["$isActive", "active", "inactive"] },
                    { $cond: ["$isPublished", "published", "draft"] },
                  ],
                },
              },
              { $unwind: "$statuses" },
              { $group: { _id: "$statuses", count: { $sum: 1 } } },
              { $sort: { _id: 1 } },
            ],
          },
        },
      ]),
      Order.aggregate([
        {
          $facet: {
            kpi: [
              { $match: { ...createdAtMatch, ...qualifyingOrderMatch } },
              { $count: "value" },
            ],
            trends: [
              { $match: { ...createdAtMatch, ...qualifyingOrderMatch } },
              { $group: { _id: dateGroup("$createdAt", range.timezone), value: { $sum: 1 } } },
              { $sort: { _id: 1 } },
            ],
            revenue: [
              { $match: { ...qualifyingOrderMatch, paidAt: { $gte: range.from, $lt: range.to } } },
              { $group: { _id: dateGroup("$paidAt", range.timezone), value: { $sum: "$grandTotal" } } },
              { $sort: { _id: 1 } },
            ],
            breakdowns: [
              { $match: createdAtMatch },
              { $group: { _id: "$status", count: { $sum: 1 } } },
              { $sort: { _id: 1 } },
            ],
          },
        },
      ]),

      // 3. Domain Specific
      // Revenue by Store (Top 10)
      Order.aggregate([
        { $match: { ...qualifyingOrderMatch, paidAt: { $gte: range.from, $lt: range.to } } },
        { $group: { _id: "$storeId", revenue: { $sum: "$grandTotal" }, orders: { $sum: 1 } } },
        { $sort: { revenue: -1 } },
        { $limit: 10 },
      ]),
      // Revenue by Category (Top 8)
      Order.aggregate([
        { $match: { ...qualifyingOrderMatch, paidAt: { $gte: range.from, $lt: range.to } } },
        { $unwind: "$items" },
        {
          $lookup: {
            from: "products",
            localField: "items.productId",
            foreignField: "productId",
            as: "product",
          },
        },
        { $unwind: "$product" },
        { $group: { _id: "$product.categoryId", revenue: { $sum: "$items.totalPrice" } } },
        { $sort: { revenue: -1 } },
        { $limit: 8 },
      ]),
      // Revenue by Payment Method
      Order.aggregate([
        { $match: { ...qualifyingOrderMatch, paidAt: { $gte: range.from, $lt: range.to } } },
        { $group: { _id: "$paymentMethod", count: { $sum: 1 }, revenue: { $sum: "$grandTotal" } } },
        { $sort: { revenue: -1 } },
      ]),
      // Orders by City (Top 10)
      Order.aggregate([
        { $match: { ...createdAtMatch, status: { $ne: ORDER_STATUS.DRAFT } } },
        {
          $group: {
            _id: { $ifNull: ["$shippingAddress.city", "Unknown"] },
            count: { $sum: 1 },
            revenue: { $sum: "$grandTotal" },
          },
        },
        { $sort: { count: -1 } },
        { $limit: 10 },
      ]),
      // Top Selling Products
      Order.aggregate([
        { $match: { ...qualifyingOrderMatch, paidAt: { $gte: range.from, $lt: range.to } } },
        { $unwind: "$items" },
        {
          $group: {
            _id: "$items.productId",
            name: { $first: "$items.name" },
            quantity: { $sum: "$items.quantity" },
            revenue: { $sum: "$items.totalPrice" },
          },
        },
        { $sort: { quantity: -1 } },
        { $limit: 10 },
      ]),
      // Top Selling Stores by Orders
      Order.aggregate([
        { $match: { ...createdAtMatch, status: { $ne: ORDER_STATUS.DRAFT } } },
        { $group: { _id: "$storeId", orders: { $sum: 1 }, revenue: { $sum: "$grandTotal" } } },
        { $sort: { orders: -1 } },
        { $limit: 10 },
      ]),
      // Customer locations (Districts / Cities)
      User.aggregate([
        { $match: { role: "customer", isDeleted: { $ne: true } } },
        {
          $facet: {
            cities: [
              { $group: { _id: { $ifNull: ["$city", "Unknown"] }, count: { $sum: 1 } } },
              { $match: { _id: { $ne: "" } } },
              { $sort: { count: -1 } },
              { $limit: 10 },
            ],
            districts: [
              { $group: { _id: { $ifNull: ["$district", "Unknown"] }, count: { $sum: 1 } } },
              { $match: { _id: { $ne: "" } } },
              { $sort: { count: -1 } },
              { $limit: 10 },
            ],
          },
        },
      ]),
      // Repeat buyers count
      Order.aggregate([
        { $match: { ...qualifyingOrderMatch } },
        { $group: { _id: "$userId", count: { $sum: 1 } } },
        {
          $group: {
            _id: null,
            totalBuyers: { $sum: 1 },
            repeatBuyers: { $sum: { $cond: [{ $gt: ["$count", 1] }, 1, 0] } },
          },
        },
      ]),
      // Store badges count
      Store.aggregate([
        { $match: { isDeleted: { $ne: true } } },
        { $group: { _id: "$badge", count: { $sum: 1 } } },
      ]),
      // Low stock alerts
      Product.find({ quantity: { $lte: 10 }, isDeleted: false })
        .select("productId name sku storeId quantity")
        .sort({ quantity: 1 })
        .limit(10)
        .lean(),
      // Stock by Category
      Product.aggregate([
        { $match: { isDeleted: false } },
        {
          $group: {
            _id: "$categoryId",
            totalStock: { $sum: "$quantity" },
            productCount: { $sum: 1 },
          },
        },
        { $sort: { totalStock: -1 } },
        { $limit: 10 },
      ]),
      // Coupon & Offer KPIs
      Promise.all([
        Coupon.countDocuments({ isDeleted: { $ne: true } }),
        Offer.countDocuments({ isActive: true, isDeleted: { $ne: true } }),
        Offer.countDocuments({ isBanner: true, isActive: true, isDeleted: { $ne: true } }),
        Order.aggregate([
          { $match: { couponCode: { $exists: true, $ne: "" }, paymentStatus: PAYMENT_STATUS.PAID } },
          { $group: { _id: null, totalSaved: { $sum: "$discountAmount" } } },
        ]),
      ]),
      // Most Used Coupons
      Coupon.find({ isDeleted: { $ne: true } })
        .select("code usageCount discountValue discountType")
        .sort({ usageCount: -1 })
        .limit(10)
        .lean(),
      // Review Stats (Overall)
      Promise.all([
        Review.countDocuments({ status: REVIEW_STATUS.PENDING, isDeleted: false }),
        Review.countDocuments({ $or: [{ status: REVIEW_STATUS.HIDDEN }, { isVisible: false }], isDeleted: false }),
        Review.countDocuments({ $or: [{ status: REVIEW_STATUS.REPORTED }, { reportCount: { $gt: 0 } }], isDeleted: false }),
        Review.aggregate([
          { $match: { isDeleted: false } },
          { $group: { _id: "$rating", count: { $sum: 1 } } },
        ]),
        Review.aggregate([
          { $match: { isDeleted: false, isVisible: true, status: REVIEW_STATUS.APPROVED } },
          { $group: { _id: null, avg: { $avg: "$rating" } } },
        ]),
        Review.aggregate([
          { $match: { ...createdAtMatch, isDeleted: false } },
          { $group: { _id: dateGroup("$createdAt", range.timezone), value: { $avg: "$rating" } } },
          { $sort: { _id: 1 } },
        ]),
      ]),
      // Top Rated Products
      Product.find({ totalReviews: { $gte: 1 }, isDeleted: false })
        .select("productId name rating totalReviews")
        .sort({ rating: -1, totalReviews: -1 })
        .limit(5)
        .lean(),
      // Lowest Rated Products
      Product.find({ totalReviews: { $gte: 1 }, isDeleted: false })
        .select("productId name rating totalReviews")
        .sort({ rating: 1, totalReviews: -1 })
        .limit(5)
        .lean(),
      // Stores with highest ratings
      Store.find({ totalReviews: { $gte: 1 }, isDeleted: false })
        .select("storeId storeName rating totalReviews")
        .sort({ rating: -1, totalReviews: -1 })
        .limit(5)
        .lean(),
      // Marketplace Health
      Promise.all([
        Store.countDocuments({ status: "approved", isActive: true, isDeleted: { $ne: true } }),
        Store.countDocuments({ isActive: false, isDeleted: { $ne: true } }),
        Store.countDocuments({ status: "suspended", isDeleted: { $ne: true } }),
        User.countDocuments({ isActive: true, isDeleted: { $ne: true } }),
        User.countDocuments({ isSuspended: true, isDeleted: { $ne: true } }),
        Order.countDocuments({ createdAt: { $gte: startOfToday } }),
        Order.countDocuments({ status: ORDER_STATUS.FAILED, createdAt: { $gte: startOfToday } }),
      ]),
      // Activity Feed (Latest events across entities)
      Promise.all([
        User.find().select("userId name role createdAt").sort({ createdAt: -1 }).limit(5).lean(),
        Store.find().select("storeId storeName status createdAt").sort({ createdAt: -1 }).limit(5).lean(),
        Product.find().select("productId name createdAt").sort({ createdAt: -1 }).limit(5).lean(),
        Order.find({ status: { $ne: ORDER_STATUS.DRAFT } })
          .select("orderId invoiceNumber grandTotal status createdAt")
          .sort({ createdAt: -1 })
          .limit(5)
          .lean(),
      ]),
    ]);

    // Name Lookups for stores, categories, and products
    const storeIdsToLookup = [
      ...new Set([
        ...revenueByStoreAgg.map((s) => s._id),
        ...topStoresByOrdersAgg.map((s) => s._id),
        ...lowStockAlertsAgg.map((p) => p.storeId),
      ]),
    ].filter(Boolean);

    const categoryIdsToLookup = [
      ...new Set([
        ...revenueByCategoryAgg.map((c) => c._id),
        ...stockByCategoryAgg.map((c) => c._id),
      ]),
    ].filter(Boolean);

    const [lookedUpStores, lookedUpCategories] = await Promise.all([
      Store.find({ storeId: { $in: storeIdsToLookup } }).select("storeId storeName").lean(),
      Category.find({ categoryId: { $in: categoryIdsToLookup } }).select("categoryId name").lean(),
    ]);

    const storeNameMap = new Map(lookedUpStores.map((s) => [s.storeId, s.storeName]));
    const categoryNameMap = new Map(lookedUpCategories.map((c) => [c.categoryId, c.name]));

    // Format Base Data
    const uData = userData[0] ?? { kpi: [], trends: [] };
    const sData = storeData[0] ?? { kpi: [], trends: [], breakdowns: [] };
    const pData = productData[0] ?? { kpi: [], breakdowns: [] };
    const oData = orderData[0] ?? { kpi: [], trends: [], revenue: [], breakdowns: [] };

    // Format Revenue by Category
    const revenueByCategory = revenueByCategoryAgg.map((item) => ({
      categoryId: item._id ?? "uncategorized",
      categoryName: categoryNameMap.get(item._id) ?? "Uncategorized",
      revenue: roundCurrency(item.revenue),
    }));

    // Format Revenue by Store
    const revenueByStore = revenueByStoreAgg.map((item) => ({
      storeId: item._id ?? "unknown",
      storeName: storeNameMap.get(item._id) ?? "Unknown Store",
      revenue: roundCurrency(item.revenue),
      orders: item.orders,
    }));

    // Format Revenue by Payment Method
    const revenueByPaymentMethod = revenueByPaymentMethodAgg.map((item) => ({
      method: (item._id || "online").toUpperCase(),
      count: item.count,
      revenue: roundCurrency(item.revenue),
    }));

    // Format Order Status
    const ordersByStatus = mapBreakdown(oData.breakdowns);
    const completedOrdersCount = ordersByStatus.find((s) => s.status === ORDER_STATUS.DELIVERED)?.count || 0;
    const cancelledOrdersCount = ordersByStatus.find((s) => s.status === ORDER_STATUS.CANCELLED)?.count || 0;
    const pendingOrdersCount = ordersByStatus
      .filter((s) => [ORDER_STATUS.PENDING_PAYMENT, ORDER_STATUS.CONFIRMED, ORDER_STATUS.PROCESSING].includes(s.status as any))
      .reduce((sum, s) => sum + s.count, 0);

    const rangeRevenueTotal = oData.revenue.reduce((sum: number, r: { value: number }) => sum + r.value, 0);
    const rangeOrdersCount = oData.kpi[0]?.value ?? 0;
    const avgOrderValue = rangeOrdersCount > 0 ? roundCurrency(rangeRevenueTotal / rangeOrdersCount) : 0;

    // Format Customer stats
    const verifiedCustomersCount = await User.countDocuments({ role: "customer", isVerifiedCustomer: true });
    const repeatBuyersInfo = repeatBuyersAgg[0] || { totalBuyers: 0, repeatBuyers: 0 };
    const repeatRate =
      repeatBuyersInfo.totalBuyers > 0
        ? Number(((repeatBuyersInfo.repeatBuyers / repeatBuyersInfo.totalBuyers) * 100).toFixed(1))
        : 0;

    // Format Seller badges
    const storeBadgeMap = new Map(storeBadgeAgg.map((b) => [b._id, b.count]));

    // Format Coupon KPIs
    const [couponCount, offerCount, bannerOfferCount, couponSavedResult] = couponStatsAgg;
    const totalCouponSaved = couponSavedResult[0]?.totalSaved ?? 0;

    // Format Review KPIs
    const [pendingRev, hiddenRev, reportedRev, ratingDistAgg, avgRevAgg, revTrendAgg] = reviewStatsAgg;
    const revDistMap: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    ratingDistAgg.forEach((item: { _id: number; count: number }) => {
      if (item._id >= 1 && item._id <= 5) revDistMap[item._id] = item.count;
    });
    const avgRatingVal = avgRevAgg[0]?.avg ? Number(avgRevAgg[0].avg.toFixed(1)) : 0;

    // Format Marketplace Health
    const [
      activeStoresHealth,
      inactiveStoresHealth,
      suspendedStoresHealth,
      activeUsersHealth,
      suspendedUsersHealth,
      ordersTodayHealth,
      failedOrdersTodayHealth,
    ] = marketplaceHealthAgg;

    let healthScore = 100;
    if (suspendedStoresHealth > 0) healthScore -= Math.min(20, suspendedStoresHealth * 5);
    if (suspendedUsersHealth > 0) healthScore -= Math.min(15, suspendedUsersHealth * 2);
    if (failedOrdersTodayHealth > 0) healthScore -= Math.min(25, failedOrdersTodayHealth * 5);
    healthScore = Math.max(0, Math.min(100, healthScore));

    const healthStatus: MarketplaceHealthData["status"] =
      healthScore >= 80 ? "healthy" : healthScore >= 50 ? "attention" : "critical";

    // Format Activity Feed
    const [latestUsers, latestStores, latestProducts, latestOrders] = activityFeedAgg;
    const activityFeed: ActivityFeedItem[] = [
      ...latestUsers.map((u) => ({
        id: `user-${u.userId}`,
        type: "user_joined" as const,
        title: "New User Registered",
        description: `${u.name} registered as ${u.role}`,
        timestamp: new Date(u.createdAt).toISOString(),
      })),
      ...latestStores.map((s) => ({
        id: `store-${s.storeId}`,
        type: "store_approved" as const,
        title: `Store Updated (${s.status})`,
        description: `${s.storeName} status: ${s.status}`,
        timestamp: new Date(s.createdAt).toISOString(),
      })),
      ...latestProducts.map((p) => ({
        id: `prod-${p.productId}`,
        type: "product_added" as const,
        title: "New Product Added",
        description: p.name,
        timestamp: new Date(p.createdAt).toISOString(),
      })),
      ...latestOrders.map((o) => ({
        id: `order-${o.orderId}`,
        type: "order_completed" as const,
        title: `Order Placed (${o.status})`,
        description: `${o.invoiceNumber || o.orderId} for ₹${o.grandTotal}`,
        timestamp: new Date(o.createdAt).toISOString(),
      })),
    ].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()).slice(0, 20);

    // Format Top Lists
    const topLists: TopListsData = {
      topProducts: topProductsAgg.map((p) => ({
        id: p._id,
        name: p.name,
        value: roundCurrency(p.revenue),
        secondary: `${p.quantity} units sold`,
      })),
      topStores: revenueByStore.map((s) => ({
        id: s.storeId,
        name: s.storeName,
        value: s.revenue,
        secondary: `${s.orders} orders`,
      })),
      topCustomers: (customerLocationAgg[0]?.cities || []).slice(0, 5).map((c: any) => ({
        id: c._id,
        name: c._id,
        value: c.count,
        secondary: "registered users",
      })),
      topCategories: revenueByCategory.map((c) => ({
        id: c.categoryId,
        name: c.categoryName,
        value: c.revenue,
        secondary: "category revenue",
      })),
      topCoupons: mostUsedCouponsAgg.map((cp) => ({
        id: cp._id.toString(),
        name: cp.code,
        value: cp.usageCount,
        secondary: `${cp.discountValue}${cp.discountType === "percentage" ? "%" : "₹"} discount`,
      })),
      topCities: ordersByCityAgg.map((ct) => ({
        id: ct._id,
        name: ct._id,
        value: roundCurrency(ct.revenue),
        secondary: `${ct.count} orders`,
      })),
    };

    return {
      range: {
        from: range.from.toISOString(),
        to: range.to.toISOString(),
        timezone: range.timezone,
      },
      overviewKpis: {
        marketplace: {
          totalRevenue: roundCurrency(lifetimeRevenueAgg[0]?.total ?? 0),
          totalOrders: totalOrdersLifetime,
          totalUsers: totalUsersLifetime,
          totalStores: totalStoresLifetime,
        },
        business: {
          totalProducts: totalProductsLifetime,
          activeProducts: activeProductsLifetime,
          couponsUsed: couponsUsedLifetime[0]?.total ?? 0,
          reviewsSubmitted: reviewsSubmittedLifetime,
        },
        growth: {
          revenueToday: roundCurrency(revenueTodayAgg[0]?.total ?? 0),
          revenueThisWeek: roundCurrency(revenueWeekAgg[0]?.total ?? 0),
          revenueThisMonth: roundCurrency(revenueMonthAgg[0]?.total ?? 0),
          newCustomersToday,
        },
      },
      kpis: {
        customers: uData.kpi[0]?.value ?? 0,
        stores: sData.kpi[0]?.value ?? 0,
        products: pData.kpi[0]?.value ?? 0,
        orders: rangeOrdersCount,
        revenue: roundCurrency(rangeRevenueTotal),
      },
      trends: {
        orders: fillDailyTrend(mapTrend(oData.trends), range.from, range.to, range.timezone),
        revenue: fillDailyTrend(
          oData.revenue.map((point: { _id: string; value: number }) => ({
            date: point._id,
            value: roundCurrency(point.value),
          })),
          range.from,
          range.to,
          range.timezone
        ),
        newCustomers: fillDailyTrend(mapTrend(uData.trends), range.from, range.to, range.timezone),
        newStores: fillDailyTrend(mapTrend(sData.trends), range.from, range.to, range.timezone),
      },
      breakdowns: {
        ordersByStatus,
        storesByStatus: mapBreakdown(sData.breakdowns),
        productsByStatus: mapBreakdown(pData.breakdowns),
      },
      revenue: {
        trend: fillDailyTrend(
          oData.revenue.map((point: { _id: string; value: number }) => ({
            date: point._id,
            value: roundCurrency(point.value),
          })),
          range.from,
          range.to,
          range.timezone
        ),
        byStore: revenueByStore,
        byCategory: revenueByCategory,
        byPaymentMethod: revenueByPaymentMethod,
      },
      orderAnalytics: {
        kpis: {
          totalOrders: rangeOrdersCount,
          completedOrders: completedOrdersCount,
          cancelledOrders: cancelledOrdersCount,
          pendingOrders: pendingOrdersCount,
          deliveredOrders: completedOrdersCount,
          avgOrderValue,
        },
        trend: fillDailyTrend(mapTrend(oData.trends), range.from, range.to, range.timezone),
        byStatus: ordersByStatus,
        byCity: ordersByCityAgg.map((c) => ({
          city: c._id,
          count: c.count,
          revenue: roundCurrency(c.revenue),
        })),
        topProducts: topProductsAgg.map((p) => ({
          productId: p._id,
          name: p.name,
          quantity: p.quantity,
          revenue: roundCurrency(p.revenue),
        })),
        topStores: topStoresByOrdersAgg.map((s) => ({
          storeId: s._id,
          storeName: storeNameMap.get(s._id) ?? "Store",
          orders: s.orders,
          revenue: roundCurrency(s.revenue),
        })),
      },
      customerAnalytics: {
        kpis: {
          totalCustomers: totalUsersLifetime,
          verifiedCustomers: verifiedCustomersCount,
          newCustomersInRange: uData.kpi[0]?.value ?? 0,
          returningCustomers: repeatBuyersInfo.repeatBuyers,
          repeatPurchaseRate: repeatRate,
        },
        trend: fillDailyTrend(mapTrend(uData.trends), range.from, range.to, range.timezone),
        topCities: (customerLocationAgg[0]?.cities || []).map((c: any) => ({ city: c._id, count: c.count })),
        topDistricts: (customerLocationAgg[0]?.districts || []).map((d: any) => ({
          district: d._id,
          count: d.count,
        })),
      },
      sellerAnalytics: {
        kpis: {
          totalSellers: totalStoresLifetime,
          activeSellers: activeStoresHealth,
          pendingSellers: sData.breakdowns.find((b: any) => b._id === "pending")?.count || 0,
          royalStores: storeBadgeMap.get("royal") || 0,
          verifiedStores: storeBadgeMap.get("verified") || 0,
        },
        trend: fillDailyTrend(mapTrend(sData.trends), range.from, range.to, range.timezone),
        topSellersByRevenue: revenueByStore.map((s) => ({
          storeId: s.storeId,
          storeName: s.storeName,
          revenue: s.revenue,
        })),
        topSellersByOrders: topStoresByOrdersAgg.map((s) => ({
          storeId: s._id,
          storeName: storeNameMap.get(s._id) ?? "Store",
          orders: s.orders,
        })),
      },
      productInventory: {
        kpis: {
          totalProducts: totalProductsLifetime,
          activeProducts: activeProductsLifetime,
          outOfStock: await Product.countDocuments({ quantity: 0, isDeleted: false }),
          lowStock: await Product.countDocuments({ quantity: { $gt: 0, $lte: 10 }, isDeleted: false }),
          featuredProducts: await Product.countDocuments({ isFeatured: true, isDeleted: false }),
        },
        lowStockAlerts: lowStockAlertsAgg.map((p) => ({
          productId: p.productId,
          name: p.name,
          sku: p.sku || "",
          storeName: storeNameMap.get(p.storeId) || "Store",
          quantity: p.quantity,
        })),
        stockByCategory: stockByCategoryAgg.map((c) => ({
          categoryName: categoryNameMap.get(c._id) || "Category",
          totalStock: c.totalStock,
          productCount: c.productCount,
        })),
      },
      couponAnalytics: {
        kpis: {
          couponsCreated: couponCount,
          couponsRedeemed: couponsUsedLifetime[0]?.total ?? 0,
          activeOffers: offerCount,
          homepageOffers: bannerOfferCount,
          revenueSaved: roundCurrency(totalCouponSaved),
        },
        mostUsedCoupons: mostUsedCouponsAgg.map((c) => ({
          code: c.code,
          usageCount: c.usageCount,
          discountValue: c.discountValue,
          discountType: c.discountType,
        })),
      },
      reviewAnalytics: {
        kpis: {
          averageRating: avgRatingVal,
          totalReviews: reviewsSubmittedLifetime,
          pendingReviews: pendingRev,
          hiddenReviews: hiddenRev,
          reportedReviews: reportedRev,
        },
        distribution: revDistMap as { 1: number; 2: number; 3: number; 4: number; 5: number },
        trend: fillDailyTrend(
          mapTrend(revTrendAgg.map((p: any) => ({ _id: p._id, value: Number((p.value || 0).toFixed(1)) }))),
          range.from,
          range.to,
          range.timezone
        ),
        topRatedProducts: topRatedProductsAgg.map((p) => ({
          productId: p.productId,
          name: p.name,
          rating: p.rating,
          totalReviews: p.totalReviews,
        })),
        lowestRatedProducts: lowestRatedProductsAgg.map((p) => ({
          productId: p.productId,
          name: p.name,
          rating: p.rating,
          totalReviews: p.totalReviews,
        })),
        topRatedStores: topRatedStoresAgg.map((s) => ({
          storeId: s.storeId,
          storeName: s.storeName,
          rating: s.rating,
          totalReviews: s.totalReviews,
        })),
      },
      marketplaceHealth: {
        activeStores: activeStoresHealth,
        inactiveStores: inactiveStoresHealth,
        suspendedStores: suspendedStoresHealth,
        activeUsers: activeUsersHealth,
        suspendedUsers: suspendedUsersHealth,
        ordersToday: ordersTodayHealth,
        failedOrdersToday: failedOrdersTodayHealth,
        healthScore,
        status: healthStatus,
      },
      activityFeed,
      topLists,
    };
  }

  static async exportAnalyticsCSV(query: AnalyticsExportQuery): Promise<string> {
    const now = new Date();
    const defaultFrom = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    const from = parseBoundary(query.from, "from", defaultFrom);
    const to = parseBoundary(query.to, "to", now);

    switch (query.type) {
      case "revenue": {
        const orders = await Order.find({
          paidAt: { $gte: from, $lt: to },
          paymentStatus: PAYMENT_STATUS.PAID,
        })
          .select("orderId invoiceNumber grandTotal paymentMethod paidAt")
          .sort({ paidAt: -1 })
          .lean();

        const headers = ["Order ID", "Invoice Number", "Grand Total (INR)", "Payment Method", "Paid At"];
        const rows = orders.map((o) => [
          o.orderId,
          o.invoiceNumber || "",
          o.grandTotal,
          o.paymentMethod || "online",
          o.paidAt ? new Date(o.paidAt).toISOString() : "",
        ]);
        return [headers.join(","), ...rows.map((r) => r.map((c) => `"${c}"`).join(","))].join("\n");
      }
      case "orders": {
        const orders = await Order.find({
          createdAt: { $gte: from, $lt: to },
        })
          .select("orderId invoiceNumber status grandTotal paymentStatus paymentMethod createdAt")
          .sort({ createdAt: -1 })
          .lean();

        const headers = ["Order ID", "Invoice Number", "Status", "Grand Total (INR)", "Payment Status", "Payment Method", "Created At"];
        const rows = orders.map((o) => [
          o.orderId,
          o.invoiceNumber || "",
          o.status,
          o.grandTotal,
          o.paymentStatus,
          o.paymentMethod || "online",
          new Date(o.createdAt).toISOString(),
        ]);
        return [headers.join(","), ...rows.map((r) => r.map((c) => `"${c}"`).join(","))].join("\n");
      }
      case "users": {
        const users = await User.find({
          createdAt: { $gte: from, $lt: to },
        })
          .select("userId name email mobile role isVerifiedCustomer isActive isSuspended createdAt")
          .sort({ createdAt: -1 })
          .lean();

        const headers = ["User ID", "Name", "Email", "Mobile", "Role", "Verified Customer", "Active", "Suspended", "Joined At"];
        const rows = users.map((u) => [
          u.userId,
          u.name,
          u.email,
          u.mobile,
          u.role,
          Boolean(u.isVerifiedCustomer),
          Boolean(u.isActive),
          Boolean(u.isSuspended),
          new Date(u.createdAt).toISOString(),
        ]);
        return [headers.join(","), ...rows.map((r) => r.map((c) => `"${c}"`).join(","))].join("\n");
      }
      case "reviews": {
        const reviews = await Review.find({
          createdAt: { $gte: from, $lt: to },
        })
          .select("reviewId productId rating title status isVerifiedPurchase reportCount createdAt")
          .sort({ createdAt: -1 })
          .lean();

        const headers = ["Review ID", "Product ID", "Rating", "Title", "Status", "Verified Purchase", "Report Count", "Created At"];
        const rows = reviews.map((r) => [
          r.reviewId,
          r.productId,
          r.rating,
          r.title || "",
          r.status,
          Boolean(r.isVerifiedPurchase),
          r.reportCount || 0,
          new Date(r.createdAt).toISOString(),
        ]);
        return [headers.join(","), ...rows.map((r) => r.map((c) => `"${c}"`).join(","))].join("\n");
      }
      case "coupons": {
        const coupons = await Coupon.find()
          .select("code discountType discountValue usageCount isActive startsAt endsAt")
          .sort({ usageCount: -1 })
          .lean();

        const headers = ["Coupon Code", "Discount Type", "Discount Value", "Times Used", "Is Active", "Starts At", "Ends At"];
        const rows = coupons.map((c) => [
          c.code,
          c.discountType,
          c.discountValue,
          c.usageCount,
          Boolean(c.isActive),
          c.startsAt ? new Date(c.startsAt).toISOString() : "",
          c.endsAt ? new Date(c.endsAt).toISOString() : "",
        ]);
        return [headers.join(","), ...rows.map((r) => r.map((c) => `"${c}"`).join(","))].join("\n");
      }
    }
  }
}

