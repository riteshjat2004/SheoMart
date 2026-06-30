import bcrypt from "bcrypt";

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
  return bcrypt.hash(token, SALT_ROUNDS);
};

export const compareToken = async (
  token: string,
  hashedToken: string
): Promise<boolean> => {
  return bcrypt.compare(token, hashedToken);
};