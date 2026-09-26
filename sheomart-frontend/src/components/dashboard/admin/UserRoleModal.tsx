"use client";

import { useState } from "react";
import { AlertTriangle, Shield, ShieldAlert, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useUpdateUserRole } from "@/hooks/use-admin-users";
import type { AdminUser } from "@/types/admin-user";
import type { UserRole } from "@/types/auth";

interface UserRoleModalProps {
  open: boolean;
  user: AdminUser | null;
  currentAdminUserId?: string;
  onClose: () => void;
  onSuccess?: () => void;
}

const roles: Array<{
  value: UserRole;
  label: string;
  badgeColor: string;
  desc: string;
  responsibilities: string[];
}> = [
  {
    value: "customer",
    label: "Customer",
    badgeColor: "bg-stone-100 text-stone-800 dark:bg-stone-800 dark:text-stone-300",
    desc: "Standard buyer account on SheoMart platform.",
    responsibilities: ["Browse catalog & stores", "Add items to cart & wishlist", "Place orders & write reviews"],
  },
  {
    value: "store_owner",
    label: "Store Owner (Seller)",
    badgeColor: "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300",
    desc: "Merchant account with seller dashboard privileges.",
    responsibilities: ["Manage owned stores & branch listings", "Add products, prices & inventory", "Manage pickup and delivery orders"],
  },
  {
    value: "platform_admin",
    label: "Platform Administrator",
    badgeColor: "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300",
    desc: "Full root access to all SheoMart systems & configuration.",
    responsibilities: ["Approve/suspend merchant stores", "Manage platform users & assign roles", "Create coupons, fee rules & banners"],
  },
];

export function UserRoleModal({ open, user, currentAdminUserId, onClose, onSuccess }: UserRoleModalProps) {
  const [selectedRole, setSelectedRole] = useState<UserRole>(user?.role || "customer");
  const [errorMsg, setErrorMsg] = useState("");
  const roleMutation = useUpdateUserRole();

  if (!open || !user) return null;

  const isSelf = user.userId === currentAdminUserId;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSelf) {
      setErrorMsg("You cannot change your own administrator role.");
      return;
    }
    if (selectedRole === user.role) {
      onClose();
      return;
    }
    setErrorMsg("");

    try {
      await roleMutation.mutateAsync({ userId: user.userId, role: selectedRole });
      onSuccess?.();
      onClose();
    } catch (err: unknown) {
      if (err instanceof Error) {
        setErrorMsg(err.message);
      } else {
        setErrorMsg("Failed to update user role.");
      }
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-stone-950/70 p-4 backdrop-blur-sm animate-in fade-in duration-200"
      role="dialog"
      aria-modal="true"
    >
      <div className="relative w-full max-w-lg rounded-2xl border border-stone-200 bg-white p-6 shadow-2xl dark:border-stone-800 dark:bg-stone-950">
        <button
          type="button"
          onClick={onClose}
          className="absolute right-4 top-4 text-stone-400 transition hover:text-stone-600 dark:hover:text-stone-200"
        >
          <X className="h-4 w-4" />
        </button>

        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
            <Shield className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-stone-900 dark:text-stone-100">
              Change Account Role
            </h3>
            <p className="text-xs text-stone-500 dark:text-stone-400">
              {user.name} ({user.email})
            </p>
          </div>
        </div>

        {isSelf && (
          <div className="mt-4 flex items-center gap-2 rounded-xl border border-amber-200 bg-amber-50 p-3 text-xs text-amber-800 dark:border-amber-900/60 dark:bg-amber-950/40 dark:text-amber-300">
            <ShieldAlert className="h-4 w-4 shrink-0" />
            <span>You are viewing your own administrative account. You cannot change your own role.</span>
          </div>
        )}

        {errorMsg && (
          <div className="mt-4 flex items-center gap-2 rounded-xl border border-rose-200 bg-rose-50 p-3 text-xs text-rose-700 dark:border-rose-900/60 dark:bg-rose-950/40 dark:text-rose-300">
            <AlertTriangle className="h-4 w-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          <div className="space-y-2.5">
            {roles.map((r) => {
              const isSelected = selectedRole === r.value;
              return (
                <label
                  key={r.value}
                  className={`flex cursor-pointer items-start gap-3 rounded-xl border p-3.5 transition ${
                    isSelected
                      ? "border-emerald-600 bg-emerald-50/40 dark:border-emerald-500 dark:bg-emerald-950/30"
                      : "border-stone-200 bg-white hover:border-stone-300 dark:border-stone-800 dark:bg-stone-900"
                  }`}
                >
                  <input
                    type="radio"
                    name="role"
                    value={r.value}
                    checked={isSelected}
                    onChange={() => setSelectedRole(r.value)}
                    disabled={isSelf}
                    className="mt-1 h-4 w-4 text-emerald-600 focus:ring-emerald-500"
                  />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs sm:text-sm font-semibold text-stone-900 dark:text-stone-100">
                        {r.label}
                      </span>
                      {user.role === r.value && (
                        <span className="rounded bg-stone-100 px-1.5 py-0.5 text-[10px] font-medium text-stone-600 dark:bg-stone-800 dark:text-stone-400">
                          Current
                        </span>
                      )}
                    </div>
                    <p className="mt-0.5 text-xs text-stone-500 dark:text-stone-400">{r.desc}</p>
                  </div>
                </label>
              );
            })}
          </div>

          <div className="mt-6 flex items-center justify-end gap-3 pt-3 border-t border-stone-200 dark:border-stone-800">
            <Button type="button" variant="outline" size="sm" onClick={onClose} disabled={roleMutation.isPending}>
              Cancel
            </Button>
            <Button
              type="submit"
              size="sm"
              disabled={isSelf || roleMutation.isPending || selectedRole === user.role}
              className="bg-emerald-600 text-white hover:bg-emerald-700 dark:bg-emerald-600 dark:hover:bg-emerald-700"
            >
              {roleMutation.isPending ? "Updating Role..." : "Confirm Role Change"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
