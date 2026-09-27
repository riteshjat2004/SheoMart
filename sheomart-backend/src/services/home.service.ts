import { Category } from "../models/category.model";
import { Product } from "../models/product.model";
import { Store } from "../models/store.model";
import { STORE_STATUS } from "../constants/store";

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

export class HomeService {
  /**
   * Homepage Trending Products (Admin Featured Products as ONLY Source of Truth)
   * Displays products marked as isFeatured: true by Admin.
   * Enforces business rules:
   * - Must be active, published, not deleted
   * - Must have available stock (quantity > 0)
   * - Must belong to an active, approved, non-suspended store
   * - Ordered by featuredPriority DESC, featuredAt DESC, updatedAt DESC
   */
  static async getTrendingProducts() {
    const featuredProducts = await Product.aggregate([
      {
        $match: {
          isFeatured: true,
          isActive: true,
          isPublished: true,
          isDeleted: { $ne: true },
        },
      },
      {
        $lookup: {
          from: "stores",
          localField: "storeId",
          foreignField: "storeId",
          as: "storeData",
        },
      },
      {
        $unwind: "$storeData",
      },
      {
        $match: {
          "storeData.status": STORE_STATUS.APPROVED,
          "storeData.isActive": { $ne: false },
          "storeData.isDeleted": { $ne: true },
        },
      },
      {
        $lookup: {
          from: "categories",
          localField: "categoryId",
          foreignField: "categoryId",
          as: "categoryData",
        },
      },
      {
        $unwind: {
          path: "$categoryData",
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $addFields: {
          inStock: { $cond: [{ $gt: ["$quantity", 0] }, 1, 0] },
        },
      },
      {
        $sort: {
          inStock: -1,
          featuredPriority: -1,
          featuredAt: -1,
          updatedAt: -1,
          createdAt: -1,
        },
      },
      {
        $limit: 12,
      },
      {
        $project: {
          _id: 1,
          productId: 1,
          storeId: 1,
          categoryId: 1,
          name: 1,
          slug: 1,
          description: 1,
          brand: 1,
          sku: 1,
          price: 1,
          discountPrice: 1,
          quantity: 1,
          thumbnail: 1,
          images: 1,
          image: 1,
          isActive: 1,
          isPublished: 1,
          isFeatured: 1,
          featuredPriority: 1,
          featuredAt: 1,
          isBestseller: 1,
          isTrending: 1,
          rating: 1,
          totalReviews: 1,
          createdAt: 1,
          updatedAt: 1,
          store: "$storeData.storeName",
          storeBadge: "$storeData.badge",
          category: "$categoryData.name",
        },
      },
    ]);

    let finalProducts = [...featuredProducts];

    // Ensure at least 8 trending products are always visible on the homepage
    if (finalProducts.length < 8) {
      const existingProductIds = finalProducts.map((p) => p.productId).filter(Boolean);
      const needed = 8 - finalProducts.length;

      const fallbackProducts = await Product.aggregate([
        {
          $match: {
            productId: { $nin: existingProductIds },
            isActive: true,
            isPublished: true,
            isDeleted: { $ne: true },
          },
        },
        {
          $lookup: {
            from: "stores",
            localField: "storeId",
            foreignField: "storeId",
            as: "storeData",
          },
        },
        {
          $unwind: "$storeData",
        },
        {
          $match: {
            "storeData.status": STORE_STATUS.APPROVED,
            "storeData.isActive": { $ne: false },
            "storeData.isDeleted": { $ne: true },
          },
        },
        {
          $lookup: {
            from: "categories",
            localField: "categoryId",
            foreignField: "categoryId",
            as: "categoryData",
          },
        },
        {
          $unwind: {
            path: "$categoryData",
            preserveNullAndEmptyArrays: true,
          },
        },
        {
          $addFields: {
            inStock: { $cond: [{ $gt: ["$quantity", 0] }, 1, 0] },
          },
        },
        {
          $sort: {
            inStock: -1,
            quantity: -1,
            rating: -1,
            createdAt: -1,
          },
        },
        {
          $limit: needed,
        },
        {
          $project: {
            _id: 1,
            productId: 1,
            storeId: 1,
            categoryId: 1,
            name: 1,
            slug: 1,
            description: 1,
            brand: 1,
            sku: 1,
            price: 1,
            discountPrice: 1,
            quantity: 1,
            thumbnail: 1,
            images: 1,
            image: 1,
            isActive: 1,
            isPublished: 1,
            isFeatured: 1,
            featuredPriority: 1,
            featuredAt: 1,
            isBestseller: 1,
            isTrending: 1,
            rating: 1,
            totalReviews: 1,
            createdAt: 1,
            updatedAt: 1,
            store: "$storeData.storeName",
            storeBadge: "$storeData.badge",
            category: "$categoryData.name",
          },
        },
      ]);

      finalProducts = [...finalProducts, ...fallbackProducts];
    }

    return finalProducts;
  }

  static async getHeroCarousel(): Promise<HeroShowcaseItem[]> {
    const [products, categories, stores] = await Promise.all([
      Product.aggregate([
        { $match: { isActive: true, isPublished: true } },
        { $sample: { size: 2 } },
        { $project: { productId: 1, name: 1, thumbnail: 1, images: 1, storeId: 1 } },
      ]),
      Category.aggregate([
        { $match: { isActive: true } },
        { $sample: { size: 2 } },
        { $project: { categoryId: 1, name: 1, image: 1 } },
      ]),
      Store.aggregate([
        { $match: { status: STORE_STATUS.APPROVED } },
        { $sample: { size: 1 } },
        { $project: { storeId: 1, storeName: 1, banner: 1, logo: 1, rating: 1, deliveryEnabled: 1, badge: 1 } },
      ]),
    ]);

    return [
      ...products.map((product) => ({
        id: product.productId,
        type: "product" as const,
        name: product.name,
        image: product.thumbnail || product.images?.[0] || "",
        productId: product.productId,
      })),
      ...categories.map((category) => ({
        id: category.categoryId,
        type: "category" as const,
        name: category.name,
        image: category.image || "",
        categoryId: category.categoryId,
      })),
      ...stores.map((store) => ({
        id: store.storeId,
        type: "store" as const,
        name: store.storeName,
        image: store.banner || store.logo || "",
        storeId: store.storeId,
        rating: store.rating,
        deliveryEnabled: store.deliveryEnabled === true,
        badge: store.badge,
      })),
    ];
  }
}
