import { Response } from "express";
import { AuthRequest } from "../middleware/auth.middleware";
import { NotificationService } from "../services/notification.service";
import { Store } from "../models/store.model";
import { ApiResponse } from "../utils/apiResponse";
import { AppError } from "../errors/AppError";

async function getSellerStoreId(userId: string): Promise<string> {
  const store = await Store.findOne({ ownerId: userId }).select("storeId").lean();
  if (!store?.storeId) {
    throw new AppError("No store associated with this seller account", 404);
  }
  return store.storeId;
}

export const getStoreNotifications = async (req: AuthRequest, res: Response) => {
  const userId = req.user?.userId;
  if (!userId) throw new AppError("Unauthorized", 401);

  const storeId = await getSellerStoreId(userId);
  const { page, limit, unreadOnly } = req.query;

  const result = await NotificationService.getStoreNotifications(storeId, {
    page: page ? Number(page) : undefined,
    limit: limit ? Number(limit) : undefined,
    unreadOnly: unreadOnly === "true",
  });

  return res.status(200).json(new ApiResponse(true, "Store notifications retrieved", result));
};

export const markNotificationAsRead = async (req: AuthRequest, res: Response) => {
  const userId = req.user?.userId;
  if (!userId) throw new AppError("Unauthorized", 401);

  const storeId = await getSellerStoreId(userId);
  const notificationId = String(req.params.notificationId || "");

  const updated = await NotificationService.markAsRead(storeId, notificationId);
  return res.status(200).json(new ApiResponse(true, "Notification marked as read", { notification: updated }));
};

export const markAllStoreNotificationsAsRead = async (req: AuthRequest, res: Response) => {
  const userId = req.user?.userId;
  if (!userId) throw new AppError("Unauthorized", 401);

  const storeId = await getSellerStoreId(userId);
  const result = await NotificationService.markAllAsRead(storeId);

  return res.status(200).json(new ApiResponse(true, "All store notifications marked as read", result));
};

export const getStoreUnreadCount = async (req: AuthRequest, res: Response) => {
  const userId = req.user?.userId;
  if (!userId) throw new AppError("Unauthorized", 401);

  const storeId = await getSellerStoreId(userId);
  const result = await NotificationService.getUnreadCount(storeId);

  return res.status(200).json(new ApiResponse(true, "Unread count retrieved", result));
};

