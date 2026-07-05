import { Response } from "express";
import { AppError } from "../errors/AppError";
import { AuthRequest } from "../middleware/auth.middleware";
import { ApiResponse } from "../utils/apiResponse";
import { OrderService } from "../services/order.service";
import { createOrderSchema, orderIdParamSchema } from "../validators/checkout.validator";

export const createOrder = async (req: AuthRequest, res: Response): Promise<void> => {
  const payload = (req.body && typeof req.body === "object" ? req.body : {}) as Record<string, unknown>;
  const result = createOrderSchema.safeParse(payload);

  if (!result.success) {
    const message = result.error.issues[0]?.message || "Invalid checkout payload";
    throw new AppError(message, 400);
  }

  const order = await OrderService.createOrder(req.user?.userId as string, result.data);
  res.status(201).json(new ApiResponse(true, "Order placed successfully", { order }));
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
