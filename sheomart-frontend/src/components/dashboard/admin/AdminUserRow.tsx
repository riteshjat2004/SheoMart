"use client";

import { useEffect, useRef, useState } from "react";
import {
  AlertTriangle,
  CheckCircle2,
  Clock,
  Edit,
  Eye,
  Mail,
  MapPin,
  MoreVertical,
  Phone,
  RotateCcw,
  Shield,
  Trash2,
  UserCheck,
  UserX,
} from "lucide-react";
import type { AdminUser } from "@/types/admin-user";

interface AdminUserRowProps {
  user: AdminUser;
  isSelected: boolean;
  onSelect: (userId: string) => void;
  onView: (user: AdminUser) => void;
  onEdit: (user: AdminUser) => void;
  onChangeRole: (user: AdminUser) => void;
  onToggleVerify: (user: AdminUser) => void;
  onToggleSuspend: (user: AdminUser) => void;
  onDelete: (user: AdminUser) => void;
  onRestore: (user: AdminUser) => void;
  currentUserId?: string;
  isTrashTab?: boolean;
}

const roleStyles: Record<string, string> = {
  customer: "bg-stone-100 text-stone-700 dark:bg-stone-800 dark:text-stone-300 border-stone-200 dark:border-stone-700",
  store_owner: "bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300 border-amber-200 dark:border-amber-800",
  platform_admin: "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800",
};

export function AdminUserRow({
  user,
  isSelected,
  onSelect,
  onView,
  onEdit,
  onChangeRole,
  onToggleVerify,
  onToggleSuspend,
  onDelete,
  onRestore,
  currentUserId,
  isTrashTab = false,
}: AdminUserRowProps) {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const isSelf = Boolean(currentUserId && user.userId === currentUserId);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    }
    if (dropdownOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [dropdownOpen]);

  const formatDate = (val?: string | null) => {
    if (!val) return "N/A";
    const d = new Date(val);
    return Number.isNaN(d.getTime())
      ? "N/A"
      : d.toLocaleDateString("en-IN", {
          day: "numeric",
          month: "short",
          year: "numeric",
        });
  };

  const location = [user.city, user.state].filter(Boolean).join(", ");

  return (
    <article
      className={`group relative rounded-xl border p-4 transition shadow-sm ${
        isSelected
          ? "border-emerald-500 bg-emerald-50/20 dark:border-emerald-500/80 dark:bg-emerald-950/20"
          : "border-stone-200 bg-white/80 hover:border-stone-300 dark:border-stone-800 dark:bg-stone-900/80 dark:hover:border-stone-700"
      }`}
    >
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        {/* Left Side: Checkbox + Avatar + User Info */}
        <div className="flex min-w-0 items-start gap-3.5">
          <input
            type="checkbox"
            checked={isSelected}
            onChange={() => onSelect(user.userId)}
            aria-label={`Select ${user.name}`}
            className="mt-1.5 h-4 w-4 rounded border-stone-300 text-emerald-600 focus:ring-emerald-500 cursor-pointer"
          />

          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-sm font-bold text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
            {user.avatar ? (
              <img src={user.avatar} alt={user.name} className="h-full w-full rounded-full object-cover" />
            ) : user.name ? (
              user.name.slice(0, 2).toUpperCase()
            ) : (
              "U"
            )}
          </div>

          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h3
                onClick={() => onView(user)}
                className="cursor-pointer font-semibold text-stone-900 hover:text-emerald-600 dark:text-stone-100 dark:hover:text-emerald-400 transition"
              >
                {user.name}
              </h3>

              {isSelf && (
                <span className="rounded bg-stone-200 px-1.5 py-0.5 text-[10px] font-medium text-stone-700 dark:bg-stone-800 dark:text-stone-300">
                  You
                </span>
              )}

              <span
                className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-[11px] font-semibold capitalize ${
                  roleStyles[user.role] || roleStyles.customer
                }`}
              >
                <Shield className="h-3 w-3" />
                {user.role.replace("_", " ")}
              </span>

              {user.isVerifiedCustomer && (
                <span
                  title="Verified Customer"
                  className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2 py-0.5 text-[11px] font-semibold text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300"
                >
                  <CheckCircle2 className="h-3 w-3" />
                  Verified
                </span>
              )}

              <span
                className={`inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-semibold ${
                  user.status === "active"
                    ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300"
                    : user.status === "suspended"
                    ? "bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300"
                    : user.status === "deleted"
                    ? "bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300"
                    : "bg-stone-100 text-stone-600 dark:bg-stone-800 dark:text-stone-300"
                }`}
              >
                {user.status.toUpperCase()}
              </span>
            </div>

            <div className="mt-1.5 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-stone-500 dark:text-stone-400">
              <span className="inline-flex items-center gap-1">
                <Mail className="h-3 w-3 text-stone-400" />
                {user.email}
              </span>
              <span className="inline-flex items-center gap-1">
                <Phone className="h-3 w-3 text-stone-400" />
                {user.mobile}
              </span>
              {location && (
                <span className="inline-flex items-center gap-1">
                  <MapPin className="h-3 w-3 text-stone-400" />
                  {location}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Right Side: Meta + Action Dropdown Menu */}
        <div className="flex shrink-0 items-center justify-between gap-4 lg:justify-end">
          <div className="text-left lg:text-right text-xs text-stone-400">
            <div>Joined {formatDate(user.createdAt)}</div>
            <div className="flex items-center gap-1 text-[11px] lg:justify-end text-stone-400">
              <Clock className="h-3 w-3" />
              Active: {formatDate(user.lastLoginAt || user.updatedAt)}
            </div>
          </div>

          {/* Actions Dropdown */}
          <div className="relative" ref={dropdownRef}>
            <button
              type="button"
              onClick={() => setDropdownOpen((v) => !v)}
              className="flex h-8 w-8 items-center justify-center rounded-lg border border-stone-200 bg-white text-stone-500 transition hover:bg-stone-100 hover:text-stone-700 dark:border-stone-800 dark:bg-stone-900 dark:text-stone-400 dark:hover:bg-stone-800 dark:hover:text-stone-200"
              aria-label="User actions"
            >
              <MoreVertical className="h-4 w-4" />
            </button>

            {dropdownOpen && (
              <div className="absolute right-0 top-9 z-30 w-52 rounded-xl border border-stone-200 bg-white p-1.5 shadow-xl dark:border-stone-800 dark:bg-stone-900 animate-in fade-in-50 zoom-in-95 duration-150">
                <button
                  type="button"
                  onClick={() => {
                    setDropdownOpen(false);
                    onView(user);
                  }}
                  className="flex w-full items-center gap-2 rounded-lg px-2.5 py-1.5 text-xs font-medium text-stone-700 hover:bg-stone-100 dark:text-stone-300 dark:hover:bg-stone-800"
                >
                  <Eye className="h-3.5 w-3.5 text-stone-500" />
                  View Details
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setDropdownOpen(false);
                    onEdit(user);
                  }}
                  className="flex w-full items-center gap-2 rounded-lg px-2.5 py-1.5 text-xs font-medium text-stone-700 hover:bg-stone-100 dark:text-stone-300 dark:hover:bg-stone-800"
                >
                  <Edit className="h-3.5 w-3.5 text-stone-500" />
                  Edit Profile
                </button>

                <button
                  type="button"
                  disabled={isSelf}
                  onClick={() => {
                    setDropdownOpen(false);
                    onChangeRole(user);
                  }}
                  className={`flex w-full items-center gap-2 rounded-lg px-2.5 py-1.5 text-xs font-medium ${
                    isSelf
                      ? "text-stone-400 cursor-not-allowed opacity-60"
                      : "text-stone-700 hover:bg-stone-100 dark:text-stone-300 dark:hover:bg-stone-800"
                  }`}
                  title={isSelf ? "Cannot change own role" : "Change user role"}
                >
                  <Shield className="h-3.5 w-3.5 text-stone-500" />
                  Change Role
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setDropdownOpen(false);
                    onToggleVerify(user);
                  }}
                  className="flex w-full items-center gap-2 rounded-lg px-2.5 py-1.5 text-xs font-medium text-stone-700 hover:bg-stone-100 dark:text-stone-300 dark:hover:bg-stone-800"
                >
                  {user.isVerifiedCustomer ? (
                    <>
                      <UserX className="h-3.5 w-3.5 text-amber-600" />
                      Remove Verification
                    </>
                  ) : (
                    <>
                      <UserCheck className="h-3.5 w-3.5 text-emerald-600" />
                      Mark Verified Customer
                    </>
                  )}
                </button>

                <div className="my-1 border-t border-stone-200 dark:border-stone-800" />

                {!isTrashTab ? (
                  <>
                    <button
                      type="button"
                      disabled={isSelf}
                      onClick={() => {
                        setDropdownOpen(false);
                        onToggleSuspend(user);
                      }}
                      className={`flex w-full items-center gap-2 rounded-lg px-2.5 py-1.5 text-xs font-medium ${
                        isSelf
                          ? "text-stone-400 cursor-not-allowed opacity-60"
                          : user.isSuspended
                          ? "text-emerald-700 hover:bg-emerald-50 dark:text-emerald-400 dark:hover:bg-emerald-950/40"
                          : "text-amber-700 hover:bg-amber-50 dark:text-amber-400 dark:hover:bg-amber-950/40"
                      }`}
                      title={isSelf ? "Cannot suspend self" : ""}
                    >
                      <AlertTriangle className="h-3.5 w-3.5" />
                      {user.isSuspended ? "Reactivate User" : "Suspend User"}
                    </button>

                    <button
                      type="button"
                      disabled={isSelf}
                      onClick={() => {
                        setDropdownOpen(false);
                        onDelete(user);
                      }}
                      className={`flex w-full items-center gap-2 rounded-lg px-2.5 py-1.5 text-xs font-medium ${
                        isSelf
                          ? "text-stone-400 cursor-not-allowed opacity-60"
                          : "text-rose-700 hover:bg-rose-50 dark:text-rose-400 dark:hover:bg-rose-950/40"
                      }`}
                      title={isSelf ? "Cannot delete self" : "Move to trash"}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                      Move to Trash
                    </button>
                  </>
                ) : (
                  <button
                    type="button"
                    onClick={() => {
                      setDropdownOpen(false);
                      onRestore(user);
                    }}
                    className="flex w-full items-center gap-2 rounded-lg px-2.5 py-1.5 text-xs font-medium text-emerald-700 hover:bg-emerald-50 dark:text-emerald-400 dark:hover:bg-emerald-950/40"
                  >
                    <RotateCcw className="h-3.5 w-3.5" />
                    Restore Account
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </article>
  );
}
