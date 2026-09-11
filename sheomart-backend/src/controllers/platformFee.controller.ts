import { Response } from "express";
import { AppError } from "../errors/AppError";
import { AuthRequest } from "../middleware/auth.middleware";
import { ApiResponse } from "../utils/apiResponse";
import { platformFeeConfigSchema } from "../validators/platformFee.validator";
import { PlatformFeeService } from "../services/platformFee.service";

export const getPlatformFeeConfig = async (_req: AuthRequest, res: Response): Promise<void> => {
  const config = await PlatformFeeService.getConfig();
  res.status(200).json(new ApiResponse(true, "Platform fee configuration fetched", { config }));
};

export const updatePlatformFeeConfig = async (req: AuthRequest, res: Response): Promise<void> => {
  const result = platformFeeConfigSchema.safeParse(req.body);
  if (!result.success) throw new AppError(result.error.issues[0]?.message || "Invalid platform fee configuration", 400);
  const config = await PlatformFeeService.updateConfig(req.user!.userId, result.data);
  res.status(200).json(new ApiResponse(true, "Platform fee configuration updated", { config }));
};
