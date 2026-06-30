import dotenv from "dotenv";

dotenv.config();

export const env = {
  PORT: Number(process.env.PORT) || 5000,

  NODE_ENV: process.env.NODE_ENV || "development",

  MONGODB_URI: process.env.MONGODB_URI || "",

  JWT_ACCESS_SECRET: process.env.JWT_ACCESS_SECRET || "",

  JWT_REFRESH_SECRET: process.env.JWT_REFRESH_SECRET || "",

  JWT_ACCESS_EXPIRES_IN: process.env.JWT_ACCESS_EXPIRES_IN || "15m",

  JWT_REFRESH_EXPIRES_IN: process.env.JWT_REFRESH_EXPIRES_IN || "7d",

  CORS_ORIGIN: process.env.CORS_ORIGIN || "http://localhost:8081",

  CLOUDINARY_CLOUD_NAME: process.env.CLOUDINARY_CLOUD_NAME || "",

  CLOUDINARY_API_KEY: process.env.CLOUDINARY_API_KEY || "",

  CLOUDINARY_API_SECRET: process.env.CLOUDINARY_API_SECRET || "",
};
