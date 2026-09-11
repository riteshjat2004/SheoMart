import api from "./api";
import type { ApiResponse } from "@/types/api";

export type DiscountType = "flat" | "percentage";
export type PromotionStatus = "active" | "inactive" | "scheduled" | "expired";

export interface CouponItem {
  couponId: string;
  title: string;
  code: string;
  discountType: DiscountType;
  discountValue: number;
  minimumCartValue: number;
  maximumDiscount: number | null;
  usageLimit: number | null;
  usageCount: number;
  oncePerCustomer: boolean;
  startsAt: string;
  endsAt: string;
  isActive: boolean;
  status: PromotionStatus;
}

export interface OfferItem {
  offerId: string;
  title: string;
  festivalName: string;
  bannerImage: string;
  categoryIds: string[];
  discountType: DiscountType;
  discountValue: number;
  startsAt: string;
  endsAt: string;
  priority: number;
  isActive: boolean;
  status: PromotionStatus;
}

interface CouponResponse { coupon: CouponItem }
interface OfferResponse { offer: OfferItem }

export interface CouponValidation {
  couponId: string;
  code: string;
  discount: number;
}

export interface WalletCoupon {
  couponId: string;
  title: string;
  code: string;
  discountType: DiscountType;
  discountValue: number;
  minimumPurchase: number;
  maxDiscount: number | null;
  expiresAt: string;
  status: PromotionStatus;
  used: boolean;
  usedAt: string | null;
}

export interface CouponWallet {
  available: WalletCoupon[];
  used: WalletCoupon[];
  expired: WalletCoupon[];
  offers: OfferItem[];
}

export async function fetchAdminCoupons() {
  const response = await api.get<ApiResponse<{ coupons: CouponItem[] }>>("/api/v1/promotions/admin/coupons");
  return response.data.data?.coupons ?? [];
}

export async function fetchAdminOffers() {
  const response = await api.get<ApiResponse<{ offers: OfferItem[] }>>("/api/v1/promotions/admin/offers");
  return response.data.data?.offers ?? [];
}

export async function createCoupon(payload: Record<string, unknown>) {
  const response = await api.post<ApiResponse<CouponResponse>>("/api/v1/promotions/admin/coupons", payload);
  return response.data.data?.coupon;
}

export async function updateCoupon(couponId: string, payload: Record<string, unknown>) {
  const response = await api.patch<ApiResponse<CouponResponse>>(`/api/v1/promotions/admin/coupons/${couponId}`, payload);
  return response.data.data?.coupon;
}

export async function deleteCoupon(couponId: string) {
  const response = await api.delete<ApiResponse<CouponResponse>>(`/api/v1/promotions/admin/coupons/${couponId}`);
  return response.data.data?.coupon;
}

export async function createOffer(payload: Record<string, unknown>) {
  const response = await api.post<ApiResponse<OfferResponse>>("/api/v1/promotions/admin/offers", payload);
  return response.data.data?.offer;
}

export async function updateOffer(offerId: string, payload: Record<string, unknown>) {
  const response = await api.patch<ApiResponse<OfferResponse>>(`/api/v1/promotions/admin/offers/${offerId}`, payload);
  return response.data.data?.offer;
}

export async function deleteOffer(offerId: string) {
  const response = await api.delete<ApiResponse<OfferResponse>>(`/api/v1/promotions/admin/offers/${offerId}`);
  return response.data.data?.offer;
}

export async function validateCoupon(code: string, cartValue: number) {
  const response = await api.post<ApiResponse<CouponValidation>>("/api/v1/promotions/coupons/validate", { code, cartValue });
  return response.data.data;
}

export async function fetchActiveOffers() {
  const response = await api.get<ApiResponse<{ offers: OfferItem[] }>>("/api/v1/promotions/offers/active");
  return response.data.data?.offers ?? [];
}

export async function fetchHomepageOffers() {
  const response = await api.get<ApiResponse<{ offers: OfferItem[] }>>("/api/v1/promotions/offers");
  return response.data.data?.offers ?? [];
}

export async function fetchHomepageCoupons() {
  const response = await api.get<ApiResponse<{ coupons: CouponItem[] }>>("/api/v1/promotions/coupons");
  return response.data.data?.coupons ?? [];
}

type RawWalletCoupon = Partial<CouponItem> & {
  coupon?: Partial<CouponItem>;
  used?: boolean;
  usedAt?: string | null;
};

interface RawCouponWallet {
  available?: RawWalletCoupon[];
  used?: RawWalletCoupon[];
  expired?: RawWalletCoupon[];
  offers?: OfferItem[];
}

const numericValue = (value: unknown, fallback = 0) => {
  const number = typeof value === "number" ? value : typeof value === "string" ? Number(value) : NaN;
  return Number.isFinite(number) ? number : fallback;
};

const normalizeWalletCoupon = (entry: RawWalletCoupon, section: "available" | "used" | "expired"): WalletCoupon => {
  const coupon = entry.coupon ?? entry;
  return {
    couponId: String(coupon.couponId ?? ""),
    title: String(coupon.title ?? "Coupon"),
    code: String(coupon.code ?? ""),
    discountType: coupon.discountType === "percentage" ? "percentage" : "flat",
    discountValue: numericValue(coupon.discountValue),
    minimumPurchase: numericValue(coupon.minimumCartValue),
    maxDiscount: coupon.maximumDiscount == null ? null : numericValue(coupon.maximumDiscount),
    expiresAt: String(coupon.endsAt ?? ""),
    status: section === "used" ? "inactive" : coupon.status === "scheduled" || coupon.status === "expired" ? coupon.status : section === "expired" ? "expired" : "active",
    used: section === "used" || Boolean(entry.used),
    usedAt: entry.usedAt ?? null,
  };
};

export async function fetchCouponWallet(): Promise<CouponWallet> {
  const response = await api.get<ApiResponse<RawCouponWallet>>("/api/v1/promotions/coupons/wallet");
  const data = response.data.data ?? {};
  return {
    available: (data.available ?? []).map((entry) => normalizeWalletCoupon(entry, "available")),
    used: (data.used ?? []).map((entry) => normalizeWalletCoupon(entry, "used")),
    expired: (data.expired ?? []).map((entry) => normalizeWalletCoupon(entry, "expired")),
    offers: data.offers ?? [],
  };
}
