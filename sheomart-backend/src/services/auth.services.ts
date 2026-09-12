import { User } from "../models/user.model";
import { Store } from "../models/store.model";
import { PasswordResetOtp } from "../models/password-reset-otp.model";
import { AppError } from "../errors/AppError";
import { v4 as uuidv4 } from "uuid";
import { randomBytes, randomInt } from "node:crypto";
import { USER_ROLES } from "../constants/roles";
import { sendPasswordResetOTP } from "./mail.service";
import { logger } from "../utils/logger";

import {
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken,
} from "../utils/jwt";

import {
  RegisterInput,
  LoginInput,
} from "../validators/auth.validator";

import {
  comparePassword,
  hashPassword,
  compareToken,
  hashToken,
} from "../utils/password";

export class AuthService {

    private static readonly genericResetMessage = "If this email exists, we've sent a verification code.";

    private static async issueResetOtp(email: string) {
        const user = await User.findOne({ email, role: USER_ROLES.CUSTOMER, isActive: true });
        if (!user) return;

        const now = Date.now();
        const latest = await PasswordResetOtp.findOne({ email, createdAt: { $gte: new Date(now - 60_000) } }).sort({ createdAt: -1 });
        if (latest) return;

        const hourlyCount = await PasswordResetOtp.countDocuments({ email, createdAt: { $gte: new Date(now - 60 * 60_000) } });
        if (hourlyCount >= 3) return;

        await PasswordResetOtp.updateMany({ email, used: false }, { $set: { used: true } });
        const otp = randomInt(100000, 1000000).toString();
        const record = await PasswordResetOtp.create({ customerId: user.userId, email, otpHash: await hashToken(otp), expiresAt: new Date(now + 10 * 60_000) });

        try {
            await sendPasswordResetOTP(email, otp);
        } catch (error) {
            await record.deleteOne();
            throw error;
        }
    }

    static async requestPasswordReset(email: string) {
        const user = await User.findOne({ email }).lean();
        if (!user || user.role === USER_ROLES.PLATFORM_ADMIN) return { accountType: "unknown" as const, message: "If an account exists, we'll process the recovery request." };
        if (user.role === USER_ROLES.STORE_OWNER) {
            const store = await Store.findOne({ ownerId: user.userId }).lean();
            return { accountType: "seller" as const, message: "Seller account requires administrator approval.", seller: { email: user.email, storeId: store?.storeId ?? "", storeName: store?.storeName ?? "" } };
        }
        try {
            await this.issueResetOtp(email);
        } catch (error) {
            logger.error("Password reset OTP delivery failed", error);
            throw new AppError("Unable to process password reset request. Please try again later.", 503);
        }
        return { accountType: "customer" as const, message: this.genericResetMessage };
    }

    static async verifyPasswordResetOtp(email: string, otp: string) {
        const record = await PasswordResetOtp.findOne({ email, used: false, expiresAt: { $gt: new Date() } }).sort({ createdAt: -1 }).select("+otpHash +resetTokenHash");
        if (!record || record.attemptCount >= 5) {
            if (record) { record.used = true; await record.save(); }
            throw new AppError("Invalid or expired verification code", 400);
        }

        const valid = await compareToken(otp, record.otpHash);
        if (!valid) {
            record.attemptCount += 1;
            if (record.attemptCount >= 5) record.used = true;
            await record.save();
            throw new AppError("Invalid or expired verification code", 400);
        }

        const resetToken = randomBytes(32).toString("hex");
        record.used = true;
        record.resetTokenHash = await hashToken(resetToken);
        record.resetTokenExpiresAt = new Date(Date.now() + 10 * 60_000);
        await record.save();
        return { email, resetToken };
    }

    static async resetPassword(email: string, resetToken: string, newPassword: string) {
        const record = await PasswordResetOtp.findOne({ email, used: true, resetTokenExpiresAt: { $gt: new Date() } }).sort({ createdAt: -1 }).select("+resetTokenHash");
        if (!record?.resetTokenHash || !(await compareToken(resetToken, record.resetTokenHash))) {
            throw new AppError("Invalid or expired password reset session", 400);
        }

        const user = await User.findOne({ userId: record.customerId, role: USER_ROLES.CUSTOMER, isActive: true }).select("+password +sessions.refreshToken");
        if (!user) throw new AppError("Invalid or expired password reset session", 400);
        if (await comparePassword(newPassword, user.password)) throw new AppError("New password must be different from your current password", 400);

        user.password = await hashPassword(newPassword);
        user.sessions = [];
        await user.save();
        await record.deleteOne();
        return { message: "Password updated successfully" };
    }

  static async register(data: RegisterInput) {
        const existingEmail = await User.findOne({
        email: data.email,
        });

        if (existingEmail) {
        throw new AppError("Email already exists", 409);
        }

        const existingMobile = await User.findOne({
        mobile: data.mobile,
        });

        if (existingMobile) {
        throw new AppError("Mobile number already exists", 409);
        }

        const hashedPassword = await hashPassword(data.password);

        const user = await User.create({
        ...data,
        password: hashedPassword,
        });

        const sessionId = uuidv4();

        const accessToken = generateAccessToken(
        user.userId,
        user.role,
        sessionId
        );

        const refreshToken = generateRefreshToken(
        user.userId,
        sessionId
        );

        user.sessions.push({
        sessionId,
        refreshToken: await hashToken(refreshToken),
        userAgent: "",
        ipAddress: "",
        createdAt: new Date(),
        lastUsedAt: new Date(),
        });

        await user.save();

        return {
        user: {
            userId: user.userId,
            name: user.name,
            email: user.email,
            mobile: user.mobile,
            role: user.role,
            isCreditApproved: user.isCreditApproved,
            emailVerified: user.emailVerified,
            phoneVerified: user.phoneVerified,
            isActive: user.isActive,
        },
        accessToken,
        refreshToken,
        };
    }

    static async login(data: LoginInput) {
        const isEmail = data.identifier.includes("@");

        const user = await User.findOne(
            isEmail
            ? { email: data.identifier.toLowerCase() }
            : { mobile: data.identifier }
        ).select("+password +refreshToken");

        if (!user) {
            throw new AppError("Invalid credentials", 401);
        }

        if (!user.isActive) {
            throw new AppError("Account has been disabled", 403);
        }

        const isPasswordValid = await comparePassword(
            data.password,
            user.password
        );

        if (!isPasswordValid) {
            throw new AppError("Invalid credentials", 401);
        }

        const sessionId = uuidv4();

        const accessToken = generateAccessToken(
        user.userId,
        user.role,
        sessionId
        );

        const refreshToken = generateRefreshToken(
        user.userId,
        sessionId
        );

        user.sessions.push({
        sessionId,
        refreshToken: await hashToken(refreshToken),
        userAgent: "",
        ipAddress: "",
        createdAt: new Date(),
        lastUsedAt: new Date(),
        });

        await user.save();

        return {
        user: {
            userId: user.userId,
            name: user.name,
            email: user.email,
            mobile: user.mobile,
            role: user.role,
            isCreditApproved: user.isCreditApproved,
            emailVerified: user.emailVerified,
            phoneVerified: user.phoneVerified,
            isActive: user.isActive,
        },
        accessToken,
        refreshToken,
        };
   }
    static async refresh(refreshToken: string) {
        let payload: { userId: string; sessionId: string };

        try {
            payload = verifyRefreshToken(refreshToken) as {
                userId: string;
                sessionId: string;
            };
        } catch {
            throw new AppError("Invalid refresh token", 401);
        }

        const user = await User.findOne({
            userId: payload.userId,
        }).select("+sessions.refreshToken");

        if (!user) {
            throw new AppError("Invalid refresh token", 401);
        }

        const session = user.sessions.find(
            (s) => s.sessionId === payload.sessionId
        );

        if (!session?.refreshToken) {
            throw new AppError("Session not found", 401);
        }

        const isValid = await compareToken(
            refreshToken,
            session.refreshToken
        );

        if (!isValid) {
            throw new AppError("Invalid refresh token", 401);
        }

        const newAccessToken = generateAccessToken(
            user.userId,
            user.role,
            session.sessionId
        );

        const newRefreshToken = generateRefreshToken(
            user.userId,
            session.sessionId
        );

        session.refreshToken = await hashToken(newRefreshToken);
        session.lastUsedAt = new Date();

        user.markModified("sessions");

        await user.save();

        return {
            accessToken: newAccessToken,
            refreshToken: newRefreshToken,
        };
    }
}

