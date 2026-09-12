"use client";

import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { AlertCircle, CheckCircle2, Clock3 } from "lucide-react";
import { PasswordInput } from "@/components/auth/PasswordInput";
import { PasswordStrengthMeter } from "@/components/auth/PasswordStrengthMeter";
import { LoadingButton } from "@/components/auth/LoadingButton";
import { passwordIsValid } from "@/lib/password-rules";
import { submitSellerPasswordResetRequest } from "@/services/seller-password-reset";

export function SellerPasswordResetForm({ email, storeName, onSuccess }: { email: string; storeName?: string; onSuccess?: () => void }) {
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [reason, setReason] = useState("");
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; message: string } | null>(null);
  const mutation = useMutation({ mutationFn: submitSellerPasswordResetRequest, onSuccess: () => { setFeedback({ type: "success", message: "Password reset request submitted for administrator approval." }); onSuccess?.(); }, onError: (error: Error) => setFeedback({ type: "error", message: error.message }) });
  const submit = (event: React.FormEvent) => {
    event.preventDefault();
    if (!passwordIsValid(newPassword)) { setFeedback({ type: "error", message: "Choose a password that meets all requirements." }); return; }
    if (newPassword !== confirmPassword) { setFeedback({ type: "error", message: "Passwords do not match." }); return; }
    mutation.mutate({ email, newPassword, confirmPassword, reason });
  };
  return <form className="space-y-4" onSubmit={submit}>
    {feedback ? <div className={`flex items-start gap-2 rounded-2xl border p-3 text-sm ${feedback.type === "success" ? "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900/70 dark:bg-emerald-950/40 dark:text-emerald-300" : "border-rose-200 bg-rose-50 text-rose-700 dark:border-rose-900/70 dark:bg-rose-950/40 dark:text-rose-300"}`} role={feedback.type === "error" ? "alert" : "status"}>{feedback.type === "success" ? <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" /> : <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />}{feedback.message}</div> : null}
    <label className="block space-y-2 text-sm font-medium text-stone-700 dark:text-stone-200">Registered email<input value={email} readOnly className="h-11 w-full rounded-2xl border border-stone-200 bg-stone-100 px-4 text-sm dark:border-stone-700 dark:bg-stone-800" /></label>
    <label className="block space-y-2 text-sm font-medium text-stone-700 dark:text-stone-200">Store name<input value={storeName ?? "Not available"} readOnly className="h-11 w-full rounded-2xl border border-stone-200 bg-stone-100 px-4 text-sm dark:border-stone-700 dark:bg-stone-800" /></label>
    <PasswordInput label="New password" id="seller-reset-new-password" value={newPassword} onChange={(event) => setNewPassword(event.target.value)} autoComplete="new-password" placeholder="Create a strong password" />
    <PasswordStrengthMeter password={newPassword} confirmPassword={confirmPassword} />
    <PasswordInput label="Confirm new password" id="seller-reset-confirm-password" value={confirmPassword} onChange={(event) => setConfirmPassword(event.target.value)} autoComplete="new-password" placeholder="Repeat your password" />
    <label className="block space-y-2 text-sm font-medium text-stone-700 dark:text-stone-200">Reason (optional)<textarea value={reason} onChange={(event) => setReason(event.target.value)} maxLength={1000} rows={3} className="w-full rounded-2xl border border-stone-200 bg-white p-3 text-sm outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 dark:border-stone-700 dark:bg-stone-900" /></label>
    <LoadingButton type="submit" isLoading={mutation.isPending} loadingText="Submitting request..." className="w-full bg-amber-600 hover:bg-amber-700">Submit Password Reset Request</LoadingButton>
    <p className="flex items-center gap-2 text-xs text-stone-500 dark:text-stone-400"><Clock3 className="h-3.5 w-3.5" />Your current password remains active until an administrator approves this request.</p>
  </form>;
}
