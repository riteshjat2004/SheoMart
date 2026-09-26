"use client";

import { useEffect, useState } from "react";
import { AlertCircle, Lock, Mail, Phone, Shield, User, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCreateAdminUser, useUpdateAdminUser } from "@/hooks/use-admin-users";
import type { AdminUser, CreateAdminUserInput, UpdateAdminUserInput } from "@/types/admin-user";
import type { UserRole } from "@/types/auth";

interface UserFormModalProps {
  open: boolean;
  user?: AdminUser | null;
  onClose: () => void;
  onSuccess?: () => void;
}

const roleOptions: Array<{ value: UserRole; label: string; desc: string }> = [
  { value: "customer", label: "Customer", desc: "Can browse, search, and place orders" },
  { value: "store_owner", label: "Store Owner", desc: "Can manage approved merchant stores and products" },
  { value: "platform_admin", label: "Platform Admin", desc: "Full administrative control over SheoMart" },
];

export function UserFormModal({ open, user, onClose, onSuccess }: UserFormModalProps) {
  const isEdit = Boolean(user);
  const createMutation = useCreateAdminUser();
  const updateMutation = useUpdateAdminUser();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [mobile, setMobile] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<UserRole>("customer");
  const [isVerifiedCustomer, setIsVerifiedCustomer] = useState(false);
  const [isActive, setIsActive] = useState(true);
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [district, setDistrict] = useState("");
  const [state, setState] = useState("");
  const [pincode, setPincode] = useState("");
  const [gender, setGender] = useState("");
  const [dob, setDob] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    if (user) {
      setName(user.name || "");
      setEmail(user.email || "");
      setMobile(user.mobile || "");
      setPassword("");
      setRole(user.role || "customer");
      setIsVerifiedCustomer(Boolean(user.isVerifiedCustomer));
      setIsActive(Boolean(user.isActive));
      setAddress(user.address || "");
      setCity(user.city || "");
      setDistrict(user.district || "");
      setState(user.state || "");
      setPincode(user.pincode || "");
      setGender(user.gender || "");
      setDob(user.dob ? new Date(user.dob).toISOString().split("T")[0] : "");
      setErrorMsg("");
    } else {
      setName("");
      setEmail("");
      setMobile("");
      setPassword("");
      setRole("customer");
      setIsVerifiedCustomer(false);
      setIsActive(true);
      setAddress("");
      setCity("");
      setDistrict("");
      setState("");
      setPincode("");
      setGender("");
      setDob("");
      setErrorMsg("");
    }
  }, [user, open]);

  if (!open) return null;

  const validate = () => {
    if (!name.trim() || name.trim().length < 2) {
      return "Name must be at least 2 characters long.";
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      return "Please enter a valid email address.";
    }
    if (!/^[6-9]\d{9}$/.test(mobile.trim())) {
      return "Please enter a valid 10-digit Indian mobile number (e.g. 9876543210).";
    }
    if (!isEdit) {
      if (!password || password.length < 8) {
        return "Password must be at least 8 characters long.";
      }
      if (!/[A-Z]/.test(password) || !/[a-z]/.test(password) || !/[0-9]/.test(password)) {
        return "Password must include uppercase, lowercase, and a number.";
      }
    }
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const err = validate();
    if (err) {
      setErrorMsg(err);
      return;
    }
    setErrorMsg("");

    try {
      if (isEdit && user) {
        const updatePayload: UpdateAdminUserInput = {
          name: name.trim(),
          email: email.trim().toLowerCase(),
          mobile: mobile.trim(),
          role,
          isVerifiedCustomer,
          isActive,
          address: address.trim(),
          city: city.trim(),
          district: district.trim(),
          state: state.trim(),
          pincode: pincode.trim(),
          gender: gender || undefined,
          dob: dob || undefined,
        };
        await updateMutation.mutateAsync({ userId: user.userId, data: updatePayload });
      } else {
        const createPayload: CreateAdminUserInput = {
          name: name.trim(),
          email: email.trim().toLowerCase(),
          mobile: mobile.trim(),
          password,
          role,
          isVerifiedCustomer,
          isActive,
          address: address.trim(),
          city: city.trim(),
          district: district.trim(),
          state: state.trim(),
          pincode: pincode.trim(),
          gender: gender || undefined,
          dob: dob || undefined,
        };
        await createMutation.mutateAsync(createPayload);
      }
      onSuccess?.();
      onClose();
    } catch (apiErr: unknown) {
      if (apiErr instanceof Error) {
        setErrorMsg(apiErr.message);
      } else {
        setErrorMsg("Failed to save user account.");
      }
    }
  };

  const isSaving = createMutation.isPending || updateMutation.isPending;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-stone-950/70 p-4 backdrop-blur-sm animate-in fade-in duration-200"
      role="dialog"
      aria-modal="true"
    >
      <div className="relative flex max-h-[92vh] w-full max-w-2xl flex-col rounded-2xl border border-stone-200 bg-white shadow-2xl dark:border-stone-800 dark:bg-stone-950">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-stone-200 px-6 py-4 dark:border-stone-800">
          <div>
            <h2 className="text-lg font-bold text-stone-900 dark:text-stone-100">
              {isEdit ? "Edit User Account" : "Create New User"}
            </h2>
            <p className="text-xs text-stone-500 dark:text-stone-400">
              {isEdit ? `Modifying details for ${user?.email}` : "Add an account directly to the platform"}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 text-stone-400 transition hover:bg-stone-100 hover:text-stone-600 dark:hover:bg-stone-800 dark:hover:text-stone-200"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-5">
          {errorMsg && (
            <div className="flex items-start gap-2 rounded-xl border border-rose-200 bg-rose-50 p-3 text-xs text-rose-700 dark:border-rose-900/60 dark:bg-rose-950/40 dark:text-rose-300">
              <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Primary credentials */}
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
                Full Name *
              </label>
              <div className="relative flex items-center">
                <User className="absolute left-3 h-4 w-4 text-stone-400" />
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Ramesh Kumar"
                  className="w-full rounded-lg border border-stone-300 bg-white py-2 pl-9 pr-3 text-sm text-stone-900 outline-none focus:border-emerald-500 dark:border-stone-700 dark:bg-stone-900 dark:text-stone-100"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
                Email Address *
              </label>
              <div className="relative flex items-center">
                <Mail className="absolute left-3 h-4 w-4 text-stone-400" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="ramesh@example.com"
                  className="w-full rounded-lg border border-stone-300 bg-white py-2 pl-9 pr-3 text-sm text-stone-900 outline-none focus:border-emerald-500 dark:border-stone-700 dark:bg-stone-900 dark:text-stone-100"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
                Mobile Number *
              </label>
              <div className="relative flex items-center">
                <Phone className="absolute left-3 h-4 w-4 text-stone-400" />
                <input
                  type="tel"
                  required
                  maxLength={10}
                  value={mobile}
                  onChange={(e) => setMobile(e.target.value.replace(/\D/g, ""))}
                  placeholder="9876543210"
                  className="w-full rounded-lg border border-stone-300 bg-white py-2 pl-9 pr-3 text-sm text-stone-900 outline-none focus:border-emerald-500 dark:border-stone-700 dark:bg-stone-900 dark:text-stone-100"
                />
              </div>
            </div>

            {!isEdit ? (
              <div>
                <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
                  Password *
                </label>
                <div className="relative flex items-center">
                  <Lock className="absolute left-3 h-4 w-4 text-stone-400" />
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Min 8 chars, uppercase & num"
                    className="w-full rounded-lg border border-stone-300 bg-white py-2 pl-9 pr-3 text-sm text-stone-900 outline-none focus:border-emerald-500 dark:border-stone-700 dark:bg-stone-900 dark:text-stone-100"
                  />
                </div>
              </div>
            ) : (
              <div>
                <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
                  Date of Birth
                </label>
                <input
                  type="date"
                  value={dob}
                  onChange={(e) => setDob(e.target.value)}
                  className="w-full rounded-lg border border-stone-300 bg-white px-3 py-2 text-sm text-stone-900 outline-none focus:border-emerald-500 dark:border-stone-700 dark:bg-stone-900 dark:text-stone-100"
                />
              </div>
            )}
          </div>

          {/* Role selection cards */}
          <div>
            <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-2">
              Account Role
            </label>
            <div className="grid gap-2 sm:grid-cols-3">
              {roleOptions.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setRole(opt.value)}
                  className={`flex flex-col text-left rounded-xl border p-3 transition ${
                    role === opt.value
                      ? "border-emerald-600 bg-emerald-50/50 dark:border-emerald-500 dark:bg-emerald-950/30"
                      : "border-stone-200 bg-white hover:border-stone-300 dark:border-stone-800 dark:bg-stone-900"
                  }`}
                >
                  <div className="flex items-center gap-1.5 font-semibold text-xs sm:text-sm text-stone-900 dark:text-stone-100">
                    <Shield className="h-3.5 w-3.5 text-emerald-600" />
                    {opt.label}
                  </div>
                  <p className="mt-1 text-[11px] text-stone-500 leading-snug">{opt.desc}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Toggles: isVerifiedCustomer & isActive */}
          <div className="grid gap-3 sm:grid-cols-2 rounded-xl border border-stone-200 bg-stone-50/50 p-4 dark:border-stone-800 dark:bg-stone-900/40">
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={isVerifiedCustomer}
                onChange={(e) => setIsVerifiedCustomer(e.target.checked)}
                className="h-4 w-4 rounded border-stone-300 text-emerald-600 focus:ring-emerald-500"
              />
              <div>
                <span className="block text-xs font-semibold text-stone-900 dark:text-stone-100">
                  Verified Customer Status
                </span>
                <span className="block text-[11px] text-stone-500">
                  Grants customer trust badge across stores & reviews
                </span>
              </div>
            </label>

            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={isActive}
                onChange={(e) => setIsActive(e.target.checked)}
                className="h-4 w-4 rounded border-stone-300 text-emerald-600 focus:ring-emerald-500"
              />
              <div>
                <span className="block text-xs font-semibold text-stone-900 dark:text-stone-100">
                  Account Active
                </span>
                <span className="block text-[11px] text-stone-500">
                  Active users can log in and place orders
                </span>
              </div>
            </label>
          </div>

          {/* Additional details: Address & Location */}
          <div className="space-y-3 pt-2 border-t border-stone-200 dark:border-stone-800">
            <h3 className="text-xs font-bold uppercase tracking-wider text-stone-500">Address Details (Optional)</h3>

            <div>
              <label className="block text-xs font-medium text-stone-700 dark:text-stone-300 mb-1">
                Street / Area Address
              </label>
              <input
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="House No, Street, Landmark"
                className="w-full rounded-lg border border-stone-300 bg-white px-3 py-2 text-sm text-stone-900 outline-none focus:border-emerald-500 dark:border-stone-700 dark:bg-stone-900 dark:text-stone-100"
              />
            </div>

            <div className="grid gap-3 sm:grid-cols-4">
              <div>
                <label className="block text-xs font-medium text-stone-700 dark:text-stone-300 mb-1">City</label>
                <input
                  type="text"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  placeholder="City"
                  className="w-full rounded-lg border border-stone-300 bg-white px-3 py-2 text-sm text-stone-900 outline-none focus:border-emerald-500 dark:border-stone-700 dark:bg-stone-900 dark:text-stone-100"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-stone-700 dark:text-stone-300 mb-1">District</label>
                <input
                  type="text"
                  value={district}
                  onChange={(e) => setDistrict(e.target.value)}
                  placeholder="District"
                  className="w-full rounded-lg border border-stone-300 bg-white px-3 py-2 text-sm text-stone-900 outline-none focus:border-emerald-500 dark:border-stone-700 dark:bg-stone-900 dark:text-stone-100"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-stone-700 dark:text-stone-300 mb-1">State</label>
                <input
                  type="text"
                  value={state}
                  onChange={(e) => setState(e.target.value)}
                  placeholder="State"
                  className="w-full rounded-lg border border-stone-300 bg-white px-3 py-2 text-sm text-stone-900 outline-none focus:border-emerald-500 dark:border-stone-700 dark:bg-stone-900 dark:text-stone-100"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-stone-700 dark:text-stone-300 mb-1">Pincode</label>
                <input
                  type="text"
                  maxLength={6}
                  value={pincode}
                  onChange={(e) => setPincode(e.target.value)}
                  placeholder="Pincode"
                  className="w-full rounded-lg border border-stone-300 bg-white px-3 py-2 text-sm text-stone-900 outline-none focus:border-emerald-500 dark:border-stone-700 dark:bg-stone-900 dark:text-stone-100"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-stone-700 dark:text-stone-300 mb-1">Gender</label>
              <select
                value={gender}
                onChange={(e) => setGender(e.target.value)}
                className="w-full rounded-lg border border-stone-300 bg-white px-3 py-2 text-sm text-stone-900 outline-none focus:border-emerald-500 dark:border-stone-700 dark:bg-stone-900 dark:text-stone-100"
              >
                <option value="">Select gender</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
              </select>
            </div>
          </div>

          {/* Footer Submit */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-stone-200 dark:border-stone-800">
            <Button type="button" variant="outline" size="sm" onClick={onClose} disabled={isSaving}>
              Cancel
            </Button>
            <Button
              type="submit"
              size="sm"
              disabled={isSaving}
              className="bg-emerald-600 text-white hover:bg-emerald-700 dark:bg-emerald-600 dark:hover:bg-emerald-700"
            >
              {isSaving ? "Saving..." : isEdit ? "Update User" : "Create User"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
