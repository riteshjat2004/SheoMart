import { Response } from "express";
import { AuthRequest } from "../middleware/auth.middleware";
import { ApiResponse } from "../utils/apiResponse";
import { PaymentService } from "../services/payment.service";

export const createPaymentOrder = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {

  const { orderId } = req.body;

  const payment = await PaymentService.createPaymentOrder(
    req.user!.userId,
    orderId
  );

  res.status(200).json(
    new ApiResponse(true, "Payment order created", payment)
  );
};

export const verifyPayment = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {

  const {
    razorpayOrderId,
    razorpayPaymentId,
    razorpaySignature,
  } = req.body;

  const order = await PaymentService.verifyPayment(
    req.user!.userId,
    razorpayOrderId,
    razorpayPaymentId,
    razorpaySignature
  );

  res.status(200).json(
    new ApiResponse(true, "Payment verified successfully", { order })
  );
};