import { Request, Response } from "express";
import { AuthService } from "../services/auth.services";
import { registerSchema } from "../validators/auth.validator";
import { ApiResponse } from "../utils/apiResponse";
import { forgotPasswordSchema, loginSchema, resetPasswordSchema, verifyResetOtpSchema } from "../validators/auth.validator";

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

export const login = async (
  req: Request,
  res: Response
): Promise<void> => {
  const data = loginSchema.parse(req.body);

  const result = await AuthService.login(data);

  res.status(200).json(
    new ApiResponse(true, "Login successful", result)
  );
};

export const refresh = async (
  req: Request,
  res: Response
): Promise<void> => {
  const refreshToken = req.body?.refreshToken ?? req.body?.refresh_token ?? req.cookies?.refreshToken;

  if (!refreshToken) {
    res.status(401).json(
      new ApiResponse(false, "Refresh token is required")
    );
    return;
  }

  const result = await AuthService.refresh(refreshToken);

  res.status(200).json(
    new ApiResponse(true, "Token refreshed successfully", result)
  );
};

export const forgotPassword = async (req: Request, res: Response): Promise<void> => {
  const { email } = forgotPasswordSchema.parse(req.body);
  const result = await AuthService.requestPasswordReset(email);
  res.status(200).json(new ApiResponse(true, result.message, result));
};

export const resendResetOtp = async (req: Request, res: Response): Promise<void> => {
  const { email } = forgotPasswordSchema.parse(req.body);
  const result = await AuthService.requestPasswordReset(email);
  res.status(200).json(new ApiResponse(true, result.message));
};

export const verifyResetOtp = async (req: Request, res: Response): Promise<void> => {
  const data = verifyResetOtpSchema.parse(req.body);
  const result = await AuthService.verifyPasswordResetOtp(data.email, data.otp);
  res.status(200).json(new ApiResponse(true, "Verification successful", result));
};

export const resetPassword = async (req: Request, res: Response): Promise<void> => {
  const data = resetPasswordSchema.parse(req.body);
  const result = await AuthService.resetPassword(data.email, data.resetToken, data.newPassword);
  res.status(200).json(new ApiResponse(true, result.message));
};