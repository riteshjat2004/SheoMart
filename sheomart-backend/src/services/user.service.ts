import { User } from "../models/user.model";
import { AppError } from "../errors/AppError";
import { comparePassword, hashPassword } from "../utils/password";

export class UserService {
  static async getProfile(userId: string) {
    const user = await User.findOne({ userId }).select("-password");

    if (!user) {
      throw new AppError("User not found", 404);
    }

    return {
      userId: user.userId,
      name: user.name,
      email: user.email,
      mobile: user.mobile,
      role: user.role,
      avatar: user.avatar,
      address: user.address,
      city: user.city,
      state: user.state,
      pincode: user.pincode,
      isCreditApproved: user.isCreditApproved,
      emailVerified: user.emailVerified,
      phoneVerified: user.phoneVerified,
      isActive: user.isActive,
    };
  }

  static async updateProfile(userId: string, data: Record<string, unknown>) {
    const user = await User.findOne({ userId });

    if (!user) {
      throw new AppError("User not found", 404);
    }

    const allowedFields = [
      "name",
      "mobile",
      "avatar",
      "address",
      "city",
      "state",
      "pincode",
    ];

    for (const key of Object.keys(data)) {
      if (!allowedFields.includes(key)) {
        continue;
      }

      (user as unknown as Record<string, unknown>)[key] = data[key];
    }

    await user.save();

    return this.getProfile(userId);
  }

  static async changePassword(userId: string, data: { currentPassword: string; newPassword: string }) {
    const user = await User.findOne({ userId }).select("+password");

    if (!user) {
      throw new AppError("User not found", 404);
    }

    const isCurrentPasswordValid = await comparePassword(data.currentPassword, user.password);

    if (!isCurrentPasswordValid) {
      throw new AppError("Current password is incorrect", 401);
    }

    const hashedPassword = await hashPassword(data.newPassword);
    user.password = hashedPassword;

    await user.save();

    return {
      message: "Password changed successfully",
    };
  }

  static async deleteAccount(userId: string) {
    const user = await User.findOne({ userId });

    if (!user) {
      throw new AppError("User not found", 404);
    }

    user.isActive = false;
    await user.save();

    return {
      message: "Account deleted successfully",
    };
  }
}
