import { AuthLayout } from "@/components/auth/AuthLayout";
import { AuthCard } from "@/components/auth/AuthCard";
import { RegisterForm } from "@/components/auth/RegisterForm";

export default function RegisterPage() {
  return (
    <AuthLayout title="Create your account" subtitle="Join SheoMart for faster checkout and tailored recommendations.">
      <AuthCard title="Create account" description="Start with your basic details to get going.">
        <RegisterForm />
      </AuthCard>
    </AuthLayout>
  );
}
