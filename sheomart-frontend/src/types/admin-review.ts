export interface AdminReview {
  reviewId: string;
  rating: number;
  title: string;
  comment: string;
  isVerifiedPurchase: boolean;
  isVisible: boolean;
  isDeleted: boolean;
  createdAt: string;
  updatedAt: string;
  reviewer: { userId: string; name: string } | null;
  product: { productId: string; name: string } | null;
  store: { storeId: string; storeName: string } | null;
}

export interface AdminReviewPagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface AdminReviewListResponse {
  reviews: AdminReview[];
  pagination: AdminReviewPagination;
}

export interface AdminReviewFilters {
  search?: string;
  productId?: string;
  storeId?: string;
  userId?: string;
  rating?: number;
  isVisible?: boolean;
  isDeleted?: boolean;
  isVerifiedPurchase?: boolean;
  page: number;
  limit: number;
  sortBy?: "createdAt" | "updatedAt" | "rating";
  sortOrder?: "asc" | "desc";
}
