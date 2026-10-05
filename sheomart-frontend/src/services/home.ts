import api from "./api";
import type { ProductItem } from "@/types/marketplace";

export interface HeroShowcaseItem {
  id: string;
  type: "product" | "category" | "store";
  name: string;
  image: string;
  productId?: string;
  categoryId?: string;
  storeId?: string;
  rating?: number;
  deliveryEnabled?: boolean;
  badge?: "normal" | "verified" | "royal";
}

export interface HomeLocationParams {
  pincode?: string | null;
  city?: string | null;
}

export async function fetchHeroCarousel(params?: HomeLocationParams): Promise<HeroShowcaseItem[]> {
  const response = await api.get<{ data?: HeroShowcaseItem[] }>("/api/home/hero-carousel", {
    params: {
      pincode: params?.pincode?.trim() || undefined,
      city: params?.city?.trim() || undefined,
    },
  });
  return Array.isArray(response.data.data) ? response.data.data : [];
}

export async function fetchTrendingProducts(params?: HomeLocationParams): Promise<ProductItem[]> {
  const response = await api.get<{ data?: { products?: ProductItem[] } }>("/api/home/trending-products", {
    params: {
      pincode: params?.pincode?.trim() || undefined,
      city: params?.city?.trim() || undefined,
    },
  });
  return Array.isArray(response.data.data?.products) ? response.data.data.products : [];
}

export interface MarketplaceStats {
  approvedStores: number;
  totalProducts: number;
  happyCustomers: number;
  deliverySuccessRate: number;
  totalOrders: number;
}

export interface FeaturedReviewItem {
  reviewId: string;
  name: string;
  avatarText: string;
  rating: number;
  review: string;
  location: string;
  storeName: string;
  storeCity: string;
  storePincode: string;
  orderedItem: string;
  date: string;
}

export async function fetchMarketplaceStats(): Promise<MarketplaceStats> {
  const response = await api.get<{ data?: MarketplaceStats }>("/api/home/stats");
  return (
    response.data.data ?? {
      approvedStores: 0,
      totalProducts: 0,
      happyCustomers: 0,
      deliverySuccessRate: 99.4,
      totalOrders: 0,
    }
  );
}

export async function fetchFeaturedReviews(params?: HomeLocationParams): Promise<FeaturedReviewItem[]> {
  const response = await api.get<{ data?: { reviews?: FeaturedReviewItem[] } }>("/api/home/reviews", {
    params: {
      pincode: params?.pincode?.trim() || undefined,
      city: params?.city?.trim() || undefined,
    },
  });
  return Array.isArray(response.data.data?.reviews) ? response.data.data.reviews : [];
}

