import { Response } from "express";
import { AppError } from "../errors/AppError";
import { AuthRequest } from "../middleware/auth.middleware";
import { ApiResponse } from "../utils/apiResponse";
import { OrderService } from "../services/order.service";
import { ReviewService } from "../services/review.service";
import {
  checkoutQuoteSchema,
  createOrderSchema,
  orderIdParamSchema,
} from "../validators/checkout.validator";
import { z } from "zod";

export const getCheckoutQuote = async (req: AuthRequest, res: Response): Promise<void> => {
  const payload = (req.body && typeof req.body === "object" ? req.body : {}) as Record<
    string,
    unknown
  >;
  const result = checkoutQuoteSchema.safeParse(payload);

  if (!result.success) {
    const message = result.error.issues[0]?.message || "Invalid quote payload";
    throw new AppError(message, 400);
  }

  const quote = await OrderService.calculateOrderSummary(
    req.user?.userId as string,
    result.data.storeId,
    result.data.deliveryMethod,
    result.data.couponCode
  );

  res.status(200).json(new ApiResponse(true, "Checkout quote calculated successfully", { quote }));
};

export const createOrder = async (req: AuthRequest, res: Response): Promise<void> => {
  const payload = (req.body && typeof req.body === "object" ? req.body : {}) as Record<
    string,
    unknown
  >;
  const result = createOrderSchema.safeParse(payload);

  if (!result.success) {
    const message = result.error.issues[0]?.message || "Invalid checkout payload";
    throw new AppError(message, 400);
  }

  const order = await OrderService.createOrder(req.user?.userId as string, result.data);
  res.status(201).json(new ApiResponse(true, "Order placed successfully", { order }));
};

export const getOrders = async (req: AuthRequest, res: Response): Promise<void> => {
  const orders = await OrderService.getOrders(req.user!.userId);

  res.status(200).json(new ApiResponse(true, "Orders fetched successfully", { orders }));
};

export const getOrder = async (req: AuthRequest, res: Response): Promise<void> => {
  const orderId = Array.isArray(req.params.orderId) ? req.params.orderId[0] : req.params.orderId;
  const result = orderIdParamSchema.safeParse({ orderId });

  if (!result.success) {
    const message = result.error.issues[0]?.message || "Invalid order ID";
    throw new AppError(message, 400);
  }

  const order = await OrderService.getOrder(req.user?.userId as string, result.data.orderId);
  res.status(200).json(new ApiResponse(true, "Order fetched successfully", { order }));
};

export const cancelCustomerOrder = async (req: AuthRequest, res: Response): Promise<void> => {
  const orderId = Array.isArray(req.params.orderId) ? req.params.orderId[0] : req.params.orderId;
  const reason = typeof req.body?.reason === "string" ? req.body.reason : undefined;
  const order = await OrderService.cancelCustomerOrder(req.user!.userId, orderId, reason);
  res.status(200).json(new ApiResponse(true, "Order cancelled successfully", { order }));
};

export const updateSellerOrderStatus = async (req: AuthRequest, res: Response): Promise<void> => {
  const orderId = Array.isArray(req.params.orderId) ? req.params.orderId[0] : req.params.orderId;
  const status = req.body?.status;
  const allowedStatuses = ["ACCEPTED", "PREPARING", "READY_FOR_PICKUP", "READY_FOR_DISPATCH", "OUT_FOR_DELIVERY", "PICKED_UP", "DELIVERED", "CANCELLED"];
  if (typeof status !== "string" || !allowedStatuses.includes(status)) {
    throw new AppError("Invalid order status", 400);
  }

  const order = await OrderService.updateSellerOrderStatus(req.user!.userId, orderId, status);
  res.status(200).json(new ApiResponse(true, "Order status updated successfully", { order }));
};

export const updateDeliveryEta = async (req: AuthRequest, res: Response): Promise<void> => {
  const orderId = Array.isArray(req.params.orderId) ? req.params.orderId[0] : req.params.orderId;
  const result = z.object({ estimatedDeliveryAt: z.string().datetime() }).safeParse(req.body);
  if (!result.success) throw new AppError(result.error.issues[0]?.message || "Invalid delivery ETA", 400);
  const order = await OrderService.updateDeliveryEta(req.user!.userId, orderId, new Date(result.data.estimatedDeliveryAt));
  res.status(200).json(new ApiResponse(true, "Delivery ETA updated successfully", { order }));
};

export const markPaymentReceived = async (req: AuthRequest, res: Response): Promise<void> => {
  const orderId = Array.isArray(req.params.orderId) ? req.params.orderId[0] : req.params.orderId;
  const result = orderIdParamSchema.safeParse({ orderId });
  const paymentMethod = req.body?.paymentMethod;

  if (!result.success) {
    throw new AppError(result.error.issues[0]?.message || "Invalid order ID", 400);
  }
  if (paymentMethod !== "CASH" && paymentMethod !== "UPI" && paymentMethod !== "CARD") {
    throw new AppError("Invalid payment method", 400);
  }

  const order = await OrderService.markPaymentReceived(req.user!.userId, result.data.orderId, paymentMethod);
  res.status(200).json(new ApiResponse(true, "Payment marked as received", { order }));
};

export const getStoreOrders = async (req: AuthRequest, res: Response): Promise<void> => {
  const result = await OrderService.getStoreOrders(req.user!.userId, req.query);
  res.status(200).json(new ApiResponse(true, "Store orders fetched successfully", result));
};

export const bulkUpdateSellerOrderStatus = async (req: AuthRequest, res: Response): Promise<void> => {
  const { orderIds, status } = req.body || {};
  if (!Array.isArray(orderIds) || orderIds.length === 0 || typeof status !== "string") {
    throw new AppError("Invalid bulk update payload. orderIds array and status are required.", 400);
  }

  const result = await OrderService.bulkUpdateSellerOrderStatus(req.user!.userId, orderIds, status);
  res.status(200).json(new ApiResponse(true, "Bulk orders updated successfully", result));
};

export const updateSellerNotes = async (req: AuthRequest, res: Response): Promise<void> => {
  const orderId = Array.isArray(req.params.orderId) ? req.params.orderId[0] : req.params.orderId;
  const sellerNotes = typeof req.body?.sellerNotes === "string" ? req.body.sellerNotes : "";

  const order = await OrderService.updateSellerNotes(req.user!.userId, orderId, sellerNotes);
  res.status(200).json(new ApiResponse(true, "Seller notes updated successfully", { order }));
};

export const rateOrderHandler = async (req: AuthRequest, res: Response): Promise<void> => {
  const orderId = Array.isArray(req.params.orderId) ? req.params.orderId[0] : req.params.orderId;
  const ratingSchema = z.object({
    rating: z.coerce.number().int().min(1, "Rating must be between 1 and 5").max(5, "Rating must be between 1 and 5"),
    comment: z.string().trim().max(1000, "Review cannot exceed 1000 characters").optional(),
  });

  const parsed = ratingSchema.safeParse(req.body);
  if (!parsed.success) {
    throw new AppError(parsed.error.issues[0]?.message || "Invalid rating input", 400);
  }

  const result = await ReviewService.rateStoreOrder(req.user!.userId, orderId, parsed.data);
  res.status(200).json(new ApiResponse(true, result.message, result));
};
