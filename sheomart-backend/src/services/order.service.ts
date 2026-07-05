import { AppError } from "../errors/AppError";
import { Address } from "../models/address.model";
import { CartItem } from "../models/cart.model";
import { Inventory } from "../models/inventory.model";
import { Order, ORDER_STATUS, PAYMENT_STATUS } from "../models/order.model";
import { Product } from "../models/product.model";
import { CreateOrderInput } from "../validators/checkout.validator";

export class OrderService {
  static async createOrder(userId: string, data: CreateOrderInput) {
    const cartItems = await CartItem.find({ userId });
    if (!cartItems.length) {
      throw new AppError("Cart is empty", 400);
    }

    const address = await Address.findOne({ addressId: data.addressId, userId });
    if (!address) {
      throw new AppError("Delivery address not found", 404);
    }

    const productIds = cartItems.map((item) => item.productId);
    const products = await Product.find({
      productId: { $in: productIds },
      isActive: true,
      isPublished: true,
    });

    const productMap = new Map(products.map((product) => [product.productId, product]));

    const orderItems = [] as Array<{
      orderItemId: string;
      productId: string;
      name: string;
      sku: string;
      quantity: number;
      price: number;
      discountPrice: number;
      totalPrice: number;
    }>;

    let originalTotal = 0;
    let discountedTotal = 0;

    for (const item of cartItems) {
      const product = productMap.get(item.productId);
      if (!product) {
        throw new AppError(`Product ${item.productId} is unavailable`, 400);
      }

      const inventory = await Inventory.findOne({ productId: item.productId });
      const availableQuantity = inventory?.availableQuantity ?? product.quantity;

      if (availableQuantity < item.quantity) {
        throw new AppError(`Insufficient stock for ${product.name}`, 400);
      }

      const price = product.price;
      const discountPrice = product.discountPrice ?? product.price;
      const totalPrice = discountPrice * item.quantity;

      originalTotal += price * item.quantity;
      discountedTotal += totalPrice;

      orderItems.push({
        orderItemId: item.cartItemId,
        productId: product.productId,
        name: product.name,
        sku: product.sku,
        quantity: item.quantity,
        price,
        discountPrice,
        totalPrice,
      });
    }

    const discount = Math.max(0, originalTotal - discountedTotal);
    const subtotal = discountedTotal;
    const deliveryCharge = 50;
    const platformFee = 10;
    const grandTotal = subtotal + deliveryCharge + platformFee;

    const order = await Order.create({
      userId,
      addressId: address.addressId,
      shippingAddress: {
        fullName: address.fullName,
        mobile: address.mobile,
        house: address.house,
        street: address.street,
        landmark: address.landmark,
        city: address.city,
        state: address.state,
        pincode: address.pincode,
        addressType: address.addressType,
      },
      deliveryDate: data.deliveryDate,
      deliverySlot: data.deliverySlot,
      paymentMethod: data.paymentMethod,
      paymentStatus: PAYMENT_STATUS.PENDING_PAYMENT,
      subtotal,
      discount,
      deliveryCharge,
      platformFee,
      grandTotal,
      orderItems,
      status: ORDER_STATUS.DRAFT,
    });

    await CartItem.deleteMany({ userId });

    return order;
  }

  static async getOrder(userId: string, orderId: string) {
    const order = await Order.findOne({ orderId, userId });
    if (!order) {
      throw new AppError("Order not found", 404);
    }
    return order;
  }
}
