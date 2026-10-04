import { Schema, model, Document } from "mongoose";

export interface IMarketplaceSettings extends Document {
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
    defaultTheme: "dark" | "light";
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
    zones: Array<{
      id: string;
      name: string;
      pincodes: string[];
      enabled: boolean;
    }>;
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
    lastBackupAt: Date | null;
    lastBackupSize: string | null;
    autoBackupEnabled: boolean;
    autoBackupSchedule: string;
  };
  updatedAt: Date;
  createdAt: Date;
}

const zoneSchema = new Schema(
  {
    id: { type: String, required: true },
    name: { type: String, required: true },
    pincodes: { type: [String], default: [] },
    enabled: { type: Boolean, default: true },
  },
  { _id: false }
);

const settingsSchema = new Schema<IMarketplaceSettings>(
  {
    general: {
      marketplaceName: { type: String, default: "SheoMart" },
      tagline: { type: String, default: "Sheopur's Multi-Store Hyperlocal Marketplace" },
      description: {
        type: String,
        default: "Hyperlocal marketplace connecting consumers and sellers across Sheopur district.",
      },
      supportEmail: { type: String, default: "support@sheomart.com" },
      supportPhone: { type: String, default: "+91 98765 43210" },
      supportWhatsApp: { type: String, default: "+91 98765 43210" },
      websiteUrl: { type: String, default: "https://sheomart.com" },
      defaultCurrency: { type: String, default: "INR" },
      timezone: { type: String, default: "Asia/Kolkata" },
      language: { type: String, default: "en" },
      country: { type: String, default: "India" },
      state: { type: String, default: "Madhya Pradesh" },
      district: { type: String, default: "Sheopur" },
      minOrderAmount: { type: Number, default: 0 },
      maxOrderAmount: { type: Number, default: 50000 },
      freeDeliveryThreshold: { type: Number, default: 499 },
      codEnabled: { type: Boolean, default: true },
      deliveryRadiusKm: { type: Number, default: 15 },
    },
    branding: {
      logoUrl: { type: String, default: "" },
      darkLogoUrl: { type: String, default: "" },
      faviconUrl: { type: String, default: "" },
      heroBannerUrl: { type: String, default: "" },
      appBannerUrl: { type: String, default: "" },
      splashImageUrl: { type: String, default: "" },
      themePrimary: { type: String, default: "#059669" },
      themeSecondary: { type: String, default: "#10b981" },
      themeAccent: { type: String, default: "#d97706" },
      defaultTheme: { type: String, enum: ["dark", "light"], default: "dark" },
    },
    delivery: {
      deliveryCharge: { type: Number, default: 40 },
      freeDeliveryThreshold: { type: Number, default: 499 },
      expressDeliveryEnabled: { type: Boolean, default: true },
      expressDeliveryCharge: { type: Number, default: 80 },
      deliveryRadiusKm: { type: Number, default: 15 },
      deliveryStartTime: { type: String, default: "08:00" },
      deliveryEndTime: { type: String, default: "22:00" },
      deliveryTimeSlots: {
        type: [String],
        default: [
          "08:00 - 11:00",
          "11:00 - 14:00",
          "14:00 - 17:00",
          "17:00 - 20:00",
          "20:00 - 22:00",
        ],
      },
      zones: {
        type: [zoneSchema],
        default: [
          { id: "zone-sheopur-city", name: "Sheopur City", pincodes: ["476337"], enabled: true },
          { id: "zone-nearby-areas", name: "Nearby Suburbs & Tehsils", pincodes: ["476338", "476339"], enabled: true },
          { id: "zone-villages", name: "Outlying Villages (Future)", pincodes: [], enabled: false },
        ],
      },
    },
    payments: {
      codEnabled: { type: Boolean, default: true },
      upiEnabled: { type: Boolean, default: true },
      cardEnabled: { type: Boolean, default: true },
      walletEnabled: { type: Boolean, default: false },
      razorpayEnabled: { type: Boolean, default: true },
      stripeEnabled: { type: Boolean, default: false },
      gstEnabled: { type: Boolean, default: true },
      gstPercentage: { type: Number, default: 5 },
      deliveryTaxPercentage: { type: Number, default: 18 },
      serviceTaxPercentage: { type: Number, default: 0 },
      allowCouponStacking: { type: Boolean, default: false },
      maxCouponsPerOrder: { type: Number, default: 1 },
      autoApplyCoupons: { type: Boolean, default: true },
      welcomeCouponEnabled: { type: Boolean, default: true },
    },
    notifications: {
      adminEmailNotifications: {
        newUserSignup: { type: Boolean, default: true },
        newStoreRegistration: { type: Boolean, default: true },
        storeApproval: { type: Boolean, default: true },
        newOrder: { type: Boolean, default: true },
        cancelledOrder: { type: Boolean, default: true },
        reviewReport: { type: Boolean, default: true },
        couponExpiry: { type: Boolean, default: false },
        lowStockAlert: { type: Boolean, default: true },
      },
      adminNotificationEmail: { type: String, default: "admin@sheomart.com" },
      announcement: {
        enabled: { type: Boolean, default: false },
        showOnHomepage: { type: Boolean, default: false },
        title: { type: String, default: "Welcome to SheoMart!" },
        description: { type: String, default: "Enjoy free same-day hyperlocal delivery across Sheopur on orders over ₹499." },
        backgroundColor: { type: String, default: "emerald" },
        linkText: { type: String, default: "Explore Products" },
        linkUrl: { type: String, default: "/explore" },
      },
    },
    security: {
      maxLoginAttempts: { type: Number, default: 5 },
      lockoutDurationMinutes: { type: Number, default: 15 },
      passwordExpiryDays: { type: Number, default: 90 },
      requireStrongPassword: { type: Boolean, default: true },
      requireEmailVerification: { type: Boolean, default: false },
      requirePhoneVerification: { type: Boolean, default: true },
      twoFactorAuthEnabled: { type: Boolean, default: false },
    },
    maintenance: {
      enabled: { type: Boolean, default: false },
      title: { type: String, default: "We'll be back soon" },
      description: {
        type: String,
        default: "We're making a few improvements to SheoMart. Please check back shortly.",
      },
      estimatedReturnTime: { type: String, default: null },
    },
    backup: {
      lastBackupAt: { type: Date, default: null },
      lastBackupSize: { type: String, default: null },
      autoBackupEnabled: { type: Boolean, default: true },
      autoBackupSchedule: { type: String, default: "daily" },
    },
  },
  { timestamps: true }
);

export const MarketplaceSettings = model<IMarketplaceSettings>(
  "MarketplaceSettings",
  settingsSchema
);
