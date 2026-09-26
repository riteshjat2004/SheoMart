import api from "./api";
import type { ApiResponse } from "@/types/api";

export type DiscountType = "flat" | "percentage";
export type PromotionStatus = "draft" | "active" | "scheduled" | "expired" | "disabled" | "deleted" | "inactive";
export type CouponApplicableScope = "marketplace" | "store" | "category" | "product";
export type OfferType = "flat" | "percentage" | "bogo" | "buy_x_get_y" | "free_delivery" | "combo" | "flash_sale";
export type OfferTargetScope = "marketplace" | "store" | "category" | "product";

export interface CouponItem {
  couponId: string;
  title: string;
  description?: string;
  code: string;
  discountType: DiscountType;
  discountValue: number;
  minimumCartValue: number;
  maximumDiscount: number | null;
  usageLimit: number | null;
  usageCount: number;
  oncePerCustomer: boolean;
  perUserLimit?: number;
  newUsersOnly?: boolean;
  applicableScope?: CouponApplicableScope;
  storeId?: string | null;
  storeName?: string | null;
  categoryId?: string | null;
  categoryName?: string | null;
  productId?: string | null;
  productName?: string | null;
  isFeatured?: boolean;
  showOnBanner?: boolean;
  autoApply?: boolean;
  startsAt: string;
  endsAt: string;
  isActive: boolean;
  isDeleted?: boolean;
  status: PromotionStatus;
  createdAt?: string;
  updatedAt?: string;
}

export interface OfferItem {
  offerId: string;
  title: string;
  subtitle?: string;
  description?: string;
  festivalName: string;
  offerType?: OfferType;
  targetScope?: OfferTargetScope;
  bannerImage: string;
  bannerPublicId?: string;
  categoryIds: string[];
  storeIds?: string[];
  productIds?: string[];
  targetCategories?: Array<{ id: string; name: string }>;
  targetStores?: Array<{ id: string; name: string }>;
  targetProducts?: Array<{ id: string; name: string }>;
  discountType: DiscountType;
  discountValue: number;
  buyQuantity?: number;
  getQuantity?: number;
  colorTheme?: string;
  showOnHero?: boolean;
  showOnFeatured?: boolean;
  showOnExplore?: boolean;
  isFlashSale?: boolean;
  startsAt: string;
  endsAt: string;
  priority: number;
  isActive: boolean;
  isDeleted?: boolean;
  status: PromotionStatus;
  createdAt?: string;
  updatedAt?: string;
}

export interface CouponStats {
  total: number;
  active: number;
  scheduled: number;
  expired: number;
  disabled: number;
  deleted: number;
  totalRedemptions: number;
}

export interface OfferStats {
  total: number;
  active: number;
  homepageOffers: number;
  flashSales: number;
  expired: number;
  deleted: number;
}

interface CouponResponse {
  coupon: CouponItem;
}

interface OfferResponse {
  offer: OfferItem;
}

export interface CouponValidation {
  couponId: string;
  code: string;
  title?: string;
  discount: number;
  discountType?: DiscountType;
  discountValue?: number;
  finalAmount?: number;
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

export async function fetchAdminCoupons(params?: { search?: string; status?: string; scope?: string }): Promise<{
  coupons: CouponItem[];
  stats: CouponStats;
}> {
  const response = await api.get<ApiResponse<{ coupons: CouponItem[]; stats: CouponStats }>>("/api/v1/promotions/admin/coupons", {
    params,
  });
  return {
    coupons: response.data.data?.coupons ?? [],
    stats: response.data.data?.stats ?? {
      total: 0,
      active: 0,
      scheduled: 0,
      expired: 0,
      disabled: 0,
      deleted: 0,
      totalRedemptions: 0,
    },
  };
}

export async function fetchAdminOffers(params?: { search?: string; status?: string; offerType?: string }): Promise<{
  offers: OfferItem[];
  stats: OfferStats;
}> {
  const response = await api.get<ApiResponse<{ offers: OfferItem[]; stats: OfferStats }>>("/api/v1/promotions/admin/offers", {
    params,
  });
  return {
    offers: response.data.data?.offers ?? [],
    stats: response.data.data?.stats ?? {
      total: 0,
      active: 0,
      homepageOffers: 0,
      flashSales: 0,
      expired: 0,
      deleted: 0,
    },
  };
}

export async function fetchCoupon(couponId: string): Promise<CouponItem> {
  const response = await api.get<ApiResponse<CouponResponse>>(`/api/v1/promotions/admin/coupons/${couponId}`);
  if (!response.data.data?.coupon) throw new Error("Coupon not found");
  return response.data.data.coupon;
}

export async function fetchOffer(offerId: string): Promise<OfferItem> {
  const response = await api.get<ApiResponse<OfferResponse>>(`/api/v1/promotions/admin/offers/${offerId}`);
  if (!response.data.data?.offer) throw new Error("Offer not found");
  return response.data.data.offer;
}

export async function createCoupon(payload: Record<string, unknown>): Promise<CouponItem> {
  const response = await api.post<ApiResponse<CouponResponse>>("/api/v1/promotions/admin/coupons", payload);
  if (!response.data.data?.coupon) throw new Error("Failed to create coupon");
  return response.data.data.coupon;
}

export async function updateCoupon(couponId: string, payload: Record<string, unknown>): Promise<CouponItem> {
  const response = await api.patch<ApiResponse<CouponResponse>>(`/api/v1/promotions/admin/coupons/${couponId}`, payload);
  if (!response.data.data?.coupon) throw new Error("Failed to update coupon");
  return response.data.data.coupon;
}

export async function updateCouponStatus(couponId: string, isActive: boolean): Promise<CouponItem> {
  const response = await api.patch<ApiResponse<CouponResponse>>(`/api/v1/promotions/admin/coupons/${couponId}/status`, { isActive });
  if (!response.data.data?.coupon) throw new Error("Failed to update coupon status");
  return response.data.data.coupon;
}

export async function deleteCoupon(couponId: string): Promise<CouponItem> {
  const response = await api.delete<ApiResponse<CouponResponse>>(`/api/v1/promotions/admin/coupons/${couponId}`);
  if (!response.data.data?.coupon) throw new Error("Failed to delete coupon");
  return response.data.data.coupon;
}

export async function restoreCoupon(couponId: string): Promise<CouponItem> {
  const response = await api.patch<ApiResponse<CouponResponse>>(`/api/v1/promotions/admin/coupons/${couponId}/restore`);
  if (!response.data.data?.coupon) throw new Error("Failed to restore coupon");
  return response.data.data.coupon;
}

export async function bulkCouponAction(ids: string[], action: "activate" | "deactivate" | "delete" | "restore") {
  const response = await api.post<ApiResponse<{ count: number; action: string }>>("/api/v1/promotions/admin/coupons/bulk-action", {
    ids,
    action,
  });
  return response.data.data;
}

export async function createOffer(payload: FormData | Record<string, unknown>): Promise<OfferItem> {
  const response = await api.post<ApiResponse<OfferResponse>>("/api/v1/promotions/admin/offers", payload);
  if (!response.data.data?.offer) throw new Error("Failed to create offer");
  return response.data.data.offer;
}

export async function updateOffer(offerId: string, payload: FormData | Record<string, unknown>): Promise<OfferItem> {
  const response = await api.patch<ApiResponse<OfferResponse>>(`/api/v1/promotions/admin/offers/${offerId}`, payload);
  if (!response.data.data?.offer) throw new Error("Failed to update offer");
  return response.data.data.offer;
}

export async function updateOfferStatus(offerId: string, isActive: boolean): Promise<OfferItem> {
  const response = await api.patch<ApiResponse<OfferResponse>>(`/api/v1/promotions/admin/offers/${offerId}/status`, { isActive });
  if (!response.data.data?.offer) throw new Error("Failed to update offer status");
  return response.data.data.offer;
}

export async function deleteOffer(offerId: string): Promise<OfferItem> {
  const response = await api.delete<ApiResponse<OfferResponse>>(`/api/v1/promotions/admin/offers/${offerId}`);
  if (!response.data.data?.offer) throw new Error("Failed to delete offer");
  return response.data.data.offer;
}

export async function restoreOffer(offerId: string): Promise<OfferItem> {
  const response = await api.patch<ApiResponse<OfferResponse>>(`/api/v1/promotions/admin/offers/${offerId}/restore`);
  if (!response.data.data?.offer) throw new Error("Failed to restore offer");
  return response.data.data.offer;
}

export async function bulkOfferAction(ids: string[], action: "activate" | "deactivate" | "delete" | "restore") {
  const response = await api.post<ApiResponse<{ count: number; action: string }>>("/api/v1/promotions/admin/offers/bulk-action", {
    ids,
    action,
  });
  return response.data.data;
}

export async function validateCoupon(
  code: string,
  cartValue: number,
  context?: { storeId?: string; categoryIds?: string[]; productIds?: string[] }
): Promise<CouponValidation> {
  const response = await api.post<ApiResponse<CouponValidation>>("/api/v1/promotions/coupons/validate", {
    code,
    cartValue,
    ...context,
  });
  if (!response.data.data) throw new Error("Failed to validate coupon");
  return response.data.data;
}

export async function fetchActiveOffers(): Promise<OfferItem[]> {
  const response = await api.get<ApiResponse<{ offers: OfferItem[] }>>("/api/v1/promotions/offers/active");
  return response.data.data?.offers ?? [];
}

export async function fetchHomepageOffers(): Promise<OfferItem[]> {
  const response = await api.get<ApiResponse<{ offers: OfferItem[] }>>("/api/v1/promotions/offers");
  return response.data.data?.offers ?? [];
}

export async function fetchHomepageCoupons(): Promise<CouponItem[]> {
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
    status:
      section === "used"
        ? "inactive"
        : coupon.status === "scheduled" || coupon.status === "expired"
          ? coupon.status
          : section === "expired"
            ? "expired"
            : "active",
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
