import { Response } from "express";
import { AppError } from "../errors/AppError";
import { AuthRequest } from "../middleware/auth.middleware";
import { ApiResponse } from "../utils/apiResponse";
import { InventoryService } from "../services/inventory.service";
import { updateInventorySchema, updateInventoryStatusSchema } from "../validators/inventory.validator";

export const syncStoreInventory = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  const inventories = await InventoryService.syncStoreInventory(req.user?.userId as string);

  res.status(200).json(
    new ApiResponse(true, "Inventory synchronized successfully", { inventories })
  );
};

export const getInventory = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  const productId = Array.isArray(req.params.productId) ? req.params.productId[0] : req.params.productId;
  const inventory = await InventoryService.getInventory(productId, req.user?.userId as string, req.user?.role);

  res.status(200).json(
    new ApiResponse(true, "Inventory fetched successfully", { inventory })
  );
};

export const updateInventory = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  const payload = (req.body && typeof req.body === "object" ? req.body : {}) as Record<string, unknown>;
  const result = updateInventorySchema.safeParse(payload);

  if (!result.success) {
    const message = result.error.issues[0]?.message || "Invalid inventory payload";
    throw new AppError(message, 400);
  }

  const productId = Array.isArray(req.params.productId) ? req.params.productId[0] : req.params.productId;
  const inventory = await InventoryService.updateInventory(productId, result.data, req.user?.userId as string, req.user?.role);

  res.status(200).json(
    new ApiResponse(true, "Inventory updated successfully", { inventory })
  );
};

export const updateInventoryStatus = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  const payload = (req.body && typeof req.body === "object" ? req.body : {}) as Record<string, unknown>;
  const result = updateInventoryStatusSchema.safeParse(payload);

  if (!result.success) {
    const message = result.error.issues[0]?.message || "Invalid inventory status payload";
    throw new AppError(message, 400);
  }

  const productId = Array.isArray(req.params.productId) ? req.params.productId[0] : req.params.productId;
  const inventory = await InventoryService.updateInventoryStatus(productId, result.data, req.user?.userId as string, req.user?.role);

  res.status(200).json(
    new ApiResponse(true, "Inventory status updated successfully", { inventory })
  );
};
