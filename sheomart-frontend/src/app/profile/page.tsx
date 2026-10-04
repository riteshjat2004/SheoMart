"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  User,
  TrendingUp,
  MessageSquare,
  Gift,
  Shield,
  MapPin,
  ShoppingBag,
} from "lucide-react";
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
import { CustomerInsightsView } from "@/components/profile/CustomerInsightsView";
import { MyReviewsTab } from "@/components/profile/MyReviewsTab";
import { ThemeSelectionCard } from "@/components/common/ThemeSelectionCard";
import { fetchMyStore } from "@/services/store";
import type { ProfileUpdatePayload, SellerApplicationStatus } from "@/types/profile";

type ProfileTab = "overview" | "insights" | "reviews" | "coupons" | "security";

export default function CustomerProfilePage() {
  const router = useRouter();
  const { isAuthenticated, loading, role, logout } = useAuthStore();
  const { data: profile, isLoading, isError, error } = useProfile();
  const updateProfileMutation = useUpdateProfile();

  const [activeTab, setActiveTab] = useState<ProfileTab>("overview");
  const [editOpen, setEditOpen] = useState(false);
  const [sellerStatus, setSellerStatus] = useState<SellerApplicationStatus>("none");

  useEffect(() => {
    if (loading) return;

    if (!isAuthenticated) {
      router.replace("/login");
      return;
    }

    if (role === "store_owner") {
      router.replace("/store");
      return;
    }

    if (role === "platform_admin") {
      router.replace("/admin/settings?tab=general");
    }
  }, [isAuthenticated, loading, role, router]);

  useEffect(() => {
    let active = true;

    async function resolveSellerStatus() {
      if (!isAuthenticated || role !== "customer") return;

      try {
        const store = await fetchMyStore();
        if (!active) return;

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
        <div
          className="rounded-[2rem] border border-rose-200 bg-rose-50 p-6 text-sm text-rose-700 dark:border-rose-900/70 dark:bg-rose-950/40 dark:text-rose-300"
          role="alert"
        >
          {errorMessage}
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-6 p-4 sm:p-6 lg:p-8">
      <ProfileHeader user={profile} onEdit={() => setEditOpen(true)} />

      {/* Profile Navigation Tabs */}
      <div className="flex flex-wrap items-center gap-2 border-b border-stone-200 pb-3 text-xs dark:border-stone-800">
        {[
          { id: "overview", label: "Overview", icon: User },
          { id: "insights", label: "Shopping Insights & Savings", icon: TrendingUp },
          { id: "reviews", label: "My Reviews", icon: MessageSquare },
          { id: "coupons", label: "Coupon Wallet", icon: Gift },
          { id: "security", label: "Security & Password", icon: Shield },
        ].map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id as ProfileTab)}
              className={`flex items-center gap-2 rounded-full px-4 py-2 font-semibold transition ${
                activeTab === tab.id
                  ? "bg-emerald-600 text-white shadow-sm"
                  : "bg-stone-100 text-stone-600 hover:bg-stone-200 dark:bg-stone-800 dark:text-stone-300"
              }`}
            >
              <Icon className="h-3.5 w-3.5" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Tab Content */}
      {activeTab === "overview" && (
        <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
          <div className="space-y-6">
            <ProfileCard
              title="Personal information"
              description="Your account details and contact information."
            >
              <PersonalInfoCard user={profile} onEdit={() => setEditOpen(true)} />
            </ProfileCard>
            <ProfileCard
              title="Seller application"
              description="Manage your path to becoming a verified seller on SheoMart."
            >
              <SellerApplicationCard status={sellerStatus} />
            </ProfileCard>
          </div>
          <div className="space-y-6">
            <ProfileCard title="Quick actions" description="Jump into common customer flows.">
              <QuickActionsCard />
            </ProfileCard>
            <ThemeSelectionCard />
          </div>
        </div>
      )}

      {activeTab === "insights" && (
        <div className="space-y-4">
          <div>
            <h2 className="text-xl font-bold text-stone-900 dark:text-stone-50">
              Personal Shopping Insights
            </h2>
            <p className="text-xs text-stone-500">
              Aggregated statistics of your orders, savings, and favorite grocery categories.
            </p>
          </div>
          <CustomerInsightsView />
        </div>
      )}

      {activeTab === "reviews" && (
        <div className="space-y-4">
          <div>
            <h2 className="text-xl font-bold text-stone-900 dark:text-stone-50">
              Your Product Reviews
            </h2>
            <p className="text-xs text-stone-500">
              Reviews and ratings you submitted for purchased grocery products.
            </p>
          </div>
          <MyReviewsTab />
        </div>
      )}

      {activeTab === "coupons" && (
        <ProfileCard
          title="Coupon wallet"
          description="Browse available coupons, redemption history, expired codes, and current festival offers."
        >
          <CouponWallet />
        </ProfileCard>
      )}

      {activeTab === "security" && (
        <div className="max-w-2xl">
          <ProfileCard
            id="security"
            title="Account Security"
            description="Manage your login password and sign-in status."
          >
            <SecurityCard onLogout={handleLogout} />
          </ProfileCard>
        </div>
      )}

      <EditProfileDialog
        open={editOpen}
        user={profile}
        onClose={() => setEditOpen(false)}
        onSubmit={handleSubmit}
        isSubmitting={updateProfileMutation.isPending}
      />
    </div>
  );
}
