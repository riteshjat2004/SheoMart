import { Request, Response, NextFunction } from "express";
import { SettingsService } from "../services/settings.service";
import { USER_ROLES } from "../constants/roles";
import { authenticate, AuthRequest } from "./auth.middleware";

export async function checkMaintenanceMode(req: Request, res: Response, next: NextFunction) {
  try {
    // Keep sign-in, settings, and admin security routes available during maintenance.
    const exemptPaths = [
      "/api/v1/auth",
      "/api/v1/settings",
      "/api/v1/admin",
      "/api/v1/users/admin",
    ];

    if (
      req.path === "/" ||
      req.path === "/health" ||
      exemptPaths.some((prefix) => req.path.startsWith(prefix))
    ) {
      return next();
    }

    const settings = await SettingsService.getSettings();
    if (!settings.maintenance?.enabled) {
      return next();
    }

    // Route-level authentication runs after this middleware, so authenticate an
    // explicitly supplied token here to allow platform admins full bypass access.
    if (req.headers.authorization?.startsWith("Bearer ")) {
      try {
        const authReq = req as AuthRequest;
        await new Promise<void>((resolve, reject) => {
          authenticate(authReq, res, (error) => {
            if (error) reject(error);
            else resolve();
          });
        });
        if (authReq.user?.role === USER_ROLES.PLATFORM_ADMIN) {
          return next();
        }
      } catch {
        // If token verification fails (e.g. expired or invalid token for customer),
        // do not abort to next(authError); fall through to the maintenance response.
      }
    }

    return res.status(503).json({
      success: false,
      maintenance: true,
      message: settings.maintenance.title || "We'll be back soon",
      description:
        settings.maintenance.description ||
        "We're making a few improvements to SheoMart. Please check back shortly.",
      estimatedReturnTime: settings.maintenance.estimatedReturnTime || null,
    });
  } catch (error) {
    // Fail open if settings lookup encounters an issue
    console.error("[MaintenanceMiddleware] Error checking maintenance status:", error);
    return next();
  }
}
