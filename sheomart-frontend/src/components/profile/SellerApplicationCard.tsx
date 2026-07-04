import Link from "next/link";
import { ArrowRight, BadgeCheck, Clock3, Store, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { SellerApplicationStatus } from "@/types/profile";

interface SellerApplicationCardProps {
  status: SellerApplicationStatus;
}

export function SellerApplicationCard({ status }: SellerApplicationCardProps) {
  const statusConfig = {
    none: {
      title: "Become a Seller",
      description: "Launch your own storefront and manage products with full seller tools.",
      icon: Store,
      actionHref: "/become-seller",
      actionLabel: "Get started",
      tone: "emerald",
    },
    pending: {
      title: "Application pending review",
      description: "Your seller request is being reviewed. We’ll let you know as soon as it is approved.",
      icon: Clock3,
      actionHref: "/profile",
      actionLabel: "Check status",
      tone: "amber",
    },
    approved: {
      title: "Store approved",
      description: "Your storefront is ready. Open the seller dashboard to start managing products.",
      icon: BadgeCheck,
      actionHref: "/store",
      actionLabel: "Go to store dashboard",
      tone: "emerald",
    },
    rejected: {
      title: "Application rejected",
      description: "Your seller application needs a quick refresh before it can be reviewed again.",
      icon: XCircle,
      actionHref: "/become-seller",
      actionLabel: "Apply again",
      tone: "rose",
    },
  }[status];

  const Icon = statusConfig.icon;

  return (
    <div className={`rounded-[2rem] border p-6 shadow-sm ${status === "pending" ? "border-amber-200 bg-amber-50/70 dark:border-amber-900/60 dark:bg-amber-950/30" : status === "rejected" ? "border-rose-200 bg-rose-50/70 dark:border-rose-900/60 dark:bg-rose-950/30" : "border-stone-200 bg-white/80 dark:border-stone-800 dark:bg-stone-900/80"}`}>
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className={`rounded-2xl p-2 ${status === "pending" ? "bg-amber-100 text-amber-700 dark:bg-amber-500/10 dark:text-amber-300" : status === "rejected" ? "bg-rose-100 text-rose-700 dark:bg-rose-500/10 dark:text-rose-300" : "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300"}`}>
            <Icon className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-stone-900 dark:text-stone-50">{statusConfig.title}</h3>
            <p className="mt-1 text-sm leading-6 text-stone-600 dark:text-stone-300">{statusConfig.description}</p>
          </div>
        </div>
      </div>
      <div className="mt-5">
        <Button asChild variant="outline" className="w-full sm:w-auto">
          <Link href={statusConfig.actionHref}>
            {statusConfig.actionLabel}
            <ArrowRight className="h-4 w-4" />
          </Link>
        </Button>
      </div>
    </div>
  );
}
