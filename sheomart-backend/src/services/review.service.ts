import { AppError } from "../errors/AppError";
import { Product } from "../models/product.model";
import { Review } from "../models/review.model";
import { USER_ROLES } from "../constants/roles";
import { CreateReviewInput, UpdateReviewInput, VisibilityInput } from "../validators/review.validator";

export class ReviewService {
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
