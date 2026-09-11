"use client";

import Image from "next/image";
import { Share2, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { verifiedTheme } from "@/themes/verifiedTheme";
import type { StoreItem } from "@/types/marketplace";
import { useEffect, useState } from "react";

export function VerifiedStickyBar({ store }: { store: StoreItem }) {
  const [visible, setVisible] = useState(false);
  const storeName = store.storeName ?? store.name ?? "Store";

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 460);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const shareStore = async () => {
    if (navigator.share) {
      await navigator.share({ title: storeName, url: window.location.href });
    } else {
      await navigator.clipboard?.writeText(window.location.href);
    }
  };

  return <div className={`fixed inset-x-0 top-0 z-50 border-b border-emerald-900/40 bg-slate-950/95 px-4 py-3 shadow-lg backdrop-blur-xl transition duration-300 motion-reduce:transition-none ${visible ? "translate-y-0 opacity-100" : "pointer-events-none -translate-y-full opacity-0"}`} aria-hidden={!visible}><div className="mx-auto flex max-w-7xl items-center gap-3"><div className="flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-full border-2 border-white bg-emerald-100 text-sm font-bold text-emerald-800">{store.logo ? <Image src={store.logo} alt="" width={36} height={36} className="h-full w-full object-cover" /> : storeName.charAt(0)}</div><div className="min-w-0 flex-1"><p className="truncate text-sm font-semibold text-white">{storeName}</p><p className="flex items-center gap-1 text-[11px] text-emerald-200"><ShieldCheck className="h-3 w-3" /> Verified Store</p></div><Button type="button" className={`hidden min-h-10 sm:inline-flex ${verifiedTheme.primaryButton} ${verifiedTheme.focus}`}>Follow Store</Button><Button type="button" onClick={shareStore} variant="outline" size="icon" aria-label={`Share ${storeName}`} className={`${verifiedTheme.secondaryButton} ${verifiedTheme.focus}`}><Share2 className="h-4 w-4" /></Button></div></div>;
}