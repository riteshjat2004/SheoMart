import { z } from "zod";
import {
  SUPPORT_CATEGORIES,
  TICKET_PRIORITY,
  TICKET_STATUS,
} from "../constants/support";

const attachmentSchema = z.object({
  url: z.string().url(),
  publicId: z.string().optional(),
  name: z.string().optional(),
  bytes: z.number().optional(),
});

const categoryValues = Object.values(SUPPORT_CATEGORIES) as [string, ...string[]];
const priorityValues = Object.values(TICKET_PRIORITY) as [string, ...string[]];
const statusValues = Object.values(TICKET_STATUS) as [string, ...string[]];

export const createTicketSchema = z.object({
  body: z.object({
    category: z.enum(categoryValues),
    subject: z
      .string()
      .trim()
      .min(3, "Subject must be at least 3 characters")
      .max(200, "Subject cannot exceed 200 characters"),
    description: z
      .string()
      .trim()
      .min(10, "Please provide more details (minimum 10 characters)")
      .max(3000, "Description cannot exceed 3000 characters"),
    priority: z.enum(priorityValues).optional().default(TICKET_PRIORITY.MEDIUM),
    orderId: z.string().trim().optional().nullable(),
    attachments: z.array(attachmentSchema).optional().default([]),
  }),
});

export const addMessageSchema = z.object({
  body: z.object({
    message: z
      .string()
      .trim()
      .min(1, "Message cannot be empty")
      .max(3000, "Message cannot exceed 3000 characters"),
    attachments: z.array(attachmentSchema).optional().default([]),
    isInternal: z.boolean().optional().default(false),
  }),
});

export const updateStatusSchema = z.object({
  body: z.object({
    status: z.enum(statusValues),
    reason: z.string().trim().max(500).optional(),
  }),
});

export const updatePrioritySchema = z.object({
  body: z.object({
    priority: z.enum(priorityValues),
  }),
});

export const assignAdminSchema = z.object({
  body: z.object({
    adminId: z.string().trim().min(1, "Admin ID is required"),
    adminName: z.string().trim().optional(),
  }),
});

export const internalNoteSchema = z.object({
  body: z.object({
    note: z
      .string()
      .trim()
      .min(1, "Note cannot be empty")
      .max(2000, "Note cannot exceed 2000 characters"),
  }),
});

export const queryTicketsSchema = z.object({
  query: z.object({
    page: z.coerce.number().int().min(1).default(1),
    limit: z.coerce.number().int().min(1).max(100).default(20),
    status: z.string().optional(),
    priority: z.string().optional(),
    category: z.string().optional(),
    search: z.string().optional(),
    sort: z.enum(["newest", "oldest", "unread", "priority"]).default("newest"),
  }),
});
