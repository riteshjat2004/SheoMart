"use client";

import { useQuery } from "@tanstack/react-query";
import { Clock3 } from "lucide-react";
import { SellerPasswordResetForm } from "@/components/security/SellerPasswordResetForm";
import { fetchSellerRecovery } from "@/services/seller-password-reset";

export function SellerSecurityRequestCard({ email, storeName }: { email: string; storeName: string }) {
  const query = useQuery({ queryKey: ["seller-password-reset-recovery", email], queryFn: () => fetchSellerRecovery(email), enabled: Boolean(email) });
  if (query.data?.latestRequest?.status === "pending") return <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800 dark:border-amber-900/70 dark:bg-amber-950/30 dark:text-amber-200"><p className="flex items-center gap-2 font-semibold"><Clock3 className="h-4 w-4" />Pending Review</p><p className="mt-2">Your request was submitted on {new Date(query.data.latestRequest.createdAt).toLocaleDateString()} and is awaiting administrator approval.</p></div>;
  const latest = query.data?.latestRequest;
  const statusMessage = latest?.status === "approved" ? "Your previous request was approved." : latest?.status === "rejected" ? `Your previous request was rejected.${latest.adminRemarks ? ` Admin remarks: ${latest.adminRemarks}` : ""}` : null;
  return <div className="space-y-4">{statusMessage ? <p className={`rounded-2xl border p-3 text-sm ${latest?.status === "approved" ? "border-emerald-200 bg-emerald-50 text-emerald-700" : "border-rose-200 bg-rose-50 text-rose-700"}`}>{statusMessage}</p> : null}<SellerPasswordResetForm email={email} storeName={storeName} onSuccess={() => query.refetch()} /></div>;
}