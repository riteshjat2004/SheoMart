import mongoose from "mongoose";
import { connectDB } from "../config/database";
import { USER_ROLES } from "../constants/roles";
import { User } from "../models/user.model";
import { hashPassword } from "../utils/password";

const seedAdmin = async (): Promise<void> => {
  try {
    await connectDB();

    const existingAdmin = await User.findOne({
      role: USER_ROLES.PLATFORM_ADMIN,
    });

    if (existingAdmin) {
      console.log("✅ Platform Admin already exists.");
      await mongoose.disconnect();
      process.exit(0);
    }

    const {
      SEED_ADMIN_NAME,
      SEED_ADMIN_EMAIL,
      SEED_ADMIN_MOBILE,
      SEED_ADMIN_PASSWORD,
    } = process.env;

    if (
      !SEED_ADMIN_NAME ||
      !SEED_ADMIN_EMAIL ||
      !SEED_ADMIN_MOBILE ||
      !SEED_ADMIN_PASSWORD
    ) {
      throw new Error(
        "Missing Seed Admin environment variables. Check your .env file."
      );
    }

    const hashedPassword = await hashPassword(SEED_ADMIN_PASSWORD);

    await User.create({
      name: SEED_ADMIN_NAME,
      email: SEED_ADMIN_EMAIL,
      mobile: SEED_ADMIN_MOBILE,
      password: hashedPassword,
      role: USER_ROLES.PLATFORM_ADMIN,
      emailVerified: true,
      phoneVerified: true,
      isActive: true,
    });

    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error("❌ Failed to seed platform admin:", error);

    try {
      await mongoose.disconnect();
    } catch {
      // Ignore disconnect errors
    }

    process.exit(1);
  }
};

seedAdmin();