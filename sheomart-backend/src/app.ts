import express from "express";
import cors from "cors";
import helmet from "helmet";
import compression from "compression";
import cookieParser from "cookie-parser";
import rateLimit from "express-rate-limit";
import hpp from "hpp";

import { env } from "./config/env";
import { ApiResponse } from "./utils/apiResponse";
import { errorHandler } from "./handlers/errorHandler";
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

const app = express();

// Security Middleware
app.use(
  cors({
    origin: env.CORS_ORIGIN,
    credentials: true,
  })
);

app.use(helmet());
app.use(compression());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(hpp());

// Rate Limiter
app.use(
  rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
    standardHeaders: true,
  })
);

app.use("/api/v1/auth", authRoutes);

// Health Route
app.get("/", (_req, res) => {
  res.json(new ApiResponse(true, "Welcome to SheoMart API 🚀"));
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
app.use("/api/home", homeRoutes);
// Global Error Handler (Always Last)
app.use(errorHandler);

export default app;