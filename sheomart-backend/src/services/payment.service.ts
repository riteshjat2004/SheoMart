import crypto from "crypto";

import { env } from "../config/env";
import { razorpay } from "../config/razorpay";
import { AppError } from "../errors/AppError";
import { CartItem } from "../models/cart.model";
import { Inventory } from "../models/inventory.model";
import {
  Order,
  ORDER_STATUS,
  PAYMENT_STATUS,
} from "../models/order.model";
import { Product } from "../models/product.model";

export class PaymentService {
  /**
   * Create Razorpay Order for an existing Draft Order
   */
  static async createPaymentOrder(
    userId: string,
    orderId: string
  ) {
    const order = await Order.findOne({
      orderId,
      userId,
      status: ORDER_STATUS.DRAFT,
    });

    if (!order) {
      throw new AppError("Draft order not found", 404);
    }

    if (order.paymentStatus === PAYMENT_STATUS.PAID) {
      throw new AppError("Order already paid", 409);
    }

    if (order.razorpayOrderId) {
      return {
        orderId: order.orderId,
        razorpayOrderId: order.razorpayOrderId,
        amount: Math.round(Number(order.grandTotal || 0) * 100),
        currency: "INR",
        key: env.RAZORPAY_KEY_ID,
      };
    }

    const amountInPaise = Math.round(Number(order.grandTotal || 0) * 100);

    try {
      const razorpayOrder = await razorpay.orders.create({
        amount: amountInPaise,
        currency: "INR",
        receipt: order.orderId,
        notes: {
          orderId: order.orderId,
          userId,
        },
      });

      order.razorpayOrderId = razorpayOrder.id;
      await order.save();

      return {
        orderId: order.orderId,
        razorpayOrderId: razorpayOrder.id,
        amount: amountInPaise,
        currency: "INR",
        key: env.RAZORPAY_KEY_ID,
      };
    } catch (error) {
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
    razorpaySignature: string
  ) {
    const generatedSignature = crypto
      .createHmac("sha256", env.RAZORPAY_KEY_SECRET)
      .update(`${razorpayOrderId}|${razorpayPaymentId}`)
      .digest("hex");

    if (generatedSignature !== razorpaySignature) {
      throw new AppError("Payment verification failed", 400);
    }

    const order = await Order.findOne({
      userId,
      razorpayOrderId,
    });

    if (!order) {
      throw new AppError("Order not found", 404);
    }

    if (order.paymentStatus === PAYMENT_STATUS.PAID) {
      return order;
    }

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
    order.razorpayPaymentId = razorpayPaymentId;
    order.razorpaySignature = razorpaySignature;
    order.paidAt = new Date();

    await order.save();
    await CartItem.deleteMany({ userId });

    return order;
  }
}