"use client";

import { useEffect, useState } from "react";
import {
  Activity,
  AlertOctagon,
  AlertTriangle,
  ArrowRight,
  Bell,
  CheckCircle2,
  Clock,
  CreditCard,
  Database,
  Download,
  Eye,
  FileText,
  Flame,
  Globe,
  HardDrive,
  HelpCircle,
  Image as ImageIcon,
  KeyRound,
  Layers,
  Lock,
  Mail,
  MapPin,
  Megaphone,
  Palette,
  Phone,
  RefreshCw,
  RotateCcw,
  Save,
  Search,
  Server,
  Shield,
  ShieldAlert,
  ShieldCheck,
  ShoppingBag,
  Sliders,
  Sparkles,
  Store,
  Tag,
  Truck,
  UploadCloud,
  User,
  Users,
  Wifi,
  Wrench,
  X,
  XCircle,
} from "lucide-react";
import { Breadcrumb } from "@/components/dashboard/layout/Breadcrumb";
import { DashboardCard } from "@/components/dashboard/DashboardCard";
import { DashboardContent } from "@/components/dashboard/layout/DashboardContent";
import { EmptyState } from "@/components/dashboard/EmptyState";
import { LoadingSkeleton } from "@/components/dashboard/LoadingSkeleton";
import { PageHeader } from "@/components/dashboard/layout/PageHeader";
import { StatCard } from "@/components/dashboard/StatCard";
import { Button } from "@/components/ui/button";
import { ErrorState } from "@/components/common/error-state";
import { ConfirmDialog } from "@/components/dashboard/ConfirmDialog";
import {
  useAdminSettings,
  useUpdateAdminSettings,
  useAdminAuditLogs,
  useSystemHealth,
  useSecurityStatus,
} from "@/hooks/use-admin-settings";
import {
  uploadBrandingAsset,
  createPlatformBackup,
  downloadPlatformBackup,
  exportPlatformDataset,
} from "@/services/admin-settings";
import NextImage from "next/image";
import { useAuthStore } from "@/store/auth-store";
import { useProfile } from "@/hooks/useProfile";
import { changePassword } from "@/services/profile";
import type {
  AuditLogFilters,
  DeliveryZone,
  MarketplaceSettings,
} from "@/types/admin-settings";

type SettingsTab =
  | "general"
  | "branding"
  | "delivery"
  | "payments"
  | "notifications"
  | "security"
  | "maintenance"
  | "audit"
  | "backup"
  | "about";

function formatCurrency(val: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(val);
}

function calculatePasswordStrength(pass: string) {
  let score = 0;
  if (pass.length >= 8) score++;
  if (pass.length >= 12) score++;
  if (/[a-z]/.test(pass) && /[A-Z]/.test(pass)) score++;
  if (/\d/.test(pass)) score++;
  if (/[^A-Za-z0-9]/.test(pass)) score++;
  return score; // 0 to 5
}

export default function AdminSettingsPage() {
  const { user } = useAuthStore();
  const { data: profile } = useProfile();
  const [activeTab, setActiveTab] = useState<SettingsTab>("general");
  const settingsQuery = useAdminSettings();
  const updateSettingsMutation = useUpdateAdminSettings();
  const systemHealthQuery = useSystemHealth();
  const securityStatusQuery = useSecurityStatus();

  const avatarUrl = profile?.avatar || "/logo/admin-avatar.jpg";
  const displayName = profile?.name ?? user?.name ?? "Platform Administrator";
  const displayEmail = profile?.email ?? user?.email ?? "admin@sheomart.com";
  const userInitial = displayName.charAt(0).toUpperCase();

  // Local draft state of settings
  const [draft, setDraft] = useState<MarketplaceSettings | null>(null);
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; message: string } | null>(null);
  const [uploadingField, setUploadingField] = useState<string | null>(null);

  // Audit Log State
  const [auditFilters, setAuditFilters] = useState<AuditLogFilters>({
    page: 1,
    limit: 15,
  });
  const auditLogsQuery = useAdminAuditLogs(auditFilters);

  // Backup & Export state
  const [isBackingUp, setIsBackingUp] = useState(false);
  const [exportingType, setExportingType] = useState<string | null>(null);

  // Password Change state
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [passwordFeedback, setPasswordFeedback] = useState<{ type: "success" | "error"; message: string } | null>(null);

  useEffect(() => {
    if (settingsQuery.data && !draft) {
      setDraft(JSON.parse(JSON.stringify(settingsQuery.data)));
    }
  }, [settingsQuery.data, draft]);

  const handleSave = async (sectionKey?: keyof MarketplaceSettings) => {
    if (!draft) return;
    try {
      const payload = sectionKey ? { [sectionKey]: draft[sectionKey] } : draft;
      await updateSettingsMutation.mutateAsync(payload);
      setFeedback({ type: "success", message: "Settings saved successfully." });
      setTimeout(() => setFeedback(null), 4000);
    } catch (err: any) {
      setFeedback({ type: "error", message: err.message || "Failed to save settings." });
    }
  };

  const handleImageUpload = async (field: keyof MarketplaceSettings["branding"], file: File) => {
    if (!draft) return;
    try {
      setUploadingField(field);
      const res = await uploadBrandingAsset(file);
      setDraft({
        ...draft,
        branding: {
          ...draft.branding,
          [field]: res.url,
        },
      });
      setFeedback({ type: "success", message: `Uploaded ${field} successfully.` });
    } catch (err: any) {
      setFeedback({ type: "error", message: err.message || "Upload failed." });
    } finally {
      setUploadingField(null);
    }
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setPasswordFeedback({ type: "error", message: "New passwords do not match." });
      return;
    }
    if (passwordForm.newPassword.length < 8) {
      setPasswordFeedback({ type: "error", message: "Password must be at least 8 characters long." });
      return;
    }

    try {
      setIsChangingPassword(true);
      await changePassword({
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword,
        confirmPassword: passwordForm.confirmPassword,
      });
      setPasswordFeedback({ type: "success", message: "Password changed successfully." });
      setPasswordForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
      setTimeout(() => setPasswordFeedback(null), 4000);
    } catch (err: any) {
      setPasswordFeedback({ type: "error", message: err.message || "Failed to update password." });
    } finally {
      setIsChangingPassword(false);
    }
  };

  const handleCreateBackup = async () => {
    try {
      setIsBackingUp(true);
      const res = await createPlatformBackup();
      if (draft) {
        setDraft({
          ...draft,
          backup: {
            ...draft.backup,
            lastBackupAt: res.backupTime,
            lastBackupSize: res.backupSize,
          },
        });
      }
      setFeedback({ type: "success", message: `Backup created: ${res.backupSize}` });
    } catch (err: any) {
      setFeedback({ type: "error", message: err.message || "Backup creation failed." });
    } finally {
      setIsBackingUp(false);
    }
  };

  const handleExportData = async (type: "products" | "categories" | "users" | "stores" | "coupons") => {
    try {
      setExportingType(type);
      await exportPlatformDataset(type);
      setFeedback({ type: "success", message: `Exported ${type} dataset.` });
    } catch (err: any) {
      setFeedback({ type: "error", message: err.message || `Failed to export ${type}.` });
    } finally {
      setExportingType(null);
    }
  };

  const passwordScore = calculatePasswordStrength(passwordForm.newPassword);

  return (
    <DashboardContent className="space-y-6">
      <Breadcrumb items={[{ label: "Admin" }, { label: "Settings & Security" }]} />
      <PageHeader
        category="PLATFORM SETTINGS"
        title="System Settings"
        description="Configure marketplace operations, commissions and notifications."
        actions={
          <Button
            size="sm"
            disabled={updateSettingsMutation.isPending || !draft}
            onClick={() => handleSave()}
            className="bg-emerald-600 hover:bg-emerald-700 text-white gap-2 text-xs"
          >
            <Save className="h-4 w-4" />
            <span>{updateSettingsMutation.isPending ? "Saving..." : "Save All Changes"}</span>
          </Button>
        }
      />

      {feedback && (
        <div
          className={`flex items-center justify-between rounded-xl border p-4 text-xs font-medium ${
            feedback.type === "success"
              ? "border-emerald-200 bg-emerald-50 text-emerald-800 dark:border-emerald-900/70 dark:bg-emerald-950/40 dark:text-emerald-300"
              : "border-rose-200 bg-rose-50 text-rose-800 dark:border-rose-900/70 dark:bg-rose-950/40 dark:text-rose-300"
          }`}
        >
          <span>{feedback.message}</span>
          <button type="button" onClick={() => setFeedback(null)} className="font-semibold underline">
            Dismiss
          </button>
        </div>
      )}

      {/* 10 Navigation Tabs */}
      <div className="flex flex-wrap items-center gap-1.5 border-b border-stone-200 pb-3 dark:border-stone-800">
        {[
          { id: "general", label: "General", icon: Sliders },
          { id: "branding", label: "Branding", icon: Palette },
          { id: "delivery", label: "Delivery", icon: Truck },
          { id: "payments", label: "Payments & Tax", icon: CreditCard },
          { id: "notifications", label: "Notifications & Banner", icon: Bell },
          { id: "security", label: "Security & Policies", icon: ShieldCheck },
          { id: "maintenance", label: "Maintenance Mode", icon: Wrench },
          { id: "audit", label: "Audit Logs", icon: FileText },
          { id: "backup", label: "Backup & Export", icon: HardDrive },
          { id: "about", label: "About & Diagnostics", icon: Server },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id as SettingsTab)}
              className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
                isActive
                  ? "bg-emerald-600 text-white shadow-sm"
                  : "text-stone-600 hover:bg-stone-100 dark:text-stone-400 dark:hover:bg-stone-800"
              }`}
            >
              <Icon className="h-3.5 w-3.5" />
              <span>{tab.label}</span>
              {tab.id === "maintenance" && draft?.maintenance.enabled && (
                <span className="h-2 w-2 rounded-full bg-amber-400 animate-pulse" />
              )}
            </button>
          );
        })}
      </div>

      {settingsQuery.isLoading && <LoadingSkeleton rows={5} />}
      {settingsQuery.isError && (
        <ErrorState
          message={settingsQuery.error instanceof Error ? settingsQuery.error.message : "Unable to load settings."}
        />
      )}

      {draft && !settingsQuery.isLoading && (
        <>
          {/* TAB 1: GENERAL SETTINGS */}
          {activeTab === "general" && (
            <div className="space-y-6">
              {/* Admin Profile Card */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-2xl border border-stone-200/80 bg-white/90 p-4 sm:p-5 backdrop-blur-sm dark:border-stone-800/80 dark:bg-stone-900/80">
                <div className="flex items-center gap-4">
                  <div className="relative flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-full ring-2 ring-emerald-500/40 shadow-xs">
                    {avatarUrl ? (
                      <NextImage
                        src={avatarUrl}
                        alt={displayName}
                        width={56}
                        height={56}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center bg-linear-to-br from-emerald-500 to-emerald-700 text-lg font-bold text-white">
                        {userInitial}
                      </div>
                    )}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-base font-bold text-stone-900 dark:text-stone-100">
                        {displayName}
                      </h3>
                      <span className="rounded-md bg-emerald-500/10 px-2 py-0.5 text-[10px] font-bold text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                        Super Admin
                      </span>
                    </div>
                    <p className="text-xs text-stone-500 dark:text-stone-400">{displayEmail}</p>
                    <p className="mt-1 text-[11px] text-stone-400">
                      Primary administrator profile for SheoMart marketplace operations
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 self-end sm:self-center">
                  <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                    Verified Admin Profile
                  </span>
                </div>
              </div>

              <DashboardCard
                title="Marketplace Identity"
                description="Core consumer-facing branding details displayed on the storefront and invoices."
              >
                <div className="grid gap-4 sm:grid-cols-2">
                  <label className="space-y-1 text-xs font-medium">
                    <span>Marketplace Name</span>
                    <input
                      type="text"
                      value={draft.general.marketplaceName}
                      onChange={(e) =>
                        setDraft({ ...draft, general: { ...draft.general, marketplaceName: e.target.value } })
                      }
                      className="min-h-10 w-full rounded-lg border border-stone-200 bg-white px-3 text-xs outline-none focus:border-emerald-500 dark:border-stone-800 dark:bg-stone-900"
                    />
                  </label>
                  <label className="space-y-1 text-xs font-medium">
                    <span>Tagline</span>
                    <input
                      type="text"
                      value={draft.general.tagline}
                      onChange={(e) =>
                        setDraft({ ...draft, general: { ...draft.general, tagline: e.target.value } })
                      }
                      className="min-h-10 w-full rounded-lg border border-stone-200 bg-white px-3 text-xs outline-none focus:border-emerald-500 dark:border-stone-800 dark:bg-stone-900"
                    />
                  </label>
                </div>
                <label className="block mt-3 space-y-1 text-xs font-medium">
                  <span>Description</span>
                  <textarea
                    rows={3}
                    value={draft.general.description}
                    onChange={(e) =>
                      setDraft({ ...draft, general: { ...draft.general, description: e.target.value } })
                    }
                    className="w-full rounded-lg border border-stone-200 bg-white p-3 text-xs outline-none focus:border-emerald-500 dark:border-stone-800 dark:bg-stone-900"
                  />
                </label>
              </DashboardCard>

              <DashboardCard
                title="Support & Contact Channels"
                description="Customer service contact channels published across order tracking and help pages."
              >
                <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-4">
                  <label className="space-y-1 text-xs font-medium">
                    <span>Support Email</span>
                    <input
                      type="email"
                      value={draft.general.supportEmail}
                      onChange={(e) =>
                        setDraft({ ...draft, general: { ...draft.general, supportEmail: e.target.value } })
                      }
                      className="min-h-10 w-full rounded-lg border border-stone-200 bg-white px-3 text-xs outline-none focus:border-emerald-500 dark:border-stone-800 dark:bg-stone-900"
                    />
                  </label>
                  <label className="space-y-1 text-xs font-medium">
                    <span>Support Phone</span>
                    <input
                      type="text"
                      value={draft.general.supportPhone}
                      onChange={(e) =>
                        setDraft({ ...draft, general: { ...draft.general, supportPhone: e.target.value } })
                      }
                      className="min-h-10 w-full rounded-lg border border-stone-200 bg-white px-3 text-xs outline-none focus:border-emerald-500 dark:border-stone-800 dark:bg-stone-900"
                    />
                  </label>
                  <label className="space-y-1 text-xs font-medium">
                    <span>Support WhatsApp</span>
                    <input
                      type="text"
                      value={draft.general.supportWhatsApp}
                      onChange={(e) =>
                        setDraft({ ...draft, general: { ...draft.general, supportWhatsApp: e.target.value } })
                      }
                      className="min-h-10 w-full rounded-lg border border-stone-200 bg-white px-3 text-xs outline-none focus:border-emerald-500 dark:border-stone-800 dark:bg-stone-900"
                    />
                  </label>
                  <label className="space-y-1 text-xs font-medium">
                    <span>Website URL</span>
                    <input
                      type="url"
                      value={draft.general.websiteUrl}
                      onChange={(e) =>
                        setDraft({ ...draft, general: { ...draft.general, websiteUrl: e.target.value } })
                      }
                      className="min-h-10 w-full rounded-lg border border-stone-200 bg-white px-3 text-xs outline-none focus:border-emerald-500 dark:border-stone-800 dark:bg-stone-900"
                    />
                  </label>
                </div>
              </DashboardCard>

              <DashboardCard
                title="Regional & Locale Settings"
                description="Default currency, regional boundaries, and timezone."
              >
                <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3">
                  <label className="space-y-1 text-xs font-medium">
                    <span>Default Currency</span>
                    <input
                      type="text"
                      value={draft.general.defaultCurrency}
                      onChange={(e) =>
                        setDraft({ ...draft, general: { ...draft.general, defaultCurrency: e.target.value } })
                      }
                      className="min-h-10 w-full rounded-lg border border-stone-200 bg-white px-3 text-xs outline-none focus:border-emerald-500 dark:border-stone-800 dark:bg-stone-900"
                    />
                  </label>
                  <label className="space-y-1 text-xs font-medium">
                    <span>Timezone</span>
                    <input
                      type="text"
                      value={draft.general.timezone}
                      onChange={(e) =>
                        setDraft({ ...draft, general: { ...draft.general, timezone: e.target.value } })
                      }
                      className="min-h-10 w-full rounded-lg border border-stone-200 bg-white px-3 text-xs outline-none focus:border-emerald-500 dark:border-stone-800 dark:bg-stone-900"
                    />
                  </label>
                  <label className="space-y-1 text-xs font-medium">
                    <span>Primary District</span>
                    <input
                      type="text"
                      value={draft.general.district}
                      onChange={(e) =>
                        setDraft({ ...draft, general: { ...draft.general, district: e.target.value } })
                      }
                      className="min-h-10 w-full rounded-lg border border-stone-200 bg-white px-3 text-xs outline-none focus:border-emerald-500 dark:border-stone-800 dark:bg-stone-900"
                    />
                  </label>
                </div>
              </DashboardCard>

              <DashboardCard
                title="Order Amount Limits & Boundaries"
                description="Rules regulating allowed cart checkouts."
              >
                <div className="grid gap-4 sm:grid-cols-3">
                  <label className="space-y-1 text-xs font-medium">
                    <span>Minimum Order Value (₹)</span>
                    <input
                      type="number"
                      min={0}
                      value={draft.general.minOrderAmount}
                      onChange={(e) =>
                        setDraft({ ...draft, general: { ...draft.general, minOrderAmount: Number(e.target.value) } })
                      }
                      className="min-h-10 w-full rounded-lg border border-stone-200 bg-white px-3 text-xs outline-none focus:border-emerald-500 dark:border-stone-800 dark:bg-stone-900"
                    />
                  </label>
                  <label className="space-y-1 text-xs font-medium">
                    <span>Maximum Order Value (₹)</span>
                    <input
                      type="number"
                      min={100}
                      value={draft.general.maxOrderAmount}
                      onChange={(e) =>
                        setDraft({ ...draft, general: { ...draft.general, maxOrderAmount: Number(e.target.value) } })
                      }
                      className="min-h-10 w-full rounded-lg border border-stone-200 bg-white px-3 text-xs outline-none focus:border-emerald-500 dark:border-stone-800 dark:bg-stone-900"
                    />
                  </label>
                  <label className="space-y-1 text-xs font-medium">
                    <span>Delivery Radius (Km)</span>
                    <input
                      type="number"
                      min={1}
                      value={draft.general.deliveryRadiusKm}
                      onChange={(e) =>
                        setDraft({ ...draft, general: { ...draft.general, deliveryRadiusKm: Number(e.target.value) } })
                      }
                      className="min-h-10 w-full rounded-lg border border-stone-200 bg-white px-3 text-xs outline-none focus:border-emerald-500 dark:border-stone-800 dark:bg-stone-900"
                    />
                  </label>
                </div>
              </DashboardCard>
            </div>
          )}

          {/* TAB 2: BRANDING */}
          {activeTab === "branding" && (
            <div className="space-y-6">
              <DashboardCard
                title="Marketplace Brand Assets"
                description="Upload logos, favicons, and hero banners. Powered by Cloudinary storage."
              >
                <div className="grid gap-6 sm:grid-cols-2 md:grid-cols-3">
                  {[
                    { key: "logoUrl", label: "Primary Logo (Light)", aspect: "Horizontal logo" },
                    { key: "darkLogoUrl", label: "Dark Mode Logo", aspect: "Dark theme banner" },
                    { key: "faviconUrl", label: "Favicon / Icon", aspect: "Square 1:1" },
                    { key: "heroBannerUrl", label: "Storefront Hero Banner", aspect: "Wide 16:9 or 21:9" },
                    { key: "appBannerUrl", label: "Mobile App Banner", aspect: "Promo banner" },
                    { key: "splashImageUrl", label: "Splash Screen Image", aspect: "Vertical 9:16" },
                  ].map((item) => {
                    const fieldKey = item.key as keyof MarketplaceSettings["branding"];
                    const currentUrl = draft.branding[fieldKey];
                    const isUploading = uploadingField === fieldKey;

                    return (
                      <div
                        key={item.key}
                        className="rounded-xl border border-stone-200 bg-stone-50/50 p-4 dark:border-stone-800 dark:bg-stone-900/50"
                      >
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-xs font-bold text-stone-900 dark:text-stone-100">{item.label}</span>
                          <span className="text-[10px] text-stone-400">{item.aspect}</span>
                        </div>

                        {/* Image Preview Box */}
                        <div className="relative flex h-32 items-center justify-center overflow-hidden rounded-lg border border-dashed border-stone-300 bg-white dark:border-stone-700 dark:bg-stone-950">
                          {currentUrl ? (
                            <img src={currentUrl} alt={item.label} className="h-full w-full object-contain p-2" />
                          ) : (
                            <div className="text-center text-stone-400">
                              <ImageIcon className="mx-auto h-8 w-8 stroke-1" />
                              <span className="text-[11px] block mt-1">No asset uploaded</span>
                            </div>
                          )}
                          {isUploading && (
                            <div className="absolute inset-0 flex items-center justify-center bg-stone-950/60 text-white text-xs font-semibold backdrop-blur-xs">
                              Uploading...
                            </div>
                          )}
                        </div>

                        {/* Controls */}
                        <div className="mt-3 flex items-center gap-2">
                          <label className="flex-1 cursor-pointer">
                            <span className="inline-flex w-full items-center justify-center gap-1.5 rounded-lg border border-stone-200 bg-white px-2.5 py-1.5 text-xs font-semibold text-stone-700 hover:bg-stone-50 dark:border-stone-700 dark:bg-stone-800 dark:text-stone-200">
                              <UploadCloud className="h-3.5 w-3.5" />
                              {currentUrl ? "Replace" : "Upload"}
                            </span>
                            <input
                              type="file"
                              accept="image/*"
                              className="hidden"
                              disabled={isUploading}
                              onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (file) handleImageUpload(fieldKey, file);
                              }}
                            />
                          </label>

                          {currentUrl && (
                            <button
                              type="button"
                              onClick={() =>
                                setDraft({
                                  ...draft,
                                  branding: { ...draft.branding, [fieldKey]: "" },
                                })
                              }
                              className="rounded-lg border border-rose-200 p-1.5 text-rose-600 hover:bg-rose-50 dark:border-rose-900/60 dark:text-rose-400"
                              title="Remove"
                            >
                              <X className="h-4 w-4" />
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </DashboardCard>

              {/* Theme Design Tokens */}
              <DashboardCard
                title="Design System Accents"
                description="Governs primary, secondary, and badge colors adhering to SheoMart's emerald theme."
              >
                <div className="grid gap-4 sm:grid-cols-3">
                  <div className="rounded-xl border border-stone-200 p-3.5 dark:border-stone-800">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-bold text-stone-900 dark:text-stone-100">Primary Accent</span>
                      <span className="h-4 w-4 rounded-full bg-emerald-600" />
                    </div>
                    <input
                      type="text"
                      value={draft.branding.themePrimary}
                      onChange={(e) =>
                        setDraft({ ...draft, branding: { ...draft.branding, themePrimary: e.target.value } })
                      }
                      className="w-full rounded-md border border-stone-200 px-2.5 py-1 text-xs font-mono dark:border-stone-800 dark:bg-stone-900"
                    />
                    <p className="mt-1 text-[10px] text-stone-400">Buttons, active tabs, highlights (#059669)</p>
                  </div>

                  <div className="rounded-xl border border-stone-200 p-3.5 dark:border-stone-800">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-bold text-stone-900 dark:text-stone-100">Secondary Accent</span>
                      <span className="h-4 w-4 rounded-full bg-emerald-500" />
                    </div>
                    <input
                      type="text"
                      value={draft.branding.themeSecondary}
                      onChange={(e) =>
                        setDraft({ ...draft, branding: { ...draft.branding, themeSecondary: e.target.value } })
                      }
                      className="w-full rounded-md border border-stone-200 px-2.5 py-1 text-xs font-mono dark:border-stone-800 dark:bg-stone-900"
                    />
                    <p className="mt-1 text-[10px] text-stone-400">Gradients, hover states (#10b981)</p>
                  </div>

                  <div className="rounded-xl border border-stone-200 p-3.5 dark:border-stone-800">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-bold text-stone-900 dark:text-stone-100">Royal / Badge Gold</span>
                      <span className="h-4 w-4 rounded-full bg-amber-500" />
                    </div>
                    <input
                      type="text"
                      value={draft.branding.themeAccent}
                      onChange={(e) =>
                        setDraft({ ...draft, branding: { ...draft.branding, themeAccent: e.target.value } })
                      }
                      className="w-full rounded-md border border-stone-200 px-2.5 py-1 text-xs font-mono dark:border-stone-800 dark:bg-stone-900"
                    />
                    <p className="mt-1 text-[10px] text-stone-400">Ratings, Royal Store badges (#d97706)</p>
                  </div>
                </div>
              </DashboardCard>
            </div>
          )}

          {/* TAB 3: DELIVERY SETTINGS */}
          {activeTab === "delivery" && (
            <div className="space-y-6">
              <DashboardCard
                title="Delivery Charges & Operating Schedule"
                description="Governs shipping pricing, free delivery boundaries, and daily dispatch windows."
              >
                <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-4">
                  <label className="space-y-1 text-xs font-medium">
                    <span>Standard Delivery Fee (₹)</span>
                    <input
                      type="number"
                      min={0}
                      value={draft.delivery.deliveryCharge}
                      onChange={(e) =>
                        setDraft({ ...draft, delivery: { ...draft.delivery, deliveryCharge: Number(e.target.value) } })
                      }
                      className="min-h-10 w-full rounded-lg border border-stone-200 bg-white px-3 text-xs outline-none focus:border-emerald-500 dark:border-stone-800 dark:bg-stone-900"
                    />
                  </label>
                  <label className="space-y-1 text-xs font-medium">
                    <span>Free Delivery Threshold (₹)</span>
                    <input
                      type="number"
                      min={0}
                      value={draft.delivery.freeDeliveryThreshold}
                      onChange={(e) =>
                        setDraft({ ...draft, delivery: { ...draft.delivery, freeDeliveryThreshold: Number(e.target.value) } })
                      }
                      className="min-h-10 w-full rounded-lg border border-stone-200 bg-white px-3 text-xs outline-none focus:border-emerald-500 dark:border-stone-800 dark:bg-stone-900"
                    />
                  </label>
                  <label className="space-y-1 text-xs font-medium">
                    <span>Operating Start Time</span>
                    <input
                      type="time"
                      value={draft.delivery.deliveryStartTime}
                      onChange={(e) =>
                        setDraft({ ...draft, delivery: { ...draft.delivery, deliveryStartTime: e.target.value } })
                      }
                      className="min-h-10 w-full rounded-lg border border-stone-200 bg-white px-3 text-xs outline-none focus:border-emerald-500 dark:border-stone-800 dark:bg-stone-900"
                    />
                  </label>
                  <label className="space-y-1 text-xs font-medium">
                    <span>Operating End Time</span>
                    <input
                      type="time"
                      value={draft.delivery.deliveryEndTime}
                      onChange={(e) =>
                        setDraft({ ...draft, delivery: { ...draft.delivery, deliveryEndTime: e.target.value } })
                      }
                      className="min-h-10 w-full rounded-lg border border-stone-200 bg-white px-3 text-xs outline-none focus:border-emerald-500 dark:border-stone-800 dark:bg-stone-900"
                    />
                  </label>
                </div>

                <div className="mt-4 flex flex-wrap items-center gap-6 border-t border-stone-100 pt-4 dark:border-stone-800">
                  <label className="flex items-center gap-2 cursor-pointer text-xs font-medium">
                    <input
                      type="checkbox"
                      checked={draft.delivery.expressDeliveryEnabled}
                      onChange={(e) =>
                        setDraft({
                          ...draft,
                          delivery: { ...draft.delivery, expressDeliveryEnabled: e.target.checked },
                        })
                      }
                      className="h-4 w-4 rounded border-stone-300 text-emerald-600 focus:ring-emerald-500"
                    />
                    <span>Enable Hyperlocal Express Delivery</span>
                  </label>

                  {draft.delivery.expressDeliveryEnabled && (
                    <label className="flex items-center gap-2 text-xs font-medium">
                      <span>Express Fee (₹):</span>
                      <input
                        type="number"
                        min={0}
                        value={draft.delivery.expressDeliveryCharge}
                        onChange={(e) =>
                          setDraft({
                            ...draft,
                            delivery: { ...draft.delivery, expressDeliveryCharge: Number(e.target.value) },
                          })
                        }
                        className="h-8 w-24 rounded-lg border border-stone-200 bg-white px-2 text-xs outline-none dark:border-stone-800 dark:bg-stone-900"
                      />
                    </label>
                  )}
                </div>
              </DashboardCard>

              {/* Delivery Zones */}
              <DashboardCard
                title="Delivery Zones & Pincode Coverage"
                description="Enable or restrict deliveries to distinct localities across Sheopur district."
              >
                <div className="grid gap-3 sm:grid-cols-3">
                  {draft.delivery.zones.map((zone, idx) => (
                    <div
                      key={zone.id}
                      className={`rounded-xl border p-4 transition ${
                        zone.enabled
                          ? "border-emerald-200 bg-emerald-50/20 dark:border-emerald-800 dark:bg-emerald-950/20"
                          : "border-stone-200 bg-stone-50/50 opacity-70 dark:border-stone-800 dark:bg-stone-900/40"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-xs text-stone-900 dark:text-stone-100">{zone.name}</span>
                        <input
                          type="checkbox"
                          checked={zone.enabled}
                          onChange={(e) => {
                            const newZones = [...draft.delivery.zones];
                            newZones[idx] = { ...zone, enabled: e.target.checked };
                            setDraft({ ...draft, delivery: { ...draft.delivery, zones: newZones } });
                          }}
                          className="h-4 w-4 rounded border-stone-300 text-emerald-600 focus:ring-emerald-500"
                        />
                      </div>
                      <p className="mt-2 text-[11px] text-stone-500">
                        {zone.pincodes.length > 0 ? `Pincodes: ${zone.pincodes.join(", ")}` : "No pincodes assigned (Future expansion)"}
                      </p>
                      <span
                        className={`mt-2 inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                          zone.enabled
                            ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300"
                            : "bg-stone-200 text-stone-700 dark:bg-stone-800 dark:text-stone-400"
                        }`}
                      >
                        {zone.enabled ? "Active Zone" : "Disabled"}
                      </span>
                    </div>
                  ))}
                </div>
              </DashboardCard>
            </div>
          )}

          {/* TAB 4: PAYMENTS & TAX */}
          {activeTab === "payments" && (
            <div className="space-y-6">
              <DashboardCard
                title="Payment Channels"
                description="Configure enabled payment methods for consumers during checkout."
              >
                <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-3">
                  {[
                    { key: "codEnabled", label: "Cash on Delivery (COD)", desc: "Pay upon courier delivery" },
                    { key: "upiEnabled", label: "UPI & QR Codes", desc: "GooglePay, PhonePe, Paytm" },
                    { key: "cardEnabled", label: "Debit & Credit Cards", desc: "Visa, Mastercard, RuPay" },
                    { key: "razorpayEnabled", label: "Razorpay Gateway", desc: "Online gateway integration" },
                    { key: "stripeEnabled", label: "Stripe Gateway", desc: "International / Card gateway (Future)" },
                    { key: "walletEnabled", label: "SheoMart Customer Wallet", desc: "Closed-loop store credits (Future)" },
                  ].map((method) => {
                    const field = method.key as keyof MarketplaceSettings["payments"];
                    const isEnabled = Boolean(draft.payments[field]);

                    return (
                      <label
                        key={method.key}
                        className={`flex items-start gap-3 rounded-xl border p-4 cursor-pointer transition ${
                          isEnabled
                            ? "border-emerald-300 bg-emerald-50/20 dark:border-emerald-800 dark:bg-emerald-950/20"
                            : "border-stone-200 bg-stone-50/40 opacity-75 dark:border-stone-800 dark:bg-stone-900/30"
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={isEnabled}
                          onChange={(e) =>
                            setDraft({
                              ...draft,
                              payments: { ...draft.payments, [field]: e.target.checked },
                            })
                          }
                          className="mt-0.5 h-4 w-4 rounded border-stone-300 text-emerald-600 focus:ring-emerald-500"
                        />
                        <div>
                          <p className="text-xs font-bold text-stone-900 dark:text-stone-100">{method.label}</p>
                          <p className="text-[11px] text-stone-500">{method.desc}</p>
                        </div>
                      </label>
                    );
                  })}
                </div>
              </DashboardCard>

              {/* Tax Settings */}
              <DashboardCard
                title="Taxation & Invoicing (GST)"
                description="Manage GST rates applied to orders and logistics fees."
              >
                <div className="grid gap-4 sm:grid-cols-3">
                  <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold sm:col-span-3">
                    <input
                      type="checkbox"
                      checked={draft.payments.gstEnabled}
                      onChange={(e) =>
                        setDraft({ ...draft, payments: { ...draft.payments, gstEnabled: e.target.checked } })
                      }
                      className="h-4 w-4 rounded border-stone-300 text-emerald-600 focus:ring-emerald-500"
                    />
                    <span>Enable GST Calculation on Invoices</span>
                  </label>

                  <label className="space-y-1 text-xs font-medium">
                    <span>Default Product GST (%)</span>
                    <input
                      type="number"
                      min={0}
                      max={28}
                      value={draft.payments.gstPercentage}
                      onChange={(e) =>
                        setDraft({ ...draft, payments: { ...draft.payments, gstPercentage: Number(e.target.value) } })
                      }
                      className="min-h-10 w-full rounded-lg border border-stone-200 bg-white px-3 text-xs outline-none focus:border-emerald-500 dark:border-stone-800 dark:bg-stone-900"
                    />
                  </label>

                  <label className="space-y-1 text-xs font-medium">
                    <span>Delivery Tax Rate (%)</span>
                    <input
                      type="number"
                      min={0}
                      max={28}
                      value={draft.payments.deliveryTaxPercentage}
                      onChange={(e) =>
                        setDraft({
                          ...draft,
                          payments: { ...draft.payments, deliveryTaxPercentage: Number(e.target.value) },
                        })
                      }
                      className="min-h-10 w-full rounded-lg border border-stone-200 bg-white px-3 text-xs outline-none focus:border-emerald-500 dark:border-stone-800 dark:bg-stone-900"
                    />
                  </label>
                </div>
              </DashboardCard>

              {/* Global Coupon Settings */}
              <DashboardCard
                title="Global Promotional Rules"
                description="Cart coupon limits and automated application triggers."
              >
                <div className="grid gap-4 sm:grid-cols-2">
                  <label className="flex items-center gap-2 cursor-pointer text-xs font-medium">
                    <input
                      type="checkbox"
                      checked={draft.payments.allowCouponStacking}
                      onChange={(e) =>
                        setDraft({
                          ...draft,
                          payments: { ...draft.payments, allowCouponStacking: e.target.checked },
                        })
                      }
                      className="h-4 w-4 rounded border-stone-300 text-emerald-600 focus:ring-emerald-500"
                    />
                    <span>Allow Stacking Multiple Coupons in 1 Order</span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer text-xs font-medium">
                    <input
                      type="checkbox"
                      checked={draft.payments.autoApplyCoupons}
                      onChange={(e) =>
                        setDraft({
                          ...draft,
                          payments: { ...draft.payments, autoApplyCoupons: e.target.checked },
                        })
                      }
                      className="h-4 w-4 rounded border-stone-300 text-emerald-600 focus:ring-emerald-500"
                    />
                    <span>Auto-Apply Best Available Coupon on Checkout</span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer text-xs font-medium">
                    <input
                      type="checkbox"
                      checked={draft.payments.welcomeCouponEnabled}
                      onChange={(e) =>
                        setDraft({
                          ...draft,
                          payments: { ...draft.payments, welcomeCouponEnabled: e.target.checked },
                        })
                      }
                      className="h-4 w-4 rounded border-stone-300 text-emerald-600 focus:ring-emerald-500"
                    />
                    <span>Enable First-Time Customer Welcome Coupon</span>
                  </label>
                </div>
              </DashboardCard>
            </div>
          )}

          {/* TAB 5: NOTIFICATIONS & ANNOUNCEMENT */}
          {activeTab === "notifications" && (
            <div className="space-y-6">
              <DashboardCard
                title="Administrator Email Alerts"
                description="Select which events dispatch instant emails to marketplace administrators."
              >
                <label className="block mb-4 max-w-sm space-y-1 text-xs font-medium">
                  <span>Destination Admin Email</span>
                  <input
                    type="email"
                    value={draft.notifications.adminNotificationEmail}
                    onChange={(e) =>
                      setDraft({
                        ...draft,
                        notifications: { ...draft.notifications, adminNotificationEmail: e.target.value },
                      })
                    }
                    className="min-h-10 w-full rounded-lg border border-stone-200 bg-white px-3 text-xs outline-none focus:border-emerald-500 dark:border-stone-800 dark:bg-stone-900"
                  />
                </label>

                <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-4">
                  {[
                    { key: "newUserSignup", label: "New User Registration" },
                    { key: "newStoreRegistration", label: "New Store Application" },
                    { key: "storeApproval", label: "Store Approval State Changes" },
                    { key: "newOrder", label: "New Order Placed" },
                    { key: "cancelledOrder", label: "Order Cancellation Requests" },
                    { key: "reviewReport", label: "Review Spam/Abuse Reports" },
                    { key: "lowStockAlert", label: "Low Inventory Warnings (< 5 units)" },
                    { key: "couponExpiry", label: "Promotional Coupon Expirations" },
                  ].map((evt) => {
                    const field = evt.key as keyof MarketplaceSettings["notifications"]["adminEmailNotifications"];
                    const isChecked = Boolean(draft.notifications.adminEmailNotifications[field]);

                    return (
                      <label
                        key={evt.key}
                        className="flex items-center gap-2.5 rounded-lg border border-stone-100 bg-stone-50/60 p-3 cursor-pointer dark:border-stone-800 dark:bg-stone-900/40 text-xs font-medium"
                      >
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={(e) =>
                            setDraft({
                              ...draft,
                              notifications: {
                                ...draft.notifications,
                                adminEmailNotifications: {
                                  ...draft.notifications.adminEmailNotifications,
                                  [field]: e.target.checked,
                                },
                              },
                            })
                          }
                          className="h-4 w-4 rounded border-stone-300 text-emerald-600 focus:ring-emerald-500"
                        />
                        <span>{evt.label}</span>
                      </label>
                    );
                  })}
                </div>
              </DashboardCard>

              {/* Announcement Banner Manager */}
              <DashboardCard
                title="Marketplace Announcement Banner"
                description="Live banner rendered across top of storefront homepage."
              >
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="flex flex-wrap items-center gap-4 sm:col-span-2">
                    <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold">
                      <input
                        type="checkbox"
                        checked={draft.notifications.announcement.enabled}
                        onChange={(e) =>
                          setDraft({
                            ...draft,
                            notifications: {
                              ...draft.notifications,
                              announcement: { ...draft.notifications.announcement, enabled: e.target.checked },
                            },
                          })
                        }
                        className="h-4 w-4 rounded border-stone-300 text-emerald-600 focus:ring-emerald-500"
                      />
                      <span>Enable Announcement Banner</span>
                    </label>

                    <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold">
                      <input
                        type="checkbox"
                        checked={draft.notifications.announcement.showOnHomepage}
                        onChange={(e) =>
                          setDraft({
                            ...draft,
                            notifications: {
                              ...draft.notifications,
                              announcement: {
                                ...draft.notifications.announcement,
                                showOnHomepage: e.target.checked,
                              },
                            },
                          })
                        }
                        className="h-4 w-4 rounded border-stone-300 text-emerald-600 focus:ring-emerald-500"
                      />
                      <span>Display on Customer Homepage</span>
                    </label>
                  </div>

                  <label className="space-y-1 text-xs font-medium">
                    <span>Banner Title</span>
                    <input
                      type="text"
                      value={draft.notifications.announcement.title}
                      onChange={(e) =>
                        setDraft({
                          ...draft,
                          notifications: {
                            ...draft.notifications,
                            announcement: { ...draft.notifications.announcement, title: e.target.value },
                          },
                        })
                      }
                      className="min-h-10 w-full rounded-lg border border-stone-200 bg-white px-3 text-xs outline-none focus:border-emerald-500 dark:border-stone-800 dark:bg-stone-900"
                    />
                  </label>

                  <label className="space-y-1 text-xs font-medium">
                    <span>Background Color Token</span>
                    <select
                      value={draft.notifications.announcement.backgroundColor}
                      onChange={(e) =>
                        setDraft({
                          ...draft,
                          notifications: {
                            ...draft.notifications,
                            announcement: { ...draft.notifications.announcement, backgroundColor: e.target.value },
                          },
                        })
                      }
                      className="min-h-10 w-full rounded-lg border border-stone-200 bg-white px-3 text-xs outline-none focus:border-emerald-500 dark:border-stone-800 dark:bg-stone-900"
                    >
                      <option value="emerald">Emerald Green (Brand Accent)</option>
                      <option value="amber">Amber Gold (Notice / Alert)</option>
                      <option value="blue">Sapphire Blue (Informational)</option>
                      <option value="rose">Ruby Rose (Urgent / Flash)</option>
                    </select>
                  </label>

                  <label className="space-y-1 text-xs font-medium sm:col-span-2">
                    <span>Banner Description</span>
                    <input
                      type="text"
                      value={draft.notifications.announcement.description}
                      onChange={(e) =>
                        setDraft({
                          ...draft,
                          notifications: {
                            ...draft.notifications,
                            announcement: { ...draft.notifications.announcement, description: e.target.value },
                          },
                        })
                      }
                      className="min-h-10 w-full rounded-lg border border-stone-200 bg-white px-3 text-xs outline-none focus:border-emerald-500 dark:border-stone-800 dark:bg-stone-900"
                    />
                  </label>

                  <label className="space-y-1 text-xs font-medium">
                    <span>CTA Button Text</span>
                    <input
                      type="text"
                      value={draft.notifications.announcement.linkText || ""}
                      onChange={(e) =>
                        setDraft({
                          ...draft,
                          notifications: {
                            ...draft.notifications,
                            announcement: { ...draft.notifications.announcement, linkText: e.target.value },
                          },
                        })
                      }
                      className="min-h-10 w-full rounded-lg border border-stone-200 bg-white px-3 text-xs outline-none focus:border-emerald-500 dark:border-stone-800 dark:bg-stone-900"
                    />
                  </label>

                  <label className="space-y-1 text-xs font-medium">
                    <span>CTA Destination URL</span>
                    <input
                      type="text"
                      value={draft.notifications.announcement.linkUrl || ""}
                      onChange={(e) =>
                        setDraft({
                          ...draft,
                          notifications: {
                            ...draft.notifications,
                            announcement: { ...draft.notifications.announcement, linkUrl: e.target.value },
                          },
                        })
                      }
                      className="min-h-10 w-full rounded-lg border border-stone-200 bg-white px-3 text-xs outline-none focus:border-emerald-500 dark:border-stone-800 dark:bg-stone-900"
                    />
                  </label>
                </div>

                {/* Banner Live Preview */}
                {draft.notifications.announcement.enabled && (
                  <div className="mt-4 border-t border-stone-100 pt-4 dark:border-stone-800">
                    <span className="text-[11px] font-bold text-stone-400 uppercase tracking-wider block mb-2">
                      Live Storefront Banner Preview
                    </span>
                    <div
                      className={`flex flex-wrap items-center justify-between gap-3 rounded-xl p-3.5 text-xs text-white ${
                        draft.notifications.announcement.backgroundColor === "amber"
                          ? "bg-amber-600"
                          : draft.notifications.announcement.backgroundColor === "blue"
                          ? "bg-blue-600"
                          : draft.notifications.announcement.backgroundColor === "rose"
                          ? "bg-rose-600"
                          : "bg-emerald-600"
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <Megaphone className="h-4 w-4 shrink-0" />
                        <span>
                          <strong>{draft.notifications.announcement.title}:</strong>{" "}
                          {draft.notifications.announcement.description}
                        </span>
                      </div>
                      {draft.notifications.announcement.linkText && (
                        <span className="underline font-semibold cursor-pointer shrink-0">
                          {draft.notifications.announcement.linkText} →
                        </span>
                      )}
                    </div>
                  </div>
                )}
              </DashboardCard>
            </div>
          )}

          {/* TAB 6: SECURITY & POLICIES */}
          {activeTab === "security" && (
            <div className="space-y-6">
              {/* Admin Password Change Form with Strength Meter */}
              <DashboardCard
                title="Change Administrator Password"
                description="Must satisfy minimum 8 characters, numbers, and symbol requirements."
              >
                <form onSubmit={handlePasswordSubmit} className="space-y-4 max-w-xl">
                  {passwordFeedback && (
                    <div
                      className={`rounded-lg p-3 text-xs font-medium ${
                        passwordFeedback.type === "success"
                          ? "bg-emerald-50 text-emerald-800 border border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300"
                          : "bg-rose-50 text-rose-800 border border-rose-200 dark:bg-rose-950/40 dark:text-rose-300"
                      }`}
                    >
                      {passwordFeedback.message}
                    </div>
                  )}

                  <label className="block space-y-1 text-xs font-medium">
                    <span>Current Password</span>
                    <input
                      type="password"
                      required
                      value={passwordForm.currentPassword}
                      onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                      className="min-h-10 w-full rounded-lg border border-stone-200 bg-white px-3 text-xs outline-none focus:border-emerald-500 dark:border-stone-800 dark:bg-stone-900"
                    />
                  </label>

                  <div className="grid gap-3 sm:grid-cols-2">
                    <label className="space-y-1 text-xs font-medium">
                      <span>New Password</span>
                      <input
                        type="password"
                        required
                        value={passwordForm.newPassword}
                        onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                        className="min-h-10 w-full rounded-lg border border-stone-200 bg-white px-3 text-xs outline-none focus:border-emerald-500 dark:border-stone-800 dark:bg-stone-900"
                      />
                    </label>

                    <label className="space-y-1 text-xs font-medium">
                      <span>Confirm New Password</span>
                      <input
                        type="password"
                        required
                        value={passwordForm.confirmPassword}
                        onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                        className="min-h-10 w-full rounded-lg border border-stone-200 bg-white px-3 text-xs outline-none focus:border-emerald-500 dark:border-stone-800 dark:bg-stone-900"
                      />
                    </label>
                  </div>

                  {/* Password Strength Meter */}
                  {passwordForm.newPassword && (
                    <div className="space-y-1.5 pt-1">
                      <div className="flex items-center justify-between text-[11px] text-stone-500">
                        <span>Password Strength</span>
                        <span className="font-bold">
                          {passwordScore <= 2 ? "Weak" : passwordScore <= 4 ? "Good" : "Strong"}
                        </span>
                      </div>
                      <div className="h-1.5 w-full rounded-full bg-stone-200 overflow-hidden dark:bg-stone-800">
                        <div
                          className={`h-full transition-all duration-300 ${
                            passwordScore <= 2
                              ? "bg-rose-500 w-1/3"
                              : passwordScore <= 4
                              ? "bg-amber-500 w-2/3"
                              : "bg-emerald-500 w-full"
                          }`}
                        />
                      </div>
                    </div>
                  )}

                  <Button
                    type="submit"
                    size="sm"
                    disabled={isChangingPassword}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs"
                  >
                    {isChangingPassword ? "Updating..." : "Update Password"}
                  </Button>
                </form>
              </DashboardCard>

              {/* Login Security Policies */}
              <DashboardCard
                title="Account Login Policies"
                description="Governs rate limits, brute force lockout rules, and mandatory verification requirements."
              >
                <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3">
                  <label className="space-y-1 text-xs font-medium">
                    <span>Max Login Attempts</span>
                    <input
                      type="number"
                      min={3}
                      max={10}
                      value={draft.security.maxLoginAttempts}
                      onChange={(e) =>
                        setDraft({
                          ...draft,
                          security: { ...draft.security, maxLoginAttempts: Number(e.target.value) },
                        })
                      }
                      className="min-h-10 w-full rounded-lg border border-stone-200 bg-white px-3 text-xs outline-none focus:border-emerald-500 dark:border-stone-800 dark:bg-stone-900"
                    />
                  </label>

                  <label className="space-y-1 text-xs font-medium">
                    <span>Lockout Duration (Minutes)</span>
                    <input
                      type="number"
                      min={5}
                      max={60}
                      value={draft.security.lockoutDurationMinutes}
                      onChange={(e) =>
                        setDraft({
                          ...draft,
                          security: { ...draft.security, lockoutDurationMinutes: Number(e.target.value) },
                        })
                      }
                      className="min-h-10 w-full rounded-lg border border-stone-200 bg-white px-3 text-xs outline-none focus:border-emerald-500 dark:border-stone-800 dark:bg-stone-900"
                    />
                  </label>

                  <label className="space-y-1 text-xs font-medium">
                    <span>Password Rotation Interval (Days)</span>
                    <input
                      type="number"
                      min={30}
                      max={365}
                      value={draft.security.passwordExpiryDays}
                      onChange={(e) =>
                        setDraft({
                          ...draft,
                          security: { ...draft.security, passwordExpiryDays: Number(e.target.value) },
                        })
                      }
                      className="min-h-10 w-full rounded-lg border border-stone-200 bg-white px-3 text-xs outline-none focus:border-emerald-500 dark:border-stone-800 dark:bg-stone-900"
                    />
                  </label>
                </div>

                <div className="mt-4 flex flex-wrap items-center gap-6 border-t border-stone-100 pt-4 dark:border-stone-800">
                  <label className="flex items-center gap-2 cursor-pointer text-xs font-medium">
                    <input
                      type="checkbox"
                      checked={draft.security.requireStrongPassword}
                      onChange={(e) =>
                        setDraft({
                          ...draft,
                          security: { ...draft.security, requireStrongPassword: e.target.checked },
                        })
                      }
                      className="h-4 w-4 rounded border-stone-300 text-emerald-600 focus:ring-emerald-500"
                    />
                    <span>Require Complex Passwords</span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer text-xs font-medium">
                    <input
                      type="checkbox"
                      checked={draft.security.requirePhoneVerification}
                      onChange={(e) =>
                        setDraft({
                          ...draft,
                          security: { ...draft.security, requirePhoneVerification: e.target.checked },
                        })
                      }
                      className="h-4 w-4 rounded border-stone-300 text-emerald-600 focus:ring-emerald-500"
                    />
                    <span>Mandatory Mobile Number Validation</span>
                  </label>
                </div>
              </DashboardCard>

              {/* Two-Factor Authentication Preparedness */}
              <DashboardCard
                title="Two-Factor Authentication (2FA Readiness)"
                description="Provides multi-factor defense for high-privileged admin and seller accounts."
              >
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 rounded-xl border border-stone-200 bg-stone-50/50 p-4 dark:border-stone-800 dark:bg-stone-900/40">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <Shield className="h-4 w-4 text-emerald-600" />
                      <span className="font-bold text-xs text-stone-900 dark:text-stone-100">
                        Authenticator App (TOTP Placeholder)
                      </span>
                    </div>
                    <p className="text-xs text-stone-500">
                      Compatible with Google Authenticator, Authy, and 1Password. Ready for integration.
                    </p>
                  </div>
                  <Button size="sm" variant="outline" className="text-xs shrink-0" disabled>
                    Configure 2FA
                  </Button>
                </div>
              </DashboardCard>

              {/* API & Middleware Security Panel */}
              {securityStatusQuery.data && (
                <DashboardCard
                  title="Platform Security Controls"
                  description="Live read-only status of HTTP security headers, tokens, and middleware enforcement."
                >
                  <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-3">
                    <div className="rounded-xl border border-stone-100 bg-stone-50/60 p-3 dark:border-stone-800 dark:bg-stone-900/40">
                      <span className="text-[11px] font-semibold text-stone-500">JWT Token Security</span>
                      <p className="text-xs font-bold text-emerald-600 mt-1">
                        Active (15m Access / 7d Refresh)
                      </p>
                      <p className="text-[10px] text-stone-400 mt-0.5">Algorithm: HS256 with rotation</p>
                    </div>

                    <div className="rounded-xl border border-stone-100 bg-stone-50/60 p-3 dark:border-stone-800 dark:bg-stone-900/40">
                      <span className="text-[11px] font-semibold text-stone-500">HTTP Helmet Headers</span>
                      <p className="text-xs font-bold text-emerald-600 mt-1">
                        Active & Enforced
                      </p>
                      <p className="text-[10px] text-stone-400 mt-0.5">X-Frame-Options, HSTS, No-Sniff</p>
                    </div>

                    <div className="rounded-xl border border-stone-100 bg-stone-50/60 p-3 dark:border-stone-800 dark:bg-stone-900/40">
                      <span className="text-[11px] font-semibold text-stone-500">API Rate Limiter</span>
                      <p className="text-xs font-bold text-emerald-600 mt-1">
                        100 Req / 15 Min Window
                      </p>
                      <p className="text-[10px] text-stone-400 mt-0.5">DDoS & brute-force mitigation</p>
                    </div>

                    <div className="rounded-xl border border-stone-100 bg-stone-50/60 p-3 dark:border-stone-800 dark:bg-stone-900/40">
                      <span className="text-[11px] font-semibold text-stone-500">CORS Policy</span>
                      <p className="text-xs font-bold text-emerald-600 mt-1">
                        Strict Origin Restriction
                      </p>
                      <p className="text-[10px] text-stone-400 mt-0.5">Credentials allowed for trusted origin</p>
                    </div>

                    <div className="rounded-xl border border-stone-100 bg-stone-50/60 p-3 dark:border-stone-800 dark:bg-stone-900/40">
                      <span className="text-[11px] font-semibold text-stone-500">HTTP Parameter Pollution</span>
                      <p className="text-xs font-bold text-emerald-600 mt-1">
                        Protected via HPP
                      </p>
                      <p className="text-[10px] text-stone-400 mt-0.5">Guards query parameter tampering</p>
                    </div>

                    <div className="rounded-xl border border-stone-100 bg-stone-50/60 p-3 dark:border-stone-800 dark:bg-stone-900/40">
                      <span className="text-[11px] font-semibold text-stone-500">Cookie Security</span>
                      <p className="text-xs font-bold text-emerald-600 mt-1">
                        HttpOnly & SameSite=Lax
                      </p>
                      <p className="text-[10px] text-stone-400 mt-0.5">Mitigates XSS token leakage</p>
                    </div>
                  </div>
                </DashboardCard>
              )}
            </div>
          )}

          {/* TAB 7: MAINTENANCE MODE */}
          {activeTab === "maintenance" && (
            <div className="space-y-6">
              <DashboardCard
                title="Platform Maintenance Control"
                description="When enabled, public storefront and checkout APIs are blocked with HTTP 503. Administrators retain full access."
              >
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 rounded-xl border border-amber-200 bg-amber-50/50 p-4 dark:border-amber-900/50 dark:bg-amber-950/30">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <Wrench className="h-5 w-5 text-amber-600" />
                      <span className="font-bold text-sm text-amber-900 dark:text-amber-200">
                        {draft.maintenance.enabled ? "Maintenance Mode is ACTIVE" : "Maintenance Mode is Disabled"}
                      </span>
                    </div>
                    <p className="text-xs text-amber-800/80 dark:text-amber-300/80">
                      {draft.maintenance.enabled
                        ? "Storefront consumers see the maintenance notice below."
                        : "Marketplace is publicly operational."}
                    </p>
                  </div>

                  <Button
                    size="sm"
                    onClick={() => {
                      const newEnabled = !draft.maintenance.enabled;
                      setDraft({
                        ...draft,
                        maintenance: { ...draft.maintenance, enabled: newEnabled },
                      });
                      handleSave("maintenance");
                    }}
                    className={`text-xs text-white ${
                      draft.maintenance.enabled
                        ? "bg-rose-600 hover:bg-rose-700"
                        : "bg-amber-600 hover:bg-amber-700"
                    }`}
                  >
                    {draft.maintenance.enabled ? "Disable Maintenance Mode" : "Activate Maintenance Mode"}
                  </Button>
                </div>

                <div className="mt-4 grid gap-4 sm:grid-cols-2">
                  <label className="space-y-1 text-xs font-medium">
                    <span>Maintenance Screen Title</span>
                    <input
                      type="text"
                      value={draft.maintenance.title}
                      onChange={(e) =>
                        setDraft({
                          ...draft,
                          maintenance: { ...draft.maintenance, title: e.target.value },
                        })
                      }
                      className="min-h-10 w-full rounded-lg border border-stone-200 bg-white px-3 text-xs outline-none focus:border-emerald-500 dark:border-stone-800 dark:bg-stone-900"
                    />
                  </label>

                  <label className="space-y-1 text-xs font-medium">
                    <span>Estimated Return Time (Optional)</span>
                    <input
                      type="text"
                      placeholder="e.g. Today at 6:00 PM IST"
                      value={draft.maintenance.estimatedReturnTime || ""}
                      onChange={(e) =>
                        setDraft({
                          ...draft,
                          maintenance: { ...draft.maintenance, estimatedReturnTime: e.target.value || null },
                        })
                      }
                      className="min-h-10 w-full rounded-lg border border-stone-200 bg-white px-3 text-xs outline-none focus:border-emerald-500 dark:border-stone-800 dark:bg-stone-900"
                    />
                  </label>

                  <label className="space-y-1 text-xs font-medium sm:col-span-2">
                    <span>Notice Description</span>
                    <textarea
                      rows={3}
                      value={draft.maintenance.description}
                      onChange={(e) =>
                        setDraft({
                          ...draft,
                          maintenance: { ...draft.maintenance, description: e.target.value },
                        })
                      }
                      className="w-full rounded-lg border border-stone-200 bg-white p-3 text-xs outline-none focus:border-emerald-500 dark:border-stone-800 dark:bg-stone-900"
                    />
                  </label>
                </div>

                {/* Customer View Preview */}
                <div className="mt-6 border-t border-stone-100 pt-5 dark:border-stone-800">
                  <span className="text-[11px] font-bold text-stone-400 uppercase tracking-wider block mb-3">
                    Customer Screen Preview
                  </span>
                  <div className="mx-auto max-w-lg rounded-2xl border border-stone-200 bg-white p-8 text-center shadow-lg dark:border-stone-800 dark:bg-stone-950">
                    <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-amber-100 text-amber-600 dark:bg-amber-950/80">
                      <Wrench className="h-7 w-7" />
                    </div>
                    <h3 className="mt-4 text-base font-bold text-stone-900 dark:text-stone-100">
                      {draft.maintenance.title || "Under Scheduled Maintenance"}
                    </h3>
                    <p className="mt-2 text-xs text-stone-500 leading-relaxed">
                      {draft.maintenance.description || "We are undergoing platform upgrades."}
                    </p>
                    {draft.maintenance.estimatedReturnTime && (
                      <p className="mt-3 text-xs font-semibold text-emerald-600">
                        Estimated Return: {draft.maintenance.estimatedReturnTime}
                      </p>
                    )}
                  </div>
                </div>
              </DashboardCard>
            </div>
          )}

          {/* TAB 8: AUDIT LOGS */}
          {activeTab === "audit" && (
            <div className="space-y-6">
              <DashboardCard
                title="Administrative Activity Log"
                description="Immutable audit trail capturing settings modifications, security changes, and store actions."
              >
                {/* Audit Filters Bar */}
                <div className="grid gap-3 sm:grid-cols-3 xl:grid-cols-4 mb-4">
                  <label className="flex min-h-10 items-center gap-2 rounded-lg border border-stone-200 bg-white px-3 text-xs dark:border-stone-800 dark:bg-stone-900">
                    <Search className="h-4 w-4 text-stone-400 shrink-0" />
                    <input
                      type="text"
                      placeholder="Search action or admin..."
                      value={auditFilters.search || ""}
                      onChange={(e) =>
                        setAuditFilters((prev) => ({ ...prev, search: e.target.value || undefined, page: 1 }))
                      }
                      className="min-w-0 flex-1 bg-transparent outline-none"
                    />
                  </label>

                  <select
                    value={auditFilters.module || "all"}
                    onChange={(e) =>
                      setAuditFilters((prev) => ({ ...prev, module: e.target.value, page: 1 }))
                    }
                    className="min-h-10 rounded-lg border border-stone-200 bg-white px-3 text-xs outline-none dark:border-stone-800 dark:bg-stone-900"
                  >
                    <option value="all">All Modules</option>
                    <option value="settings">Settings</option>
                    <option value="security">Security</option>
                    <option value="users">Users</option>
                    <option value="stores">Stores</option>
                    <option value="products">Products</option>
                    <option value="promotions">Promotions</option>
                    <option value="system">System</option>
                  </select>

                  <Button
                    size="sm"
                    variant="outline"
                    className="h-10 text-xs"
                    onClick={() => setAuditFilters({ page: 1, limit: 15 })}
                  >
                    <RotateCcw className="h-3.5 w-3.5 mr-1" />
                    Reset Filters
                  </Button>
                </div>

                {auditLogsQuery.isLoading && <LoadingSkeleton rows={4} />}
                {auditLogsQuery.isError && (
                  <div className="rounded-xl border border-rose-200 bg-rose-50 p-4 text-xs text-rose-700">
                    Failed to fetch audit records.
                  </div>
                )}

                {auditLogsQuery.data && !auditLogsQuery.isLoading && (
                  <>
                    {auditLogsQuery.data.logs.length === 0 ? (
                      <EmptyState title="No audit events found" description="Adjust your search filters." />
                    ) : (
                      <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs">
                          <thead className="border-b border-stone-200 text-stone-500 dark:border-stone-800">
                            <tr>
                              <th className="py-2.5 font-semibold">Admin</th>
                              <th className="py-2.5 font-semibold">Action</th>
                              <th className="py-2.5 font-semibold">Module</th>
                              <th className="py-2.5 font-semibold">IP Address</th>
                              <th className="py-2.5 font-semibold">Date & Time</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-stone-100 dark:divide-stone-800">
                            {auditLogsQuery.data.logs.map((log) => (
                              <tr key={log.id} className="hover:bg-stone-50/50 dark:hover:bg-stone-900/40">
                                <td className="py-3 font-semibold text-stone-900 dark:text-stone-100">
                                  {log.adminName}
                                </td>
                                <td className="py-3">
                                  <span className="font-mono text-emerald-600 dark:text-emerald-400 font-bold">
                                    {log.action}
                                  </span>
                                </td>
                                <td className="py-3">
                                  <span className="rounded bg-stone-100 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-stone-700 dark:bg-stone-800 dark:text-stone-300">
                                    {log.module}
                                  </span>
                                </td>
                                <td className="py-3 font-mono text-stone-500">{log.ip}</td>
                                <td className="py-3 text-stone-500">
                                  {new Date(log.createdAt).toLocaleString("en-IN", {
                                    day: "numeric",
                                    month: "short",
                                    hour: "2-digit",
                                    minute: "2-digit",
                                  })}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}

                    {/* Pagination */}
                    {auditLogsQuery.data.pagination.totalPages > 1 && (
                      <div className="mt-4 flex items-center justify-between border-t border-stone-200 pt-3 text-xs text-stone-500">
                        <span>
                          Page {auditLogsQuery.data.pagination.page} of {auditLogsQuery.data.pagination.totalPages} (
                          {auditLogsQuery.data.pagination.total} records)
                        </span>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            className="h-8 text-xs"
                            disabled={auditFilters.page <= 1}
                            onClick={() => setAuditFilters((prev) => ({ ...prev, page: prev.page - 1 }))}
                          >
                            Previous
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="h-8 text-xs"
                            disabled={auditFilters.page >= auditLogsQuery.data.pagination.totalPages}
                            onClick={() => setAuditFilters((prev) => ({ ...prev, page: prev.page + 1 }))}
                          >
                            Next
                          </Button>
                        </div>
                      </div>
                    )}
                  </>
                )}
              </DashboardCard>
            </div>
          )}

          {/* TAB 9: BACKUP & DATA EXPORT */}
          {activeTab === "backup" && (
            <div className="space-y-6">
              <div className="grid gap-4 sm:grid-cols-3">
                <StatCard
                  title="Last Backup Timestamp"
                  value={
                    draft.backup.lastBackupAt
                      ? new Date(draft.backup.lastBackupAt).toLocaleString("en-IN", {
                          day: "numeric",
                          month: "short",
                          hour: "2-digit",
                          minute: "2-digit",
                        })
                      : "Never"
                  }
                  description="Most recent platform snapshot"
                  icon={<HardDrive className="h-5 w-5 text-emerald-600" />}
                />
                <StatCard
                  title="Backup Size"
                  value={draft.backup.lastBackupSize || "0.00 MB"}
                  description="Calculated database footprint"
                  icon={<Database className="h-5 w-5 text-blue-600" />}
                />
                <StatCard
                  title="Automated Schedule"
                  value="Daily (02:00 UTC)"
                  description="Scheduled database backups"
                  icon={<Clock className="h-5 w-5 text-purple-600" />}
                />
              </div>

              <DashboardCard
                title="Platform Snapshot Operations"
                description="Generate JSON snapshots of platform configuration, system state, and entity metadata."
              >
                <div className="flex flex-wrap items-center gap-3">
                  <Button
                    size="sm"
                    disabled={isBackingUp}
                    onClick={handleCreateBackup}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white gap-2 text-xs"
                  >
                    <HardDrive className="h-4 w-4" />
                    <span>{isBackingUp ? "Generating..." : "Create New Snapshot"}</span>
                  </Button>

                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => downloadPlatformBackup()}
                    className="gap-2 text-xs"
                  >
                    <Download className="h-4 w-4" />
                    <span>Download Settings Backup (JSON)</span>
                  </Button>
                </div>
              </DashboardCard>

              {/* Data Export section */}
              <DashboardCard
                title="Marketplace Data Export (CSV)"
                description="Export individual platform collections for external bookkeeping and audits."
              >
                <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-3">
                  {[
                    { type: "products" as const, label: "Products Catalog CSV", icon: ShoppingBag },
                    { type: "categories" as const, label: "Categories CSV", icon: Layers },
                    { type: "users" as const, label: "Registered Users CSV", icon: Users },
                    { type: "stores" as const, label: "Seller Stores CSV", icon: Store },
                    { type: "coupons" as const, label: "Coupons & Discounts CSV", icon: Tag },
                  ].map((item) => {
                    const Icon = item.icon;
                    const isRunning = exportingType === item.type;
                    return (
                      <div
                        key={item.type}
                        className="flex items-center justify-between rounded-xl border border-stone-200 bg-stone-50/50 p-4 dark:border-stone-800 dark:bg-stone-900/40"
                      >
                        <div className="flex items-center gap-2.5">
                          <Icon className="h-4 w-4 text-emerald-600" />
                          <span className="text-xs font-semibold text-stone-900 dark:text-stone-100">
                            {item.label}
                          </span>
                        </div>
                        <Button
                          size="sm"
                          variant="outline"
                          disabled={isRunning}
                          onClick={() => handleExportData(item.type)}
                          className="h-8 text-xs"
                        >
                          <Download className="h-3.5 w-3.5 mr-1" />
                          {isRunning ? "Exporting..." : "Export"}
                        </Button>
                      </div>
                    );
                  })}
                </div>
              </DashboardCard>
            </div>
          )}

          {/* TAB 10: ABOUT & SYSTEM DIAGNOSTICS */}
          {activeTab === "about" && (
            <div className="space-y-6">
              {systemHealthQuery.data && (
                <>
                  <DashboardCard
                    title="Platform Version & Environment"
                    description="Deployed software builds and operational runtime specifications."
                  >
                    <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-5">
                      <div className="rounded-xl border border-stone-100 bg-stone-50/60 p-3.5 dark:border-stone-800 dark:bg-stone-900/40">
                        <span className="text-[11px] text-stone-500">Backend API</span>
                        <p className="text-base font-bold text-stone-900 dark:text-stone-100 mt-1">
                          v{systemHealthQuery.data.versions.backend}
                        </p>
                      </div>
                      <div className="rounded-xl border border-stone-100 bg-stone-50/60 p-3.5 dark:border-stone-800 dark:bg-stone-900/40">
                        <span className="text-[11px] text-stone-500">Frontend Web</span>
                        <p className="text-base font-bold text-stone-900 dark:text-stone-100 mt-1">
                          v{systemHealthQuery.data.versions.frontend}
                        </p>
                      </div>
                      <div className="rounded-xl border border-stone-100 bg-stone-50/60 p-3.5 dark:border-stone-800 dark:bg-stone-900/40">
                        <span className="text-[11px] text-stone-500">Android Beta APK</span>
                        <p className="text-base font-bold text-stone-900 dark:text-stone-100 mt-1">
                          v{systemHealthQuery.data.versions.androidApp}
                        </p>
                      </div>
                      <div className="rounded-xl border border-stone-100 bg-stone-50/60 p-3.5 dark:border-stone-800 dark:bg-stone-900/40">
                        <span className="text-[11px] text-stone-500">Node.js Runtime</span>
                        <p className="text-base font-bold text-stone-900 dark:text-stone-100 mt-1 font-mono text-xs">
                          {systemHealthQuery.data.versions.node}
                        </p>
                      </div>
                      <div className="rounded-xl border border-stone-100 bg-stone-50/60 p-3.5 dark:border-stone-800 dark:bg-stone-900/40">
                        <span className="text-[11px] text-stone-500">Environment</span>
                        <p className="text-base font-bold text-emerald-600 mt-1 capitalize">
                          {systemHealthQuery.data.versions.environment}
                        </p>
                      </div>
                    </div>
                  </DashboardCard>

                  <DashboardCard
                    title="Live Infrastructure Vitality"
                    description="Real-time connectivity and resource consumption metrics."
                  >
                    <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-4">
                      <div className="rounded-xl border border-stone-100 bg-stone-50/60 p-4 dark:border-stone-800 dark:bg-stone-900/40">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-semibold text-stone-700 dark:text-stone-300">MongoDB</span>
                          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                            <CheckCircle2 className="h-3 w-3" /> Connected
                          </span>
                        </div>
                        <p className="text-xs font-mono text-stone-500 mt-2 truncate">
                          Cluster: {systemHealthQuery.data.services.mongodb.host}
                        </p>
                      </div>

                      <div className="rounded-xl border border-stone-100 bg-stone-50/60 p-4 dark:border-stone-800 dark:bg-stone-900/40">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-semibold text-stone-700 dark:text-stone-300">Cloudinary CDN</span>
                          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                            <CheckCircle2 className="h-3 w-3" /> Configured
                          </span>
                        </div>
                        <p className="text-xs font-mono text-stone-500 mt-2 truncate">
                          Cloud: {systemHealthQuery.data.services.cloudinary.cloudName}
                        </p>
                      </div>

                      <div className="rounded-xl border border-stone-100 bg-stone-50/60 p-4 dark:border-stone-800 dark:bg-stone-900/40">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-semibold text-stone-700 dark:text-stone-300">Memory Heap</span>
                          <span className="text-xs font-bold text-stone-900 dark:text-stone-100">
                            {systemHealthQuery.data.system.memoryHeapUsedMB} MB
                          </span>
                        </div>
                        <p className="text-xs text-stone-500 mt-2">
                          Total Allocated: {systemHealthQuery.data.system.memoryHeapTotalMB} MB
                        </p>
                      </div>

                      <div className="rounded-xl border border-stone-100 bg-stone-50/60 p-4 dark:border-stone-800 dark:bg-stone-900/40">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-semibold text-stone-700 dark:text-stone-300">Active Sessions</span>
                          <span className="text-xs font-bold text-emerald-600">
                            {systemHealthQuery.data.system.activeSessions} Active
                          </span>
                        </div>
                        <p className="text-xs text-stone-500 mt-2">
                          Server Uptime: {Math.floor(systemHealthQuery.data.uptimeSeconds / 60)} mins
                        </p>
                      </div>
                    </div>
                  </DashboardCard>
                </>
              )}
            </div>
          )}
        </>
      )}
    </DashboardContent>
  );
}
