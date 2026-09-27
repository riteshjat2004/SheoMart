import { Server as HttpServer } from "http";
import { Server, Socket } from "socket.io";
import { env } from "../config/env";
import { logger } from "../utils/logger";
import { verifyAccessToken } from "../utils/jwt";
import { ISupportTicket } from "../models/supportTicket.model";
import { ISupportMessage } from "../models/supportMessage.model";

let io: Server | null = null;

export interface SocketUser {
  userId: string;
  role: string;
}

export function initSocketServer(server: HttpServer): Server {
  io = new Server(server, {
    cors: {
      origin: env.CORS_ORIGIN || "http://localhost:3000",
      credentials: true,
      methods: ["GET", "POST"],
    },
    pingTimeout: 60000,
    pingInterval: 25000,
  });

  // Socket Authentication Middleware
  io.use((socket: Socket, next) => {
    try {
      const token =
        socket.handshake.auth?.token ||
        socket.handshake.headers?.authorization?.replace(/^Bearer\s+/i, "");

      if (!token) {
        // Allow unauthenticated connection but mark without user context
        return next();
      }

      try {
        const payload = verifyAccessToken(token);
        (socket as Socket & { user?: SocketUser }).user = {
          userId: payload.userId,
          role: payload.role,
        };
      } catch {
        // Expired or bad token; proceed unauthenticated
      }

      next();
    } catch (err) {
      next(err instanceof Error ? err : new Error("Socket authentication failed"));
    }
  });

  io.on("connection", (socket: Socket) => {
    const user = (socket as Socket & { user?: SocketUser }).user;
    if (user?.userId) {
      // Auto-join personal room
      socket.join(`user:${user.userId}`);

      // Auto-join admin room if platform admin
      if (user.role === "platform_admin") {
        socket.join("admin:support");
      }
    }

    // Join specific ticket room for live chat
    socket.on("join_ticket", (ticketId: string) => {
      if (ticketId) {
        socket.join(`ticket:${ticketId}`);
      }
    });

    // Leave ticket room
    socket.on("leave_ticket", (ticketId: string) => {
      if (ticketId) {
        socket.leave(`ticket:${ticketId}`);
      }
    });

    // Typing indicators
    socket.on("typing", (data: { ticketId: string; userName?: string }) => {
      if (data?.ticketId) {
        socket.to(`ticket:${data.ticketId}`).emit("user_typing", {
          ticketId: data.ticketId,
          userId: user?.userId,
          userName: data.userName || (user?.role === "platform_admin" ? "Support Agent" : "Customer"),
          role: user?.role,
        });
      }
    });

    socket.on("stop_typing", (data: { ticketId: string }) => {
      if (data?.ticketId) {
        socket.to(`ticket:${data.ticketId}`).emit("user_stop_typing", {
          ticketId: data.ticketId,
          userId: user?.userId,
        });
      }
    });

    socket.on("disconnect", () => {
      // Automatic cleanup handled by socket.io
    });
  });

  logger.info("Socket.IO support real-time messaging gateway initialized");
  return io;
}

export function getSocketIO(): Server | null {
  return io;
}

export function emitNewTicket(ticket: ISupportTicket): void {
  if (!io) return;
  io.to("admin:support").emit("new_ticket", {
    ticketId: ticket.ticketId,
    category: ticket.category,
    subject: ticket.subject,
    priority: ticket.priority,
    status: ticket.status,
    createdAt: ticket.createdAt,
    unreadByAdmin: ticket.unreadByAdmin,
  });
}

export function emitTicketMessage(ticketId: string, message: ISupportMessage): void {
  if (!io) return;

  if (message.isInternal) {
    // Internal notes only broadcast to admins
    io.to("admin:support").emit("ticket_internal_note", {
      ticketId,
      message,
    });
  } else {
    // Broadcast to ticket room
    io.to(`ticket:${ticketId}`).emit("new_message", {
      ticketId,
      message,
    });

    // Broadcast to admin room if customer sent it
    if (message.senderRole === "customer") {
      io.to("admin:support").emit("customer_replied", {
        ticketId,
        message,
      });
    }
  }
}

export function emitTicketUpdated(ticket: ISupportTicket): void {
  if (!io) return;
  io.to(`ticket:${ticket.ticketId}`).emit("ticket_updated", ticket);
  io.to("admin:support").emit("ticket_updated", ticket);
  io.to(`user:${ticket.userId}`).emit("ticket_updated", ticket);
}

export function emitMessagesRead(ticketId: string, readByRole: "customer" | "admin"): void {
  if (!io) return;
  io.to(`ticket:${ticketId}`).emit("messages_read", {
    ticketId,
    readByRole,
    readAt: new Date(),
  });
}
