"use client";

import { Check } from "lucide-react";
import { getPasswordRequirements, getPasswordStrength } from "@/lib/password-rules";

export function PasswordStrengthMeter({ password, confirmPassword }: { password: string; confirmPassword?: string }) {
  const requirements = getPasswordRequirements(password);
  const strength = getPasswordStrength(password);
  const score = Object.values(requirements).filter(Boolean).length;
  const strengthColor = strength === "Strong" ? "bg-emerald-500" : strength === "Medium" ? "bg-amber-500" : "bg-rose-500";
  const rules = [
    ["At least 8 characters", requirements.minimum],
    ["One uppercase letter", requirements.uppercase],
    ["One lowercase letter", requirements.lowercase],
    ["One number", requirements.number],
    ["One special character", requirements.special],
  ] as const;

  return (
    <div className="space-y-2" aria-live="polite">
      <div className="flex items-center justify-between text-xs font-medium text-stone-500 dark:text-stone-400"><span>Password strength</span><span className={strength === "Strong" ? "text-emerald-600 dark:text-emerald-400" : strength === "Medium" ? "text-amber-600 dark:text-amber-400" : "text-rose-600 dark:text-rose-400"}>{password ? strength : "-"}</span></div>
      <div className="flex gap-1" aria-hidden="true">{[1, 2, 3, 4, 5].map((index) => <span key={index} className={`h-1.5 flex-1 rounded-full ${index <= score ? strengthColor : "bg-stone-200 dark:bg-stone-700"}`} />)}</div>
      <ul className="grid gap-1 text-xs text-stone-500 sm:grid-cols-2 dark:text-stone-400">
        {rules.map(([label, valid]) => <li key={label} className={`flex items-center gap-1 ${valid ? "text-emerald-600 dark:text-emerald-400" : ""}`}><Check className="h-3.5 w-3.5" />{label}</li>)}
      </ul>
      {typeof confirmPassword === "string" && confirmPassword ? <p className={`text-xs ${password === confirmPassword ? "text-emerald-600 dark:text-emerald-400" : "text-rose-600 dark:text-rose-400"}`}>{password === confirmPassword ? "Passwords match" : "Passwords do not match"}</p> : null}
    </div>
  );
}
