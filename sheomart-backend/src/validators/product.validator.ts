import { z } from "zod";

import { INVENTORY_STATUS } from "../models/inventory.model";

const booleanQueryParam = z.enum(["true", "false"]).transform((value) => value === "true");
const multipartBoolean = z.preprocess(
  (value) => (value === "true" ? true : value === "false" ? false : value),
  z.boolean(),
);
const optionalImageUrl = z.preprocess(
  (value) => (typeof value === "string" && value.trim() === "" ? undefined : value),
  z.string().trim().url("Image URL must be valid").optional(),
);

export const adminProductListQuerySchema = z.object({
  search: z.string().trim().max(100).optional(),
  storeId: z.string().trim().min(1).optional(),
  categoryId: z.string().trim().min(1).optional(),
  isActive: booleanQueryParam.optional(),
  isPublished: booleanQueryParam.optional(),
  isDeleted: booleanQueryParam.optional(),
  isFeatured: booleanQueryParam.optional(),
  status: z.enum(["all", "active", "inactive", "draft", "out_of_stock", "featured", "deleted"]).optional(),
  minPrice: z.coerce.number().min(0).optional(),
  maxPrice: z.coerce.number().min(0).optional(),
  inventoryStatus: z.enum([
    INVENTORY_STATUS.IN_STOCK,
    INVENTORY_STATUS.LOW_STOCK,
    INVENTORY_STATUS.OUT_OF_STOCK,
    INVENTORY_STATUS.DISCONTINUED,
    "unavailable",
  ]).optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(25),
  sortBy: z.enum(["createdAt", "name", "price", "quantity"]).default("createdAt"),
  sortOrder: z.enum(["asc", "desc"]).default("desc"),
}).strict();

export type AdminProductListQuery = z.infer<typeof adminProductListQuerySchema>;

const preprocessJson = (val: unknown) => {
  if (typeof val === "string") {
    const trimmed = val.trim();
    if (!trimmed) return undefined;
    try {
      return JSON.parse(trimmed);
    } catch {
      return val;
    }
  }
  return val;
};

export const productVariantSchema = z.object({
  variantId: z.string().trim().optional(),
  label: z.string().trim().min(1, "Variant label is required"),
  unit: z.string().trim().min(1, "Unit is required"),
  value: z.coerce.number().min(0, "Value cannot be negative"),
  price: z.coerce.number().min(0, "Price cannot be negative"),
  discountPrice: z.coerce.number().min(0).optional().default(0),
  sku: z.string().trim().optional(),
  stock: z.coerce.number().int().min(0).optional().default(0),
  packQuantity: z.coerce.number().min(0.01).optional().default(1),
});

export type ProductVariantInput = z.infer<typeof productVariantSchema>;

export const nutritionalInfoSchema = z.object({
  servingSize: z.string().trim().optional(),
  energy: z.string().trim().optional(),
  protein: z.string().trim().optional(),
  carbs: z.string().trim().optional(),
  fats: z.string().trim().optional(),
}).strict();

export type NutritionalInfoInput = z.infer<typeof nutritionalInfoSchema>;

export const createProductSchema = z.object({
  storeId: z.string().trim().min(1).optional(),
  name: z.string().trim().min(2, "Product name must be at least 2 characters").max(120),
  description: z.string().trim().max(2000).optional().default(""),
  brand: z.string().trim().max(100).optional().default(""),
  sku: z.string().trim().min(1, "SKU is required").max(100),
  price: z.coerce.number().min(0, "Price cannot be negative"),
  discountPrice: z.coerce.number().min(0, "Discount price cannot be negative").optional().default(0),
  quantity: z.coerce.number().int().min(0, "Quantity cannot be negative").optional().default(0),
  sellingType: z.enum(["PIECE", "WEIGHT", "VOLUME"]).optional().default("PIECE"),
  baseUnit: z.string().trim().optional().default("piece"),
  unitLabel: z.string().trim().optional().default("piece"),
  minQuantity: z.coerce.number().min(0.01).optional().default(1),
  stepQuantity: z.coerce.number().min(0.01).optional().default(1),
  allowCustomQuantity: multipartBoolean.optional().default(false),
  stockTrackingMode: z.enum(["SEPARATE", "SHARED"]).optional().default("SEPARATE"),
  hasNutritionalInfo: multipartBoolean.optional().default(false),
  nutritionalInfo: z.preprocess(preprocessJson, nutritionalInfoSchema.nullable().optional()),
  variants: z.preprocess(preprocessJson, z.array(productVariantSchema)).optional().default([]),
  categoryId: z.string().trim().min(1, "Category is required"),
  images: z.array(z.string().trim().min(1)).optional().default([]),
  imageUrl: optionalImageUrl,
  isPublished: multipartBoolean.optional().default(false),
  isActive: multipartBoolean.optional().default(true),
  isFeatured: multipartBoolean.optional().default(false),
  isBestseller: multipartBoolean.optional().default(false),
  isTrending: multipartBoolean.optional().default(false),
}).strict();

export type CreateProductInput = z.infer<typeof createProductSchema>;
export const bulkCreateProductSchema = z.array(createProductSchema)
  .min(1, "Product list must contain at least one item")
  .max(100, "Cannot import more than 100 products");

export type BulkCreateProductInput = z.infer<typeof bulkCreateProductSchema>;

export const updateProductSchema = z.object({
  storeId: z.string().trim().min(1).optional(),
  name: z.string().trim().min(2, "Product name must be at least 2 characters").max(120).optional(),
  description: z.string().trim().max(2000).optional(),
  brand: z.string().trim().max(100).optional(),
  sku: z.string().trim().min(1, "SKU is required").max(100).optional(),
  price: z.coerce.number().min(0, "Price cannot be negative").optional(),
  discountPrice: z.coerce.number().min(0, "Discount price cannot be negative").optional(),
  quantity: z.coerce.number().int().min(0, "Quantity cannot be negative").optional(),
  sellingType: z.enum(["PIECE", "WEIGHT", "VOLUME"]).optional(),
  baseUnit: z.string().trim().optional(),
  unitLabel: z.string().trim().optional(),
  minQuantity: z.coerce.number().min(0.01).optional(),
  stepQuantity: z.coerce.number().min(0.01).optional(),
  allowCustomQuantity: multipartBoolean.optional(),
  stockTrackingMode: z.enum(["SEPARATE", "SHARED"]).optional(),
  hasNutritionalInfo: multipartBoolean.optional(),
  nutritionalInfo: z.preprocess(preprocessJson, nutritionalInfoSchema.nullable().optional()),
  variants: z.preprocess(preprocessJson, z.array(productVariantSchema)).optional(),
  categoryId: z.string().trim().min(1, "Category is required").optional(),
  images: z.array(z.string().trim().min(1)).optional(),
  imageUrl: optionalImageUrl,
  isPublished: multipartBoolean.optional(),
  isActive: multipartBoolean.optional(),
  isFeatured: multipartBoolean.optional(),
  isBestseller: multipartBoolean.optional(),
  isTrending: multipartBoolean.optional(),
}).strict();

export type UpdateProductInput = z.infer<typeof updateProductSchema>;

export const bulkProductActionSchema = z.object({
  productIds: z.array(z.string().trim().min(1)).min(1, "At least one product must be selected"),
  action: z.enum(["activate", "deactivate", "delete", "restore", "feature", "unfeature"]),
}).strict();

export type BulkProductActionInput = z.infer<typeof bulkProductActionSchema>;

export const addImagesSchema = z.object({
  images: z.array(z.string().trim().min(1, "Image URL cannot be empty")).min(1, "At least one image is required"),
}).strict();

export type AddImagesInput = z.infer<typeof addImagesSchema>;

export const removeImageSchema = z.object({
  image: z.string().trim().min(1, "Image URL cannot be empty"),
}).strict();

export type RemoveImageInput = z.infer<typeof removeImageSchema>;

export const updateThumbnailSchema = z.object({
  thumbnail: z.string().trim().min(1, "Thumbnail cannot be empty"),
}).strict();

export type UpdateThumbnailInput = z.infer<typeof updateThumbnailSchema>;

export const cloneProductsToStoreSchema = z.object({
  targetStoreId: z.string().trim().min(1, "Target store ID is required"),
  productIds: z.array(z.string().trim().min(1)).min(1, "At least one product must be selected"),
  defaultStock: z.coerce.number().int().min(0).optional().default(0),
  isPublished: z.boolean().optional().default(true),
}).strict();

export type CloneProductsToStoreInput = z.infer<typeof cloneProductsToStoreSchema>;

