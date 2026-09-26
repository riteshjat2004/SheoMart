export type ReviewStatus = "pending" | "approved" | "rejected" | "hidden" | "reported" | "deleted";

export interface AdminReview {
  reviewId: string;
  rating: number;
  title: string;
  comment: string;
  images: string[];
  isVerifiedPurchase: boolean;
  isVisible: boolean;
  isDeleted: boolean;
  status: ReviewStatus;
  reportCount: number;
  reportReasons: string[];
  moderatedBy: string | null;
  moderatedAt: string | null;
  moderationReason: string | null;
  deletedAt?: string | null;
  deletedBy?: string | null;
  createdAt: string;
  updatedAt: string;
  reviewer: {
    userId: string;
    name: string;
    email?: string;
    avatar?: string;
    isVerifiedCustomer?: boolean;
    role?: string;
  } | null;
  product: {
    productId: string;
    name: string;
    thumbnail?: string;
    sku?: string;
    categoryName?: string;
  } | null;
  store: {
    storeId: string;
    storeName: string;
    logo?: string;
    rating?: number;
  } | null;
}

export interface ReviewStats {
  total: number;
  averageRating: number;
  pending: number;
  approved: number;
  rejected: number;
  hidden: number;
  reported: number;
  deleted: number;
  ratingDistribution: {
    1: number;
    2: number;
    3: number;
    4: number;
    5: number;
  };
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
  stats?: ReviewStats;
}

export interface AdminReviewFilters {
  search?: string;
  productId?: string;
  storeId?: string;
  userId?: string;
  categoryId?: string;
  rating?: number;
  status?: ReviewStatus | "all";
  isVisible?: boolean;
  isDeleted?: boolean;
  isVerifiedPurchase?: boolean;
  isReported?: boolean;
  from?: string;
  to?: string;
  page: number;
  limit: number;
  sortBy?: "createdAt" | "updatedAt" | "rating" | "reportCount";
  sortOrder?: "asc" | "desc";
}

