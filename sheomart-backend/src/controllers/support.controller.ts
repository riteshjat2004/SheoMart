import { Response } from "express";
import { AuthRequest } from "../middleware/auth.middleware";
import { ApiResponse } from "../utils/apiResponse";
import { AppError } from "../errors/AppError";
import { SupportService } from "../services/support.service";
import { uploadBufferToCloudinary } from "../utils/cloudinary";
import { CLOUDINARY_FOLDERS } from "../constants/cloudinary";

export class SupportController {
  /**
   * Customer: Create a new support ticket
   */
  static async createTicket(req: AuthRequest, res: Response) {
    const userId = req.user?.userId;
    if (!userId) {
      throw new AppError("Authentication required", 401);
    }

    const ticket = await SupportService.createTicket(userId, req.body);
    return res
      .status(201)
      .json(new ApiResponse(true, "Support ticket created successfully", ticket));
  }

  /**
   * Customer: List own tickets
   */
  static async getCustomerTickets(req: AuthRequest, res: Response) {
    const userId = req.user?.userId;
    if (!userId) {
      throw new AppError("Authentication required", 401);
    }

    const result = await SupportService.getCustomerTickets(userId, req.query);
    return res
      .status(200)
      .json(new ApiResponse(true, "Support tickets fetched successfully", result));
  }

  /**
   * Customer / Admin: Get ticket details
   */
  static async getTicketDetails(req: AuthRequest, res: Response) {
    const user = req.user;
    if (!user) {
      throw new AppError("Authentication required", 401);
    }

    const ticketId = String(req.params.ticketId);
    const result = await SupportService.getTicketDetails(ticketId, user);
    return res
      .status(200)
      .json(new ApiResponse(true, "Ticket details fetched successfully", result));
  }

  /**
   * Customer / Admin: Get messages for ticket thread
   */
  static async getTicketMessages(req: AuthRequest, res: Response) {
    const user = req.user;
    if (!user) {
      throw new AppError("Authentication required", 401);
    }

    const ticketId = String(req.params.ticketId);
    const messages = await SupportService.getTicketMessages(ticketId, user);
    return res
      .status(200)
      .json(new ApiResponse(true, "Messages fetched successfully", messages));
  }

  /**
   * Customer / Admin: Send a message in ticket thread
   */
  static async sendMessage(req: AuthRequest, res: Response) {
    const user = req.user;
    if (!user) {
      throw new AppError("Authentication required", 401);
    }

    const ticketId = String(req.params.ticketId);
    const message = await SupportService.sendMessage(ticketId, user, req.body);
    return res
      .status(201)
      .json(new ApiResponse(true, "Message sent successfully", message));
  }

  /**
   * Customer / Admin: Mark ticket messages as read
   */
  static async markMessagesRead(req: AuthRequest, res: Response) {
    const user = req.user;
    if (!user) {
      throw new AppError("Authentication required", 401);
    }

    const ticketId = String(req.params.ticketId);
    const result = await SupportService.markMessagesRead(ticketId, user);
    return res
      .status(200)
      .json(new ApiResponse(true, "Messages marked as read", result));
  }

  /**
   * Customer: Fetch past orders for dropdown selector
   */
  static async getCustomerOrders(req: AuthRequest, res: Response) {
    const userId = req.user?.userId;
    if (!userId) {
      throw new AppError("Authentication required", 401);
    }

    const orders = await SupportService.getCustomerOrdersForSupport(userId);
    return res
      .status(200)
      .json(new ApiResponse(true, "Customer orders fetched successfully", orders));
  }

  /**
   * Upload image attachment to Cloudinary (folder: sheomart/support_attachments)
   */
  static async uploadAttachment(req: AuthRequest, res: Response) {
    if (!req.file) {
      throw new AppError("Please provide an image file to upload", 400);
    }

    const uploadResult = await uploadBufferToCloudinary(
      req.file.buffer,
      CLOUDINARY_FOLDERS.SUPPORT
    );

    return res.status(200).json(
      new ApiResponse(true, "Attachment uploaded successfully", {
        url: uploadResult.secure_url,
        publicId: uploadResult.public_id,
        bytes: uploadResult.bytes,
        name: req.file.originalname,
      })
    );
  }

  /**
   * Admin: List all tickets with filters, search, sort and pagination
   */
  static async getAdminTickets(req: AuthRequest, res: Response) {
    const result = await SupportService.getAdminTickets(req.query);
    return res
      .status(200)
      .json(new ApiResponse(true, "Admin tickets fetched successfully", result));
  }

  /**
   * Admin: Analytics & KPI stats
   */
  static async getAdminAnalytics(_req: AuthRequest, res: Response) {
    const stats = await SupportService.getAdminAnalytics();
    return res
      .status(200)
      .json(new ApiResponse(true, "Support analytics fetched successfully", stats));
  }

  /**
   * Update ticket status (Customer or Admin)
   */
  static async updateTicketStatus(req: AuthRequest, res: Response) {
    const userId = req.user?.userId;
    const role = req.user?.role;
    if (!userId || !role) {
      throw new AppError("Authentication required", 401);
    }

    const ticketId = String(req.params.ticketId);
    const { status, reason } = req.body;
    const ticket = await SupportService.updateTicketStatus(
      ticketId,
      userId,
      role,
      status,
      reason
    );
    return res
      .status(200)
      .json(new ApiResponse(true, "Ticket status updated successfully", ticket));
  }

  /**
   * Admin: Update ticket priority
   */
  static async updateTicketPriority(req: AuthRequest, res: Response) {
    const ticketId = String(req.params.ticketId);
    const { priority } = req.body;
    const ticket = await SupportService.updateTicketPriority(ticketId, priority);
    return res
      .status(200)
      .json(new ApiResponse(true, "Ticket priority updated successfully", ticket));
  }

  /**
   * Admin: Assign ticket
   */
  static async assignTicket(req: AuthRequest, res: Response) {
    const ticketId = String(req.params.ticketId);
    const { adminId, adminName } = req.body;
    const ticket = await SupportService.assignTicket(ticketId, adminId, adminName);
    return res
      .status(200)
      .json(new ApiResponse(true, "Ticket assigned successfully", ticket));
  }

  /**
   * Admin: Add internal note
   */
  static async addInternalNote(req: AuthRequest, res: Response) {
    const adminId = req.user?.userId;
    if (!adminId) {
      throw new AppError("Authentication required", 401);
    }

    const ticketId = String(req.params.ticketId);
    const { note } = req.body;
    const internalNote = await SupportService.addInternalNote(
      ticketId,
      adminId,
      note
    );
    return res
      .status(201)
      .json(new ApiResponse(true, "Internal note added successfully", internalNote));
  }
}
