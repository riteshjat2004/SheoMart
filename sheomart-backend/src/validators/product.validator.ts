import { z } from "zod";

export const createProductSchema = z.object({
  name: z.string().trim().min(2, "Product name must be at least 2 characters").max(120),
  description: z.string().trim().max(2000).optional().default(""),
  brand: z.string().trim().max(100).optional().default(""),
  sku: z.string().trim().min(1, "SKU is required").max(100),
  price: z.number().min(0, "Price cannot be negative"),
  discountPrice: z.number().min(0, "Discount price cannot be negative").optional().default(0),
  quantity: z.number().int().min(0, "Quantity cannot be negative").optional().default(0),
  categoryId: z.string().trim().min(1, "Category is required"),
  images: z.array(z.string().trim().min(1)).optional().default([]),
  isPublished: z.boolean().optional().default(false),
}).strict();

export type CreateProductInput = z.infer<typeof createProductSchema>;

export const updateProductSchema = z.object({
  name: z.string().trim().min(2, "Product name must be at least 2 characters").max(120).optional(),
  description: z.string().trim().max(2000).optional(),
  brand: z.string().trim().max(100).optional(),
  sku: z.string().trim().min(1, "SKU is required").max(100).optional(),
  price: z.number().min(0, "Price cannot be negative").optional(),
  discountPrice: z.number().min(0, "Discount price cannot be negative").optional(),
  quantity: z.number().int().min(0, "Quantity cannot be negative").optional(),
  categoryId: z.string().trim().min(1, "Category is required").optional(),
  images: z.array(z.string().trim().min(1)).optional(),
  isPublished: z.boolean().optional(),
  isActive: z.boolean().optional(),
}).strict();

export type UpdateProductInput = z.infer<typeof updateProductSchema>;

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
