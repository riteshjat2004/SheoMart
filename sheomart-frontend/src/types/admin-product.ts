import type { CategoryItem, StoreItem, ProductVariant, NutritionalInfo } from "@/types/marketplace";

export type AdminProductInventoryStatus = "in_stock" | "low_stock" | "out_of_stock" | "discontinued" | "unavailable";

export interface AdminProduct {
  productId: string;
  name: string;
  sku: string;
  brand: string;
  price: number;
  discountPrice: number;
  sellingType?: "PIECE" | "WEIGHT" | "VOLUME";
  baseUnit?: string;
  unitLabel?: string;
  minQuantity?: number;
  stepQuantity?: number;
  allowCustomQuantity?: boolean;
  stockTrackingMode?: "SEPARATE" | "SHARED";
  hasNutritionalInfo?: boolean;
  nutritionalInfo?: NutritionalInfo | null;
  variants?: ProductVariant[];
  thumbnail: string;
  images?: string[];
  description?: string;
  isActive: boolean;
  isPublished: boolean;
  isDeleted?: boolean;
  isFeatured?: boolean;
  isBestseller?: boolean;
  isTrending?: boolean;
  quantity: number;
  inventoryStatus: AdminProductInventoryStatus;
  category: Pick<CategoryItem, "categoryId" | "name"> | null;
  store: Pick<StoreItem, "storeId" | "storeName" | "status"> | null;
  createdAt: string;
  updatedAt: string;
}

export interface AdminProductStats {
  total: number;
  active: number;
  draft: number;
  outOfStock: number;
  featured: number;
  deleted: number;
}

export interface AdminProductPagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface AdminProductListResponse {
  products: AdminProduct[];
  stats?: AdminProductStats;
  pagination: AdminProductPagination;
}

export interface AdminProductFilters {
  search?: string;
  storeId?: string;
  categoryId?: string;
  status?: string;
  isActive?: boolean;
  isPublished?: boolean;
  isDeleted?: boolean;
  isFeatured?: boolean;
  minPrice?: number;
  maxPrice?: number;
  inventoryStatus?: AdminProductInventoryStatus;
  page: number;
  limit: number;
  sortBy?: "createdAt" | "name" | "price" | "quantity";
  sortOrder?: "asc" | "desc";
}
