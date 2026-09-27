import bcrypt from "bcrypt";
import crypto from "crypto";

const SALT_ROUNDS = 12;

export const hashPassword = async (password: string): Promise<string> => {
  return bcrypt.hash(password, SALT_ROUNDS);
};

export const comparePassword = async (
  password: string,
  hashedPassword: string
): Promise<boolean> => {
  return bcrypt.compare(password, hashedPassword);
};

export const hashToken = async (token: string): Promise<string> => {
  // Fast, cryptographic SHA-256 for high-throughput refresh token hashing
  return crypto.createHash("sha256").update(token).digest("hex");
};

export const compareToken = async (
  token: string,
  hashedToken: string
): Promise<boolean> => {
  // Backward compatibility with legacy bcrypt tokens
  if (hashedToken.startsWith("$2b$") || hashedToken.startsWith("$2a$")) {
    return bcrypt.compare(token, hashedToken);
  }

  const computedHash = crypto.createHash("sha256").update(token).digest("hex");
  try {
    return crypto.timingSafeEqual(
      Buffer.from(computedHash, "hex"),
      Buffer.from(hashedToken, "hex")
    );
  } catch {
    return false;
  }
};