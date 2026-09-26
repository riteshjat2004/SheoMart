import { Response } from "express";
import { AuthRequest } from "../middleware/auth.middleware";
import { ApiResponse } from "../utils/apiResponse";
import { UserService } from "../services/user.service";
import {
  adminUserListQuerySchema,
  createAdminUserSchema,
  updateAdminUserSchema,
  changeRoleSchema,
  suspendUserSchema,
  verifyCustomerSchema,
  bulkUserActionSchema,
  changePasswordSchema,
  updateProfileSchema,
} from "../validators/user.validator";

export const getAdminUsers = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  const filters = adminUserListQuerySchema.parse(req.query);
  const result = await UserService.listAdminUsers(filters);

  res.status(200).json(
    new ApiResponse(true, "Users fetched successfully", result)
  );
};

export const getAdminUserStats = async (
  _req: AuthRequest,
  res: Response
): Promise<void> => {
  const stats = await UserService.getAdminUserStats();

  res.status(200).json(
    new ApiResponse(true, "User statistics fetched successfully", stats)
  );
};

export const getAdminUserDetails = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  const userId = Array.isArray(req.params.userId) ? req.params.userId[0] : req.params.userId;
  const result = await UserService.getAdminUserDetails(userId);

  res.status(200).json(
    new ApiResponse(true, "User details fetched successfully", result)
  );
};

export const createAdminUser = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  const data = createAdminUserSchema.parse(req.body);
  const user = await UserService.createAdminUser(data, req.user?.userId as string);

  res.status(201).json(
    new ApiResponse(true, "User created successfully", { user })
  );
};

export const updateAdminUser = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  const userId = Array.isArray(req.params.userId) ? req.params.userId[0] : req.params.userId;
  const data = updateAdminUserSchema.parse(req.body);
  const user = await UserService.updateAdminUser(userId, data, req.user?.userId as string);

  res.status(200).json(
    new ApiResponse(true, "User updated successfully", { user })
  );
};

export const updateUserStatus = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  const userId = Array.isArray(req.params.userId) ? req.params.userId[0] : req.params.userId;
  const data = suspendUserSchema.parse(req.body);
  const user = await UserService.updateUserStatus(userId, data, req.user?.userId as string);

  res.status(200).json(
    new ApiResponse(true, "User status updated successfully", { user })
  );
};

export const updateUserRole = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  const userId = Array.isArray(req.params.userId) ? req.params.userId[0] : req.params.userId;
  const data = changeRoleSchema.parse(req.body);
  const user = await UserService.updateUserRole(userId, data.role, req.user?.userId as string);

  res.status(200).json(
    new ApiResponse(true, "User role updated successfully", { user })
  );
};

export const verifyCustomer = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  const userId = Array.isArray(req.params.userId) ? req.params.userId[0] : req.params.userId;
  const data = verifyCustomerSchema.parse(req.body);
  const user = await UserService.verifyCustomer(userId, data.isVerifiedCustomer, req.user?.userId as string);

  res.status(200).json(
    new ApiResponse(true, "Customer verification status updated successfully", { user })
  );
};

export const deleteAdminUser = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  const userId = Array.isArray(req.params.userId) ? req.params.userId[0] : req.params.userId;
  const result = await UserService.deleteUser(userId, req.user?.userId as string);

  res.status(200).json(
    new ApiResponse(true, "User deleted successfully", result)
  );
};

export const restoreAdminUser = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  const userId = Array.isArray(req.params.userId) ? req.params.userId[0] : req.params.userId;
  const user = await UserService.restoreUser(userId, req.user?.userId as string);

  res.status(200).json(
    new ApiResponse(true, "User restored successfully", { user })
  );
};

export const bulkUserAction = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  const data = bulkUserActionSchema.parse(req.body);
  const result = await UserService.bulkUserAction(data, req.user?.userId as string);

  res.status(200).json(
    new ApiResponse(true, result.message, result)
  );
};

export const getProfile = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  const profile = await UserService.getProfile(req.user?.userId as string);

  res.status(200).json(
    new ApiResponse(true, "Profile fetched successfully", { user: profile })
  );
};

export const updateProfile = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  const data = updateProfileSchema.parse(req.body);
  const profile = await UserService.updateProfile(req.user?.userId as string, data);

  res.status(200).json(
    new ApiResponse(true, "Profile updated successfully", { user: profile })
  );
};

export const changePassword = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  const data = changePasswordSchema.parse(req.body);
  const result = await UserService.changePassword(req.user?.userId as string, req.user?.sessionId as string, data);

  res.status(200).json(
    new ApiResponse(true, "Password changed successfully", result)
  );
};

export const deleteAccount = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  const result = await UserService.deleteAccount(req.user?.userId as string);

  res.status(200).json(
    new ApiResponse(true, "Account deleted successfully", result)
  );
};