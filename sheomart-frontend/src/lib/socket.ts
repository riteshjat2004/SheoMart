import { io, Socket } from "socket.io-client";
import { useAuthStore } from "@/store/auth-store";

let socketInstance: Socket | null = null;

export function getSupportSocket(): Socket | null {
  if (typeof window === "undefined") {
    return null;
  }

  const token = useAuthStore.getState().accessToken;
  const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

  if (!socketInstance) {
    socketInstance = io(baseUrl, {
      auth: { token },
      autoConnect: true,
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
      timeout: 10000,
      transports: ["websocket", "polling"],
    });

    socketInstance.on("connect_error", (error) => {
      console.warn("[Socket.IO Support] Connection error:", error.message);
    });
  } else if (token && socketInstance.auth && (socketInstance.auth as { token?: string }).token !== token) {
    (socketInstance.auth as { token?: string }).token = token;
    socketInstance.disconnect().connect();
  }

  return socketInstance;
}

export function disconnectSupportSocket(): void {
  if (socketInstance) {
    socketInstance.disconnect();
    socketInstance = null;
  }
}

export function joinTicketRoom(ticketId: string): void {
  const socket = getSupportSocket();
  if (socket && ticketId) {
    socket.emit("join_ticket", ticketId);
  }
}

export function leaveTicketRoom(ticketId: string): void {
  const socket = getSupportSocket();
  if (socket && ticketId) {
    socket.emit("leave_ticket", ticketId);
  }
}

export function emitUserTyping(ticketId: string, userName?: string): void {
  const socket = getSupportSocket();
  if (socket && ticketId) {
    socket.emit("typing", { ticketId, userName });
  }
}

export function emitUserStopTyping(ticketId: string): void {
  const socket = getSupportSocket();
  if (socket && ticketId) {
    socket.emit("stop_typing", { ticketId });
  }
}

export function joinStoreRoom(storeId: string): void {
  const socket = getSupportSocket();
  if (socket && storeId) {
    socket.emit("join_store", storeId);
  }
}

export function leaveStoreRoom(storeId: string): void {
  const socket = getSupportSocket();
  if (socket && storeId) {
    socket.emit("leave_store", storeId);
  }
}

export const getAppSocket = getSupportSocket;

