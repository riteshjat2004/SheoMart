import { Notification, INotification } from "../models/notification.model";
import { Store } from "../models/store.model";
import { User } from "../models/user.model";
import { emitStoreNewOrder } from "../sockets/support.socket";
import { sendStoreNewOrderEmail } from "./mail.service";
import { logger } from "../utils/logger";
import { AppError } from "../errors/AppError";

export class NotificationService {
  /**
   * Dispatches a real-time order notification to the store and its seller.
   * Persists to MongoDB, emits over WebSockets, and delivers email alert.
   */
  static async sendStoreOrderNotification(order: any): Promise<INotification | null> {
    try {
      if (!order?.storeId) {
        return null;
      }

      const [store, customer] = await Promise.all([
        Store.findOne({ storeId: order.storeId }).lean(),
        order.userId ? User.findOne({ userId: order.userId }).select("name mobile email").lean() : null,
      ]);

      const owner = store?.ownerId
        ? await User.findOne({ userId: store.ownerId }).select("email name mobile").lean()
        : null;

      const storeName = store?.storeName || "Your Store";
      const shortId = order.orderId ? order.orderId.slice(-6).toUpperCase() : "";
      const customerName = customer?.name || "Customer";
      const grandTotal = Number(order.grandTotal) || 0;
      const itemCount = Array.isArray(order.orderItems)
        ? order.orderItems.reduce((acc: number, item: any) => acc + (Number(item.quantity) || 1), 0)
        : 1;

      const isPickup =
        order.fulfillmentType === "pickup" ||
        order.deliveryMethod === "pickup" ||
        order.pickupStatus === "READY_FOR_PICKUP";
      const fulfillmentText = isPickup ? "Pickup" : "Doorstep Delivery";

      const paymentMethodText =
        order.paymentMethod === "ONLINE"
          ? "Paid Online"
          : order.paymentMethod === "PAY_AT_PICKUP"
          ? "Pay at Shop"
          : order.paymentMethod === "PAY_AT_DELIVERY"
          ? "Pay on Delivery"
          : "Cash on Delivery";

      const title = `New Order #${shortId} Received! 🛍️`;
      const message = `Received an order for ₹${grandTotal.toLocaleString("en-IN")} (${itemCount} ${
        itemCount === 1 ? "item" : "items"
      }, ${fulfillmentText} • ${paymentMethodText}) from ${customerName}.`;
      const link = `/store/orders?orderId=${order.orderId}`;

      const notificationData = {
        orderId: order.orderId,
        shortId,
        grandTotal,
        itemCount,
        fulfillmentType: isPickup ? "pickup" : "delivery",
        paymentMethod: order.paymentMethod,
        customerName,
        customerPhone: customer?.mobile || "",
        status: order.status || "CONFIRMED",
        pickupStatus: order.pickupStatus || "ORDER_PLACED",
        createdAt: order.createdAt || new Date(),
      };

      // 1. Persist notification in database
      const notification = await Notification.create({
        storeId: order.storeId,
        userId: store?.ownerId,
        type: "NEW_ORDER",
        title,
        message,
        data: notificationData,
        link,
        isRead: false,
      });

      // 2. Real-time push via WebSockets
      const socketPayload = {
        id: notification.notificationId,
        notificationId: notification.notificationId,
        type: "new-order",
        title,
        message,
        data: notificationData,
        link,
        read: false,
        isRead: false,
        timestamp: notification.createdAt.toISOString(),
        createdAt: notification.createdAt.toISOString(),
      };

      emitStoreNewOrder(order.storeId, socketPayload, store?.ownerId);
      logger.info(`Real-time order notification emitted for store: ${order.storeId} [Order: ${order.orderId}]`);

      // 3. Asynchronously send store email notification if configured
      const recipientEmail = store?.email || owner?.email;
      if (recipientEmail) {
        const orderItemsSummary = (order.orderItems || []).map((it: any) => ({
          name: it.name || "Product",
          quantity: it.quantity || 1,
          price: it.discountPrice ?? it.price ?? 0,
        }));

        sendStoreNewOrderEmail({
          to: recipientEmail,
          storeName,
          orderId: order.orderId,
          customerName,
          grandTotal,
          itemCount,
          fulfillmentType: isPickup ? "pickup" : "delivery",
          paymentMethod: paymentMethodText,
          items: orderItemsSummary,
        }).catch((err) => {
          logger.warn(`Failed to deliver new order notification email to ${recipientEmail}: ${err.message}`);
        });
      }

      return notification;
    } catch (error) {
      logger.error("Error creating store order notification:", error);
      return null;
    }
  }

  /**
   * Fetches paginated notifications for a store.
   */
  static async getStoreNotifications(
    storeId: string,
    options: { page?: number; limit?: number; unreadOnly?: boolean } = {}
  ) {
    const page = Math.max(1, Number(options.page) || 1);
    const limit = Math.min(50, Math.max(1, Number(options.limit) || 20));
    const skip = (page - 1) * limit;

    const query: Record<string, unknown> = { storeId };
    if (options.unreadOnly) {
      query.isRead = false;
    }

    const [notifications, total, unreadCount] = await Promise.all([
      Notification.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
      Notification.countDocuments(query),
      Notification.countDocuments({ storeId, isRead: false }),
    ]);

    return {
      notifications: notifications.map((n) => ({
        id: n.notificationId,
        notificationId: n.notificationId,
        type: n.type === "NEW_ORDER" ? "new-order" : n.type.toLowerCase().replace(/_/g, "-"),
        title: n.title,
        message: n.message,
        data: n.data,
        link: n.link,
        read: n.isRead,
        isRead: n.isRead,
        timestamp: n.createdAt.toISOString(),
        createdAt: n.createdAt.toISOString(),
      })),
      total,
      unreadCount,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  /**
   * Marks a single notification as read.
   */
  static async markAsRead(storeId: string, notificationId: string) {
    const notification = await Notification.findOneAndUpdate(
      { storeId, notificationId },
      { $set: { isRead: true, readAt: new Date() } },
      { new: true }
    ).lean();

    if (!notification) {
      throw new AppError("Notification not found", 404);
    }

    return notification;
  }

  /**
   * Marks all notifications for a store as read.
   */
  static async markAllAsRead(storeId: string) {
    const result = await Notification.updateMany(
      { storeId, isRead: false },
      { $set: { isRead: true, readAt: new Date() } }
    );

    return { modifiedCount: result.modifiedCount };
  }

  /**
   * Gets unread notification count for a store.
   */
  static async getUnreadCount(storeId: string) {
    const count = await Notification.countDocuments({ storeId, isRead: false });
    return { count };
  }
}
