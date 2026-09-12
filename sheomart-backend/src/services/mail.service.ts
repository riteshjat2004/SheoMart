import nodemailer from "nodemailer";
import { env } from "../config/env";
import { logger } from "../utils/logger";

const transporter = env.SMTP_HOST && env.SMTP_USER && env.SMTP_PASSWORD
  ? nodemailer.createTransport({
      pool: true,
      host: env.SMTP_HOST,
      port: env.SMTP_PORT,
      secure: env.SMTP_SECURE,
      auth: { user: env.SMTP_USER, pass: env.SMTP_PASSWORD },
      connectionTimeout: 10_000,
      greetingTimeout: 10_000,
      socketTimeout: 20_000,
    })
  : null;

export async function verifyEmailTransport(): Promise<boolean> {
  const missing = [
    ["SMTP_HOST", env.SMTP_HOST],
    ["SMTP_USER", env.SMTP_USER],
    ["SMTP_PASSWORD", env.SMTP_PASSWORD],
    ["SMTP_FROM", env.SMTP_FROM],
  ].filter(([, value]) => !value).map(([name]) => name);

  if (missing.length) {
    logger.warn(`Password reset email is disabled; missing SMTP settings: ${missing.join(", ")}`);
    return false;
  }

  try {
    await transporter?.verify();
    logger.info(`SMTP transporter verified for ${env.SMTP_HOST}:${env.SMTP_PORT}`);
    return true;
  } catch (error) {
    logger.error("SMTP transporter verification failed", error);
    return false;
  }
}

export async function sendPasswordResetOtp(email: string, otp: string): Promise<void> {
  if (!transporter || !env.SMTP_FROM) {
    throw new Error("Password reset email delivery is not configured");
  }

  await transporter.sendMail({
    from: env.SMTP_FROM,
    to: email,
    subject: "SheoMart Password Reset Code",
    text: `Use this verification code to reset your password.\n\n${otp}\n\nExpires in 10 minutes.\n\nIf you didn't request this, ignore this email.`,
    html: `<!doctype html><html><body style="margin:0;background:#090f0d;color:#ecfdf5;font-family:Arial,sans-serif;padding:32px 16px"><div style="max-width:520px;margin:auto;background:#10211b;border:1px solid #176b4a;border-radius:24px;padding:32px;text-align:center">${env.FRONTEND_URL ? `<img src="${env.FRONTEND_URL}/logo/sheomartheaderlogo.png" alt="SheoMart" style="display:block;max-width:220px;width:100%;height:auto;margin:0 auto 20px">` : `<div style="color:#6ee7b7;font-size:24px;font-weight:700">SheoMart</div>`}<p style="color:#a7f3d0;font-size:16px;line-height:1.6">Use this verification code to reset your password.</p><div style="margin:28px 0;padding:20px;border:1px solid #34d399;border-radius:16px;background:#064e3b;color:#ecfdf5;font-size:38px;font-weight:700;letter-spacing:10px">${otp}</div><p style="color:#a7f3d0">Expires in 10 minutes.</p><p style="color:#94a3b8;font-size:13px;line-height:1.5">If you didn't request this, ignore this email.</p></div></body></html>`,
  });
}

export const sendPasswordResetOTP = sendPasswordResetOtp;

export async function sendSellerPasswordResetNotification(email: string, status: "pending" | "approved" | "rejected", adminRemarks: string): Promise<void> {
  if (!transporter || !env.SMTP_FROM) throw new Error("Password reset email delivery is not configured");
  const subject = status === "approved" ? "SheoMart Password Reset Approved" : status === "rejected" ? "SheoMart Password Reset Request Rejected" : "SheoMart Password Reset Request Received";
  const message = status === "approved" ? "Your password has been successfully updated by SheoMart Admin." : status === "rejected" ? `Your password reset request was rejected by SheoMart Admin.${adminRemarks ? `\n\nAdmin remarks: ${adminRemarks}` : ""}` : "Your password reset request has been received and is waiting for administrator approval.";
  await transporter.sendMail({ from: env.SMTP_FROM, to: email, subject, text: message, html: `<!doctype html><html><body style="margin:0;background:#090f0d;color:#ecfdf5;font-family:Arial,sans-serif;padding:32px 16px"><div style="max-width:520px;margin:auto;background:#10211b;border:1px solid ${status === "rejected" ? "#f59e0b" : "#176b4a"};border-radius:24px;padding:32px;text-align:center"><div style="color:#6ee7b7;font-size:24px;font-weight:700">SheoMart</div><h1 style="font-size:22px">${subject}</h1><p style="color:#a7f3d0;font-size:16px;line-height:1.6">${message.replace(/\n/g, "<br>")}</p></div></body></html>` });
}
