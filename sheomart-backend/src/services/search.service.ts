import { Category } from "../models/category.model";
import { Product } from "../models/product.model";
import { Store } from "../models/store.model";
import { STORE_STATUS } from "../constants/store";

const escapeRegex = (value: string) => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

export class SearchService {
  static async search(query: string, page: number = 1, limit: number = 8) {
    const safePage = Math.max(1, page);
    const safeLimit = Math.min(Math.max(1, limit), 50);
    const skip = (safePage - 1) * safeLimit;

    const search = query.trim();
    const regex = new RegExp(escapeRegex(search), "i");

    const [allCategories, products, stores] = await Promise.all([
      Category.find({ isActive: true, name: regex })
        .select("categoryId name image")
        .lean(),
      Product.find({
        isActive: true,
        isPublished: true,
        $or: [
          { name: regex },
          { description: regex },
          { brand: regex },
        ],
      }).select("productId name thumbnail discountPrice categoryId brand").lean(),
      Store.find({ status: STORE_STATUS.APPROVED, storeName: regex })
        .select("storeId storeName logo rating deliveryEnabled")
        .lean(),
    ]);

    const categoryIdsForQuery = allCategories.map((category) => category.categoryId);

    // Also find products that match by category
    const productsByCategory = categoryIdsForQuery.length > 0
      ? await Product.find({
          isActive: true,
          isPublished: true,
          categoryId: { $in: categoryIdsForQuery },
        }).select("productId name thumbnail discountPrice categoryId brand").lean()
      : [];

    // Merge and deduplicate products
    const allProductsMap = new Map<string, typeof products[number]>();
    for (const p of [...products, ...productsByCategory]) {
      if (!allProductsMap.has(p.productId)) allProductsMap.set(p.productId, p);
    }
    const allProducts = Array.from(allProductsMap.values());

    const categoryIds = [...new Set(allProducts.map((product) => product.categoryId))];
    const productCategories = await Category.find({ categoryId: { $in: categoryIds } })
      .select("categoryId name")
      .lean();
    const categoryMap = new Map(productCategories.map((category) => [category.categoryId, category.name]));

    const lowerSearch = search.toLowerCase();
    const scoreProduct = (product: { name: string; brand?: string }) => {
      const name = product.name.toLowerCase();
      if (name === lowerSearch) return 0;
      if (name.startsWith(lowerSearch)) return 1;
      if (product.brand?.toLowerCase().includes(lowerSearch)) return 3;
      return 2;
    };

    allProducts.sort((first, second) => scoreProduct(first) - scoreProduct(second));

    const paginatedProducts = allProducts.slice(skip, skip + safeLimit);
    const paginatedStores = stores.slice(skip, skip + safeLimit);
    const paginatedCategories = allCategories.slice(skip, skip + safeLimit);

    return {
      products: paginatedProducts.map((product) => ({
        productId: product.productId,
        name: product.name,
        thumbnail: product.thumbnail,
        discountPrice: product.discountPrice,
        categoryName: categoryMap.get(product.categoryId),
      })),
      stores: paginatedStores.map((store) => ({
        storeId: store.storeId,
        storeName: store.storeName,
        logo: store.logo,
        rating: store.rating,
        deliveryEnabled: store.deliveryEnabled === true,
      })),
      categories: paginatedCategories.map((category) => ({
        categoryId: category.categoryId,
        name: category.name,
        image: category.image,
      })),
      pagination: {
        page: safePage,
        limit: safeLimit,
        totalProducts: allProducts.length,
        totalStores: stores.length,
        totalCategories: allCategories.length,
      },
    };
  }
}
