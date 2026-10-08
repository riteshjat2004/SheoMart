import mongoose from "mongoose";
import { env } from "./env";
import {logger} from "../utils/logger";

export const connectDB = async (): Promise<void> => {
  try {
    const conn = await mongoose.connect(env.MONGODB_URI);
    logger.info(`MongoDB Connected: ${conn.connection.name} (${conn.connection.host})`);

    // Ensure Review collection indexes have proper partialFilterExpression
    try {
      const reviewCollection = mongoose.connection.collection("reviews");
      const indexes = await reviewCollection.indexes();
      const productUserIdx = indexes.find((i) => i.name === "productId_1_userId_1");
      if (productUserIdx && !productUserIdx.partialFilterExpression) {
        await reviewCollection.dropIndex("productId_1_userId_1");
        await reviewCollection.createIndex(
          { productId: 1, userId: 1 },
          {
            name: "productId_1_userId_1",
            unique: true,
            partialFilterExpression: { productId: { $type: "string", $gt: "" } },
          }
        );
      }
    } catch {
      // Ignore if collection not initialized yet
    }
  } catch (error) {
    logger.error("MongoDB Connection Failed", error);

    if (error instanceof Error) {
      console.error(error.message);
    }

    process.exit(1);
  }
};