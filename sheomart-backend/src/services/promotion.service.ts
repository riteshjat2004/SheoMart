import { AppError } from "../errors/AppError";
import { Coupon } from "../models/coupon.model";
import { CouponUsage } from "../models/couponUsage.model";
import { Offer } from "../models/offer.model";
import type {
  CreateCouponInput,
  CreateOfferInput,
  UpdateCouponInput,
  UpdateOfferInput,
} from "../validators/promotion.validator";

const getActiveWindow = () => {
  const now = new Date();
  return {
    isActive: true,
    startsAt: { $lte: now },
    endsAt: { $gte: now },
  };
};

export class PromotionService {
  static async listActiveCoupons() {
    return Coupon.find(getActiveWindow()).sort({ endsAt: 1, createdAt: -1 });
  }

  static async listActiveOffers() {
    return Offer.find(getActiveWindow()).sort({ priority: -1, endsAt: 1, createdAt: -1 });
  }

  static async getCustomerCouponWallet(customerId: string) {
    const now = new Date();
    const [coupons, usages, offers] = await Promise.all([
      Coupon.find().sort({ endsAt: 1, createdAt: -1 }),
      CouponUsage.find({ customerId }).sort({ redeemedAt: -1 }).lean(),
      this.listActiveOffers(),
    ]);
    const usageByCoupon = new Map(usages.map((usage) => [usage.couponId, usage]));
    const available = [];
    const used = [];
    const expired = [];

    for (const coupon of coupons) {
      const usage = usageByCoupon.get(coupon.couponId);
      const item = { coupon, used: Boolean(usage), usedAt: usage?.redeemedAt ?? null };
      if (usage) {
        used.push(item);
      } else if (coupon.isActive && coupon.startsAt <= now && coupon.endsAt >= now) {
        available.push(item);
      } else if (coupon.endsAt < now) {
        expired.push(item);
      }
    }

    return { available, used, expired, offers };
  }

  static async listCoupons() {
    return Coupon.find().sort({ createdAt: -1 });
  }

  static async listOffers() {
    return Offer.find().sort({ priority: -1, createdAt: -1 });
  }

  static async getCoupon(couponId: string) {
    const coupon = await Coupon.findOne({ couponId });
    if (!coupon) throw new AppError("Coupon not found", 404);
    return coupon;
  }

  static async getOffer(offerId: string) {
    const offer = await Offer.findOne({ offerId });
    if (!offer) throw new AppError("Offer not found", 404);
    return offer;
  }

  static async validateCoupon(code: string, customerId: string, cartValue: number) {
    const coupon = await Coupon.findOne({ code: code.toUpperCase() });
    if (!coupon || !coupon.isActive) throw new AppError("Coupon is not available", 400);
    const now = new Date();
    if (now < coupon.startsAt) throw new AppError("Coupon is scheduled for a later date", 400);
    if (now > coupon.endsAt) throw new AppError("Coupon has expired", 400);
    if (cartValue < coupon.minimumCartValue) throw new AppError(`Minimum cart value is ₹${coupon.minimumCartValue}`, 400);
    if (coupon.usageLimit !== null && coupon.usageCount >= coupon.usageLimit) throw new AppError("Coupon usage limit reached", 400);
    if (coupon.oncePerCustomer && await CouponUsage.exists({ couponId: coupon.couponId, customerId })) {
      throw new AppError("Coupon has already been used by this customer", 400);
    }
    const rawDiscount = coupon.discountType === "percentage" ? cartValue * coupon.discountValue / 100 : coupon.discountValue;
    const discount = Math.min(cartValue, coupon.maximumDiscount == null ? rawDiscount : Math.min(rawDiscount, coupon.maximumDiscount));
    return { couponId: coupon.couponId, code: coupon.code, discount: Math.round(discount * 100) / 100 };
  }

  static async calculateFestivalDiscounts(items: Array<{ categoryId: string; quantity: number; price: number }>) {
    const offers = await this.listActiveOffers();
    let festivalSavings = 0;
    const appliedOfferIds = new Set<string>();
    for (const item of items) {
      const matchingOffer = offers.find((offer) => (offer.categoryIds ?? []).length === 0 || (offer.categoryIds ?? []).includes(item.categoryId));
      if (!matchingOffer) continue;
      const rawDiscount = matchingOffer.discountType === "percentage"
        ? item.price * item.quantity * matchingOffer.discountValue / 100
        : matchingOffer.discountValue * item.quantity;
      festivalSavings += Math.min(item.price * item.quantity, rawDiscount);
      appliedOfferIds.add(matchingOffer.offerId);
    }
    return { festivalSavings: Math.round(festivalSavings * 100) / 100, appliedOfferIds: [...appliedOfferIds] };
  }

  static async createCoupon(data: CreateCouponInput, userId?: string) {
    const existing = await Coupon.findOne({ code: data.code });
    if (existing) throw new AppError("Coupon code already exists", 409);
    return Coupon.create({ ...data, createdBy: userId ?? null, updatedBy: userId ?? null });
  }

  static async updateCoupon(couponId: string, data: UpdateCouponInput, userId?: string) {
    const coupon = await this.getCoupon(couponId);
    if (data.code && data.code !== coupon.code) {
      const duplicate = await Coupon.findOne({ code: data.code, couponId: { $ne: couponId } });
      if (duplicate) throw new AppError("Coupon code already exists", 409);
    }
    Object.assign(coupon, data, { updatedBy: userId ?? null });
    await coupon.save();
    return coupon;
  }

  static async deleteCoupon(couponId: string, userId?: string) {
    const coupon = await this.getCoupon(couponId);
    coupon.isActive = false;
    coupon.updatedBy = userId ?? null;
    await coupon.save();
    return coupon;
  }

  static async createOffer(data: CreateOfferInput, userId?: string) {
    return Offer.create({ ...data, createdBy: userId ?? null, updatedBy: userId ?? null });
  }

  static async updateOffer(offerId: string, data: UpdateOfferInput, userId?: string) {
    const offer = await this.getOffer(offerId);
    Object.assign(offer, data, { updatedBy: userId ?? null });
    await offer.save();
    return offer;
  }

  static async deleteOffer(offerId: string, userId?: string) {
    const offer = await this.getOffer(offerId);
    offer.isActive = false;
    offer.updatedBy = userId ?? null;
    await offer.save();
    return offer;
  }

  static async recordCouponUsage(couponId: string, customerId: string, orderId?: string) {
    const coupon = await this.getCoupon(couponId);
    if (coupon.usageLimit !== null && coupon.usageCount >= coupon.usageLimit) {
      throw new AppError("Coupon usage limit reached", 409);
    }
    if (coupon.oncePerCustomer && await CouponUsage.exists({ couponId, customerId })) {
      throw new AppError("Coupon has already been used by this customer", 409);
    }
    const usage = await CouponUsage.create({ couponId, customerId, orderId: orderId ?? null });
    coupon.usageCount += 1;
    await coupon.save();
    return usage;
  }
}
