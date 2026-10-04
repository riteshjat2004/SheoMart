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
  pincode?: string;
  city?: string;
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
