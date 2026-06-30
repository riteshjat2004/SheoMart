import { User } from "../models/user.model";
import { AppError } from "../errors/AppError";

import {
  generateAccessToken,
  generateRefreshToken,
} from "../utils/jwt";
import { RegisterInput } from "../validators/auth.validator";

import {
  hashPassword,
  hashToken,
} from "../utils/password";

export class AuthService {
  static async register(data: RegisterInput) {
    const existingEmail = await User.findOne({
      email: data.email,
    });

    if (existingEmail) {
      throw new AppError("Email already exists", 409);
    }

    const existingMobile = await User.findOne({
      mobile: data.mobile,
    });

    if (existingMobile) {
      throw new AppError("Mobile number already exists", 409);
    }

    const hashedPassword = await hashPassword(data.password);

    const user = await User.create({
      ...data,
      password: hashedPassword,
    });

    const accessToken = generateAccessToken(
      user.userId,
      user.role
    );

    const refreshToken = generateRefreshToken(user.userId);

    const hashedRefreshToken = await hashToken(refreshToken);

    user.refreshToken = hashedRefreshToken;

    await user.save();

    return {
    user: {
        userId: user.userId,
        name: user.name,
        email: user.email,
        mobile: user.mobile,
        role: user.role,
        isCreditApproved: user.isCreditApproved,
        emailVerified: user.emailVerified,
        phoneVerified: user.phoneVerified,
        isActive: user.isActive,
    },
    accessToken,
    refreshToken,
    };
  }
}