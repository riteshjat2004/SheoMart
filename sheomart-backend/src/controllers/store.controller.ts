import { Request, Response } from "express";
import { AppError } from "../errors/AppError";
import { AuthRequest } from "../middleware/auth.middleware";
import { ApiResponse } from "../utils/apiResponse";
import { StoreService } from "../services/store.service";
import { ReviewService } from "../services/review.service";
import { addPlusMember, listPlusMembers, removePlusMember } from "../services/billing.service";
import { Store } from "../models/store.model";
import { uploadBufferToCloudinary } from "../utils/cloudinary";
import { CLOUDINARY_FOLDERS } from "../constants/cloudinary";
import { USER_ROLES } from "../constants/roles";
import {
  createStoreSchema,
  protectedStoreUpdateFields,
  updateStoreBadgeSchema,
  updateStoreSchema,
  updateStoreStatusSchema,
  bulkStoreStatusSchema,
} from "../validators/store.validator";

export const createStore = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  const data = createStoreSchema.parse(req.body);
  const store = await StoreService.createStore(req.user?.userId as string, data);

  res.status(201).json(
    new ApiResponse(true, "Store created successfully", { store })
  );
};

export const getMyStore = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  const store = await StoreService.getMyStore(req.user?.userId as string);

  res.status(200).json(
    new ApiResponse(true, "Store fetched successfully", { store })
  );
};

export const updateMyStore = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  const payload = (req.body && typeof req.body === "object" ? req.body : {}) as Record<string, unknown>;
  const protectedField = Object.keys(payload).find((key) =>
    protectedStoreUpdateFields.includes(key as (typeof protectedStoreUpdateFields)[number])
  );

  if (protectedField) {
    throw new AppError(`Field '${protectedField}' cannot be updated.`, 400);
  }

  const result = updateStoreSchema.safeParse(payload);

  if (!result.success) {
    const message = result.error.issues[0]?.message || "Invalid store update payload";
    throw new AppError(message, 400);
  }

  const store = await StoreService.updateMyStore(req.user?.userId as string, result.data);

  res.status(200).json(
    new ApiResponse(true, "Store updated successfully", { store })
  );
};

export const getStoreById = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  const storeId = Array.isArray(req.params.storeId) ? req.params.storeId[0] : req.params.storeId;
  const store = await StoreService.getStoreById(storeId);

  res.status(200).json(
    new ApiResponse(true, "Store fetched successfully", { store })
  );
};

export const getAllStores = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  const stores = await StoreService.getAllStores({
    pincode: typeof req.query.pincode === "string" ? req.query.pincode : undefined,
    city: typeof req.query.city === "string" ? req.query.city : undefined,
    state: typeof req.query.state === "string" ? req.query.state : undefined,
  });

  res.status(200).json(
    new ApiResponse(true, "Stores fetched successfully", { stores })
  );
};

export const getAdminStores = async (
  _req: AuthRequest,
  res: Response
): Promise<void> => {
  const stores = await StoreService.getAdminStores();

  res.status(200).json(
    new ApiResponse(true, "Stores fetched successfully", { stores })
  );
};

export const updateStoreBadge = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  const storeId = Array.isArray(req.params.storeId) ? req.params.storeId[0] : req.params.storeId;
  const payload = (req.body && typeof req.body === "object" ? req.body : {}) as Record<string, unknown>;
  const result = updateStoreBadgeSchema.safeParse(payload);

  if (!result.success) {
    const message = result.error.issues[0]?.message || "Invalid store badge payload";
    throw new AppError(message, 400);
  }

  const store = await StoreService.updateStoreBadge(storeId, result.data.badge);

  res.status(200).json(
    new ApiResponse(true, "Store badge updated successfully", { store })
  );
};

export const updateStoreStatus = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  const storeId = Array.isArray(req.params.storeId) ? req.params.storeId[0] : req.params.storeId;
  const result = updateStoreStatusSchema.safeParse(req.body);

  if (!result.success) {
    const message = result.error.issues[0]?.message || "Invalid store status payload";
    throw new AppError(message, 400);
  }

  const store = await StoreService.updateStoreStatus(
    storeId,
    result.data.status,
    req.user?.userId
  );

  res.status(200).json(
    new ApiResponse(true, "Store status updated successfully", { store })
  );
};

export const deleteStore = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  const storeId = Array.isArray(req.params.storeId) ? req.params.storeId[0] : req.params.storeId;
  const store = await StoreService.deleteStore(storeId);

  res.status(200).json(
    new ApiResponse(true, "Store deleted successfully", { store })
  );
};

export const bulkUpdateStoreStatus = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  const result = bulkStoreStatusSchema.safeParse(req.body);

  if (!result.success) {
    const message = result.error.issues[0]?.message || "Invalid bulk store status payload";
    throw new AppError(message, 400);
  }

  const { storeIds, status } = result.data;
  const outcome = await StoreService.bulkUpdateStatus(
    storeIds,
    status,
    req.user?.userId
  );

  res.status(200).json(
    new ApiResponse(true, `Bulk store update successful (${outcome.modifiedCount} stores updated)`, outcome)
  );
};

export const getPlusMembers = async (req: AuthRequest, res: Response): Promise<void> => {
  const members = await listPlusMembers(req.user!.userId, typeof req.query.search === "string" ? req.query.search : undefined);
  res.status(200).json(new ApiResponse(true, "Plus members fetched successfully", { members }));
};

export const createPlusMember = async (req: AuthRequest, res: Response): Promise<void> => {
  const identifier = typeof req.body?.identifier === "string" ? req.body.identifier : "";
  const normalizedPhone = identifier.replace(/\D/g, "");
  const validEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(identifier.trim());
  const validPhone = normalizedPhone.length === 10;
  if (!validEmail && !validPhone) throw new AppError("Enter a valid email or 10-digit phone number", 400);
  const member = await addPlusMember(req.user!.userId, identifier);
  res.status(201).json(new ApiResponse(true, "Plus membership granted", { member }));
};

export const deletePlusMember = async (req: AuthRequest, res: Response): Promise<void> => {
  const memberId = Array.isArray(req.params.memberId) ? req.params.memberId[0] : req.params.memberId;
  const member = await removePlusMember(req.user!.userId, memberId);
  res.status(200).json(new ApiResponse(true, "Plus membership removed", { member }));
};

export const uploadStoreAsset = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  if (!req.file?.buffer) {
    throw new AppError("No image file provided", 400);
  }

  const assetType = req.body?.assetType === "banner" ? "banner" : "logo";
  const uploadResult = await uploadBufferToCloudinary(
    req.file.buffer,
    CLOUDINARY_FOLDERS.STORES
  );

  let store;
  if (req.user?.role === USER_ROLES.PLATFORM_ADMIN && req.body?.storeId) {
    store = await Store.findOne({ storeId: req.body.storeId });
  } else {
    store = await Store.findOne({ ownerId: req.user?.userId });
  }

  if (store) {
    if (assetType === "banner") {
      store.banner = uploadResult.secure_url;
    } else {
      store.logo = uploadResult.secure_url;
    }
    await store.save();
  }

  res.status(200).json(
    new ApiResponse(
      true,
      `${assetType === "banner" ? "Banner" : "Logo"} uploaded successfully to Cloudinary`,
      {
        url: uploadResult.secure_url,
        publicId: uploadResult.public_id,
        assetType,
        store,
      }
    )
  );
};

export const getPublicStoreReviews = async (
  req: Request | AuthRequest,
  res: Response
): Promise<void> => {
  const storeId = Array.isArray(req.params.storeId) ? req.params.storeId[0] : req.params.storeId;
  const store = await Store.findOne({ storeId });
  if (!store) {
    throw new AppError("Store not found", 404);
  }

  const query = {
    page: req.query.page ? Number(req.query.page) : 1,
    limit: req.query.limit ? Number(req.query.limit) : 10,
    rating: req.query.rating ? Number(req.query.rating) : undefined,
    sortBy: (req.query.sortBy as string) || "highest",
    isPublic: true,
  };

  const result = await ReviewService.getStoreReviews(store.ownerId, query);
  res.status(200).json(
    new ApiResponse(true, "Store reviews fetched successfully", {
      ...result,
      total: result.stats.totalReviews ?? result.pagination.total,
      averageRating: result.stats.averageRating,
    })
  );
};

