import app from "./app";
import { env } from "./config/env";
import { connectDB } from "./config/database";
import { logger } from "./utils/logger";
import { verifyEmailTransport } from "./services/mail.service";
import { SellerPasswordResetService } from "./services/seller-password-reset.service";

const startServer = async () => {
  await connectDB();
  await verifyEmailTransport();
  await SellerPasswordResetService.cleanupResolvedRequests();
  const cleanupTimer = setInterval(() => { void SellerPasswordResetService.cleanupResolvedRequests().catch((error) => logger.error("Seller password reset cleanup failed", error)); }, 60 * 60 * 1000);
  cleanupTimer.unref();

  app.listen(env.PORT, () => {
    logger.info(`Server running on http://localhost:${env.PORT}`);
  });
};

startServer();