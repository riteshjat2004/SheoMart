import { User } from "../models/user.model";
import { AppError } from "../errors/AppError";
import { v4 as uuidv4 } from "uuid";

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
        const payload = verifyRefreshToken(refreshToken) as {
            userId: string;
            sessionId: string;
        };

        const user = await User.findOne({
            userId: payload.userId,
        }).select("+sessions.refreshToken");

        if (!user) {
            throw new AppError("Invalid refresh token", 401);
        }

        const session = user.sessions.find(
            (s) => s.sessionId === payload.sessionId
        );

        if (!session) {
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
        
        console.log("Old Session:", session.refreshToken);
        session.refreshToken = await hashToken(newRefreshToken);
        session.lastUsedAt = new Date();
        console.log("New Session:", session.refreshToken);

        user.markModified("sessions");

        await user.save();

        return {
            accessToken: newAccessToken,
            refreshToken: newRefreshToken,
        };
    }
}

