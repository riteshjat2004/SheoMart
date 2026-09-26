import { Request, Response } from "express";
import { SettingsService } from "../services/settings.service";
import { AuditLogService } from "../services/audit-log.service";
import { ApiResponse } from "../utils/apiResponse";
import { AppError } from "../errors/AppError";
import { Product } from "../models/product.model";
import { Category } from "../models/category.model";
import { User } from "../models/user.model";
import { Store } from "../models/store.model";
import { Coupon } from "../models/coupon.model";

export const getPublicSettings = async (_req: Request, res: Response): Promise<void> => {
  const settings = await SettingsService.getPublicSettings();
  res.status(200).json(
    new ApiResponse(true, "Marketplace settings fetched", settings)
  );
};

export const getAdminSettings = async (_req: Request, res: Response): Promise<void> => {
  const settings = await SettingsService.getSettings();
  res.status(200).json(
    new ApiResponse(true, "Admin marketplace settings fetched", settings)
  );
};

export const updateAdminSettings = async (req: Request, res: Response): Promise<void> => {
  const currentUserId = (req as any).user?.userId;
  const currentUserName = (req as any).user?.name || "Admin";

  const updatedSettings = await SettingsService.updateSettings(
    req.body,
    { userId: currentUserId, name: currentUserName },
    req
  );

  res.status(200).json(
    new ApiResponse(true, "Marketplace settings updated successfully", updatedSettings)
  );
};

export const getAdminAuditLogs = async (req: Request, res: Response): Promise<void> => {
  const { page, limit, module: mod, action, search, from, to } = req.query;

  const result = await AuditLogService.getAuditLogs({
    page: page ? Number(page) : undefined,
    limit: limit ? Number(limit) : undefined,
    module: mod ? String(mod) : undefined,
    action: action ? String(action) : undefined,
    search: search ? String(search) : undefined,
    from: from ? String(from) : undefined,
    to: to ? String(to) : undefined,
  });

  res.status(200).json(
    new ApiResponse(true, "Audit logs fetched successfully", result)
  );
};

export const createBackup = async (req: Request, res: Response): Promise<void> => {
  const currentUserId = (req as any).user?.userId;
  const currentUserName = (req as any).user?.name || "Admin";

  const result = await SettingsService.createBackup(
    { userId: currentUserId, name: currentUserName },
    req
  );

  res.status(200).json(
    new ApiResponse(true, "Platform backup generated successfully", result)
  );
};

export const downloadBackupSnapshot = async (_req: Request, res: Response): Promise<void> => {
  const settings = await SettingsService.getSettings();
  const health = await SettingsService.getSystemHealth();

  const snapshot = {
    exportedAt: new Date().toISOString(),
    platform: "SheoMart Hyperlocal Marketplace",
    version: health.versions,
    settings: settings.toObject(),
    health: health.services,
  };

  const jsonStr = JSON.stringify(snapshot, null, 2);
  const filename = `sheomart-settings-backup-${new Date().toISOString().slice(0, 10)}.json`;

  res.setHeader("Content-Type", "application/json");
  res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);
  res.status(200).send(jsonStr);
};

export const getSystemHealth = async (_req: Request, res: Response): Promise<void> => {
  const health = await SettingsService.getSystemHealth();
  res.status(200).json(
    new ApiResponse(true, "System health retrieved", health)
  );
};

export const exportPlatformDataset = async (req: Request, res: Response): Promise<void> => {
  const type = req.query.type as string;
  let csvContent = "";
  let filename = `sheomart-${type || "export"}-${new Date().toISOString().slice(0, 10)}.csv`;

  if (type === "products") {
    const products = await Product.find({ isDeleted: false }).limit(1000).lean();
    csvContent = "Product ID,Name,SKU,Price,Quantity,Rating,Total Reviews,Created At\n";
    products.forEach((p) => {
      csvContent += `"${p.productId}","${(p.name || "").replace(/"/g, '""')}","${p.sku || ""}","${p.price}","${p.quantity}","${p.rating || 0}","${p.totalReviews || 0}","${p.createdAt}"\n`;
    });
  } else if (type === "categories") {
    const categories = await Category.find().lean();
    csvContent = "Category ID,Name,Slug,Status,Created At\n";
    categories.forEach((c) => {
      csvContent += `"${c.categoryId}","${(c.name || "").replace(/"/g, '""')}","${c.slug || ""}","${c.isActive ? "Active" : "Inactive"}","${c.createdAt}"\n`;
    });
  } else if (type === "users") {
    const users = await User.find({ isDeleted: false }).select("-password").limit(1000).lean();
    csvContent = "User ID,Name,Email,Mobile,Role,Verified Customer,Active,Created At\n";
    users.forEach((u) => {
      csvContent += `"${u.userId}","${(u.name || "").replace(/"/g, '""')}","${u.email}","${u.mobile}","${u.role}","${u.isVerifiedCustomer}","${u.isActive}","${u.createdAt}"\n`;
    });
  } else if (type === "stores") {
    const stores = await Store.find({ isDeleted: false }).limit(1000).lean();
    csvContent = "Store ID,Store Name,Owner ID,Status,Badge,Rating,Total Reviews,Created At\n";
    stores.forEach((s) => {
      csvContent += `"${s.storeId}","${(s.storeName || "").replace(/"/g, '""')}","${s.ownerId}","${s.status}","${s.badge}","${s.rating || 0}","${s.totalReviews || 0}","${s.createdAt}"\n`;
    });
  } else if (type === "coupons") {
    const coupons = await Coupon.find().limit(1000).lean();
    csvContent = "Code,Discount Type,Discount Value,Min Order,Max Discount,Usage Count,Active,Expires At\n";
    coupons.forEach((c) => {
      csvContent += `"${c.code}","${c.discountType}","${c.discountValue}","${c.minimumCartValue}","${c.maximumDiscount || ""}","${c.usageCount}","${c.isActive}","${c.endsAt}"\n`;
    });
  } else {
    throw new AppError("Invalid export type. Supported: products, categories, users, stores, coupons", 400);
  }

  res.setHeader("Content-Type", "text/csv; charset=utf-8");
  res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);
  res.status(200).send(csvContent);
};

export const uploadBrandingAsset = async (req: Request, res: Response): Promise<void> => {
  if (!req.file) {
    throw new AppError("No image file provided", 400);
  }

  const { uploadBufferToCloudinary } = await import("../utils/cloudinary");
  const { CLOUDINARY_FOLDERS } = await import("../constants/cloudinary");

  const result = await uploadBufferToCloudinary(req.file.buffer, CLOUDINARY_FOLDERS.BRANDING);

  res.status(200).json(
    new ApiResponse(true, "Branding asset uploaded successfully", {
      url: result.secure_url,
      publicId: result.public_id,
      width: result.width,
      height: result.height,
    })
  );
};

