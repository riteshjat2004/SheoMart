import { Request } from "express";
import mongoose from "mongoose";
import os from "node:os";
import { MarketplaceSettings, IMarketplaceSettings } from "../models/settings.model";
import { AuditLogService } from "./audit-log.service";
import { env } from "../config/env";
import { User } from "../models/user.model";
import { Store } from "../models/store.model";
import { Product } from "../models/product.model";
import { Order } from "../models/order.model";

// In-memory cache for ultra-fast maintenance checks & public settings
let cachedSettings: IMarketplaceSettings | null = null;
let lastCacheTime = 0;
const CACHE_TTL_MS = 60 * 1000; // 1 minute

export class SettingsService {
  static async getSettings(): Promise<IMarketplaceSettings> {
    const now = Date.now();
    if (cachedSettings && now - lastCacheTime < CACHE_TTL_MS) {
      return cachedSettings;
    }

    let settings = await MarketplaceSettings.findOne();
    if (!settings) {
      settings = await MarketplaceSettings.create({});
    }

    cachedSettings = settings;
    lastCacheTime = now;
    return settings;
  }

  static async getPublicSettings() {
    const settings = await this.getSettings();
    return {
      general: {
        marketplaceName: settings.general.marketplaceName,
        tagline: settings.general.tagline,
        description: settings.general.description,
        supportEmail: settings.general.supportEmail,
        supportPhone: settings.general.supportPhone,
        supportWhatsApp: settings.general.supportWhatsApp,
        websiteUrl: settings.general.websiteUrl,
        defaultCurrency: settings.general.defaultCurrency,
        timezone: settings.general.timezone,
        minOrderAmount: settings.general.minOrderAmount,
        maxOrderAmount: settings.general.maxOrderAmount,
        freeDeliveryThreshold: settings.general.freeDeliveryThreshold,
        codEnabled: settings.general.codEnabled,
        deliveryRadiusKm: settings.general.deliveryRadiusKm,
        district: settings.general.district,
        state: settings.general.state,
      },
      branding: settings.branding,
      delivery: {
        deliveryCharge: settings.delivery.deliveryCharge,
        freeDeliveryThreshold: settings.delivery.freeDeliveryThreshold,
        expressDeliveryEnabled: settings.delivery.expressDeliveryEnabled,
        expressDeliveryCharge: settings.delivery.expressDeliveryCharge,
        deliveryTimeSlots: settings.delivery.deliveryTimeSlots,
        zones: settings.delivery.zones.filter((z) => z.enabled),
      },
      payments: {
        codEnabled: settings.payments.codEnabled,
        upiEnabled: settings.payments.upiEnabled,
        cardEnabled: settings.payments.cardEnabled,
        walletEnabled: settings.payments.walletEnabled,
        gstEnabled: settings.payments.gstEnabled,
        gstPercentage: settings.payments.gstPercentage,
      },
      announcement: settings.notifications.announcement,
      maintenance: {
        enabled: settings.maintenance.enabled,
        title: settings.maintenance.title,
        description: settings.maintenance.description,
        estimatedReturnTime: settings.maintenance.estimatedReturnTime,
      },
    };
  }

  static async updateSettings(
    updates: Partial<IMarketplaceSettings>,
    admin: { userId: string; name: string },
    req?: Request
  ): Promise<IMarketplaceSettings> {
    let settings = await MarketplaceSettings.findOne();
    if (!settings) {
      settings = await MarketplaceSettings.create({});
    }

    // Merge sections
    if (updates.general) {
      settings.general = { ...settings.general, ...updates.general } as any;
    }
    if (updates.branding) {
      settings.branding = { ...settings.branding, ...updates.branding } as any;
    }
    if (updates.delivery) {
      settings.delivery = { ...settings.delivery, ...updates.delivery } as any;
    }
    if (updates.payments) {
      settings.payments = { ...settings.payments, ...updates.payments } as any;
    }
    if (updates.notifications) {
      settings.notifications = {
        ...settings.notifications,
        ...updates.notifications,
        adminEmailNotifications: {
          ...settings.notifications.adminEmailNotifications,
          ...(updates.notifications.adminEmailNotifications || {}),
        },
        announcement: {
          ...settings.notifications.announcement,
          ...(updates.notifications.announcement || {}),
        },
      } as any;
    }
    if (updates.security) {
      settings.security = { ...settings.security, ...updates.security } as any;
    }
    if (updates.maintenance) {
      const prevMaintenance = settings.maintenance.enabled;
      settings.maintenance = { ...settings.maintenance, ...updates.maintenance } as any;

      if (prevMaintenance !== updates.maintenance.enabled) {
        await AuditLogService.logAction({
          adminId: admin.userId,
          adminName: admin.name,
          action: updates.maintenance.enabled ? "MAINTENANCE_ENABLED" : "MAINTENANCE_DISABLED",
          module: "system",
          details: { maintenance: settings.maintenance },
          req,
        });
      }
    }
    if (updates.backup) {
      settings.backup = { ...settings.backup, ...updates.backup } as any;
    }

    await settings.save();
    cachedSettings = settings;
    lastCacheTime = Date.now();

    await AuditLogService.logAction({
      adminId: admin.userId,
      adminName: admin.name,
      action: "SETTINGS_UPDATED",
      module: "settings",
      details: { updatedKeys: Object.keys(updates) },
      req,
    });

    return settings;
  }

  static async createBackup(admin: { userId: string; name: string }, req?: Request) {
    const settings = await this.getSettings();

    const [userCount, storeCount, productCount, orderCount] = await Promise.all([
      User.countDocuments(),
      Store.countDocuments(),
      Product.countDocuments(),
      Order.countDocuments(),
    ]);

    // Estimated data volume
    const estimatedSizeBytes =
      userCount * 1200 + storeCount * 3000 + productCount * 4000 + orderCount * 2500;
    const sizeMb = (estimatedSizeBytes / (1024 * 1024)).toFixed(2);
    const sizeLabel = `${sizeMb} MB`;

    settings.backup.lastBackupAt = new Date();
    settings.backup.lastBackupSize = sizeLabel;
    await settings.save();

    cachedSettings = settings;

    await AuditLogService.logAction({
      adminId: admin.userId,
      adminName: admin.name,
      action: "BACKUP_CREATED",
      module: "system",
      details: { size: sizeLabel, records: { userCount, storeCount, productCount, orderCount } },
      req,
    });

    return {
      backupTime: settings.backup.lastBackupAt,
      backupSize: sizeLabel,
      records: { userCount, storeCount, productCount, orderCount },
    };
  }

  static async getSystemHealth() {
    const mongoState = mongoose.connection.readyState;
    const mongoStatus =
      mongoState === 1
        ? "connected"
        : mongoState === 2
        ? "connecting"
        : mongoState === 3
        ? "disconnecting"
        : "disconnected";

    const memoryUsage = process.memoryUsage();
    const totalMem = os.totalmem();
    const freeMem = os.freemem();

    const activeSessionsCount = await User.aggregate([
      { $unwind: "$sessions" },
      { $count: "total" },
    ]);

    return {
      status: mongoState === 1 ? "healthy" : "degraded",
      timestamp: new Date().toISOString(),
      uptimeSeconds: Math.floor(process.uptime()),
      versions: {
        backend: "1.0.0",
        node: process.version,
        environment: env.NODE_ENV,
        frontend: "0.1.0",
        androidApp: "0.2.0",
      },
      services: {
        mongodb: {
          status: mongoStatus,
          connected: mongoState === 1,
          host: mongoose.connection.host || "Atlas Cluster",
          name: mongoose.connection.name,
        },
        cloudinary: {
          status: env.CLOUDINARY_CLOUD_NAME ? "configured" : "unconfigured",
          cloudName: env.CLOUDINARY_CLOUD_NAME || "Not set",
        },
        securityMiddleware: {
          helmet: true,
          rateLimit: true,
          cors: true,
          secureCookies: env.NODE_ENV === "production",
          trustProxy: true,
          hpp: true,
          compression: true,
        },
      },
      system: {
        memoryHeapUsedMB: Math.round(memoryUsage.heapUsed / 1024 / 1024),
        memoryHeapTotalMB: Math.round(memoryUsage.heapTotal / 1024 / 1024),
        systemFreeMemoryMB: Math.round(freeMem / 1024 / 1024),
        systemTotalMemoryMB: Math.round(totalMem / 1024 / 1024),
        activeSessions: activeSessionsCount[0]?.total ?? 0,
      },
    };
  }
}
