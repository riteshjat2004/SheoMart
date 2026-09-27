"use client";

import { useEffect, useRef, useState, useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Send,
  Paperclip,
  Check,
  CheckCheck,
  X,
  ExternalLink,
  ShieldAlert,
  Lock,
  Loader2,
  RefreshCw,
  Image as ImageIcon,
  CheckCircle2,
  Clock,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { supportService } from "@/services/support.service";
import {
  emitUserTyping,
  emitUserStopTyping,
} from "@/lib/socket";
import {
  SUPPORT_CATEGORY_META,
  type SupportTicket,
  type SupportMessage,
  type SupportAttachment,
} from "@/types/support";

interface ChatWindowProps {
  ticket: SupportTicket;
  messages: SupportMessage[];
  currentUserId: string;
  currentUserRole: "customer" | "admin";
  onSendMessage: (payload: {
    message: string;
    attachments?: SupportAttachment[];
    isInternal?: boolean;
  }) => Promise<void>;
  onStatusChange?: (newStatus: "open" | "in_progress" | "resolved" | "closed") => Promise<void>;
  isTyping?: boolean;
  typingUserName?: string;
  isLoading?: boolean;
}

function formatMessageTime(dateString?: string): string {
  if (!dateString) return "";
  const d = new Date(dateString);
  return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

function formatDateSeparator(dateString: string): string {
  const d = new Date(dateString);
  const now = new Date();
  const isToday =
    d.getDate() === now.getDate() &&
    d.getMonth() === now.getMonth() &&
    d.getFullYear() === now.getFullYear();

  const yesterday = new Date(now);
  yesterday.setDate(now.getDate() - 1);
  const isYesterday =
    d.getDate() === yesterday.getDate() &&
    d.getMonth() === yesterday.getMonth() &&
    d.getFullYear() === yesterday.getFullYear();

  if (isToday) return "Today";
  if (isYesterday) return "Yesterday";
  return d.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: d.getFullYear() !== now.getFullYear() ? "numeric" : undefined,
  });
}

export function ChatWindow({
  ticket,
  messages,
  currentUserId,
  currentUserRole,
  onSendMessage,
  onStatusChange,
  isTyping = false,
  typingUserName = "Support Agent",
  isLoading = false,
}: ChatWindowProps) {
  const [inputText, setInputText] = useState("");
  const [attachments, setAttachments] = useState<SupportAttachment[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [isInternalMode, setIsInternalMode] = useState(false);
  const [activeImagePreview, setActiveImagePreview] = useState<string | null>(null);

  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Group messages by day
  const groupedMessages = useMemo(() => {
    const groups: { [dateStr: string]: SupportMessage[] } = {};
    for (const msg of messages) {
      const dateKey = new Date(msg.createdAt).toDateString();
      if (!groups[dateKey]) groups[dateKey] = [];
      groups[dateKey].push(msg);
    }
    return Object.entries(groups).map(([dateStr, msgs]) => ({
      dateLabel: formatDateSeparator(msgs[0]?.createdAt || dateStr),
      messages: msgs,
    }));
  }, [messages]);

  // Auto scroll to bottom of chat container WITHOUT scrolling the window/page
  const scrollToBottom = (behavior: ScrollBehavior = "smooth") => {
    const container = messagesContainerRef.current;
    if (container) {
      container.scrollTo({
        top: container.scrollHeight,
        behavior,
      });
    }
  };

  useEffect(() => {
    scrollToBottom("instant");
  }, [ticket.ticketId]);

  useEffect(() => {
    scrollToBottom("smooth");
  }, [messages.length, isTyping]);

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInputText(e.target.value);

    // Emit typing indicator
    emitUserTyping(ticket.ticketId, currentUserRole === "admin" ? "Support Agent" : "Customer");
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => {
      emitUserStopTyping(ticket.ticketId);
    }, 2000);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setIsUploading(true);
    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        if (file.size > 5 * 1024 * 1024) continue;
        const uploaded = await supportService.uploadAttachment(file);
        setAttachments((prev) => [...prev, uploaded]);
      }
    } catch (err) {
      console.error("Upload error", err);
    } finally {
      setIsUploading(false);
      e.target.value = "";
    }
  };

  const handleSend = async () => {
    if (!inputText.trim() && attachments.length === 0) return;
    if (isSending) return;

    setIsSending(true);
    emitUserStopTyping(ticket.ticketId);

    try {
      await onSendMessage({
        message: inputText.trim() || (attachments.length > 0 ? "Shared attachments" : ""),
        attachments,
        isInternal: isInternalMode,
      });

      setInputText("");
      setAttachments([]);
      setIsInternalMode(false);
    } catch (err) {
      console.error("Failed to send message", err);
    } finally {
      setIsSending(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const isClosed = ticket.status === "closed";
  const isResolved = ticket.status === "resolved";

  return (
    <div className="flex h-full flex-col bg-stone-50/50 dark:bg-stone-950/40">
      {/* ── Chat Header ─────────────────────────────────────────── */}
      <div className="flex shrink-0 items-center justify-between border-b border-stone-200/90 bg-white/95 px-5 py-3.5 backdrop-blur-md dark:border-stone-800/90 dark:bg-stone-900/95">
        <div className="flex items-center gap-3 min-w-0">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400 font-mono text-xs font-bold border border-emerald-500/20">
            SM
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs font-bold text-stone-900 dark:text-stone-100">
                {ticket.ticketId}
              </span>
              <span className="rounded-md bg-stone-100 px-2 py-0.5 text-[10px] font-semibold text-stone-600 dark:bg-stone-800 dark:text-stone-300">
                {SUPPORT_CATEGORY_META[ticket.category]?.label || ticket.category}
              </span>
            </div>
            <h3 className="truncate text-xs font-medium text-stone-500 dark:text-stone-400">
              {ticket.subject}
            </h3>
          </div>
        </div>

        {/* Right Header Actions */}
        <div className="flex items-center gap-2">
          {ticket.orderId && (
            <Link
              href={currentUserRole === "admin" ? `/admin/orders` : `/orders/${ticket.orderId}`}
              className="inline-flex items-center gap-1 rounded-lg border border-stone-200 bg-stone-50 px-2.5 py-1 text-[11px] font-semibold text-stone-700 hover:bg-stone-100 dark:border-stone-800 dark:bg-stone-800 dark:text-stone-300 dark:hover:bg-stone-700 transition"
            >
              Order #{ticket.orderId.slice(0, 8)}
              <ExternalLink className="h-3 w-3" />
            </Link>
          )}

          {/* Quick resolve / reopen for customer */}
          {currentUserRole === "customer" && isResolved && onStatusChange && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => onStatusChange("open")}
              className="h-8 gap-1.5 text-xs text-amber-600 dark:text-amber-400 border-amber-300 dark:border-amber-800 hover:bg-amber-50 dark:hover:bg-amber-950/40"
            >
              <RefreshCw className="h-3.5 w-3.5" /> Reopen Ticket
            </Button>
          )}

          {currentUserRole === "customer" && !isClosed && !isResolved && onStatusChange && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => onStatusChange("resolved")}
              className="h-8 gap-1.5 text-xs text-emerald-600 dark:text-emerald-400 border-emerald-300 dark:border-emerald-800 hover:bg-emerald-50 dark:hover:bg-emerald-950/40"
            >
              <CheckCircle2 className="h-3.5 w-3.5" /> Mark Resolved
            </Button>
          )}
        </div>
      </div>

      {/* ── Chat Messages Thread ─────────────────────────────────── */}
      <div ref={messagesContainerRef} className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 scrollbar-thin">
        {isLoading ? (
          <div className="flex h-full items-center justify-center">
            <Loader2 className="h-6 w-6 animate-spin text-emerald-600" />
          </div>
        ) : (
          <>
            {/* Ticket created header info card */}
            <div className="mx-auto max-w-md rounded-2xl border border-stone-200/80 bg-white/70 p-4 text-center text-xs shadow-2xs backdrop-blur-xs dark:border-stone-800/80 dark:bg-stone-900/60">
              <div className="mx-auto mb-2 flex h-8 w-8 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                <Sparkles className="h-4 w-4" />
              </div>
              <p className="font-bold text-stone-900 dark:text-stone-100">
                Ticket created on {new Date(ticket.createdAt).toLocaleDateString()}
              </p>
              <p className="mt-1 text-[11px] text-stone-500 dark:text-stone-400">
                Category: <span className="font-semibold text-stone-700 dark:text-stone-300">{SUPPORT_CATEGORY_META[ticket.category]?.label}</span> • Priority: <span className="font-semibold capitalize text-stone-700 dark:text-stone-300">{ticket.priority}</span>
              </p>
            </div>

            {/* Conversation message groups */}
            {groupedMessages.map((group) => (
              <div key={group.dateLabel} className="space-y-3">
                {/* Date separator */}
                <div className="flex items-center justify-center my-3">
                  <span className="rounded-full bg-stone-200/70 px-3 py-0.5 text-[10px] font-bold text-stone-600 dark:bg-stone-800 dark:text-stone-400">
                    {group.dateLabel}
                  </span>
                </div>

                {/* Messages list */}
                {group.messages.map((msg) => {
                  const isMine =
                    currentUserRole === "admin"
                      ? msg.senderRole === "admin"
                      : msg.senderRole === "customer";

                  if (msg.isInternal) {
                    // Admin internal note
                    return (
                      <div
                        key={msg.messageId}
                        className="mx-auto max-w-lg rounded-2xl border border-amber-300/80 bg-amber-50/80 p-3.5 shadow-2xs dark:border-amber-900/60 dark:bg-amber-950/40"
                      >
                        <div className="flex items-center gap-1.5 text-xs font-bold text-amber-800 dark:text-amber-300 mb-1">
                          <Lock className="h-3.5 w-3.5" />
                          <span>Internal Staff Note • {msg.senderName}</span>
                          <span className="ml-auto text-[10px] font-normal text-amber-700/80 dark:text-amber-400">
                            {formatMessageTime(msg.createdAt)}
                          </span>
                        </div>
                        <p className="text-xs text-amber-900 dark:text-amber-200 whitespace-pre-wrap">
                          {msg.message}
                        </p>
                      </div>
                    );
                  }

                  return (
                    <div
                      key={msg.messageId}
                      className={`flex items-end gap-2 ${
                        isMine ? "justify-end" : "justify-start"
                      }`}
                    >
                      {/* Avatar for counterparty */}
                      {!isMine && (
                        <div className="flex h-7 w-7 shrink-0 items-center justify-center overflow-hidden rounded-full bg-stone-200 ring-1 ring-stone-300 dark:bg-stone-800 dark:ring-stone-700 text-[10px] font-bold text-stone-700 dark:text-stone-300">
                          {msg.senderAvatar ? (
                            <Image
                              src={msg.senderAvatar}
                              alt={msg.senderName}
                              width={28}
                              height={28}
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            msg.senderName.charAt(0).toUpperCase()
                          )}
                        </div>
                      )}

                      {/* Chat Bubble */}
                      <div
                        className={`max-w-[78%] sm:max-w-md space-y-1.5 ${
                          isMine ? "items-end" : "items-start"
                        }`}
                      >
                        {/* Bubble Container */}
                        <div
                          className={`rounded-2xl px-4 py-2.5 shadow-xs transition-all ${
                            isMine
                              ? "bg-emerald-600 text-white rounded-br-xs"
                              : "bg-white text-stone-900 border border-stone-200/80 dark:border-stone-800 dark:bg-stone-900 dark:text-stone-100 rounded-bl-xs"
                          }`}
                        >
                          {/* Sender name for admin replies if customer is viewing */}
                          {!isMine && (
                            <p className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 mb-0.5">
                              {msg.senderRole === "admin" ? "SheoMart Support Team" : msg.senderName}
                            </p>
                          )}

                          {/* Message Text */}
                          <p className="text-xs leading-relaxed whitespace-pre-wrap">
                            {msg.message}
                          </p>

                          {/* Attachments if any */}
                          {msg.attachments && msg.attachments.length > 0 && (
                            <div className="mt-2 grid grid-cols-2 gap-1.5 pt-1.5 border-t border-white/20 dark:border-stone-800">
                              {msg.attachments.map((att, idx) => (
                                <button
                                  key={idx}
                                  type="button"
                                  onClick={() => setActiveImagePreview(att.url)}
                                  className="group relative aspect-video w-full overflow-hidden rounded-lg bg-black/10"
                                >
                                  <Image
                                    src={att.url}
                                    alt="attachment"
                                    fill
                                    className="object-cover transition-transform group-hover:scale-105"
                                  />
                                </button>
                              ))}
                            </div>
                          )}

                          {/* Message Footer: Time + Read Receipts */}
                          <div
                            className={`flex items-center justify-end gap-1 mt-1 text-[9px] ${
                              isMine ? "text-emerald-100/90" : "text-stone-400 dark:text-stone-500"
                            }`}
                          >
                            <span>{formatMessageTime(msg.createdAt)}</span>
                            {isMine && (
                              <span>
                                {msg.readByCustomer || msg.readByAdmin ? (
                                  <CheckCheck className="h-3 w-3 text-white" />
                                ) : (
                                  <Check className="h-3 w-3 text-white/70" />
                                )}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ))}

            {/* Typing indicator */}
            {isTyping && (
              <div className="flex items-center gap-2 text-xs text-stone-500 dark:text-stone-400 animate-in fade-in duration-150">
                <div className="flex h-7 w-7 items-center justify-center rounded-full bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400 border border-emerald-500/20 text-[10px] font-bold">
                  SM
                </div>
                <div className="flex items-center gap-1 rounded-2xl bg-white px-3 py-2 shadow-2xs border border-stone-200/80 dark:border-stone-800 dark:bg-stone-900">
                  <span className="text-[11px] font-medium">{typingUserName} is typing</span>
                  <span className="inline-flex gap-0.5 ml-1">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-bounce [animation-delay:-0.3s]" />
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-bounce [animation-delay:-0.15s]" />
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-bounce" />
                  </span>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </>
        )}
      </div>

      {/* ── Closed / Resolved Notification Banner ─────────────────── */}
      {isClosed ? (
        <div className="shrink-0 border-t border-stone-200 bg-stone-100 p-3.5 text-center text-xs text-stone-600 dark:border-stone-800 dark:bg-stone-900 dark:text-stone-400">
          <p className="font-semibold">This support ticket has been closed.</p>
          <p className="text-[11px] mt-0.5">
            If you need further help with this issue, please create a new support request.
          </p>
        </div>
      ) : isResolved ? (
        <div className="shrink-0 border-t border-emerald-200 bg-emerald-50/80 p-3 text-center text-xs text-emerald-800 dark:border-emerald-900/60 dark:bg-emerald-950/40 dark:text-emerald-300">
          <p className="font-semibold">This ticket is marked as Resolved.</p>
          <p className="text-[11px] mt-0.5">
            Send a reply below if you require additional follow-up or assistance.
          </p>
        </div>
      ) : null}

      {/* ── Input Box & Controls ─────────────────────────────────── */}
      {!isClosed && (
        <div className="shrink-0 border-t border-stone-200/90 bg-white p-3 sm:p-4 dark:border-stone-800/90 dark:bg-stone-900">
          {/* Admin toggle for Internal Note */}
          {currentUserRole === "admin" && (
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => setIsInternalMode(false)}
                  className={`rounded-lg px-2.5 py-1 text-xs font-bold transition ${
                    !isInternalMode
                      ? "bg-emerald-600 text-white shadow-xs"
                      : "text-stone-500 hover:bg-stone-100 dark:hover:bg-stone-800"
                  }`}
                >
                  Customer Reply
                </button>
                <button
                  type="button"
                  onClick={() => setIsInternalMode(true)}
                  className={`inline-flex items-center gap-1 rounded-lg px-2.5 py-1 text-xs font-bold transition ${
                    isInternalMode
                      ? "bg-amber-500 text-white shadow-xs"
                      : "text-amber-600 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-950/40"
                  }`}
                >
                  <Lock className="h-3 w-3" /> Internal Staff Note
                </button>
              </div>

              {isInternalMode && (
                <span className="text-[10px] font-semibold text-amber-600 dark:text-amber-400">
                  Hidden from customer
                </span>
              )}
            </div>
          )}

          {/* Attachment Preview Chips */}
          {attachments.length > 0 && (
            <div className="mb-2 flex flex-wrap gap-2">
              {attachments.map((att, i) => (
                <div
                  key={i}
                  className="flex items-center gap-2 rounded-xl border border-stone-200 bg-stone-50 p-1.5 pr-2.5 dark:border-stone-800 dark:bg-stone-950"
                >
                  <div className="relative h-7 w-7 rounded-lg overflow-hidden bg-stone-200">
                    <Image src={att.url} alt="att" fill className="object-cover" />
                  </div>
                  <span className="text-xs font-medium text-stone-700 dark:text-stone-300 max-w-[120px] truncate">
                    {att.name || `Photo ${i + 1}`}
                  </span>
                  <button
                    type="button"
                    onClick={() => setAttachments((prev) => prev.filter((_, idx) => idx !== i))}
                    className="text-stone-400 hover:text-rose-600"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Text Input Row */}
          <div className="flex items-end gap-2">
            <label className="flex h-10 w-10 shrink-0 cursor-pointer items-center justify-center rounded-xl border border-stone-200 bg-stone-50 text-stone-500 transition hover:bg-stone-100 hover:text-stone-800 dark:border-stone-800 dark:bg-stone-800 dark:text-stone-400 dark:hover:bg-stone-700">
              <input
                type="file"
                accept="image/png,image/jpeg,image/webp"
                multiple
                disabled={isUploading || attachments.length >= 4}
                onChange={handleFileUpload}
                className="hidden"
              />
              {isUploading ? (
                <Loader2 className="h-4 w-4 animate-spin text-emerald-600" />
              ) : (
                <Paperclip className="h-4 w-4" />
              )}
            </label>

            <textarea
              value={inputText}
              onChange={handleInputChange}
              onKeyDown={handleKeyDown}
              rows={1}
              placeholder={
                isInternalMode
                  ? "Write an internal note (only visible to admins)..."
                  : "Type your message here... (Enter to send)"
              }
              className={`flex-1 resize-none rounded-2xl border px-4 py-2.5 text-xs text-stone-900 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 max-h-32 min-h-[42px] dark:bg-stone-950 dark:text-stone-100 ${
                isInternalMode
                  ? "border-amber-300 bg-amber-50/40 dark:border-amber-900"
                  : "border-stone-200 bg-stone-50/50 dark:border-stone-800"
              }`}
            />

            <Button
              type="button"
              disabled={isSending || (!inputText.trim() && attachments.length === 0)}
              onClick={handleSend}
              className={`h-10 w-10 shrink-0 rounded-xl p-0 transition-transform active:scale-95 ${
                isInternalMode
                  ? "bg-amber-500 hover:bg-amber-600 text-white"
                  : "bg-emerald-600 hover:bg-emerald-700 text-white"
              }`}
            >
              {isSending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
            </Button>
          </div>
        </div>
      )}

      {/* ── Image Lightbox Modal ─────────────────────────────────── */}
      {activeImagePreview && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-stone-950/80 p-4 backdrop-blur-xs animate-in fade-in duration-200"
          onClick={() => setActiveImagePreview(null)}
        >
          <div className="relative max-h-[85vh] max-w-[85vw] overflow-hidden rounded-2xl bg-black">
            <button
              type="button"
              onClick={() => setActiveImagePreview(null)}
              className="absolute top-3 right-3 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-stone-900/80 text-white hover:bg-stone-800"
            >
              <X className="h-4 w-4" />
            </button>
            <Image
              src={activeImagePreview}
              alt="preview"
              width={1000}
              height={800}
              className="max-h-[85vh] w-auto object-contain"
            />
          </div>
        </div>
      )}
    </div>
  );
}
