"use client";

import { Eye, EyeOff } from "lucide-react";
import { useState } from "react";
import type { FieldError } from "react-hook-form";
import { cn } from "@/lib/utils";

interface PasswordInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: FieldError;
  helperText?: string;
}

export function PasswordInput({ label, error, helperText, id, className, ...props }: PasswordInputProps) {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="space-y-2">
      <label htmlFor={id} className="text-sm font-medium text-stone-700 dark:text-stone-200">
        {label}
      </label>
      <div className="relative">
        <input
          id={id}
          type={showPassword ? "text" : "password"}
          className={cn(
            "w-full rounded-2xl border border-stone-200 bg-white px-4 pr-12 text-sm text-stone-900 shadow-sm outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 h-11 dark:border-stone-700 dark:bg-stone-900 dark:text-stone-100",
            error && "border-red-500 focus:border-red-500 focus:ring-red-500/20",
            className
          )}
          {...props}
        />
        <button
          type="button"
          className="absolute inset-y-0 right-3 flex items-center text-stone-500 transition hover:text-emerald-600"
          aria-label={showPassword ? "Hide password" : "Show password"}
          onClick={() => setShowPassword((value) => !value)}
        >
          {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
        </button>
      </div>
      {error?.message ? (
        <p className="text-sm text-red-600" role="alert">
          {error.message}
        </p>
      ) : helperText ? (
        <p className="text-sm text-stone-500 dark:text-stone-400">{helperText}</p>
      ) : null}
    </div>
  );
}
