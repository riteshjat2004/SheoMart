import { AppError } from "../errors/AppError";
import mongoose from "mongoose";
import { Address } from "../models/address.model";
import { CartItem } from "../models/cart.model";
import { Inventory } from "../models/inventory.model";
import { InventoryLedger } from "../models/inventoryLedger.model";
import { Order, ORDER_STATUS, PAYMENT_STATUS } from "../models/order.model";
import { Product } from "../models/product.model";
import { Store } from "../models/store.model";
import { StoreCustomer } from "../models/storeCustomer.model";
import { User } from "../models/user.model";
import { CreateOrderInput } from "../validators/checkout.validator";

const createInvoiceNumber = async (storeId: string, date: Date) => {
  const datePart = `${date.getFullYear()}${String(date.getMonth() + 1).padStart(2, "0")}${String(date.getDate()).padStart(2, "0")}`;
  const prefix = `INV-${datePart}-`;
  const count = await Order.countDocuments({ invoiceNumber: { $regex: `^${prefix}` } });
  return `${prefix}${String(count + 1).padStart(4, "0")}`;
};

export class OrderService {
  static async markPaymentReceived(
    ownerId: string,
    orderId: string,
    paymentMethod: "CASH" | "UPI" | "CARD"
  ) {
    const store = await Store.findOne({ ownerId }).select("storeId").lean();
    if (!store) {
      throw new AppError("Store not found for seller", 403);
    }

    const order = await Order.findOneAndUpdate(
      {
        orderId,
        storeId: store.storeId,
        pickupStatus: "PICKED_UP",
        paymentStatus: PAYMENT_STATUS.PENDING,
      },
      {
        $set: {
          paymentStatus: PAYMENT_STATUS.PAID,
          paymentMethod,
          paidAt: new Date(),
        },
      },
      { new: true, runValidators: false }
    );

    if (!order) {
      throw new AppError("Only picked up pending orders can be marked as paid", 409);
    }

    return order;
  }

  static async updateSellerOrderStatus(ownerId: string, orderId: string, nextStatus: string) {
    const transitions: Record<string, string[]> = {
      ORDER_PLACED: ["PREPARING", "CANCELLED"],
      PREPARING: ["READY_FOR_PICKUP", "CANCELLED"],
      READY_FOR_PICKUP: ["PICKED_UP", "CANCELLED"],
    };
    const store = await Store.findOne({ ownerId }).select("storeId").lean();
    if (!store) {
      throw new AppError("Store not found for seller", 403);
    }

    const statusMap: Record<string, string> = {
      ORDER_PLACED: "CONFIRMED",
      PREPARING: "PROCESSING",
      READY_FOR_PICKUP: "PACKED",
      PICKED_UP: "DELIVERED",
      CANCELLED: "CANCELLED",
    };
    const session = await mongoose.startSession();

    try {
      let updatedOrder;

      await session.withTransaction(async () => {
        const order = await Order.findOne({ orderId, storeId: store.storeId }).session(session);
        if (!order) {
          throw new AppError("Order not found", 404);
        }

        const currentStatus = order.pickupStatus || "ORDER_PLACED";
        if (!transitions[currentStatus]?.includes(nextStatus)) {
          throw new AppError(`Cannot change order from ${currentStatus} to ${nextStatus}`, 409);
        }

        if (currentStatus === "ORDER_PLACED" && nextStatus === "PREPARING") {
          for (const item of order.orderItems) {
            const inventory = await Inventory.findOneAndUpdate(
              {
                productId: item.productId,
                availableQuantity: { $gte: item.quantity },
              },
              {
                $inc: {
                  availableQuantity: -item.quantity,
                  soldQuantity: item.quantity,
                },
                $set: { updatedBy: ownerId },
              },
              { new: true, session }
            );

            if (!inventory) {
              throw new AppError(`Insufficient inventory for ${item.name}`, 409);
            }

            await InventoryLedger.create(
              [
                {
                  storeId: store.storeId,
                  productId: item.productId,
                  movementType: "SALE_ONLINE",
                  source: "ONLINE_ORDER",
                  referenceType: "ONLINE_ORDER",
                  referenceId: order.orderId,
                  quantityChange: -item.quantity,
                  previousQuantity: inventory.availableQuantity + item.quantity,
                  newQuantity: inventory.availableQuantity,
                  performedBy: ownerId,
                },
              ],
              { session }
            );

            await Product.findOneAndUpdate(
              { productId: item.productId, storeId: store.storeId },
              { $set: { quantity: inventory.availableQuantity, updatedBy: ownerId } },
              { session }
            );
          }
        }

        if (nextStatus === "CANCELLED" && currentStatus !== "ORDER_PLACED") {
          for (const item of order.orderItems) {
            const saleLedger = await InventoryLedger.findOne({
              storeId: store.storeId,
              productId: item.productId,
              movementType: "SALE_ONLINE",
              referenceType: "ONLINE_ORDER",
              referenceId: order.orderId,
            }).session(session);

            if (!saleLedger || saleLedger.quantityChange >= 0) {
              continue;
            }

            const quantityToRestore = Math.abs(saleLedger.quantityChange);
            const alreadyRestored = await InventoryLedger.exists({
              storeId: store.storeId,
              productId: item.productId,
              source: "ORDER_CANCELLED_RESTORE",
              referenceType: "ONLINE_ORDER",
              referenceId: order.orderId,
            }).session(session);

            if (alreadyRestored) {
              continue;
            }

            const inventory = await Inventory.findOneAndUpdate(
              {
                productId: item.productId,
                soldQuantity: { $gte: quantityToRestore },
              },
              {
                $inc: {
                  availableQuantity: quantityToRestore,
                  soldQuantity: -quantityToRestore,
                },
                $set: { updatedBy: ownerId },
              },
              { new: true, session }
            );

            if (!inventory) {
              throw new AppError(`Unable to restore inventory for ${item.name}`, 409);
            }

            await InventoryLedger.create(
              [
                {
                  storeId: store.storeId,
                  productId: item.productId,
                  movementType: "CANCEL_ORDER",
                  source: "ORDER_CANCELLED_RESTORE",
                  referenceType: "ONLINE_ORDER",
                  referenceId: order.orderId,
                  quantityChange: quantityToRestore,
                  previousQuantity: inventory.availableQuantity - quantityToRestore,
                  newQuantity: inventory.availableQuantity,
                  performedBy: ownerId,
                },
              ],
              { session }
            );

            await Product.findOneAndUpdate(
              { productId: item.productId, storeId: store.storeId },
              { $set: { quantity: inventory.availableQuantity, updatedBy: ownerId } },
              { session }
            );
          }
        }

        updatedOrder = await Order.findOneAndUpdate(
          { orderId, storeId: store.storeId, pickupStatus: currentStatus },
          {
            $set: {
              pickupStatus: nextStatus,
              status: statusMap[nextStatus],
              statusUpdatedAt: new Date(),
            },
          },
          { new: true, runValidators: false, strict: false, session }
        );

        if (!updatedOrder) {
          throw new AppError("Order status changed; please retry", 409);
        }

        if (nextStatus === "PICKED_UP") {
          await this.upsertStoreCustomer(updatedOrder, session);
        }
      });

      return updatedOrder;
    } finally {
      await session.endSession();
    }
  }

  private static async upsertStoreCustomer(
    order: {
      storeId: string;
      userId: string;
      grandTotal: number;
      createdAt: Date;
    },
    session: mongoose.ClientSession
  ) {
    if (!order.storeId) {
      return;
    }

    await StoreCustomer.findOneAndUpdate(
      { storeId: order.storeId, customerId: order.userId },
      {
        $setOnInsert: {
          storeId: order.storeId,
          customerId: order.userId,
          isPlusCustomer: false,
          joinedAt: order.createdAt,
        },
        $inc: {
          totalOnlinePurchases: order.grandTotal,
        },
        $set: {
          lastPurchaseAt: new Date(),
        },
      },
      { upsert: true, new: true, runValidators: true, session }
    );
  }

  static async createOrder(userId: string, data: CreateOrderInput) {
    const cartItems = await CartItem.find({ userId });
    if (!cartItems.length) {
      throw new AppError("Cart is empty", 400);
    }

    const address = await Address.findOne({ addressId: data.addressId, userId });
    if (!address) {
      throw new AppError("Delivery address not found", 404);
    }

    const existingDraft = await Order.findOne({
      userId,
      status: ORDER_STATUS.DRAFT,
    });

    const productIds = cartItems.map((item) => item.productId);
    const products = await Product.find({
      productId: { $in: productIds },
      isActive: true,
      isPublished: true,
    });

    const productMap = new Map(products.map((product) => [product.productId, product]));

    if (products.some((product) => product.storeId !== data.storeId)) {
      throw new AppError("One or more products do not belong to this store", 400);
    }

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
    const subtotal = originalTotal;
    const deliveryCharge = data.deliveryMethod === "pickup" ? 0 : 50;
    const platformFee = data.deliveryMethod === "pickup" ? 0 : 10;
    const grandTotal = subtotal - discount + deliveryCharge + platformFee;

    if (existingDraft) {
      existingDraft.addressId = address.addressId;

      existingDraft.shippingAddress = {
        fullName: address.fullName,
        mobile: address.mobile,
        house: address.house,
        street: address.street,
        landmark: address.landmark,
        city: address.city,
        state: address.state,
        pincode: address.pincode,
        addressType: address.addressType,
      };

      existingDraft.deliveryDate = data.deliveryDate;
      existingDraft.deliverySlot = data.deliverySlot;
      existingDraft.storeId = data.storeId;
      existingDraft.deliveryMethod = data.deliveryMethod;
      existingDraft.paymentMethod = data.paymentMethod;
      existingDraft.paymentStatus = PAYMENT_STATUS.PENDING;
      existingDraft.status = ORDER_STATUS.CONFIRMED;
      existingDraft.statusUpdatedAt = new Date();

      existingDraft.orderItems = orderItems;

      existingDraft.subtotal = subtotal;
      existingDraft.discount = discount;
      existingDraft.deliveryCharge = deliveryCharge;
      existingDraft.platformFee = platformFee;
      existingDraft.grandTotal = grandTotal;
      if (!existingDraft.invoiceNumber) {
        existingDraft.invoiceNumber = await createInvoiceNumber(existingDraft.storeId, new Date());
      }

      await existingDraft.save();
      await CartItem.deleteMany({ userId });

      return existingDraft;
    }

    const order = await Order.create({
      userId,
      invoiceNumber: await createInvoiceNumber(data.storeId, new Date()),
      storeId: data.storeId,
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
      deliveryMethod: data.deliveryMethod,
      paymentMethod: data.paymentMethod,
      paymentStatus: PAYMENT_STATUS.PENDING,
      pickupStatus: "ORDER_PLACED",
      subtotal,
      discount,
      deliveryCharge,
      platformFee,
      grandTotal,
      orderItems,
      status: ORDER_STATUS.CONFIRMED,
      statusUpdatedAt: new Date(),
    });

    await CartItem.deleteMany({ userId });

    return order;
  }

  static async getOrder(userId: string, orderId: string) {
    const ownedStore = await Store.findOne({ ownerId: userId }).select("storeId").lean();
    const order = await Order.findOne({
      orderId,
      $or: [{ userId }, ...(ownedStore ? [{ storeId: ownedStore.storeId }] : [])],
    }).lean();
    if (!order) {
      throw new AppError("Order not found", 404);
    }

    const [customer, store] = await Promise.all([
      User.findOne({ userId: order.userId }).select("userId name mobile email").lean(),
      Store.findOne({ storeId: order.storeId }).select("storeId storeName address city state pincode").lean(),
    ]);

    if (!order.invoiceNumber && order.status !== ORDER_STATUS.DRAFT) {
      const invoiceNumber = await createInvoiceNumber(order.storeId, new Date(order.createdAt));
      await Order.updateOne({ orderId: order.orderId, $or: [{ invoiceNumber: { $exists: false } }, { invoiceNumber: null }] }, { $set: { invoiceNumber } });
      order.invoiceNumber = invoiceNumber;
    }

    return {
      ...order,
      customerName: customer?.name,
      customerPhone: customer?.mobile,
      customerEmail: customer?.email,
      storeName: store?.storeName,
      pickupAddress: [store?.address, store?.city, store?.state, store?.pincode].filter(Boolean).join(", "),
      store: store ? { storeId: store.storeId, storeName: store.storeName, address: store.address } : null,
    };
  }

  static async getOrders(userId: string) {
    const orders = await Order.find({ userId, status: { $ne: ORDER_STATUS.DRAFT } }).sort({
      createdAt: -1,
    }).lean();
    const storeIds = [...new Set(orders.map((order) => order.storeId))];
    const stores = await Store.find({ storeId: { $in: storeIds } })
      .select("storeId storeName phone address city state pincode")
      .lean();
    const storeMap = new Map(stores.map((store) => [store.storeId, store]));

    return orders.map((order) => {
      const store = storeMap.get(order.storeId);
      const isPaid = order.paymentStatus === PAYMENT_STATUS.PAID;
      return {
        ...order,
        amountPaid: isPaid ? order.grandTotal : (order.amountPaid ?? 0),
        remainingAmount: isPaid ? 0 : (order.remainingAmount ?? order.grandTotal),
        storeName: store?.storeName,
        storePhone: store?.phone,
        pickupAddress: [store?.address, store?.city, store?.state, store?.pincode].filter(Boolean).join(", "),
        pickupHours: "10:00 AM - 8:00 PM",
        store: store ? { storeId: store.storeId, storeName: store.storeName, phone: store.phone, address: store.address } : null,
      };
    });
  }
}
