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

// Health Route
app.get("/", (_req, res) => {
  res.json(new ApiResponse(true, "Welcome to SheoMart API 🚀"));
});

// Global Error Handler (Always Last)
app.use(errorHandler);

export default app;