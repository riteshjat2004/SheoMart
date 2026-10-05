import { Document, Schema, model } from "mongoose";
import { v4 as uuidv4 } from "uuid";

export type NotificationType =
  | "NEW_ORDER"
  | "LOW_STOCK"
  | "REVIEW_RECEIVED"
  | "COUPON_EXPIRING"
  | "SYSTEM";

export interface INotification extends Document {
  notificationId: string;
  storeId: string;
  userId?: string;
  type: NotificationType;
  title: string;
  message: string;
  data?: Record<string, unknown>;
  link?: string;
  isRead: boolean;
  readAt?: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

const notificationSchema = new Schema<INotification>(
  {
    notificationId: {
      type: String,
      default: () => uuidv4(),
      unique: true,
      immutable: true,
      index: true,
    },
    storeId: { type: String, required: true, index: true },
    userId: { type: String, default: null, index: true },
    type: {
      type: String,
      enum: ["NEW_ORDER", "LOW_STOCK", "REVIEW_RECEIVED", "COUPON_EXPIRING", "SYSTEM"],
      default: "NEW_ORDER",
      index: true,
    },
    title: { type: String, required: true },
    message: { type: String, required: true },
    data: { type: Schema.Types.Mixed, default: {} },
    link: { type: String, default: "" },
    isRead: { type: Boolean, default: false, index: true },
    readAt: { type: Date, default: null },
  },
  { timestamps: true }
);

notificationSchema.index({ storeId: 1, createdAt: -1 });
notificationSchema.index({ storeId: 1, isRead: 1 });

export const Notification = model<INotification>("Notification", notificationSchema);
