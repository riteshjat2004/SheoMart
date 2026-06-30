import mongoose from "mongoose";
import { env } from "./env";
import {logger} from "../utils/logger";

export const connectDB = async (): Promise<void> => {
  try {
    await mongoose.connect(env.MONGODB_URI);

    logger.info("MongoDB Connected");
  } catch (error) {
    logger.error("MongoDB Connection Failed", error);

    if (error instanceof Error) {
      console.error(error.message);
    }

    process.exit(1);
  }
};