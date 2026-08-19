import { AppError } from "../errors/AppError";
import { ORDER_STATUS, PAYMENT_STATUS, Order } from "../models/order.model";
import { Product } from "../models/product.model";
import { Store } from "../models/store.model";
import { User } from "../models/user.model";
import type { AnalyticsBreakdownPoint, AnalyticsOverview, AnalyticsTrendPoint } from "../types/analytics";
import type { AdminAnalyticsOverviewQuery } from "../validators/analytics.validator";

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

function dateGroup(date: string, timezone: string) {
  return {
    $dateToString: {
      format: "%Y-%m-%d",
      date,
      timezone,
    },
  };
}

function roundCurrency(value: number) {
  return Number(value.toFixed(2));
}

export class AnalyticsService {
  static async getAdminOverview(query: AdminAnalyticsOverviewQuery): Promise<AnalyticsOverview> {
    const now = new Date();
    const defaultFrom = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    const from = parseBoundary(query.from, "from", defaultFrom);
    const to = parseBoundary(query.to, "to", now);

    // Analytics ranges use an inclusive from boundary and an exclusive to boundary: [from, to).
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

    const [users, stores, products, orders] = await Promise.all([
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
    ]);

    const userData = users[0] ?? { kpi: [], trends: [] };
    const storeData = stores[0] ?? { kpi: [], trends: [], breakdowns: [] };
    const productData = products[0] ?? { kpi: [], breakdowns: [] };
    const orderData = orders[0] ?? { kpi: [], trends: [], revenue: [], breakdowns: [] };

    return {
      range: {
        from: range.from.toISOString(),
        to: range.to.toISOString(),
        timezone: range.timezone,
      },
      kpis: {
        customers: userData.kpi[0]?.value ?? 0,
        stores: storeData.kpi[0]?.value ?? 0,
        products: productData.kpi[0]?.value ?? 0,
        orders: orderData.kpi[0]?.value ?? 0,
        revenue: roundCurrency(orderData.revenue.reduce((total: number, point: { value: number }) => total + point.value, 0)),
      },
      trends: {
        orders: fillDailyTrend(mapTrend(orderData.trends), range.from, range.to, range.timezone),
        revenue: fillDailyTrend(orderData.revenue.map((point: { _id: string; value: number }) => ({ date: point._id, value: roundCurrency(point.value) })), range.from, range.to, range.timezone),
        newCustomers: fillDailyTrend(mapTrend(userData.trends), range.from, range.to, range.timezone),
        newStores: fillDailyTrend(mapTrend(storeData.trends), range.from, range.to, range.timezone),
      },
      breakdowns: {
        ordersByStatus: mapBreakdown(orderData.breakdowns),
        storesByStatus: mapBreakdown(storeData.breakdowns),
        productsByStatus: mapBreakdown(productData.breakdowns),
      },
    };
  }
}
