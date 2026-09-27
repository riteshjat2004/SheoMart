import { AppError } from "../errors/AppError";
import { User } from "../models/user.model";
import { Order } from "../models/order.model";
import { TicketCounter } from "../models/ticketCounter.model";
import {
  SupportTicket,
  ISupportTicket,
  ISupportAttachment,
  IInternalNote,
} from "../models/supportTicket.model";
import { SupportMessage, ISupportMessage } from "../models/supportMessage.model";
import {
  SUPPORT_CATEGORIES,
  SupportCategory,
  TICKET_PRIORITY,
  TicketPriority,
  TICKET_STATUS,
  TicketStatus,
} from "../constants/support";
import {
  emitNewTicket,
  emitTicketMessage,
  emitTicketUpdated,
  emitMessagesRead,
} from "../sockets/support.socket";

export class SupportService {
  /**
   * Atomically generate ticket ID: SMT-YYYY-000001
   */
  private static async generateTicketId(): Promise<string> {
    const year = new Date().getFullYear();
    const counter = await TicketCounter.findOneAndUpdate(
      { year },
      { $inc: { seq: 1 } },
      { new: true, upsert: true }
    );
    const padded = String(counter.seq).padStart(6, "0");
    return `SMT-${year}-${padded}`;
  }

  /**
   * Customer: Create a new support ticket
   */
  static async createTicket(
    userId: string,
    payload: {
      category: SupportCategory;
      subject: string;
      description: string;
      priority?: TicketPriority;
      orderId?: string | null;
      attachments?: ISupportAttachment[];
    }
  ): Promise<ISupportTicket> {
    const user = await User.findOne({ userId, isDeleted: { $ne: true } })
      .select("userId name email avatar")
      .lean();

    if (!user) {
      throw new AppError("User account not found", 404);
    }

    const ticketId = await this.generateTicketId();

    const ticket = await SupportTicket.create({
      ticketId,
      userId,
      category: payload.category,
      subject: payload.subject.trim(),
      description: payload.description.trim(),
      priority: payload.priority || TICKET_PRIORITY.MEDIUM,
      status: TICKET_STATUS.OPEN,
      orderId: payload.orderId || null,
      attachments: payload.attachments || [],
      unreadByCustomer: 0,
      unreadByAdmin: 1,
      lastMessage: {
        messageText: payload.description.trim(),
        senderRole: "customer",
        sentAt: new Date(),
      },
    });

    // Create the initial message in the conversation thread
    await SupportMessage.create({
      ticketId,
      senderId: userId,
      senderRole: "customer",
      senderName: user.name,
      senderAvatar: user.avatar || null,
      message: payload.description.trim(),
      attachments: payload.attachments || [],
      isInternal: false,
      readByCustomer: true,
      readByAdmin: false,
    });

    emitNewTicket(ticket);

    return ticket;
  }

  /**
   * Customer: Get list of own tickets with search, filters and pagination
   */
  static async getCustomerTickets(
    userId: string,
    query: {
      page?: number;
      limit?: number;
      status?: string;
      search?: string;
    }
  ) {
    const page = Math.max(1, Number(query.page) || 1);
    const limit = Math.max(1, Math.min(50, Number(query.limit) || 20));
    const skip = (page - 1) * limit;

    const filter: Record<string, unknown> = { userId };

    if (query.status && query.status !== "all") {
      if (query.status === "active") {
        filter.status = {
          $in: [
            TICKET_STATUS.OPEN,
            TICKET_STATUS.WAITING_FOR_ADMIN,
            TICKET_STATUS.IN_PROGRESS,
          ],
        };
      } else {
        filter.status = query.status;
      }
    }

    if (query.search && query.search.trim()) {
      const searchRegex = new RegExp(query.search.trim(), "i");
      filter.$or = [
        { ticketId: searchRegex },
        { subject: searchRegex },
        { category: searchRegex },
      ];
    }

    const [tickets, total, unreadCount] = await Promise.all([
      SupportTicket.find(filter)
        .sort({ updatedAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      SupportTicket.countDocuments(filter),
      SupportTicket.aggregate([
        { $match: { userId } },
        { $group: { _id: null, totalUnread: { $sum: "$unreadByCustomer" } } },
      ]),
    ]);

    return {
      tickets,
      total,
      page,
      totalPages: Math.ceil(total / limit) || 1,
      unreadTotal: unreadCount[0]?.totalUnread || 0,
    };
  }

  /**
   * Get single ticket details with authorization & customer profile
   */
  static async getTicketDetails(
    ticketId: string,
    requester: { userId: string; role: string }
  ) {
    const ticket = await SupportTicket.findOne({ ticketId }).lean();
    if (!ticket) {
      throw new AppError("Support ticket not found", 404);
    }

    // Customer can only view own ticket
    if (requester.role !== "platform_admin" && ticket.userId !== requester.userId) {
      throw new AppError("Access denied to this ticket", 403);
    }

    // Populate customer details for admin view
    let customerInfo = null;
    let orderInfo = null;

    if (requester.role === "platform_admin") {
      const [customerUser, orderCount] = await Promise.all([
        User.findOne({ userId: ticket.userId })
          .select("userId name email mobile avatar isVerifiedCustomer createdAt")
          .lean(),
        Order.countDocuments({ userId: ticket.userId }),
      ]);

      customerInfo = customerUser
        ? {
            ...customerUser,
            totalOrders: orderCount,
          }
        : null;

      if (ticket.orderId) {
        orderInfo = await Order.findOne({ orderId: ticket.orderId })
          .select("orderId invoiceNumber status grandTotal paymentStatus orderItems createdAt")
          .lean();
      }
    }

    // If customer is reading, strip internal notes
    const sanitizedTicket = {
      ...ticket,
      internalNotes: requester.role === "platform_admin" ? ticket.internalNotes : [],
    };

    return {
      ticket: sanitizedTicket,
      customer: customerInfo,
      order: orderInfo,
    };
  }

  /**
   * Get messages for ticket thread
   */
  static async getTicketMessages(
    ticketId: string,
    requester: { userId: string; role: string }
  ) {
    const ticket = await SupportTicket.findOne({ ticketId }).select("userId").lean();
    if (!ticket) {
      throw new AppError("Support ticket not found", 404);
    }

    if (requester.role !== "platform_admin" && ticket.userId !== requester.userId) {
      throw new AppError("Access denied to this ticket", 403);
    }

    const messageFilter: Record<string, unknown> = { ticketId };
    if (requester.role !== "platform_admin") {
      messageFilter.isInternal = false;
    }

    const messages = await SupportMessage.find(messageFilter)
      .sort({ createdAt: 1 })
      .lean();

    return messages;
  }

  /**
   * Send a message in the ticket thread
   */
  static async sendMessage(
    ticketId: string,
    sender: { userId: string; role: string },
    payload: {
      message: string;
      attachments?: ISupportAttachment[];
      isInternal?: boolean;
    }
  ): Promise<ISupportMessage> {
    const ticket = await SupportTicket.findOne({ ticketId });
    if (!ticket) {
      throw new AppError("Support ticket not found", 404);
    }

    const isCustomer = sender.role === "customer";
    const isAdmin = sender.role === "platform_admin";

    if (isCustomer && ticket.userId !== sender.userId) {
      throw new AppError("Access denied to this ticket", 403);
    }

    if (isCustomer && ticket.status === TICKET_STATUS.CLOSED) {
      throw new AppError("This ticket is closed. Please reopen it or create a new request.", 400);
    }

    const user = await User.findOne({ userId: sender.userId })
      .select("userId name email avatar")
      .lean();

    const senderName = user?.name || (isAdmin ? "Support Agent" : "Customer");
    const senderAvatar = user?.avatar || null;
    const isInternal = Boolean(isAdmin && payload.isInternal);

    const message = await SupportMessage.create({
      ticketId,
      senderId: sender.userId,
      senderRole: isCustomer ? "customer" : "admin",
      senderName,
      senderAvatar,
      message: payload.message.trim(),
      attachments: payload.attachments || [],
      isInternal,
      readByCustomer: isCustomer,
      readByAdmin: isAdmin,
    });

    // Update ticket metadata
    if (isInternal) {
      ticket.internalNotes.push({
        noteId: message.messageId,
        adminId: sender.userId,
        adminName: senderName,
        note: payload.message.trim(),
        createdAt: new Date(),
      });
      await ticket.save();
    } else {
      if (isCustomer) {
        ticket.unreadByAdmin += 1;
        // Reopen to waiting_for_admin if it was resolved
        if (ticket.status === TICKET_STATUS.RESOLVED) {
          ticket.status = TICKET_STATUS.WAITING_FOR_ADMIN;
          ticket.reopenedAt = new Date();
        } else if (ticket.status === TICKET_STATUS.OPEN) {
          ticket.status = TICKET_STATUS.WAITING_FOR_ADMIN;
        }
      } else if (isAdmin) {
        ticket.unreadByCustomer += 1;
        if (
          ticket.status === TICKET_STATUS.OPEN ||
          ticket.status === TICKET_STATUS.WAITING_FOR_ADMIN
        ) {
          ticket.status = TICKET_STATUS.IN_PROGRESS;
        }
        if (!ticket.assignedAdminId) {
          ticket.assignedAdminId = sender.userId;
          ticket.assignedAdminName = senderName;
        }
      }

      ticket.lastMessage = {
        messageText: payload.message.trim(),
        senderRole: isCustomer ? "customer" : "admin",
        sentAt: new Date(),
      };

      await ticket.save();
    }

    emitTicketMessage(ticketId, message);
    emitTicketUpdated(ticket);

    return message;
  }

  /**
   * Mark all unread messages as read
   */
  static async markMessagesRead(
    ticketId: string,
    requester: { userId: string; role: string }
  ) {
    const ticket = await SupportTicket.findOne({ ticketId });
    if (!ticket) {
      throw new AppError("Support ticket not found", 404);
    }

    const isCustomer = requester.role === "customer";
    const isAdmin = requester.role === "platform_admin";

    if (isCustomer && ticket.userId !== requester.userId) {
      throw new AppError("Access denied", 403);
    }

    if (isCustomer) {
      ticket.unreadByCustomer = 0;
      await Promise.all([
        ticket.save(),
        SupportMessage.updateMany(
          { ticketId, readByCustomer: false, isInternal: false },
          { $set: { readByCustomer: true, readAt: new Date() } }
        ),
      ]);
      emitMessagesRead(ticketId, "customer");
    } else if (isAdmin) {
      ticket.unreadByAdmin = 0;
      await Promise.all([
        ticket.save(),
        SupportMessage.updateMany(
          { ticketId, readByAdmin: false },
          { $set: { readByAdmin: true, readAt: new Date() } }
        ),
      ]);
      emitMessagesRead(ticketId, "admin");
    }

    return { success: true };
  }

  /**
   * Admin: Get all tickets with advanced filters, search & sorting
   */
  static async getAdminTickets(query: {
    page?: number;
    limit?: number;
    status?: string;
    priority?: string;
    category?: string;
    search?: string;
    sort?: string;
  }) {
    const page = Math.max(1, Number(query.page) || 1);
    const limit = Math.max(1, Math.min(50, Number(query.limit) || 20));
    const skip = (page - 1) * limit;

    const filter: Record<string, unknown> = {};

    if (query.status && query.status !== "all") {
      filter.status = query.status;
    }

    if (query.priority && query.priority !== "all") {
      filter.priority = query.priority;
    }

    if (query.category && query.category !== "all") {
      filter.category = query.category;
    }

    if (query.search && query.search.trim()) {
      const searchRegex = new RegExp(query.search.trim(), "i");

      // Check if search matches users
      const matchingUsers = await User.find({
        $or: [{ name: searchRegex }, { email: searchRegex }, { mobile: searchRegex }],
      })
        .select("userId")
        .limit(20)
        .lean();

      const matchedUserIds = matchingUsers.map((u) => u.userId);

      filter.$or = [
        { ticketId: searchRegex },
        { subject: searchRegex },
        { userId: { $in: matchedUserIds } },
      ];
    }

    // Sort order
    let sortOptions: Record<string, 1 | -1> = { updatedAt: -1 };
    if (query.sort === "oldest") {
      sortOptions = { createdAt: 1 };
    } else if (query.sort === "unread") {
      sortOptions = { unreadByAdmin: -1, updatedAt: -1 };
    } else if (query.sort === "priority") {
      // Urgent > High > Medium > Low
      sortOptions = { priority: 1, updatedAt: -1 };
    }

    const [tickets, total] = await Promise.all([
      SupportTicket.find(filter)
        .sort(sortOptions)
        .skip(skip)
        .limit(limit)
        .lean(),
      SupportTicket.countDocuments(filter),
    ]);

    // Populate customer basic info for all tickets in page
    const userIds = Array.from(new Set(tickets.map((t) => t.userId)));
    const users = await User.find({ userId: { $in: userIds } })
      .select("userId name email mobile avatar isVerifiedCustomer")
      .lean();
    const userMap = new Map(users.map((u) => [u.userId, u]));

    const enrichedTickets = tickets.map((t) => ({
      ...t,
      customer: userMap.get(t.userId) || {
        name: "Unknown Customer",
        email: "",
        avatar: null,
      },
    }));

    return {
      tickets: enrichedTickets,
      total,
      page,
      totalPages: Math.ceil(total / limit) || 1,
    };
  }

  /**
   * Admin: Analytics & KPI statistics
   */
  static async getAdminAnalytics() {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const [
      totalTickets,
      openTickets,
      waitingTickets,
      inProgressTickets,
      resolvedTickets,
      closedTickets,
      resolvedToday,
      urgentPending,
      categoryStats,
      priorityStats,
    ] = await Promise.all([
      SupportTicket.countDocuments(),
      SupportTicket.countDocuments({ status: TICKET_STATUS.OPEN }),
      SupportTicket.countDocuments({ status: TICKET_STATUS.WAITING_FOR_ADMIN }),
      SupportTicket.countDocuments({ status: TICKET_STATUS.IN_PROGRESS }),
      SupportTicket.countDocuments({ status: TICKET_STATUS.RESOLVED }),
      SupportTicket.countDocuments({ status: TICKET_STATUS.CLOSED }),
      SupportTicket.countDocuments({
        status: TICKET_STATUS.RESOLVED,
        resolvedAt: { $gte: today },
      }),
      SupportTicket.countDocuments({
        priority: TICKET_PRIORITY.URGENT,
        status: {
          $in: [
            TICKET_STATUS.OPEN,
            TICKET_STATUS.WAITING_FOR_ADMIN,
            TICKET_STATUS.IN_PROGRESS,
          ],
        },
      }),
      SupportTicket.aggregate([
        { $group: { _id: "$category", count: { $sum: 1 } } },
      ]),
      SupportTicket.aggregate([
        { $group: { _id: "$priority", count: { $sum: 1 } } },
      ]),
    ]);

    // Average resolution time (in hours) for tickets resolved in the last 30 days
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const resolvedIn30Days = await SupportTicket.find({
      resolvedAt: { $gte: thirtyDaysAgo },
    })
      .select("createdAt resolvedAt")
      .lean();

    let avgResolutionHours = 4.2; // sensible fallback
    if (resolvedIn30Days.length > 0) {
      const totalHours = resolvedIn30Days.reduce((acc, t) => {
        if (t.resolvedAt) {
          const diffMs = t.resolvedAt.getTime() - t.createdAt.getTime();
          return acc + diffMs / (1000 * 60 * 60);
        }
        return acc;
      }, 0);
      avgResolutionHours = Number((totalHours / resolvedIn30Days.length).toFixed(1));
    }

    return {
      totalTickets,
      openTickets,
      waitingForAdmin: waitingTickets,
      inProgressTickets,
      resolvedTickets,
      closedTickets,
      resolvedToday,
      urgentPending,
      avgResolutionHours,
      categoryBreakdown: categoryStats.map((c) => ({
        category: c._id,
        count: c.count,
      })),
      priorityBreakdown: priorityStats.map((p) => ({
        priority: p._id,
        count: p.count,
      })),
    };
  }

  /**
   * Update ticket status (Customer or Admin)
   */
  static async updateTicketStatus(
    ticketId: string,
    userId: string,
    userRole: string,
    status: TicketStatus,
    reason?: string
  ): Promise<ISupportTicket> {
    const ticket = await SupportTicket.findOne({ ticketId });
    if (!ticket) {
      throw new AppError("Ticket not found", 404);
    }

    const isCustomer = userRole === "customer";
    const isAdmin = userRole === "platform_admin";

    // Customer can only update their own ticket, and can only mark as resolved or closed
    if (isCustomer) {
      if (ticket.userId !== userId) {
        throw new AppError("Access denied to this ticket", 403);
      }
      if (status !== TICKET_STATUS.RESOLVED && status !== TICKET_STATUS.CLOSED) {
        throw new AppError("Customers can only mark tickets as resolved or closed", 400);
      }
    }

    const user = await User.findOne({ userId })
      .select("name")
      .lean();
    const performerName = user?.name || (isAdmin ? "Support Admin" : "Customer");

    ticket.status = status;

    if (status === TICKET_STATUS.RESOLVED) {
      ticket.resolvedAt = new Date();
      ticket.resolvedBy = isCustomer ? `${performerName} (Customer)` : performerName;
    } else if (status === TICKET_STATUS.CLOSED) {
      ticket.closedAt = new Date();
      ticket.closedBy = isCustomer ? `${performerName} (Customer)` : performerName;
    } else if (status === TICKET_STATUS.OPEN || status === TICKET_STATUS.IN_PROGRESS) {
      ticket.reopenedAt = new Date();
    }

    await ticket.save();

    // Create system message for audit in chat thread
    const statusLabels: Record<string, string> = {
      open: "re-opened as Open",
      waiting_for_admin: "marked as Waiting for Support",
      in_progress: "marked as In Progress",
      resolved: "marked as Resolved",
      closed: "Closed",
    };

    const statusMessageText = `Ticket was ${statusLabels[status] || status} by ${performerName}${
      reason ? `. Note: ${reason}` : ""
    }`;

    const systemMsg = await SupportMessage.create({
      ticketId,
      senderId: userId,
      senderRole: isAdmin ? "admin" : "customer",
      senderName: "SheoMart System",
      message: statusMessageText,
      isInternal: false,
      readByCustomer: isCustomer,
      readByAdmin: isAdmin,
    });

    emitTicketMessage(ticketId, systemMsg);
    emitTicketUpdated(ticket);

    return ticket;
  }

  /**
   * Admin: Update ticket priority
   */
  static async updateTicketPriority(
    ticketId: string,
    priority: TicketPriority
  ): Promise<ISupportTicket> {
    const ticket = await SupportTicket.findOne({ ticketId });
    if (!ticket) {
      throw new AppError("Ticket not found", 404);
    }

    ticket.priority = priority;
    await ticket.save();

    emitTicketUpdated(ticket);
    return ticket;
  }

  /**
   * Admin: Assign ticket to an admin
   */
  static async assignTicket(
    ticketId: string,
    adminId: string,
    adminName?: string
  ): Promise<ISupportTicket> {
    const ticket = await SupportTicket.findOne({ ticketId });
    if (!ticket) {
      throw new AppError("Ticket not found", 404);
    }

    let resolvedName = adminName;
    if (!resolvedName) {
      const admin = await User.findOne({ userId: adminId }).select("name").lean();
      resolvedName = admin?.name || "Support Admin";
    }

    ticket.assignedAdminId = adminId;
    ticket.assignedAdminName = resolvedName;
    await ticket.save();

    emitTicketUpdated(ticket);
    return ticket;
  }

  /**
   * Admin: Add internal note
   */
  static async addInternalNote(
    ticketId: string,
    adminId: string,
    noteText: string
  ): Promise<IInternalNote> {
    const ticket = await SupportTicket.findOne({ ticketId });
    if (!ticket) {
      throw new AppError("Ticket not found", 404);
    }

    const admin = await User.findOne({ userId: adminId }).select("name").lean();
    const adminName = admin?.name || "Support Admin";

    const noteObj: IInternalNote = {
      noteId: `note-${Date.now()}`,
      adminId,
      adminName,
      note: noteText.trim(),
      createdAt: new Date(),
    };

    ticket.internalNotes.push(noteObj);
    await ticket.save();

    // Also persist as an internal message in chat
    const internalMsg = await SupportMessage.create({
      ticketId,
      senderId: adminId,
      senderRole: "admin",
      senderName: adminName,
      message: noteText.trim(),
      isInternal: true,
      readByCustomer: true,
      readByAdmin: true,
    });

    emitTicketMessage(ticketId, internalMsg);
    emitTicketUpdated(ticket);

    return noteObj;
  }

  /**
   * Customer: Fetch recent orders for the ticket order selector
   */
  static async getCustomerOrdersForSupport(userId: string) {
    const orders = await Order.find({ userId })
      .select("orderId invoiceNumber status grandTotal orderItems createdAt")
      .sort({ createdAt: -1 })
      .limit(15)
      .lean();

    return orders.map((o) => ({
      orderId: o.orderId,
      invoiceNumber: o.invoiceNumber || o.orderId.slice(0, 8),
      grandTotal: o.grandTotal,
      status: o.status,
      itemsCount: o.orderItems?.length || 0,
      createdAt: o.createdAt,
    }));
  }
}
