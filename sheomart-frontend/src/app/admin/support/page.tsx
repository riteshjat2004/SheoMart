"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  LifeBuoy,
  Search,
  Filter,
  Inbox,
  AlertTriangle,
  Clock,
  CheckCircle2,
  AlertCircle,
  TrendingUp,
  User,
  ExternalLink,
  ShieldCheck,
  Send,
  Lock,
  Loader2,
  RefreshCw,
  X,
  FileText,
  MessageSquare,
  Sparkles,
  Phone,
  Mail,
  ChevronDown,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { supportService } from "@/services/support.service";
import { TicketCard } from "@/components/support/TicketCard";
import { ChatWindow } from "@/components/support/ChatWindow";
import {
  getSupportSocket,
  joinTicketRoom,
  leaveTicketRoom,
} from "@/lib/socket";
import { useAuthStore } from "@/store/auth-store";
import {
  SUPPORT_CATEGORY_META,
  type SupportTicket,
  type SupportMessage,
  type SupportAnalytics,
  type TicketStatus,
  type TicketPriority,
  type SupportCategory,
} from "@/types/support";

const CANNED_REPLIES = [
  {
    label: "Investigating with Store",
    text: "Hello! We are currently investigating this issue with the local store and will update you within 30 minutes. Thank you for your patience.",
  },
  {
    label: "Refund Initiated",
    text: "Good news! Your refund has been initiated to your original payment method. The amount should reflect in your bank account or UPI within 2 to 4 business days.",
  },
  {
    label: "Replacement Dispatched",
    text: "We have arranged an immediate replacement with our local delivery runner. It will arrive at your address within the next 45 minutes.",
  },
  {
    label: "Technical Bug Resolved",
    text: "Thank you for reporting this issue. Our platform engineering team has deployed a fix and the feature is now functioning normally. Please refresh your app.",
  },
  {
    label: "Awaiting Customer Info",
    text: "To help us resolve this swiftly, could you please provide a few additional details or photos of the package received?",
  },
];

export default function AdminSupportPage() {
  const queryClient = useQueryClient();
  const { user } = useAuthStore();

  const [activeTicketId, setActiveTicketId] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [priorityFilter, setPriorityFilter] = useState<string>("all");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<"newest" | "oldest" | "unread" | "priority">("newest");
  const [typingMap, setTypingMap] = useState<Record<string, { isTyping: boolean; userName?: string }>>({});

  // Fetch Analytics & KPI cards
  const { data: analytics } = useQuery<SupportAnalytics>({
    queryKey: ["admin-support-analytics"],
    queryFn: supportService.getAdminAnalytics,
    refetchInterval: 15000,
  });

  // Fetch tickets for Admin Inbox
  const {
    data: inboxData,
    isLoading: isLoadingInbox,
    refetch: refetchInbox,
  } = useQuery({
    queryKey: [
      "admin-tickets",
      statusFilter,
      priorityFilter,
      categoryFilter,
      searchQuery,
      sortBy,
    ],
    queryFn: () =>
      supportService.getAdminTickets({
        status: statusFilter,
        priority: priorityFilter,
        category: categoryFilter,
        search: searchQuery,
        sort: sortBy,
      }),
    refetchInterval: 5000,
  });

  const tickets = inboxData?.tickets || [];

  // Active Ticket
  const activeTicket = useMemo(() => {
    return tickets.find((t) => t.ticketId === activeTicketId) || null;
  }, [tickets, activeTicketId]);

  // Fetch ticket details (includes full customer profile & order details)
  const { data: ticketDetailsData, isLoading: isLoadingDetails } = useQuery({
    queryKey: ["admin-ticket-details", activeTicketId],
    queryFn: () =>
      activeTicketId ? supportService.getTicketDetails(activeTicketId) : Promise.resolve(null),
    enabled: Boolean(activeTicketId),
  });

  // Fetch messages thread for active ticket
  const { data: messages = [], isLoading: isLoadingMessages } = useQuery<SupportMessage[]>({
    queryKey: ["admin-ticket-messages", activeTicketId],
    queryFn: () =>
      activeTicketId ? supportService.getTicketMessages(activeTicketId) : Promise.resolve([]),
    enabled: Boolean(activeTicketId),
    refetchInterval: activeTicketId ? 3000 : false,
  });

  // Mark ticket as read by admin when selected
  useEffect(() => {
    if (activeTicketId) {
      supportService.markMessagesRead(activeTicketId).catch(() => {});
      queryClient.setQueryData(
        [
          "admin-tickets",
          statusFilter,
          priorityFilter,
          categoryFilter,
          searchQuery,
          sortBy,
        ],
        (prev: { tickets: SupportTicket[] } | undefined) => {
          if (!prev) return prev;
          return {
            ...prev,
            tickets: prev.tickets.map((t) =>
              t.ticketId === activeTicketId ? { ...t, unreadByAdmin: 0 } : t
            ),
          };
        }
      );
    }
  }, [activeTicketId, queryClient, statusFilter, priorityFilter, categoryFilter, searchQuery, sortBy]);

  // Socket.IO event listeners
  useEffect(() => {
    const socket = getSupportSocket();
    if (!socket) return;

    if (activeTicketId) {
      joinTicketRoom(activeTicketId);
    }

    const handleNewTicket = () => {
      refetchInbox();
      queryClient.invalidateQueries({ queryKey: ["admin-support-analytics"] });
    };

    const handleCustomerReplied = (data: { ticketId: string; message: SupportMessage }) => {
      if (data.ticketId === activeTicketId) {
        queryClient.setQueryData(
          ["admin-ticket-messages", activeTicketId],
          (prev: SupportMessage[] | undefined) => {
            if (!prev) return [data.message];
            if (prev.some((m) => m.messageId === data.message.messageId)) return prev;
            return [...prev, data.message];
          }
        );
        supportService.markMessagesRead(activeTicketId).catch(() => {});
      }
      refetchInbox();
      queryClient.invalidateQueries({ queryKey: ["admin-support-analytics"] });
    };

    const handleTicketUpdated = (updated: SupportTicket) => {
      refetchInbox();
      queryClient.invalidateQueries({ queryKey: ["admin-support-analytics"] });
      if (updated.ticketId === activeTicketId) {
        queryClient.setQueryData(
          ["admin-ticket-details", activeTicketId],
          (prev: { ticket: SupportTicket } | null) => {
            if (!prev) return prev;
            return { ...prev, ticket: updated };
          }
        );
      }
    };

    const handleUserTyping = (data: { ticketId: string; userName?: string; role?: string }) => {
      if (data.role === "customer") {
        setTypingMap((prev) => ({
          ...prev,
          [data.ticketId]: { isTyping: true, userName: data.userName || "Customer" },
        }));
      }
    };

    const handleUserStopTyping = (data: { ticketId: string }) => {
      setTypingMap((prev) => ({
        ...prev,
        [data.ticketId]: { isTyping: false },
      }));
    };

    socket.on("new_ticket", handleNewTicket);
    socket.on("customer_replied", handleCustomerReplied);
    socket.on("ticket_updated", handleTicketUpdated);
    socket.on("user_typing", handleUserTyping);
    socket.on("user_stop_typing", handleUserStopTyping);

    return () => {
      if (activeTicketId) {
        leaveTicketRoom(activeTicketId);
      }
      socket.off("new_ticket", handleNewTicket);
      socket.off("customer_replied", handleCustomerReplied);
      socket.off("ticket_updated", handleTicketUpdated);
      socket.off("user_typing", handleUserTyping);
      socket.off("user_stop_typing", handleUserStopTyping);
    };
  }, [activeTicketId, queryClient, refetchInbox]);

  // Send message mutation
  const sendMessageMutation = useMutation({
    mutationFn: (payload: {
      message: string;
      attachments?: { url: string; publicId?: string; name?: string; bytes?: number }[];
      isInternal?: boolean;
    }) => {
      if (!activeTicketId) throw new Error("No active ticket");
      return supportService.sendMessage(activeTicketId, payload);
    },
    onSuccess: (newMsg) => {
      queryClient.setQueryData(
        ["admin-ticket-messages", activeTicketId],
        (prev: SupportMessage[] | undefined) => {
          if (!prev) return [newMsg];
          return [...prev, newMsg];
        }
      );
      refetchInbox();
    },
  });

  const handleSendMessage = async (payload: {
    message: string;
    attachments?: { url: string; publicId?: string; name?: string; bytes?: number }[];
    isInternal?: boolean;
  }) => {
    await sendMessageMutation.mutateAsync(payload);
  };

  const handleStatusChange = async (newStatus: TicketStatus) => {
    if (!activeTicketId) return;
    try {
      await supportService.updateTicketStatus(activeTicketId, newStatus);
      refetchInbox();
      queryClient.invalidateQueries({ queryKey: ["admin-ticket-details", activeTicketId] });
      queryClient.invalidateQueries({ queryKey: ["admin-ticket-messages", activeTicketId] });
      queryClient.invalidateQueries({ queryKey: ["admin-support-analytics"] });
    } catch (err) {
      console.error(err);
    }
  };

  const handlePriorityChange = async (newPriority: TicketPriority) => {
    if (!activeTicketId) return;
    try {
      await supportService.updateTicketPriority(activeTicketId, newPriority);
      refetchInbox();
      queryClient.invalidateQueries({ queryKey: ["admin-ticket-details", activeTicketId] });
    } catch (err) {
      console.error(err);
    }
  };

  const customerProfile = ticketDetailsData?.customer;
  const linkedOrder = ticketDetailsData?.order;
  const activeTyping = activeTicketId ? typingMap[activeTicketId] : null;

  return (
    <div className="space-y-5">
      {/* ── Page Header ───────────────────────────────────────────── */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-stone-900 dark:text-stone-50">
            Support Center
          </h1>
          <p className="text-xs text-stone-500 dark:text-stone-400">
            Real-time customer live help desk, ticket resolution console & support analytics.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => {
              refetchInbox();
              queryClient.invalidateQueries({ queryKey: ["admin-support-analytics"] });
            }}
            className="h-8 gap-1.5 text-xs rounded-xl"
          >
            <RefreshCw className="h-3.5 w-3.5" /> Refresh
          </Button>
        </div>
      </div>

      {/* ── KPI Analytics Header ───────────────────────────────────── */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
        {/* Open / Total */}
        <div className="rounded-2xl border border-stone-200 bg-white p-3.5 shadow-2xs dark:border-stone-800 dark:bg-stone-900">
          <div className="flex items-center justify-between text-stone-500">
            <span className="text-[11px] font-bold uppercase tracking-wider">Total</span>
            <Inbox className="h-4 w-4 text-stone-400" />
          </div>
          <p className="mt-1 text-xl font-extrabold text-stone-900 dark:text-stone-100">
            {analytics?.totalTickets ?? "--"}
          </p>
          <span className="text-[10px] text-stone-400">All-time tickets</span>
        </div>

        {/* Waiting for Admin (Critical) */}
        <div className="rounded-2xl border border-amber-300/80 bg-amber-50/50 p-3.5 shadow-2xs dark:border-amber-900/60 dark:bg-amber-950/30">
          <div className="flex items-center justify-between text-amber-700 dark:text-amber-300">
            <span className="text-[11px] font-bold uppercase tracking-wider">Waiting</span>
            <Clock className="h-4 w-4 text-amber-500 animate-pulse" />
          </div>
          <p className="mt-1 text-xl font-extrabold text-amber-900 dark:text-amber-100">
            {analytics?.waitingForAdmin ?? "--"}
          </p>
          <span className="text-[10px] text-amber-700/80 dark:text-amber-400">Customer replies</span>
        </div>

        {/* In Progress */}
        <div className="rounded-2xl border border-stone-200 bg-white p-3.5 shadow-2xs dark:border-stone-800 dark:bg-stone-900">
          <div className="flex items-center justify-between text-stone-500">
            <span className="text-[11px] font-bold uppercase tracking-wider">In Progress</span>
            <RefreshCw className="h-4 w-4 text-indigo-500" />
          </div>
          <p className="mt-1 text-xl font-extrabold text-indigo-600 dark:text-indigo-400">
            {analytics?.inProgressTickets ?? "--"}
          </p>
          <span className="text-[10px] text-stone-400">Being handled</span>
        </div>

        {/* Urgent Pending */}
        <div className="rounded-2xl border border-rose-300/80 bg-rose-50/50 p-3.5 shadow-2xs dark:border-rose-900/60 dark:bg-rose-950/30">
          <div className="flex items-center justify-between text-rose-700 dark:text-rose-300">
            <span className="text-[11px] font-bold uppercase tracking-wider">Urgent</span>
            <AlertCircle className="h-4 w-4 text-rose-500" />
          </div>
          <p className="mt-1 text-xl font-extrabold text-rose-700 dark:text-rose-300">
            {analytics?.urgentPending ?? "--"}
          </p>
          <span className="text-[10px] text-rose-600/80 dark:text-rose-400">High priority</span>
        </div>

        {/* Resolved Today */}
        <div className="rounded-2xl border border-stone-200 bg-white p-3.5 shadow-2xs dark:border-stone-800 dark:bg-stone-900">
          <div className="flex items-center justify-between text-stone-500">
            <span className="text-[11px] font-bold uppercase tracking-wider">Resolved Today</span>
            <CheckCircle2 className="h-4 w-4 text-emerald-500" />
          </div>
          <p className="mt-1 text-xl font-extrabold text-emerald-600 dark:text-emerald-400">
            {analytics?.resolvedToday ?? "--"}
          </p>
          <span className="text-[10px] text-stone-400">Completed today</span>
        </div>

        {/* Avg Resolution Hours */}
        <div className="rounded-2xl border border-stone-200 bg-white p-3.5 shadow-2xs dark:border-stone-800 dark:bg-stone-900">
          <div className="flex items-center justify-between text-stone-500">
            <span className="text-[11px] font-bold uppercase tracking-wider">Avg Resolution</span>
            <TrendingUp className="h-4 w-4 text-teal-500" />
          </div>
          <p className="mt-1 text-xl font-extrabold text-stone-900 dark:text-stone-100">
            {analytics?.avgResolutionHours ? `${analytics.avgResolutionHours}h` : "--"}
          </p>
          <span className="text-[10px] text-stone-400">Average response</span>
        </div>
      </div>

      {/* ── Main Split Help Desk Console ──────────────────────────── */}
      <div className="flex h-[76vh] min-h-[580px] w-full overflow-hidden rounded-3xl border border-stone-200/90 bg-white shadow-xl dark:border-stone-800/90 dark:bg-stone-900">
        {/* ── LEFT INBOX: Ticket List with Filters ──────────────────── */}
        <div
          className={`flex w-full flex-col border-r border-stone-200/80 bg-stone-50/50 dark:border-stone-800/80 dark:bg-stone-950/50 md:w-80 lg:w-[380px] shrink-0 ${
            activeTicketId ? "hidden md:flex" : "flex"
          }`}
        >
          {/* Inbox Search & Filter Header */}
          <div className="shrink-0 p-3.5 border-b border-stone-200/80 dark:border-stone-800/80 bg-white/90 dark:bg-stone-900/90 backdrop-blur-xs space-y-2.5">
            {/* Search Input */}
            <div className="relative">
              <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-stone-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search ticket ID, customer or topic..."
                className="w-full rounded-xl border border-stone-200 bg-white py-1.5 pl-9 pr-3 text-xs text-stone-900 placeholder:text-stone-400 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500/20 dark:border-stone-800 dark:bg-stone-950 dark:text-stone-100"
              />
            </div>

            {/* Quick Filter Tabs */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
              {(
                [
                  { id: "all", label: "All" },
                  { id: "waiting_for_admin", label: "Waiting" },
                  { id: "in_progress", label: "Active" },
                  { id: "resolved", label: "Resolved" },
                  { id: "closed", label: "Closed" },
                ] as const
              ).map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setStatusFilter(tab.id)}
                  className={`rounded-lg px-2.5 py-1 text-xs font-bold transition whitespace-nowrap ${
                    statusFilter === tab.id
                      ? tab.id === "waiting_for_admin"
                        ? "bg-amber-500 text-white shadow-xs"
                        : "bg-emerald-600 text-white shadow-xs"
                      : "bg-white text-stone-600 hover:bg-stone-100 dark:bg-stone-800 dark:text-stone-400 dark:hover:bg-stone-700"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Priority & Sort Controls */}
            <div className="grid grid-cols-2 gap-2 text-[11px]">
              <select
                value={priorityFilter}
                onChange={(e) => setPriorityFilter(e.target.value)}
                className="rounded-lg border border-stone-200 bg-white px-2 py-1 text-stone-700 dark:border-stone-800 dark:bg-stone-950 dark:text-stone-300"
              >
                <option value="all">Priority: All</option>
                <option value="urgent">Urgent Only</option>
                <option value="high">High Only</option>
                <option value="medium">Medium</option>
                <option value="low">Low</option>
              </select>

              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as "newest" | "oldest" | "unread" | "priority")}
                className="rounded-lg border border-stone-200 bg-white px-2 py-1 text-stone-700 dark:border-stone-800 dark:bg-stone-950 dark:text-stone-300"
              >
                <option value="newest">Sort: Newest</option>
                <option value="unread">Sort: Unread</option>
                <option value="priority">Sort: Priority</option>
                <option value="oldest">Sort: Oldest</option>
              </select>
            </div>
          </div>

          {/* Tickets List */}
          <div className="flex-1 overflow-y-auto p-3 space-y-2.5 scrollbar-thin">
            {isLoadingInbox ? (
              <div className="flex h-40 items-center justify-center">
                <Loader2 className="h-5 w-5 animate-spin text-emerald-600" />
              </div>
            ) : tickets.length === 0 ? (
              <div className="flex flex-col items-center justify-center p-8 text-center text-xs text-stone-500">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-stone-100 text-stone-400 dark:bg-stone-800 dark:text-stone-500 mb-2">
                  <Inbox className="h-6 w-6" />
                </div>
                <p className="font-bold text-stone-800 dark:text-stone-200">No tickets found</p>
                <p className="mt-1 text-[11px] text-stone-400">All customer inquiries are up to date.</p>
              </div>
            ) : (
              tickets.map((t) => (
                <TicketCard
                  key={t.ticketId}
                  ticket={t}
                  isSelected={t.ticketId === activeTicketId}
                  onClick={() => setActiveTicketId(t.ticketId)}
                  unreadCount={t.unreadByAdmin}
                />
              ))
            )}
          </div>
        </div>

        {/* ── RIGHT CONVERSATION & METADATA PANE ─────────────────────── */}
        <div
          className={`flex-1 flex-col overflow-hidden bg-white dark:bg-stone-900 ${
            activeTicketId ? "flex" : "hidden md:flex"
          }`}
        >
          {activeTicket ? (
            <div className="flex h-full flex-col lg:flex-row overflow-hidden">
              {/* Center Chat Thread */}
              <div className="flex flex-1 flex-col overflow-hidden border-b lg:border-b-0 lg:border-r border-stone-200 dark:border-stone-800">
                {/* Admin Status & Quick Action Bar */}
                <div className="flex shrink-0 flex-wrap items-center justify-between gap-2 border-b border-stone-200/90 bg-stone-50/70 px-4 py-2 dark:border-stone-800/90 dark:bg-stone-950/60">
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-bold text-stone-500">Status:</span>
                    <select
                      value={activeTicket.status}
                      onChange={(e) => handleStatusChange(e.target.value as TicketStatus)}
                      className="rounded-lg border border-stone-200 bg-white px-2 py-1 text-xs font-bold text-stone-900 dark:border-stone-800 dark:bg-stone-900 dark:text-stone-100"
                    >
                      <option value="open">Open</option>
                      <option value="waiting_for_admin">Waiting for Support</option>
                      <option value="in_progress">In Progress</option>
                      <option value="resolved">Resolved</option>
                      <option value="closed">Closed</option>
                    </select>

                    <span className="text-[11px] font-bold text-stone-500 ml-2">Priority:</span>
                    <select
                      value={activeTicket.priority}
                      onChange={(e) => handlePriorityChange(e.target.value as TicketPriority)}
                      className="rounded-lg border border-stone-200 bg-white px-2 py-1 text-xs font-bold capitalize text-stone-900 dark:border-stone-800 dark:bg-stone-900 dark:text-stone-100"
                    >
                      <option value="low">Low</option>
                      <option value="medium">Medium</option>
                      <option value="high">High</option>
                      <option value="urgent">Urgent</option>
                    </select>
                  </div>

                  {/* Quick canned replies selector */}
                  <div className="flex items-center gap-1.5">
                    <select
                      onChange={(e) => {
                        const template = CANNED_REPLIES.find((r) => r.label === e.target.value);
                        if (template) {
                          handleSendMessage({
                            message: template.text,
                            isInternal: false,
                          });
                        }
                        e.target.value = "";
                      }}
                      defaultValue=""
                      className="rounded-lg border border-stone-200 bg-white px-2.5 py-1 text-xs font-semibold text-stone-700 dark:border-stone-800 dark:bg-stone-900 dark:text-stone-300"
                    >
                      <option value="" disabled>
                        ⚡ Insert Quick Reply...
                      </option>
                      {CANNED_REPLIES.map((r) => (
                        <option key={r.label} value={r.label}>
                          {r.label}
                        </option>
                      ))}
                    </select>

                    {activeTicket.status !== "resolved" && activeTicket.status !== "closed" && (
                      <Button
                        type="button"
                        size="sm"
                        onClick={() => handleStatusChange("resolved")}
                        className="h-7 text-[11px] rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold"
                      >
                        Resolve
                      </Button>
                    )}
                  </div>
                </div>

                {/* Live Chat Pane */}
                <ChatWindow
                  ticket={activeTicket}
                  messages={messages}
                  currentUserId={user?.userId || "admin"}
                  currentUserRole="admin"
                  onSendMessage={handleSendMessage}
                  onStatusChange={handleStatusChange}
                  isTyping={activeTyping?.isTyping}
                  typingUserName={activeTyping?.userName}
                  isLoading={isLoadingMessages}
                />
              </div>

              {/* Right Sidebar: Customer Profile & Order Inspector */}
              <div className="w-full lg:w-72 shrink-0 overflow-y-auto bg-stone-50/70 p-4 dark:bg-stone-950/50 space-y-4 scrollbar-thin">
                {/* Customer Info Card */}
                <div className="rounded-2xl border border-stone-200 bg-white p-4 shadow-2xs dark:border-stone-800 dark:bg-stone-900 space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="relative flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-full bg-emerald-500/10 text-emerald-700 font-bold text-xs">
                      {customerProfile?.avatar ? (
                        <Image
                          src={customerProfile.avatar}
                          alt={customerProfile.name}
                          width={40}
                          height={40}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        customerProfile?.name?.charAt(0).toUpperCase() || "C"
                      )}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <p className="truncate text-xs font-bold text-stone-900 dark:text-stone-100">
                          {customerProfile?.name || "Customer"}
                        </p>
                        {customerProfile?.isVerifiedCustomer && (
                          <ShieldCheck className="h-3.5 w-3.5 text-blue-500" />
                        )}
                      </div>
                      <p className="truncate text-[11px] text-stone-400">
                        {customerProfile?.email}
                      </p>
                    </div>
                  </div>

                  {customerProfile?.mobile && (
                    <div className="flex items-center gap-2 text-xs text-stone-600 dark:text-stone-300">
                      <Phone className="h-3.5 w-3.5 text-stone-400" />
                      <span>{customerProfile.mobile}</span>
                    </div>
                  )}

                  <div className="pt-2 border-t border-stone-100 dark:border-stone-800 text-[11px] text-stone-500 flex justify-between">
                    <span>Total Orders:</span>
                    <span className="font-bold text-stone-800 dark:text-stone-200">
                      {customerProfile?.totalOrders ?? 0}
                    </span>
                  </div>
                </div>

                {/* Linked Order Card (If attached) */}
                {linkedOrder && (
                  <div className="rounded-2xl border border-stone-200 bg-white p-4 shadow-2xs dark:border-stone-800 dark:bg-stone-900 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-stone-400">
                        Linked Order
                      </span>
                      <Link
                        href={`/admin/orders`}
                        className="text-[11px] font-bold text-emerald-600 hover:underline inline-flex items-center gap-1"
                      >
                        View <ExternalLink className="h-2.5 w-2.5" />
                      </Link>
                    </div>

                    <p className="font-mono text-xs font-bold text-stone-900 dark:text-stone-100">
                      #{linkedOrder.invoiceNumber || linkedOrder.orderId}
                    </p>

                    <div className="text-xs space-y-1 pt-1">
                      <div className="flex justify-between text-stone-600 dark:text-stone-400">
                        <span>Amount:</span>
                        <span className="font-bold text-stone-900 dark:text-stone-100">
                          ₹{linkedOrder.grandTotal}
                        </span>
                      </div>
                      <div className="flex justify-between text-stone-600 dark:text-stone-400">
                        <span>Status:</span>
                        <span className="font-bold uppercase text-[10px] text-emerald-600">
                          {linkedOrder.status}
                        </span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Internal Notes History */}
                {activeTicket.internalNotes && activeTicket.internalNotes.length > 0 && (
                  <div className="rounded-2xl border border-amber-200 bg-amber-50/60 p-3.5 dark:border-amber-900/60 dark:bg-amber-950/30 space-y-2">
                    <div className="flex items-center gap-1.5 text-xs font-bold text-amber-900 dark:text-amber-200">
                      <Lock className="h-3.5 w-3.5" />
                      <span>Internal Notes ({activeTicket.internalNotes.length})</span>
                    </div>

                    <div className="space-y-2 max-h-48 overflow-y-auto pr-1 scrollbar-thin">
                      {activeTicket.internalNotes.map((note) => (
                        <div
                          key={note.noteId}
                          className="rounded-xl bg-white p-2.5 shadow-2xs border border-amber-200/80 dark:bg-stone-900 dark:border-amber-900/40 text-[11px]"
                        >
                          <div className="flex items-center justify-between text-stone-400 mb-1">
                            <span className="font-bold text-amber-800 dark:text-amber-300">
                              {note.adminName}
                            </span>
                            <span className="text-[9px]">
                              {new Date(note.createdAt).toLocaleDateString()}
                            </span>
                          </div>
                          <p className="text-stone-700 dark:text-stone-300">{note.note}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          ) : (
            /* Empty State */
            <div className="flex h-full flex-col items-center justify-center p-8 text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400 mb-3 shadow-sm">
                <LifeBuoy className="h-8 w-8" />
              </div>
              <h3 className="text-base font-bold text-stone-900 dark:text-stone-100">
                Support Desk Inbox
              </h3>
              <p className="mt-1 max-w-sm text-xs text-stone-500 dark:text-stone-400">
                Select a ticket from the left panel to review customer messages, view order attachments, reply or mark as resolved.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
