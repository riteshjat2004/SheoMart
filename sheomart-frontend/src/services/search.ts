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
}

export interface SearchCategorySuggestion {
  categoryId: string;
  name: string;
  image?: string;
}

export interface SearchResults {
  products: SearchProductSuggestion[];
  stores: SearchStoreSuggestion[];
  categories: SearchCategorySuggestion[];
}

export async function fetchSearchResults(query: string): Promise<SearchResults> {
  const response = await api.get<{ data?: SearchResults }>("/api/v1/search", { params: { q: query } });
  return response.data.data ?? { products: [], stores: [], categories: [] };
}
