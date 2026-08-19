import { AppError } from "../errors/AppError";
import { Product } from "../models/product.model";
import { Review } from "../models/review.model";
import { Store } from "../models/store.model";
import { User } from "../models/user.model";
import { USER_ROLES } from "../constants/roles";
import { AdminReviewListQuery, CreateReviewInput, UpdateReviewInput, VisibilityInput } from "../validators/review.validator";

export interface AdminReviewListItem {
  reviewId: string;
  rating: number;
  title: string;
  comment: string;
  isVerifiedPurchase: boolean;
  isVisible: boolean;
  isDeleted: boolean;
  createdAt: Date;
  updatedAt: Date;
  reviewer: { userId: string; name: string } | null;
  product: { productId: string; name: string } | null;
  store: { storeId: string; storeName: string } | null;
}

function escapeRegex(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function mapAdminReview(review: AdminReviewListItem): AdminReviewListItem {
  return {
    reviewId: review.reviewId,
    rating: review.rating,
    title: review.title,
    comment: review.comment,
    isVerifiedPurchase: review.isVerifiedPurchase,
    isVisible: review.isVisible,
    isDeleted: review.isDeleted,
    createdAt: review.createdAt,
    updatedAt: review.updatedAt,
    reviewer: review.reviewer,
    product: review.product,
    store: review.store,
  };
}

export class ReviewService {
  static async listAdminReviews(filters: AdminReviewListQuery) {
    const query: Record<string, unknown> = {};

    if (filters.productId) query.productId = filters.productId;
    if (filters.userId) query.userId = filters.userId;
    if (typeof filters.rating === "number") query.rating = filters.rating;
    if (typeof filters.isVisible === "boolean") query.isVisible = filters.isVisible;
    if (typeof filters.isDeleted === "boolean") query.isDeleted = filters.isDeleted;
    if (typeof filters.isVerifiedPurchase === "boolean") query.isVerifiedPurchase = filters.isVerifiedPurchase;

    if (filters.storeId) {
      const products = await Product.find({ storeId: filters.storeId }).select("productId").lean();
      query.productId = { $in: products.map((product) => product.productId) };
    }

    if (filters.search) {
      const search = new RegExp(escapeRegex(filters.search), "i");
      const [users, products, stores] = await Promise.all([
        User.find({ name: search }).select("userId").lean(),
        Product.find({ name: search }).select("productId storeId").lean(),
        Store.find({ storeName: search }).select("storeId").lean(),
      ]);
      const storeIds = stores.map((store) => store.storeId);
      const storeProducts = storeIds.length > 0
        ? await Product.find({ storeId: { $in: storeIds } }).select("productId").lean()
        : [];
      const productIds = [...new Set([
        ...products.map((product) => product.productId),
        ...storeProducts.map((product) => product.productId),
      ])];

      query.$or = [
        { title: search },
        { comment: search },
        { userId: { $in: users.map((user) => user.userId) } },
        { productId: { $in: productIds } },
      ];
    }

    const skip = (filters.page - 1) * filters.limit;
    const sortDirection: 1 | -1 = filters.sortOrder === "asc" ? 1 : -1;
    const sort = { [filters.sortBy]: sortDirection };
    const safeFields = "reviewId productId userId rating title comment isVerifiedPurchase isVisible isDeleted createdAt updatedAt";

    const [reviews, total] = await Promise.all([
      Review.find(query).select(safeFields).sort(sort).skip(skip).limit(filters.limit).lean(),
      Review.countDocuments(query),
    ]);

    const userIds = [...new Set(reviews.map((review) => review.userId))];
    const productIds = [...new Set(reviews.map((review) => review.productId))];
    const [users, products] = await Promise.all([
      User.find({ userId: { $in: userIds } }).select("userId name").lean(),
      Product.find({ productId: { $in: productIds } }).select("productId name storeId").lean(),
    ]);
    const storeIds = [...new Set(products.map((product) => product.storeId))];
    const stores = await Store.find({ storeId: { $in: storeIds } }).select("storeId storeName").lean();
    const userMap = new Map(users.map((user) => [user.userId, user]));
    const productMap = new Map(products.map((product) => [product.productId, product]));
    const storeMap = new Map(stores.map((store) => [store.storeId, store]));

    return {
      reviews: reviews.map((review) => {
        const user = userMap.get(review.userId);
        const product = productMap.get(review.productId);
        const store = product ? storeMap.get(product.storeId) : undefined;

        return mapAdminReview({
          reviewId: review.reviewId,
          rating: review.rating,
          title: review.title,
          comment: review.comment,
          isVerifiedPurchase: review.isVerifiedPurchase,
          isVisible: review.isVisible,
          isDeleted: review.isDeleted,
          createdAt: review.createdAt,
          updatedAt: review.updatedAt,
          reviewer: user ? { userId: user.userId, name: user.name } : null,
          product: product ? { productId: product.productId, name: product.name } : null,
          store: store ? { storeId: store.storeId, storeName: store.storeName } : null,
        });
      }),
      pagination: {
        page: filters.page,
        limit: filters.limit,
        total,
        totalPages: Math.ceil(total / filters.limit),
      },
    };
  }

  private static async getProduct(productId: string) {
    const product = await Product.findOne({ productId, isActive: true });

    if (!product) {
      throw new AppError("Product not found", 404);
    }

    return product;
  }

  private static async recalculateProductRating(productId: string) {
    const product = await Product.findOne({ productId, isActive: true });

    if (!product) {
      return;
    }

    const reviews = await Review.find({ productId, isDeleted: false, isVisible: true });
    const totalReviews = reviews.length;
    const averageRating = totalReviews > 0
      ? Number((reviews.reduce((sum, review) => sum + review.rating, 0) / totalReviews).toFixed(1))
      : 0;

    product.rating = averageRating;
    product.totalReviews = totalReviews;
    await product.save();
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
      userId,
      rating: data.rating,
      title: data.title || "",
      comment: data.comment || "",
      isVerifiedPurchase: data.isVerifiedPurchase ?? false,
      isVisible: true,
      isDeleted: false,
    });

    await this.recalculateProductRating(productId);
    return review;
  }

  static async getProductReviews(productId: string) {
    const product = await this.getProduct(productId);
    const reviews = await Review.find({ productId, isDeleted: false, isVisible: true }).sort({ createdAt: -1 });

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

    if (data.rating !== undefined) {
      review.rating = data.rating;
    }

    if (data.title !== undefined) {
      review.title = data.title;
    }

    if (data.comment !== undefined) {
      review.comment = data.comment;
    }

    if (data.isVerifiedPurchase !== undefined) {
      review.isVerifiedPurchase = data.isVerifiedPurchase;
    }

    await review.save();
    await this.recalculateProductRating(review.productId);
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
    await review.save();
    await this.recalculateProductRating(review.productId);
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
    await review.save();
    await this.recalculateProductRating(review.productId);
    return review;
  }
}
