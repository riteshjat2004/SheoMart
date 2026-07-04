import { ArrowUpRight, CalendarDays, Mail, Smartphone } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { ProfileUser } from "@/types/profile";

interface PersonalInfoCardProps {
  user: ProfileUser;
  onEdit: () => void;
}

export function PersonalInfoCard({ user, onEdit }: PersonalInfoCardProps) {
  const joinedAt = user.createdAt ? new Date(user.createdAt).toLocaleDateString("en", { month: "short", day: "numeric", year: "numeric" }) : "Recently joined";

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-stone-500 dark:text-stone-400">Personal information</p>
          <p className="text-sm text-stone-600 dark:text-stone-300">Keep your contact details up to date.</p>
        </div>
        <Button type="button" variant="outline" onClick={onEdit}>
          Edit profile
          <ArrowUpRight className="h-4 w-4" />
        </Button>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="rounded-2xl border border-stone-200 bg-stone-50/70 p-4 dark:border-stone-800 dark:bg-stone-950/50">
          <div className="flex items-center gap-2 text-sm font-medium text-stone-500 dark:text-stone-400">
            <Mail className="h-4 w-4" />
            Email
          </div>
          <p className="mt-2 text-sm text-stone-900 dark:text-stone-50">{user.email}</p>
        </div>
        <div className="rounded-2xl border border-stone-200 bg-stone-50/70 p-4 dark:border-stone-800 dark:bg-stone-950/50">
          <div className="flex items-center gap-2 text-sm font-medium text-stone-500 dark:text-stone-400">
            <Smartphone className="h-4 w-4" />
            Mobile
          </div>
          <p className="mt-2 text-sm text-stone-900 dark:text-stone-50">{user.mobile || "Not provided"}</p>
        </div>
        <div className="rounded-2xl border border-stone-200 bg-stone-50/70 p-4 dark:border-stone-800 dark:bg-stone-950/50">
          <div className="flex items-center gap-2 text-sm font-medium text-stone-500 dark:text-stone-400">
            <CalendarDays className="h-4 w-4" />
            Member since
          </div>
          <p className="mt-2 text-sm text-stone-900 dark:text-stone-50">{joinedAt}</p>
        </div>
      </div>
    </div>
  );
}
