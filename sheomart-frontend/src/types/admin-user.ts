import type { UserRole } from "@/types/auth";

export type AdminUserStatus = "active" | "inactive" | "suspended" | "deleted";

export interface AdminUser {
  userId: string;
  name: string;
  email: string;
  mobile: string;
  role: UserRole;
  status: AdminUserStatus;
  isActive: boolean;
  isVerifiedCustomer: boolean;
  verifiedAt?: string | null;
  verifiedBy?: string | null;
  isSuspended: boolean;
  suspendedReason?: string | null;
  suspendedAt?: string | null;
  isDeleted: boolean;
  deletedAt?: string | null;
  emailVerified: boolean;
  phoneVerified: boolean;
  isCreditApproved: boolean;
  avatar?: string;
  address?: string;
  city?: string;
  district?: string;
  state?: string;
  pincode?: string;
  gender?: string;
  dob?: string | null;
  lastLoginAt?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface AdminUserStats {
  total: number;
  active: number;
  suspended: number;
  deleted: number;
  customers: number;
  verifiedCustomers: number;
  sellers: number;
  admins: number;
}

export interface AdminUserAddress {
  addressId: string;
  fullName: string;
  mobile: string;
  house: string;
  street: string;
  landmark?: string;
  city: string;
  state: string;
  pincode: string;
  addressType: string;
  isDefault: boolean;
}

export interface AdminUserStoreSummary {
  storeId: string;
  storeName: string;
  slug: string;
  logo?: string;
  badge: string;
  status: string;
  isVerified: boolean;
  isActive: boolean;
  rating: number;
  totalReviews: number;
  createdAt: string;
}

export interface AdminUserRecentOrder {
  orderId: string;
  invoiceNumber?: string;
  status: string;
  grandTotal: number;
  paymentStatus: string;
  fulfillmentType: string;
  createdAt: string;
}

export interface AdminUserTimelineEvent {
  id: string;
  title: string;
  description: string;
  timestamp: string;
  type: "created" | "verified" | "security" | "suspension" | "role";
}

export interface AdminUserDetails {
  user: AdminUser;
  addresses: AdminUserAddress[];
  stores: AdminUserStoreSummary[];
  recentOrders: AdminUserRecentOrder[];
  stats: {
    totalOrders: number;
    completedOrders: number;
    cancelledOrders: number;
    totalSpent: number;
    cartCount: number;
    wishlistCount: number;
    storeCount: number;
  };
  timeline: AdminUserTimelineEvent[];
}

export interface AdminUserPagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface AdminUserListResponse {
  users: AdminUser[];
  pagination: AdminUserPagination;
  stats?: AdminUserStats;
}

export interface AdminUserFilters {
  search?: string;
  role?: UserRole;
  status?: AdminUserStatus | "all";
  isVerifiedCustomer?: boolean;
  isActive?: boolean;
  emailVerified?: boolean;
  phoneVerified?: boolean;
  district?: string;
  state?: string;
  page: number;
  limit: number;
  sortBy?: "createdAt" | "name" | "email" | "role" | "lastLoginAt";
  sortOrder?: "asc" | "desc";
}

export interface CreateAdminUserInput {
  name: string;
  email: string;
  mobile: string;
  password: string;
  role: UserRole;
  isVerifiedCustomer?: boolean;
  isActive?: boolean;
  address?: string;
  city?: string;
  district?: string;
  state?: string;
  pincode?: string;
  gender?: string;
  dob?: string;
}

export interface UpdateAdminUserInput {
  name?: string;
  email?: string;
  mobile?: string;
  role?: UserRole;
  isVerifiedCustomer?: boolean;
  isActive?: boolean;
  avatar?: string;
  address?: string;
  city?: string;
  district?: string;
  state?: string;
  pincode?: string;
  gender?: string;
  dob?: string;
}

