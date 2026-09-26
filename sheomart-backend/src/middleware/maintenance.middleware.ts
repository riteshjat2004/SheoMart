import { Request, Response, NextFunction } from "express";
import { SettingsService } from "../services/settings.service";
import { USER_ROLES } from "../constants/roles";

export async function checkMaintenanceMode(req: Request, res: Response, next: NextFunction) {
  try {
    // Exempt admin, settings, and auth endpoints from maintenance lock
    const exemptPaths = [
      "/api/v1/auth",
      "/api/v1/settings",
      "/api/v1/admin",
      "/api/v1/users/admin",
    ];

    if (exemptPaths.some((prefix) => req.path.startsWith(prefix))) {
      return next();
    }

    // If an authenticated admin is performing the request, allow it
    if ((req as any).user && (req as any).user.role === USER_ROLES.PLATFORM_ADMIN) {
      return next();
    }

    const settings = await SettingsService.getSettings();

    if (settings.maintenance?.enabled) {
      return res.status(503).json({
        success: false,
        maintenance: true,
        message: settings.maintenance.title || "Platform is currently under maintenance",
        description:
          settings.maintenance.description ||
          "SheoMart is temporarily unavailable for updates. Please try again soon.",
        estimatedReturnTime: settings.maintenance.estimatedReturnTime || null,
      });
    }

    return next();
  } catch (error) {
    // Fail open if settings lookup encounters an issue
    console.error("[MaintenanceMiddleware] Error checking maintenance status:", error);
    return next();
  }
}
