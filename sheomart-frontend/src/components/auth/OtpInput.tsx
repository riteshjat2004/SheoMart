"use client";

import { useRef } from "react";

export function OtpInput({ value, onChange, disabled = false }: { value: string; onChange: (value: string) => void; disabled?: boolean }) {
  const inputRefs = useRef<Array<HTMLInputElement | null>>([]);
  const digits = value.padEnd(6, " ").slice(0, 6).split("");

  const update = (index: number, nextValue: string) => {
    const clean = nextValue.replace(/\D/g, "");
    if (!clean) {
      const next = value.split("");
      next[index] = "";
      onChange(next.join("").slice(0, 6));
      return;
    }
    const next = value.split("");
    clean.split("").forEach((digit, offset) => { if (index + offset < 6) next[index + offset] = digit; });
    onChange(next.join("").slice(0, 6));
    inputRefs.current[Math.min(index + clean.length, 5)]?.focus();
  };

  return (
    <div className="flex justify-between gap-2" role="group" aria-label="Six digit verification code">
      {digits.map((digit, index) => <input key={index} ref={(element) => { inputRefs.current[index] = element; }} value={digit.trim()} disabled={disabled} inputMode="numeric" autoComplete={index === 0 ? "one-time-code" : "off"} maxLength={6} aria-label={`Verification code digit ${index + 1}`} onChange={(event) => update(index, event.target.value)} onPaste={(event) => { event.preventDefault(); update(index, event.clipboardData.getData("text")); }} onKeyDown={(event) => { if (event.key === "Backspace" && !digits[index] && index > 0) inputRefs.current[index - 1]?.focus(); if (event.key === "ArrowLeft" && index > 0) inputRefs.current[index - 1]?.focus(); if (event.key === "ArrowRight" && index < 5) inputRefs.current[index + 1]?.focus(); }} className="h-12 w-10 rounded-xl border border-stone-200 bg-white text-center text-lg font-semibold text-stone-900 outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 dark:border-stone-700 dark:bg-stone-900 dark:text-stone-100 sm:w-12" />)}
    </div>
  );
}
