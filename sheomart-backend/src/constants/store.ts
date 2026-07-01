export const STORE_STATUS = {
  PENDING: "pending",
  APPROVED: "approved",
  REJECTED: "rejected",
  SUSPENDED: "suspended",
} as const;

export const STORE_VERIFICATION = {
  VERIFIED: "verified",
  UNVERIFIED: "unverified",
} as const;

export type StoreStatus = typeof STORE_STATUS[keyof typeof STORE_STATUS];
export type StoreVerification = typeof STORE_VERIFICATION[keyof typeof STORE_VERIFICATION];
