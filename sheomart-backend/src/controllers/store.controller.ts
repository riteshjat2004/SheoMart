import { Response } from "express";
import { AppError } from "../errors/AppError";
import { AuthRequest } from "../middleware/auth.middleware";
import { ApiResponse } from "../utils/apiResponse";
import { StoreService } from "../services/store.service";
import {
  createStoreSchema,
  protectedStoreUpdateFields,
  updateStoreBadgeSchema,
  updateStoreSchema,
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
  const store = await StoreService.updateStoreStatus(
    storeId,
    req.body.status,
    req.user?.userId
  );

  res.status(200).json(
    new ApiResponse(true, "Store status updated successfully", { store })
  );
};
