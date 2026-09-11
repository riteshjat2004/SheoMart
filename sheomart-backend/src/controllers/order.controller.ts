import { Response } from "express";
import { AppError } from "../errors/AppError";
import { AuthRequest } from "../middleware/auth.middleware";
import { ApiResponse } from "../utils/apiResponse";
import { OrderService } from "../services/order.service";
import { createOrderSchema, orderIdParamSchema } from "../validators/checkout.validator";
import { z } from "zod";

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
