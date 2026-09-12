"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter, useSearchParams } from "next/navigation";
import { useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import Link from "next/link";
import { loginSchema, type LoginFormValues } from "@/lib/auth-schemas";
import { FormField } from "@/components/auth/FormField";
import { PasswordInput } from "@/components/auth/PasswordInput";
import { LoadingButton } from "@/components/auth/LoadingButton";
import { useAuthStore } from "@/store/auth-store";
import { login as loginRequest } from "@/services/auth";
import { useMutation } from "@tanstack/react-query";
import { AlertCircle, CheckCircle2 } from "lucide-react";
import { applyServerErrors, getApiErrorMessage } from "@/lib/auth-errors";

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { login: setSession } = useAuthStore();
  const [serverMessage, setServerMessage] = useState<string | null>(null);
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      identifier: "",
      password: "",
    },
  });

  const redirectTo = useMemo(() => {
    const rawRedirect = searchParams.get("redirect") ?? "/";
    if (typeof rawRedirect === "string" && rawRedirect.startsWith("/") && !rawRedirect.startsWith("//")) {
      return rawRedirect;
    }
    return "/";
  }, [searchParams]);

  const mutation = useMutation({
    mutationFn: loginRequest,
    onSuccess: (session) => {
      setSession(session);
      setServerMessage("Welcome back! Your session is ready.");
      router.push(redirectTo);
    },
    onError: (error: unknown) => {
      applyServerErrors(setError, error, "identifier");
      setServerError(getApiErrorMessage(error));
    },
  });

  const onSubmit = (values: LoginFormValues) => {
    setServerError(null);
    setServerMessage(null);
    mutation.mutate(values);
  };

  return (
    <form className="space-y-5" onSubmit={handleSubmit(onSubmit)} noValidate>
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
        label="Email or mobile"
        placeholder="you@example.com or 9876543210"
        autoComplete="username"
        error={errors.identifier}
        {...register("identifier")}
      />

      <PasswordInput
        label="Password"
        placeholder="Enter your password"
        autoComplete="current-password"
        error={errors.password}
        {...register("password")}
      />

      <div className="flex items-center justify-between text-sm">
        <label className="flex items-center gap-2 text-stone-600 dark:text-stone-300">
          <input type="checkbox" className="rounded border-stone-300 text-emerald-600 focus:ring-emerald-500" />
          Remember me
        </label>
        <Link href="/forgot-password" className="font-medium text-emerald-600 hover:text-emerald-700 hover:underline">
          Forgot Password?
        </Link>
      </div>

      <LoadingButton type="submit" className="w-full" isLoading={mutation.isPending} loadingText="Signing in...">
        Sign in
      </LoadingButton>

      <p className="text-center text-sm text-stone-600 dark:text-stone-300">
        New here?{' '}
        <Link href="/register" className="font-semibold text-emerald-600 hover:text-emerald-700">
          Create an account
        </Link>
      </p>
    </form>
  );
}
