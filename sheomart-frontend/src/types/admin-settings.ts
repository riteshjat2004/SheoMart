export interface DeliveryZone {
  id: string;
  name: string;
  pincodes: string[];
  enabled: boolean;
}

export interface MarketplaceSettings {
  general: {
    marketplaceName: string;
    tagline: string;
    description: string;
    supportEmail: string;
    supportPhone: string;
    supportWhatsApp: string;
    websiteUrl: string;
    defaultCurrency: string;
    timezone: string;
    language: string;
    country: string;
    state: string;
    district: string;
    minOrderAmount: number;
    maxOrderAmount: number;
    freeDeliveryThreshold: number;
    codEnabled: boolean;
    deliveryRadiusKm: number;
  };
  branding: {
    logoUrl: string;
    darkLogoUrl: string;
    faviconUrl: string;
    heroBannerUrl: string;
    appBannerUrl: string;
    splashImageUrl: string;
    themePrimary: string;
    themeSecondary: string;
    themeAccent: string;
    defaultTheme?: "dark" | "light";
  };
  delivery: {
    deliveryCharge: number;
    freeDeliveryThreshold: number;
    expressDeliveryEnabled: boolean;
    expressDeliveryCharge: number;
    deliveryRadiusKm: number;
    deliveryStartTime: string;
    deliveryEndTime: string;
    deliveryTimeSlots: string[];
    zones: DeliveryZone[];
  };
  payments: {
    codEnabled: boolean;
    upiEnabled: boolean;
    cardEnabled: boolean;
    walletEnabled: boolean;
    razorpayEnabled: boolean;
    stripeEnabled: boolean;
    gstEnabled: boolean;
    gstPercentage: number;
    deliveryTaxPercentage: number;
    serviceTaxPercentage: number;
    allowCouponStacking: boolean;
    maxCouponsPerOrder: number;
    autoApplyCoupons: boolean;
    welcomeCouponEnabled: boolean;
  };
  notifications: {
    adminEmailNotifications: {
      newUserSignup: boolean;
      newStoreRegistration: boolean;
      storeApproval: boolean;
      newOrder: boolean;
      cancelledOrder: boolean;
      reviewReport: boolean;
      couponExpiry: boolean;
      lowStockAlert: boolean;
    };
    adminNotificationEmail: string;
    announcement: {
      enabled: boolean;
      showOnHomepage: boolean;
      title: string;
      description: string;
      backgroundColor: string;
      linkText?: string;
      linkUrl?: string;
    };
  };
  security: {
    maxLoginAttempts: number;
    lockoutDurationMinutes: number;
    passwordExpiryDays: number;
    requireStrongPassword: boolean;
    requireEmailVerification: boolean;
    requirePhoneVerification: boolean;
    twoFactorAuthEnabled: boolean;
  };
  maintenance: {
    enabled: boolean;
    title: string;
    description: string;
    estimatedReturnTime: string | null;
  };
  backup: {
    lastBackupAt: string | null;
    lastBackupSize: string | null;
    autoBackupEnabled: boolean;
    autoBackupSchedule: string;
  };
  updatedAt?: string;
  createdAt?: string;
}

export interface AdminSession {
  sessionId: string;
  isCurrent: boolean;
  browser: string;
  os: string;
  deviceType: "Desktop" | "Mobile" | "Tablet";
  ipAddress: string;
  userAgent: string;
  createdAt: string;
  lastUsedAt: string;
}

export interface AuditLogItem {
  id: string;
  adminId: string;
  adminName: string;
  action: string;
  module: "settings" | "security" | "users" | "stores" | "products" | "promotions" | "orders" | "system";
  details: Record<string, any>;
  ip: string;
  userAgent: string;
  createdAt: string;
}

export interface AuditLogListResponse {
  logs: AuditLogItem[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface AuditLogFilters {
  page: number;
  limit: number;
  module?: string;
  action?: string;
  search?: string;
  from?: string;
  to?: string;
}

export interface SystemHealthData {
  status: "healthy" | "degraded";
  timestamp: string;
  uptimeSeconds: number;
  versions: {
    backend: string;
    node: string;
    environment: string;
    frontend: string;
    androidApp: string;
  };
  services: {
    mongodb: {
      status: string;
      connected: boolean;
      host: string;
      name: string;
    };
    cloudinary: {
      status: string;
      cloudName: string;
    };
    securityMiddleware: {
      helmet: boolean;
      rateLimit: boolean;
      cors: boolean;
      secureCookies: boolean;
      trustProxy: boolean;
      hpp: boolean;
      compression: boolean;
    };
  };
  system: {
    memoryHeapUsedMB: number;
    memoryHeapTotalMB: number;
    systemFreeMemoryMB: number;
    systemTotalMemoryMB: number;
    activeSessions: number;
  };
}

export interface SecurityStatusData {
  jwtSecurity: {
    accessTokenExpiry: string;
    refreshTokenExpiry: string;
    algorithm: string;
    tokenRotation: boolean;
    secureCookies: boolean;
  };
  middlewareChecks: {
    helmet: { enabled: boolean; status: string };
    rateLimiter: { enabled: boolean; status: string };
    cors: { enabled: boolean; origin: string };
    mongoSanitize: { enabled: boolean; status: string };
    hpp: { enabled: boolean; status: string };
    compression: { enabled: boolean; status: string };
  };
  policies: {
    maxLoginAttempts: number;
    lockoutDurationMinutes: number;
    passwordExpiryDays: number;
    requireStrongPassword: boolean;
    requireEmailVerification: boolean;
    requirePhoneVerification: boolean;
    twoFactorAuthEnabled: boolean;
  };
  maintenance: {
    enabled: boolean;
    title: string;
    estimatedReturnTime: string | null;
  };
}
