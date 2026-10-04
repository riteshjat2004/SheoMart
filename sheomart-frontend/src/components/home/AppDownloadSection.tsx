"use client";

import Link from "next/link";
import { Smartphone, Check, Clock3, ArrowRight, ShieldCheck, Download, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ANDROID_APP } from "@/constants/app";
import { trackEvent } from "@/lib/analytics";

export function AppDownloadSection() {
  return (
    <section className="relative overflow-hidden rounded-[2.5rem] border border-emerald-200/80 bg-gradient-to-br from-emerald-50 via-teal-50/40 to-stone-50 p-6 sm:p-10 lg:p-12 shadow-sm dark:border-emerald-500/30 dark:bg-gradient-to-br dark:from-emerald-950/80 dark:via-stone-900 dark:to-stone-950 dark:shadow-2xl">
      {/* Background radial glow */}
      <div className="pointer-events-none absolute -right-24 -bottom-24 h-96 w-96 rounded-full bg-emerald-500/10 blur-3xl dark:bg-emerald-500/15" />

      <div className="relative grid gap-10 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
        {/* Left Column: Headline, Features, Download Buttons */}
        <div className="space-y-6">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/20 bg-emerald-100/70 px-3.5 py-1 text-xs font-semibold uppercase tracking-wider text-emerald-800 dark:border-emerald-500/40 dark:bg-emerald-950/80 dark:text-emerald-300">
              <Sparkles className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
              Android Beta v{ANDROID_APP.VERSION}
            </span>
          </div>

          <h2 className="text-3xl font-extrabold tracking-tight text-stone-900 sm:text-4xl lg:text-5xl leading-tight dark:text-white">
            Order fresh groceries in seconds from our{" "}
            <span className="bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent dark:from-emerald-400 dark:to-teal-300">
              Android App
            </span>.
          </h2>

          <p className="text-sm sm:text-base leading-relaxed text-stone-600 dark:text-stone-300">
            Enjoy 1-tap reordering, real-time push notifications for order delivery, and exclusive app-only grocery discounts designed for Sheopur shoppers.
          </p>

          {/* Features Comparison Columns */}
          <div className="grid grid-cols-1 gap-4 border-t border-stone-200 pt-5 sm:grid-cols-2 text-xs dark:border-stone-800">
            <div className="space-y-2.5">
              <p className="font-bold uppercase tracking-wider text-emerald-700 text-[11px] dark:text-emerald-300">
                Available Right Now
              </p>
              <ul className="space-y-2 text-stone-700 dark:text-stone-300">
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 shrink-0 text-emerald-600 dark:text-emerald-400" />
                  <span>Secure Phone OTP & Password Login</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 shrink-0 text-emerald-600 dark:text-emerald-400" />
                  <span>Explore 50+ Local Sheopur Stores</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 shrink-0 text-emerald-600 dark:text-emerald-400" />
                  <span>Browse 10,000+ Fresh Products</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 shrink-0 text-emerald-600 dark:text-emerald-400" />
                  <span>Live Delivery Status Tracking</span>
                </li>
              </ul>
            </div>

            <div className="space-y-2.5">
              <p className="font-bold uppercase tracking-wider text-amber-700 text-[11px] dark:text-amber-300">
                Coming in Next Update
              </p>
              <ul className="space-y-2 text-stone-500 dark:text-stone-400">
                <li className="flex items-center gap-2">
                  <Clock3 className="h-4 w-4 shrink-0 text-amber-600 dark:text-amber-400" />
                  <span>Integrated Voice Search</span>
                </li>
                <li className="flex items-center gap-2">
                  <Clock3 className="h-4 w-4 shrink-0 text-amber-600 dark:text-amber-400" />
                  <span>1-Tap Monthly Kirana Reorder</span>
                </li>
                <li className="flex items-center gap-2">
                  <Clock3 className="h-4 w-4 shrink-0 text-amber-600 dark:text-amber-400" />
                  <span>Direct Chat with Store Merchant</span>
                </li>
                <li className="flex items-center gap-2">
                  <Clock3 className="h-4 w-4 shrink-0 text-amber-600 dark:text-amber-400" />
                  <span>Google Play Store Listing</span>
                </li>
              </ul>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex flex-wrap items-center gap-3 pt-2">
            <a
              href={ANDROID_APP.DOWNLOAD_PATH}
              download={`SheoMart-v${ANDROID_APP.VERSION}-beta.apk`}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => {
                trackEvent("app_download_clicked", {
                  platform: "android",
                  version: ANDROID_APP.VERSION,
                  source: "homepage_app_section",
                });
              }}
            >
              <Button size="lg" className="rounded-2xl bg-emerald-600 font-bold text-white hover:bg-emerald-500 shadow-md dark:bg-emerald-500 dark:text-stone-950 dark:hover:bg-emerald-400 dark:shadow-lg">
                <Download className="mr-2 h-5 w-5" />
                Download Android APK
              </Button>
            </a>

            <div className="rounded-2xl border border-stone-200 bg-white/90 px-4 py-2.5 text-xs text-stone-600 shadow-xs dark:border-stone-700 dark:bg-stone-900/80 dark:text-stone-400">
              <p className="font-semibold text-stone-900 dark:text-white">Google Play Store</p>
              <p className="text-[11px] text-emerald-600 dark:text-emerald-400">Coming Soon</p>
            </div>
          </div>
        </div>

        {/* Right Column: Smartphone UI Mockup */}
        <div className="relative mx-auto flex items-center justify-center">
          <div className="relative w-64 sm:w-72 rounded-[3rem] border-4 border-stone-300 bg-stone-100 p-3 shadow-xl dark:border-stone-700 dark:bg-stone-900 dark:shadow-2xl">
            {/* Screen inner container */}
            <div className="relative overflow-hidden rounded-[2.25rem] border border-stone-200 bg-white p-4 space-y-4 dark:border-stone-800 dark:bg-stone-950">
              {/* Phone Speaker Notch */}
              <div className="mx-auto h-4 w-28 rounded-full bg-stone-300 dark:bg-stone-800" />

              {/* Mock App Header */}
              <div className="flex items-center justify-between border-b border-stone-200 pb-3 dark:border-stone-800">
                <div className="flex items-center gap-1.5">
                  <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-emerald-600 text-xs font-black text-white dark:bg-emerald-500 dark:text-stone-950">
                    S
                  </span>
                  <span className="text-xs font-bold text-stone-900 dark:text-white">SheoMart</span>
                </div>
                <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-300">
                  ⚡ 15 Mins
                </span>
              </div>

              {/* Mock Banner */}
              <div className="rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 p-3 text-white space-y-1">
                <p className="text-[10px] font-semibold uppercase tracking-wider text-emerald-100">Daily Fresh</p>
                <p className="text-xs font-bold leading-tight">Farm Vegetables at Mandi Prices</p>
              </div>

              {/* Mock Product Items */}
              <div className="space-y-2">
                <p className="text-[11px] font-bold text-stone-700 dark:text-stone-300">Popular Today</p>
                <div className="grid grid-cols-2 gap-2 text-[10px]">
                  <div className="rounded-xl border border-stone-200 bg-stone-50 p-2 space-y-1 dark:border-stone-800 dark:bg-stone-900">
                    <span className="text-base">🥦</span>
                    <p className="font-semibold text-stone-900 truncate dark:text-white">Fresh Broccoli</p>
                    <p className="text-emerald-600 font-bold dark:text-emerald-400">₹40</p>
                  </div>
                  <div className="rounded-xl border border-stone-200 bg-stone-50 p-2 space-y-1 dark:border-stone-800 dark:bg-stone-900">
                    <span className="text-base">🥛</span>
                    <p className="font-semibold text-stone-900 truncate dark:text-white">Amul Taaza 1L</p>
                    <p className="text-emerald-600 font-bold dark:text-emerald-400">₹54</p>
                  </div>
                </div>
              </div>

              {/* Mock Checkout CTA */}
              <div className="rounded-xl bg-emerald-600 p-2.5 text-center text-xs font-bold text-white shadow-sm hover:bg-emerald-500">
                Fast Doorstep Delivery
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
