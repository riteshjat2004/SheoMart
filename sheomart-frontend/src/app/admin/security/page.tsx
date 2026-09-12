"use client";

import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { LoaderCircle, Shield, X } from "lucide-react";
import { Breadcrumb } from "@/components/dashboard/layout/Breadcrumb";
import { DashboardContent } from "@/components/dashboard/layout/DashboardContent";
import { PageHeader } from "@/components/dashboard/layout/PageHeader";
import { DashboardCard } from "@/components/dashboard/DashboardCard";
import { EmptyState } from "@/components/dashboard/EmptyState";
import { Button } from "@/components/ui/button";
import { approveSellerPasswordReset, fetchSellerPasswordResetRequests, rejectSellerPasswordReset, type SellerPasswordResetRequest } from "@/services/seller-password-reset";

const statusStyles = { pending: "bg-amber-100 text-amber-800 dark:bg-amber-950/50 dark:text-amber-200", approved: "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-200", rejected: "bg-rose-100 text-rose-800 dark:bg-rose-950/50 dark:text-rose-200" };

export default function AdminSecurityPage() {
  const queryClient = useQueryClient();
  const [selected, setSelected] = useState<SellerPasswordResetRequest | null>(null);
  const [remarks, setRemarks] = useState("");
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; message: string } | null>(null);
  const query = useQuery({ queryKey: ["seller-password-reset-requests"], queryFn: fetchSellerPasswordResetRequests });
  const mutation = useMutation({
    mutationFn: ({ id, status, remarks }: { id: string; status: "approved" | "rejected"; remarks: string }) => status === "approved" ? approveSellerPasswordReset(id, remarks) : rejectSellerPasswordReset(id, remarks),
    onSuccess: (_result, variables) => {
      setFeedback({ type: "success", message: `Password reset request ${variables.status}.` });
      setSelected(null);
      setRemarks("");
      queryClient.setQueryData<SellerPasswordResetRequest[]>(["seller-password-reset-requests"], (requests = []) => requests.filter((request) => request.id !== variables.id));
      void queryClient.invalidateQueries({ queryKey: ["seller-password-reset-requests"] });
    },
    onError: (error: Error & { status?: number; details?: { stage?: string } }) => {
      const statusLabel = error.status ? ` (${error.status})` : "";
      const stageLabel = error.details?.stage ? ` [${error.details.stage}]` : "";
      setFeedback({ type: "error", message: `${error.message || "Unable to process the password reset request."}${statusLabel}${stageLabel}` });
    },
  });
  const pending = (query.data ?? []).filter((request) => request.status === "pending");

  const review = (status: "approved" | "rejected") => {
    if (!selected?.id || mutation.isPending) return;
    mutation.mutate({ id: selected.id, status, remarks: remarks.trim() });
  };

  return <DashboardContent className="space-y-6"><Breadcrumb items={[{ label: "Admin" }, { label: "Security" }]} /><PageHeader title="Password reset requests" description="Review seller password reset requests and record every approval decision." />
    {feedback ? <div className={`rounded-lg border p-3 text-sm ${feedback.type === "success" ? "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900/70 dark:bg-emerald-950/40 dark:text-emerald-300" : "border-rose-200 bg-rose-50 text-rose-700 dark:border-rose-900/70 dark:bg-rose-950/40 dark:text-rose-300"}`} role={feedback.type === "error" ? "alert" : "status"}>{feedback.message}</div> : null}
    <DashboardCard title="Seller recovery queue" description="Pending requests are shown newest first.">
      {query.isLoading ? <EmptyState title="Loading requests" description="Fetching seller security requests." /> : null}
      {query.isError ? <div className="rounded-lg border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">Unable to load password reset requests.</div> : null}
      {!query.isLoading && !query.isError && !pending.length ? <EmptyState title="No pending requests" description="Seller password reset requests will appear here for review." /> : null}
      {pending.length ? <div className="overflow-x-auto"><table className="w-full min-w-[760px] text-left text-sm"><thead><tr className="border-b border-stone-200 text-xs uppercase tracking-[0.12em] text-stone-500 dark:border-stone-800"><th className="px-3 py-3">Seller</th><th className="px-3 py-3">Store</th><th className="px-3 py-3">Email</th><th className="px-3 py-3">Requested</th><th className="px-3 py-3">Status</th><th className="px-3 py-3">Action</th></tr></thead><tbody>{pending.map((request) => <tr key={request.id} className="border-b border-stone-100 dark:border-stone-800/70"><td className="px-3 py-4 font-medium text-stone-900 dark:text-stone-100">{request.sellerName}</td><td className="px-3 py-4">{request.storeName}<span className="ml-2 rounded-full bg-stone-100 px-2 py-1 text-[10px] capitalize dark:bg-stone-800">{request.storeBadge}</span></td><td className="px-3 py-4">{request.email}</td><td className="px-3 py-4">{new Date(request.createdAt).toLocaleString()}</td><td className="px-3 py-4"><span className={`rounded-full px-2.5 py-1 text-xs font-semibold capitalize ${statusStyles[request.status]}`}>{request.status}</span></td><td className="px-3 py-4"><Button type="button" size="sm" onClick={() => setSelected(request)}>Review</Button></td></tr>)}</tbody></table></div> : null}
    </DashboardCard>
    {selected ? <div className="fixed inset-0 z-50 flex items-center justify-center bg-stone-950/60 p-4" role="dialog" aria-modal="true"><div className="w-full max-w-lg rounded-2xl border border-stone-200 bg-white p-6 shadow-2xl dark:border-stone-800 dark:bg-stone-900"><div className="flex items-start justify-between gap-4"><div><h2 className="text-lg font-semibold text-stone-900 dark:text-stone-50">Review password reset</h2><p className="mt-1 text-sm text-stone-500">{selected.sellerName} · {selected.storeName}</p></div><button type="button" onClick={() => setSelected(null)} aria-label="Close review" disabled={mutation.isPending}><X className="h-5 w-5" /></button></div><div className="mt-5 space-y-3 text-sm"><p><strong>Email:</strong> {selected.email}</p><p><strong>Store ID:</strong> {selected.storeId}</p><p><strong>Badge:</strong> <span className="capitalize">{selected.storeBadge}</span></p><p><strong>Reason:</strong> {selected.reason || "No reason provided."}</p><p><strong>Requested:</strong> {new Date(selected.createdAt).toLocaleString()}</p></div><textarea value={remarks} onChange={(event) => setRemarks(event.target.value)} maxLength={1000} rows={4} placeholder="Optional admin remarks" disabled={mutation.isPending} className="mt-5 w-full rounded-xl border border-stone-200 bg-white p-3 text-sm outline-none focus:border-emerald-500 dark:border-stone-700 dark:bg-stone-950" /><div className="mt-5 flex justify-end gap-2"><Button type="button" variant="outline" onClick={() => review("rejected")} disabled={mutation.isPending}>{mutation.isPending && mutation.variables?.status === "rejected" ? <LoaderCircle className="h-4 w-4 animate-spin" /> : null}Reject</Button><Button type="button" onClick={() => review("approved")} disabled={mutation.isPending}>{mutation.isPending && mutation.variables?.status === "approved" ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <Shield className="h-4 w-4" />}Approve</Button></div></div></div> : null}
  </DashboardContent>;
}
