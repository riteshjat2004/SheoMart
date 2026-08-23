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
}

export class HomeService {
  static async getTrendingProducts() {
    const products = await Product.find({ isActive: true, isPublished: true }).sort({ createdAt: -1 });
    return products.slice(0, 8);
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
        { $project: { storeId: 1, storeName: 1, banner: 1, logo: 1, rating: 1 } },
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
      })),
    ];
  }
}
