import crypto from "crypto";

import { env } from "../config/env";
import { razorpay } from "../config/razorpay";
import { AppError } from "../errors/AppError";
import { CartItem } from "../models/cart.model";
import { Inventory } from "../models/inventory.model";
import { ORDER_STATUS, PAYMENT_STATUS } from "../models/order.model";
import { Product } from "../models/product.model";
import { CreateOrderInput } from "../validators/checkout.validator";
import { OrderService } from "./order.service";

export class PaymentService {
  /**
   * Create Razorpay Order for an existing Draft Order
   */
  static async createPaymentOrder(
    userId: string,
    data: CreateOrderInput
  ) {
    const { amount } = await OrderService.calculateCheckoutAmount(userId, data);
    const amountInPaise = Math.round(amount * 100);

    try {
      if (!razorpay?.orders?.create) {
        throw new Error("Razorpay client is not initialized");
      }

      const razorpayOrder = await razorpay.orders.create({
        amount: amountInPaise,
        currency: "INR",
        receipt: `checkout-${userId}-${Date.now()}`.slice(0, 40),
        notes: {
          userId,
        },
      });

      return {
        razorpayOrderId: razorpayOrder.id,
        amount: amountInPaise,
        currency: "INR",
        key: env.RAZORPAY_KEY_ID,
      };
    } catch (error) {
      console.error("Razorpay Error:", error);
      if (error instanceof Error) {
        console.error(error.stack);
      }

      throw new AppError(
        error instanceof Error ? error.message : "Unable to initialize Razorpay payment",
        502
      );
    }
  }

  /**
   * Verify Razorpay Payment Signature
   */
  static async verifyPayment(
    userId: string,
    razorpayOrderId: string,
    razorpayPaymentId: string,
    razorpaySignature: string,
    checkout: CreateOrderInput
  ) {
    const generatedSignature = crypto
      .createHmac("sha256", env.RAZORPAY_KEY_SECRET)
      .update(`${razorpayOrderId}|${razorpayPaymentId}`)
      .digest("hex");

    if (generatedSignature !== razorpaySignature) {
      throw new AppError("Payment verification failed", 400);
    }

    const order = await OrderService.createOrder(userId, checkout);

    for (const item of order.orderItems) {
      const inventory = await Inventory.findOne({ productId: item.productId });

      if (!inventory) {
        continue;
      }

      const nextQuantity = Math.max(0, inventory.availableQuantity - item.quantity);
      inventory.availableQuantity = nextQuantity;
      inventory.soldQuantity += item.quantity;
      inventory.updatedBy = userId;
      await inventory.save();

      await Product.updateOne(
        { productId: item.productId },
        { $set: { quantity: nextQuantity, updatedBy: userId } }
      );
    }

    order.paymentStatus = PAYMENT_STATUS.PAID;
    order.status = ORDER_STATUS.CONFIRMED;
    order.paymentRequiredBeforeConfirmation = true;
    order.razorpayOrderId = razorpayOrderId;
    order.razorpayPaymentId = razorpayPaymentId;
    order.razorpaySignature = razorpaySignature;
    order.paidAt = new Date();

    await order.save();
    await CartItem.deleteMany({ userId });

    return order;
  }
}