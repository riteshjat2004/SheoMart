"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  LifeBuoy,
  Plus,
  Search,
  MessageSquare,
  ShieldCheck,
  Headphones,
  Sparkles,
  ArrowLeft,
  Loader2,
  Clock,
  CheckCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { supportService } from "@/services/support.service";
import { TicketCard } from "./TicketCard";
import { ChatWindow } from "./ChatWindow";
import { NewTicketModal } from "./NewTicketModal";
import {
  getSupportSocket,
  joinTicketRoom,
  leaveTicketRoom,
} from "@/lib/socket";
import type {
  SupportTicket,
  SupportMessage,
  CustomerOrderOption,
} from "@/types/support";

interface CustomerSupportCenterProps {
  currentUserId: string;
}

export function CustomerSupportCenter({ currentUserId }: CustomerSupportCenterProps) {
  const queryClient = useQueryClient();
  const [activeTicketId, setActiveTicketId] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "resolved" | "closed">("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [typingMap, setTypingMap] = useState<Record<string, { isTyping: boolean; userName?: string }>>({});

  // Fetch customer's tickets
  const {
    data: ticketsData,
    isLoading: isLoadingTickets,
    refetch: refetchTickets,
  } = useQuery({
    queryKey: ["customer-tickets", statusFilter, searchQuery],
    queryFn: () =>
      supportService.getCustomerTickets({
        status: statusFilter,
        search: searchQuery,
      }),
    refetchInterval: 5000, // automatic background sync
  });

  const tickets = ticketsData?.tickets || [];
  const unreadTotal = ticketsData?.unreadTotal || 0;

  // Active ticket object
  const activeTicket = useMemo(() => {
    return tickets.find((t) => t.ticketId === activeTicketId) || null;
  }, [tickets, activeTicketId]);

  // Fetch messages for active ticket
  const {
    data: messagesData,
    isLoading: isLoadingMessages,
  } = useQuery({
    queryKey: ["ticket-messages", activeTicketId],
    queryFn: () =>
      activeTicketId ? supportService.getTicketMessages(activeTicketId) : Promise.resolve([]),
    enabled: Boolean(activeTicketId),
    refetchInterval: activeTicketId ? 3000 : false,
  });

  const messages = messagesData || [];

  // Fetch customer's orders for order dropdown
  const { data: customerOrders = [] } = useQuery<CustomerOrderOption[]>({
    queryKey: ["customer-orders-support"],
    queryFn: supportService.getCustomerOrders,
    staleTime: 1000 * 60 * 5,
  });

  // Mark ticket as read when active
  useEffect(() => {
    if (activeTicketId) {
      supportService.markMessagesRead(activeTicketId).catch(() => {});
      queryClient.setQueryData(
        ["customer-tickets", statusFilter, searchQuery],
        (prev: { tickets: SupportTicket[]; unreadTotal: number } | undefined) => {
          if (!prev) return prev;
          return {
            ...prev,
            tickets: prev.tickets.map((t) =>
              t.ticketId === activeTicketId ? { ...t, unreadByCustomer: 0 } : t
            ),
          };
        }
      );
    }
  }, [activeTicketId, queryClient, statusFilter, searchQuery]);

  // Socket.IO real-time hooks
  useEffect(() => {
    const socket = getSupportSocket();
    if (!socket) return;

    if (activeTicketId) {
      joinTicketRoom(activeTicketId);
    }

    const handleNewMessage = (data: { ticketId: string; message: SupportMessage }) => {
      if (data.ticketId === activeTicketId) {
        queryClient.setQueryData(
          ["ticket-messages", activeTicketId],
          (prev: SupportMessage[] | undefined) => {
            if (!prev) return [data.message];
            if (prev.some((m) => m.messageId === data.message.messageId)) return prev;
            return [...prev, data.message];
          }
        );
        supportService.markMessagesRead(activeTicketId).catch(() => {});
      }
      refetchTickets();
    };

    const handleTicketUpdated = (updatedTicket: SupportTicket) => {
      queryClient.setQueryData(
        ["customer-tickets", statusFilter, searchQuery],
        (prev: { tickets: SupportTicket[] } | undefined) => {
          if (!prev) return prev;
          return {
            ...prev,
            tickets: prev.tickets.map((t) =>
              t.ticketId === updatedTicket.ticketId ? updatedTicket : t
            ),
          };
        }
      );
    };

    const handleUserTyping = (data: { ticketId: string; userName?: string; role?: string }) => {
      if (data.role === "platform_admin") {
        setTypingMap((prev) => ({
          ...prev,
          [data.ticketId]: { isTyping: true, userName: data.userName || "Support Agent" },
        }));
      }
    };

    const handleUserStopTyping = (data: { ticketId: string }) => {
      setTypingMap((prev) => ({
        ...prev,
        [data.ticketId]: { isTyping: false },
      }));
    };

    socket.on("new_message", handleNewMessage);
    socket.on("ticket_updated", handleTicketUpdated);
    socket.on("user_typing", handleUserTyping);
    socket.on("user_stop_typing", handleUserStopTyping);

    return () => {
      if (activeTicketId) {
        leaveTicketRoom(activeTicketId);
      }
      socket.off("new_message", handleNewMessage);
      socket.off("ticket_updated", handleTicketUpdated);
      socket.off("user_typing", handleUserTyping);
      socket.off("user_stop_typing", handleUserStopTyping);
    };
  }, [activeTicketId, queryClient, refetchTickets, statusFilter, searchQuery]);

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
        ["ticket-messages", activeTicketId],
        (prev: SupportMessage[] | undefined) => {
          if (!prev) return [newMsg];
          return [...prev, newMsg];
        }
      );
      refetchTickets();
    },
  });

  const handleSendMessage = async (payload: {
    message: string;
    attachments?: { url: string; publicId?: string; name?: string; bytes?: number }[];
    isInternal?: boolean;
  }) => {
    await sendMessageMutation.mutateAsync(payload);
  };

  const handleStatusChange = async (newStatus: "open" | "in_progress" | "resolved" | "closed") => {
    if (!activeTicketId) return;
    try {
      const updated = await supportService.updateTicketStatus(activeTicketId, newStatus);
      queryClient.setQueryData(
        ["customer-tickets", statusFilter, searchQuery],
        (prev: { tickets: SupportTicket[]; total: number; page: number; totalPages: number; unreadTotal: number } | undefined) => {
          if (!prev) return prev;
          return {
            ...prev,
            tickets: prev.tickets.map((t) =>
              t.ticketId === activeTicketId ? { ...t, ...(updated || {}), status: updated?.status ?? newStatus } : t
            ),
          };
        }
      );
      refetchTickets();
      queryClient.invalidateQueries({ queryKey: ["ticket-messages", activeTicketId] });
      queryClient.invalidateQueries({ queryKey: ["customer-tickets"] });
    } catch (err) {
      console.error("Failed to update ticket status:", err);
    }
  };

  const handleTicketCreated = (newTicket: SupportTicket) => {
    queryClient.setQueryData(
      ["customer-tickets", statusFilter, searchQuery],
      (prev: { tickets: SupportTicket[]; total: number } | undefined) => {
        if (!prev) return { tickets: [newTicket], total: 1, page: 1, totalPages: 1, unreadTotal: 0 };
        return {
          ...prev,
          tickets: [newTicket, ...prev.tickets],
          total: prev.total + 1,
        };
      }
    );
    setActiveTicketId(newTicket.ticketId);
  };

  const activeTypingInfo = activeTicketId ? typingMap[activeTicketId] : null;

  return (
    <div className="relative flex h-[82vh] min-h-[580px] w-full overflow-hidden rounded-3xl border border-stone-200/80 bg-white shadow-xl dark:border-stone-800/80 dark:bg-stone-900">
      {/* ── LEFT PANEL: Tickets List ──────────────────────────────── */}
      <div
        className={`flex w-full flex-col border-r border-stone-200/80 bg-stone-50/50 dark:border-stone-800/80 dark:bg-stone-950/50 md:w-80 lg:w-96 shrink-0 transition-all ${
          activeTicketId ? "hidden md:flex" : "flex"
        }`}
      >
        {/* Top Header & New Ticket Button */}
        <div className="shrink-0 p-4 border-b border-stone-200/80 dark:border-stone-800/80 bg-white/80 dark:bg-stone-900/80 backdrop-blur-xs">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                <LifeBuoy className="h-4 w-4" />
              </div>
              <h2 className="text-sm font-bold tracking-tight text-stone-900 dark:text-stone-100">
                Help & Support
              </h2>
            </div>

            <Button
              type="button"
              size="sm"
              onClick={() => setIsModalOpen(true)}
              className="h-8 rounded-xl bg-emerald-600 px-3 text-xs font-bold text-white shadow-xs hover:bg-emerald-700 gap-1.5"
            >
              <Plus className="h-3.5 w-3.5" /> New Ticket
            </Button>
          </div>

          {/* Search Box */}
          <div className="relative mb-3">
            <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-stone-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search tickets or keywords..."
              className="w-full rounded-xl border border-stone-200 bg-white py-1.5 pl-9 pr-3 text-xs text-stone-900 placeholder:text-stone-400 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500/20 dark:border-stone-800 dark:bg-stone-950 dark:text-stone-100"
            />
          </div>

          {/* Filter Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
            {(
              [
                { id: "all", label: "All" },
                { id: "active", label: "Active" },
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
                    ? "bg-emerald-600 text-white shadow-2xs"
                    : "bg-white text-stone-600 hover:bg-stone-100 dark:bg-stone-800 dark:text-stone-400 dark:hover:bg-stone-700"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Tickets Scrollable List */}
        <div className="flex-1 overflow-y-auto p-3 space-y-2.5 scrollbar-thin">
          {isLoadingTickets ? (
            <div className="flex h-40 items-center justify-center">
              <Loader2 className="h-5 w-5 animate-spin text-emerald-600" />
            </div>
          ) : tickets.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-8 text-center text-xs text-stone-500">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400 mb-2">
                <MessageSquare className="h-6 w-6" />
              </div>
              <p className="font-bold text-stone-800 dark:text-stone-200">No support tickets found</p>
              <p className="mt-1 text-[11px] text-stone-400">
                {searchQuery
                  ? "Try different keywords"
                  : "Have a question or order issue? Start a conversation with us."}
              </p>
              {!searchQuery && (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setIsModalOpen(true)}
                  className="mt-4 gap-1.5 text-xs text-emerald-600 border-emerald-300 dark:border-emerald-800"
                >
                  <Plus className="h-3.5 w-3.5" /> Create Request
                </Button>
              )}
            </div>
          ) : (
            tickets.map((t) => (
              <TicketCard
                key={t.ticketId}
                ticket={t}
                isSelected={t.ticketId === activeTicketId}
                onClick={() => setActiveTicketId(t.ticketId)}
                unreadCount={t.unreadByCustomer}
              />
            ))
          )}
        </div>
      </div>

      {/* ── RIGHT PANEL: Conversation Window or Empty State ───────── */}
      <div
        className={`flex-1 flex-col overflow-hidden bg-white dark:bg-stone-900 ${
          activeTicketId ? "flex" : "hidden md:flex"
        }`}
      >
        {activeTicket ? (
          <>
            {/* Mobile Back Button Bar */}
            <div className="flex items-center gap-2 border-b border-stone-200/80 px-4 py-2 md:hidden bg-stone-50 dark:border-stone-800 dark:bg-stone-950">
              <button
                type="button"
                onClick={() => setActiveTicketId(null)}
                className="flex items-center gap-1 text-xs font-semibold text-stone-600 hover:text-stone-900 dark:text-stone-400"
              >
                <ArrowLeft className="h-3.5 w-3.5" /> Back to tickets
              </button>
            </div>

            <ChatWindow
              ticket={activeTicket}
              messages={messages}
              currentUserId={currentUserId}
              currentUserRole="customer"
              onSendMessage={handleSendMessage}
              onStatusChange={handleStatusChange}
              isTyping={activeTypingInfo?.isTyping}
              typingUserName={activeTypingInfo?.userName}
              isLoading={isLoadingMessages}
            />
          </>
        ) : (
          /* Empty State */
          <div className="flex h-full flex-col items-center justify-center p-8 text-center">
            <div className="relative mb-4 flex h-20 w-20 items-center justify-center rounded-3xl bg-linear-to-tr from-emerald-500 to-teal-600 text-white shadow-xl shadow-emerald-500/20">
              <Headphones className="h-10 w-10" />
              <span className="absolute -top-1 -right-1 flex h-6 w-6 items-center justify-center rounded-full bg-white text-emerald-600 shadow-md text-xs font-bold dark:bg-stone-900">
                ✨
              </span>
            </div>

            <h3 className="text-lg font-extrabold tracking-tight text-stone-900 dark:text-stone-100">
              SheoMart Customer Help Desk
            </h3>
            <p className="mt-1.5 max-w-sm text-xs leading-relaxed text-stone-500 dark:text-stone-400">
              Connect directly with our support specialists. We are here to assist you with deliveries, order status, refunds, or general queries.
            </p>

            <Button
              type="button"
              onClick={() => setIsModalOpen(true)}
              className="mt-6 gap-2 rounded-xl bg-emerald-600 px-5 py-2.5 text-xs font-bold text-white shadow-md hover:bg-emerald-700 active:scale-95 transition"
            >
              <Plus className="h-4 w-4" /> Start New Support Request
            </Button>

            {/* Quick Info Grid */}
            <div className="mt-10 grid max-w-lg grid-cols-1 gap-3 sm:grid-cols-3 text-left">
              <div className="rounded-2xl border border-stone-200/80 bg-stone-50/60 p-3.5 dark:border-stone-800/80 dark:bg-stone-950/60">
                <Clock className="h-4 w-4 text-emerald-600 dark:text-emerald-400 mb-1.5" />
                <p className="text-xs font-bold text-stone-800 dark:text-stone-200">Fast Response</p>
                <p className="text-[11px] text-stone-500 dark:text-stone-400 mt-0.5">Average reply in under 15 minutes</p>
              </div>

              <div className="rounded-2xl border border-stone-200/80 bg-stone-50/60 p-3.5 dark:border-stone-800/80 dark:bg-stone-950/60">
                <ShieldCheck className="h-4 w-4 text-emerald-600 dark:text-emerald-400 mb-1.5" />
                <p className="text-xs font-bold text-stone-800 dark:text-stone-200">Direct Resolution</p>
                <p className="text-[11px] text-stone-500 dark:text-stone-400 mt-0.5">Instant refunds & delivery tracking</p>
              </div>

              <div className="rounded-2xl border border-stone-200/80 bg-stone-50/60 p-3.5 dark:border-stone-800/80 dark:bg-stone-950/60">
                <Sparkles className="h-4 w-4 text-emerald-600 dark:text-emerald-400 mb-1.5" />
                <p className="text-xs font-bold text-stone-800 dark:text-stone-200">Always Available</p>
                <p className="text-[11px] text-stone-500 dark:text-stone-400 mt-0.5">Sheopur marketplace help desk</p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ── New Support Request Multi-Step Modal ─────────────────── */}
      <NewTicketModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onCreated={handleTicketCreated}
        orders={customerOrders}
      />
    </div>
  );
}
