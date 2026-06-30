import { Request, Response } from "express";
import { AuthService } from "../services/auth.services";
import { registerSchema } from "../validators/auth.validator";
import { ApiResponse } from "../utils/apiResponse";

export const register = async (
  req: Request,
  res: Response
): Promise<void> => {
  const data = registerSchema.parse(req.body);

  const result = await AuthService.register(data);

  res.status(201).json(
    new ApiResponse(true, "User registered successfully", result)
  );
};