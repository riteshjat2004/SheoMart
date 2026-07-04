import { BadgeCheck, CalendarDays, Mail, Phone } from "lucide-react";
import type { ProfileUser } from "@/types/profile";
import { Button } from "@/components/ui/button";

interface ProfileHeaderProps {
  user: ProfileUser;
  onEdit: () => void;
}

export function ProfileHeader({ user, onEdit }: ProfileHeaderProps) {
  const joinedAt = user.createdAt ? new Date(user.createdAt).toLocaleDateString("en", { month: "short", year: "numeric" }) : "Recently joined";

  return (
    <section className="rounded-[2rem] border border-stone-200 bg-white/80 p-6 shadow-sm backdrop-blur dark:border-stone-800 dark:bg-stone-900/80">
      <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-4">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 text-xl font-semibold text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300">
            {user.name?.charAt(0)?.toUpperCase() || "U"}
          </div>
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-2xl font-semibold text-stone-900 dark:text-stone-50">{user.name}</h1>
              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-medium text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300">
                <BadgeCheck className="h-3.5 w-3.5" />
                Customer
              </span>
            </div>
            <div className="flex flex-wrap items-center gap-4 text-sm text-stone-600 dark:text-stone-300">
              <span className="inline-flex items-center gap-2"><Mail className="h-4 w-4" />{user.email}</span>
              <span className="inline-flex items-center gap-2"><Phone className="h-4 w-4" />{user.mobile || "Add your phone number"}</span>
              <span className="inline-flex items-center gap-2"><CalendarDays className="h-4 w-4" />Member since {joinedAt}</span>
            </div>
          </div>
        </div>
        <Button type="button" variant="outline" onClick={onEdit}>Edit profile</Button>
      </div>
    </section>
  );
}
