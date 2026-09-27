import { Schema, model, Document } from "mongoose";
import { v4 as uuidv4 } from "uuid";
import { ISupportAttachment } from "./supportTicket.model";

export interface ISupportMessage extends Document {
  messageId: string;
  ticketId: string;
  senderId: string;
  senderRole: "customer" | "admin";
  senderName: string;
  senderAvatar?: string | null;
  message: string;
  attachments: ISupportAttachment[];
  isInternal: boolean;
  readByCustomer: boolean;
  readByAdmin: boolean;
  readAt?: Date | null;
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

const supportMessageSchema = new Schema<ISupportMessage>(
  {
    messageId: {
      type: String,
      default: () => uuidv4(),
      unique: true,
    },
    ticketId: {
      type: String,
      required: true,
      index: true,
    },
    senderId: {
      type: String,
      required: true,
      index: true,
    },
    senderRole: {
      type: String,
      enum: ["customer", "admin"],
      required: true,
    },
    senderName: {
      type: String,
      required: true,
      trim: true,
    },
    senderAvatar: {
      type: String,
      default: null,
    },
    message: {
      type: String,
      required: true,
      trim: true,
      maxlength: 3000,
    },
    attachments: {
      type: [attachmentSchema],
      default: [],
    },
    isInternal: {
      type: Boolean,
      default: false,
      index: true,
    },
    readByCustomer: {
      type: Boolean,
      default: false,
    },
    readByAdmin: {
      type: Boolean,
      default: false,
    },
    readAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

// Performance Indexes for live chat loading and unread scans
supportMessageSchema.index({ ticketId: 1, createdAt: 1 });
supportMessageSchema.index({ ticketId: 1, isInternal: 1, createdAt: 1 });
supportMessageSchema.index({ ticketId: 1, readByAdmin: 1 });
supportMessageSchema.index({ ticketId: 1, readByCustomer: 1 });

export const SupportMessage = model<ISupportMessage>(
  "SupportMessage",
  supportMessageSchema
);
