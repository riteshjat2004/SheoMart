import { Response } from "express";
import { AppError } from "../errors/AppError";
import { AuthRequest } from "../middleware/auth.middleware";
import { ApiResponse } from "../utils/apiResponse";
import { ProductService } from "../services/product.service";
import {
  addImagesSchema,
  adminProductListQuerySchema,
  bulkCreateProductSchema,
  createProductSchema,
  removeImageSchema,
  updateProductSchema,
  updateThumbnailSchema,
} from "../validators/product.validator";

export const getAdminProducts = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  const filters = adminProductListQuerySchema.parse(req.query);
  const result = await ProductService.listAdminProducts(filters);

  res.status(200).json(
    new ApiResponse(true, "Products fetched successfully", result)
  );
};

export const getProducts = async (
  _req: AuthRequest,
  res: Response
): Promise<void> => {
  const products = await ProductService.getAllProducts();

  res.status(200).json(
    new ApiResponse(true, "Products fetched successfully", { products })
  );
};

export const getMyProducts = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  const products = await ProductService.getProductsForStoreOwner(req.user?.userId as string);

  res.status(200).json(
    new ApiResponse(true, "Store products fetched successfully", { products })
  );
};

export const getProductById = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  const productId = Array.isArray(req.params.productId) ? req.params.productId[0] : req.params.productId;
  const product = await ProductService.getProductById(productId);

  res.status(200).json(
    new ApiResponse(true, "Product fetched successfully", { product })
  );
};

export const createProduct = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  const payload = (req.body && typeof req.body === "object" ? req.body : {}) as Record<string, unknown>;
  const result = createProductSchema.safeParse(payload);

  if (!result.success) {
    const message = result.error.issues[0]?.message || "Invalid product payload";
    throw new AppError(message, 400);
  }

  const product = await ProductService.createProduct(result.data, req.user?.userId as string);

  res.status(201).json(
    new ApiResponse(true, "Product created successfully", { product })
  );
};

export const createBulkProducts = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  const payload = req.body;

  if (!Array.isArray(payload)) {
    throw new AppError("Request body must be an array of products", 400);
  }

  const result = bulkCreateProductSchema.safeParse(payload);

  if (!result.success) {
    const message = result.error.issues[0]?.message || "Invalid product payload";
    throw new AppError(message, 400);
  }

  const bulkResult = await ProductService.createBulkProducts(result.data, req.user?.userId as string);

  res.status(201).json(
    new ApiResponse(true, "Products imported successfully", bulkResult)
  );
};

export const updateProduct = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  const payload = (req.body && typeof req.body === "object" ? req.body : {}) as Record<string, unknown>;
  const result = updateProductSchema.safeParse(payload);

  if (!result.success) {
    const message = result.error.issues[0]?.message || "Invalid product update payload";
    throw new AppError(message, 400);
  }

  const productId = Array.isArray(req.params.productId) ? req.params.productId[0] : req.params.productId;
  const product = await ProductService.updateProduct(productId, result.data, req.user?.userId as string);

  res.status(200).json(
    new ApiResponse(true, "Product updated successfully", { product })
  );
};

export const deleteProduct = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  const productId = Array.isArray(req.params.productId) ? req.params.productId[0] : req.params.productId;
  const product = await ProductService.deleteProduct(productId, req.user?.userId as string);

  res.status(200).json(
    new ApiResponse(true, "Product deleted successfully", { product })
  );
};

export const updateProductStatus = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  const payload = (req.body && typeof req.body === "object" ? req.body : {}) as Record<string, unknown>;

  if (typeof payload.isActive !== "boolean") {
    throw new AppError("Field 'isActive' must be a boolean.", 400);
  }

  const productId = Array.isArray(req.params.productId) ? req.params.productId[0] : req.params.productId;
  const product = await ProductService.updateProductStatus(productId, payload.isActive, req.user?.userId as string);

  res.status(200).json(
    new ApiResponse(true, "Product status updated successfully", { product })
  );
};

export const addImages = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  const payload = (req.body && typeof req.body === "object" ? req.body : {}) as Record<string, unknown>;
  const result = addImagesSchema.safeParse(payload);

  if (!result.success) {
    const message = result.error.issues[0]?.message || "Invalid images payload";
    throw new AppError(message, 400);
  }

  const productId = Array.isArray(req.params.productId) ? req.params.productId[0] : req.params.productId;
  const product = await ProductService.addImages(productId, result.data, req.user?.userId as string, req.user?.role);

  res.status(200).json(
    new ApiResponse(true, "Images added successfully", { product })
  );
};

export const removeImage = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  const payload = (req.body && typeof req.body === "object" ? req.body : {}) as Record<string, unknown>;
  const result = removeImageSchema.safeParse(payload);

  if (!result.success) {
    const message = result.error.issues[0]?.message || "Invalid image payload";
    throw new AppError(message, 400);
  }

  const productId = Array.isArray(req.params.productId) ? req.params.productId[0] : req.params.productId;
  const product = await ProductService.removeImage(productId, result.data, req.user?.userId as string, req.user?.role);

  res.status(200).json(
    new ApiResponse(true, "Image removed successfully", { product })
  );
};

export const updateThumbnail = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  const payload = (req.body && typeof req.body === "object" ? req.body : {}) as Record<string, unknown>;
  const result = updateThumbnailSchema.safeParse(payload);

  if (!result.success) {
    const message = result.error.issues[0]?.message || "Invalid thumbnail payload";
    throw new AppError(message, 400);
  }

  const productId = Array.isArray(req.params.productId) ? req.params.productId[0] : req.params.productId;
  const product = await ProductService.updateThumbnail(productId, result.data, req.user?.userId as string, req.user?.role);

  res.status(200).json(
    new ApiResponse(true, "Thumbnail updated successfully", { product })
  );
};
