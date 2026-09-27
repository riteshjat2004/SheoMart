"use client";

import { useState } from "react";
import Image from "next/image";
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
  Upload,
  X,
  ChevronRight,
  ChevronLeft,
  CheckCircle2,
  Loader2,
  Image as ImageIcon,
  LifeBuoy,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { supportService } from "@/services/support.service";
import {
  SUPPORT_CATEGORY_META,
  type SupportCategory,
  type TicketPriority,
  type CustomerOrderOption,
  type SupportAttachment,
  type SupportTicket,
} from "@/types/support";

const CATEGORIES_LIST: Array<{ id: SupportCategory; label: string; icon: React.ElementType; description: string }> = [
  { id: "order_issue", label: "Order Issue", icon: Package, description: "Problems with placed, cancelled or ongoing orders" },
  { id: "product_quality", label: "Product Quality", icon: Sparkles, description: "Freshness, packaging, damaged or expired items" },
  { id: "wrong_item", label: "Wrong Item", icon: AlertTriangle, description: "Received missing or incorrect products in parcel" },
  { id: "payment_issue", label: "Payment Issue", icon: CreditCard, description: "Charged twice, payment failed or pending" },
  { id: "refund_request", label: "Refund Request", icon: Receipt, description: "Track status or request refund to payment source" },
  { id: "delivery_issue", label: "Delivery Issue", icon: Truck, description: "Rider delay, wrong delivery address or tracking" },
  { id: "coupon_problem", label: "Coupon Problem", icon: TicketPercent, description: "Discounts or vouchers not applying at checkout" },
  { id: "app_bug", label: "App Bug", icon: Bug, description: "Glitches, crashing errors or broken app flows" },
  { id: "account_login", label: "Account & Login", icon: UserCheck, description: "OTP issues, phone verification or profile access" },
  { id: "general_feedback", label: "General Feedback", icon: MessageSquare, description: "Suggestions, compliments or store requests" },
];

interface NewTicketModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreated: (ticket: SupportTicket) => void;
  orders: CustomerOrderOption[];
}

export function NewTicketModal({
  isOpen,
  onClose,
  onCreated,
  orders,
}: NewTicketModalProps) {
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);
  const [category, setCategory] = useState<SupportCategory | null>(null);
  const [subject, setSubject] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState<TicketPriority>("medium");
  const [selectedOrderId, setSelectedOrderId] = useState<string>("");
  const [attachments, setAttachments] = useState<SupportAttachment[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    if (attachments.length + files.length > 4) {
      setError("Maximum 4 attachments allowed per support ticket.");
      return;
    }

    setError(null);
    setIsUploading(true);

    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        if (file.size > 5 * 1024 * 1024) {
          setError(`File ${file.name} exceeds 5 MB size limit.`);
          continue;
        }
        const uploaded = await supportService.uploadAttachment(file);
        setAttachments((prev) => [...prev, uploaded]);
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to upload image";
      setError(msg);
    } finally {
      setIsUploading(false);
      e.target.value = "";
    }
  };

  const removeAttachment = (index: number) => {
    setAttachments((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    if (!category || !subject.trim() || !description.trim()) {
      setError("Please complete all required fields.");
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const ticket = await supportService.createTicket({
        category,
        subject: subject.trim(),
        description: description.trim(),
        priority,
        orderId: selectedOrderId || null,
        attachments,
      });

      onCreated(ticket);
      onClose();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to create support ticket";
      setError(msg);
      setIsSubmitting(false);
    }
  };

  const resetAndClose = () => {
    setStep(1);
    setCategory(null);
    setSubject("");
    setDescription("");
    setPriority("medium");
    setSelectedOrderId("");
    setAttachments([]);
    setError(null);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-stone-950/70 p-4 backdrop-blur-xs animate-in fade-in duration-200">
      <div
        className="relative flex max-h-[92vh] w-full max-w-2xl flex-col rounded-3xl border border-stone-200 bg-white shadow-2xl dark:border-stone-800 dark:bg-stone-900 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-stone-200 px-6 py-4 dark:border-stone-800">
          <div className="flex items-center gap-2.5">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
              <LifeBuoy className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-stone-900 dark:text-stone-100">
                New Support Request
              </h2>
              <p className="text-xs text-stone-500 dark:text-stone-400">
                Step {step} of 4 —{" "}
                {step === 1 && "Select topic"}
                {step === 2 && "Describe your issue"}
                {step === 3 && "Add attachments"}
                {step === 4 && "Review & Submit"}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={resetAndClose}
            className="flex h-8 w-8 items-center justify-center rounded-xl text-stone-400 hover:bg-stone-100 hover:text-stone-600 dark:hover:bg-stone-800 dark:hover:text-stone-300 transition"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Step Progress Bar */}
        <div className="h-1 w-full bg-stone-100 dark:bg-stone-800">
          <div
            className="h-full bg-emerald-500 transition-all duration-300"
            style={{ width: `${(step / 4) * 100}%` }}
          />
        </div>

        {/* Body Content */}
        <div className="flex-1 overflow-y-auto p-6 scrollbar-thin">
          {error && (
            <div className="mb-4 rounded-xl border border-rose-200 bg-rose-50 p-3 text-xs font-medium text-rose-700 dark:border-rose-900/50 dark:bg-rose-950/40 dark:text-rose-300">
              {error}
            </div>
          )}

          {/* STEP 1: Select Category */}
          {step === 1 && (
            <div>
              <p className="mb-4 text-xs font-medium text-stone-600 dark:text-stone-400">
                What do you need assistance with today? Select the category that best matches your problem.
              </p>
              <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
                {CATEGORIES_LIST.map((cat) => {
                  const Icon = cat.icon;
                  const isSelected = category === cat.id;
                  return (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => setCategory(cat.id)}
                      className={`flex items-start gap-3 rounded-2xl border p-3.5 text-left transition-all ${
                        isSelected
                          ? "border-emerald-500 bg-emerald-50/50 ring-2 ring-emerald-500/20 dark:border-emerald-500 dark:bg-emerald-950/30"
                          : "border-stone-200 bg-stone-50/50 hover:border-stone-300 hover:bg-stone-100/60 dark:border-stone-800 dark:bg-stone-900/50 dark:hover:border-stone-700"
                      }`}
                    >
                      <div
                        className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl transition ${
                          isSelected
                            ? "bg-emerald-600 text-white"
                            : "bg-white text-stone-600 dark:bg-stone-800 dark:text-stone-300"
                        }`}
                      >
                        <Icon className="h-4 w-4" />
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5">
                          <p className="text-xs font-bold text-stone-900 dark:text-stone-100">
                            {cat.label}
                          </p>
                          {isSelected && (
                            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
                          )}
                        </div>
                        <p className="text-[11px] text-stone-500 dark:text-stone-400 line-clamp-2">
                          {cat.description}
                        </p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* STEP 2: Describe Issue */}
          {step === 2 && (
            <div className="space-y-4">
              {/* Selected Category Tag */}
              {category && (
                <div className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                  Category: {SUPPORT_CATEGORY_META[category]?.label}
                </div>
              )}

              {/* Subject */}
              <div>
                <label className="mb-1.5 flex items-center justify-between text-xs font-semibold text-stone-700 dark:text-stone-300">
                  <span>Subject <span className="text-rose-500">*</span></span>
                  <span className="text-[10px] text-stone-400">{subject.length}/200</span>
                </label>
                <input
                  type="text"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  maxLength={200}
                  placeholder="e.g. Milk packet was leaked in morning delivery"
                  className="w-full rounded-xl border border-stone-200 bg-white px-3.5 py-2.5 text-xs text-stone-900 placeholder:text-stone-400 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 dark:border-stone-800 dark:bg-stone-950 dark:text-stone-100"
                />
              </div>

              {/* Description */}
              <div>
                <label className="mb-1.5 flex items-center justify-between text-xs font-semibold text-stone-700 dark:text-stone-300">
                  <span>Describe the issue <span className="text-rose-500">*</span></span>
                  <span className="text-[10px] text-stone-400">{description.length}/3000</span>
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={4}
                  maxLength={3000}
                  placeholder="Please describe what happened in detail. What did you observe? What resolution would you like?"
                  className="w-full resize-none rounded-xl border border-stone-200 bg-white px-3.5 py-2.5 text-xs text-stone-900 placeholder:text-stone-400 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 dark:border-stone-800 dark:bg-stone-950 dark:text-stone-100"
                />
              </div>

              {/* Linked Order (Optional) */}
              {orders.length > 0 && (
                <div>
                  <label className="mb-1.5 block text-xs font-semibold text-stone-700 dark:text-stone-300">
                    Related Order (Optional)
                  </label>
                  <select
                    value={selectedOrderId}
                    onChange={(e) => setSelectedOrderId(e.target.value)}
                    className="w-full rounded-xl border border-stone-200 bg-white px-3 py-2 text-xs text-stone-900 focus:border-emerald-500 focus:outline-none dark:border-stone-800 dark:bg-stone-950 dark:text-stone-100"
                  >
                    <option value="">None / Not specific to an order</option>
                    {orders.map((o) => (
                      <option key={o.orderId} value={o.orderId}>
                        Order #{o.invoiceNumber || o.orderId.slice(0, 8)} — ₹{o.grandTotal} ({o.status})
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Priority */}
              <div>
                <label className="mb-1.5 block text-xs font-semibold text-stone-700 dark:text-stone-300">
                  Urgency / Priority
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {(["low", "medium", "high", "urgent"] as TicketPriority[]).map((p) => {
                    const active = priority === p;
                    return (
                      <button
                        key={p}
                        type="button"
                        onClick={() => setPriority(p)}
                        className={`rounded-xl border py-2 text-center text-xs font-bold capitalize transition ${
                          active
                            ? p === "urgent"
                              ? "border-rose-500 bg-rose-500 text-white"
                              : p === "high"
                              ? "border-amber-500 bg-amber-500 text-white"
                              : "border-emerald-600 bg-emerald-600 text-white"
                            : "border-stone-200 bg-stone-50 text-stone-600 hover:bg-stone-100 dark:border-stone-800 dark:bg-stone-900 dark:text-stone-400"
                        }`}
                      >
                        {p}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* STEP 3: Attach Images */}
          {step === 3 && (
            <div className="space-y-4">
              <div>
                <h3 className="text-xs font-bold text-stone-900 dark:text-stone-100">
                  Attach Photos or Invoices (Optional)
                </h3>
                <p className="mt-0.5 text-[11px] text-stone-500 dark:text-stone-400">
                  Upload photos of damaged packages, incorrect items, or receipt screenshots. Up to 4 images (Max 5 MB each).
                </p>
              </div>

              {/* Upload Dropzone */}
              <label className="relative flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-stone-300 bg-stone-50/60 p-6 text-center hover:bg-stone-100/60 transition cursor-pointer dark:border-stone-700 dark:bg-stone-900/50">
                <input
                  type="file"
                  accept="image/png,image/jpeg,image/webp"
                  multiple
                  disabled={isUploading || attachments.length >= 4}
                  onChange={handleFileUpload}
                  className="hidden"
                />
                {isUploading ? (
                  <div className="flex flex-col items-center gap-2">
                    <Loader2 className="h-6 w-6 animate-spin text-emerald-600" />
                    <p className="text-xs font-medium text-stone-600 dark:text-stone-300">
                      Uploading to secure storage...
                    </p>
                  </div>
                ) : (
                  <div className="flex flex-col items-center gap-2">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white shadow-xs dark:bg-stone-800 text-stone-600 dark:text-stone-300">
                      <Upload className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-stone-800 dark:text-stone-200">
                        Click to browse or drag photos here
                      </p>
                      <p className="text-[10px] text-stone-400">PNG, JPG, WebP up to 5 MB</p>
                    </div>
                  </div>
                )}
              </label>

              {/* Attachment Previews */}
              {attachments.length > 0 && (
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                  {attachments.map((att, idx) => (
                    <div
                      key={att.url || idx}
                      className="group relative aspect-square overflow-hidden rounded-xl border border-stone-200 bg-stone-100 dark:border-stone-800 dark:bg-stone-950"
                    >
                      <Image
                        src={att.url}
                        alt="attachment"
                        fill
                        className="object-cover"
                      />
                      <button
                        type="button"
                        onClick={() => removeAttachment(idx)}
                        className="absolute top-1.5 right-1.5 flex h-6 w-6 items-center justify-center rounded-full bg-stone-950/70 text-white opacity-90 transition hover:bg-rose-600 hover:opacity-100"
                        title="Remove image"
                      >
                        <X className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* STEP 4: Review & Submit */}
          {step === 4 && (
            <div className="space-y-4">
              <div className="rounded-2xl border border-stone-200 bg-stone-50/60 p-4 dark:border-stone-800 dark:bg-stone-900/60 space-y-3">
                <div className="flex items-center justify-between border-b border-stone-200/80 pb-2.5 dark:border-stone-800">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold text-stone-500">Category:</span>
                    <span className="rounded-md bg-emerald-500/10 px-2 py-0.5 text-xs font-bold text-emerald-600 dark:text-emerald-400">
                      {category ? SUPPORT_CATEGORY_META[category]?.label : "General"}
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5 text-xs">
                    <span className="font-semibold text-stone-500">Priority:</span>
                    <span className="capitalize font-bold text-stone-800 dark:text-stone-200">{priority}</span>
                  </div>
                </div>

                <div>
                  <p className="text-[11px] font-semibold text-stone-400">Subject</p>
                  <p className="text-xs font-bold text-stone-900 dark:text-stone-100">{subject}</p>
                </div>

                <div>
                  <p className="text-[11px] font-semibold text-stone-400">Description</p>
                  <p className="text-xs text-stone-700 dark:text-stone-300 whitespace-pre-wrap">{description}</p>
                </div>

                {selectedOrderId && (
                  <div>
                    <p className="text-[11px] font-semibold text-stone-400">Linked Order</p>
                    <p className="text-xs font-mono font-semibold text-stone-800 dark:text-stone-200">
                      #{selectedOrderId}
                    </p>
                  </div>
                )}

                {attachments.length > 0 && (
                  <div>
                    <p className="text-[11px] font-semibold text-stone-400 mb-1">
                      Attachments ({attachments.length})
                    </p>
                    <div className="flex gap-2">
                      {attachments.map((att, i) => (
                        <div key={i} className="relative h-12 w-12 rounded-lg border overflow-hidden">
                          <Image src={att.url} alt="att" fill className="object-cover" />
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="rounded-xl bg-emerald-50 p-3 text-xs text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/60">
                <p className="font-semibold">💡 What happens next?</p>
                <p className="text-[11px] mt-0.5">
                  Our dedicated support desk will be notified immediately. You will be redirected straight to the live conversation thread to receive updates and responses.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Footer Navigation */}
        <div className="flex items-center justify-between border-t border-stone-200 bg-stone-50/60 px-6 py-3.5 dark:border-stone-800 dark:bg-stone-950/60">
          {step > 1 ? (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => {
                setError(null);
                setStep((s) => (s - 1) as 1 | 2 | 3);
              }}
              className="gap-1.5"
            >
              <ChevronLeft className="h-4 w-4" /> Back
            </Button>
          ) : (
            <div />
          )}

          {step < 4 ? (
            <Button
              type="button"
              size="sm"
              disabled={step === 1 && !category}
              onClick={() => {
                setError(null);
                if (step === 2) {
                  if (!subject.trim() || subject.trim().length < 3) {
                    setError("Subject must be at least 3 characters.");
                    return;
                  }
                  if (!description.trim() || description.trim().length < 10) {
                    setError("Description must be at least 10 characters.");
                    return;
                  }
                }
                setStep((s) => (s + 1) as 2 | 3 | 4);
              }}
              className="bg-emerald-600 text-white hover:bg-emerald-700 gap-1.5"
            >
              Next <ChevronRight className="h-4 w-4" />
            </Button>
          ) : (
            <Button
              type="button"
              size="sm"
              disabled={isSubmitting}
              onClick={handleSubmit}
              className="bg-emerald-600 text-white hover:bg-emerald-700 gap-2 shadow-xs"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" /> Submitting...
                </>
              ) : (
                <>
                  <CheckCircle2 className="h-4 w-4" /> Submit Request
                </>
              )}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
