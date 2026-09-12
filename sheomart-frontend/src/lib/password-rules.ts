export type PasswordRequirements = {
  minimum: boolean;
  uppercase: boolean;
  lowercase: boolean;
  number: boolean;
  special: boolean;
};

export function getPasswordRequirements(password: string): PasswordRequirements {
  return {
    minimum: password.length >= 8,
    uppercase: /[A-Z]/.test(password),
    lowercase: /[a-z]/.test(password),
    number: /[0-9]/.test(password),
    special: /[^A-Za-z0-9]/.test(password),
  };
}

export function getPasswordStrength(password: string): "Weak" | "Medium" | "Strong" {
  const score = Object.values(getPasswordRequirements(password)).filter(Boolean).length;
  if (score >= 5) return "Strong";
  if (score >= 3) return "Medium";
  return "Weak";
}

export const passwordIsValid = (password: string) => Object.values(getPasswordRequirements(password)).every(Boolean);
