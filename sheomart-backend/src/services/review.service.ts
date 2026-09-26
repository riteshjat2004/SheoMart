import { AppError } from "../errors/AppError";
import { Product } from "../models/product.model";
import { Review, REVIEW_STATUS, ReviewStatus, IReview } from "../models/review.model";
import { Store } from "../models/store.model";
import { User } from "../models/user.model";
import { Category } from "../models/category.model";
import { USER_ROLES } from "../constants/roles";
import {
  AdminReviewListQuery,
  BulkReviewActionInput,
  CreateReviewInput,
  ModerateReviewInput,
  UpdateReviewInput,
  VisibilityInput,
} from "../validators/review.validator";

export interface AdminReviewListItem {
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
  moderatedAt: Date | null;
  moderationReason: string | null;
  createdAt: Date;
  updatedAt: Date;
  reviewer: {
    userId: string;
    name: string;
    email: string;
    avatar: string;
    isVerifiedCustomer: boolean;
    role: string;
  } | null;
  product: {
    productId: string;
    name: string;
    thumbnail: string;
    sku: string;
    categoryName?: string;
  } | null;
  store: {
    storeId: string;
    storeName: string;
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

function escapeRegex(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

export class ReviewService {
  static async recalculateRatings(productId: string, storeId?: string) {
    const product = await Product.findOne({ productId });
    if (!product) return;

    const effectiveStoreId = storeId || product.storeId;

    // 1. Recalculate Product Rating (only approved, non-deleted, visible reviews)
    const productReviews = await Review.find({
      productId,
      status: REVIEW_STATUS.APPROVED,
      isDeleted: false,
      isVisible: true,
    });

    const totalProductReviews = productReviews.length;
    const avgProductRating =
      totalProductReviews > 0
        ? Number((productReviews.reduce((sum, r) => sum + r.rating, 0) / totalProductReviews).toFixed(1))
        : 0;

    product.rating = avgProductRating;
    product.totalReviews = totalProductReviews;
    await product.save();

    // 2. Recalculate Store Rating
    if (effectiveStoreId) {
      const store = await Store.findOne({ storeId: effectiveStoreId });
      if (store) {
        const storeProducts = await Product.find({ storeId: effectiveStoreId }).select("productId").lean();
        const pIds = storeProducts.map((p) => p.productId);

        const storeReviews = await Review.find({
          $or: [{ storeId: effectiveStoreId }, { productId: { $in: pIds } }],
          status: REVIEW_STATUS.APPROVED,
          isDeleted: false,
          isVisible: true,
        });

        const totalStoreReviews = storeReviews.length;
        const avgStoreRating =
          totalStoreReviews > 0
            ? Number((storeReviews.reduce((sum, r) => sum + r.rating, 0) / totalStoreReviews).toFixed(1))
            : 0;

        store.rating = avgStoreRating;
        store.totalReviews = totalStoreReviews;
        await store.save();
      }
    }
  }

  static async listAdminReviews(filters: AdminReviewListQuery) {
    const query: Record<string, unknown> = {};

    // Status filtering
    if (filters.status === "deleted") {
      query.isDeleted = true;
    } else if (filters.status && filters.status !== "all") {
      query.status = filters.status;
      query.isDeleted = false;
    } else {
      // Default: exclude soft-deleted unless explicitly requested
      query.isDeleted = false;
    }

    if (filters.productId) query.productId = filters.productId;
    if (filters.userId) query.userId = filters.userId;
    if (typeof filters.rating === "number") query.rating = filters.rating;
    if (typeof filters.isVisible === "boolean") query.isVisible = filters.isVisible;
    if (typeof filters.isVerifiedPurchase === "boolean") query.isVerifiedPurchase = filters.isVerifiedPurchase;

    if (filters.isReported) {
      query.reportCount = { $gt: 0 };
    }

    if (filters.from || filters.to) {
      const dateQuery: Record<string, Date> = {};
      if (filters.from) dateQuery.$gte = new Date(filters.from);
      if (filters.to) dateQuery.$lte = new Date(filters.to);
      query.createdAt = dateQuery;
    }

    if (filters.storeId) {
      const products = await Product.find({ storeId: filters.storeId }).select("productId").lean();
      const pIds = products.map((p) => p.productId);
      query.$or = [{ storeId: filters.storeId }, { productId: { $in: pIds } }];
    }

    if (filters.categoryId) {
      const products = await Product.find({ categoryId: filters.categoryId }).select("productId").lean();
      query.productId = { $in: products.map((p) => p.productId) };
    }

    if (filters.search) {
      const search = new RegExp(escapeRegex(filters.search), "i");
      const [users, products, stores] = await Promise.all([
        User.find({ $or: [{ name: search }, { email: search }] }).select("userId").lean(),
        Product.find({ name: search }).select("productId storeId").lean(),
        Store.find({ storeName: search }).select("storeId").lean(),
      ]);

      const storeIds = stores.map((s) => s.storeId);
      const storeProducts =
        storeIds.length > 0 ? await Product.find({ storeId: { $in: storeIds } }).select("productId").lean() : [];

      const productIds = [
        ...new Set([...products.map((p) => p.productId), ...storeProducts.map((p) => p.productId)]),
      ];

      query.$or = [
        { title: search },
        { comment: search },
        { userId: { $in: users.map((u) => u.userId) } },
        { productId: { $in: productIds } },
      ];
    }

    const skip = (filters.page - 1) * filters.limit;
    const sortDirection: 1 | -1 = filters.sortOrder === "asc" ? 1 : -1;
    const sort = { [filters.sortBy]: sortDirection };

    const [reviews, total, stats] = await Promise.all([
      Review.find(query).sort(sort).skip(skip).limit(filters.limit).lean(),
      Review.countDocuments(query),
      this.getAdminReviewStats(),
    ]);

    // Data enrichment
    const userIds = [...new Set(reviews.map((r) => r.userId))];
    const productIds = [...new Set(reviews.map((r) => r.productId))];

    const [users, products] = await Promise.all([
      User.find({ userId: { $in: userIds } })
        .select("userId name email avatar isVerifiedCustomer role")
        .lean(),
      Product.find({ productId: { $in: productIds } })
        .select("productId name thumbnail sku categoryId storeId")
        .lean(),
    ]);

    const categoryIds = [...new Set(products.map((p) => p.categoryId).filter(Boolean))];
    const storeIds = [...new Set(products.map((p) => p.storeId).filter(Boolean))];

    const [categories, stores] = await Promise.all([
      Category.find({ categoryId: { $in: categoryIds } }).select("categoryId name").lean(),
      Store.find({ storeId: { $in: storeIds } }).select("storeId storeName").lean(),
    ]);

    const userMap = new Map(users.map((u) => [u.userId, u]));
    const productMap = new Map(products.map((p) => [p.productId, p]));
    const categoryMap = new Map(categories.map((c) => [c.categoryId, c.name]));
    const storeMap = new Map(stores.map((s) => [s.storeId, s]));

    const formattedReviews: AdminReviewListItem[] = reviews.map((r) => {
      const u = userMap.get(r.userId);
      const p = productMap.get(r.productId);
      const st = p ? storeMap.get(p.storeId) : undefined;
      const catName = p?.categoryId ? categoryMap.get(p.categoryId) : undefined;

      return {
        reviewId: r.reviewId,
        rating: r.rating,
        title: r.title,
        comment: r.comment,
        images: r.images || [],
        isVerifiedPurchase: Boolean(r.isVerifiedPurchase),
        isVisible: Boolean(r.isVisible),
        isDeleted: Boolean(r.isDeleted),
        status: (r.status as ReviewStatus) || (r.isDeleted ? "deleted" : !r.isVisible ? "hidden" : "approved"),
        reportCount: r.reportCount || 0,
        reportReasons: r.reportReasons || [],
        moderatedBy: r.moderatedBy || null,
        moderatedAt: r.moderatedAt || null,
        moderationReason: r.moderationReason || null,
        createdAt: r.createdAt,
        updatedAt: r.updatedAt,
        reviewer: u
          ? {
              userId: u.userId,
              name: u.name,
              email: u.email,
              avatar: u.avatar || "",
              isVerifiedCustomer: Boolean(u.isVerifiedCustomer),
              role: u.role,
            }
          : null,
        product: p
          ? {
              productId: p.productId,
              name: p.name,
              thumbnail: p.thumbnail || "",
              sku: p.sku || "",
              categoryName: catName,
            }
          : null,
        store: st
          ? {
              storeId: st.storeId,
              storeName: st.storeName,
            }
          : null,
      };
    });

    return {
      reviews: formattedReviews,
      pagination: {
        page: filters.page,
        limit: filters.limit,
        total,
        totalPages: Math.ceil(total / filters.limit) || 1,
      },
      stats,
    };
  }

  static async getAdminReviewStats(): Promise<ReviewStats> {
    const [
      total,
      pending,
      approved,
      rejected,
      hidden,
      reported,
      deleted,
      ratingDistResult,
      avgResult,
    ] = await Promise.all([
      Review.countDocuments({ isDeleted: false }),
      Review.countDocuments({ status: REVIEW_STATUS.PENDING, isDeleted: false }),
      Review.countDocuments({ status: REVIEW_STATUS.APPROVED, isDeleted: false, isVisible: true }),
      Review.countDocuments({ status: REVIEW_STATUS.REJECTED, isDeleted: false }),
      Review.countDocuments({
        $or: [{ status: REVIEW_STATUS.HIDDEN }, { isVisible: false }],
        isDeleted: false,
      }),
      Review.countDocuments({
        $or: [{ status: REVIEW_STATUS.REPORTED }, { reportCount: { $gt: 0 } }],
        isDeleted: false,
      }),
      Review.countDocuments({ isDeleted: true }),
      Review.aggregate([
        { $match: { isDeleted: false } },
        { $group: { _id: "$rating", count: { $sum: 1 } } },
      ]),
      Review.aggregate([
        { $match: { isDeleted: false, isVisible: true, status: REVIEW_STATUS.APPROVED } },
        { $group: { _id: null, avg: { $avg: "$rating" } } },
      ]),
    ]);

    const distMap: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    ratingDistResult.forEach((item: { _id: number; count: number }) => {
      if (item._id >= 1 && item._id <= 5) {
        distMap[item._id] = item.count;
      }
    });

    const averageRating = avgResult[0]?.avg ? Number(avgResult[0].avg.toFixed(1)) : 0;

    return {
      total,
      averageRating,
      pending,
      approved,
      rejected,
      hidden,
      reported,
      deleted,
      ratingDistribution: {
        1: distMap[1],
        2: distMap[2],
        3: distMap[3],
        4: distMap[4],
        5: distMap[5],
      },
    };
  }

  static async getReviewDetails(reviewId: string) {
    const review = await Review.findOne({ reviewId }).lean();
    if (!review) {
      throw new AppError("Review not found", 404);
    }

    const [user, product] = await Promise.all([
      User.findOne({ userId: review.userId })
        .select("userId name email avatar isVerifiedCustomer role createdAt")
        .lean(),
      Product.findOne({ productId: review.productId })
        .select("productId name thumbnail sku categoryId storeId price")
        .lean(),
    ]);

    let store = null;
    let category = null;

    if (product) {
      if (product.storeId) {
        store = await Store.findOne({ storeId: product.storeId })
          .select("storeId storeName logo rating totalReviews status")
          .lean();
      }
      if (product.categoryId) {
        category = await Category.findOne({ categoryId: product.categoryId })
          .select("categoryId name")
          .lean();
      }
    }

    return {
      review,
      reviewer: user,
      product: product ? { ...product, categoryName: category?.name } : null,
      store,
    };
  }

  static async moderateReview(
    reviewId: string,
    data: ModerateReviewInput,
    adminUserId: string
  ) {
    const review = await Review.findOne({ reviewId });
    if (!review) {
      throw new AppError("Review not found", 404);
    }

    review.status = data.status;
    review.moderatedBy = adminUserId;
    review.moderatedAt = new Date();
    review.moderationReason = data.reason || `Status updated to ${data.status} by administrator`;

    if (data.status === REVIEW_STATUS.APPROVED) {
      review.isVisible = true;
      review.isDeleted = false;
    } else if (data.status === REVIEW_STATUS.REJECTED || data.status === REVIEW_STATUS.HIDDEN) {
      review.isVisible = false;
    }

    await review.save();
    await this.recalculateRatings(review.productId, review.storeId);

    return review;
  }

  static async softDeleteReview(reviewId: string, adminUserId: string) {
    const review = await Review.findOne({ reviewId });
    if (!review) {
      throw new AppError("Review not found", 404);
    }

    review.isDeleted = true;
    review.status = REVIEW_STATUS.DELETED;
    review.isVisible = false;
    review.deletedAt = new Date();
    review.deletedBy = adminUserId;

    await review.save();
    await this.recalculateRatings(review.productId, review.storeId);

    return {
      message: "Review moved to trash successfully",
    };
  }

  static async restoreReview(reviewId: string, adminUserId: string) {
    const review = await Review.findOne({ reviewId });
    if (!review) {
      throw new AppError("Review not found", 404);
    }

    review.isDeleted = false;
    review.status = REVIEW_STATUS.APPROVED;
    review.isVisible = true;
    review.deletedAt = null;
    review.deletedBy = null;
    review.moderatedBy = adminUserId;
    review.moderatedAt = new Date();
    review.moderationReason = "Restored by administrator";

    await review.save();
    await this.recalculateRatings(review.productId, review.storeId);

    return review;
  }

  static async markSpamOrAbuse(reviewId: string, type: "spam" | "abuse", adminUserId: string) {
    const review = await Review.findOne({ reviewId });
    if (!review) {
      throw new AppError("Review not found", 404);
    }

    review.status = REVIEW_STATUS.REJECTED;
    review.isVisible = false;
    review.moderatedBy = adminUserId;
    review.moderatedAt = new Date();
    review.moderationReason = `Flagged as ${type} by administrator`;

    await review.save();
    await this.recalculateRatings(review.productId, review.storeId);

    return review;
  }

  static async reportReview(reviewId: string, reason: string) {
    const review = await Review.findOne({ reviewId, isDeleted: false });
    if (!review) {
      throw new AppError("Review not found", 404);
    }

    review.reportCount = (review.reportCount || 0) + 1;
    if (!review.reportReasons) review.reportReasons = [];
    review.reportReasons.push(reason);

    if (review.status === REVIEW_STATUS.APPROVED) {
      review.status = REVIEW_STATUS.REPORTED;
    }

    await review.save();
    return review;
  }

  static async bulkReviewAction(data: BulkReviewActionInput, adminUserId: string) {
    const reviews = await Review.find({ reviewId: { $in: data.reviewIds } });
    if (reviews.length === 0) {
      throw new AppError("No matching reviews found", 404);
    }

    const affectedProductIds = new Set<string>();
    const affectedStoreIds = new Set<string>();

    for (const review of reviews) {
      affectedProductIds.add(review.productId);
      if (review.storeId) affectedStoreIds.add(review.storeId);

      switch (data.action) {
        case "approve":
          review.status = REVIEW_STATUS.APPROVED;
          review.isVisible = true;
          review.isDeleted = false;
          review.moderatedBy = adminUserId;
          review.moderatedAt = new Date();
          review.moderationReason = data.reason || "Bulk approved by admin";
          break;
        case "reject":
          review.status = REVIEW_STATUS.REJECTED;
          review.isVisible = false;
          review.moderatedBy = adminUserId;
          review.moderatedAt = new Date();
          review.moderationReason = data.reason || "Bulk rejected by admin";
          break;
        case "hide":
          review.status = REVIEW_STATUS.HIDDEN;
          review.isVisible = false;
          review.moderatedBy = adminUserId;
          review.moderatedAt = new Date();
          review.moderationReason = data.reason || "Bulk hidden by admin";
          break;
        case "unhide":
          review.status = REVIEW_STATUS.APPROVED;
          review.isVisible = true;
          review.moderatedBy = adminUserId;
          review.moderatedAt = new Date();
          review.moderationReason = data.reason || "Bulk unhidden by admin";
          break;
        case "delete":
          review.isDeleted = true;
          review.status = REVIEW_STATUS.DELETED;
          review.isVisible = false;
          review.deletedAt = new Date();
          review.deletedBy = adminUserId;
          break;
        case "restore":
          review.isDeleted = false;
          review.status = REVIEW_STATUS.APPROVED;
          review.isVisible = true;
          review.deletedAt = null;
          review.deletedBy = null;
          review.moderatedBy = adminUserId;
          review.moderatedAt = new Date();
          review.moderationReason = data.reason || "Bulk restored by admin";
          break;
        case "mark_spam":
        case "mark_abuse":
          review.status = REVIEW_STATUS.REJECTED;
          review.isVisible = false;
          review.moderatedBy = adminUserId;
          review.moderatedAt = new Date();
          review.moderationReason = `Flagged as ${data.action.replace("mark_", "")} by admin`;
          break;
      }
      await review.save();
    }

    // Recalculate ratings for all affected products and stores
    for (const pId of affectedProductIds) {
      await this.recalculateRatings(pId);
    }

    return {
      action: data.action,
      affectedCount: reviews.length,
      message: `Successfully executed ${data.action} on ${reviews.length} reviews`,
    };
  }

  // --- End Admin Methods ---

  private static async getProduct(productId: string) {
    const product = await Product.findOne({ productId, isActive: true });
    if (!product) {
      throw new AppError("Product not found", 404);
    }
    return product;
  }

  static async createReview(productId: string, data: CreateReviewInput, userId: string, role?: string) {
    if (role !== USER_ROLES.CUSTOMER) {
      throw new AppError("Only customers can create reviews", 403);
    }

    const product = await this.getProduct(productId);

    const existingReview = await Review.findOne({ productId, userId, isDeleted: false });
    if (existingReview) {
      throw new AppError("You have already reviewed this product", 409);
    }

    if (product.createdBy === userId) {
      throw new AppError("Store owners cannot review their own products", 403);
    }

    const review = await Review.create({
      productId,
      storeId: product.storeId || "",
      userId,
      rating: data.rating,
      title: data.title || "",
      comment: data.comment || "",
      images: data.images || [],
      isVerifiedPurchase: data.isVerifiedPurchase ?? false,
      isVisible: true,
      isDeleted: false,
      status: REVIEW_STATUS.APPROVED,
    });

    await this.recalculateRatings(productId, product.storeId);
    return review;
  }

  static async getProductReviews(productId: string) {
    const product = await this.getProduct(productId);
    const reviews = await Review.find({
      productId,
      isDeleted: false,
      isVisible: true,
      status: REVIEW_STATUS.APPROVED,
    }).sort({ createdAt: -1 });

    return { product, reviews };
  }

  static async getReview(reviewId: string) {
    const review = await Review.findOne({ reviewId, isDeleted: false });
    if (!review) {
      throw new AppError("Review not found", 404);
    }
    return review;
  }

  static async updateReview(reviewId: string, data: UpdateReviewInput, userId: string) {
    const review = await Review.findOne({ reviewId, isDeleted: false });
    if (!review) {
      throw new AppError("Review not found", 404);
    }

    if (review.userId !== userId) {
      throw new AppError("Unauthorized", 403);
    }

    if (data.rating !== undefined) review.rating = data.rating;
    if (data.title !== undefined) review.title = data.title;
    if (data.comment !== undefined) review.comment = data.comment;
    if (data.images !== undefined) review.images = data.images;
    if (data.isVerifiedPurchase !== undefined) review.isVerifiedPurchase = data.isVerifiedPurchase;

    await review.save();
    await this.recalculateRatings(review.productId, review.storeId);
    return review;
  }

  static async deleteReview(reviewId: string, userId: string) {
    const review = await Review.findOne({ reviewId, isDeleted: false });
    if (!review) {
      throw new AppError("Review not found", 404);
    }

    if (review.userId !== userId) {
      throw new AppError("Unauthorized", 403);
    }

    review.isDeleted = true;
    review.isVisible = false;
    review.status = REVIEW_STATUS.DELETED;
    review.deletedAt = new Date();

    await review.save();
    await this.recalculateRatings(review.productId, review.storeId);
    return review;
  }

  static async updateVisibility(reviewId: string, data: VisibilityInput, role?: string) {
    if (role !== USER_ROLES.PLATFORM_ADMIN) {
      throw new AppError("Unauthorized", 403);
    }

    const review = await Review.findOne({ reviewId, isDeleted: false });
    if (!review) {
      throw new AppError("Review not found", 404);
    }

    review.isVisible = data.isVisible;
    review.status = data.isVisible ? REVIEW_STATUS.APPROVED : REVIEW_STATUS.HIDDEN;
    await review.save();
    await this.recalculateRatings(review.productId, review.storeId);
    return review;
  }
}

