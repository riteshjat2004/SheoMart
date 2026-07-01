import { AuthLayout } from "@/components/auth/AuthLayout";
import { AuthCard } from "@/components/auth/AuthCard";
import { LoginForm } from "@/components/auth/LoginForm";

export default function LoginPage() {
  return (
    <AuthLayout title="Welcome back" subtitle="Sign in to continue your SheoMart journey.">
      <AuthCard title="Sign in" description="Enter your details to access your account.">
        <LoginForm />
      </AuthCard>
    </AuthLayout>
  );
}
