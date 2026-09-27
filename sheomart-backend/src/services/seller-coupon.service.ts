import { AppError } from "../errors/AppError";
import { STORE_STATUS } from "../constants/store";
import { Category } from "../models/category.model";
import { Coupon, ICoupon } from "../models/coupon.model";
import { CouponUsage } from "../models/couponUsage.model";
import { Order, ORDER_STATUS } from "../models/order.model";
import { Product } from "../models/product.model";
import { Store } from "../models/store.model";
import { User } from "../models/user.model";

export interface SellerCouponFilters {
  page?: number | string;
  limit?: number | string;
  search?: string;
  status?: string;
  discountType?: string;
  sortBy?: string;
}

export interface CreateSellerCouponInput {
  title: string;
  description?: string;
  code: string;
  discountType: "flat" | "percentage";
  discountValue: number;
  minimumCartValue?: number;
  maximumDiscount?: number | null;
  usageLimit?: number | null;
  oncePerCustomer?: boolean;
  perUserLimit?: number;
  newUsersOnly?: boolean;
  verifiedOnly?: boolean;
  applicableScope?: "store" | "category" | "product";
  categoryId?: string | null;
  productId?: string | null;
  categoryIds?: string[];
  productIds?: string[];
  isFeatured?: boolean;
  startsAt: Date;
  endsAt: Date;
  isActive?: boolean;
}

export interface UpdateSellerCouponInput extends Partial<CreateSellerCouponInput> {}

const escapeRegex = (value: string): string => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

export class SellerCouponService {
  private static async getStoreForOwner(ownerId: string) {
    const store = await Store.findOne({
      ownerId,
      status: STORE_STATUS.APPROVED,
    })
      .select("storeId storeName")
      .lean();

    if (!store) {
      throw new AppError("Only approved store owners can manage coupons", 403);
    }

    return store;
  }

  private static async enrichSellerCoupons(coupons: ICoupon[]) {
    const categoryIds = [
      ...new Set(
        coupons
          .flatMap((c) => [c.categoryId, ...(c.categoryIds || [])])
          .filter(Boolean) as string[]
      ),
    ];
    const productIds = [
      ...new Set(
        coupons
          .flatMap((c) => [c.productId, ...(c.productIds || [])])
          .filter(Boolean) as string[]
      ),
    ];

    const [categories, products] = await Promise.all([
      categoryIds.length
        ? Category.find({ categoryId: { $in: categoryIds } })
            .select("categoryId name")
            .lean()
        : [],
      productIds.length
        ? Product.find({ productId: { $in: productIds } })
            .select("productId name")
            .lean()
        : [],
    ]);

    const categoryMap = new Map(categories.map((c) => [c.categoryId, c.name]));
    const productMap = new Map(products.map((p) => [p.productId, p.name]));

    return coupons.map((c) => {
      const obj = typeof c.toObject === "function" ? c.toObject({ virtuals: true }) : { ...c };
      return {
        ...obj,
        categoryName: c.categoryId ? categoryMap.get(c.categoryId) ?? null : null,
        productName: c.productId ? productMap.get(c.productId) ?? null : null,
        targetCategories: (c.categoryIds || []).map((id) => ({
          id,
          name: categoryMap.get(id) || id,
        })),
        targetProducts: (c.productIds || []).map((id) => ({
          id,
          name: productMap.get(id) || id,
        })),
      };
    });
  }

  static async listCoupons(ownerId: string, filters: SellerCouponFilters) {
    const store = await this.getStoreForOwner(ownerId);
    const now = new Date();

    const query: Record<string, unknown> = {
      storeId: store.storeId,
      isDeleted: { $ne: true },
    };

    if (filters.search && filters.search.trim()) {
      const regex = new RegExp(escapeRegex(filters.search.trim()), "i");
      query.$or = [{ title: regex }, { code: regex }];
    }

    if (filters.discountType) {
      query.discountType = filters.discountType;
    }

    if (filters.status && filters.status !== "all") {
      if (filters.status === "disabled") {
        query.isActive = false;
      } else if (filters.status === "scheduled") {
        query.isActive = true;
        query.startsAt = { $gt: now };
      } else if (filters.status === "expired") {
        query.isActive = true;
        query.endsAt = { $lt: now };
      } else if (filters.status === "active") {
        query.isActive = true;
        query.startsAt = { $lte: now };
        query.endsAt = { $gte: now };
      }
    }

    const sortOrder: Record<string, 1 | -1> =
      filters.sortBy === "expiry_asc"
        ? { endsAt: 1 }
        : filters.sortBy === "expiry_desc"
        ? { endsAt: -1 }
        : filters.sortBy === "redemptions"
        ? { usageCount: -1 }
        : filters.sortBy === "discount_desc"
        ? { discountValue: -1 }
        : { createdAt: -1 };

    const page = Math.max(1, Number(filters.page) || 1);
    const limit = Math.max(1, Math.min(100, Number(filters.limit) || 10));

    const [coupons, total] = await Promise.all([
      Coupon.find(query)
        .sort(sortOrder)
        .skip((page - 1) * limit)
        .limit(limit),
      Coupon.countDocuments(query),
    ]);

    const enrichedCoupons = await this.enrichSellerCoupons(coupons);

    // Live Summary Counts for the Store
    const allStoreCoupons = await Coupon.find({
      storeId: store.storeId,
      isDeleted: { $ne: true },
    }).lean();

    let activeCount = 0;
    let scheduledCount = 0;
    let expiredCount = 0;
    let totalRedeemed = 0;

    allStoreCoupons.forEach((c) => {
      totalRedeemed += c.usageCount || 0;
      if (!c.isActive) return;
      if (now < c.startsAt) scheduledCount++;
      else if (now > c.endsAt || (c.usageLimit !== null && c.usageCount >= c.usageLimit)) expiredCount++;
      else activeCount++;
    });

    // Revenue generated through store coupons
    const storeCouponCodes = allStoreCoupons.map((c) => c.code);
    const revenueAgg = await Order.aggregate([
      {
        $match: {
          storeId: store.storeId,
          couponCode: { $in: storeCouponCodes },
          status: { $nin: ["CANCELLED", "FAILED", ORDER_STATUS.DRAFT] },
        },
      },
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: "$grandTotal" },
          totalDiscount: { $sum: "$couponDiscount" },
        },
      },
    ]);

    const revenueGenerated = revenueAgg[0]?.totalRevenue || 0;

    return {
      coupons: enrichedCoupons,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
      summary: {
        totalCoupons: allStoreCoupons.length,
        activeCoupons: activeCount,
        scheduledCoupons: scheduledCount,
        expiredCoupons: expiredCount,
        couponsRedeemed: totalRedeemed,
        revenueGenerated,
      },
    };
  }

  static async getCouponSummary(ownerId: string) {
    const listResult = await this.listCoupons(ownerId, { page: 1, limit: 1 });
    return listResult.summary;
  }

  static async getCouponAnalytics(ownerId: string) {
    const store = await this.getStoreForOwner(ownerId);
    const storeCoupons = await Coupon.find({
      storeId: store.storeId,
      isDeleted: { $ne: true },
    }).lean();

    const couponCodes = storeCoupons.map((c) => c.code);
    const couponMap = new Map(storeCoupons.map((c) => [c.code, c]));

    // Aggregate orders using seller's coupons
    const orderAgg = await Order.aggregate([
      {
        $match: {
          storeId: store.storeId,
          couponCode: { $in: couponCodes },
          status: { $nin: ["CANCELLED", "FAILED", ORDER_STATUS.DRAFT] },
        },
      },
      {
        $group: {
          _id: "$couponCode",
          redemptions: { $sum: 1 },
          totalRevenue: { $sum: "$grandTotal" },
          totalDiscount: { $sum: "$couponDiscount" },
          avgBasketValue: { $avg: "$grandTotal" },
        },
      },
      { $sort: { redemptions: -1 } },
    ]);

    const totalRedemptions = orderAgg.reduce((sum, o) => sum + o.redemptions, 0);
    const totalDiscountGiven = orderAgg.reduce((sum, o) => sum + o.totalDiscount, 0);
    const totalRevenueGenerated = orderAgg.reduce((sum, o) => sum + o.totalRevenue, 0);
    const averageBasketValue =
      totalRedemptions > 0 ? Math.round(totalRevenueGenerated / totalRedemptions) : 0;

    const topOrderRecord = orderAgg[0];
    const topCouponDoc = topOrderRecord ? couponMap.get(topOrderRecord._id) : null;
    const topCoupon = topOrderRecord
      ? {
          code: topOrderRecord._id,
          title: topCouponDoc?.title || topOrderRecord._id,
          redemptions: topOrderRecord.redemptions,
          revenue: topOrderRecord.totalRevenue,
        }
      : null;

    // Monthly redemption trend (last 6 months)
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 5);
    sixMonthsAgo.setDate(1);
    sixMonthsAgo.setHours(0, 0, 0, 0);

    const monthlyTrendAgg = await Order.aggregate([
      {
        $match: {
          storeId: store.storeId,
          couponCode: { $in: couponCodes },
          createdAt: { $gte: sixMonthsAgo },
          status: { $nin: ["CANCELLED", "FAILED", ORDER_STATUS.DRAFT] },
        },
      },
      {
        $group: {
          _id: {
            year: { $year: "$createdAt" },
            month: { $month: "$createdAt" },
          },
          redemptions: { $sum: 1 },
          revenue: { $sum: "$grandTotal" },
          discount: { $sum: "$couponDiscount" },
        },
      },
      { $sort: { "_id.year": 1, "_id.month": 1 } },
    ]);

    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const redemptionTrend = monthlyTrendAgg.map((m) => ({
      month: `${monthNames[m._id.month - 1]} ${m._id.year}`,
      redemptions: m.redemptions,
      revenue: m.revenue,
      discount: m.discount,
    }));

    // Top 5 Coupons Leaderboard
    const topCoupons = orderAgg.slice(0, 5).map((o) => {
      const doc = couponMap.get(o._id);
      return {
        code: o._id,
        title: doc?.title || o._id,
        discountType: doc?.discountType || "percentage",
        discountValue: doc?.discountValue || 0,
        redemptions: o.redemptions,
        totalRevenue: o.totalRevenue,
        totalDiscount: o.totalDiscount,
      };
    });

    return {
      cards: {
        totalRedemptions,
        totalDiscountGiven,
        revenueGenerated: totalRevenueGenerated,
        averageBasketValue,
        topCoupon,
      },
      redemptionTrend,
      topCoupons,
    };
  }

  static async getRedemptionHistory(
    ownerId: string,
    filters: {
      page?: number | string;
      limit?: number | string;
      couponCode?: string;
      search?: string;
    }
  ) {
    const store = await this.getStoreForOwner(ownerId);
    const storeCoupons = await Coupon.find({
      storeId: store.storeId,
      isDeleted: { $ne: true },
    }).lean();

    const couponCodes = storeCoupons.map((c) => c.code);

    const query: Record<string, unknown> = {
      storeId: store.storeId,
      couponCode: filters.couponCode ? filters.couponCode.toUpperCase() : { $in: couponCodes },
      status: { $ne: ORDER_STATUS.DRAFT },
    };

    const page = Math.max(1, Number(filters.page) || 1);
    const limit = Math.max(1, Math.min(100, Number(filters.limit) || 10));

    const [orders, total] = await Promise.all([
      Order.find(query)
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .select(
          "orderId userId couponCode couponDiscount grandTotal status paymentStatus createdAt shippingAddress"
        )
        .lean(),
      Order.countDocuments(query),
    ]);

    const userIds = [...new Set(orders.map((o) => o.userId).filter(Boolean))];
    const users = await User.find({ userId: { $in: userIds } })
      .select("userId name email mobile isVerifiedCustomer emailVerified phoneVerified")
      .lean();
    const userMap = new Map(users.map((u) => [u.userId, u]));

    const redemptions = orders.map((order) => {
      const user = userMap.get(order.userId);
      return {
        orderId: order.orderId,
        couponCode: order.couponCode,
        discountGiven: order.couponDiscount || 0,
        orderAmount: order.grandTotal || 0,
        orderStatus: order.status,
        paymentStatus: order.paymentStatus,
        date: order.createdAt,
        customer: {
          customerId: order.userId,
          name: user?.name || order.shippingAddress?.fullName || "Customer",
          email: user?.email || "",
          mobile: user?.mobile || order.shippingAddress?.mobile || "",
          isVerified: Boolean(user?.isVerifiedCustomer || user?.emailVerified || user?.phoneVerified),
        },
      };
    });

    return {
      redemptions,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  static async getCoupon(ownerId: string, couponId: string) {
    const store = await this.getStoreForOwner(ownerId);
    const coupon = await Coupon.findOne({
      couponId,
      storeId: store.storeId,
      isDeleted: { $ne: true },
    });

    if (!coupon) {
      throw new AppError("Coupon not found or does not belong to your store", 404);
    }

    const [enriched] = await this.enrichSellerCoupons([coupon]);

    // Revenue generated specifically by this coupon
    const revAgg = await Order.aggregate([
      {
        $match: {
          storeId: store.storeId,
          couponCode: coupon.code,
          status: { $nin: ["CANCELLED", "FAILED", ORDER_STATUS.DRAFT] },
        },
      },
      {
        $group: {
          _id: null,
          revenue: { $sum: "$grandTotal" },
          discountGiven: { $sum: "$couponDiscount" },
          orderCount: { $sum: 1 },
        },
      },
    ]);

    const revenueGenerated = revAgg[0]?.revenue || 0;
    const discountGiven = revAgg[0]?.discountGiven || 0;
    const ordersCount = revAgg[0]?.orderCount || 0;
    const redemptionPercentage =
      coupon.usageLimit && coupon.usageLimit > 0
        ? Math.round(((coupon.usageCount || 0) / coupon.usageLimit) * 100)
        : null;

    return {
      ...enriched,
      storeName: store.storeName,
      revenueGenerated,
      discountGiven,
      ordersCount,
      redemptionPercentage,
    };
  }

  static async createCoupon(ownerId: string, data: CreateSellerCouponInput) {
    const store = await this.getStoreForOwner(ownerId);
    const code = data.code.trim().toUpperCase();

    // Check code uniqueness across non-deleted coupons
    const existing = await Coupon.findOne({ code, isDeleted: { $ne: true } });
    if (existing) {
      throw new AppError(`Coupon code "${code}" already exists in the system`, 409);
    }

    if (data.startsAt >= data.endsAt) {
      throw new AppError("Coupon start date must be before end date", 400);
    }

    if (data.discountType === "percentage" && data.discountValue > 100) {
      throw new AppError("Percentage discount cannot exceed 100%", 400);
    }

    let scope: "store" | "category" | "product" = "store";
    if (data.applicableScope) {
      scope = data.applicableScope;
    } else if (data.productIds && data.productIds.length > 0) {
      scope = "product";
    } else if (data.categoryIds && data.categoryIds.length > 0) {
      scope = "category";
    }

    const coupon = await Coupon.create({
      ...data,
      code,
      storeId: store.storeId,
      applicableScope: scope,
      createdBy: ownerId,
      updatedBy: ownerId,
      usageCount: 0,
      isDeleted: false,
    });

    const [enriched] = await this.enrichSellerCoupons([coupon]);
    return enriched;
  }

  static async updateCoupon(ownerId: string, couponId: string, data: UpdateSellerCouponInput) {
    const store = await this.getStoreForOwner(ownerId);
    const coupon = await Coupon.findOne({ couponId, storeId: store.storeId, isDeleted: { $ne: true } });
    if (!coupon) {
      throw new AppError("Coupon not found or does not belong to your store", 404);
    }

    if (data.code) {
      const code = data.code.trim().toUpperCase();
      if (code !== coupon.code) {
        const existing = await Coupon.findOne({ code, isDeleted: { $ne: true } });
        if (existing) throw new AppError(`Coupon code "${code}" is already in use`, 409);
        coupon.code = code;
      }
    }

    if (data.startsAt && data.endsAt && data.startsAt >= data.endsAt) {
      throw new AppError("Coupon start date must be before end date", 400);
    }

    if (data.discountType === "percentage" || (coupon.discountType === "percentage" && !data.discountType)) {
      const val = data.discountValue ?? coupon.discountValue;
      if (val > 100) throw new AppError("Percentage discount cannot exceed 100%", 400);
    }

    Object.assign(coupon, data);
    coupon.updatedBy = ownerId;
    await coupon.save();

    const [enriched] = await this.enrichSellerCoupons([coupon]);
    return enriched;
  }

  static async updateCouponStatus(ownerId: string, couponId: string, isActive: boolean) {
    const store = await this.getStoreForOwner(ownerId);
    const coupon = await Coupon.findOneAndUpdate(
      { couponId, storeId: store.storeId, isDeleted: { $ne: true } },
      { $set: { isActive, updatedBy: ownerId } },
      { new: true, runValidators: true }
    );

    if (!coupon) throw new AppError("Coupon not found or does not belong to your store", 404);
    const [enriched] = await this.enrichSellerCoupons([coupon]);
    return enriched;
  }

  static async deleteCoupon(ownerId: string, couponId: string) {
    const store = await this.getStoreForOwner(ownerId);
    const coupon = await Coupon.findOneAndUpdate(
      { couponId, storeId: store.storeId },
      { $set: { isDeleted: true, isActive: false, updatedBy: ownerId } },
      { new: true }
    );

    if (!coupon) throw new AppError("Coupon not found or does not belong to your store", 404);
    return { success: true, message: "Coupon deleted successfully" };
  }

  static async duplicateCoupon(ownerId: string, couponId: string) {
    const store = await this.getStoreForOwner(ownerId);
    const original = await Coupon.findOne({
      couponId,
      storeId: store.storeId,
      isDeleted: { $ne: true },
    }).lean();

    if (!original) throw new AppError("Original coupon not found", 404);

    let newCode = `${original.code}_COPY`;
    let attempts = 0;
    while (await Coupon.findOne({ code: newCode, isDeleted: { $ne: true } })) {
      attempts++;
      newCode = `${original.code}_${Math.floor(1000 + Math.random() * 9000)}`;
      if (attempts > 10) break;
    }

    const created = await Coupon.create({
      title: `${original.title} (Copy)`,
      description: original.description,
      code: newCode,
      discountType: original.discountType,
      discountValue: original.discountValue,
      minimumCartValue: original.minimumCartValue,
      maximumDiscount: original.maximumDiscount,
      usageLimit: original.usageLimit,
      usageCount: 0,
      oncePerCustomer: original.oncePerCustomer,
      perUserLimit: original.perUserLimit,
      newUsersOnly: original.newUsersOnly,
      verifiedOnly: (original as any).verifiedOnly ?? false,
      applicableScope: original.applicableScope,
      storeId: store.storeId,
      categoryId: original.categoryId,
      productId: original.productId,
      categoryIds: (original as any).categoryIds ?? [],
      productIds: (original as any).productIds ?? [],
      startsAt: new Date(),
      endsAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // Default 30 days
      isActive: true,
      isDeleted: false,
      createdBy: ownerId,
      updatedBy: ownerId,
    });

    const [enriched] = await this.enrichSellerCoupons([created]);
    return enriched;
  }

  static async bulkAction(
    ownerId: string,
    action: "activate" | "deactivate" | "delete",
    couponIds: string[]
  ) {
    const store = await this.getStoreForOwner(ownerId);
    if (!Array.isArray(couponIds) || couponIds.length === 0) {
      throw new AppError("couponIds array is required", 400);
    }

    const query = {
      couponId: { $in: couponIds },
      storeId: store.storeId,
    };

    if (action === "activate") {
      await Coupon.updateMany(query, { $set: { isActive: true, updatedBy: ownerId } });
    } else if (action === "deactivate") {
      await Coupon.updateMany(query, { $set: { isActive: false, updatedBy: ownerId } });
    } else if (action === "delete") {
      await Coupon.updateMany(query, { $set: { isDeleted: true, isActive: false, updatedBy: ownerId } });
    } else {
      throw new AppError("Invalid bulk action", 400);
    }

    return { success: true, count: couponIds.length };
  }

  static async validateSellerCoupon(
    code: string,
    customerId: string,
    storeId: string,
    cartValue: number,
    context?: { categoryIds?: string[]; productIds?: string[] }
  ) {
    const coupon = await Coupon.findOne({
      code: code.toUpperCase(),
      storeId,
      isDeleted: { $ne: true },
    });

    if (!coupon) {
      throw new AppError("Invalid coupon code for this store", 404);
    }

    if (!coupon.isActive) {
      throw new AppError("This coupon is currently inactive", 400);
    }

    const now = new Date();
    if (now < coupon.startsAt) {
      throw new AppError(`Coupon will be active starting ${coupon.startsAt.toLocaleDateString()}`, 400);
    }
    if (now > coupon.endsAt) {
      throw new AppError("This coupon has expired", 400);
    }

    if (cartValue < coupon.minimumCartValue) {
      throw new AppError(
        `Minimum order amount of ₹${coupon.minimumCartValue} required for this coupon`,
        400
      );
    }

    if (coupon.usageLimit !== null && coupon.usageCount >= coupon.usageLimit) {
      throw new AppError("Coupon maximum usage limit has been reached", 400);
    }

    // Customer eligibility: User limits
    const userLimit = coupon.perUserLimit ?? (coupon.oncePerCustomer ? 1 : null);
    if (userLimit !== null) {
      const customerRedemptions = await CouponUsage.countDocuments({
        couponId: coupon.couponId,
        customerId,
      });
      if (customerRedemptions >= userLimit) {
        throw new AppError(
          userLimit === 1
            ? "You have already used this store coupon"
            : `You have reached the maximum limit of ${userLimit} redemptions for this coupon`,
          400
        );
      }
    }

    // First purchase only
    if (coupon.newUsersOnly) {
      const priorStoreOrders = await Order.countDocuments({
        userId: customerId,
        storeId,
        status: { $nin: ["CANCELLED", "FAILED"] },
      });
      if (priorStoreOrders > 0) {
        throw new AppError("This coupon is only valid for your first order from this store", 400);
      }
    }

    // Verified customers only
    if ((coupon as any).verifiedOnly) {
      const user = await User.findOne({ userId: customerId }).select(
        "isVerifiedCustomer emailVerified phoneVerified"
      );
      const isVerified = Boolean(
        user?.isVerifiedCustomer || user?.emailVerified || user?.phoneVerified
      );
      if (!isVerified) {
        throw new AppError("This coupon is available to verified customers only", 403);
      }
    }

    // Product & category applicability
    if (coupon.applicableScope === "category") {
      const allowedCategories = [
        coupon.categoryId,
        ...((coupon as any).categoryIds || []),
      ].filter(Boolean) as string[];
      if (
        allowedCategories.length > 0 &&
        context?.categoryIds &&
        !context.categoryIds.some((id) => allowedCategories.includes(id))
      ) {
        throw new AppError("This coupon is only valid for specific categories in this store", 400);
      }
    }

    if (coupon.applicableScope === "product") {
      const allowedProducts = [
        coupon.productId,
        ...((coupon as any).productIds || []),
      ].filter(Boolean) as string[];
      if (
        allowedProducts.length > 0 &&
        context?.productIds &&
        !context.productIds.some((id) => allowedProducts.includes(id))
      ) {
        throw new AppError("This coupon is only valid for specific products in this store", 400);
      }
    }

    const rawDiscount =
      coupon.discountType === "percentage"
        ? (cartValue * coupon.discountValue) / 100
        : coupon.discountValue;

    const cappedDiscount =
      coupon.maximumDiscount !== null && coupon.maximumDiscount !== undefined
        ? Math.min(rawDiscount, coupon.maximumDiscount)
        : rawDiscount;

    const discount = Math.min(cartValue, Math.round(cappedDiscount * 100) / 100);
    const finalAmount = Math.max(0, Math.round((cartValue - discount) * 100) / 100);

    return {
      couponId: coupon.couponId,
      code: coupon.code,
      title: coupon.title,
      discountType: coupon.discountType,
      discountValue: coupon.discountValue,
      discount,
      finalAmount,
      savings: discount,
      storeId: coupon.storeId,
    };
  }
}
