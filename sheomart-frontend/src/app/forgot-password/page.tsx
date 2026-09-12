"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { CheckCircle2, ChevronLeft, Clock3, Mail, ShieldCheck } from "lucide-react";
import { useMutation } from "@tanstack/react-query";
import { AuthLayout } from "@/components/auth/AuthLayout";
import { AuthCard } from "@/components/auth/AuthCard";
import { LoadingButton } from "@/components/auth/LoadingButton";
import { PasswordInput } from "@/components/auth/PasswordInput";
import { OtpInput } from "@/components/auth/OtpInput";
import { PasswordStrengthMeter } from "@/components/auth/PasswordStrengthMeter";
import { SellerPasswordResetForm } from "@/components/security/SellerPasswordResetForm";
import { passwordIsValid } from "@/lib/password-rules";
import { requestPasswordReset, resendPasswordResetOtp, resetPassword, verifyPasswordResetOtp } from "@/services/auth";

const GENERIC_MESSAGE = "If this email exists, we've sent a verification code.";

type Step = "email" | "otp" | "password" | "seller" | "unknown" | "success";

export default function ForgotPasswordPage() {
  const [step, setStep] = useState<Step>("email");
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [resetToken, setResetToken] = useState("");
  const [remaining, setRemaining] = useState(600);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [sellerStoreName, setSellerStoreName] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (step !== "otp" || remaining <= 0) return;
    const timer = window.setInterval(() => setRemaining((value) => Math.max(0, value - 1)), 1000);
    return () => window.clearInterval(timer);
  }, [remaining, step]);

  const requestMutation = useMutation({ mutationFn: requestPasswordReset, onSuccess: (result) => { setError(null); if (result.accountType === "seller") { setSellerStoreName(result.seller?.storeName ?? ""); setMessage(null); setStep("seller"); return; } if (result.accountType === "unknown") { setMessage(result.message); setStep("unknown"); return; } setMessage(GENERIC_MESSAGE); setStep("otp"); setRemaining(600); }, onError: (value: Error) => { setMessage(null); setError(value.message); } });
  const resendMutation = useMutation({ mutationFn: resendPasswordResetOtp, onSuccess: () => { setMessage("A new code has been sent if this email exists."); setRemaining(600); setError(null); }, onError: () => setError("We could not resend the code. Please try again.") });
  const verifyMutation = useMutation({ mutationFn: () => verifyPasswordResetOtp(email, otp), onSuccess: (result) => { setResetToken(result.resetToken); setStep("password"); setError(null); setMessage(null); }, onError: (value: Error) => setError(value.message) });
  const resetMutation = useMutation({ mutationFn: () => resetPassword({ email, resetToken, newPassword, confirmPassword }), onSuccess: () => { setStep("success"); setError(null); }, onError: (value: Error) => setError(value.message) });

  const submitEmail = (event: React.FormEvent) => {
    event.preventDefault();
    if (!/^\S+@\S+\.\S+$/.test(email)) { setError("Enter a valid email address."); return; }
    setError(null);
    requestMutation.mutate(email.trim().toLowerCase());
  };

  const submitOtp = (event: React.FormEvent) => {
    event.preventDefault();
    if (otp.length !== 6) { setError("Enter the complete 6-digit code."); return; }
    setError(null);
    verifyMutation.mutate();
  };

  const submitPassword = (event: React.FormEvent) => {
    event.preventDefault();
    if (!passwordIsValid(newPassword)) { setError("Choose a password that meets all requirements."); return; }
    if (newPassword !== confirmPassword) { setError("Passwords do not match."); return; }
    setError(null);
    resetMutation.mutate();
  };

  if (step === "success") return <AuthLayout title="Password updated" subtitle="Your SheoMart account is secure again."><AuthCard title="Password Updated Successfully" description="You can now sign in with your new password."><div className="space-y-5 text-center"><CheckCircle2 className="mx-auto h-14 w-14 text-emerald-500" /><Link href="/login" className="inline-flex h-11 w-full items-center justify-center rounded-full bg-emerald-600 px-5 text-sm font-semibold text-white transition hover:bg-emerald-700">Back to Login</Link></div></AuthCard></AuthLayout>;

  if (step === "seller") return <AuthLayout title="Store Owner Password Recovery" subtitle="For security reasons, seller passwords cannot be reset through email OTP."><AuthCard title="Request administrator approval" description="Please submit a password reset request for administrator approval."><SellerPasswordResetForm email={email} storeName={sellerStoreName} /></AuthCard></AuthLayout>;

  if (step === "unknown") return <AuthLayout title="Reset Your Password" subtitle="We could not start a recovery flow for that address."><AuthCard title="Recovery request received" description="For your security, we do not reveal account details."><div className="space-y-5"><div className="rounded-2xl border border-stone-200 bg-stone-50 p-4 text-sm text-stone-600 dark:border-stone-700 dark:bg-stone-900 dark:text-stone-300">{message}</div><Link href="/login" className="inline-flex h-11 w-full items-center justify-center rounded-full bg-emerald-600 px-5 text-sm font-semibold text-white transition hover:bg-emerald-700">Back to Login</Link></div></AuthCard></AuthLayout>;

  return <AuthLayout title="Reset Your Password" subtitle={step === "email" ? "Enter your registered email address. We'll send a 6-digit verification code." : step === "otp" ? "Enter the verification code sent to your email." : "Create a strong new password for your account."}>
    <AuthCard title={step === "email" ? "Find your account" : step === "otp" ? "Verify your code" : "Create a new password"} description={step === "email" ? "We will always keep account details private." : step === "otp" ? "The code is valid for 10 minutes." : "Use a unique password you have not used before."}>
      {message ? <div className="mb-4 flex items-start gap-2 rounded-2xl border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-700 dark:border-emerald-900/70 dark:bg-emerald-950/40 dark:text-emerald-300"><Mail className="mt-0.5 h-4 w-4 shrink-0" /><span>{message}</span></div> : null}
      {error ? <p className="mb-4 rounded-2xl border border-rose-200 bg-rose-50 p-3 text-sm text-rose-700 dark:border-rose-900/70 dark:bg-rose-950/40 dark:text-rose-300" role="alert">{error}</p> : null}
      {step === "email" ? <form className="space-y-5" onSubmit={submitEmail}><label className="block space-y-2 text-sm font-medium text-stone-700 dark:text-stone-200">Email address<input type="email" value={email} onChange={(event) => setEmail(event.target.value)} autoComplete="email" placeholder="you@example.com" className="h-11 w-full rounded-2xl border border-stone-200 bg-white px-4 text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 dark:border-stone-700 dark:bg-stone-900" required /></label><LoadingButton type="submit" className="w-full" isLoading={requestMutation.isPending} loadingText="Sending code...">Continue</LoadingButton></form> : null}
      {step === "otp" ? <form className="space-y-5" onSubmit={submitOtp}><OtpInput value={otp} onChange={setOtp} disabled={verifyMutation.isPending} /><div className="flex items-center justify-center gap-2 text-sm text-stone-500 dark:text-stone-400"><Clock3 className="h-4 w-4" />{Math.floor(remaining / 60).toString().padStart(2, "0")}:{(remaining % 60).toString().padStart(2, "0")}</div><LoadingButton type="submit" className="w-full" isLoading={verifyMutation.isPending} loadingText="Verifying...">Verify OTP</LoadingButton><button type="button" disabled={remaining > 0 || resendMutation.isPending} onClick={() => resendMutation.mutate(email)} className="w-full text-sm font-semibold text-emerald-600 disabled:cursor-not-allowed disabled:text-stone-400">{resendMutation.isPending ? "Resending..." : remaining > 0 ? "Resend OTP when timer ends" : "Resend OTP"}</button><button type="button" onClick={() => { setStep("email"); setMessage(null); setError(null); }} className="flex w-full items-center justify-center gap-1 text-sm text-stone-500 hover:text-emerald-600"><ChevronLeft className="h-4 w-4" />Change email</button></form> : null}
      {step === "password" ? <form className="space-y-5" onSubmit={submitPassword}><PasswordInput label="New password" id="reset-new-password" value={newPassword} onChange={(event) => setNewPassword(event.target.value)} autoComplete="new-password" placeholder="Create a strong password" /><PasswordStrengthMeter password={newPassword} confirmPassword={confirmPassword} /><PasswordInput label="Confirm password" id="reset-confirm-password" value={confirmPassword} onChange={(event) => setConfirmPassword(event.target.value)} autoComplete="new-password" placeholder="Repeat your password" /><LoadingButton type="submit" className="w-full" isLoading={resetMutation.isPending} loadingText="Updating password...">Update Password</LoadingButton></form> : null}
      {step !== "email" ? <p className="mt-5 flex items-center justify-center gap-2 text-xs text-stone-500 dark:text-stone-400"><ShieldCheck className="h-4 w-4 text-emerald-600" />Reset codes expire after 10 minutes.</p> : null}
    </AuthCard>
  </AuthLayout>;
}
