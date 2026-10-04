import { AppError } from "../errors/AppError";
import mongoose from "mongoose";
import { Address } from "../models/address.model";
import { CartItem } from "../models/cart.model";
import { Inventory } from "../models/inventory.model";
import { InventoryLedger } from "../models/inventoryLedger.model";
import { Order, ORDER_STATUS, PAYMENT_STATUS, type IOrder } from "../models/order.model";
import { Product } from "../models/product.model";
import { Store } from "../models/store.model";
import { StoreCustomer } from "../models/storeCustomer.model";
import { User } from "../models/user.model";
import { PromotionService } from "./promotion.service";
import { CreateOrderInput } from "../validators/checkout.validator";
import { PlatformFeeService } from "./platformFee.service";
import { linkPendingPlusMember } from "./billing.service";

const createInvoiceNumber = async (storeId: string, date: Date) => {
  const datePart = `${date.getFullYear()}${String(date.getMonth() + 1).padStart(2, "0")}${String(date.getDate()).padStart(2, "0")}`;
  const prefix = `INV-${datePart}-`;
  const count = await Order.countDocuments({ invoiceNumber: { $regex: `^${prefix}` } });
  return `${prefix}${String(count + 1).padStart(4, "0")}`;
};

const distanceInKm = (from: { latitude?: number; longitude?: number }, to: { latitude?: number; longitude?: number }) => {
  if (from.latitude === undefined || from.longitude === undefined || to.latitude === undefined || to.longitude === undefined) return null;
  const radians = (value: number) => value * Math.PI / 180;
  const latitudeDelta = radians(to.latitude - from.latitude);
  const longitudeDelta = radians(to.longitude - from.longitude);
  const a = Math.sin(latitudeDelta / 2) ** 2 + Math.cos(radians(from.latitude)) * Math.cos(radians(to.latitude)) * Math.sin(longitudeDelta / 2) ** 2;
  return 6371 * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
};

export class OrderService {
  static async updateDeliveryEta(ownerId: string, orderId: string, estimatedDeliveryAt: Date) {
    const store = await Store.findOne({ ownerId }).select("storeId").lean();
    if (!store) throw new AppError("Store not found for seller", 403);
    const order = await Order.findOne({ orderId, storeId: store.storeId });
    if (!order) throw new AppError("Order not found", 404);
    if (order.fulfillmentType !== "delivery" && order.deliveryMethod !== "delivery") throw new AppError("ETA is only available for delivery orders", 400);
    if (estimatedDeliveryAt.getTime() <= Date.now()) throw new AppError("Delivery ETA must be in the future", 400);
    order.estimatedDeliveryAt = estimatedDeliveryAt;
    order.updatedBySellerAt = new Date();
    await order.save();
    return order;
  }

  static async deductOrderInventory(
    order: {
      orderId: string;
      storeId: string;
      orderItems: Array<{ productId: string; quantity: number; name?: string }>;
    },
    performedBy: string,
    session?: mongoose.ClientSession
  ) {
    const existingLedger = await InventoryLedger.findOne({
      storeId: order.storeId,
      movementType: "SALE_ONLINE",
      referenceType: "ONLINE_ORDER",
      referenceId: order.orderId,
    }).session(session ?? null);

    if (existingLedger) {
      return;
    }

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
          $set: { updatedBy: performedBy },
        },
        { new: true, session }
      );

      if (!inventory) {
        throw new AppError(`Insufficient stock for product ${item.name || item.productId}`, 409);
      }

      await InventoryLedger.create(
        [
          {
            storeId: order.storeId,
            productId: item.productId,
            movementType: "SALE_ONLINE",
            source: "ONLINE_ORDER",
            referenceType: "ONLINE_ORDER",
            referenceId: order.orderId,
            quantityChange: -item.quantity,
            previousQuantity: inventory.availableQuantity + item.quantity,
            newQuantity: inventory.availableQuantity,
            performedBy,
          },
        ],
        { session }
      );

      await Product.findOneAndUpdate(
        { productId: item.productId, storeId: order.storeId },
        { $set: { quantity: inventory.availableQuantity, updatedBy: performedBy } },
        { session }
      );
    }
  }

  static async restoreOrderInventory(
    order: {
      orderId: string;
      storeId: string;
      userId?: string;
      couponCode?: string;
      orderItems: Array<{ productId: string; quantity: number; name?: string }>;
    },
    performedBy: string,
    session?: mongoose.ClientSession
  ) {
    for (const item of order.orderItems) {
      const saleLedger = await InventoryLedger.findOne({
        storeId: order.storeId,
        productId: item.productId,
        movementType: "SALE_ONLINE",
        referenceType: "ONLINE_ORDER",
        referenceId: order.orderId,
      }).session(session ?? null);

      if (!saleLedger || saleLedger.quantityChange >= 0) {
        continue;
      }

      const quantityToRestore = Math.abs(saleLedger.quantityChange);
      const alreadyRestored = await InventoryLedger.exists({
        storeId: order.storeId,
        productId: item.productId,
        movementType: "CANCEL_ORDER",
        referenceType: "ONLINE_ORDER",
        referenceId: order.orderId,
      }).session(session ?? null);

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
          $set: { updatedBy: performedBy },
        },
        { new: true, session }
      );

      if (!inventory) {
        continue;
      }

      await InventoryLedger.create(
        [
          {
            storeId: order.storeId,
            productId: item.productId,
            movementType: "CANCEL_ORDER",
            source: "ORDER_CANCELLED_RESTORE",
            referenceType: "ONLINE_ORDER",
            referenceId: order.orderId,
            quantityChange: quantityToRestore,
            previousQuantity: inventory.availableQuantity - quantityToRestore,
            newQuantity: inventory.availableQuantity,
            performedBy,
          },
        ],
        { session }
      );

      await Product.findOneAndUpdate(
        { productId: item.productId, storeId: order.storeId },
        { $set: { quantity: inventory.availableQuantity, updatedBy: performedBy } },
        { session }
      );
    }

    if (order.couponCode && order.userId) {
      const coupon = await PromotionService.getCouponByCode(order.couponCode);
      if (coupon) {
        await PromotionService.restoreCouponUsage(coupon.couponId, order.userId, order.orderId);
      }
    }
  }

  static async calculateOrderSummary(
    userId: string,
    storeId: string,
    deliveryMethod: "pickup" | "delivery" = "delivery",
    couponCode?: string
  ) {
    const cartItems = await CartItem.find({ userId });
    if (!cartItems.length) {
      throw new AppError("Cart is empty", 400);
    }

    const store = await Store.findOne({ storeId }).lean();
    if (!store) {
      throw new AppError("Store not found", 404);
    }

    const productIds = cartItems.map((item) => item.productId);
    const products = await Product.find({
      productId: { $in: productIds },
      isActive: true,
      isPublished: true,
    });
    const productMap = new Map(products.map((p) => [p.productId, p]));

    let originalTotal = 0;
    let discountedTotal = 0;
    const itemsSummary = [];

    for (const item of cartItems) {
      const product = productMap.get(item.productId);
      if (!product) {
        throw new AppError(`Product ${item.productId} is unavailable`, 400);
      }
      const inventory = await Inventory.findOne({ productId: item.productId });
      const availableQty = inventory?.availableQuantity ?? product.quantity;
      if (availableQty < item.quantity) {
        throw new AppError(`Insufficient stock for ${product.name}`, 400);
      }

      const price = product.price;
      const discountPrice = product.discountPrice ?? product.price;
      const itemTotal = discountPrice * item.quantity;

      originalTotal += price * item.quantity;
      discountedTotal += itemTotal;

      itemsSummary.push({
        productId: product.productId,
        name: product.name,
        image: product.images?.[0] || "",
        unit: "",
        quantity: item.quantity,
        price,
        discountPrice,
        totalPrice: itemTotal,
      });
    }

    const { festivalSavings } = await PromotionService.calculateFestivalDiscounts(
      itemsSummary.map((item) => ({
        categoryId: productMap.get(item.productId)?.categoryId ?? "",
        quantity: item.quantity,
        price: item.discountPrice,
      }))
    );

    const couponValidation = couponCode
      ? await PromotionService.validateCoupon(couponCode, userId, discountedTotal, {
          storeId,
          categoryIds: [...new Set(products.map((p) => p.categoryId).filter(Boolean))],
          productIds,
        })
      : null;

    const festivalDiscount = Math.min(discountedTotal, festivalSavings);
    const couponDiscount = Math.min(
      Math.max(0, discountedTotal - festivalDiscount),
      couponValidation?.discount ?? 0
    );
    const productSavings = Math.max(0, originalTotal - discountedTotal);
    const freeDeliveryThreshold = store.freeDeliveryThreshold ?? store.freeDeliveryAbove;
    const freeDeliveryApplied =
      deliveryMethod === "delivery" &&
      freeDeliveryThreshold > 0 &&
      discountedTotal >= freeDeliveryThreshold;

    const deliveryFee =
      deliveryMethod === "pickup" ? 0 : freeDeliveryApplied ? 0 : store.deliveryFee;
    const platformFee = PlatformFeeService.calculate(
      await PlatformFeeService.getConfig(),
      discountedTotal
    );
    const finalAmount = Math.max(
      0,
      discountedTotal - festivalDiscount - couponDiscount + deliveryFee + platformFee
    );

    return {
      storeId,
      storeName: store.storeName,
      items: itemsSummary,
      itemCount: cartItems.reduce((acc, it) => acc + it.quantity, 0),
      originalTotal,
      subtotal: discountedTotal,
      productSavings,
      festivalDiscount,
      couponDiscount,
      couponCode: couponValidation?.code || (couponCode && couponDiscount > 0 ? couponCode : ""),
      deliveryMethod,
      deliveryFee,
      freeDeliveryApplied,
      freeDeliveryThreshold,
      platformFee,
      finalAmount,
    };
  }

  static async calculateCheckoutAmount(userId: string, data: CreateOrderInput) {
    const cartItems = await CartItem.find({ userId });
    if (!cartItems.length) throw new AppError("Cart is empty", 400);
    const store = await Store.findOne({ storeId: data.storeId }).lean();
    if (!store) throw new AppError("Store not found", 404);
    const fulfillmentType = data.fulfillmentType ?? data.deliveryMethod;
    if (fulfillmentType === "pickup" && store.supportsPickup !== true) throw new AppError("Pickup is not available for this store", 400);
    if (fulfillmentType === "delivery" && store.supportsDelivery !== true) throw new AppError("Delivery is not available for this store", 400);

    const address = fulfillmentType === "delivery" && data.addressId ? await Address.findOne({ addressId: data.addressId, userId }) : null;
    if (fulfillmentType === "delivery" && !address) throw new AppError("Delivery address not found", 404);

    await linkPendingPlusMember(data.storeId, userId);
    const plusCustomer = await StoreCustomer.findOne({ storeId: data.storeId, customerId: userId }).select("isPlusCustomer").lean();
    if (!plusCustomer?.isPlusCustomer && data.paymentMethod !== "ONLINE") throw new AppError("Online payment is required for non-Plus customers", 403);
    if (data.paymentMethod === "PAY_AT_PICKUP" && fulfillmentType !== "pickup") throw new AppError("Pay During Pickup requires pickup fulfillment", 400);
    if (data.paymentMethod === "PAY_AT_DELIVERY" && fulfillmentType !== "delivery") throw new AppError("Pay During Delivery requires delivery fulfillment", 400);
    if (fulfillmentType === "delivery" && address && store.pincode && address.pincode) {
      if (store.pincode.trim().toLowerCase() !== address.pincode.trim().toLowerCase()) {
        throw new AppError(`Delivery is not available to PIN code ${address.pincode}. This store only delivers to PIN code ${store.pincode}.`, 400);
      }
    }
    const distance = fulfillmentType === "delivery" && address ? distanceInKm(store, address) : null;
    if (distance !== null && store.deliveryRadiusKm > 0 && distance > store.deliveryRadiusKm) throw new AppError("Delivery unavailable for this address", 400);
    const selectedSlot = fulfillmentType === "delivery" ? (store.deliverySlots ?? []).find((slot) => (slot.slotId === data.deliverySlotId || slot.id === data.deliverySlotId) && (slot.isActive || slot.active)) : undefined;
    if (fulfillmentType === "delivery" && !selectedSlot) throw new AppError("Select an active delivery slot", 400);
    if (selectedSlot && data.deliveryDate === new Date().toISOString().slice(0, 10)) {
      const nowMinutes = new Date().getHours() * 60 + new Date().getMinutes();
      const endMinutes = Number(selectedSlot.endTime.slice(0, 2)) * 60 + Number(selectedSlot.endTime.slice(3));
      if (endMinutes <= nowMinutes) throw new AppError("Selected delivery slot has expired", 400);
    }
    if (selectedSlot?.capacity) {
      const usedCapacity = await Order.countDocuments({ storeId: data.storeId, deliverySlotId: selectedSlot.slotId, deliveryDate: data.deliveryDate, status: { $nin: [ORDER_STATUS.CANCELLED, ORDER_STATUS.FAILED] } });
      if (usedCapacity >= selectedSlot.capacity) throw new AppError("Selected delivery slot is full", 400);
    }
    const products = await Product.find({ productId: { $in: cartItems.map((item) => item.productId) }, isActive: true, isPublished: true });
    const productMap = new Map(products.map((product) => [product.productId, product]));
    let originalTotal = 0;
    let discountedTotal = 0;
    const orderItems = [] as Array<{ productId: string; quantity: number; discountPrice: number }>;
    for (const item of cartItems) {
      const product = productMap.get(item.productId);
      if (!product) throw new AppError(`Product ${item.productId} is unavailable`, 400);
      const inventory = await Inventory.findOne({ productId: item.productId });
      if ((inventory?.availableQuantity ?? product.quantity) < item.quantity) throw new AppError(`Insufficient stock for ${product.name}`, 400);
      const discountPrice = product.discountPrice ?? product.price;
      originalTotal += product.price * item.quantity;
      discountedTotal += discountPrice * item.quantity;
      orderItems.push({ productId: product.productId, quantity: item.quantity, discountPrice });
    }
    const { festivalSavings } = await PromotionService.calculateFestivalDiscounts(orderItems.map((item) => ({ categoryId: productMap.get(item.productId)?.categoryId ?? "", quantity: item.quantity, price: item.discountPrice })));
    const couponValidation = data.couponCode
      ? await PromotionService.validateCoupon(data.couponCode, userId, discountedTotal, {
          storeId: data.storeId,
          categoryIds: [...new Set(products.map((p) => p.categoryId).filter(Boolean))],
          productIds: cartItems.map((item) => item.productId),
        })
      : null;
    const festivalDiscount = Math.min(discountedTotal, festivalSavings);
    const couponDiscount = Math.min(Math.max(0, discountedTotal - festivalDiscount), couponValidation?.discount ?? 0);
    const discount = Math.max(0, originalTotal - discountedTotal);
    const freeDeliveryThreshold = store.freeDeliveryThreshold ?? store.freeDeliveryAbove;
    const freeDeliveryApplied = fulfillmentType === "delivery" && freeDeliveryThreshold > 0 && discountedTotal >= freeDeliveryThreshold;
    const deliveryCharge = fulfillmentType === "pickup" ? 0 : freeDeliveryApplied ? 0 : store.deliveryFee;
    const platformFee = PlatformFeeService.calculate(await PlatformFeeService.getConfig(), discountedTotal);
    return { amount: Math.max(0, discountedTotal - festivalDiscount - couponDiscount + deliveryCharge + platformFee) };
  }

  static async markPaymentReceived(
    ownerId: string,
    orderId: string,
    paymentMethod: "CASH" | "UPI" | "CARD"
  ) {
    const store = await Store.findOne({ ownerId }).select("storeId").lean();
    if (!store) {
      throw new AppError("Store not found for seller", 403);
    }

    const order = await Order.findOne({
      orderId,
      storeId: store.storeId,
    });

    if (!order) {
      throw new AppError("Order not found", 404);
    }

    const isCompletedOrReadyStatus =
      order.status === ORDER_STATUS.DELIVERED ||
      order.pickupStatus === "PICKED_UP" ||
      order.pickupStatus === "DELIVERED" ||
      order.pickupStatus === "READY_FOR_PICKUP" ||
      order.status === ORDER_STATUS.PACKED ||
      order.status === ORDER_STATUS.CONFIRMED;
    const isPendingPayment =
      order.paymentStatus === PAYMENT_STATUS.PENDING ||
      order.paymentStatus === PAYMENT_STATUS.UNPAID;
    const isVerifiedOnlinePayment = Boolean(order.razorpayPaymentId || order.razorpayOrderId);

    if (!isCompletedOrReadyStatus) {
      throw new AppError(
        "Only orders ready for pickup or delivered with pending payment can be marked as paid",
        409
      );
    }

    if (!isPendingPayment) {
      throw new AppError("This order is not eligible for manual payment collection", 409);
    }

    if (order.paymentStatus === PAYMENT_STATUS.PAID || Number(order.amountPaid ?? 0) > 0) {
      throw new AppError("This order is already marked as paid", 409);
    }

    if (isVerifiedOnlinePayment) {
      throw new AppError("Verified online payments cannot be manually overridden", 409);
    }

    const now = new Date();
    order.paymentStatus = PAYMENT_STATUS.PAID;
    order.paymentMethod = paymentMethod;
    order.paymentReceivedMethod = paymentMethod;
    order.amountPaid = order.grandTotal;
    order.remainingAmount = 0;
    order.paidAt = now;
    order.statusUpdatedAt = now;

    // If order was ready for pickup or being handed over, advance to picked up/delivered
    if (order.pickupStatus !== "PICKED_UP" && order.pickupStatus !== "DELIVERED") {
      order.pickupStatus = "PICKED_UP";
      order.status = ORDER_STATUS.DELIVERED;
      order.pickedUpAt = now;
      order.deliveredAt = now;
    }

    await order.save();
    await this.upsertStoreCustomer(order);

    return order;
  }

  static async updateSellerOrderStatus(ownerId: string, orderId: string, nextStatus: string) {
    const store = await Store.findOne({ ownerId }).select("storeId").lean();
    if (!store) {
      throw new AppError("Store not found for seller", 403);
    }

    const statusMap: Record<string, string> = {
      ORDER_PLACED: "CONFIRMED",
      ACCEPTED: "CONFIRMED",
      PREPARING: "PROCESSING",
      READY_FOR_PICKUP: "PACKED",
      READY_FOR_DISPATCH: "PACKED",
      OUT_FOR_DELIVERY: "OUT_FOR_DELIVERY",
      DELIVERED: "DELIVERED",
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
        const isDelivery = order.fulfillmentType === "delivery" || order.deliveryMethod === "delivery";
        const transitions: Record<string, string[]> = isDelivery
          ? {
              ORDER_PLACED: ["ACCEPTED", "PREPARING", "READY_FOR_DISPATCH", "CANCELLED"],
              ACCEPTED: ["PREPARING", "READY_FOR_DISPATCH", "CANCELLED"],
              PREPARING: ["READY_FOR_DISPATCH", "CANCELLED"],
              READY_FOR_DISPATCH: ["OUT_FOR_DELIVERY", "CANCELLED"],
              OUT_FOR_DELIVERY: ["DELIVERED"],
            }
          : {
              ORDER_PLACED: ["ACCEPTED", "PREPARING", "READY_FOR_PICKUP", "PICKED_UP", "DELIVERED", "CANCELLED"],
              ACCEPTED: ["PREPARING", "READY_FOR_PICKUP", "PICKED_UP", "DELIVERED", "CANCELLED"],
              PREPARING: ["READY_FOR_PICKUP", "PICKED_UP", "DELIVERED", "CANCELLED"],
              READY_FOR_PICKUP: ["PICKED_UP", "DELIVERED", "CANCELLED"],
            };

        const normalizedNextStatus = (!isDelivery && nextStatus === "DELIVERED") ? "PICKED_UP" : nextStatus;

        if (!transitions[currentStatus]?.includes(nextStatus) && !transitions[currentStatus]?.includes(normalizedNextStatus)) {
          throw new AppError(`Cannot change order from ${currentStatus} to ${nextStatus}`, 409);
        }

        if (
          (normalizedNextStatus === "PREPARING" ||
            normalizedNextStatus === "READY_FOR_PICKUP" ||
            normalizedNextStatus === "READY_FOR_DISPATCH" ||
            normalizedNextStatus === "PICKED_UP" ||
            normalizedNextStatus === "DELIVERED") &&
          !order.preparingAt
        ) {
          await this.deductOrderInventory(order, ownerId, session);
        }

        if (normalizedNextStatus === "CANCELLED") {
          await this.restoreOrderInventory(order, ownerId, session);
        }

        const timestampField: Record<string, string> = {
          ACCEPTED: "acceptedAt",
          PREPARING: "preparingAt",
          READY_FOR_DISPATCH: "readyForDispatchAt",
          READY_FOR_PICKUP: "readyForPickupAt",
          OUT_FOR_DELIVERY: "outForDeliveryAt",
          DELIVERED: "deliveredAt",
          PICKED_UP: "pickedUpAt",
          CANCELLED: "cancelledAt",
        };
        const now = new Date();
        const timestampUpdate = timestampField[normalizedNextStatus] ? { [timestampField[normalizedNextStatus]]: now } : {};
        updatedOrder = await Order.findOneAndUpdate(
          {
            orderId,
            storeId: store.storeId,
            $or: [
              { pickupStatus: currentStatus },
              { pickupStatus: currentStatus === "ORDER_PLACED" ? null : currentStatus },
              { pickupStatus: { $exists: false } },
            ],
          },
          {
            $set: {
              pickupStatus: normalizedNextStatus,
              status: statusMap[normalizedNextStatus] || "DELIVERED",
              statusUpdatedAt: now,
              updatedBySellerAt: now,
              ...timestampUpdate,
              ...(normalizedNextStatus === "DELIVERED" || normalizedNextStatus === "PICKED_UP"
                ? { deliveredAt: now, pickedUpAt: now }
                : {}),
            },
          },
          { new: true, runValidators: false, strict: false, session }
        );

        if (!updatedOrder) {
          throw new AppError("Order status changed; please retry", 409);
        }

        if (nextStatus === "PICKED_UP" || nextStatus === "DELIVERED") {
          await this.upsertStoreCustomer(updatedOrder, session);
        }
      });

      return updatedOrder;
    } finally {
      await session.endSession();
    }
  }

  static async cancelCustomerOrder(userId: string, orderId: string, reason?: string) {
    const session = await mongoose.startSession();

    try {
      let cancelledOrder: IOrder | null = null;

      await session.withTransaction(async () => {
        const order = await Order.findOne({ orderId, userId }).session(session);
        if (!order) {
          throw new AppError("Order not found", 404);
        }

        const currentStatus = order.pickupStatus || order.status;
        const cancellableStatuses = ["ORDER_PLACED", "CONFIRMED"];
        if (!cancellableStatuses.includes(currentStatus)) {
          throw new AppError("Orders can only be cancelled before they are accepted by the store", 400);
        }

        const now = new Date();
        const statusFilter = order.pickupStatus
          ? { pickupStatus: currentStatus }
          : { pickupStatus: { $in: [null, ""] }, status: currentStatus };
        cancelledOrder = await Order.findOneAndUpdate(
          { orderId, userId, ...statusFilter },
          {
            $set: {
              pickupStatus: "CANCELLED",
              status: ORDER_STATUS.CANCELLED,
              statusUpdatedAt: now,
              cancelledAt: now,
              ...(reason ? { orderNotes: reason } : {}),
            },
          },
          { new: true, runValidators: false, session }
        );

        if (!cancelledOrder) {
          throw new AppError("Order status changed; please refresh and try again", 409);
        }

        await this.restoreOrderInventory(cancelledOrder, userId, session);
      });

      if (!cancelledOrder) {
        throw new AppError("Order cancellation could not be completed", 500);
      }

      return cancelledOrder;
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
    session?: mongoose.ClientSession
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
      { upsert: true, new: true, runValidators: true, ...(session ? { session } : {}) }
    );
  }

  static async createOrder(userId: string, data: CreateOrderInput) {
    const cartItems = await CartItem.find({ userId });
    if (!cartItems.length) {
      throw new AppError("Cart is empty", 400);
    }

    const store = await Store.findOne({ storeId: data.storeId }).lean();
    if (!store) {
      throw new AppError("Store not found", 404);
    }

    const fulfillmentType = data.fulfillmentType ?? data.deliveryMethod;
    if (fulfillmentType === "pickup" && store.supportsPickup !== true) {
      throw new AppError("Pickup is not available for this store", 400);
    }
    if (fulfillmentType === "delivery" && store.supportsDelivery !== true) {
      throw new AppError("Delivery is not available for this store", 400);
    }

    const address = fulfillmentType === "delivery" && data.addressId
      ? await Address.findOne({ addressId: data.addressId, userId })
      : null;
    if (fulfillmentType === "delivery" && !address) {
      throw new AppError("Delivery address not found", 404);
    }

    await linkPendingPlusMember(data.storeId, userId);
    const plusCustomer = await StoreCustomer.findOne({ storeId: data.storeId, customerId: userId }).select("isPlusCustomer").lean();
    const isPlusCustomer = plusCustomer?.isPlusCustomer === true;
    if (!isPlusCustomer && data.paymentMethod !== "ONLINE") {
      throw new AppError("Online payment is required for non-Plus customers", 403);
    }
    if (data.paymentMethod === "PAY_AT_PICKUP" && fulfillmentType !== "pickup") {
      throw new AppError("Pay During Pickup requires pickup fulfillment", 400);
    }
    if (data.paymentMethod === "PAY_AT_DELIVERY" && fulfillmentType !== "delivery") {
      throw new AppError("Pay During Delivery requires delivery fulfillment", 400);
    }
    const paymentRequiredBeforeConfirmation = data.paymentMethod === "ONLINE";
    const nextPaymentStatus = paymentRequiredBeforeConfirmation ? PAYMENT_STATUS.PENDING : PAYMENT_STATUS.UNPAID;
    const nextOrderStatus = paymentRequiredBeforeConfirmation ? ORDER_STATUS.PENDING_PAYMENT : ORDER_STATUS.CONFIRMED;
    if (fulfillmentType === "delivery" && address && store.pincode && address.pincode) {
      if (store.pincode.trim().toLowerCase() !== address.pincode.trim().toLowerCase()) {
        throw new AppError(`Delivery is not available to PIN code ${address.pincode}. This store only delivers to PIN code ${store.pincode}.`, 400);
      }
    }
    const distance = fulfillmentType === "delivery" && address ? distanceInKm(store, address) : null;
    if (distance !== null && store.deliveryRadiusKm > 0 && distance > store.deliveryRadiusKm) {
      throw new AppError("Delivery unavailable for this address", 400);
    }
    const selectedSlot = fulfillmentType === "delivery" ? (store.deliverySlots ?? []).find((slot: { slotId?: string; id?: string; isActive?: boolean; active?: boolean }) => (slot.slotId === data.deliverySlotId || slot.id === data.deliverySlotId) && (slot.isActive || slot.active)) : undefined;
    if (fulfillmentType === "delivery" && !selectedSlot) throw new AppError("Select an active delivery slot", 400);
    if (selectedSlot && data.deliveryDate === new Date().toISOString().slice(0, 10)) {
      const nowMinutes = new Date().getHours() * 60 + new Date().getMinutes();
      const endMinutes = Number(selectedSlot.endTime.slice(0, 2)) * 60 + Number(selectedSlot.endTime.slice(3));
      if (endMinutes <= nowMinutes) throw new AppError("Selected delivery slot has expired", 400);
    }
    if (selectedSlot?.capacity) {
      const usedCapacity = await Order.countDocuments({ storeId: data.storeId, deliverySlotId: selectedSlot.slotId, deliveryDate: data.deliveryDate, status: { $nin: [ORDER_STATUS.CANCELLED, ORDER_STATUS.FAILED] } });
      if (usedCapacity >= selectedSlot.capacity) throw new AppError("Selected delivery slot is full", 400);
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

    const { festivalSavings } = await PromotionService.calculateFestivalDiscounts(
      orderItems.map((item) => ({
        categoryId: productMap.get(item.productId)?.categoryId ?? "",
        quantity: item.quantity,
        price: item.discountPrice,
      })),
    );
    const couponValidation = data.couponCode
      ? await PromotionService.validateCoupon(data.couponCode, userId, discountedTotal, {
          storeId: data.storeId,
          categoryIds: [...new Set(products.map((p) => p.categoryId).filter(Boolean))],
          productIds,
        })
      : null;
    const festivalDiscount = Math.min(discountedTotal, festivalSavings);
    const couponDiscount = Math.min(Math.max(0, discountedTotal - festivalDiscount), couponValidation?.discount ?? 0);
    const discount = Math.max(0, originalTotal - discountedTotal);
    const subtotal = discountedTotal;
    const freeDeliveryThreshold = store.freeDeliveryThreshold ?? store.freeDeliveryAbove;
    const freeDeliveryApplied = fulfillmentType === "delivery" && freeDeliveryThreshold > 0 && discountedTotal >= freeDeliveryThreshold;
    const deliveryCharge = fulfillmentType === "pickup"
      ? 0
      : freeDeliveryApplied ? 0 : store.deliveryFee;
    const platformFee = PlatformFeeService.calculate(await PlatformFeeService.getConfig(), discountedTotal);
    const grandTotal = Math.max(0, discountedTotal - festivalDiscount - couponDiscount + deliveryCharge + platformFee);
    const estimatedReadyTime = new Date(Date.now() + (store.preparationTimeMinutes ?? 30) * 60 * 1000);
    const estimatedDeliveryTime = fulfillmentType === "delivery"
      ? new Date(estimatedReadyTime.getTime() + 60 * 60 * 1000)
      : undefined;

    const shippingAddress = address
      ? {
          fullName: address.fullName,
          mobile: address.mobile,
          house: address.house,
          street: address.street,
          landmark: address.landmark,
          city: address.city,
          state: address.state,
          pincode: address.pincode,
          addressType: address.addressType,
        }
      : undefined;

    if (existingDraft) {
      existingDraft.addressId = address?.addressId || "";
      existingDraft.shippingAddress = shippingAddress;

      existingDraft.deliveryDate = data.deliveryDate;
      existingDraft.deliverySlot = data.deliverySlot;
      existingDraft.storeId = data.storeId;
      existingDraft.deliveryMethod = data.deliveryMethod;
      existingDraft.fulfillmentType = fulfillmentType;
      existingDraft.deliveryFee = deliveryCharge;
      existingDraft.estimatedReadyTime = estimatedReadyTime;
      existingDraft.estimatedDeliveryTime = estimatedDeliveryTime;
      existingDraft.selectedAddressId = data.selectedAddressId ?? address?.addressId;
      existingDraft.deliverySlotId = data.deliverySlotId;
      existingDraft.deliverySlotLabel = selectedSlot?.label ?? data.deliverySlotLabel;
      existingDraft.deliveryWindowStart = selectedSlot?.startTime ?? data.deliveryWindowStart;
      existingDraft.deliveryWindowEnd = selectedSlot?.endTime ?? data.deliveryWindowEnd;
      existingDraft.freeDeliveryApplied = freeDeliveryApplied;
      existingDraft.pickupSlot = data.pickupSlot;
      existingDraft.estimatedDeliveryWindow = data.estimatedDeliveryWindow;
      existingDraft.paymentMethod = data.paymentMethod;
      existingDraft.paymentRequiredBeforeConfirmation = paymentRequiredBeforeConfirmation;
      existingDraft.paymentStatus = nextPaymentStatus;
      existingDraft.status = nextOrderStatus;
      existingDraft.statusUpdatedAt = new Date();

      existingDraft.orderItems = orderItems;

      existingDraft.subtotal = subtotal;
      existingDraft.discount = discount;
      existingDraft.festivalDiscount = festivalDiscount;
      existingDraft.couponDiscount = couponDiscount;
      existingDraft.couponCode = couponValidation?.code ?? "";
      existingDraft.deliveryCharge = deliveryCharge;
      existingDraft.platformFee = platformFee;
      existingDraft.platformFeeCharged = platformFee;
      existingDraft.deliveryFeeCharged = deliveryCharge;
      existingDraft.couponDiscountApplied = couponDiscount;
      existingDraft.festivalDiscountApplied = festivalDiscount;
      existingDraft.productSavingsShown = discount;
      existingDraft.grandTotal = grandTotal;
      if (!existingDraft.invoiceNumber) {
        existingDraft.invoiceNumber = await createInvoiceNumber(existingDraft.storeId, new Date());
      }

      await existingDraft.save();
      if (couponValidation) await PromotionService.recordCouponUsage(couponValidation.couponId, userId, existingDraft.orderId);
      if (!paymentRequiredBeforeConfirmation) {
        await this.deductOrderInventory(existingDraft, userId);
      }
      await CartItem.deleteMany({ userId });

      return existingDraft;
    }

    const order = await Order.create({
      userId,
      invoiceNumber: await createInvoiceNumber(data.storeId, new Date()),
      storeId: data.storeId,
      addressId: address?.addressId || "",
      shippingAddress,
      deliveryDate: data.deliveryDate,
      deliverySlot: data.deliverySlot,
      deliveryMethod: data.deliveryMethod,
      fulfillmentType,
      deliveryFee: deliveryCharge,
      estimatedReadyTime,
      estimatedDeliveryTime,
      selectedAddressId: data.selectedAddressId ?? address?.addressId,
      deliverySlotId: data.deliverySlotId,
      deliverySlotLabel: selectedSlot?.label ?? data.deliverySlotLabel,
      deliveryWindowStart: selectedSlot?.startTime ?? data.deliveryWindowStart,
      deliveryWindowEnd: selectedSlot?.endTime ?? data.deliveryWindowEnd,
      freeDeliveryApplied,
      pickupSlot: data.pickupSlot,
      estimatedDeliveryWindow: data.estimatedDeliveryWindow,
      paymentMethod: data.paymentMethod,
      paymentRequiredBeforeConfirmation,
      paymentStatus: nextPaymentStatus,
      pickupStatus: "ORDER_PLACED",
      subtotal,
      discount,
      festivalDiscount,
      couponDiscount,
      couponCode: couponValidation?.code ?? "",
      deliveryCharge,
      platformFee,
      platformFeeCharged: platformFee,
      deliveryFeeCharged: deliveryCharge,
      couponDiscountApplied: couponDiscount,
      festivalDiscountApplied: festivalDiscount,
      productSavingsShown: discount,
      grandTotal,
      orderItems,
      status: nextOrderStatus,
      statusUpdatedAt: new Date(),
    });

    if (couponValidation) await PromotionService.recordCouponUsage(couponValidation.couponId, userId, order.orderId);
    if (!paymentRequiredBeforeConfirmation) {
      await this.deductOrderInventory(order, userId);
    }
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
      Store.findOne({ storeId: order.storeId }).select("storeId storeName address city state pincode preparationTimeMinutes").lean(),
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
      preparationTimeMinutes: store?.preparationTimeMinutes,
      store: store ? { storeId: store.storeId, storeName: store.storeName, address: store.address, preparationTimeMinutes: store.preparationTimeMinutes } : null,
    };
  }

  static async getOrders(userId: string) {
    const orders = await Order.find({ userId, status: { $ne: ORDER_STATUS.DRAFT } }).sort({
      createdAt: -1,
    }).lean();
    const storeIds = [...new Set(orders.map((order) => order.storeId))];
    const stores = await Store.find({ storeId: { $in: storeIds } })
      .select("storeId storeName phone address city state pincode preparationTimeMinutes")
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
        preparationTimeMinutes: store?.preparationTimeMinutes,
        store: store ? { storeId: store.storeId, storeName: store.storeName, phone: store.phone, address: store.address, preparationTimeMinutes: store.preparationTimeMinutes } : null,
      };
    });
  }

  static async getStoreOrders(
    ownerId: string,
    filters: {
      page?: number | string;
      limit?: number | string;
      search?: string;
      orderStatus?: string;
      paymentStatus?: string;
      fulfillmentType?: string;
      from?: string;
      to?: string;
      sortBy?: string;
    }
  ) {
    const store = await Store.findOne({ ownerId }).select("storeId storeName").lean();
    if (!store) {
      throw new AppError("Store not found for seller", 403);
    }

    const page = Math.max(1, Number(filters.page) || 1);
    const limit = Math.max(1, Math.min(100, Number(filters.limit) || 10));

    const andConditions: Array<Record<string, unknown>> = [
      { storeId: store.storeId },
      { status: { $ne: ORDER_STATUS.DRAFT } },
    ];

    if (filters.orderStatus) {
      andConditions.push({
        $or: [
          { pickupStatus: filters.orderStatus },
          { status: filters.orderStatus },
        ],
      });
    }

    if (filters.paymentStatus) {
      andConditions.push({ paymentStatus: filters.paymentStatus });
    }

    if (filters.fulfillmentType) {
      if (filters.fulfillmentType === "pickup") {
        andConditions.push({
          $or: [
            { fulfillmentType: "pickup" },
            { deliveryMethod: "pickup" },
            { deliveryMethod: "store_pickup" },
            { pickupSlot: { $exists: true, $ne: null } },
            { pickupStatus: { $exists: true, $ne: null } },
          ],
        });
      } else if (filters.fulfillmentType === "delivery") {
        andConditions.push({
          $or: [
            { fulfillmentType: "delivery" },
            { deliveryMethod: "delivery" },
          ],
        });
      } else {
        andConditions.push({ fulfillmentType: filters.fulfillmentType });
      }
    }

    if (filters.from || filters.to) {
      const dateQuery: Record<string, Date> = {};
      if (filters.from) {
        const fromDate = new Date(filters.from);
        fromDate.setHours(0, 0, 0, 0);
        dateQuery.$gte = fromDate;
      }
      if (filters.to) {
        const toDate = new Date(filters.to);
        toDate.setHours(23, 59, 59, 999);
        dateQuery.$lte = toDate;
      }
      andConditions.push({ createdAt: dateQuery });
    }

    if (filters.search && typeof filters.search === "string" && filters.search.trim()) {
      const searchRegex = new RegExp(filters.search.trim().replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i");
      const matchedUsers = await User.find({
        $or: [{ name: searchRegex }, { mobile: searchRegex }, { email: searchRegex }],
      }).select("userId").lean();
      const userIds = matchedUsers.map((u) => u.userId);

      andConditions.push({
        $or: [
          { orderId: searchRegex },
          { invoiceNumber: searchRegex },
          { userId: { $in: userIds } },
          { "orderItems.name": searchRegex },
          { "orderItems.sku": searchRegex },
          { "shippingAddress.fullName": searchRegex },
          { "shippingAddress.mobile": searchRegex },
        ],
      });
    }

    const baseQuery = { $and: andConditions };

    let sort: Record<string, 1 | -1> = { createdAt: -1 };
    if (filters.sortBy === "oldest") sort = { createdAt: 1 };
    else if (filters.sortBy === "amount_desc") sort = { grandTotal: -1 };
    else if (filters.sortBy === "amount_asc") sort = { grandTotal: 1 };

    const skip = (page - 1) * limit;

    const [orders, total, allStoreOrders] = await Promise.all([
      Order.find(baseQuery).sort(sort).skip(skip).limit(limit).lean(),
      Order.countDocuments(baseQuery),
      Order.find({ storeId: store.storeId, status: { $ne: ORDER_STATUS.DRAFT } })
        .select("grandTotal pickupStatus status createdAt")
        .lean(),
    ]);

    const todayStr = new Date().toISOString().slice(0, 10);
    let todayRevenue = 0;
    let pendingCount = 0;
    let acceptedCount = 0;
    let preparingCount = 0;
    let readyCount = 0;
    let outForDeliveryCount = 0;
    let deliveredCount = 0;
    let cancelledCount = 0;

    for (const o of allStoreOrders) {
      const st = o.pickupStatus || o.status;
      if (st === "ORDER_PLACED" || st === "CONFIRMED") pendingCount++;
      else if (st === "ACCEPTED") acceptedCount++;
      else if (st === "PREPARING" || st === "PROCESSING") preparingCount++;
      else if (st === "READY_FOR_PICKUP" || st === "READY_FOR_DISPATCH" || st === "PACKED") readyCount++;
      else if (st === "OUT_FOR_DELIVERY") outForDeliveryCount++;
      else if (st === "DELIVERED" || st === "PICKED_UP") {
        deliveredCount++;
        if (o.createdAt && new Date(o.createdAt).toISOString().slice(0, 10) === todayStr) {
          todayRevenue += o.grandTotal || 0;
        }
      } else if (st === "CANCELLED") {
        cancelledCount++;
      }
    }

    const customerIds = [...new Set(orders.map((o) => o.userId))];
    const customers = await User.find({ userId: { $in: customerIds } })
      .select("userId name mobile email")
      .lean();
    const customerMap = new Map(customers.map((c) => [c.userId, c]));

    const enrichedOrders = orders.map((order) => {
      const customer = customerMap.get(order.userId);
      return {
        ...order,
        orderStatus: order.pickupStatus || order.status,
        customerName: customer?.name,
        customerMobile: customer?.mobile,
        customerEmail: customer?.email,
        customer: customer ? { name: customer.name, mobile: customer.mobile, email: customer.email } : null,
        storeName: store.storeName,
      };
    });

    return {
      orders: enrichedOrders,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit) || 1,
      },
      summary: {
        totalOrders: allStoreOrders.length,
        pending: pendingCount,
        accepted: acceptedCount,
        packed: preparingCount + readyCount,
        outForDelivery: outForDeliveryCount,
        delivered: deliveredCount,
        cancelled: cancelledCount,
        todayRevenue,
      },
    };
  }

  static async bulkUpdateSellerOrderStatus(ownerId: string, orderIds: string[], status: string) {
    const results = [];
    const errors = [];
    for (const orderId of orderIds) {
      try {
        const updated = await this.updateSellerOrderStatus(ownerId, orderId, status);
        results.push(updated);
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : "Failed to update";
        errors.push({ orderId, message });
      }
    }
    return { updatedCount: results.length, errors };
  }

  static async updateSellerNotes(ownerId: string, orderId: string, sellerNotes: string) {
    const store = await Store.findOne({ ownerId }).select("storeId").lean();
    if (!store) throw new AppError("Store not found for seller", 403);
    const order = await Order.findOneAndUpdate(
      { orderId, storeId: store.storeId },
      { $set: { sellerNotes, updatedBySellerAt: new Date() } },
      { new: true }
    );
    if (!order) throw new AppError("Order not found", 404);
    return order;
  }
}
