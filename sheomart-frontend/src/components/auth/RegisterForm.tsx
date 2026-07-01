"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import Link from "next/link";
import { registerSchema, type RegisterFormValues } from "@/lib/auth-schemas";
import { FormField } from "@/components/auth/FormField";
import { PasswordInput } from "@/components/auth/PasswordInput";
import { LoadingButton } from "@/components/auth/LoadingButton";
import { useAuthStore } from "@/store/auth-store";
import { register as registerRequest } from "@/services/auth";
import { useMutation } from "@tanstack/react-query";
import { AlertCircle, CheckCircle2 } from "lucide-react";
import { applyServerErrors, getApiErrorMessage } from "@/lib/auth-errors";

export function RegisterForm() {
  const router = useRouter();
  const { login: setSession } = useAuthStore();
  const [serverMessage, setServerMessage] = useState<string | null>(null);
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: "",
      email: "",
      mobile: "",
      password: "",
      confirmPassword: "",
    },
  });

  const mutation = useMutation({
    mutationFn: registerRequest,
    onSuccess: (session) => {
      setSession(session);
      setServerMessage("Your account is ready. Let’s get you shopping.");
      router.push("/");
    },
    onError: (error: unknown) => {
      applyServerErrors(setError, error, "email");
      setServerError(getApiErrorMessage(error));
    },
  });

  const onSubmit = (values: RegisterFormValues) => {
    setServerError(null);
    setServerMessage(null);
    mutation.mutate(values);
  };

  return (
    <form className="space-y-4" onSubmit={handleSubmit(onSubmit)} noValidate>
      {serverError ? (
        <div className="flex items-start gap-2 rounded-2xl border border-red-200 bg-red-50 p-3 text-sm text-red-700 dark:border-red-900/70 dark:bg-red-950/40 dark:text-red-300" role="alert">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
          <span>{serverError}</span>
        </div>
      ) : null}
      {serverMessage ? (
        <div className="flex items-start gap-2 rounded-2xl border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-700 dark:border-emerald-900/70 dark:bg-emerald-950/40 dark:text-emerald-300">
          <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" />
          <span>{serverMessage}</span>
        </div>
      ) : null}

      <FormField
        label="Full name"
        placeholder="Aarav Sharma"
        autoComplete="name"
        error={errors.name}
        {...register("name")}
      />

      <FormField
        label="Email address"
        type="email"
        placeholder="you@example.com"
        autoComplete="email"
        error={errors.email}
        {...register("email")}
      />

      <FormField
        label="Mobile number"
        type="tel"
        placeholder="9876543210"
        autoComplete="tel"
        error={errors.mobile}
        {...register("mobile")}
      />

      <PasswordInput
        label="Password"
        placeholder="Create a strong password"
        autoComplete="new-password"
        error={errors.password}
        {...register("password")}
      />

      <PasswordInput
        label="Confirm password"
        placeholder="Repeat your password"
        autoComplete="new-password"
        error={errors.confirmPassword}
        {...register("confirmPassword")}
      />

      <LoadingButton type="submit" className="w-full" isLoading={mutation.isPending} loadingText="Creating account...">
        Create account
      </LoadingButton>

      <p className="text-center text-sm text-stone-600 dark:text-stone-300">
        Already have an account?{' '}
        <Link href="/login" className="font-semibold text-emerald-600 hover:text-emerald-700">
          Sign in
        </Link>
      </p>
    </form>
  );
}
