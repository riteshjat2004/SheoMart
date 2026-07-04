"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { AuthCard } from "@/components/auth/AuthCard";
import { AuthLayout } from "@/components/auth/AuthLayout";
import { SellerApplicationForm } from "@/components/marketplace/SellerApplicationForm";
import { useAuthStore } from "@/store/auth-store";

export default function BecomeSellerPage() {
  const router = useRouter();
  const { isAuthenticated, loading, role, user } = useAuthStore();

  useEffect(() => {
    if (loading) {
      return;
    }

    if (!isAuthenticated) {
      router.replace("/login?redirect=/become-seller");
      return;
    }

    if (role === "store_owner") {
      router.replace("/store");
      return;
    }

    if (role === "platform_admin") {
      router.replace("/admin");
    }
  }, [isAuthenticated, loading, role, router]);

  if (loading || !isAuthenticated) {
    return null;
  }

  return (
    <AuthLayout title="Apply to become a seller" subtitle="Launch your own storefront on SheoMart with a short approval process.">
      <AuthCard title="Seller application" description="Share your store details and we’ll review everything before approval.">
        <SellerApplicationForm user={user} />
      </AuthCard>
    </AuthLayout>
  );
}
