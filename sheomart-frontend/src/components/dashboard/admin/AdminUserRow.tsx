import { CheckCircle2, Circle, Mail, MapPin, Phone } from "lucide-react";
import type { AdminUser } from "@/types/admin-user";

interface AdminUserRowProps {
  user: AdminUser;
}

const roleStyles: Record<AdminUser["role"], string> = {
  customer: "bg-stone-100 text-stone-700 dark:bg-stone-800 dark:text-stone-200",
  store_owner: "bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-300",
  platform_admin: "bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300",
};

function formatRole(role: AdminUser["role"]) {
  return role.replace("_", " ");
}

function formatDate(value: string) {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "Date unavailable" : date.toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" });
}

function VerificationItem({ verified, label, icon: Icon }: { verified: boolean; label: string; icon: typeof Mail }) {
  return (
    <span className="inline-flex items-center gap-1.5 text-xs text-stone-500 dark:text-stone-400">
      <Icon className="h-3.5 w-3.5" />
      <span>{label}</span>
      {verified ? <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" /> : <Circle className="h-3.5 w-3.5 text-stone-400" />}
    </span>
  );
}

export function AdminUserRow({ user }: AdminUserRowProps) {
  const location = [user.city, user.state].filter(Boolean).join(", ");

  return (
    <article className="rounded-xl border border-stone-200 bg-white/80 p-4 shadow-sm dark:border-stone-800 dark:bg-stone-900/80">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="truncate text-base font-semibold text-stone-900 dark:text-stone-50">{user.name}</h3>
            <span className={`rounded-full px-2.5 py-1 text-xs font-medium capitalize ${roleStyles[user.role]}`}>{formatRole(user.role)}</span>
            <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${user.isActive ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300" : "bg-rose-50 text-rose-700 dark:bg-rose-500/10 dark:text-rose-300"}`}>
              {user.isActive ? "Active" : "Inactive"}
            </span>
          </div>
          <div className="mt-2 flex flex-col gap-1.5 text-sm text-stone-600 dark:text-stone-300 sm:flex-row sm:flex-wrap sm:gap-x-4">
            <span className="inline-flex items-center gap-1.5"><Mail className="h-3.5 w-3.5 text-stone-400" />{user.email}</span>
            <span className="inline-flex items-center gap-1.5"><Phone className="h-3.5 w-3.5 text-stone-400" />{user.mobile}</span>
            {location ? <span className="inline-flex items-center gap-1.5"><MapPin className="h-3.5 w-3.5 text-stone-400" />{location}</span> : null}
          </div>
        </div>

        <div className="flex shrink-0 flex-col gap-2 text-left lg:items-end lg:text-right">
          <span className="text-xs text-stone-500 dark:text-stone-400">Joined {formatDate(user.createdAt)}</span>
          {user.isCreditApproved ? <span className="text-xs font-medium text-emerald-600 dark:text-emerald-400">Credit approved</span> : null}
        </div>
      </div>

      <div className="mt-3 flex flex-wrap gap-x-4 gap-y-2 border-t border-stone-200/80 pt-3 dark:border-stone-800">
        <VerificationItem verified={user.emailVerified} label="Email" icon={Mail} />
        <VerificationItem verified={user.phoneVerified} label="Phone" icon={Phone} />
      </div>
    </article>
  );
}
