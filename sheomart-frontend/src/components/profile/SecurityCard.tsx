import { LogOut, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ChangePasswordCard } from "@/components/profile/ChangePasswordCard";

interface SecurityCardProps {
  onLogout: () => void;
}

export function SecurityCard({ onLogout }: SecurityCardProps) {
  return (
    <div className="space-y-3">
      <div className="rounded-[1.5rem] border border-stone-200 bg-stone-50/70 p-4 dark:border-stone-800 dark:bg-stone-950/50">
        <h3 className="mb-4 text-sm font-medium text-stone-700 dark:text-stone-200">Change Password</h3>
        <ChangePasswordCard />
      </div>
      <div className="rounded-[1.5rem] border border-stone-200 bg-stone-50/70 p-4 dark:border-stone-800 dark:bg-stone-950/50">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-sm font-medium text-stone-700 dark:text-stone-200">
            <LogOut className="h-4 w-4" />
            Logout
          </div>
          <Button type="button" variant="outline" onClick={onLogout}>Logout</Button>
        </div>
      </div>
      <div className="rounded-[1.5rem] border border-stone-200 bg-stone-50/70 p-4 dark:border-stone-800 dark:bg-stone-950/50">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-sm font-medium text-stone-700 dark:text-stone-200">
            <Trash2 className="h-4 w-4" />
            Delete Account
          </div>
          <span className="text-sm text-stone-500 dark:text-stone-400">Coming soon</span>
        </div>
      </div>
    </div>
  );
}
