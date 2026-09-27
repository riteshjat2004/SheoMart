"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import {
  ShoppingBag,
  Sparkles,
  MapPin,
  Heart,
  Tag,
  ArrowRight,
  TrendingUp,
  RotateCcw,
  ShieldCheck,
  User,
  Star,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Container } from "@/components/layout/container";
import { PageWrapper } from "@/components/layout/page-wrapper";
import { Section } from "@/components/layout/section";
import { CustomerInsightsView } from "@/components/profile/CustomerInsightsView";
import { useAuthStore } from "@/store/auth-store";
import { useOrders } from "@/hooks/use-orders";

export default function CustomerDashboardPage() {
  const router = useRouter();
  const { user, isAuthenticated, loading } = useAuthStore();
  const ordersQuery = useOrders();
  const orders = ordersQuery.data ?? [];
  const latestOrder = orders[0];

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.replace("/login");
    }
  }, [loading, isAuthenticated, router]);

  return (
    <PageWrapper>
      <Section className="space-y-6 py-6 sm:py-8 lg:py-10">
        <Container className="space-y-6">
          {/* Welcome Banner */}
          <div className="rounded-[2rem] border border-stone-200 bg-gradient-to-br from-emerald-50 via-white to-stone-50 p-6 sm:p-8 shadow-sm dark:border-stone-800 dark:from-zinc-900 dark:via-zinc-900 dark:to-zinc-950">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-100 px-3 py-1 text-xs font-bold text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                  <Sparkles className="h-3.5 w-3.5" />
                  Customer Hub & Shopping Insights
                </span>
                <h1 className="mt-2 text-2xl font-bold tracking-tight text-stone-900 sm:text-3xl dark:text-stone-50">
                  Welcome back, {user?.name || "Shopper"}!
                </h1>
                <p className="mt-1 text-xs sm:text-sm text-stone-600 dark:text-stone-300">
                  Track your grocery orders, examine your personal money savings, and explore top
                  picks.
                </p>
              </div>

              <div className="flex flex-wrap gap-2.5">
                <Button asChild className="rounded-full bg-emerald-600 text-white hover:bg-emerald-700">
                  <Link href="/explore">
                    Shop Now <ArrowRight className="ml-1.5 h-4 w-4" />
                  </Link>
                </Button>
                <Button asChild variant="outline" className="rounded-full">
                  <Link href="/profile">My Account</Link>
                </Button>
              </div>
            </div>

            {/* Quick Hub Navigation Shortcuts */}
            <div className="mt-6 grid grid-cols-2 gap-3 border-t border-stone-200/60 pt-5 sm:grid-cols-4 dark:border-stone-800">
              <Link
                href="/orders"
                className="flex items-center gap-3 rounded-2xl border border-stone-100 bg-white p-3 shadow-xs transition hover:border-emerald-300 hover:shadow-sm dark:border-stone-800 dark:bg-stone-900"
              >
                <div className="rounded-xl bg-emerald-50 p-2 text-emerald-600 dark:bg-emerald-950">
                  <ShoppingBag className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-xs font-bold text-stone-900 dark:text-stone-50">My Orders</p>
                  <p className="text-[11px] text-stone-400">{orders.length} placed</p>
                </div>
              </Link>

              <Link
                href="/wishlist"
                className="flex items-center gap-3 rounded-2xl border border-stone-100 bg-white p-3 shadow-xs transition hover:border-emerald-300 hover:shadow-sm dark:border-stone-800 dark:bg-stone-900"
              >
                <div className="rounded-xl bg-red-50 p-2 text-red-500 dark:bg-red-950">
                  <Heart className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-xs font-bold text-stone-900 dark:text-stone-50">Saved Wishlist</p>
                  <p className="text-[11px] text-stone-400">View favorites</p>
                </div>
              </Link>

              <Link
                href="/addresses"
                className="flex items-center gap-3 rounded-2xl border border-stone-100 bg-white p-3 shadow-xs transition hover:border-emerald-300 hover:shadow-sm dark:border-stone-800 dark:bg-stone-900"
              >
                <div className="rounded-xl bg-blue-50 p-2 text-blue-600 dark:bg-blue-950">
                  <MapPin className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-xs font-bold text-stone-900 dark:text-stone-50">Addresses</p>
                  <p className="text-[11px] text-stone-400">Manage locations</p>
                </div>
              </Link>

              <Link
                href="/coupons"
                className="flex items-center gap-3 rounded-2xl border border-stone-100 bg-white p-3 shadow-xs transition hover:border-emerald-300 hover:shadow-sm dark:border-stone-800 dark:bg-stone-900"
              >
                <div className="rounded-xl bg-amber-50 p-2 text-amber-600 dark:bg-amber-950">
                  <Tag className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-xs font-bold text-stone-900 dark:text-stone-50">Coupon Center</p>
                  <p className="text-[11px] text-stone-400">Claim savings</p>
                </div>
              </Link>
            </div>
          </div>

          {/* Active / Latest Order Card */}
          {latestOrder && (
            <div className="rounded-[1.75rem] border border-emerald-200 bg-emerald-50/40 p-5 dark:border-emerald-950 dark:bg-emerald-950/20">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <span className="text-xs font-bold uppercase tracking-wider text-emerald-700">
                    Latest Order Snapshot
                  </span>
                  <h3 className="mt-0.5 text-base font-bold text-stone-900 dark:text-stone-50">
                    Order #{latestOrder.orderId?.slice(-8).toUpperCase()} • ₹{latestOrder.grandTotal}
                  </h3>
                  <p className="text-xs text-stone-500">
                    Status: {latestOrder.pickupStatus || latestOrder.status || "Processing"}
                  </p>
                </div>

                <div className="flex gap-2">
                  <Button asChild size="sm" variant="outline">
                    <Link href={`/orders/${latestOrder.orderId}`}>Track Order</Link>
                  </Button>
                  <Button asChild size="sm" className="bg-emerald-600 text-white">
                    <Link href="/orders">All Orders</Link>
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* Personal Shopping Insights & Charts */}
          <div className="space-y-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-emerald-600">
                Personal Analytics
              </p>
              <h2 className="mt-1 text-xl font-bold text-stone-900 dark:text-stone-50">
                Your SheoMart Spending & Savings Insights
              </h2>
            </div>
            <CustomerInsightsView />
          </div>
        </Container>
      </Section>
    </PageWrapper>
  );
}
