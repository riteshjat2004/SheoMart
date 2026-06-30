import { Response } from "express";
import { AuthRequest } from "../middleware/auth.middleware";
import { ApiResponse } from "../utils/apiResponse";

export const getProfile = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  res.status(200).json(
    new ApiResponse(true, "Profile fetched successfully", {
      user: req.user,
    })
  );
};