import mongoose from "mongoose";
import { env } from "./env";
import {logger} from "../utils/logger";

export const connectDB = async (): Promise<void> => {
  try {
    const conn = await mongoose.connect(env.MONGODB_URI);
    logger.info(`MongoDB Connected: ${conn.connection.name} (${conn.connection.host})`);
  } catch (error) {
    logger.error("MongoDB Connection Failed", error);

    if (error instanceof Error) {
      console.error(error.message);
    }

    process.exit(1);
  }
};