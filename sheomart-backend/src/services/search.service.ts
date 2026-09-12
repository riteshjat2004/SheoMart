import { Category } from "../models/category.model";
import { Product } from "../models/product.model";
import { Store } from "../models/store.model";
import { STORE_STATUS } from "../constants/store";

const escapeRegex = (value: string) => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

export class SearchService {
  static async search(query: string) {
    const search = query.trim();
    const regex = new RegExp(escapeRegex(search), "i");
    const categories = await Category.find({ isActive: true, name: regex })
      .select("categoryId name image")
      .limit(8)
      .lean();
    const categoryIdsForQuery = categories.map((category) => category.categoryId);
    const [products, stores] = await Promise.all([
      Product.find({
        isActive: true,
        isPublished: true,
        $or: [
          { name: regex },
          { description: regex },
          { brand: regex },
          { categoryId: { $in: categoryIdsForQuery } },
        ],
      }).select("productId name thumbnail discountPrice categoryId").limit(8).lean(),
      Store.find({ status: STORE_STATUS.APPROVED, storeName: regex })
        .select("storeId storeName logo rating deliveryEnabled")
        .limit(8)
        .lean(),
    ]);

    const categoryIds = [...new Set(products.map((product) => product.categoryId))];
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

    products.sort((first, second) => scoreProduct(first) - scoreProduct(second));

    return {
      products: products.slice(0, 8).map((product) => ({
        productId: product.productId,
        name: product.name,
        thumbnail: product.thumbnail,
        discountPrice: product.discountPrice,
        categoryName: categoryMap.get(product.categoryId),
      })),
      stores: stores.slice(0, 8).map((store) => ({
        storeId: store.storeId,
        storeName: store.storeName,
        logo: store.logo,
        rating: store.rating,
        deliveryEnabled: store.deliveryEnabled === true,
      })),
      categories: categories.slice(0, 8).map((category) => ({
        categoryId: category.categoryId,
        name: category.name,
        image: category.image,
      })),
    };
  }
}
