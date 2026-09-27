import { Schema, model, Document } from "mongoose";
import {
  SUPPORT_CATEGORIES,
  SupportCategory,
  TICKET_PRIORITY,
  TicketPriority,
  TICKET_STATUS,
  TicketStatus,
} from "../constants/support";

export interface ISupportAttachment {
  url: string;
  publicId?: string;
  name?: string;
  bytes?: number;
}

export interface IInternalNote {
  noteId: string;
  adminId: string;
  adminName: string;
  note: string;
  createdAt: Date;
}

export interface ILastMessageInfo {
  messageText: string;
  senderRole: "customer" | "admin";
  sentAt: Date;
}

export interface ISupportTicket extends Document {
  ticketId: string;
  userId: string;
  category: SupportCategory;
  subject: string;
  description: string;
  priority: TicketPriority;
  status: TicketStatus;
  assignedAdminId: string | null;
  assignedAdminName: string | null;
  orderId: string | null;
  attachments: ISupportAttachment[];
  lastMessage?: ILastMessageInfo;
  unreadByCustomer: number;
  unreadByAdmin: number;
  internalNotes: IInternalNote[];
  resolvedAt: Date | null;
  closedAt: Date | null;
  reopenedAt: Date | null;
  resolvedBy: string | null;
  closedBy: string | null;
  createdAt: Date;
  updatedAt: Date;
}

const attachmentSchema = new Schema<ISupportAttachment>(
  {
    url: { type: String, required: true },
    publicId: { type: String },
    name: { type: String },
    bytes: { type: Number },
  },
  { _id: false }
);

const internalNoteSchema = new Schema<IInternalNote>(
  {
    noteId: { type: String, required: true },
    adminId: { type: String, required: true },
    adminName: { type: String, required: true },
    note: { type: String, required: true, trim: true },
    createdAt: { type: Date, default: Date.now },
  },
  { _id: false }
);

const lastMessageSchema = new Schema<ILastMessageInfo>(
  {
    messageText: { type: String, required: true },
    senderRole: {
      type: String,
      enum: ["customer", "admin"],
      required: true,
    },
    sentAt: { type: Date, default: Date.now },
  },
  { _id: false }
);

const supportTicketSchema = new Schema<ISupportTicket>(
  {
    ticketId: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      trim: true,
    },
    userId: {
      type: String,
      required: true,
      ref: "User",
    },
    category: {
      type: String,
      enum: Object.values(SUPPORT_CATEGORIES),
      required: true,
    },
    subject: {
      type: String,
      required: true,
      trim: true,
      maxlength: 200,
    },
    description: {
      type: String,
      required: true,
      trim: true,
      maxlength: 3000,
    },
    priority: {
      type: String,
      enum: Object.values(TICKET_PRIORITY),
      default: TICKET_PRIORITY.MEDIUM,
    },
    status: {
      type: String,
      enum: Object.values(TICKET_STATUS),
      default: TICKET_STATUS.OPEN,
    },
    assignedAdminId: {
      type: String,
      default: null,
    },
    assignedAdminName: {
      type: String,
      default: null,
    },
    orderId: {
      type: String,
      default: null,
    },
    attachments: {
      type: [attachmentSchema],
      default: [],
    },
    lastMessage: {
      type: lastMessageSchema,
    },
    unreadByCustomer: {
      type: Number,
      default: 0,
    },
    unreadByAdmin: {
      type: Number,
      default: 1,
    },
    internalNotes: {
      type: [internalNoteSchema],
      default: [],
    },
    resolvedAt: {
      type: Date,
      default: null,
    },
    closedAt: {
      type: Date,
      default: null,
    },
    reopenedAt: {
      type: Date,
      default: null,
    },
    resolvedBy: {
      type: String,
      default: null,
    },
    closedBy: {
      type: String,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

// Performance Indexes
supportTicketSchema.index({ userId: 1, createdAt: -1 });
supportTicketSchema.index({ status: 1, updatedAt: -1 });
supportTicketSchema.index({ priority: 1, updatedAt: -1 });
supportTicketSchema.index({ category: 1, updatedAt: -1 });
supportTicketSchema.index({ unreadByAdmin: 1, updatedAt: -1 });
supportTicketSchema.index({ unreadByCustomer: 1, userId: 1 });

export const SupportTicket = model<ISupportTicket>(
  "SupportTicket",
  supportTicketSchema
);
