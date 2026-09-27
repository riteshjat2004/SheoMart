import api from "./api";
import type {
  SupportTicket,
  SupportMessage,
  SupportAnalytics,
  CustomerOrderOption,
  TicketStatus,
  TicketPriority,
  SupportCategory,
  SupportAttachment,
  InternalNote,
} from "@/types/support";

export interface GetCustomerTicketsResponse {
  tickets: SupportTicket[];
  total: number;
  page: number;
  totalPages: number;
  unreadTotal: number;
}

export interface GetAdminTicketsResponse {
  tickets: SupportTicket[];
  total: number;
  page: number;
  totalPages: number;
}

export interface TicketDetailsResponse {
  ticket: SupportTicket;
  customer?: {
    userId: string;
    name: string;
    email: string;
    mobile?: string;
    avatar?: string;
    isVerifiedCustomer?: boolean;
    createdAt?: string;
    totalOrders?: number;
  } | null;
  order?: {
    orderId: string;
    invoiceNumber: string;
    status: string;
    grandTotal: number;
    paymentStatus: string;
    orderItems?: Array<unknown>;
    createdAt: string;
  } | null;
}

export const supportService = {
  /**
   * Customer: Create a new support ticket
   */
  async createTicket(payload: {
    category: SupportCategory;
    subject: string;
    description: string;
    priority?: TicketPriority;
    orderId?: string | null;
    attachments?: SupportAttachment[];
  }): Promise<SupportTicket> {
    const res = await api.post("/api/v1/support/tickets", payload);
    return res.data?.data;
  },

  /**
   * Customer: Get list of own tickets
   */
  async getCustomerTickets(params?: {
    page?: number;
    limit?: number;
    status?: string;
    search?: string;
  }): Promise<GetCustomerTicketsResponse> {
    const res = await api.get("/api/v1/support/tickets/my", { params });
    return res.data?.data;
  },

  /**
   * Customer / Admin: Get ticket details
   */
  async getTicketDetails(ticketId: string): Promise<TicketDetailsResponse> {
    const res = await api.get(`/api/v1/support/tickets/${ticketId}`);
    return res.data?.data;
  },

  /**
   * Customer / Admin: Get conversation messages
   */
  async getTicketMessages(ticketId: string): Promise<SupportMessage[]> {
    const res = await api.get(`/api/v1/support/tickets/${ticketId}/messages`);
    return res.data?.data;
  },

  /**
   * Customer / Admin: Send a message in thread
   */
  async sendMessage(
    ticketId: string,
    payload: {
      message: string;
      attachments?: SupportAttachment[];
      isInternal?: boolean;
    }
  ): Promise<SupportMessage> {
    const res = await api.post(`/api/v1/support/tickets/${ticketId}/messages`, payload);
    return res.data?.data;
  },

  /**
   * Customer / Admin: Mark messages as read
   */
  async markMessagesRead(ticketId: string): Promise<{ success: boolean }> {
    const res = await api.put(`/api/v1/support/tickets/${ticketId}/read`);
    return res.data?.data;
  },

  /**
   * Customer: Fetch recent orders for selector
   */
  async getCustomerOrders(): Promise<CustomerOrderOption[]> {
    const res = await api.get("/api/v1/support/customer-orders");
    return res.data?.data;
  },

  /**
   * Upload image attachment to Cloudinary
   */
  async uploadAttachment(file: File): Promise<SupportAttachment> {
    const formData = new FormData();
    formData.append("image", file);
    const res = await api.post("/api/v1/support/upload", formData);
    return res.data?.data;
  },

  /**
   * Admin: List all tickets with filters
   */
  async getAdminTickets(params?: {
    page?: number;
    limit?: number;
    status?: string;
    priority?: string;
    category?: string;
    search?: string;
    sort?: string;
  }): Promise<GetAdminTicketsResponse> {
    const res = await api.get("/api/v1/support/admin/tickets", { params });
    return res.data?.data;
  },

  /**
   * Admin: Analytics & KPI stats
   */
  async getAdminAnalytics(): Promise<SupportAnalytics> {
    const res = await api.get("/api/v1/support/admin/analytics");
    return res.data?.data;
  },

  /**
   * Customer / Admin: Update ticket status
   */
  async updateTicketStatus(
    ticketId: string,
    status: TicketStatus,
    reason?: string
  ): Promise<SupportTicket> {
    const res = await api.patch(`/api/v1/support/tickets/${ticketId}/status`, {
      status,
      reason,
    });
    return res.data?.data;
  },

  /**
   * Admin: Update ticket priority
   */
  async updateTicketPriority(
    ticketId: string,
    priority: TicketPriority
  ): Promise<SupportTicket> {
    const res = await api.patch(`/api/v1/support/admin/tickets/${ticketId}/priority`, {
      priority,
    });
    return res.data?.data;
  },

  /**
   * Admin: Assign ticket
   */
  async assignTicket(
    ticketId: string,
    adminId: string,
    adminName?: string
  ): Promise<SupportTicket> {
    const res = await api.patch(`/api/v1/support/admin/tickets/${ticketId}/assign`, {
      adminId,
      adminName,
    });
    return res.data?.data;
  },

  /**
   * Admin: Add internal note
   */
  async addInternalNote(ticketId: string, note: string): Promise<InternalNote> {
    const res = await api.post(
      `/api/v1/support/admin/tickets/${ticketId}/internal-notes`,
      { note }
    );
    return res.data?.data;
  },
};
