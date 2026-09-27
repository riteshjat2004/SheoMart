"use client";

import {
  Package,
  Sparkles,
  AlertTriangle,
  CreditCard,
  Receipt,
  Truck,
  TicketPercent,
  Bug,
  UserCheck,
  MessageSquare,
  Clock,
  CheckCircle,
  AlertCircle,
} from "lucide-react";
import {
  SUPPORT_CATEGORY_META,
  type SupportTicket,
  type SupportCategory,
  type TicketStatus,
  type TicketPriority,
} from "@/types/support";

const CATEGORY_ICONS: Record<SupportCategory, React.ElementType> = {
  order_issue: Package,
  product_quality: Sparkles,
  wrong_item: AlertTriangle,
  payment_issue: CreditCard,
  refund_request: Receipt,
  delivery_issue: Truck,
  coupon_problem: TicketPercent,
  app_bug: Bug,
  account_login: UserCheck,
  general_feedback: MessageSquare,
};

function formatRelativeTime(dateString?: string): string {
  if (!dateString) return "";
  const date = new Date(dateString);
  const now = new Date();
  const diffSec = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (diffSec < 60) return "Just now";
  if (diffSec < 3600) return `${Math.floor(diffSec / 60)}m ago`;
  if (diffSec < 86400) return `${Math.floor(diffSec / 3600)}h ago`;
  if (diffSec < 604800) return `${Math.floor(diffSec / 86400)}d ago`;
  return date.toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

function StatusBadge({ status }: { status: TicketStatus }) {
  switch (status) {
    case "open":
      return (
        <span className="inline-flex items-center gap-1 rounded-md bg-blue-50 px-2 py-0.5 text-[10px] font-bold text-blue-700 dark:bg-blue-950/40 dark:text-blue-300 border border-blue-200/60 dark:border-blue-900/60">
          <span className="h-1.5 w-1.5 rounded-full bg-blue-500" />
          Open
        </span>
      );
    case "waiting_for_admin":
      return (
        <span className="inline-flex items-center gap-1 rounded-md bg-amber-50 px-2 py-0.5 text-[10px] font-bold text-amber-700 dark:bg-amber-950/40 dark:text-amber-300 border border-amber-200/60 dark:border-amber-900/60">
          <Clock className="h-2.5 w-2.5" />
          Waiting
        </span>
      );
    case "in_progress":
      return (
        <span className="inline-flex items-center gap-1 rounded-md bg-indigo-50 px-2 py-0.5 text-[10px] font-bold text-indigo-700 dark:bg-indigo-950/40 dark:text-indigo-300 border border-indigo-200/60 dark:border-indigo-900/60">
          <span className="h-1.5 w-1.5 rounded-full bg-indigo-500 animate-pulse" />
          In Progress
        </span>
      );
    case "resolved":
      return (
        <span className="inline-flex items-center gap-1 rounded-md bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 border border-emerald-200/60 dark:border-emerald-900/60">
          <CheckCircle className="h-2.5 w-2.5" />
          Resolved
        </span>
      );
    case "closed":
      return (
        <span className="inline-flex items-center gap-1 rounded-md bg-stone-100 px-2 py-0.5 text-[10px] font-medium text-stone-600 dark:bg-stone-800 dark:text-stone-400">
          Closed
        </span>
      );
    default:
      return null;
  }
}

function PriorityTag({ priority }: { priority: TicketPriority }) {
  if (priority === "urgent") {
    return (
      <span className="inline-flex items-center gap-0.5 rounded-md bg-rose-50 px-1.5 py-0.5 text-[9px] font-extrabold text-rose-700 dark:bg-rose-950/50 dark:text-rose-300 border border-rose-200 dark:border-rose-900">
        <AlertCircle className="h-2.5 w-2.5 text-rose-500 animate-pulse" />
        Urgent
      </span>
    );
  }
  if (priority === "high") {
    return (
      <span className="rounded-md bg-amber-50 px-1.5 py-0.5 text-[9px] font-bold text-amber-700 dark:bg-amber-950/50 dark:text-amber-300 border border-amber-200 dark:border-amber-900">
        High
      </span>
    );
  }
  return null;
}

interface TicketCardProps {
  ticket: SupportTicket;
  isSelected: boolean;
  onClick: () => void;
  unreadCount?: number;
}

export function TicketCard({
  ticket,
  isSelected,
  onClick,
  unreadCount = 0,
}: TicketCardProps) {
  const Icon = CATEGORY_ICONS[ticket.category] || LifeBuoyIcon;
  const categoryMeta = SUPPORT_CATEGORY_META[ticket.category];

  return (
    <button
      type="button"
      onClick={onClick}
      className={`group relative w-full rounded-2xl border p-3.5 text-left transition-all duration-200 ${
        isSelected
          ? "border-emerald-500 bg-emerald-50/40 shadow-xs ring-1 ring-emerald-500/20 dark:border-emerald-500/80 dark:bg-emerald-950/20"
          : "border-stone-200/80 bg-white hover:border-stone-300 hover:bg-stone-50/80 dark:border-stone-800/80 dark:bg-stone-900/60 dark:hover:border-stone-700"
      }`}
    >
      {/* Active left indicator */}
      {isSelected && (
        <span className="absolute top-3 bottom-3 -left-0.5 w-1 rounded-r-full bg-emerald-500" />
      )}

      {/* Top row: Ticket ID, Priority, Time */}
      <div className="flex items-center justify-between gap-2 mb-1.5">
        <div className="flex items-center gap-1.5">
          <span className="font-mono text-[11px] font-bold tracking-tight text-stone-500 dark:text-stone-400">
            {ticket.ticketId}
          </span>
          <PriorityTag priority={ticket.priority} />
        </div>
        <span className="text-[10px] text-stone-400 dark:text-stone-500 shrink-0">
          {formatRelativeTime(ticket.lastMessage?.sentAt || ticket.updatedAt || ticket.createdAt)}
        </span>
      </div>

      {/* Middle: Category & Subject */}
      <div className="flex items-start gap-2.5 mb-1.5">
        <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-stone-100 text-stone-600 dark:bg-stone-800 dark:text-stone-300">
          <Icon className="h-3.5 w-3.5" />
        </div>
        <div className="min-w-0 flex-1">
          <h4 className="truncate text-xs font-bold text-stone-900 dark:text-stone-100">
            {ticket.subject}
          </h4>
          <p className="truncate text-[11px] text-stone-500 dark:text-stone-400 mt-0.5">
            {ticket.lastMessage?.messageText || ticket.description}
          </p>
        </div>
      </div>

      {/* Bottom row: Status badge & unread indicator */}
      <div className="flex items-center justify-between gap-2 mt-2 pt-2 border-t border-stone-100 dark:border-stone-800/60">
        <div className="flex items-center gap-1.5">
          <StatusBadge status={ticket.status} />
          {categoryMeta && (
            <span className="text-[10px] text-stone-400 dark:text-stone-500 hidden sm:inline">
              • {categoryMeta.label}
            </span>
          )}
        </div>

        {unreadCount > 0 && (
          <span className="inline-flex h-4 min-w-4 items-center justify-center rounded-full bg-emerald-600 px-1.5 text-[9px] font-bold text-white shadow-xs">
            {unreadCount}
          </span>
        )}
      </div>
    </button>
  );
}

function LifeBuoyIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" {...props}>
      <circle cx="12" cy="12" r="10" />
      <circle cx="12" cy="12" r="4" />
      <line x1="4.93" y1="4.93" x2="9.17" y2="9.17" />
      <line x1="14.83" y1="9.17" x2="19.07" y2="4.93" />
      <line x1="14.83" y1="14.83" x2="19.07" y2="19.07" />
      <line x1="4.93" y1="19.07" x2="9.17" y2="14.83" />
    </svg>
  );
}
