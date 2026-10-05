import { v4 as uuidv4 } from "uuid";
import { AppError } from "../errors/AppError";
import { Category } from "../models/category.model";
import { Inventory } from "../models/inventory.model";
import { Product, IProductVariant, INutritionalInfo } from "../models/product.model";
import { Store } from "../models/store.model";
import { STORE_STATUS } from "../constants/store";
import {
  AddImagesInput,
  CreateProductInput,
  RemoveImageInput,
  UpdateProductInput,
  UpdateThumbnailInput,
  AdminProductListQuery,
  BulkProductActionInput,
  CloneProductsToStoreInput,
} from "../validators/product.validator";
import { InventoryService } from "./inventory.service";
import { CLOUDINARY_FOLDERS } from "../constants/cloudinary";
import { deleteImageFromCloudinary, uploadBufferToCloudinary } from "../utils/cloudinary";
import { processProductImage } from "../utils/imageProcessor";

interface ProductImage {
  url: string;
  publicId: string;
}

export interface AdminProductListItem {
  productId: string;
  name: string;
  sku: string;
  brand: string;
  price: number;
  discountPrice: number;
  sellingType?: "PIECE" | "WEIGHT" | "VOLUME";
  baseUnit?: string;
  unitLabel?: string;
  minQuantity?: number;
  stepQuantity?: number;
  allowCustomQuantity?: boolean;
  stockTrackingMode?: "SEPARATE" | "SHARED";
  hasNutritionalInfo?: boolean;
  nutritionalInfo?: INutritionalInfo | null;
  variants?: IProductVariant[];
  thumbnail: string;
  images?: string[];
  description?: string;
  isActive: boolean;
  isPublished: boolean;
  isDeleted: boolean;
  isFeatured: boolean;
  isBestseller?: boolean;
  isTrending?: boolean;
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
    sellingType: product.sellingType,
    baseUnit: product.baseUnit,
    unitLabel: product.unitLabel,
    minQuantity: product.minQuantity,
    stepQuantity: product.stepQuantity,
    allowCustomQuantity: product.allowCustomQuantity,
    stockTrackingMode: product.stockTrackingMode,
    hasNutritionalInfo: product.hasNutritionalInfo,
    nutritionalInfo: product.nutritionalInfo,
    variants: product.variants,
    thumbnail: product.thumbnail,
    images: product.images,
    description: product.description,
    isActive: product.isActive,
    isPublished: product.isPublished,
    isDeleted: product.isDeleted,
    isFeatured: product.isFeatured,
    isBestseller: product.isBestseller,
    isTrending: product.isTrending,
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
    if (typeof filters.isFeatured === "boolean") query.isFeatured = filters.isFeatured;

    if (filters.status) {
      switch (filters.status) {
        case "active":
          query.isDeleted = { $ne: true };
          query.isActive = true;
          query.isPublished = true;
          break;
        case "inactive":
          query.isDeleted = { $ne: true };
          query.isActive = false;
          break;
        case "draft":
          query.isDeleted = { $ne: true };
          query.isPublished = false;
          break;
        case "out_of_stock":
          query.isDeleted = { $ne: true };
          query.quantity = { $lte: 0 };
          break;
        case "featured":
          query.isDeleted = { $ne: true };
          query.isFeatured = true;
          break;
        case "deleted":
          query.isDeleted = true;
          break;
        case "all":
        default:
          break;
      }
    } else if (typeof filters.isDeleted === "boolean") {
      query.isDeleted = filters.isDeleted;
    } else {
      query.isDeleted = { $ne: true };
    }

    if (typeof filters.minPrice === "number" || typeof filters.maxPrice === "number") {
      query.price = {};
      if (typeof filters.minPrice === "number") {
        (query.price as Record<string, unknown>).$gte = filters.minPrice;
      }
      if (typeof filters.maxPrice === "number") {
        (query.price as Record<string, unknown>).$lte = filters.maxPrice;
      }
    }

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
    const safeFields = "productId name sku brand price discountPrice sellingType baseUnit unitLabel minQuantity stepQuantity allowCustomQuantity stockTrackingMode variants thumbnail images description isActive isPublished isDeleted isFeatured isBestseller isTrending quantity categoryId storeId createdAt updatedAt";

    const [products, total, statsResult] = await Promise.all([
      Product.find(query).select(safeFields).sort(sort).skip(skip).limit(filters.limit).lean(),
      Product.countDocuments(query),
      Product.aggregate([
        {
          $facet: {
            total: [{ $match: { isDeleted: { $ne: true } } }, { $count: "count" }],
            active: [{ $match: { isDeleted: { $ne: true }, isActive: true, isPublished: true } }, { $count: "count" }],
            draft: [{ $match: { isDeleted: { $ne: true }, isPublished: false } }, { $count: "count" }],
            outOfStock: [{ $match: { isDeleted: { $ne: true }, quantity: { $lte: 0 } } }, { $count: "count" }],
            featured: [{ $match: { isDeleted: { $ne: true }, isFeatured: true } }, { $count: "count" }],
            deleted: [{ $match: { isDeleted: true } }, { $count: "count" }],
          },
        },
      ]),
    ]);

    const facet = statsResult[0] || {};
    const stats = {
      total: facet.total?.[0]?.count ?? 0,
      active: facet.active?.[0]?.count ?? 0,
      draft: facet.draft?.[0]?.count ?? 0,
      outOfStock: facet.outOfStock?.[0]?.count ?? 0,
      featured: facet.featured?.[0]?.count ?? 0,
      deleted: facet.deleted?.[0]?.count ?? 0,
    };

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
          images: product.images ?? [],
          description: product.description ?? "",
          isActive: product.isActive,
          isPublished: product.isPublished,
          isDeleted: product.isDeleted ?? false,
          isFeatured: product.isFeatured ?? false,
          isBestseller: product.isBestseller ?? false,
          isTrending: product.isTrending ?? false,
          sellingType: product.sellingType,
          baseUnit: product.baseUnit,
          unitLabel: product.unitLabel,
          minQuantity: product.minQuantity,
          stepQuantity: product.stepQuantity,
          allowCustomQuantity: product.allowCustomQuantity,
          stockTrackingMode: product.stockTrackingMode,
          hasNutritionalInfo: product.hasNutritionalInfo,
          nutritionalInfo: product.nutritionalInfo,
          variants: product.variants,
          quantity: inventory?.availableQuantity ?? product.quantity ?? 0,
          inventoryStatus: inventory?.status ?? "unavailable",
          category: category ? { categoryId: category.categoryId, name: category.name } : null,
          store: store ? { storeId: store.storeId, storeName: store.storeName, status: store.status } : null,
          createdAt: product.createdAt,
          updatedAt: product.updatedAt,
        });
      }),
      stats,
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

  private static async enrichProductsWithInventory<
    T extends { productId?: string; quantity?: number; storeId?: string; storeName?: string }
  >(products: T[]) {
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

    const missingStoreProducts = products.filter(
      (p): p is T & { storeId: string } => !p.storeName && Boolean(p.storeId)
    );
    if (missingStoreProducts.length > 0) {
      const storeIds: string[] = Array.from(new Set(missingStoreProducts.map((p) => p.storeId)));
      const stores = await Store.find({ storeId: { $in: storeIds } }).select("storeId storeName").lean();
      const storeMap = new Map(stores.map((s) => [s.storeId, s.storeName]));
      for (const p of missingStoreProducts) {
        if (storeMap.has(p.storeId)) {
          p.storeName = storeMap.get(p.storeId);
        }
      }
    }

    return products;
  }

  private static async buildUniqueSlug(name: string, excludeProductId?: string) {
    const baseSlug = this.generateSlug(name);
    let slug = baseSlug;
    let counter = 1;

    while (
      await Product.findOne({
        slug,
        ...(excludeProductId ? { productId: { $ne: excludeProductId } } : {}),
      })
    ) {
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

    const products = await Product.find({ storeId: store.storeId, isDeleted: { $ne: true } }).sort({ createdAt: -1 });
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

  static async createProduct(data: CreateProductInput, userId: string, imageBuffer?: Buffer, role?: string) {
    let storeId: string;
    let storeName = "";
    if (role === "platform_admin") {
      if (data.storeId) {
        const store = await Store.findOne({ storeId: data.storeId });
        if (!store) {
          throw new AppError("Store not found", 404);
        }
        storeId = store.storeId;
        storeName = store.storeName;
      } else {
        const store = await Store.findOne({ status: STORE_STATUS.APPROVED });
        if (!store) {
          throw new AppError("No approved store found to associate with product", 400);
        }
        storeId = store.storeId;
        storeName = store.storeName;
      }
    } else {
      const store = await Store.findOne({ ownerId: userId, status: STORE_STATUS.APPROVED });

      if (!store) {
        throw new AppError("Only approved store owners can create products", 403);
      }
      storeId = store.storeId;
      storeName = store.storeName;
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

    let image: ProductImage | undefined;
    if (imageBuffer) {
      const processedImage = await processProductImage(imageBuffer);
      console.log("Uploading to Cloudinary...", {
        hasFile: !!imageBuffer,
        bufferSize: imageBuffer?.length,
        folder: CLOUDINARY_FOLDERS.PRODUCTS,
      });
      const uploadedImage = await uploadBufferToCloudinary(processedImage, CLOUDINARY_FOLDERS.PRODUCTS);
      console.log("Cloudinary Success:", {
        url: uploadedImage.secure_url,
        publicId: uploadedImage.public_id,
      });
      image = { url: uploadedImage.secure_url, publicId: uploadedImage.public_id };
    } else if (data.imageUrl) {
      image = { url: data.imageUrl, publicId: "" };
    }

    const imageUrls = data.imageUrl ? [data.imageUrl, ...data.images.filter((url) => url !== data.imageUrl)] : data.images;
    const product = await Product.create({
      storeId,
      storeName,
      categoryId: data.categoryId,
      name: data.name,
      slug,
      description: data.description || "",
      brand: data.brand || "",
      sku: data.sku.toUpperCase(),
      price: data.price,
      discountPrice: data.discountPrice ?? 0,
      quantity: data.quantity ?? 0,
      sellingType: data.sellingType ?? "PIECE",
      baseUnit: data.baseUnit ?? "piece",
      unitLabel: data.unitLabel ?? "",
      minQuantity: data.minQuantity ?? 1,
      stepQuantity: data.stepQuantity ?? 1,
      allowCustomQuantity: data.allowCustomQuantity ?? false,
      stockTrackingMode: data.stockTrackingMode ?? "SEPARATE",
      hasNutritionalInfo: data.hasNutritionalInfo ?? false,
      nutritionalInfo: data.hasNutritionalInfo ? data.nutritionalInfo : null,
      variants: (data.variants || []).map((v) => ({
        variantId: v.variantId || uuidv4(),
        label: v.label,
        unit: v.unit,
        value: v.value,
        price: v.price,
        discountPrice: v.discountPrice,
        sku: v.sku,
        stock: v.stock ?? 0,
        packQuantity: v.packQuantity ?? 1,
      })),
      image,
      images: image ? [image.url, ...imageUrls.filter((url) => url !== image?.url)] : imageUrls,
      thumbnail: image?.url || imageUrls[0] || "",
      isPublished: data.isPublished ?? false,
      isActive: data.isActive ?? true,
      isFeatured: data.isFeatured ?? false,
      isBestseller: data.isBestseller ?? false,
      isTrending: data.isTrending ?? false,
      createdBy: userId,
      updatedBy: userId,
    });

    const finalQuantity =
      (data.stockTrackingMode ?? "SEPARATE") === "SEPARATE" && (data.variants || []).length > 0
        ? (data.variants || []).reduce((sum, v) => sum + (v.stock || 0), 0)
        : (data.quantity ?? 0);

    if (finalQuantity !== (data.quantity ?? 0)) {
      product.quantity = finalQuantity;
      await product.save();
    }

    await InventoryService.createInventoryForProduct(product.productId, userId, finalQuantity);

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

  static async updateProduct(productId: string, data: UpdateProductInput, userId: string, imageBuffer?: Buffer, role?: string) {
    const product = await Product.findOne({ productId, isDeleted: { $ne: true } });

    if (!product) {
      throw new AppError("Product not found", 404);
    }

    await this.validateProductAccess(product, userId, role);

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

    if (data.name && data.name !== product.name) {
      product.name = data.name;
      product.slug = await this.buildUniqueSlug(data.name, product.productId);
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
      product.quantity = data.quantity;
    }

    if (typeof data.categoryId === "string") {
      product.categoryId = data.categoryId;
    }

    if (Array.isArray(data.images) && data.images.length > 0) {
      product.images = data.images;
      product.thumbnail = data.images[0] || "";
    }

    if (imageBuffer) {
      if (product.image?.publicId) {
        await deleteImageFromCloudinary(product.image.publicId);
      }

      const processedImage = await processProductImage(imageBuffer);
      console.log("Uploading to Cloudinary...", {
        hasFile: !!imageBuffer,
        bufferSize: imageBuffer?.length,
        folder: CLOUDINARY_FOLDERS.PRODUCTS,
      });
      const uploadedImage = await uploadBufferToCloudinary(processedImage, CLOUDINARY_FOLDERS.PRODUCTS);
      console.log("Cloudinary Success:", {
        url: uploadedImage.secure_url,
        publicId: uploadedImage.public_id,
      });
      product.image = { url: uploadedImage.secure_url, publicId: uploadedImage.public_id };
      product.images = [uploadedImage.secure_url];
      product.thumbnail = uploadedImage.secure_url;
    } else if (data.imageUrl) {
      if (product.image?.publicId) {
        await deleteImageFromCloudinary(product.image.publicId);
      }

      product.image = { url: data.imageUrl, publicId: "" };
      product.images = [data.imageUrl];
      product.thumbnail = data.imageUrl;
    }

    if (typeof data.isPublished === "boolean") {
      product.isPublished = data.isPublished;
    }

    if (typeof data.isActive === "boolean") {
      product.isActive = data.isActive;
    }

    if (typeof data.isFeatured === "boolean") {
      product.isFeatured = data.isFeatured;
    }

    if (typeof data.isBestseller === "boolean") {
      product.isBestseller = data.isBestseller;
    }

    if (typeof data.isTrending === "boolean") {
      product.isTrending = data.isTrending;
    }

    if (data.sellingType !== undefined) {
      product.sellingType = data.sellingType;
      product.markModified("sellingType");
    }

    if (data.baseUnit !== undefined) {
      product.baseUnit = data.baseUnit;
      product.markModified("baseUnit");
    }

    if (data.unitLabel !== undefined) {
      product.unitLabel = data.unitLabel;
      product.markModified("unitLabel");
    }

    if (typeof data.minQuantity === "number") {
      product.minQuantity = data.minQuantity;
      product.markModified("minQuantity");
    }

    if (typeof data.stepQuantity === "number") {
      product.stepQuantity = data.stepQuantity;
      product.markModified("stepQuantity");
    }

    if (typeof data.allowCustomQuantity === "boolean") {
      product.allowCustomQuantity = data.allowCustomQuantity;
      product.markModified("allowCustomQuantity");
    }

    if (data.stockTrackingMode !== undefined) {
      product.stockTrackingMode = data.stockTrackingMode;
      product.markModified("stockTrackingMode");
    }

    if (typeof data.hasNutritionalInfo === "boolean") {
      product.hasNutritionalInfo = data.hasNutritionalInfo;
      product.markModified("hasNutritionalInfo");
    }

    if (data.nutritionalInfo !== undefined) {
      product.nutritionalInfo = (data.hasNutritionalInfo ?? product.hasNutritionalInfo) ? data.nutritionalInfo : null;
      product.markModified("nutritionalInfo");
    }

    if (Array.isArray(data.variants)) {
      product.variants = data.variants.map((v) => ({
        variantId: v.variantId || uuidv4(),
        label: v.label,
        unit: v.unit,
        value: v.value,
        price: v.price,
        discountPrice: v.discountPrice,
        sku: v.sku,
        stock: v.stock ?? 0,
        packQuantity: v.packQuantity ?? 1,
      }));
      product.markModified("variants");

      if (product.stockTrackingMode === "SEPARATE" && product.variants.length > 0) {
        product.quantity = product.variants.reduce((sum, v) => sum + (v.stock || 0), 0);
      }
    }

    if (role === "platform_admin" && data.storeId) {
      product.storeId = data.storeId;
    }

    product.updatedBy = userId;
    await product.save();

    await InventoryService.syncProductQuantity(
      product.productId,
      product.quantity,
      product.createdBy ?? userId,
      userId,
    );

    return product;
  }

  static async deleteProduct(productId: string, userId: string, role?: string) {
    const product = await Product.findOne({ productId, isDeleted: { $ne: true } });

    if (!product) {
      throw new AppError("Product not found", 404);
    }

    await this.validateProductAccess(product, userId, role);

    product.isDeleted = true;
    product.isActive = false;
    product.updatedBy = userId;
    await product.save();

    return product;
  }

  static async restoreProduct(productId: string, userId: string, role?: string) {
    const product = await Product.findOne({ productId, isDeleted: true });

    if (!product) {
      throw new AppError("Deleted product not found", 404);
    }

    await this.validateProductAccess(product, userId, role);

    product.isDeleted = false;
    product.isActive = true;
    product.updatedBy = userId;
    await product.save();

    return product;
  }

  static async updateProductStatus(productId: string, isActive: boolean, userId: string, role?: string) {
    const product = await Product.findOne({ productId, isDeleted: { $ne: true } });

    if (!product) {
      throw new AppError("Product not found", 404);
    }

    await this.validateProductAccess(product, userId, role);

    product.isActive = isActive;
    product.updatedBy = userId;
    await product.save();

    return product;
  }

  static async toggleProductFeatured(
    productId: string,
    isFeatured: boolean,
    userId: string,
    priority?: number
  ) {
    const product = await Product.findOne({ productId, isDeleted: { $ne: true } });

    if (!product) {
      throw new AppError("Product not found", 404);
    }

    product.isFeatured = isFeatured;
    product.featuredAt = isFeatured ? new Date() : null;
    if (typeof priority === "number") {
      product.featuredPriority = priority;
    }
    product.updatedBy = userId;
    await product.save();

    return product;
  }

  static async updateProductFeaturedPriority(
    productId: string,
    priority: number,
    userId: string
  ) {
    const product = await Product.findOne({ productId, isDeleted: { $ne: true } });

    if (!product) {
      throw new AppError("Product not found", 404);
    }

    product.featuredPriority = priority;
    product.updatedBy = userId;
    await product.save();

    return product;
  }

  static async bulkUpdateProducts(data: BulkProductActionInput, userId: string, role?: string) {
    const { productIds, action } = data;
    const query: Record<string, unknown> = { productId: { $in: productIds } };

    if (role !== "platform_admin") {
      const store = await Store.findOne({ ownerId: userId, status: STORE_STATUS.APPROVED });
      if (!store) {
        throw new AppError("Unauthorized store access", 403);
      }
      query.storeId = store.storeId;
    }

    let updateFields: Record<string, unknown> = { updatedBy: userId };

    switch (action) {
      case "activate":
        updateFields = { ...updateFields, isActive: true, isPublished: true };
        break;
      case "deactivate":
        updateFields = { ...updateFields, isActive: false };
        break;
      case "delete":
        updateFields = { ...updateFields, isDeleted: true, isActive: false };
        break;
      case "restore":
        updateFields = { ...updateFields, isDeleted: false, isActive: true };
        break;
      case "feature":
        updateFields = { ...updateFields, isFeatured: true, featuredAt: new Date() };
        break;
      case "unfeature":
        updateFields = { ...updateFields, isFeatured: false, featuredAt: null, featuredPriority: 0 };
        break;
      default:
        throw new AppError("Invalid bulk action", 400);
    }

    const result = await Product.updateMany(query, { $set: updateFields });
    return {
      matchedCount: result.matchedCount,
      modifiedCount: result.modifiedCount,
    };
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

  static async duplicateProduct(productId: string, userId: string, role?: string) {
    const originalProduct = await Product.findOne({ productId, isDeleted: { $ne: true } });
    if (!originalProduct) {
      throw new AppError("Product not found", 404);
    }

    await this.validateProductAccess(originalProduct, userId, role);

    let copyIndex = 1;
    let newSku = `${originalProduct.sku}-COPY`;
    while (await Product.exists({ sku: newSku })) {
      newSku = `${originalProduct.sku}-COPY${copyIndex}`;
      copyIndex++;
    }

    const newName = `${originalProduct.name} (Copy)`;
    const newSlug = await this.buildUniqueSlug(newName);

    const duplicated = await Product.create({
      storeId: originalProduct.storeId,
      categoryId: originalProduct.categoryId,
      name: newName,
      slug: newSlug,
      description: originalProduct.description,
      brand: originalProduct.brand,
      sku: newSku,
      price: originalProduct.price,
      discountPrice: originalProduct.discountPrice,
      quantity: 0,
      image: originalProduct.image,
      images: originalProduct.images,
      thumbnail: originalProduct.thumbnail,
      isPublished: false,
      isActive: true,
      isFeatured: false,
      isBestseller: false,
      isTrending: false,
      createdBy: userId,
      updatedBy: userId,
    });

    await InventoryService.createInventoryForProduct(duplicated.productId, userId, 0);

    const enriched = await this.enrichProductsWithInventory([duplicated]);
    return enriched[0];
  }

  static async getStoreExistingProducts(storeId: string) {
    const products = await Product.find({
      storeId,
      isDeleted: { $ne: true },
    })
      .select("productId name sku sourceProductId")
      .lean();

    const existingSourceProductIds: string[] = [];
    const existingNames: string[] = [];
    const existingCleanSkus: string[] = [];

    for (const p of products) {
      if (p.productId) existingSourceProductIds.push(p.productId);
      if (p.sourceProductId) existingSourceProductIds.push(p.sourceProductId);
      if (p.name) existingNames.push(p.name.trim().toLowerCase());
      if (p.sku) {
        const cleanSku = p.sku.replace(/-STR\w+(-[0-9]+)?$/i, "").trim().toUpperCase();
        if (cleanSku) existingCleanSkus.push(cleanSku);
      }
    }

    return {
      storeId,
      totalCount: products.length,
      existingProducts: products,
      existingSourceProductIds: Array.from(new Set(existingSourceProductIds)),
      existingNames: Array.from(new Set(existingNames)),
      existingCleanSkus: Array.from(new Set(existingCleanSkus)),
    };
  }

  /**
   * Universal Master Catalog aggregation for Admin.
   * Deduplicates products across all stores by sourceProductId or (normalized name + brand + category)
   * so that identical items (e.g. "Mangoes" across 3 stores) appear only once as a single universal option.
   */
  static async getMasterCatalog(params: {
    targetStoreId?: string;
    search?: string;
    categoryId?: string;
  }) {
    const matchFilter: Record<string, unknown> = {
      isDeleted: { $ne: true },
    };

    if (params.categoryId && params.categoryId !== "all") {
      matchFilter.categoryId = params.categoryId;
    }

    if (params.search && params.search.trim()) {
      const q = params.search.trim();
      const escaped = q.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      matchFilter.$or = [
        { name: { $regex: escaped, $options: "i" } },
        { brand: { $regex: escaped, $options: "i" } },
        { sku: { $regex: escaped, $options: "i" } },
        { description: { $regex: escaped, $options: "i" } },
      ];
    }

    const [rawProducts, categories] = await Promise.all([
      Product.find(matchFilter).sort({ createdAt: 1 }).lean(),
      Category.find({ isDeleted: { $ne: true } }).select("categoryId name").lean(),
    ]);

    const categoryMap = new Map(categories.map((c) => [c.categoryId, c.name]));

    // Grouping by canonical product identity
    const groups: Array<{
      master: any;
      allProductIds: Set<string>;
      allStoreIds: Set<string>;
    }> = [];

    const keyToGroupIndex = new Map<string, number>();
    const idToGroupIndex = new Map<string, number>();

    for (const p of rawProducts) {
      const normName = (p.name || "").trim().toLowerCase();
      const normBrand = (p.brand || "").trim().toLowerCase();
      const normCat = String(p.categoryId || "").trim();
      const nameKey = `${normName}__${normBrand}__${normCat}`;

      const cleanSku = p.sku ? p.sku.replace(/-STR\w+(-[0-9]+)?$/i, "").trim().toUpperCase() : "";

      let groupIdx: number | undefined;

      if (p.sourceProductId && idToGroupIndex.has(p.sourceProductId)) {
        groupIdx = idToGroupIndex.get(p.sourceProductId);
      } else if (p.productId && idToGroupIndex.has(p.productId)) {
        groupIdx = idToGroupIndex.get(p.productId);
      } else if (nameKey && keyToGroupIndex.has(nameKey)) {
        groupIdx = keyToGroupIndex.get(nameKey);
      } else if (cleanSku && keyToGroupIndex.has(`sku_${cleanSku}`)) {
        groupIdx = keyToGroupIndex.get(`sku_${cleanSku}`);
      }

      if (groupIdx !== undefined) {
        const g = groups[groupIdx];
        g.allProductIds.add(p.productId);
        if (p.sourceProductId) g.allProductIds.add(p.sourceProductId);
        if (p.storeId) g.allStoreIds.add(p.storeId);

        const masterHasImage = Boolean(g.master.thumbnail || g.master.images?.[0] || g.master.image?.url);
        const pHasImage = Boolean(p.thumbnail || p.images?.[0] || p.image?.url);

        if (!masterHasImage && pHasImage) {
          g.master = { ...p, category: categoryMap.get(p.categoryId) || g.master.category };
        } else if (!p.sourceProductId && g.master.sourceProductId) {
          g.master = { ...p, category: categoryMap.get(p.categoryId) || g.master.category };
        }
      } else {
        const newIdx = groups.length;
        const newGroup = {
          master: {
            ...p,
            category: categoryMap.get(p.categoryId) || "",
          },
          allProductIds: new Set<string>([p.productId, ...(p.sourceProductId ? [p.sourceProductId] : [])]),
          allStoreIds: new Set<string>(p.storeId ? [p.storeId] : []),
        };
        groups.push(newGroup);

        if (nameKey) keyToGroupIndex.set(nameKey, newIdx);
        if (cleanSku) keyToGroupIndex.set(`sku_${cleanSku}`, newIdx);
        if (p.productId) idToGroupIndex.set(p.productId, newIdx);
        if (p.sourceProductId) idToGroupIndex.set(p.sourceProductId, newIdx);
      }
    }

    // Existing products in target store
    const existingSourceProductIds = new Set<string>();
    const existingNames = new Set<string>();
    const existingCleanSkus = new Set<string>();

    if (params.targetStoreId) {
      const storeProducts = await Product.find({
        storeId: params.targetStoreId,
        isDeleted: { $ne: true },
      })
        .select("productId name sku sourceProductId")
        .lean();

      for (const p of storeProducts) {
        if (p.productId) existingSourceProductIds.add(p.productId);
        if (p.sourceProductId) existingSourceProductIds.add(p.sourceProductId);
        if (p.name) existingNames.add(p.name.trim().toLowerCase());
        if (p.sku) {
          const clean = p.sku.replace(/-STR\w+(-[0-9]+)?$/i, "").trim().toUpperCase();
          if (clean) existingCleanSkus.add(clean);
        }
      }
    }

    let availableCount = 0;
    let inStoreCount = 0;

    const enrichedProducts = groups.map((g) => {
      const item = g.master;
      let isAlreadyInStore = false;

      if (params.targetStoreId) {
        const itemCleanSku = item.sku ? item.sku.replace(/-STR\w+(-[0-9]+)?$/i, "").trim().toUpperCase() : "";
        const itemNormName = item.name ? item.name.trim().toLowerCase() : "";

        const hasMatchingId =
          Array.from(g.allProductIds).some((id) => existingSourceProductIds.has(id)) ||
          existingSourceProductIds.has(item.productId) ||
          (item.sourceProductId && existingSourceProductIds.has(item.sourceProductId));

        const hasMatchingName = Boolean(itemNormName && existingNames.has(itemNormName));
        const hasMatchingSku = Boolean(itemCleanSku && existingCleanSkus.has(itemCleanSku));
        const hasDirectStore = g.allStoreIds.has(params.targetStoreId);

        isAlreadyInStore = Boolean(hasMatchingId || hasMatchingName || hasMatchingSku || hasDirectStore);
      }

      if (isAlreadyInStore) {
        inStoreCount++;
      } else {
        availableCount++;
      }

      return {
        ...item,
        allProductIdsInGroup: Array.from(g.allProductIds),
        allStoreIdsInGroup: Array.from(g.allStoreIds),
        totalStoreCopies: g.allStoreIds.size,
        isAlreadyInStore,
      };
    });

    enrichedProducts.sort((a, b) => (a.name || "").localeCompare(b.name || ""));

    return {
      products: enrichedProducts,
      totalCount: enrichedProducts.length,
      availableCount,
      inStoreCount,
    };
  }

  static async cloneProductsToStore(data: CloneProductsToStoreInput, userId: string) {
    const targetStore = await Store.findOne({ storeId: data.targetStoreId });
    if (!targetStore) {
      throw new AppError("Target store not found", 404);
    }

    const sourceProducts = await Product.find({
      productId: { $in: data.productIds },
      isDeleted: { $ne: true },
    });

    if (!sourceProducts.length) {
      throw new AppError("No valid products found to clone", 404);
    }

    // Fetch all existing products for target store to prevent duplicate pushing
    const existingStoreProducts = await Product.find({
      storeId: targetStore.storeId,
      isDeleted: { $ne: true },
    })
      .select("productId name sku sourceProductId")
      .lean();

    const existingSourceIds = new Set<string>();
    const existingNames = new Set<string>();
    const existingCleanSkus = new Set<string>();

    for (const ep of existingStoreProducts) {
      if (ep.productId) existingSourceIds.add(ep.productId);
      if (ep.sourceProductId) existingSourceIds.add(ep.sourceProductId);
      if (ep.name) existingNames.add(ep.name.trim().toLowerCase());
      if (ep.sku) {
        const clean = ep.sku.replace(/-STR\w+(-[0-9]+)?$/i, "").trim().toUpperCase();
        if (clean) existingCleanSkus.add(clean);
      }
    }

    const productsToClone = [];
    const skippedProducts = [];

    for (const source of sourceProducts) {
      const sourceCleanSku = source.sku.replace(/-STR\w+(-[0-9]+)?$/i, "").trim().toUpperCase();
      const isAlreadyInStore =
        source.storeId === targetStore.storeId ||
        existingSourceIds.has(source.productId) ||
        (source.sourceProductId && existingSourceIds.has(source.sourceProductId)) ||
        existingNames.has(source.name.trim().toLowerCase()) ||
        (sourceCleanSku && existingCleanSkus.has(sourceCleanSku));

      if (isAlreadyInStore) {
        skippedProducts.push(source);
      } else {
        productsToClone.push(source);
        // Track inside current batch as well to prevent intra-batch duplicates
        if (source.productId) existingSourceIds.add(source.productId);
        if (source.name) existingNames.add(source.name.trim().toLowerCase());
        if (sourceCleanSku) existingCleanSkus.add(sourceCleanSku);
      }
    }

    if (productsToClone.length === 0) {
      const skippedNames = skippedProducts.map((p) => `"${p.name}"`).join(", ");
      throw new AppError(
        `Selected product(s) are already present in ${targetStore.storeName || "this store"}: ${skippedNames}. Duplicate products cannot be pushed.`,
        400
      );
    }

    const clonedProducts = [];
    const storeSuffix = targetStore.storeId.slice(-4).toUpperCase();

    for (const source of productsToClone) {
      // Generate unique SKU for target store
      const cleanSku = source.sku.replace(/-STR\w+$/, "");
      let candidateSku = `${cleanSku}-STR${storeSuffix}`;
      let skuIndex = 1;
      while (await Product.exists({ sku: candidateSku })) {
        candidateSku = `${cleanSku}-STR${storeSuffix}-${skuIndex}`;
        skuIndex++;
      }

      // Generate unique slug
      const newSlug = await this.buildUniqueSlug(source.name);
      const defaultStock = data.defaultStock ?? 0;
      const isSeparate = source.stockTrackingMode === "SEPARATE";

      // Clone variants with fresh variantIds and defaultStock
      const clonedVariants = (source.variants || []).map((v) => ({
        variantId: uuidv4(),
        label: v.label,
        unit: v.unit,
        value: v.value,
        price: v.price,
        discountPrice: v.discountPrice,
        sku: `${candidateSku}-${v.label.replace(/\s+/g, "").toUpperCase()}`,
        stock: defaultStock,
        packQuantity: v.packQuantity ?? 1,
      }));

      const finalQuantity =
        isSeparate && clonedVariants.length > 0
          ? clonedVariants.reduce((sum, v) => sum + (v.stock || 0), 0)
          : defaultStock;

      const cloned = await Product.create({
        storeId: targetStore.storeId,
        storeName: targetStore.storeName,
        sourceProductId: source.sourceProductId || source.productId,
        categoryId: source.categoryId,
        name: source.name,
        slug: newSlug,
        description: source.description || "",
        brand: source.brand || "",
        sku: candidateSku,
        price: source.price,
        discountPrice: source.discountPrice ?? 0,
        quantity: finalQuantity,
        sellingType: source.sellingType ?? "PIECE",
        baseUnit: source.baseUnit ?? "piece",
        unitLabel: source.unitLabel ?? "",
        minQuantity: source.minQuantity ?? 1,
        stepQuantity: source.stepQuantity ?? 1,
        allowCustomQuantity: source.allowCustomQuantity ?? false,
        stockTrackingMode: source.stockTrackingMode ?? "SEPARATE",
        hasNutritionalInfo: source.hasNutritionalInfo ?? false,
        nutritionalInfo: source.nutritionalInfo,
        variants: clonedVariants,
        image: source.image,
        images: source.images || [],
        thumbnail: source.thumbnail || "",
        isPublished: data.isPublished ?? true,
        isActive: true,
        isFeatured: false,
        isBestseller: false,
        isTrending: false,
        createdBy: userId,
        updatedBy: userId,
      });

      await InventoryService.createInventoryForProduct(cloned.productId, userId, finalQuantity);
      clonedProducts.push(cloned);
    }

    return {
      targetStore: {
        storeId: targetStore.storeId,
        storeName: targetStore.storeName,
      },
      clonedCount: clonedProducts.length,
      skippedCount: skippedProducts.length,
      skippedProducts: skippedProducts.map((p) => p.name),
      products: clonedProducts,
    };
  }
}
