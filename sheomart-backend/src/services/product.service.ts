import { AppError } from "../errors/AppError";
import { Category } from "../models/category.model";
import { Product } from "../models/product.model";
import { Store } from "../models/store.model";
import { STORE_STATUS } from "../constants/store";
import {
  AddImagesInput,
  CreateProductInput,
  RemoveImageInput,
  UpdateProductInput,
  UpdateThumbnailInput,
} from "../validators/product.validator";
import { InventoryService } from "./inventory.service";

export class ProductService {
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
    return Product.find({ isActive: true, isPublished: true }).sort({ createdAt: -1 });
  }

  static async getProductById(productId: string) {
    const product = await Product.findOne({ productId, isActive: true, isPublished: true });

    if (!product) {
      throw new AppError("Product not found", 404);
    }

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

    await InventoryService.createInventoryForProduct(product.productId, userId);

    return product;
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
