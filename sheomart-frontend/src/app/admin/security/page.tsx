"use client";

import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  CheckCircle2,
  Clock,
  Globe,
  KeyRound,
  Laptop,
  LoaderCircle,
  Lock,
  LogOut,
  Monitor,
  RefreshCw,
  RotateCcw,
  Shield,
  ShieldAlert,
  ShieldCheck,
  Smartphone,
  Tablet,
  X,
} from "lucide-react";
import { Breadcrumb } from "@/components/dashboard/layout/Breadcrumb";
import { DashboardContent } from "@/components/dashboard/layout/DashboardContent";
import { PageHeader } from "@/components/dashboard/layout/PageHeader";
import { DashboardCard } from "@/components/dashboard/DashboardCard";
import { EmptyState } from "@/components/dashboard/EmptyState";
import { LoadingSkeleton } from "@/components/dashboard/LoadingSkeleton";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/dashboard/ConfirmDialog";
import {
  useAdminSessions,
  useRevokeSession,
  useLogoutOtherSessions,
  useSecurityStatus,
} from "@/hooks/use-admin-settings";
import {
  approveSellerPasswordReset,
  fetchSellerPasswordResetRequests,
  rejectSellerPasswordReset,
  type SellerPasswordResetRequest,
} from "@/services/seller-password-reset";

const statusStyles = {
  pending: "bg-amber-100 text-amber-800 dark:bg-amber-950/50 dark:text-amber-200",
  approved: "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-200",
  rejected: "bg-rose-100 text-rose-800 dark:bg-rose-950/50 dark:text-rose-200",
};

export default function AdminSecurityPage() {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<"sessions" | "seller_queue" | "policies">("sessions");

  // Sessions state & hooks
  const sessionsQuery = useAdminSessions();
  const revokeSessionMutation = useRevokeSession();
  const logoutOtherMutation = useLogoutOtherSessions();

  // Security Status Hook
  const securityStatusQuery = useSecurityStatus();

  // Seller Password Reset state
  const [selectedRequest, setSelectedRequest] = useState<SellerPasswordResetRequest | null>(null);
  const [remarks, setRemarks] = useState("");
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; message: string } | null>(null);

  const [confirmDialog, setConfirmDialog] = useState<{
    open: boolean;
    title: string;
    description: string;
    action: () => Promise<void>;
  }>({
    open: false,
    title: "",
    description: "",
    action: async () => {},
  });

  const sellerQueueQuery = useQuery({
    queryKey: ["seller-password-reset-requests"],
    queryFn: fetchSellerPasswordResetRequests,
  });

  const sellerMutation = useMutation({
    mutationFn: ({ id, status, remarks }: { id: string; status: "approved" | "rejected"; remarks: string }) =>
      status === "approved"
        ? approveSellerPasswordReset(id, remarks)
        : rejectSellerPasswordReset(id, remarks),
    onSuccess: (_result, variables) => {
      setFeedback({ type: "success", message: `Password reset request ${variables.status}.` });
      setSelectedRequest(null);
      setRemarks("");
      queryClient.setQueryData<SellerPasswordResetRequest[]>(
        ["seller-password-reset-requests"],
        (requests = []) => requests.filter((r) => r.id !== variables.id)
      );
      void queryClient.invalidateQueries({ queryKey: ["seller-password-reset-requests"] });
    },
    onError: (error: any) => {
      setFeedback({
        type: "error",
        message: error.message || "Unable to process the password reset request.",
      });
    },
  });

  const pendingRequests = (sellerQueueQuery.data ?? []).filter((r) => r.status === "pending");

  const handleRevokeSingle = (sessionId: string) => {
    setConfirmDialog({
      open: true,
      title: "Terminate Active Session?",
      description: "This will immediately invalidate the session token on this device.",
      action: async () => {
        await revokeSessionMutation.mutateAsync(sessionId);
        setFeedback({ type: "success", message: "Session terminated." });
      },
    });
  };

  const handleLogoutOthers = () => {
    setConfirmDialog({
      open: true,
      title: "Log Out All Other Sessions?",
      description: "All connected devices except your current browser session will be immediately disconnected.",
      action: async () => {
        const msg = await logoutOtherMutation.mutateAsync();
        setFeedback({ type: "success", message: msg });
      },
    });
  };

  const getDeviceIcon = (type: string) => {
    if (type === "Mobile") return <Smartphone className="h-4 w-4 text-emerald-600" />;
    if (type === "Tablet") return <Tablet className="h-4 w-4 text-emerald-600" />;
    return <Monitor className="h-4 w-4 text-emerald-600" />;
  };

  return (
    <DashboardContent className="space-y-6">
      <Breadcrumb items={[{ label: "Admin" }, { label: "Security & Sessions" }]} />
      <PageHeader
        title="Security & Session Management"
        description="Monitor active administrator sessions, enforce security middleware, and review seller recovery requests."
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

      {/* Tabs */}
      <div className="flex flex-wrap items-center gap-1.5 border-b border-stone-200 pb-3 dark:border-stone-800">
        <button
          type="button"
          onClick={() => setActiveTab("sessions")}
          className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
            activeTab === "sessions"
              ? "bg-emerald-600 text-white shadow-sm"
              : "text-stone-600 hover:bg-stone-100 dark:text-stone-400 dark:hover:bg-stone-800"
          }`}
        >
          <Laptop className="h-3.5 w-3.5" />
          <span>Active Sessions</span>
          {sessionsQuery.data && (
            <span className="ml-1 rounded-full bg-emerald-950 px-1.5 py-0.2 text-[10px] text-white">
              {sessionsQuery.data.length}
            </span>
          )}
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("seller_queue")}
          className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
            activeTab === "seller_queue"
              ? "bg-emerald-600 text-white shadow-sm"
              : "text-stone-600 hover:bg-stone-100 dark:text-stone-400 dark:hover:bg-stone-800"
          }`}
        >
          <KeyRound className="h-3.5 w-3.5" />
          <span>Seller Recovery Queue</span>
          {pendingRequests.length > 0 && (
            <span className="ml-1 rounded-full bg-amber-500 px-1.5 py-0.2 text-[10px] text-white font-bold">
              {pendingRequests.length}
            </span>
          )}
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("policies")}
          className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
            activeTab === "policies"
              ? "bg-emerald-600 text-white shadow-sm"
              : "text-stone-600 hover:bg-stone-100 dark:text-stone-400 dark:hover:bg-stone-800"
          }`}
        >
          <ShieldCheck className="h-3.5 w-3.5" />
          <span>Security Controls & Policies</span>
        </button>
      </div>

      {/* TAB 1: ACTIVE SESSIONS */}
      {activeTab === "sessions" && (
        <div className="space-y-6">
          <DashboardCard
            title="Connected Devices & Active Sessions"
            description="Manage devices currently authenticated into this administrator account."
            actions={
              (sessionsQuery.data?.length ?? 0) > 1 ? (
                <Button
                  size="sm"
                  variant="outline"
                  disabled={logoutOtherMutation.isPending}
                  onClick={handleLogoutOthers}
                  className="text-xs text-rose-600 border-rose-200 hover:bg-rose-50 dark:border-rose-900/60 dark:text-rose-400 gap-1.5"
                >
                  <LogOut className="h-3.5 w-3.5" />
                  <span>Log Out All Other Sessions</span>
                </Button>
              ) : undefined
            }
          >
            {sessionsQuery.isLoading && <LoadingSkeleton rows={3} />}
            {sessionsQuery.isError && (
              <div className="rounded-xl border border-rose-200 bg-rose-50 p-4 text-xs text-rose-700">
                Failed to load active sessions.
              </div>
            )}

            {sessionsQuery.data && !sessionsQuery.isLoading && (
              <div className="divide-y divide-stone-100 dark:divide-stone-800">
                {sessionsQuery.data.map((session) => (
                  <div
                    key={session.sessionId}
                    className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 py-3.5"
                  >
                    <div className="flex items-start gap-3">
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-stone-100 dark:bg-stone-800">
                        {getDeviceIcon(session.deviceType)}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-stone-900 dark:text-stone-100">
                            {session.browser} on {session.os}
                          </span>
                          {session.isCurrent && (
                            <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                              Current Session
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-stone-500 font-mono mt-0.5">
                          IP: {session.ipAddress} · Logged in:{" "}
                          {new Date(session.createdAt).toLocaleDateString("en-IN", {
                            day: "numeric",
                            month: "short",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </p>
                      </div>
                    </div>

                    {!session.isCurrent && (
                      <Button
                        size="sm"
                        variant="outline"
                        disabled={revokeSessionMutation.isPending}
                        onClick={() => handleRevokeSingle(session.sessionId)}
                        className="text-xs h-8 text-rose-600 hover:bg-rose-50 dark:text-rose-400 self-start sm:self-auto"
                      >
                        Revoke
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </DashboardCard>
        </div>
      )}

      {/* TAB 2: SELLER PASSWORD RESET QUEUE */}
      {activeTab === "seller_queue" && (
        <div className="space-y-6">
          <DashboardCard
            title="Seller Account Recovery Queue"
            description="Pending seller password reset requests require explicit administrator verification before credentials are reset."
          >
            {sellerQueueQuery.isLoading ? <EmptyState title="Loading requests" description="Fetching seller requests." /> : null}
            {sellerQueueQuery.isError ? (
              <div className="rounded-lg border border-rose-200 bg-rose-50 p-4 text-xs text-rose-700">
                Unable to load password reset requests.
              </div>
            ) : null}

            {!sellerQueueQuery.isLoading && !sellerQueueQuery.isError && !pendingRequests.length ? (
              <EmptyState title="No pending recovery requests" description="Seller password reset requests will appear here for review." />
            ) : null}

            {pendingRequests.length > 0 && (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-stone-200 text-stone-500 dark:border-stone-800">
                      <th className="px-3 py-2.5 font-semibold">Seller</th>
                      <th className="px-3 py-2.5 font-semibold">Store</th>
                      <th className="px-3 py-2.5 font-semibold">Email</th>
                      <th className="px-3 py-2.5 font-semibold">Requested At</th>
                      <th className="px-3 py-2.5 font-semibold">Status</th>
                      <th className="px-3 py-2.5 font-semibold">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-100 dark:divide-stone-800">
                    {pendingRequests.map((req) => (
                      <tr key={req.id}>
                        <td className="px-3 py-3 font-semibold text-stone-900 dark:text-stone-100">{req.sellerName}</td>
                        <td className="px-3 py-3">
                          {req.storeName}{" "}
                          <span className="rounded bg-stone-100 px-1.5 py-0.5 text-[10px] capitalize dark:bg-stone-800">
                            {req.storeBadge}
                          </span>
                        </td>
                        <td className="px-3 py-3 font-mono">{req.email}</td>
                        <td className="px-3 py-3 text-stone-500">{new Date(req.createdAt).toLocaleString()}</td>
                        <td className="px-3 py-3">
                          <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold capitalize ${statusStyles[req.status]}`}>
                            {req.status}
                          </span>
                        </td>
                        <td className="px-3 py-3">
                          <Button size="sm" className="h-7 text-xs" onClick={() => setSelectedRequest(req)}>
                            Review
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </DashboardCard>

          {/* Seller Review Dialog */}
          {selectedRequest && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-stone-950/60 p-4" role="dialog" aria-modal="true">
              <div className="w-full max-w-lg rounded-2xl border border-stone-200 bg-white p-6 shadow-2xl dark:border-stone-800 dark:bg-stone-900">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h2 className="text-base font-bold text-stone-900 dark:text-stone-50">Review Password Reset Request</h2>
                    <p className="mt-1 text-xs text-stone-500">
                      {selectedRequest.sellerName} · {selectedRequest.storeName}
                    </p>
                  </div>
                  <button type="button" onClick={() => setSelectedRequest(null)} disabled={sellerMutation.isPending}>
                    <X className="h-5 w-5 text-stone-400" />
                  </button>
                </div>

                <div className="mt-4 space-y-2 text-xs border rounded-xl p-3 bg-stone-50/50 dark:border-stone-800 dark:bg-stone-950/50">
                  <p><strong>Email:</strong> {selectedRequest.email}</p>
                  <p><strong>Store ID:</strong> {selectedRequest.storeId}</p>
                  <p><strong>Badge:</strong> <span className="capitalize">{selectedRequest.storeBadge}</span></p>
                  <p><strong>Reason:</strong> {selectedRequest.reason || "No reason provided."}</p>
                  <p><strong>Requested:</strong> {new Date(selectedRequest.createdAt).toLocaleString()}</p>
                </div>

                <textarea
                  value={remarks}
                  onChange={(e) => setRemarks(e.target.value)}
                  maxLength={1000}
                  rows={3}
                  placeholder="Optional administrative review remarks..."
                  disabled={sellerMutation.isPending}
                  className="mt-4 w-full rounded-xl border border-stone-200 bg-white p-3 text-xs outline-none focus:border-emerald-500 dark:border-stone-700 dark:bg-stone-950"
                />

                <div className="mt-4 flex justify-end gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => sellerMutation.mutate({ id: selectedRequest.id, status: "rejected", remarks: remarks.trim() })}
                    disabled={sellerMutation.isPending}
                    className="text-xs"
                  >
                    Reject Request
                  </Button>
                  <Button
                    size="sm"
                    onClick={() => sellerMutation.mutate({ id: selectedRequest.id, status: "approved", remarks: remarks.trim() })}
                    disabled={sellerMutation.isPending}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs gap-1.5"
                  >
                    <Shield className="h-3.5 w-3.5" />
                    Approve Request
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 3: SECURITY POLICIES & STATUS */}
      {activeTab === "policies" && (
        <div className="space-y-6">
          {securityStatusQuery.data && (
            <div className="grid gap-4 sm:grid-cols-2">
              <DashboardCard
                title="Token Cryptography & Rotation"
                description="JWT access and refresh lifecycle safeguards."
              >
                <div className="space-y-2 text-xs">
                  <div className="flex justify-between py-1 border-b border-stone-100 dark:border-stone-800">
                    <span className="text-stone-500">Access Token Expiry:</span>
                    <span className="font-semibold text-emerald-600">{securityStatusQuery.data.jwtSecurity.accessTokenExpiry}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-stone-100 dark:border-stone-800">
                    <span className="text-stone-500">Refresh Token Expiry:</span>
                    <span className="font-semibold text-emerald-600">{securityStatusQuery.data.jwtSecurity.refreshTokenExpiry}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-stone-100 dark:border-stone-800">
                    <span className="text-stone-500">Algorithm:</span>
                    <span className="font-mono">{securityStatusQuery.data.jwtSecurity.algorithm}</span>
                  </div>
                  <div className="flex justify-between py-1">
                    <span className="text-stone-500">Token Rotation on Refresh:</span>
                    <span className="font-semibold text-emerald-600">Enabled</span>
                  </div>
                </div>
              </DashboardCard>

              <DashboardCard
                title="HTTP Defense Middleware"
                description="Active web application security layers."
              >
                <div className="space-y-2 text-xs">
                  <div className="flex justify-between py-1 border-b border-stone-100 dark:border-stone-800">
                    <span className="text-stone-500">Helmet Security Headers:</span>
                    <span className="font-semibold text-emerald-600">{securityStatusQuery.data.middlewareChecks.helmet.status}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-stone-100 dark:border-stone-800">
                    <span className="text-stone-500">Express Rate Limiting:</span>
                    <span className="font-semibold text-emerald-600">{securityStatusQuery.data.middlewareChecks.rateLimiter.status}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-stone-100 dark:border-stone-800">
                    <span className="text-stone-500">CORS Protection:</span>
                    <span className="font-semibold text-emerald-600">Origin Restricted</span>
                  </div>
                  <div className="flex justify-between py-1">
                    <span className="text-stone-500">HPP Query Tampering Guard:</span>
                    <span className="font-semibold text-emerald-600">Active</span>
                  </div>
                </div>
              </DashboardCard>
            </div>
          )}
        </div>
      )}

      {/* Confirmation Dialog */}
      <ConfirmDialog
        open={confirmDialog.open}
        title={confirmDialog.title}
        description={confirmDialog.description}
        onClose={() => setConfirmDialog((prev) => ({ ...prev, open: false }))}
        onConfirm={async () => {
          await confirmDialog.action();
          setConfirmDialog((prev) => ({ ...prev, open: false }));
        }}
      />
    </DashboardContent>
  );
}
