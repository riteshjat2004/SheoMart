import { Response } from "express";
import { AppError } from "../errors/AppError";
import { AuthRequest } from "../middleware/auth.middleware";
import { ApiResponse } from "../utils/apiResponse";
import { CategoryService } from "../services/category.service";
import {
  bulkCreateCategorySchema,
  createCategorySchema,
  updateCategorySchema,
} from "../validators/category.validator";

export const getCategories = async (
  _req: AuthRequest,
  res: Response
): Promise<void> => {
  const categories = await CategoryService.getAllCategories();

  res.status(200).json(
    new ApiResponse(true, "Categories fetched successfully", { categories })
  );
};

export const getCategoryById = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  const categoryId = Array.isArray(req.params.categoryId) ? req.params.categoryId[0] : req.params.categoryId;
  const category = await CategoryService.getCategoryById(categoryId);

  res.status(200).json(
    new ApiResponse(true, "Category fetched successfully", { category })
  );
};

export const createCategory = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  const payload = (req.body && typeof req.body === "object" ? req.body : {}) as Record<string, unknown>;
  const result = createCategorySchema.safeParse(payload);

  if (!result.success) {
    const message = result.error.issues[0]?.message || "Invalid category payload";
    throw new AppError(message, 400);
  }

  const category = await CategoryService.createCategory(result.data, req.user?.userId);

  res.status(201).json(
    new ApiResponse(true, "Category created successfully", { category })
  );
};

export const createBulkCategories = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  const payload = req.body;

  if (!Array.isArray(payload)) {
    throw new AppError("Request body must be an array of categories", 400);
  }

  const result = bulkCreateCategorySchema.safeParse(payload);

  if (!result.success) {
    const message = result.error.issues[0]?.message || "Invalid category payload";
    throw new AppError(message, 400);
  }

  const bulkResult = await CategoryService.createBulkCategories(result.data, req.user?.userId);

  res.status(201).json(
    new ApiResponse(true, "Categories imported successfully", bulkResult)
  );
};

export const updateCategory = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  const payload = (req.body && typeof req.body === "object" ? req.body : {}) as Record<string, unknown>;
  const result = updateCategorySchema.safeParse(payload);

  if (!result.success) {
    const message = result.error.issues[0]?.message || "Invalid category update payload";
    throw new AppError(message, 400);
  }

  const categoryId = Array.isArray(req.params.categoryId) ? req.params.categoryId[0] : req.params.categoryId;
  const category = await CategoryService.updateCategory(
    categoryId,
    result.data,
    req.user?.userId
  );

  res.status(200).json(
    new ApiResponse(true, "Category updated successfully", { category })
  );
};

export const deleteCategory = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  const categoryId = Array.isArray(req.params.categoryId) ? req.params.categoryId[0] : req.params.categoryId;
  const category = await CategoryService.deleteCategory(categoryId, req.user?.userId);

  res.status(200).json(
    new ApiResponse(true, "Category deleted successfully", { category })
  );
};

export const updateCategoryStatus = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  const payload = (req.body && typeof req.body === "object" ? req.body : {}) as Record<string, unknown>;

  if (typeof payload.isActive !== "boolean") {
    throw new AppError("Field 'isActive' must be a boolean.", 400);
  }

  const categoryId = Array.isArray(req.params.categoryId) ? req.params.categoryId[0] : req.params.categoryId;
  const category = await CategoryService.updateCategoryStatus(
    categoryId,
    payload.isActive,
    req.user?.userId
  );

  res.status(200).json(
    new ApiResponse(true, "Category status updated successfully", { category })
  );
};
