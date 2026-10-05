import express from "express";
import cors from "cors";
import helmet from "helmet";
import compression from "compression";
import cookieParser from "cookie-parser";
import hpp from "hpp";

import { env } from "./config/env";
import { ApiResponse } from "./utils/apiResponse";
import { errorHandler } from "./handlers/errorHandler";
import { mongoSanitize, enforceContentType } from "./middleware/sanitize.middleware";
import { csrfProtection } from "./middleware/csrf.middleware";
import {
  apiGeneralLimiter,
  billingPosLimiter,
  searchLimiter,
  analyticsLimiter,
} from "./middleware/rate-limit.middleware";

import authRoutes from "./routes/auth.routes";
import userRoutes from "./routes/user.routes";
import storeRoutes from "./routes/store.routes";
import categoryRoutes from "./routes/category.routes";
import productRoutes from "./routes/product.routes";
import cartRoutes from "./routes/cart.routes";
import wishlistRoutes from "./routes/wishlist.routes";
import inventoryRoutes from "./routes/inventory.routes";
import reviewRoutes from "./routes/review.routes";
import addressRoutes from "./routes/address.routes";
import orderRoutes from "./routes/order.routes";
import billingRoutes from "./routes/billing.routes";

import paymentRoutes from "./routes/payment.routes";
import analyticsRoutes from "./routes/analytics.routes";
import searchRoutes from "./routes/search.routes";
import homeRoutes from "./routes/home.routes";
import promotionRoutes from "./routes/promotion.routes";
import platformFeeRoutes from "./routes/platformFee.routes";
import sellerPasswordResetRoutes from "./routes/seller-password-reset.routes";
import adminPasswordResetRoutes from "./routes/admin-password-reset.routes";
import settingsRoutes from "./routes/settings.routes";
import securityRoutes from "./routes/security.routes";
import sellerCouponRoutes from "./routes/seller-coupon.routes";
import supportRoutes from "./routes/support.routes";
import notificationRoutes from "./routes/notification.routes";
import { checkMaintenanceMode } from "./middleware/maintenance.middleware";

const app = express();
app.set("trust proxy", 1);

// ── Security & Header Hardening ──────────────────────────────────────────────
app.use(
  cors({
    origin: [env.CORS_ORIGIN, env.FRONTEND_URL].filter(
      (origin): origin is string => Boolean(origin)
    ),
    credentials: true,
  })
);

app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'", "'unsafe-inline'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        imgSrc: ["'self'", "data:", "blob:", "https://res.cloudinary.com", "https://*.razorpay.com"],
        connectSrc: ["'self'", env.CORS_ORIGIN || "*", "https://api.razorpay.com"],
        frameAncestors: ["'none'"],
        objectSrc: ["'none'"],
        upgradeInsecureRequests: env.NODE_ENV === "production" ? [] : null,
      },
    },
    crossOriginEmbedderPolicy: false,
    crossOriginResourcePolicy: { policy: "cross-origin" },
    hsts: {
      maxAge: 31536000,
      includeSubDomains: true,
      preload: true,
    },
    referrerPolicy: { policy: "strict-origin-when-cross-origin" },
    frameguard: { action: "deny" },
    noSniff: true,
  })
);

// Mozilla Observatory-ready Permissions & Cross-Domain headers
app.use((_req, res, next) => {
  res.setHeader(
    "Permissions-Policy",
    "camera=(), microphone=(), geolocation=(), payment=(self 'https://api.razorpay.com')"
  );
  res.setHeader("X-Permitted-Cross-Domain-Policies", "none");
  next();
});

app.use(compression());
app.use(express.json({ limit: "2mb" }));
app.use(express.urlencoded({ extended: true, limit: "2mb" }));
app.use(cookieParser());
app.use(mongoSanitize);
app.use(enforceContentType);
app.use(csrfProtection);
app.use(hpp());

// ── Route-Specific Rate Limiters (replaces restrictive global 100 limiter) ─────
app.use("/api/v1/search", searchLimiter);
app.use("/api/v1/billing", billingPosLimiter);
app.use("/api/v1/analytics", analyticsLimiter);
app.use(apiGeneralLimiter);

// ── API Routes ───────────────────────────────────────────────────────────────
app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/settings", settingsRoutes);
app.use("/api/v1/admin/security", securityRoutes);

// Maintenance Mode Checker (Blocks public traffic when maintenance mode is active)
app.use(checkMaintenanceMode);

// Health Route
app.get("/", (_req, res) => {
  res.json(new ApiResponse(true, "Welcome to SheoMart API 🚀"));
});

app.get("/health", (_req, res) => {
  res.json(new ApiResponse(true, "Healthy"));
});

app.use("/api/v1/users", userRoutes);
app.use("/api/v1/stores", storeRoutes);
app.use("/api/v1/categories", categoryRoutes);
app.use("/api/v1/products", productRoutes);
app.use("/api/v1/cart", cartRoutes);
app.use("/api/v1/wishlist", wishlistRoutes);
app.use("/api/v1/addresses", addressRoutes);
app.use("/api/v1/orders", orderRoutes);
app.use("/api/v1/inventory", inventoryRoutes);
app.use("/api/v1/billing", billingRoutes);
app.use("/api/v1", reviewRoutes);
app.use("/api/v1/payments", paymentRoutes);
app.use("/api/v1/analytics", analyticsRoutes);
app.use("/api/v1/search", searchRoutes);
app.use("/api/v1/promotions", promotionRoutes);
app.use("/api/v1/seller/coupons", sellerCouponRoutes);
app.use("/api/v1/store/coupons", sellerCouponRoutes);
app.use("/api/v1/platform-fee", platformFeeRoutes);
app.use("/api/v1", sellerPasswordResetRoutes);
app.use("/api/v1/admin", adminPasswordResetRoutes);
app.use("/api/v1/support", supportRoutes);
app.use("/api/v1/notifications", notificationRoutes);
app.use("/api/home", homeRoutes);

// Global Error Handler (Always Last)
app.use(errorHandler);

export default app;