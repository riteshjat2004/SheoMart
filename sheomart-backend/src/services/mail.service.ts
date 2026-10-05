import nodemailer from "nodemailer";
import { env } from "../config/env";
import { logger } from "../utils/logger";

const transporter = env.SMTP_HOST && env.SMTP_USER && env.SMTP_PASSWORD
  ? nodemailer.createTransport({
      pool: true,
      family: 4,
      host: env.SMTP_HOST,
      port: env.SMTP_PORT,
      secure: env.SMTP_SECURE,
      auth: { user: env.SMTP_USER, pass: env.SMTP_PASSWORD },
      connectionTimeout: 10_000,
      greetingTimeout: 10_000,
      socketTimeout: 10_000,
    } as Parameters<typeof nodemailer.createTransport>[0])
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
    logger.warn(`SMTP transporter verification failed; startup will continue: ${error instanceof Error ? error.message : "Unknown SMTP error"}`);
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

export interface StoreNewOrderEmailPayload {
  to: string;
  storeName: string;
  orderId: string;
  customerName: string;
  grandTotal: number;
  itemCount: number;
  fulfillmentType: string;
  paymentMethod: string;
  items?: Array<{ name: string; quantity: number; price: number }>;
}

export async function sendStoreNewOrderEmail(payload: StoreNewOrderEmailPayload): Promise<void> {
  if (!transporter || !env.SMTP_FROM) {
    logger.warn(`Skipping new order email to ${payload.to} because SMTP is not configured.`);
    return;
  }

  const shortId = payload.orderId ? payload.orderId.slice(-6).toUpperCase() : "";
  const subject = `🔔 New Order Received #${shortId} [₹${payload.grandTotal}] - ${payload.storeName}`;
  const fulfillment = payload.fulfillmentType === "pickup" ? "Store Pickup" : "Doorstep Delivery";
  const orderUrl = `${env.FRONTEND_URL || "http://localhost:3000"}/store/orders?orderId=${payload.orderId}`;

  const itemsHtml = (payload.items || [])
    .map(
      (it) =>
        `<tr>
          <td style="padding: 8px 12px; border-bottom: 1px solid #1e293b; color: #f8fafc; font-size: 14px;">${it.name}</td>
          <td style="padding: 8px 12px; border-bottom: 1px solid #1e293b; color: #94a3b8; font-size: 14px; text-align: center;">x${it.quantity}</td>
          <td style="padding: 8px 12px; border-bottom: 1px solid #1e293b; color: #10b981; font-weight: 600; font-size: 14px; text-align: right;">₹${it.price * it.quantity}</td>
        </tr>`
    )
    .join("");

  const html = `<!doctype html>
  <html>
    <head><meta charset="utf-8"></head>
    <body style="margin:0;padding:24px;background:#040d09;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;color:#ecfdf5;">
      <div style="max-width:560px;margin:0 auto;background:#0d1d17;border:1px solid #15803d;border-radius:24px;overflow:hidden;box-shadow:0 20px 25px -5px rgba(0,0,0,0.5);">
        <div style="background:linear-gradient(135deg,#064e3b,#022c22);padding:28px 24px;text-align:center;border-bottom:1px solid #15803d;">
          <h1 style="margin:0;font-size:22px;color:#ecfdf5;font-weight:800;letter-spacing:-0.02em;">🛍️ New Order Received!</h1>
          <p style="margin:6px 0 0 0;font-size:14px;color:#a7f3d0;">${payload.storeName}</p>
        </div>
        
        <div style="padding:24px;">
          <div style="background:#062319;border:1px solid #166534;border-radius:16px;padding:16px;margin-bottom:20px;">
            <table style="width:100%;font-size:13px;line-height:1.6;">
              <tr>
                <td style="color:#94a3b8;">Order ID:</td>
                <td style="color:#ecfdf5;font-weight:700;text-align:right;font-family:monospace;">#${shortId}</td>
              </tr>
              <tr>
                <td style="color:#94a3b8;">Customer:</td>
                <td style="color:#ecfdf5;font-weight:600;text-align:right;">${payload.customerName}</td>
              </tr>
              <tr>
                <td style="color:#94a3b8;">Fulfillment:</td>
                <td style="color:#34d399;font-weight:600;text-align:right;">${fulfillment}</td>
              </tr>
              <tr>
                <td style="color:#94a3b8;">Payment:</td>
                <td style="color:#ecfdf5;font-weight:600;text-align:right;">${payload.paymentMethod}</td>
              </tr>
              <tr>
                <td style="color:#94a3b8;font-size:15px;font-weight:700;padding-top:8px;">Total Amount:</td>
                <td style="color:#10b981;font-size:18px;font-weight:800;text-align:right;padding-top:8px;">₹${payload.grandTotal}</td>
              </tr>
            </table>
          </div>

          ${
            payload.items && payload.items.length > 0
              ? `<table style="width:100%;border-collapse:collapse;margin-bottom:24px;">
                  <thead>
                    <tr style="background:#071c14;">
                      <th style="padding:8px 12px;text-align:left;color:#94a3b8;font-size:12px;text-transform:uppercase;">Item</th>
                      <th style="padding:8px 12px;text-align:center;color:#94a3b8;font-size:12px;text-transform:uppercase;">Qty</th>
                      <th style="padding:8px 12px;text-align:right;color:#94a3b8;font-size:12px;text-transform:uppercase;">Subtotal</th>
                    </tr>
                  </thead>
                  <tbody>${itemsHtml}</tbody>
                </table>`
              : ""
          }

          <div style="text-align:center;margin-top:24px;">
            <a href="${orderUrl}" style="display:inline-block;background:#10b981;color:#041f14;font-weight:700;font-size:14px;padding:14px 28px;border-radius:14px;text-decoration:none;box-shadow:0 4px 12px rgba(16,185,129,0.3);">
              Open Seller Orders Dashboard →
            </a>
          </div>
        </div>

        <div style="background:#051711;padding:16px 24px;text-align:center;font-size:12px;color:#64748b;border-top:1px solid #134e4a;">
          SheoMart Marketplace • Real-Time Store Order Alerts
        </div>
      </div>
    </body>
  </html>`;

  await transporter.sendMail({
    from: env.SMTP_FROM,
    to: payload.to,
    subject,
    text: `New Order Received #${shortId} for ₹${payload.grandTotal} from ${payload.customerName}.\nFulfillment: ${fulfillment}\nView Order: ${orderUrl}`,
    html,
  });
}

