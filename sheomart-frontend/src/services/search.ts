import api from "./api";

export interface SearchProductSuggestion {
  productId: string;
  name: string;
  thumbnail?: string;
  discountPrice?: number;
  categoryName?: string;
}

export interface SearchStoreSuggestion {
  storeId: string;
  storeName: string;
  logo?: string;
  rating?: number;
  deliveryEnabled?: boolean;
}

export interface SearchCategorySuggestion {
  categoryId: string;
  name: string;
  image?: string;
}

export interface SearchPagination {
  page: number;
  limit: number;
  totalProducts: number;
  totalStores: number;
  totalCategories: number;
}

export interface SearchResults {
  products: SearchProductSuggestion[];
  stores: SearchStoreSuggestion[];
  categories: SearchCategorySuggestion[];
  pagination?: SearchPagination;
}

export async function fetchSearchResults(
  query: string,
  page: number = 1,
  limit: number = 8
): Promise<SearchResults> {
  const response = await api.get<{ data?: SearchResults }>("/api/v1/search", {
    params: { q: query, page, limit },
  });
  return response.data.data ?? { products: [], stores: [], categories: [] };
}

