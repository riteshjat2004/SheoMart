import { Router } from "express";
import { SupportController } from "../controllers/support.controller";
import { authenticate } from "../middleware/auth.middleware";
import { authorize } from "../middleware/role.middleware";
import { USER_ROLES } from "../constants/roles";
import { asyncHandler } from "../utils/asyncHandler";
import { validateRequest } from "../middleware/validate.middleware";
import { uploadProductImage } from "../middleware/upload.middleware";
import {
  createTicketSchema,
  addMessageSchema,
  updateStatusSchema,
  updatePrioritySchema,
  assignAdminSchema,
  internalNoteSchema,
} from "../validators/support.validator";

const router = Router();

// ==========================================
// CUSTOMER & SHARED SUPPORT ROUTES
// ==========================================

// Create a new support ticket
router.post(
  "/tickets",
  authenticate,
  validateRequest(createTicketSchema),
  asyncHandler(SupportController.createTicket)
);

// Get current customer's tickets
router.get(
  "/tickets/my",
  authenticate,
  asyncHandler(SupportController.getCustomerTickets)
);

// Get recent orders for ticket creation dropdown
router.get(
  "/customer-orders",
  authenticate,
  asyncHandler(SupportController.getCustomerOrders)
);

// Upload image attachment for support ticket/chat
router.post(
  "/upload",
  authenticate,
  uploadProductImage,
  asyncHandler(SupportController.uploadAttachment)
);

// Get single ticket details
router.get(
  "/tickets/:ticketId",
  authenticate,
  asyncHandler(SupportController.getTicketDetails)
);

// Get conversation messages thread for a ticket
router.get(
  "/tickets/:ticketId/messages",
  authenticate,
  asyncHandler(SupportController.getTicketMessages)
);

// Send a message in a ticket thread
router.post(
  "/tickets/:ticketId/messages",
  authenticate,
  validateRequest(addMessageSchema),
  asyncHandler(SupportController.sendMessage)
);

// Mark messages as read
router.put(
  "/tickets/:ticketId/read",
  authenticate,
  asyncHandler(SupportController.markMessagesRead)
);

// Update ticket status (Customer: resolve/close, Admin: full control)
router.patch(
  "/tickets/:ticketId/status",
  authenticate,
  validateRequest(updateStatusSchema),
  asyncHandler(SupportController.updateTicketStatus)
);

// ==========================================
// ADMIN SUPPORT DESK ROUTES
// ==========================================

// Admin: Get all tickets with filters, search and sorting
router.get(
  "/admin/tickets",
  authenticate,
  authorize(USER_ROLES.PLATFORM_ADMIN),
  asyncHandler(SupportController.getAdminTickets)
);

// Admin: Analytics & KPI stats
router.get(
  "/admin/analytics",
  authenticate,
  authorize(USER_ROLES.PLATFORM_ADMIN),
  asyncHandler(SupportController.getAdminAnalytics)
);

// Admin: Update ticket status
router.patch(
  "/admin/tickets/:ticketId/status",
  authenticate,
  authorize(USER_ROLES.PLATFORM_ADMIN),
  validateRequest(updateStatusSchema),
  asyncHandler(SupportController.updateTicketStatus)
);

// Admin: Update ticket priority
router.patch(
  "/admin/tickets/:ticketId/priority",
  authenticate,
  authorize(USER_ROLES.PLATFORM_ADMIN),
  validateRequest(updatePrioritySchema),
  asyncHandler(SupportController.updateTicketPriority)
);

// Admin: Assign ticket
router.patch(
  "/admin/tickets/:ticketId/assign",
  authenticate,
  authorize(USER_ROLES.PLATFORM_ADMIN),
  validateRequest(assignAdminSchema),
  asyncHandler(SupportController.assignTicket)
);

// Admin: Add internal note
router.post(
  "/admin/tickets/:ticketId/internal-notes",
  authenticate,
  authorize(USER_ROLES.PLATFORM_ADMIN),
  validateRequest(internalNoteSchema),
  asyncHandler(SupportController.addInternalNote)
);

export default router;
