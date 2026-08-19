import type { CategoryItem, StoreItem } from "@/types/marketplace";

export type AdminProductInventoryStatus = "in_stock" | "low_stock" | "out_of_stock" | "discontinued" | "unavailable";

export interface AdminProduct {
  productId: string;
  name: string;
  sku: string;
  brand: string;
  price: number;
  discountPrice: number;
  thumbnail: string;
  isActive: boolean;
  isPublished: boolean;
  quantity: number;
  inventoryStatus: AdminProductInventoryStatus;
  category: Pick<CategoryItem, "categoryId" | "name"> | null;
  store: Pick<StoreItem, "storeId" | "storeName" | "status"> | null;
  createdAt: string;
  updatedAt: string;
}

export interface AdminProductPagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface AdminProductListResponse {
  products: AdminProduct[];
  pagination: AdminProductPagination;
}

export interface AdminProductFilters {
  search?: string;
  storeId?: string;
  categoryId?: string;
  isActive?: boolean;
  isPublished?: boolean;
  inventoryStatus?: AdminProductInventoryStatus;
  page: number;
  limit: number;
  sortBy?: "createdAt" | "name" | "price" | "quantity";
  sortOrder?: "asc" | "desc";
}
