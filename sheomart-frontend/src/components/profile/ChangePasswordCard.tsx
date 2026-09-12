"use client";

import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { AlertCircle, CheckCircle2 } from "lucide-react";
import { PasswordInput } from "@/components/auth/PasswordInput";
import { PasswordStrengthMeter } from "@/components/auth/PasswordStrengthMeter";
import { LoadingButton } from "@/components/auth/LoadingButton";
import { passwordIsValid } from "@/lib/password-rules";
import { changePassword } from "@/services/profile";

export function ChangePasswordCard() {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [localError, setLocalError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const mutation = useMutation({ mutationFn: changePassword, onSuccess: () => { setCurrentPassword(""); setNewPassword(""); setConfirmPassword(""); setLocalError(null); setSuccess("Password changed successfully. Other devices have been signed out."); }, onError: (error: Error) => { setSuccess(null); setLocalError(error.message); } });

  const submit = (event: React.FormEvent) => {
    event.preventDefault();
    setSuccess(null);
    if (!currentPassword) { setLocalError("Enter your current password."); return; }
    if (!passwordIsValid(newPassword)) { setLocalError("Choose a new password that meets all requirements."); return; }
    if (newPassword !== confirmPassword) { setLocalError("Passwords do not match."); return; }
    setLocalError(null);
    mutation.mutate({ currentPassword, newPassword, confirmPassword });
  };

  return <form className="space-y-4" onSubmit={submit} noValidate>
    {localError ? <div className="flex items-start gap-2 rounded-2xl border border-rose-200 bg-rose-50 p-3 text-sm text-rose-700 dark:border-rose-900/70 dark:bg-rose-950/40 dark:text-rose-300" role="alert"><AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />{localError}</div> : null}
    {success ? <div className="flex items-start gap-2 rounded-2xl border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-700 dark:border-emerald-900/70 dark:bg-emerald-950/40 dark:text-emerald-300" role="status"><CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" />{success}</div> : null}
    <PasswordInput label="Current password" id="current-password" value={currentPassword} onChange={(event) => setCurrentPassword(event.target.value)} autoComplete="current-password" placeholder="Enter current password" />
    <PasswordInput label="New password" id="new-password" value={newPassword} onChange={(event) => setNewPassword(event.target.value)} autoComplete="new-password" placeholder="Create a strong password" />
    <PasswordStrengthMeter password={newPassword} confirmPassword={confirmPassword} />
    <PasswordInput label="Confirm password" id="confirm-password" value={confirmPassword} onChange={(event) => setConfirmPassword(event.target.value)} autoComplete="new-password" placeholder="Repeat new password" />
    <LoadingButton type="submit" isLoading={mutation.isPending} loadingText="Updating password...">Change password</LoadingButton>
  </form>;
}
