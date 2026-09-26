import { AppError } from "../errors/AppError";
import { CLOUDINARY_FOLDERS } from "../constants/cloudinary";
import { Category } from "../models/category.model";
import { Coupon, ICoupon } from "../models/coupon.model";
import { CouponUsage } from "../models/couponUsage.model";
import { Offer, IOffer } from "../models/offer.model";
import { Order } from "../models/order.model";
import { Product } from "../models/product.model";
import { Store } from "../models/store.model";
import { deleteImageFromCloudinary, uploadBufferToCloudinary } from "../utils/cloudinary";
import type {
  BulkPromotionActionInput,
  CreateCouponInput,
  CreateOfferInput,
  UpdateCouponInput,
  UpdateOfferInput,
} from "../validators/promotion.validator";

const getActiveWindow = () => {
  const now = new Date();
  return {
    isDeleted: { $ne: true },
    isActive: true,
    startsAt: { $lte: now },
    endsAt: { $gte: now },
  };
};

async function enrichCoupons(coupons: ICoupon[]) {
  const storeIds = [...new Set(coupons.map((c) => c.storeId).filter(Boolean) as string[])];
  const categoryIds = [...new Set(coupons.map((c) => c.categoryId).filter(Boolean) as string[])];
  const productIds = [...new Set(coupons.map((c) => c.productId).filter(Boolean) as string[])];

  const [stores, categories, products] = await Promise.all([
    storeIds.length ? Store.find({ storeId: { $in: storeIds } }).select("storeId storeName").lean() : [],
    categoryIds.length ? Category.find({ categoryId: { $in: categoryIds } }).select("categoryId name").lean() : [],
    productIds.length ? Product.find({ productId: { $in: productIds } }).select("productId name").lean() : [],
  ]);

  const storeMap = new Map(stores.map((s) => [s.storeId, s.storeName]));
  const categoryMap = new Map(categories.map((c) => [c.categoryId, c.name]));
  const productMap = new Map(products.map((p) => [p.productId, p.name]));

  return coupons.map((c) => {
    const obj = typeof c.toObject === "function" ? c.toObject({ virtuals: true }) : { ...c };
    return {
      ...obj,
      storeName: c.storeId ? storeMap.get(c.storeId) ?? null : null,
      categoryName: c.categoryId ? categoryMap.get(c.categoryId) ?? null : null,
      productName: c.productId ? productMap.get(c.productId) ?? null : null,
    };
  });
}

async function enrichOffers(offers: IOffer[]) {
  const categoryIds = [...new Set(offers.flatMap((o) => o.categoryIds || []))];
  const storeIds = [...new Set(offers.flatMap((o) => o.storeIds || []))];
  const productIds = [...new Set(offers.flatMap((o) => o.productIds || []))];

  const [categories, stores, products] = await Promise.all([
    categoryIds.length ? Category.find({ categoryId: { $in: categoryIds } }).select("categoryId name").lean() : [],
    storeIds.length ? Store.find({ storeId: { $in: storeIds } }).select("storeId storeName").lean() : [],
    productIds.length ? Product.find({ productId: { $in: productIds } }).select("productId name").lean() : [],
  ]);

  const categoryMap = new Map(categories.map((c) => [c.categoryId, c.name]));
  const storeMap = new Map(stores.map((s) => [s.storeId, s.storeName]));
  const productMap = new Map(products.map((p) => [p.productId, p.name]));

  return offers.map((o) => {
    const obj = typeof o.toObject === "function" ? o.toObject({ virtuals: true }) : { ...o };
    return {
      ...obj,
      targetCategories: (o.categoryIds || []).map((id: string) => ({ id, name: categoryMap.get(id) ?? id })),
      targetStores: (o.storeIds || []).map((id: string) => ({ id, name: storeMap.get(id) ?? id })),
      targetProducts: (o.productIds || []).map((id: string) => ({ id, name: productMap.get(id) ?? id })),
    };
  });
}

export class PromotionService {
  static async listActiveCoupons() {
    const coupons = await Coupon.find(getActiveWindow()).sort({ isFeatured: -1, endsAt: 1, createdAt: -1 });
    return enrichCoupons(coupons);
  }

  static async listActiveOffers() {
    const offers = await Offer.find(getActiveWindow()).sort({ priority: -1, endsAt: 1, createdAt: -1 });
    return enrichOffers(offers);
  }

  static async getCustomerCouponWallet(customerId: string) {
    const now = new Date();
    const [rawCoupons, usages, offers] = await Promise.all([
      Coupon.find({ isDeleted: { $ne: true } }).sort({ endsAt: 1, createdAt: -1 }),
      CouponUsage.find({ customerId }).sort({ redeemedAt: -1 }).lean(),
      this.listActiveOffers(),
    ]);

    const coupons = await enrichCoupons(rawCoupons);
    const usageCounts = new Map<string, number>();
    const lastUsedMap = new Map<string, Date>();

    for (const u of usages) {
      usageCounts.set(u.couponId, (usageCounts.get(u.couponId) || 0) + 1);
      if (!lastUsedMap.has(u.couponId)) {
        lastUsedMap.set(u.couponId, u.redeemedAt);
      }
    }

    const available = [];
    const used = [];
    const expired = [];

    for (const coupon of coupons) {
      const timesUsed = usageCounts.get(coupon.couponId) || 0;
      const userLimit = coupon.perUserLimit ?? (coupon.oncePerCustomer ? 1 : null);
      const isExhaustedForUser = userLimit !== null && timesUsed >= userLimit;
      const isCouponExpired = coupon.endsAt < now || (coupon.usageLimit !== null && coupon.usageCount >= coupon.usageLimit);

      const item = {
        coupon,
        used: timesUsed > 0,
        timesUsed,
        usedAt: lastUsedMap.get(coupon.couponId) ?? null,
      };

      if (isExhaustedForUser) {
        used.push(item);
      } else if (isCouponExpired) {
        expired.push(item);
      } else if (coupon.isActive && coupon.startsAt <= now && coupon.endsAt >= now) {
        available.push(item);
      } else {
        expired.push(item);
      }
    }

    return { available, used, expired, offers };
  }

  static async listCoupons(filters?: { search?: string; status?: string; scope?: string }) {
    const query: Record<string, unknown> = {};

    if (filters?.search) {
      const reg = new RegExp(filters.search.trim(), "i");
      query.$or = [{ code: reg }, { title: reg }, { description: reg }];
    }

    if (filters?.scope && filters.scope !== "all") {
      query.applicableScope = filters.scope;
    }

    const now = new Date();
    if (filters?.status && filters.status !== "all") {
      if (filters.status === "deleted") {
        query.isDeleted = true;
      } else {
        query.isDeleted = { $ne: true };
        if (filters.status === "disabled") {
          query.isActive = false;
        } else if (filters.status === "scheduled") {
          query.isActive = true;
          query.startsAt = { $gt: now };
        } else if (filters.status === "expired") {
          query.$or = [{ endsAt: { $lt: now } }, { $expr: { $and: [{ $ne: ["$usageLimit", null] }, { $gte: ["$usageCount", "$usageLimit"] }] } }];
        } else if (filters.status === "active") {
          query.isActive = true;
          query.startsAt = { $lte: now };
          query.endsAt = { $gte: now };
        }
      }
    }

    const [rawCoupons, allCoupons] = await Promise.all([
      Coupon.find(query).sort({ createdAt: -1 }),
      Coupon.find().lean(),
    ]);

    const stats = {
      total: allCoupons.filter((c) => !c.isDeleted).length,
      active: allCoupons.filter((c) => !c.isDeleted && c.isActive && new Date(c.startsAt) <= now && new Date(c.endsAt) >= now).length,
      scheduled: allCoupons.filter((c) => !c.isDeleted && c.isActive && new Date(c.startsAt) > now).length,
      expired: allCoupons.filter((c) => !c.isDeleted && (new Date(c.endsAt) < now || (c.usageLimit !== null && c.usageCount >= c.usageLimit))).length,
      disabled: allCoupons.filter((c) => !c.isDeleted && !c.isActive).length,
      deleted: allCoupons.filter((c) => c.isDeleted).length,
      totalRedemptions: allCoupons.reduce((sum, c) => sum + (c.usageCount || 0), 0),
    };

    const coupons = await enrichCoupons(rawCoupons);
    return { coupons, stats };
  }

  static async listOffers(filters?: { search?: string; status?: string; offerType?: string }) {
    const query: Record<string, unknown> = {};

    if (filters?.search) {
      const reg = new RegExp(filters.search.trim(), "i");
      query.$or = [{ title: reg }, { subtitle: reg }, { festivalName: reg }];
    }

    if (filters?.offerType && filters.offerType !== "all") {
      query.offerType = filters.offerType;
    }

    const now = new Date();
    if (filters?.status && filters.status !== "all") {
      if (filters.status === "deleted") {
        query.isDeleted = true;
      } else {
        query.isDeleted = { $ne: true };
        if (filters.status === "disabled") {
          query.isActive = false;
        } else if (filters.status === "scheduled") {
          query.isActive = true;
          query.startsAt = { $gt: now };
        } else if (filters.status === "expired") {
          query.endsAt = { $lt: now };
        } else if (filters.status === "active") {
          query.isActive = true;
          query.startsAt = { $lte: now };
          query.endsAt = { $gte: now };
        }
      }
    }

    const [rawOffers, allOffers] = await Promise.all([
      Offer.find(query).sort({ priority: -1, createdAt: -1 }),
      Offer.find().lean(),
    ]);

    const stats = {
      total: allOffers.filter((o) => !o.isDeleted).length,
      active: allOffers.filter((o) => !o.isDeleted && o.isActive && new Date(o.startsAt) <= now && new Date(o.endsAt) >= now).length,
      homepageOffers: allOffers.filter((o) => !o.isDeleted && o.isActive && (o.showOnHero || o.showOnFeatured || o.showOnExplore)).length,
      flashSales: allOffers.filter((o) => !o.isDeleted && o.isActive && o.isFlashSale).length,
      expired: allOffers.filter((o) => !o.isDeleted && new Date(o.endsAt) < now).length,
      deleted: allOffers.filter((o) => o.isDeleted).length,
    };

    const offers = await enrichOffers(rawOffers);
    return { offers, stats };
  }

  static async getCoupon(couponId: string) {
    const coupon = await Coupon.findOne({ couponId });
    if (!coupon) throw new AppError("Coupon not found", 404);
    const [enriched] = await enrichCoupons([coupon]);
    return enriched;
  }

  static async getOffer(offerId: string) {
    const offer = await Offer.findOne({ offerId });
    if (!offer) throw new AppError("Offer not found", 404);
    const [enriched] = await enrichOffers([offer]);
    return enriched;
  }

  static async validateCoupon(
    code: string,
    customerId: string,
    cartValue: number,
    context?: { storeId?: string; categoryIds?: string[]; productIds?: string[] }
  ) {
    const coupon = await Coupon.findOne({ code: code.toUpperCase(), isDeleted: { $ne: true } });
    if (!coupon) throw new AppError("Invalid coupon code", 404);
    if (!coupon.isActive) throw new AppError("Coupon is currently inactive", 400);

    const now = new Date();
    if (now < coupon.startsAt) throw new AppError(`Coupon starts on ${coupon.startsAt.toLocaleDateString()}`, 400);
    if (now > coupon.endsAt) throw new AppError("Coupon has expired", 400);

    if (cartValue < coupon.minimumCartValue) {
      throw new AppError(`Minimum order amount of ₹${coupon.minimumCartValue} required for this coupon`, 400);
    }

    if (coupon.usageLimit !== null && coupon.usageCount >= coupon.usageLimit) {
      throw new AppError("Coupon maximum usage limit has been reached", 400);
    }

    const userLimit = coupon.perUserLimit ?? (coupon.oncePerCustomer ? 1 : null);
    if (userLimit !== null) {
      const customerRedemptions = await CouponUsage.countDocuments({ couponId: coupon.couponId, customerId });
      if (customerRedemptions >= userLimit) {
        throw new AppError(
          userLimit === 1
            ? "You have already used this coupon"
            : `You have reached the limit of ${userLimit} redemptions for this coupon`,
          400
        );
      }
    }

    if (coupon.newUsersOnly) {
      const priorOrdersCount = await Order.countDocuments({ userId: customerId });
      if (priorOrdersCount > 0) {
        throw new AppError("This coupon is only valid for your first order", 400);
      }
    }

    if (coupon.applicableScope === "store" && coupon.storeId) {
      if (context?.storeId && context.storeId !== coupon.storeId) {
        throw new AppError("This coupon is not valid for items from this store", 400);
      }
    }

    if (coupon.applicableScope === "category" && coupon.categoryId) {
      if (context?.categoryIds && context.categoryIds.length > 0 && !context.categoryIds.includes(coupon.categoryId)) {
        throw new AppError("This coupon is only valid for products in specific categories", 400);
      }
    }

    if (coupon.applicableScope === "product" && coupon.productId) {
      if (context?.productIds && context.productIds.length > 0 && !context.productIds.includes(coupon.productId)) {
        throw new AppError("This coupon is only valid for specific products", 400);
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
    };
  }

  static async calculateFestivalDiscounts(items: Array<{ categoryId: string; quantity: number; price: number }>) {
    const offers = await this.listActiveOffers();
    let festivalSavings = 0;
    const appliedOfferIds = new Set<string>();

    for (const item of items) {
      const matchingOffer = offers.find(
        (offer) => (offer.categoryIds ?? []).length === 0 || (offer.categoryIds ?? []).includes(item.categoryId)
      );
      if (!matchingOffer) continue;

      const rawDiscount =
        matchingOffer.discountType === "percentage"
          ? (item.price * item.quantity * matchingOffer.discountValue) / 100
          : matchingOffer.discountValue * item.quantity;

      festivalSavings += Math.min(item.price * item.quantity, rawDiscount);
      appliedOfferIds.add(matchingOffer.offerId);
    }

    return { festivalSavings: Math.round(festivalSavings * 100) / 100, appliedOfferIds: [...appliedOfferIds] };
  }

  static async createCoupon(data: CreateCouponInput, userId?: string) {
    const existing = await Coupon.findOne({ code: data.code.toUpperCase(), isDeleted: { $ne: true } });
    if (existing) throw new AppError("Coupon code already exists", 409);

    return Coupon.create({
      ...data,
      code: data.code.toUpperCase(),
      createdBy: userId ?? null,
      updatedBy: userId ?? null,
    });
  }

  static async updateCoupon(couponId: string, data: UpdateCouponInput, userId?: string) {
    const coupon = await Coupon.findOne({ couponId });
    if (!coupon) throw new AppError("Coupon not found", 404);

    if (data.code && data.code.toUpperCase() !== coupon.code) {
      const duplicate = await Coupon.findOne({
        code: data.code.toUpperCase(),
        couponId: { $ne: couponId },
        isDeleted: { $ne: true },
      });
      if (duplicate) throw new AppError("Coupon code already exists", 409);
    }

    Object.assign(coupon, data, {
      code: data.code ? data.code.toUpperCase() : coupon.code,
      updatedBy: userId ?? null,
    });

    await coupon.save();
    return coupon;
  }

  static async updateCouponStatus(couponId: string, isActive: boolean, userId?: string) {
    const coupon = await Coupon.findOne({ couponId });
    if (!coupon) throw new AppError("Coupon not found", 404);
    coupon.isActive = isActive;
    coupon.updatedBy = userId ?? null;
    await coupon.save();
    return coupon;
  }

  static async deleteCoupon(couponId: string, userId?: string) {
    const coupon = await Coupon.findOne({ couponId });
    if (!coupon) throw new AppError("Coupon not found", 404);
    coupon.isDeleted = true;
    coupon.isActive = false;
    coupon.updatedBy = userId ?? null;
    await coupon.save();
    return coupon;
  }

  static async restoreCoupon(couponId: string, userId?: string) {
    const coupon = await Coupon.findOne({ couponId });
    if (!coupon) throw new AppError("Coupon not found", 404);
    coupon.isDeleted = false;
    coupon.updatedBy = userId ?? null;
    await coupon.save();
    return coupon;
  }

  static async bulkUpdateCoupons(input: BulkPromotionActionInput, userId?: string) {
    const { ids, action } = input;
    const now = new Date();

    if (action === "activate") {
      await Coupon.updateMany({ couponId: { $in: ids } }, { $set: { isActive: true, isDeleted: false, updatedBy: userId ?? null } });
    } else if (action === "deactivate") {
      await Coupon.updateMany({ couponId: { $in: ids } }, { $set: { isActive: false, updatedBy: userId ?? null } });
    } else if (action === "delete") {
      await Coupon.updateMany({ couponId: { $in: ids } }, { $set: { isDeleted: true, isActive: false, updatedBy: userId ?? null } });
    } else if (action === "restore") {
      await Coupon.updateMany({ couponId: { $in: ids } }, { $set: { isDeleted: false, updatedBy: userId ?? null } });
    }

    return { success: true, count: ids.length, action };
  }

  static async createOffer(data: CreateOfferInput, userId?: string, fileBuffer?: Buffer) {
    let bannerImage = data.bannerImage || "";
    let bannerPublicId = data.bannerPublicId || "";

    if (fileBuffer) {
      const uploadResult = await uploadBufferToCloudinary(fileBuffer, CLOUDINARY_FOLDERS.PROMOTIONS);
      bannerImage = uploadResult.secure_url;
      bannerPublicId = uploadResult.public_id;
    }

    if (!bannerImage) {
      throw new AppError("Banner image is required for an offer", 400);
    }

    return Offer.create({
      ...data,
      bannerImage,
      bannerPublicId,
      createdBy: userId ?? null,
      updatedBy: userId ?? null,
    });
  }

  static async updateOffer(offerId: string, data: UpdateOfferInput, userId?: string, fileBuffer?: Buffer) {
    const offer = await Offer.findOne({ offerId });
    if (!offer) throw new AppError("Offer not found", 404);

    let bannerImage = data.bannerImage ?? offer.bannerImage;
    let bannerPublicId = data.bannerPublicId ?? offer.bannerPublicId;

    if (fileBuffer) {
      if (offer.bannerPublicId) {
        await deleteImageFromCloudinary(offer.bannerPublicId).catch(() => {});
      }
      const uploadResult = await uploadBufferToCloudinary(fileBuffer, CLOUDINARY_FOLDERS.PROMOTIONS);
      bannerImage = uploadResult.secure_url;
      bannerPublicId = uploadResult.public_id;
    }

    Object.assign(offer, data, {
      bannerImage,
      bannerPublicId,
      updatedBy: userId ?? null,
    });

    await offer.save();
    return offer;
  }

  static async updateOfferStatus(offerId: string, isActive: boolean, userId?: string) {
    const offer = await Offer.findOne({ offerId });
    if (!offer) throw new AppError("Offer not found", 404);
    offer.isActive = isActive;
    offer.updatedBy = userId ?? null;
    await offer.save();
    return offer;
  }

  static async deleteOffer(offerId: string, userId?: string) {
    const offer = await Offer.findOne({ offerId });
    if (!offer) throw new AppError("Offer not found", 404);
    offer.isDeleted = true;
    offer.isActive = false;
    offer.updatedBy = userId ?? null;
    await offer.save();
    return offer;
  }

  static async restoreOffer(offerId: string, userId?: string) {
    const offer = await Offer.findOne({ offerId });
    if (!offer) throw new AppError("Offer not found", 404);
    offer.isDeleted = false;
    offer.updatedBy = userId ?? null;
    await offer.save();
    return offer;
  }

  static async bulkUpdateOffers(input: BulkPromotionActionInput, userId?: string) {
    const { ids, action } = input;

    if (action === "activate") {
      await Offer.updateMany({ offerId: { $in: ids } }, { $set: { isActive: true, isDeleted: false, updatedBy: userId ?? null } });
    } else if (action === "deactivate") {
      await Offer.updateMany({ offerId: { $in: ids } }, { $set: { isActive: false, updatedBy: userId ?? null } });
    } else if (action === "delete") {
      await Offer.updateMany({ offerId: { $in: ids } }, { $set: { isDeleted: true, isActive: false, updatedBy: userId ?? null } });
    } else if (action === "restore") {
      await Offer.updateMany({ offerId: { $in: ids } }, { $set: { isDeleted: false, updatedBy: userId ?? null } });
    }

    return { success: true, count: ids.length, action };
  }

  static async recordCouponUsage(couponId: string, customerId: string, orderId?: string) {
    const coupon = await Coupon.findOne({ couponId, isDeleted: { $ne: true } });
    if (!coupon) throw new AppError("Coupon not found", 404);

    if (coupon.usageLimit !== null && coupon.usageCount >= coupon.usageLimit) {
      throw new AppError("Coupon usage limit reached", 409);
    }

    const userLimit = coupon.perUserLimit ?? (coupon.oncePerCustomer ? 1 : null);
    if (userLimit !== null) {
      const redemptions = await CouponUsage.countDocuments({ couponId, customerId });
      if (redemptions >= userLimit) {
        throw new AppError("Coupon usage limit reached for this customer", 409);
      }
    }

    const usage = await CouponUsage.create({ couponId, customerId, orderId: orderId ?? null });
    coupon.usageCount += 1;
    await coupon.save();
    return usage;
  }
}
