"use client";

import { useId } from "react";
import type { FieldError } from "react-hook-form";
import { cn } from "@/lib/utils";

interface FormFieldProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: FieldError;
  helperText?: string;
  containerClassName?: string;
}

export function FormField({
  label,
  error,
  helperText,
  containerClassName,
  id,
  className,
  ...props
}: FormFieldProps) {
  const generatedId = useId();
  const fieldId = id ?? generatedId;

  return (
    <div className={cn("space-y-2", containerClassName)}>
      <label htmlFor={fieldId} className="text-sm font-medium text-stone-700 dark:text-stone-200">
        {label}
      </label>
      <input
        id={fieldId}
        className={cn(
          "w-full rounded-2xl border border-stone-200 bg-white px-4 text-sm text-stone-900 shadow-sm outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 h-11 dark:border-stone-700 dark:bg-stone-900 dark:text-stone-100",
          error && "border-red-500 focus:border-red-500 focus:ring-red-500/20",
          className
        )}
        {...props}
      />
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
