import app from "./app";
import { env } from "./config/env";
import { connectDB } from "./config/database";
import { logger } from "./utils/logger";
import { verifyEmailTransport } from "./services/mail.service";
import { SellerPasswordResetService } from "./services/seller-password-reset.service";

const startServer = async () => {
  logger.info(`Trust proxy enabled: ${String(app.get("trust proxy"))}`);
  await connectDB();
  if (env.NODE_ENV === "production") {
    logger.info("Skipping SMTP startup verification in production.");
  } else {
    await verifyEmailTransport();
  }
  await SellerPasswordResetService.cleanupResolvedRequests();
  const cleanupTimer = setInterval(() => { void SellerPasswordResetService.cleanupResolvedRequests().catch((error) => logger.error("Seller password reset cleanup failed", error)); }, 60 * 60 * 1000);
  cleanupTimer.unref();

  app.listen(env.PORT, () => {
    logger.info(`Server running on port ${env.PORT}`);
  });
};

startServer();