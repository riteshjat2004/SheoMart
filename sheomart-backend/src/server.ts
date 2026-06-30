import app from "./app";
import { env } from "./config/env";
import { connectDB } from "./config/database";
import { logger } from "./utils/logger";

const startServer = async () => {
  await connectDB();

  app.listen(env.PORT, () => {
    logger.info(`Server running on http://localhost:${env.PORT}`);
  });
};

startServer();