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

export async function fetchHeroCarousel(): Promise<HeroShowcaseItem[]> {
  const response = await api.get<{ data?: HeroShowcaseItem[] }>("/api/home/hero-carousel");
  return Array.isArray(response.data.data) ? response.data.data : [];
}

export async function fetchTrendingProducts(): Promise<ProductItem[]> {
  const response = await api.get<{ data?: { products?: ProductItem[] } }>("/api/home/trending-products");
  return Array.isArray(response.data.data?.products) ? response.data.data.products : [];
}
