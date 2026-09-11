"use client";

import { useEffect, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { CheckCircle2, KeyRound, LogOut, Mail, Phone, UserCircle2 } from "lucide-react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Breadcrumb } from "@/components/dashboard/layout/Breadcrumb";
import { DashboardCard } from "@/components/dashboard/DashboardCard";
import { DashboardContent } from "@/components/dashboard/layout/DashboardContent";
import { EmptyState } from "@/components/dashboard/EmptyState";
import { LoadingSkeleton } from "@/components/dashboard/LoadingSkeleton";
import { PageHeader } from "@/components/dashboard/layout/PageHeader";
import { Button } from "@/components/ui/button";
import { ErrorState } from "@/components/common/error-state";
import { useProfile } from "@/hooks/useProfile";
import { useUpdateProfile } from "@/hooks/useUpdateProfile";
import { changePassword } from "@/services/profile";
import { useAuthStore } from "@/store/auth-store";
import type { ProfileUpdatePayload, ProfileUser } from "@/types/profile";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { fetchPlatformFeeConfig, updatePlatformFeeConfig, type PlatformFeeConfig } from "@/services/platform-fee";

const profileSchema = z.object({
  name: z.string().trim().min(2, "Name must be at least 2 characters").max(100, "Name must be at most 100 characters"),
  mobile: z.string().trim().regex(/^[6-9]\d{9}$/, "Enter a valid 10-digit mobile number"),
  avatar: z.string().trim().max(500, "Avatar URL must be at most 500 characters").optional().or(z.literal("")),
});

type ProfileFormValues = z.infer<typeof profileSchema>;

const passwordSchema = z.object({
  currentPassword: z.string().min(8, "Current password must be at least 8 characters"),
  newPassword: z.string().min(8, "New password must be at least 8 characters"),
  confirmPassword: z.string().min(8, "Confirm password must be at least 8 characters"),
}).refine((values) => values.newPassword === values.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});

type PasswordFormValues = z.infer<typeof passwordSchema>;

function roleLabel(role: ProfileUser["role"]) {
  return role.replace("_", " ");
}

function ProfileForm({ profile }: { profile: ProfileUser }) {
  const updateProfileMutation = useUpdateProfile();
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; message: string } | null>(null);
  const { register, handleSubmit, formState: { errors } } = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: profile.name,
      mobile: profile.mobile,
      avatar: profile.avatar ?? "",
    },
  });

  const onSubmit = (values: ProfileFormValues) => {
    setFeedback(null);
    const payload: ProfileUpdatePayload = {
      name: values.name,
      mobile: values.mobile,
      avatar: values.avatar || undefined,
    };
    updateProfileMutation.mutate(payload, {
      onSuccess: () => setFeedback({ type: "success", message: "Profile updated successfully." }),
      onError: (error: unknown) => setFeedback({ type: "error", message: error instanceof Error ? error.message : "Unable to update profile." }),
    });
  };

  return (
    <form className="space-y-5" onSubmit={handleSubmit(onSubmit)}>
      <div className="flex items-center gap-4 border-b border-stone-200 pb-5 dark:border-stone-800">
        <div className="flex h-14 w-14 items-center justify-center overflow-hidden rounded-full bg-emerald-100 text-lg font-semibold text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300">
          {profile.avatar ? <img src={profile.avatar} alt="" className="h-full w-full object-cover" /> : profile.name.charAt(0).toUpperCase()}
        </div>
        <div>
          <p className="font-semibold text-stone-900 dark:text-stone-50">{profile.name}</p>
          <p className="text-sm text-stone-500 dark:text-stone-400">Administrator account</p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <label className="space-y-1.5 text-sm font-medium text-stone-700 dark:text-stone-300">
          <span>Name</span>
          <input {...register("name")} className="min-h-11 w-full rounded-lg border border-stone-200 bg-white px-3 text-sm outline-none focus:border-emerald-500 dark:border-stone-800 dark:bg-stone-950" />
          {errors.name ? <span className="text-xs font-normal text-rose-600">{errors.name.message}</span> : null}
        </label>
        <label className="space-y-1.5 text-sm font-medium text-stone-700 dark:text-stone-300">
          <span>Mobile</span>
          <input {...register("mobile")} inputMode="numeric" className="min-h-11 w-full rounded-lg border border-stone-200 bg-white px-3 text-sm outline-none focus:border-emerald-500 dark:border-stone-800 dark:bg-stone-950" />
          {errors.mobile ? <span className="text-xs font-normal text-rose-600">{errors.mobile.message}</span> : null}
        </label>
      </div>

      <label className="block space-y-1.5 text-sm font-medium text-stone-700 dark:text-stone-300">
        <span>Avatar URL</span>
        <input {...register("avatar")} type="url" placeholder="https://example.com/avatar.jpg" className="min-h-11 w-full rounded-lg border border-stone-200 bg-white px-3 text-sm outline-none focus:border-emerald-500 dark:border-stone-800 dark:bg-stone-950" />
        {errors.avatar ? <span className="text-xs font-normal text-rose-600">{errors.avatar.message}</span> : null}
      </label>

      {feedback ? <div className={`rounded-lg border p-3 text-sm ${feedback.type === "success" ? "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900/70 dark:bg-emerald-950/40 dark:text-emerald-300" : "border-rose-200 bg-rose-50 text-rose-700 dark:border-rose-900/70 dark:bg-rose-950/40 dark:text-rose-300"}`}>{feedback.message}</div> : null}

      <div className="flex justify-end">
        <Button type="submit" disabled={updateProfileMutation.isPending}>{updateProfileMutation.isPending ? "Saving..." : "Save profile"}</Button>
      </div>
    </form>
  );
}

function AccountDetails({ profile }: { profile: ProfileUser }) {
  return (
    <div className="grid gap-3 sm:grid-cols-2">
      <div className="rounded-lg border border-stone-200 bg-stone-50/70 p-3 dark:border-stone-800 dark:bg-stone-950/50">
        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.14em] text-stone-500"><Mail className="h-3.5 w-3.5" />Email</div>
        <p className="mt-2 break-all text-sm text-stone-900 dark:text-stone-100">{profile.email}</p>
      </div>
      <div className="rounded-lg border border-stone-200 bg-stone-50/70 p-3 dark:border-stone-800 dark:bg-stone-950/50">
        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.14em] text-stone-500"><UserCircle2 className="h-3.5 w-3.5" />Role</div>
        <p className="mt-2 text-sm capitalize text-stone-900 dark:text-stone-100">{roleLabel(profile.role)}</p>
      </div>
      <div className="rounded-lg border border-stone-200 bg-stone-50/70 p-3 dark:border-stone-800 dark:bg-stone-950/50">
        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.14em] text-stone-500"><CheckCircle2 className="h-3.5 w-3.5" />Email verification</div>
        <p className="mt-2 text-sm text-stone-900 dark:text-stone-100">{profile.emailVerified ? "Verified" : "Not verified"}</p>
      </div>
      <div className="rounded-lg border border-stone-200 bg-stone-50/70 p-3 dark:border-stone-800 dark:bg-stone-950/50">
        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.14em] text-stone-500"><Phone className="h-3.5 w-3.5" />Phone verification</div>
        <p className="mt-2 text-sm text-stone-900 dark:text-stone-100">{profile.phoneVerified ? "Verified" : "Not verified"}</p>
      </div>
    </div>
  );
}

function SecuritySection() {
  const logout = useAuthStore((state) => state.logout);
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; message: string } | null>(null);
  const { register, handleSubmit, reset, formState: { errors } } = useForm<PasswordFormValues>({ resolver: zodResolver(passwordSchema) });
  const passwordMutation = useMutation({
    mutationFn: changePassword,
    onSuccess: () => {
      reset();
      setFeedback({ type: "success", message: "Password changed successfully." });
    },
    onError: (error: unknown) => setFeedback({ type: "error", message: error instanceof Error ? error.message : "Unable to change password." }),
  });

  const onSubmit = (values: PasswordFormValues) => {
    setFeedback(null);
    passwordMutation.mutate(values);
  };

  return (
    <div className="space-y-5">
      <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
        <div className="flex items-center gap-2 text-sm font-semibold text-stone-900 dark:text-stone-50"><KeyRound className="h-4 w-4 text-emerald-600" />Change password</div>
        <div className="grid gap-4 md:grid-cols-3">
          {(["currentPassword", "newPassword", "confirmPassword"] as const).map((field) => (
            <label key={field} className="space-y-1.5 text-sm font-medium text-stone-700 dark:text-stone-300">
              <span>{field === "currentPassword" ? "Current password" : field === "newPassword" ? "New password" : "Confirm new password"}</span>
              <input {...register(field)} type="password" autoComplete={field === "currentPassword" ? "current-password" : "new-password"} className="min-h-11 w-full rounded-lg border border-stone-200 bg-white px-3 text-sm outline-none focus:border-emerald-500 dark:border-stone-800 dark:bg-stone-950" />
              {errors[field] ? <span className="text-xs font-normal text-rose-600">{errors[field]?.message}</span> : null}
            </label>
          ))}
        </div>
        {feedback ? <div className={`rounded-lg border p-3 text-sm ${feedback.type === "success" ? "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900/70 dark:bg-emerald-950/40 dark:text-emerald-300" : "border-rose-200 bg-rose-50 text-rose-700 dark:border-rose-900/70 dark:bg-rose-950/40 dark:text-rose-300"}`}>{feedback.message}</div> : null}
        <div className="flex justify-end"><Button type="submit" disabled={passwordMutation.isPending}>{passwordMutation.isPending ? "Updating..." : "Change password"}</Button></div>
      </form>
      <div className="flex flex-col gap-3 border-t border-stone-200 pt-4 dark:border-stone-800 sm:flex-row sm:items-center sm:justify-between">
        <div><p className="text-sm font-semibold text-stone-900 dark:text-stone-50">Sign out</p><p className="mt-1 text-sm text-stone-500 dark:text-stone-400">End this administrator session on this device.</p></div>
        <Button type="button" variant="outline" onClick={logout}><LogOut className="h-4 w-4" />Logout</Button>
      </div>
    </div>
  );
}

function PlatformFeeSettings() {
  const queryClient = useQueryClient();
  const query = useQuery({ queryKey: ["platform-fee"], queryFn: fetchPlatformFeeConfig });
  const [form, setForm] = useState<PlatformFeeConfig>({ amount: 10, feeType: "FIXED", minimumOrderAmount: 0, maximumPlatformFee: undefined, enabled: true });
  const [initialized, setInitialized] = useState(false);
  useEffect(() => { if (query.data && !initialized) { setForm(query.data); setInitialized(true); } }, [initialized, query.data]);
  const mutation = useMutation({ mutationFn: updatePlatformFeeConfig, onSuccess: (config) => { if (config) setForm(config); void queryClient.invalidateQueries({ queryKey: ["platform-fee"] }); } });
  return <DashboardCard title="Platform Fee Settings" description="Configure the platform fee applied to every pickup and delivery checkout."><div className="grid gap-4 md:grid-cols-2"><label className="space-y-1.5 text-sm font-medium"><span>Fee amount</span><input type="number" min="0" value={form.amount} onChange={(event) => setForm({ ...form, amount: Number(event.target.value) })} className="min-h-11 w-full rounded-lg border border-stone-200 bg-white px-3 dark:border-stone-800 dark:bg-stone-950" /></label><label className="space-y-1.5 text-sm font-medium"><span>Fee type</span><select value={form.feeType} onChange={(event) => setForm({ ...form, feeType: event.target.value as PlatformFeeConfig["feeType"] })} className="min-h-11 w-full rounded-lg border border-stone-200 bg-white px-3 dark:border-stone-800 dark:bg-stone-950"><option value="FIXED">Fixed amount</option><option value="PERCENTAGE">Percentage of order total</option></select></label><label className="space-y-1.5 text-sm font-medium"><span>Minimum order amount</span><input type="number" min="0" value={form.minimumOrderAmount ?? 0} onChange={(event) => setForm({ ...form, minimumOrderAmount: Number(event.target.value) })} className="min-h-11 w-full rounded-lg border border-stone-200 bg-white px-3 dark:border-stone-800 dark:bg-stone-950" /></label><label className="space-y-1.5 text-sm font-medium"><span>Maximum platform fee</span><input type="number" min="0" value={form.maximumPlatformFee ?? ""} onChange={(event) => setForm({ ...form, maximumPlatformFee: event.target.value ? Number(event.target.value) : undefined })} className="min-h-11 w-full rounded-lg border border-stone-200 bg-white px-3 dark:border-stone-800 dark:bg-stone-950" /></label></div><label className="mt-4 flex items-center gap-2 text-sm font-medium"><input type="checkbox" checked={form.enabled} onChange={(event) => setForm({ ...form, enabled: event.target.checked })} />Enable platform fee</label><div className="mt-5 flex justify-end"><Button type="button" disabled={mutation.isPending || query.isLoading} onClick={() => mutation.mutate(form)}>{mutation.isPending ? "Saving..." : "Save platform fee"}</Button></div></DashboardCard>;
}

export default function AdminSettingsPage() {
  const profileQuery = useProfile();

  return (
    <DashboardContent className="space-y-6">
      <Breadcrumb items={[{ label: "Admin" }, { label: "Settings" }]} />
      <PageHeader title="Settings" description="Manage your administrator account and security." />

      {profileQuery.isLoading ? <LoadingSkeleton rows={4} /> : null}
      {profileQuery.isError ? <ErrorState message={profileQuery.error instanceof Error ? profileQuery.error.message : "Unable to load administrator profile."} /> : null}
      {!profileQuery.isLoading && !profileQuery.isError && !profileQuery.data ? <EmptyState title="Administrator profile unavailable" description="Try again after confirming your session is active." /> : null}

      {profileQuery.data ? (
        <>
          <DashboardCard title="Profile" description="Update only the profile details supported by your account API.">
            <ProfileForm key={profileQuery.data.userId} profile={profileQuery.data} />
            <div className="mt-5 border-t border-stone-200 pt-5 dark:border-stone-800"><AccountDetails profile={profileQuery.data} /></div>
          </DashboardCard>
          <DashboardCard title="Security" description="Change your password or sign out using the existing account security flow."><SecuritySection /></DashboardCard>
          <PlatformFeeSettings />
          <p className="text-center text-xs text-stone-500 dark:text-stone-400">Platform configuration remains managed through deployment and environment configuration.</p>
        </>
      ) : null}
    </DashboardContent>
  );
}
