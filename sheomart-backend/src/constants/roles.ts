export const USER_ROLES = {
  CUSTOMER: "customer",
  STORE_OWNER: "store_owner",
  PLATFORM_ADMIN: "platform_admin",
} as const;

export type UserRole =
  typeof USER_ROLES[keyof typeof USER_ROLES];
