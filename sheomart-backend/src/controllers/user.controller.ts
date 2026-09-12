import { Response } from "express";
import { AuthRequest } from "../middleware/auth.middleware";
import { ApiResponse } from "../utils/apiResponse";
import { UserService } from "../services/user.service";
import { adminUserListQuerySchema, changePasswordSchema, updateProfileSchema } from "../validators/user.validator";

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