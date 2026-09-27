export const SUPPORT_CATEGORIES = {
  ORDER_ISSUE: "order_issue",
  PRODUCT_QUALITY: "product_quality",
  WRONG_ITEM: "wrong_item",
  PAYMENT_ISSUE: "payment_issue",
  REFUND_REQUEST: "refund_request",
  DELIVERY_ISSUE: "delivery_issue",
  COUPON_PROBLEM: "coupon_problem",
  APP_BUG: "app_bug",
  ACCOUNT_LOGIN: "account_login",
  GENERAL_FEEDBACK: "general_feedback",
} as const;

export type SupportCategory =
  (typeof SUPPORT_CATEGORIES)[keyof typeof SUPPORT_CATEGORIES];

export const TICKET_STATUS = {
  OPEN: "open",
  WAITING_FOR_ADMIN: "waiting_for_admin",
  IN_PROGRESS: "in_progress",
  RESOLVED: "resolved",
  CLOSED: "closed",
} as const;

export type TicketStatus = (typeof TICKET_STATUS)[keyof typeof TICKET_STATUS];

export const TICKET_PRIORITY = {
  LOW: "low",
  MEDIUM: "medium",
  HIGH: "high",
  URGENT: "urgent",
} as const;

export type TicketPriority =
  (typeof TICKET_PRIORITY)[keyof typeof TICKET_PRIORITY];

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
