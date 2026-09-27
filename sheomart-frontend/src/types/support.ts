export type SupportCategory =
  | "order_issue"
  | "product_quality"
  | "wrong_item"
  | "payment_issue"
  | "refund_request"
  | "delivery_issue"
  | "coupon_problem"
  | "app_bug"
  | "account_login"
  | "general_feedback";

export type TicketStatus =
  | "open"
  | "waiting_for_admin"
  | "in_progress"
  | "resolved"
  | "closed";

export type TicketPriority = "low" | "medium" | "high" | "urgent";

export interface SupportAttachment {
  url: string;
  publicId?: string;
  name?: string;
  bytes?: number;
}

export interface InternalNote {
  noteId: string;
  adminId: string;
  adminName: string;
  note: string;
  createdAt: string;
}

export interface LastMessageInfo {
  messageText: string;
  senderRole: "customer" | "admin";
  sentAt: string;
}

export interface SupportTicketCustomer {
  userId?: string;
  name: string;
  email: string;
  mobile?: string;
  avatar?: string | null;
  isVerifiedCustomer?: boolean;
  totalOrders?: number;
  createdAt?: string;
}

export interface SupportTicket {
  ticketId: string;
  userId: string;
  category: SupportCategory;
  subject: string;
  description: string;
  priority: TicketPriority;
  status: TicketStatus;
  assignedAdminId?: string | null;
  assignedAdminName?: string | null;
  orderId?: string | null;
  attachments: SupportAttachment[];
  lastMessage?: LastMessageInfo;
  unreadByCustomer: number;
  unreadByAdmin: number;
  internalNotes: InternalNote[];
  resolvedAt?: string | null;
  closedAt?: string | null;
  reopenedAt?: string | null;
  resolvedBy?: string | null;
  closedBy?: string | null;
  createdAt: string;
  updatedAt: string;
  customer?: SupportTicketCustomer;
}

export interface SupportMessage {
  messageId: string;
  ticketId: string;
  senderId: string;
  senderRole: "customer" | "admin";
  senderName: string;
  senderAvatar?: string | null;
  message: string;
  attachments: SupportAttachment[];
  isInternal: boolean;
  readByCustomer: boolean;
  readByAdmin: boolean;
  readAt?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface SupportAnalytics {
  totalTickets: number;
  openTickets: number;
  waitingForAdmin: number;
  inProgressTickets: number;
  resolvedTickets: number;
  closedTickets: number;
  resolvedToday: number;
  urgentPending: number;
  avgResolutionHours: number;
  categoryBreakdown: Array<{ category: string; count: number }>;
  priorityBreakdown: Array<{ priority: string; count: number }>;
}

export interface CustomerOrderOption {
  orderId: string;
  invoiceNumber: string;
  grandTotal: number;
  status: string;
  itemsCount: number;
  createdAt: string;
}

export interface CategoryMeta {
  id: SupportCategory;
  label: string;
  icon: string;
  description: string;
}

export const SUPPORT_CATEGORY_META: Record<SupportCategory, CategoryMeta> = {
  order_issue: {
    id: "order_issue",
    label: "Order Issue",
    icon: "Package",
    description: "Problems with placed, cancelled or ongoing orders",
  },
  product_quality: {
    id: "product_quality",
    label: "Product Quality",
    icon: "Sparkles",
    description: "Freshness, packaging, damaged or expired items",
  },
  wrong_item: {
    id: "wrong_item",
    label: "Wrong Item",
    icon: "AlertTriangle",
    description: "Received missing or incorrect products in parcel",
  },
  payment_issue: {
    id: "payment_issue",
    label: "Payment Issue",
    icon: "CreditCard",
    description: "Charged twice, payment failed or transaction pending",
  },
  refund_request: {
    id: "refund_request",
    label: "Refund Request",
    icon: "Receipt",
    description: "Track status or request refund to original payment source",
  },
  delivery_issue: {
    id: "delivery_issue",
    label: "Delivery Issue",
    icon: "Truck",
    description: "Rider delay, wrong delivery address or tracking problem",
  },
  coupon_problem: {
    id: "coupon_problem",
    label: "Coupon Problem",
    icon: "TicketPercent",
    description: "Promotional vouchers or discounts not applying at checkout",
  },
  app_bug: {
    id: "app_bug",
    label: "App Bug",
    icon: "Bug",
    description: "Glitches, app crashes, display errors or broken flows",
  },
  account_login: {
    id: "account_login",
    label: "Account & Login",
    icon: "UserCheck",
    description: "OTP login issues, mobile verification or profile access",
  },
  general_feedback: {
    id: "general_feedback",
    label: "General Feedback",
    icon: "MessageSquare",
    description: "Compliments, improvement suggestions or new store requests",
  },
};
