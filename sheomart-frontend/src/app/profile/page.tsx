"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/auth-store";
import { useProfile } from "@/hooks/useProfile";
import { useUpdateProfile } from "@/hooks/useUpdateProfile";
import { ProfileHeader } from "@/components/profile/ProfileHeader";
import { ProfileCard } from "@/components/profile/ProfileCard";
import { PersonalInfoCard } from "@/components/profile/PersonalInfoCard";
import { SellerApplicationCard } from "@/components/profile/SellerApplicationCard";
import { QuickActionsCard } from "@/components/profile/QuickActionsCard";
import { SecurityCard } from "@/components/profile/SecurityCard";
import { CouponWallet } from "@/components/profile/CouponWallet";
import { EditProfileDialog } from "@/components/profile/EditProfileDialog";
import { ProfileSkeleton } from "@/components/profile/ProfileSkeleton";
import { fetchMyStore } from "@/services/store";
import type { ProfileUpdatePayload, SellerApplicationStatus } from "@/types/profile";

export default function CustomerProfilePage() {
  const router = useRouter();
  const { isAuthenticated, loading, role, logout } = useAuthStore();
  const { data: profile, isLoading, isError, error } = useProfile();
  const updateProfileMutation = useUpdateProfile();
  const [editOpen, setEditOpen] = useState(false);
  const [sellerStatus, setSellerStatus] = useState<SellerApplicationStatus>("none");

  useEffect(() => {
    if (loading) {
      return;
    }

    if (!isAuthenticated) {
      router.replace("/login");
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

  useEffect(() => {
    let active = true;

    async function resolveSellerStatus() {
      if (!isAuthenticated || role !== "customer") {
        return;
      }

      try {
        const store = await fetchMyStore();
        if (!active) {
          return;
        }

        if (!store) {
          setSellerStatus("none");
          return;
        }

        if (store.status === "pending") {
          setSellerStatus("pending");
        } else if (store.status === "approved") {
          setSellerStatus("approved");
        } else if (store.status === "rejected") {
          setSellerStatus("rejected");
        } else {
          setSellerStatus("none");
        }
      } catch {
        setSellerStatus("none");
      }
    }

    void resolveSellerStatus();

    return () => {
      active = false;
    };
  }, [isAuthenticated, role]);

  const handleSubmit = (values: ProfileUpdatePayload) => {
    updateProfileMutation.mutate(values, {
      onSuccess: () => setEditOpen(false),
    });
  };

  const handleLogout = () => {
    logout();
    router.replace("/login");
  };

  const errorMessage = useMemo(() => {
    if (error instanceof Error) {
      return error.message;
    }

    return "We could not load your profile right now.";
  }, [error]);

  if (loading || isLoading) {
    return <ProfileSkeleton />;
  }

  if (!profile) {
    return (
      <div className="mx-auto flex max-w-4xl flex-col gap-4 p-6">
        <div className="rounded-[2rem] border border-rose-200 bg-rose-50 p-6 text-sm text-rose-700 dark:border-rose-900/70 dark:bg-rose-950/40 dark:text-rose-300" role="alert">
          {errorMessage}
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-6 p-4 sm:p-6 lg:p-8">
      <ProfileHeader user={profile} onEdit={() => setEditOpen(true)} />

      <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
        <div className="space-y-6">
          <ProfileCard title="Personal information" description="Your account details and account age.">
            <PersonalInfoCard user={profile} onEdit={() => setEditOpen(true)} />
          </ProfileCard>
          <ProfileCard title="Seller application" description="Manage your path to becoming a seller on SheoMart.">
            <SellerApplicationCard status={sellerStatus} />
          </ProfileCard>
        </div>
        <div className="space-y-6">
          <ProfileCard title="Quick actions" description="Jump into the most common customer flows.">
            <QuickActionsCard />
          </ProfileCard>
          <ProfileCard id="security" title="Security" description="Manage how you sign in and protect your account.">
            <SecurityCard onLogout={handleLogout} />
          </ProfileCard>
        </div>
      </div>

      <ProfileCard title="Coupon wallet" description="Browse available coupons, redemption history, expired codes, and current festival offers.">
        <CouponWallet />
      </ProfileCard>

      <EditProfileDialog open={editOpen} user={profile} onClose={() => setEditOpen(false)} onSubmit={handleSubmit} isSubmitting={updateProfileMutation.isPending} />
    </div>
  );
}
