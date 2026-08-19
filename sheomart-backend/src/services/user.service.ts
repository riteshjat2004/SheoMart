import { User } from "../models/user.model";
import { AppError } from "../errors/AppError";
import { comparePassword, hashPassword } from "../utils/password";
import type { AdminUserListQuery } from "../validators/user.validator";

export interface AdminUserListItem {
  userId: string;
  name: string;
  email: string;
  mobile: string;
  role: string;
  isActive: boolean;
  emailVerified: boolean;
  phoneVerified: boolean;
  isCreditApproved: boolean;
  city: string;
  state: string;
  createdAt: Date;
  updatedAt: Date;
}

function escapeRegex(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function mapAdminUser(user: AdminUserListItem): AdminUserListItem {
  return {
    userId: user.userId,
    name: user.name,
    email: user.email,
    mobile: user.mobile,
    role: user.role,
    isActive: user.isActive,
    emailVerified: user.emailVerified,
    phoneVerified: user.phoneVerified,
    isCreditApproved: user.isCreditApproved,
    city: user.city,
    state: user.state,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  };
}

export class UserService {
  static async listAdminUsers(filters: AdminUserListQuery) {
    const query: Record<string, unknown> = {};

    if (filters.role) {
      query.role = filters.role;
    }

    if (typeof filters.isActive === "boolean") {
      query.isActive = filters.isActive;
    }

    if (typeof filters.emailVerified === "boolean") {
      query.emailVerified = filters.emailVerified;
    }

    if (typeof filters.phoneVerified === "boolean") {
      query.phoneVerified = filters.phoneVerified;
    }

    if (filters.search) {
      const search = new RegExp(escapeRegex(filters.search), "i");
      query.$or = [{ name: search }, { email: search }, { mobile: search }, { userId: search }];
    }

    const skip = (filters.page - 1) * filters.limit;
    const sortDirection: 1 | -1 = filters.sortOrder === "asc" ? 1 : -1;
    const sort = { [filters.sortBy]: sortDirection };
    const safeFields = "userId name email mobile role isActive emailVerified phoneVerified isCreditApproved city state createdAt updatedAt";

    const [users, total] = await Promise.all([
      User.find(query).select(safeFields).sort(sort).skip(skip).limit(filters.limit).lean(),
      User.countDocuments(query),
    ]);

    return {
      users: users.map((user) => mapAdminUser(user as AdminUserListItem)),
      pagination: {
        page: filters.page,
        limit: filters.limit,
        total,
        totalPages: Math.ceil(total / filters.limit),
      },
    };
  }

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
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
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
