import { AppError } from "../errors/AppError";
import { SellerPasswordResetRequest } from "../models/seller-password-reset-request.model";
import { Store } from "../models/store.model";
import { User } from "../models/user.model";
import { USER_ROLES } from "../constants/roles";
import { comparePassword, hashPassword } from "../utils/password";
import { sendSellerPasswordResetNotification } from "./mail.service";
import { logger } from "../utils/logger";
import mongoose from "mongoose";
import { SecurityAuditLog } from "../models/security-audit-log.model";

export class SellerPasswordResetService {
  static async getSellerRecovery(email: string) {
    const seller = await User.findOne({
      email,
      role: USER_ROLES.STORE_OWNER,
      isActive: true,
    }).lean();
    if (!seller) throw new AppError("Seller account not found", 404);
    const store = await Store.findOne({ ownerId: seller.userId }).lean();
    const latestRequest = await SellerPasswordResetRequest.findOne({ sellerId: seller.userId })
      .sort({ createdAt: -1 })
      .lean();
    return {
      sellerId: seller.userId,
      email: seller.email,
      storeId: store?.storeId ?? "",
      storeName: store?.storeName ?? "",
      latestRequest: latestRequest
        ? {
            id: latestRequest._id.toString(),
            status: latestRequest.status,
            createdAt: latestRequest.createdAt,
            adminRemarks: latestRequest.adminRemarks,
          }
        : null,
    };
  }

  static async createRequest(
    data: { email: string; newPassword: string; reason: string },
    ip: string
  ) {
    const seller = await User.findOne({
      email: data.email,
      role: USER_ROLES.STORE_OWNER,
      isActive: true,
    }).select("+password");
    if (!seller) throw new AppError("Seller account not found", 404);
    const store = await Store.findOne({ ownerId: seller.userId });
    if (!store) throw new AppError("Store owner does not have a store", 409);
    const pending = await SellerPasswordResetRequest.exists({
      sellerId: seller.userId,
      status: "pending",
    });
    if (pending) throw new AppError("A password reset request is already pending review", 409);
    if (await comparePassword(data.newPassword, seller.password))
      throw new AppError("New password must be different from your current password", 400);

    const session = await mongoose.startSession();
    let requestId = "";
    let requestStatus = "pending";
    let requestCreatedAt = new Date();
    try {
          await session.withTransaction(async () => {
            const [request] = await SellerPasswordResetRequest.create([{
              sellerId: seller.userId,
              storeId: store.storeId,
              email: seller.email,
              pendingPasswordHash: await hashPassword(data.newPassword),
              reason: data.reason,
            }], { session });
            requestId = request._id.toString();
            requestStatus = request.status;
            requestCreatedAt = request.createdAt;
            await SecurityAuditLog.create([{
            action: "seller_password_reset_requested",
            sellerId: seller.userId,
            requestId,
            ip,
            }], { session });
      });
    } finally {
      await session.endSession();
    }
    try {
      await sendSellerPasswordResetNotification(seller.email, "pending", "");
    } catch (error) {
      logger.error(`Seller password reset pending email failed for request ${requestId}`, error);
    }
    return { id: requestId, status: requestStatus, createdAt: requestCreatedAt };
  }

  static async listRequests() {
    const requests = await SellerPasswordResetRequest.find().sort({ createdAt: -1 }).lean();
    const sellerIds = requests.map((request) => request.sellerId);
    const storeIds = requests.map((request) => request.storeId);
    const [sellers, stores] = await Promise.all([
      User.find({ userId: { $in: sellerIds } })
        .select("userId name email")
        .lean(),
      Store.find({ storeId: { $in: storeIds } })
        .select("storeId storeName badge status")
        .lean(),
    ]);
    const sellerMap = new Map(sellers.map((seller) => [seller.userId, seller]));
    const storeMap = new Map(stores.map((store) => [store.storeId, store]));
    return requests.map((request) => ({
      ...request,
      id: request._id.toString(),
      sellerName: sellerMap.get(request.sellerId)?.name ?? "Unknown seller",
      storeName: storeMap.get(request.storeId)?.storeName ?? "Unknown store",
      storeBadge: storeMap.get(request.storeId)?.badge ?? "normal",
      storeStatus: storeMap.get(request.storeId)?.status ?? "unknown",
    }));
  }

  static async reviewRequest(
    requestId: string,
    adminId: string,
    status: "approved" | "rejected",
    adminRemarks: string,
    ip: string
  ) {
    const session = await mongoose.startSession();
    let result: { id: string; status: string; reviewedAt?: Date; email: string };
    let stage = "transaction-start";
    try {
      await session.withTransaction(async () => {
        stage = "request-lookup";
        const request = await SellerPasswordResetRequest.findById(requestId)
          .select("+pendingPasswordHash")
          .session(session);
        if (!request) throw new AppError("Password reset request not found", 404);
        if (request.status !== "pending")
          throw new AppError("This request has already been reviewed", 409);
        if (!request.pendingPasswordHash)
          throw new AppError("Pending password payload is unavailable", 409, "request-payload");
        stage = "seller-lookup";
        const seller = await User.findOne({
          userId: request.sellerId,
          role: USER_ROLES.STORE_OWNER,
        })
          .select("+password")
          .session(session);
        if (!seller) throw new AppError("Seller account not found", 404);
        const reviewedAt = new Date();
        if (status === "approved") {
          stage = "transaction-password-update";
          seller.password = request.pendingPasswordHash;
          seller.sessions = [];
          await seller.save({ session });
          await SellerPasswordResetRequest.deleteMany(
            { sellerId: request.sellerId, status: "pending", _id: { $ne: request._id } },
            { session }
          );
        }
        stage = "transaction-request-update";
        request.status = status;
        request.adminRemarks = adminRemarks;
        request.reviewedAt = reviewedAt;
        request.reviewedBy = adminId;
        request.pendingPasswordHash = undefined;
        await request.save({ session });
        stage = "transaction-audit-log";
        await SecurityAuditLog.create(
          [
            {
              action:
                status === "approved"
                  ? "seller_password_reset_approved"
                  : "seller_password_reset_rejected",
              sellerId: request.sellerId,
              adminId,
              requestId: request._id.toString(),
              ip,
            },
          ],
          { session }
        );
        result = {
          id: request._id.toString(),
          status: request.status,
          reviewedAt,
          email: request.email,
        };
      });
    } catch (error) {
      logger.error(`Seller password reset ${status} failed at ${stage} for request ${requestId}`, error);
      if (error instanceof AppError) {
        error.stage ??= stage;
        throw error;
      }
      throw new AppError("Password reset review failed", 500, stage);
    } finally {
      await session.endSession();
    }
    logger.info(`Seller password reset request ${result!.id} ${status} by admin ${adminId}`);
    try {
      await sendSellerPasswordResetNotification(result!.email, status, adminRemarks);
    } catch (error) {
      logger.error(`Seller password reset ${status} email failed for request ${result!.id}`, error);
    }
    return { id: result!.id, status: result!.status, reviewedAt: result!.reviewedAt };
  }

  static async cleanupResolvedRequests() {
    const now = Date.now();
    await SellerPasswordResetRequest.deleteMany({
      status: "pending",
      createdAt: { $lt: new Date(now - 24 * 60 * 60_000) },
    });
    await SellerPasswordResetRequest.deleteMany({
      status: { $in: ["approved", "rejected"] },
      reviewedAt: { $lt: new Date(now - 30 * 24 * 60 * 60_000) },
    });
  }
}
