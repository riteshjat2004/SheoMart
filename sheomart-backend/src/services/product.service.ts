import { AppError } from "../errors/AppError";
import { Category } from "../models/category.model";
import { Inventory } from "../models/inventory.model";
import { Product } from "../models/product.model";
import { Store } from "../models/store.model";
import { STORE_STATUS } from "../constants/store";
import {
  AddImagesInput,
  CreateProductInput,
  RemoveImageInput,
  UpdateProductInput,
  UpdateThumbnailInput,
  AdminProductListQuery,
} from "../validators/product.validator";
import { InventoryService } from "./inventory.service";

export interface AdminProductListItem {
  productId: string;
  name: string;
  sku: string;
  brand: string;
  price: number;
  discountPrice: number;
  thumbnail: string;
  isActive: boolean;
  isPublished: boolean;
  quantity: number;
  inventoryStatus: string;
  category: { categoryId: string; name: string } | null;
  store: { storeId: string; storeName: string; status: string } | null;
  createdAt: Date;
  updatedAt: Date;
}

function escapeRegex(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function mapAdminProduct(product: AdminProductListItem): AdminProductListItem {
  return {
    productId: product.productId,
    name: product.name,
    sku: product.sku,
    brand: product.brand,
    price: product.price,
    discountPrice: product.discountPrice,
    thumbnail: product.thumbnail,
    isActive: product.isActive,
    isPublished: product.isPublished,
    quantity: product.quantity,
    inventoryStatus: product.inventoryStatus,
    category: product.category,
    store: product.store,
    createdAt: product.createdAt,
    updatedAt: product.updatedAt,
  };
}

export class ProductService {
  static async listAdminProducts(filters: AdminProductListQuery) {
    const query: Record<string, unknown> = {};

    if (filters.storeId) query.storeId = filters.storeId;
    if (filters.categoryId) query.categoryId = filters.categoryId;
    if (typeof filters.isActive === "boolean") query.isActive = filters.isActive;
    if (typeof filters.isPublished === "boolean") query.isPublished = filters.isPublished;

    if (filters.search) {
      const search = new RegExp(escapeRegex(filters.search), "i");
      query.$or = [{ name: search }, { sku: search }, { brand: search }, { productId: search }];
    }

    if (filters.inventoryStatus) {
      const inventoryQuery = filters.inventoryStatus === "unavailable"
        ? { productId: { $exists: true } }
        : { status: filters.inventoryStatus };
      const inventories = await Inventory.find(inventoryQuery).select("productId").lean();
      const inventoryProductIds = inventories.map((inventory) => inventory.productId);
      query.productId = filters.inventoryStatus === "unavailable"
        ? { $nin: inventoryProductIds }
        : { $in: inventoryProductIds };
    }

    const skip = (filters.page - 1) * filters.limit;
    const sortDirection: 1 | -1 = filters.sortOrder === "asc" ? 1 : -1;
    const sort = { [filters.sortBy]: sortDirection };
    const safeFields = "productId name sku brand price discountPrice thumbnail isActive isPublished quantity categoryId storeId createdAt updatedAt";

    const [products, total] = await Promise.all([
      Product.find(query).select(safeFields).sort(sort).skip(skip).limit(filters.limit).lean(),
      Product.countDocuments(query),
    ]);

    const productIds = products.map((product) => product.productId);
    const categoryIds = [...new Set(products.map((product) => product.categoryId))];
    const storeIds = [...new Set(products.map((product) => product.storeId))];
    const [inventories, categories, stores] = await Promise.all([
      Inventory.find({ productId: { $in: productIds } }).select("productId availableQuantity status").lean(),
      Category.find({ categoryId: { $in: categoryIds } }).select("categoryId name").lean(),
      Store.find({ storeId: { $in: storeIds } }).select("storeId storeName status").lean(),
    ]);

    const inventoryMap = new Map(inventories.map((inventory) => [inventory.productId, inventory]));
    const categoryMap = new Map(categories.map((category) => [category.categoryId, category]));
    const storeMap = new Map(stores.map((store) => [store.storeId, store]));

    return {
      products: products.map((product) => {
        const inventory = inventoryMap.get(product.productId);
        const category = categoryMap.get(product.categoryId);
        const store = storeMap.get(product.storeId);

        return mapAdminProduct({
          productId: product.productId,
          name: product.name,
          sku: product.sku,
          brand: product.brand,
          price: product.price,
          discountPrice: product.discountPrice ?? 0,
          thumbnail: product.thumbnail ?? "",
          isActive: product.isActive,
          isPublished: product.isPublished,
          quantity: inventory?.availableQuantity ?? product.quantity ?? 0,
          inventoryStatus: inventory?.status ?? "unavailable",
          category: category ? { categoryId: category.categoryId, name: category.name } : null,
          store: store ? { storeId: store.storeId, storeName: store.storeName, status: store.status } : null,
          createdAt: product.createdAt,
          updatedAt: product.updatedAt,
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

  private static async getProductForMedia(productId: string) {
    const product = await Product.findOne({ productId, isActive: true });

    if (!product) {
      throw new AppError("Product not found", 404);
    }

    return product;
  }

  private static async validateProductAccess(product: { storeId: string }, userId: string, role?: string) {
    if (role === "platform_admin") {
      return;
    }

    const store = await Store.findOne({ ownerId: userId, storeId: product.storeId, status: STORE_STATUS.APPROVED });

    if (!store) {
      throw new AppError("Unauthorized", 403);
    }
  }

  private static generateSlug(name: string) {
    return name
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "") || "product";
  }

  private static async enrichProductsWithInventory<T extends { productId?: string; quantity?: number }>(products: T[]) {
    const productIds = products
      .map((product) => product.productId)
      .filter((productId): productId is string => Boolean(productId));

    if (productIds.length === 0) {
      return products;
    }

    const inventories = await Inventory.find({ productId: { $in: productIds } }).lean();
    const inventoryMap = new Map(inventories.map((inventory) => [inventory.productId, inventory.availableQuantity ?? 0]));

    for (const product of products) {
      if (!product.productId) {
        continue;
      }

      const availableQuantity = inventoryMap.get(product.productId);
      if (typeof availableQuantity === "number") {
        product.quantity = availableQuantity;
      }
    }

    return products;
  }

  private static async buildUniqueSlug(name: string) {
    const baseSlug = this.generateSlug(name);
    let slug = baseSlug;
    let counter = 1;

    while (await Product.findOne({ slug })) {
      slug = `${baseSlug}-${counter}`;
      counter += 1;
    }

    return slug;
  }

  static async getAllProducts() {
    const products = await Product.find({ isActive: true, isPublished: true }).sort({ createdAt: -1 });
    return this.enrichProductsWithInventory(products);
  }

  static async getProductsForStoreOwner(userId: string) {
    const store = await Store.findOne({ ownerId: userId, status: STORE_STATUS.APPROVED });

    if (!store) {
      throw new AppError("Only approved store owners can view products", 403);
    }

    const products = await Product.find({ storeId: store.storeId }).sort({ createdAt: -1 });
    return this.enrichProductsWithInventory(products);
  }

  static async getProductById(productId: string, storeId?: string) {
    const product = await Product.findOne({ productId, ...(storeId ? { storeId } : {}), isActive: true, isPublished: true });

    if (!product) {
      throw new AppError("Product not found", 404);
    }

    await this.enrichProductsWithInventory([product]);
    return product;
  }

  static async createProduct(data: CreateProductInput, userId: string) {
    const store = await Store.findOne({ ownerId: userId, status: STORE_STATUS.APPROVED });

    if (!store) {
      throw new AppError("Only approved store owners can create products", 403);
    }

    const category = await Category.findOne({ categoryId: data.categoryId, isActive: true });

    if (!category) {
      throw new AppError("Category not found", 404);
    }

    const existingSku = await Product.findOne({ sku: data.sku.toUpperCase() });

    if (existingSku) {
      throw new AppError("SKU already exists", 409);
    }

    if (data.discountPrice > data.price) {
      throw new AppError("Discount price cannot be greater than price", 400);
    }

    const slug = await this.buildUniqueSlug(data.name);

    const product = await Product.create({
      storeId: store.storeId,
      categoryId: data.categoryId,
      name: data.name,
      slug,
      description: data.description || "",
      brand: data.brand || "",
      sku: data.sku.toUpperCase(),
      price: data.price,
      discountPrice: data.discountPrice ?? 0,
      quantity: data.quantity ?? 0,
      images: data.images || [],
      isPublished: data.isPublished ?? false,
      createdBy: userId,
      updatedBy: userId,
    });

    await InventoryService.createInventoryForProduct(product.productId, userId, data.quantity ?? 0);

    return product;
  }

  static async createBulkProducts(data: CreateProductInput[], userId: string) {
    const store = await Store.findOne({ ownerId: userId, status: STORE_STATUS.APPROVED });

    if (!store) {
      throw new AppError("Only approved store owners can create products", 403);
    }

    const categoryIds = Array.from(new Set(data.map((product) => product.categoryId)));
    const categories = await Category.find({ categoryId: { $in: categoryIds }, isActive: true }).select("categoryId");
    const validCategoryIds = new Set(categories.map((category) => category.categoryId));

    const invalidCategoryIds = categoryIds.filter((categoryId) => !validCategoryIds.has(categoryId));

    if (invalidCategoryIds.length > 0) {
      throw new AppError("Category not found", 404);
    }

    const productNames = Array.from(new Set(data.map((product) => product.name)));
    const existingProducts = await Product.find({ storeId: store.storeId, name: { $in: productNames } }).select("name");
    const existingNames = new Set(existingProducts.map((product) => product.name));

    const uniqueNames = new Set<string>();
    const productsToInsert = [] as Array<{
      storeId: string;
      categoryId: string;
      name: string;
      slug: string;
      description: string;
      brand: string;
      sku: string;
      price: number;
      discountPrice: number;
      quantity: number;
      images: string[];
      isPublished: boolean;
      createdBy: string;
      updatedBy: string;
    }>;

    const seenSkus = new Set<string>();

    for (const product of data) {
      if (existingNames.has(product.name) || uniqueNames.has(product.name)) {
        continue;
      }

      const normalizedSku = product.sku.toUpperCase();

      if (seenSkus.has(normalizedSku)) {
        throw new AppError("SKU already exists", 409);
      }

      seenSkus.add(normalizedSku);
      uniqueNames.add(product.name);

      productsToInsert.push({
        storeId: store.storeId,
        categoryId: product.categoryId,
        name: product.name,
        slug: "",
        description: product.description || "",
        brand: product.brand || "",
        sku: normalizedSku,
        price: product.price,
        discountPrice: product.discountPrice ?? 0,
        quantity: product.quantity ?? 0,
        images: product.images || [],
        isPublished: product.isPublished ?? false,
        createdBy: userId,
        updatedBy: userId,
      });
    }

    if (productsToInsert.length === 0) {
      return {
        inserted: 0,
        skipped: data.length,
        insertedProducts: [],
      };
    }

    const existingSkus = await Product.find({ sku: { $in: Array.from(seenSkus) } }).select("sku");

    if (existingSkus.length > 0) {
      throw new AppError("SKU already exists", 409);
    }

    for (const product of productsToInsert) {
      product.slug = await this.buildUniqueSlug(product.name);
    }

    const insertedProducts = await Product.insertMany(productsToInsert);

    await Promise.all(
      insertedProducts.map((product) => InventoryService.createInventoryForProduct(product.productId, userId, product.quantity ?? 0))
    );

    return {
      inserted: insertedProducts.length,
      skipped: data.length - insertedProducts.length,
      insertedProducts,
    };
  }

  static async updateProduct(productId: string, data: UpdateProductInput, userId: string) {
    const product = await Product.findOne({ productId, isActive: true });

    if (!product) {
      throw new AppError("Product not found", 404);
    }

    const store = await Store.findOne({ ownerId: userId, storeId: product.storeId, status: STORE_STATUS.APPROVED });

    if (!store) {
      throw new AppError("Only approved store owners can update products", 403);
    }

    if (data.categoryId) {
      const category = await Category.findOne({ categoryId: data.categoryId, isActive: true });

      if (!category) {
        throw new AppError("Category not found", 404);
      }
    }

    if (data.sku) {
      const existingSku = await Product.findOne({ sku: data.sku.toUpperCase(), productId: { $ne: productId } });

      if (existingSku) {
        throw new AppError("SKU already exists", 409);
      }
    }

    if (data.discountPrice !== undefined && data.price !== undefined && data.discountPrice > data.price) {
      throw new AppError("Discount price cannot be greater than price", 400);
    }

    if (data.name) {
      product.name = data.name;
      product.slug = await this.buildUniqueSlug(data.name);
    }

    if (typeof data.description === "string") {
      product.description = data.description;
    }

    if (typeof data.brand === "string") {
      product.brand = data.brand;
    }

    if (typeof data.sku === "string") {
      product.sku = data.sku.toUpperCase();
    }

    if (typeof data.price === "number") {
      product.price = data.price;
    }

    if (typeof data.discountPrice === "number") {
      product.discountPrice = data.discountPrice;
    }

    if (typeof data.quantity === "number") {
      const inventory = await Inventory.findOne({ productId: product.productId });

      if (inventory) {
        inventory.availableQuantity = data.quantity;
        inventory.updatedBy = userId;
        await inventory.save();
      }

      product.quantity = data.quantity;
    }

    if (typeof data.categoryId === "string") {
      product.categoryId = data.categoryId;
    }

    if (Array.isArray(data.images)) {
      product.images = data.images;
    }

    if (typeof data.isPublished === "boolean") {
      product.isPublished = data.isPublished;
    }

    if (typeof data.isActive === "boolean") {
      product.isActive = data.isActive;
    }

    product.updatedBy = userId;
    await product.save();

    return product;
  }

  static async deleteProduct(productId: string, userId: string) {
    const product = await Product.findOne({ productId, isActive: true });

    if (!product) {
      throw new AppError("Product not found", 404);
    }

    const store = await Store.findOne({ ownerId: userId, storeId: product.storeId, status: STORE_STATUS.APPROVED });

    if (!store) {
      throw new AppError("Only approved store owners can delete products", 403);
    }

    product.isActive = false;
    product.updatedBy = userId;
    await product.save();

    return product;
  }

  static async updateProductStatus(productId: string, isActive: boolean, userId: string) {
    const product = await Product.findOne({ productId });

    if (!product) {
      throw new AppError("Product not found", 404);
    }

    const store = await Store.findOne({ ownerId: userId, storeId: product.storeId, status: STORE_STATUS.APPROVED });

    if (!store) {
      throw new AppError("Only approved store owners can update product status", 403);
    }

    product.isActive = isActive;
    product.updatedBy = userId;
    await product.save();

    return product;
  }

  static async addImages(productId: string, data: AddImagesInput, userId: string, role?: string) {
    const product = await this.getProductForMedia(productId);
    await this.validateProductAccess(product, userId, role);

    const normalizedImages = data.images.map((image) => image.trim());
    const existingImages = new Set(product.images.map((image) => image.trim()));
    const incomingImages = new Set<string>();

    for (const image of normalizedImages) {
      if (existingImages.has(image) || incomingImages.has(image)) {
        throw new AppError("Duplicate image URL", 400);
      }

      incomingImages.add(image);
    }

    if (product.images.length + normalizedImages.length > 10) {
      throw new AppError("Maximum image limit exceeded", 400);
    }

    product.images = [...product.images, ...normalizedImages];

    if (!product.thumbnail && product.images.length > 0) {
      product.thumbnail = product.images[0];
    }

    product.updatedBy = userId;
    await product.save();

    return product;
  }

  static async removeImage(productId: string, data: RemoveImageInput, userId: string, role?: string) {
    const product = await this.getProductForMedia(productId);
    await this.validateProductAccess(product, userId, role);

    const imageToRemove = data.image.trim();
    const imageExists = product.images.some((image) => image.trim() === imageToRemove);

    if (!imageExists) {
      throw new AppError("Image not found", 404);
    }

    product.images = product.images.filter((image) => image.trim() !== imageToRemove);

    if (product.thumbnail === imageToRemove) {
      product.thumbnail = product.images[0] || "";
    }

    product.updatedBy = userId;
    await product.save();

    return product;
  }

  static async updateThumbnail(productId: string, data: UpdateThumbnailInput, userId: string, role?: string) {
    const product = await this.getProductForMedia(productId);
    await this.validateProductAccess(product, userId, role);

    const thumbnail = data.thumbnail.trim();
    const exists = product.images.some((image) => image.trim() === thumbnail);

    if (!exists) {
      throw new AppError("Thumbnail must exist in images array", 400);
    }

    product.thumbnail = thumbnail;
    product.updatedBy = userId;
    await product.save();

    return product;
  }
}
