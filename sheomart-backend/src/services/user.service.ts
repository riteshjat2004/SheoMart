import { User, IUser } from "../models/user.model";
import { Store } from "../models/store.model";
import { Order, ORDER_STATUS } from "../models/order.model";
import { Address } from "../models/address.model";
import { CartItem } from "../models/cart.model";
import { WishlistItem } from "../models/wishlist.model";
import { AppError } from "../errors/AppError";
import { comparePassword, hashPassword } from "../utils/password";
import { USER_ROLES } from "../constants/roles";
import type {
  AdminUserListQuery,
  CreateAdminUserInput,
  UpdateAdminUserInput,
  SuspendUserInput,
  BulkUserActionInput,
} from "../validators/user.validator";

export interface AdminUserListItem {
  userId: string;
  name: string;
  email: string;
  mobile: string;
  role: string;
  status: "active" | "inactive" | "suspended" | "deleted";
  isActive: boolean;
  isVerifiedCustomer: boolean;
  verifiedAt: Date | null;
  verifiedBy: string | null;
  isSuspended: boolean;
  suspendedReason: string | null;
  suspendedAt: Date | null;
  isDeleted: boolean;
  deletedAt: Date | null;
  emailVerified: boolean;
  phoneVerified: boolean;
  isCreditApproved: boolean;
  avatar: string;
  address: string;
  city: string;
  district: string;
  state: string;
  pincode: string;
  gender: string;
  dob: Date | null;
  lastLoginAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

function escapeRegex(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function mapAdminUser(user: Partial<IUser>): AdminUserListItem {
  const isDeleted = Boolean(user.isDeleted);
  const isSuspended = Boolean(user.isSuspended);
  const isActive = Boolean(user.isActive);

  let status: AdminUserListItem["status"] = "active";
  if (isDeleted) {
    status = "deleted";
  } else if (isSuspended) {
    status = "suspended";
  } else if (!isActive) {
    status = "inactive";
  }

  return {
    userId: user.userId ?? "",
    name: user.name ?? "",
    email: user.email ?? "",
    mobile: user.mobile ?? "",
    role: user.role ?? USER_ROLES.CUSTOMER,
    status,
    isActive,
    isVerifiedCustomer: Boolean(user.isVerifiedCustomer),
    verifiedAt: user.verifiedAt ?? null,
    verifiedBy: user.verifiedBy ?? null,
    isSuspended,
    suspendedReason: user.suspendedReason ?? null,
    suspendedAt: user.suspendedAt ?? null,
    isDeleted,
    deletedAt: user.deletedAt ?? null,
    emailVerified: Boolean(user.emailVerified),
    phoneVerified: Boolean(user.phoneVerified),
    isCreditApproved: Boolean(user.isCreditApproved),
    avatar: user.avatar ?? "",
    address: user.address ?? "",
    city: user.city ?? "",
    district: user.district ?? "",
    state: user.state ?? "",
    pincode: user.pincode ?? "",
    gender: user.gender ?? "",
    dob: user.dob ?? null,
    lastLoginAt: user.lastLoginAt ?? null,
    createdAt: user.createdAt ?? new Date(),
    updatedAt: user.updatedAt ?? new Date(),
  };
}

export class UserService {
  static async listAdminUsers(filters: AdminUserListQuery) {
    const query: Record<string, unknown> = {};

    if (filters.status === "deleted") {
      query.isDeleted = true;
    } else if (filters.status === "suspended") {
      query.isDeleted = { $ne: true };
      query.isSuspended = true;
    } else if (filters.status === "active") {
      query.isDeleted = { $ne: true };
      query.isSuspended = { $ne: true };
      query.isActive = true;
    } else if (filters.status === "inactive") {
      query.isDeleted = { $ne: true };
      query.isActive = false;
    } else {
      // Default: exclude soft-deleted unless explicitly viewing trash/deleted tab
      query.isDeleted = { $ne: true };
    }

    if (filters.role) {
      query.role = filters.role;
    }

    if (typeof filters.isVerifiedCustomer === "boolean") {
      query.isVerifiedCustomer = filters.isVerifiedCustomer;
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

    if (filters.district) {
      query.district = new RegExp(escapeRegex(filters.district), "i");
    }

    if (filters.state) {
      query.state = new RegExp(escapeRegex(filters.state), "i");
    }

    if (filters.search) {
      const search = new RegExp(escapeRegex(filters.search), "i");
      query.$or = [{ name: search }, { email: search }, { mobile: search }, { userId: search }];
    }

    const skip = (filters.page - 1) * filters.limit;
    const sortDirection: 1 | -1 = filters.sortOrder === "asc" ? 1 : -1;
    const sort = { [filters.sortBy]: sortDirection };
    const safeFields =
      "userId name email mobile role isActive isVerifiedCustomer verifiedAt verifiedBy isSuspended suspendedReason suspendedAt isDeleted deletedAt emailVerified phoneVerified isCreditApproved avatar address city district state pincode gender dob lastLoginAt createdAt updatedAt";

    const [users, total, stats] = await Promise.all([
      User.find(query).select(safeFields).sort(sort).skip(skip).limit(filters.limit).lean(),
      User.countDocuments(query),
      this.getAdminUserStats(),
    ]);

    return {
      users: users.map((user) => mapAdminUser(user as Partial<IUser>)),
      pagination: {
        page: filters.page,
        limit: filters.limit,
        total,
        totalPages: Math.ceil(total / filters.limit) || 1,
      },
      stats,
    };
  }

  static async getAdminUserStats() {
    const [
      total,
      active,
      suspended,
      deleted,
      customers,
      verifiedCustomers,
      sellers,
      admins,
    ] = await Promise.all([
      User.countDocuments({ isDeleted: { $ne: true } }),
      User.countDocuments({ isDeleted: { $ne: true }, isSuspended: { $ne: true }, isActive: true }),
      User.countDocuments({ isDeleted: { $ne: true }, isSuspended: true }),
      User.countDocuments({ isDeleted: true }),
      User.countDocuments({ role: USER_ROLES.CUSTOMER, isDeleted: { $ne: true } }),
      User.countDocuments({ role: USER_ROLES.CUSTOMER, isVerifiedCustomer: true, isDeleted: { $ne: true } }),
      User.countDocuments({ role: USER_ROLES.STORE_OWNER, isDeleted: { $ne: true } }),
      User.countDocuments({ role: USER_ROLES.PLATFORM_ADMIN, isDeleted: { $ne: true } }),
    ]);

    return {
      total,
      active,
      suspended,
      deleted,
      customers,
      verifiedCustomers,
      sellers,
      admins,
    };
  }

  static async getAdminUserDetails(userId: string) {
    const user = await User.findOne({ userId }).select("-password").lean();

    if (!user) {
      throw new AppError("User not found", 404);
    }

    const [
      addresses,
      totalOrders,
      completedOrders,
      cancelledOrders,
      spentResult,
      cartCount,
      wishlistCount,
      stores,
      recentOrders,
    ] = await Promise.all([
      Address.find({ userId }).sort({ isDefault: -1, createdAt: -1 }).lean(),
      Order.countDocuments({ userId }),
      Order.countDocuments({ userId, status: ORDER_STATUS.DELIVERED }),
      Order.countDocuments({ userId, status: ORDER_STATUS.CANCELLED }),
      Order.aggregate([
        { $match: { userId, paymentStatus: "PAID" } },
        { $group: { _id: null, totalSpent: { $sum: "$grandTotal" } } },
      ]),
      CartItem.countDocuments({ userId }),
      WishlistItem.countDocuments({ userId }),
      Store.find({ ownerId: userId })
        .select("storeId storeName slug logo badge status isVerified isActive rating totalReviews createdAt")
        .lean(),
      Order.find({ userId })
        .select("orderId invoiceNumber status grandTotal items paymentStatus fulfillmentType createdAt")
        .sort({ createdAt: -1 })
        .limit(5)
        .lean(),
    ]);

    const totalSpent = spentResult[0]?.totalSpent ?? 0;

    // Construct activity timeline
    const timeline: Array<{
      id: string;
      title: string;
      description: string;
      timestamp: Date;
      type: "created" | "verified" | "security" | "suspension" | "role";
    }> = [
      {
        id: "created",
        title: "Account Created",
        description: `Registered as ${user.role}`,
        timestamp: user.createdAt,
        type: "created",
      },
    ];

    if (user.emailVerified) {
      timeline.push({
        id: "email_verified",
        title: "Email Verified",
        description: `Verified email: ${user.email}`,
        timestamp: user.createdAt,
        type: "security",
      });
    }

    if (user.phoneVerified) {
      timeline.push({
        id: "phone_verified",
        title: "Phone Verified",
        description: `Verified mobile: ${user.mobile}`,
        timestamp: user.createdAt,
        type: "security",
      });
    }

    if (user.isVerifiedCustomer && user.verifiedAt) {
      timeline.push({
        id: "customer_verified",
        title: "Verified Customer Status Granted",
        description: `Verified by ${user.verifiedBy || "Administrator"}`,
        timestamp: user.verifiedAt,
        type: "verified",
      });
    }

    if (user.isSuspended && user.suspendedAt) {
      timeline.push({
        id: "suspended",
        title: "Account Suspended",
        description: user.suspendedReason || "Suspended by administrator",
        timestamp: user.suspendedAt,
        type: "suspension",
      });
    }

    if (user.isDeleted && user.deletedAt) {
      timeline.push({
        id: "deleted",
        title: "Account Moved to Trash",
        description: `Soft-deleted by ${user.deletedBy || "Administrator"}`,
        timestamp: user.deletedAt,
        type: "suspension",
      });
    }

    if (user.lastLoginAt) {
      timeline.push({
        id: "last_login",
        title: "Last Activity / Login",
        description: "Authenticated into platform",
        timestamp: user.lastLoginAt,
        type: "security",
      });
    }

    timeline.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

    return {
      user: mapAdminUser(user as Partial<IUser>),
      addresses,
      stores,
      recentOrders,
      stats: {
        totalOrders,
        completedOrders,
        cancelledOrders,
        totalSpent,
        cartCount,
        wishlistCount,
        storeCount: stores.length,
      },
      timeline,
    };
  }

  static async createAdminUser(data: CreateAdminUserInput, adminUserId: string) {
    const existing = await User.findOne({
      $or: [{ email: data.email }, { mobile: data.mobile }],
    });

    if (existing) {
      throw new AppError("A user with this email or mobile number already exists", 409);
    }

    const hashedPassword = await hashPassword(data.password);

    const user = new User({
      name: data.name,
      email: data.email,
      mobile: data.mobile,
      password: hashedPassword,
      role: data.role,
      isVerifiedCustomer: data.isVerifiedCustomer ?? false,
      verifiedAt: data.isVerifiedCustomer ? new Date() : null,
      verifiedBy: data.isVerifiedCustomer ? adminUserId : null,
      isActive: data.isActive ?? true,
      address: data.address || "",
      city: data.city || "",
      district: data.district || "",
      state: data.state || "",
      pincode: data.pincode || "",
      gender: data.gender || "",
      dob: data.dob ? new Date(data.dob) : null,
      emailVerified: true,
      phoneVerified: true,
    });

    await user.save();

    return mapAdminUser(user);
  }

  static async updateAdminUser(userId: string, data: UpdateAdminUserInput, adminUserId: string) {
    const user = await User.findOne({ userId });

    if (!user) {
      throw new AppError("User not found", 404);
    }

    if (data.email && data.email !== user.email) {
      const emailExists = await User.findOne({ email: data.email, userId: { $ne: userId } });
      if (emailExists) {
        throw new AppError("Email is already in use by another user", 409);
      }
      user.email = data.email;
    }

    if (data.mobile && data.mobile !== user.mobile) {
      const mobileExists = await User.findOne({ mobile: data.mobile, userId: { $ne: userId } });
      if (mobileExists) {
        throw new AppError("Mobile number is already in use by another user", 409);
      }
      user.mobile = data.mobile;
    }

    if (data.role && data.role !== user.role) {
      if (userId === adminUserId) {
        throw new AppError("You cannot modify your own administrative role", 400);
      }

      if (user.role === USER_ROLES.PLATFORM_ADMIN && data.role !== USER_ROLES.PLATFORM_ADMIN) {
        const adminCount = await User.countDocuments({
          role: USER_ROLES.PLATFORM_ADMIN,
          isDeleted: { $ne: true },
          isActive: true,
        });
        if (adminCount <= 1) {
          throw new AppError("Cannot demote the last platform administrator", 400);
        }
      }
      user.role = data.role;
    }

    if (typeof data.isVerifiedCustomer === "boolean") {
      user.isVerifiedCustomer = data.isVerifiedCustomer;
      user.verifiedAt = data.isVerifiedCustomer ? new Date() : null;
      user.verifiedBy = data.isVerifiedCustomer ? adminUserId : null;
    }

    if (typeof data.isActive === "boolean") {
      user.isActive = data.isActive;
    }

    if (data.name !== undefined) user.name = data.name;
    if (data.avatar !== undefined) user.avatar = data.avatar;
    if (data.address !== undefined) user.address = data.address;
    if (data.city !== undefined) user.city = data.city;
    if (data.district !== undefined) user.district = data.district;
    if (data.state !== undefined) user.state = data.state;
    if (data.pincode !== undefined) user.pincode = data.pincode;
    if (data.gender !== undefined) user.gender = data.gender;
    if (data.dob !== undefined) user.dob = data.dob ? new Date(data.dob) : null;

    await user.save();

    return mapAdminUser(user);
  }

  static async updateUserStatus(userId: string, data: SuspendUserInput, adminUserId: string) {
    const user = await User.findOne({ userId });

    if (!user) {
      throw new AppError("User not found", 404);
    }

    if (userId === adminUserId) {
      throw new AppError("You cannot suspend your own administrator account", 400);
    }

    if (data.isSuspended && user.role === USER_ROLES.PLATFORM_ADMIN) {
      const adminCount = await User.countDocuments({
        role: USER_ROLES.PLATFORM_ADMIN,
        isDeleted: { $ne: true },
        isSuspended: { $ne: true },
      });
      if (adminCount <= 1) {
        throw new AppError("Cannot suspend the last active platform administrator", 400);
      }
    }

    user.isSuspended = data.isSuspended;
    user.suspendedReason = data.isSuspended ? (data.suspendedReason || "Suspended by administrator") : null;
    user.suspendedAt = data.isSuspended ? new Date() : null;
    user.suspendedBy = data.isSuspended ? adminUserId : null;

    if (data.isSuspended) {
      user.sessions = [];
    }

    await user.save();

    return mapAdminUser(user);
  }

  static async updateUserRole(userId: string, newRole: string, adminUserId: string) {
    const user = await User.findOne({ userId });

    if (!user) {
      throw new AppError("User not found", 404);
    }

    if (userId === adminUserId) {
      throw new AppError("You cannot change your own role", 400);
    }

    if (user.role === USER_ROLES.PLATFORM_ADMIN && newRole !== USER_ROLES.PLATFORM_ADMIN) {
      const adminCount = await User.countDocuments({
        role: USER_ROLES.PLATFORM_ADMIN,
        isDeleted: { $ne: true },
        isActive: true,
      });
      if (adminCount <= 1) {
        throw new AppError("Cannot demote the last platform administrator", 400);
      }
    }

    user.role = newRole as IUser["role"];
    await user.save();

    return mapAdminUser(user);
  }

  static async verifyCustomer(userId: string, isVerifiedCustomer: boolean, adminUserId: string) {
    const user = await User.findOne({ userId });

    if (!user) {
      throw new AppError("User not found", 404);
    }

    user.isVerifiedCustomer = isVerifiedCustomer;
    user.verifiedAt = isVerifiedCustomer ? new Date() : null;
    user.verifiedBy = isVerifiedCustomer ? adminUserId : null;

    await user.save();

    return mapAdminUser(user);
  }

  static async deleteUser(userId: string, adminUserId: string) {
    const user = await User.findOne({ userId });

    if (!user) {
      throw new AppError("User not found", 404);
    }

    if (userId === adminUserId) {
      throw new AppError("You cannot delete your own administrator account", 400);
    }

    if (user.role === USER_ROLES.PLATFORM_ADMIN) {
      const adminCount = await User.countDocuments({
        role: USER_ROLES.PLATFORM_ADMIN,
        isDeleted: { $ne: true },
      });
      if (adminCount <= 1) {
        throw new AppError("Cannot delete the last platform administrator", 400);
      }
    }

    user.isDeleted = true;
    user.deletedAt = new Date();
    user.deletedBy = adminUserId;
    user.isActive = false;
    user.sessions = [];

    await user.save();

    return {
      message: "User moved to trash successfully",
    };
  }

  static async restoreUser(userId: string, adminUserId: string) {
    const user = await User.findOne({ userId });

    if (!user) {
      throw new AppError("User not found", 404);
    }

    user.isDeleted = false;
    user.deletedAt = null;
    user.deletedBy = null;
    user.isActive = true;

    await user.save();

    return mapAdminUser(user);
  }

  static async bulkUserAction(data: BulkUserActionInput, adminUserId: string) {
    // Prevent target being the current admin
    const targetIds = data.userIds.filter((id) => id !== adminUserId);

    if (targetIds.length === 0) {
      throw new AppError("Cannot perform bulk operations on your own administrator account", 400);
    }

    let modifiedCount = 0;

    switch (data.action) {
      case "verify": {
        const res = await User.updateMany(
          { userId: { $in: targetIds } },
          { $set: { isVerifiedCustomer: true, verifiedAt: new Date(), verifiedBy: adminUserId } }
        );
        modifiedCount = res.modifiedCount;
        break;
      }
      case "unverify": {
        const res = await User.updateMany(
          { userId: { $in: targetIds } },
          { $set: { isVerifiedCustomer: false, verifiedAt: null, verifiedBy: null } }
        );
        modifiedCount = res.modifiedCount;
        break;
      }
      case "suspend": {
        // Exclude platform admins from bulk suspension to prevent accidental lockout
        const res = await User.updateMany(
          { userId: { $in: targetIds }, role: { $ne: USER_ROLES.PLATFORM_ADMIN } },
          {
            $set: {
              isSuspended: true,
              suspendedReason: data.reason || "Bulk suspended by administrator",
              suspendedAt: new Date(),
              suspendedBy: adminUserId,
              sessions: [],
            },
          }
        );
        modifiedCount = res.modifiedCount;
        break;
      }
      case "activate": {
        const res = await User.updateMany(
          { userId: { $in: targetIds } },
          {
            $set: {
              isSuspended: false,
              suspendedReason: null,
              suspendedAt: null,
              suspendedBy: null,
              isActive: true,
            },
          }
        );
        modifiedCount = res.modifiedCount;
        break;
      }
      case "delete": {
        // Exclude platform admins from bulk deletion
        const res = await User.updateMany(
          { userId: { $in: targetIds }, role: { $ne: USER_ROLES.PLATFORM_ADMIN } },
          {
            $set: {
              isDeleted: true,
              deletedAt: new Date(),
              deletedBy: adminUserId,
              isActive: false,
              sessions: [],
            },
          }
        );
        modifiedCount = res.modifiedCount;
        break;
      }
      case "restore": {
        const res = await User.updateMany(
          { userId: { $in: targetIds } },
          {
            $set: {
              isDeleted: false,
              deletedAt: null,
              deletedBy: null,
              isActive: true,
            },
          }
        );
        modifiedCount = res.modifiedCount;
        break;
      }
      case "assign_seller": {
        const res = await User.updateMany(
          { userId: { $in: targetIds }, role: USER_ROLES.CUSTOMER },
          { $set: { role: USER_ROLES.STORE_OWNER } }
        );
        modifiedCount = res.modifiedCount;
        break;
      }
      case "remove_seller": {
        const res = await User.updateMany(
          { userId: { $in: targetIds }, role: USER_ROLES.STORE_OWNER },
          { $set: { role: USER_ROLES.CUSTOMER } }
        );
        modifiedCount = res.modifiedCount;
        break;
      }
    }

    return {
      action: data.action,
      affectedCount: modifiedCount,
      message: `Successfully executed ${data.action} on ${modifiedCount} user(s)`,
    };
  }

  // --- End Admin Methods ---

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
      district: user.district,
      state: user.state,
      pincode: user.pincode,
      gender: user.gender,
      dob: user.dob,
      isCreditApproved: user.isCreditApproved,
      emailVerified: user.emailVerified,
      phoneVerified: user.phoneVerified,
      isVerifiedCustomer: user.isVerifiedCustomer,
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
      "district",
      "state",
      "pincode",
      "gender",
      "dob",
    ];

    for (const key of Object.keys(data)) {
      if (!allowedFields.includes(key)) {
        continue;
      }

      if (key === "dob" && data[key]) {
        user.dob = new Date(data[key] as string);
      } else {
        (user as unknown as Record<string, unknown>)[key] = data[key];
      }
    }

    await user.save();

    return this.getProfile(userId);
  }

  static async changePassword(userId: string, sessionId: string, data: { currentPassword: string; newPassword: string }) {
    const user = await User.findOne({ userId }).select("+password +sessions.refreshToken");

    if (!user) {
      throw new AppError("User not found", 404);
    }

    const isCurrentPasswordValid = await comparePassword(data.currentPassword, user.password);

    if (!isCurrentPasswordValid) {
      throw new AppError("Current password is incorrect", 401);
    }

    if (await comparePassword(data.newPassword, user.password)) {
      throw new AppError("New password must be different from your current password", 400);
    }

    const hashedPassword = await hashPassword(data.newPassword);
    user.password = hashedPassword;
    user.sessions = user.sessions.filter((session) => session.sessionId === sessionId);
    user.markModified("sessions");

    await user.save();

    return {
      message: "Password changed successfully. Other devices have been signed out.",
    };
  }

  static async deleteAccount(userId: string) {
    const user = await User.findOne({ userId });

    if (!user) {
      throw new AppError("User not found", 404);
    }

    user.isActive = false;
    user.isDeleted = true;
    user.deletedAt = new Date();
    await user.save();

    return {
      message: "Account deleted successfully",
    };
  }
}

