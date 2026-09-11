import { Response } from "express";
import { AuthRequest } from "../middleware/auth.middleware";
import { ApiResponse } from "../utils/apiResponse";
import { PaymentService } from "../services/payment.service";
import { createOrderSchema, verifyPaymentSchema } from "../validators/checkout.validator";
import { AppError } from "../errors/AppError";

export const createPaymentOrder = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {

  const checkoutResult = createOrderSchema.safeParse(req.body?.checkout ?? req.body);
  if (!checkoutResult.success) throw new AppError(checkoutResult.error.issues[0]?.message || "Invalid checkout payload", 400);

  const payment = await PaymentService.createPaymentOrder(
    req.user!.userId,
    checkoutResult.data
  );

  res.status(200).json(
    new ApiResponse(true, "Payment order created", payment)
  );
};

export const verifyPayment = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {

  const result = verifyPaymentSchema.safeParse(req.body);
  if (!result.success) throw new AppError(result.error.issues[0]?.message || "Invalid payment verification payload", 400);
  const { razorpayOrderId, razorpayPaymentId, razorpaySignature, checkout } = result.data;

  const order = await PaymentService.verifyPayment(
    req.user!.userId,
    razorpayOrderId,
    razorpayPaymentId,
    razorpaySignature,
    checkout
  );

  res.status(200).json(
    new ApiResponse(true, "Payment verified successfully", { order })
  );
};