import { AppError } from "../errors/AppError";
import { Category } from "../models/category.model";
import { CreateCategoryInput, UpdateCategoryInput } from "../validators/category.validator";

export class CategoryService {
  private static generateSlug(name: string) {
    return name
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "") || "category";
  }

  private static async buildUniqueSlug(name: string) {
    const baseSlug = this.generateSlug(name);
    let slug = baseSlug;

    let counter = 1;
    while (await Category.findOne({ slug })) {
      slug = `${baseSlug}-${counter}`;
      counter += 1;
    }

    return slug;
  }

  static async getAllCategories() {
    return Category.find({ isActive: true }).sort({ sortOrder: 1, createdAt: -1 });
  }

  static async getCategoryById(categoryId: string) {
    const category = await Category.findOne({ categoryId, isActive: true });

    if (!category) {
      throw new AppError("Category not found", 404);
    }

    return category;
  }

  static async createCategory(data: CreateCategoryInput, userId?: string) {
    const existingCategory = await Category.findOne({ name: data.name });

    if (existingCategory) {
      throw new AppError("Category name already exists", 409);
    }

    const slug = await this.buildUniqueSlug(data.name);

    const category = await Category.create({
      name: data.name,
      slug,
      description: data.description || "",
      image: data.image || "",
      parentCategory: data.parentCategory || null,
      sortOrder: data.sortOrder ?? 0,
      isActive: typeof data.isActive === "boolean" ? data.isActive : true,
      createdBy: userId || null,
      updatedBy: userId || null,
    });

    return category;
  }

  static async updateCategory(categoryId: string, data: UpdateCategoryInput, userId?: string) {
    const category = await Category.findOne({ categoryId, isActive: true });

    if (!category) {
      throw new AppError("Category not found", 404);
    }

    if (data.name && data.name !== category.name) {
      const duplicate = await Category.findOne({ name: data.name });

      if (duplicate && duplicate.categoryId !== categoryId) {
        throw new AppError("Category name already exists", 409);
      }

      category.name = data.name;
      category.slug = await this.buildUniqueSlug(data.name);
    }

    if (typeof data.description === "string") {
      category.description = data.description;
    }

    if (typeof data.image === "string") {
      category.image = data.image;
    }

    if (typeof data.parentCategory === "object" && data.parentCategory === null) {
      category.parentCategory = null;
    } else if (typeof data.parentCategory === "string") {
      category.parentCategory = data.parentCategory;
    }

    if (typeof data.sortOrder === "number") {
      category.sortOrder = data.sortOrder;
    }

    if (typeof data.isActive === "boolean") {
      category.isActive = data.isActive;
    }

    category.updatedBy = userId || null;
    await category.save();

    return category;
  }

  static async deleteCategory(categoryId: string, userId?: string) {
    const category = await Category.findOne({ categoryId, isActive: true });

    if (!category) {
      throw new AppError("Category not found", 404);
    }

    category.isActive = false;
    category.updatedBy = userId || null;
    await category.save();

    return category;
  }

  static async updateCategoryStatus(categoryId: string, isActive: boolean, userId?: string) {
    const category = await Category.findOne({ categoryId });

    if (!category) {
      throw new AppError("Category not found", 404);
    }

    category.isActive = isActive;
    category.updatedBy = userId || null;
    await category.save();

    return category;
  }
}
