import express from "express";
import cors from "cors";
import helmet from "helmet";
import compression from "compression";
import cookieParser from "cookie-parser";

import rateLimit from "express-rate-limit";
import hpp from "hpp";

import { env } from "./config/env";

const app = express();

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

app.use(
  rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
    standardHeaders: true,
  })
);

app.get("/", (_, res) => {
  res.json({
    success: true,
    message: "Welcome to SheoMart API 🚀",
  });
});

export default app;
