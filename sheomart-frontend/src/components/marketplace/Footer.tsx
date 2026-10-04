"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import {
  Smartphone,
  Mail,
  MapPin,
  Phone,
  ShieldCheck,
  CheckCircle2,
  ArrowRight,
  Heart,
  Sparkles,
  ArrowUp,
  Zap,
  Lock,
  Send,
  Crown,
  Store,
} from "lucide-react";
import { ANDROID_APP } from "@/constants/app";
import { Button } from "@/components/ui/button";

export function Footer() {
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !email.includes("@")) return;
    setSubscribed(true);
    setTimeout(() => {
      setEmail("");
      setSubscribed(false);
    }, 3500);
  };

  const scrollToTop = () => {
    if (typeof window !== "undefined") {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  return (
    <footer className="relative border-t border-stone-200/80 bg-[#FAF9F5] text-stone-600 transition-colors dark:border-stone-800/80 dark:bg-[#0c0d0e] dark:text-stone-300">
      {/* 1. Newsletter & Community Perks Section */}
      <div className="relative mx-auto max-w-7xl px-4 pt-12 sm:px-6 lg:px-8">
        <div className="relative isolate overflow-hidden rounded-[2rem] border border-emerald-200/80 bg-gradient-to-br from-white via-emerald-50/40 to-white p-7 sm:p-10 shadow-[0_20px_60px_-25px_rgba(16,185,129,0.18)] dark:border-emerald-900/60 dark:bg-gradient-to-br dark:from-stone-900/90 dark:via-stone-950 dark:to-stone-900/90 dark:shadow-[0_20px_60px_-25px_rgba(16,185,129,0.3)]">
          {/* Radial Ambient Glow */}
          <div className="pointer-events-none absolute -right-20 -top-24 -z-10 h-72 w-72 rounded-full bg-emerald-400/15 blur-3xl dark:bg-emerald-500/10" />
          <div className="pointer-events-none absolute -left-20 -bottom-24 -z-10 h-72 w-72 rounded-full bg-teal-400/15 blur-3xl dark:bg-teal-500/10" />

          <div className="flex flex-col gap-8 lg:flex-row lg:items-center lg:justify-between">
            <div className="max-w-xl">
              <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-300/80 bg-emerald-100/80 px-3 py-1 text-xs font-bold uppercase tracking-wider text-emerald-900 shadow-xs dark:border-emerald-700/60 dark:bg-emerald-950/60 dark:text-emerald-300">
                <Sparkles className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
                Community Updates &amp; Flash Deals
              </span>
              <h3 className="mt-3 text-2xl font-extrabold tracking-tight text-stone-900 sm:text-3xl dark:text-white">
                Fresh harvest updates, secret deals &amp; vouchers in your inbox
              </h3>
              <p className="mt-2 text-sm leading-6 text-stone-600 dark:text-stone-300">
                Join 5,000+ Sheopur residents getting seasonal discounts, local kirana specials, and zero-spam shopping updates every Friday.
              </p>
            </div>

            <div className="w-full max-w-md">
              <form onSubmit={handleSubscribe} className="relative flex flex-col gap-2.5 sm:flex-row">
                <div className="relative flex-1">
                  <Mail className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-400 dark:text-stone-500" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email address"
                    className="h-12 w-full rounded-2xl border border-stone-300/90 bg-white/95 pl-10 pr-4 text-sm text-stone-900 placeholder-stone-400 shadow-xs transition-all focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 dark:border-stone-700 dark:bg-stone-950/90 dark:text-white dark:placeholder-stone-500 dark:focus:border-emerald-400"
                  />
                </div>
                <Button
                  type="submit"
                  className="h-12 shrink-0 rounded-2xl bg-emerald-600 px-6 font-bold text-white shadow-md shadow-emerald-600/25 transition-all hover:bg-emerald-500 active:scale-[0.98] dark:bg-emerald-500 dark:hover:bg-emerald-400"
                >
                  {subscribed ? (
                    <span className="flex items-center gap-1.5">
                      <CheckCircle2 className="h-4 w-4 text-white" />
                      Subscribed!
                    </span>
                  ) : (
                    <span className="flex items-center gap-1.5">
                      <Send className="h-4 w-4" />
                      Subscribe
                    </span>
                  )}
                </Button>
              </form>

              {/* Newsletter Trust Badges */}
              <div className="mt-4 flex flex-wrap items-center gap-4 text-[11px] font-medium text-stone-500 dark:text-stone-400">
                <span className="flex items-center gap-1">
                  <Zap className="h-3 w-3 text-emerald-600 dark:text-emerald-400" /> Instant Welcome Coupon
                </span>
                <span className="flex items-center gap-1">
                  <Lock className="h-3 w-3 text-emerald-600 dark:text-emerald-400" /> Zero Spam Guarantee
                </span>
                <span className="flex items-center gap-1">
                  <CheckCircle2 className="h-3 w-3 text-emerald-600 dark:text-emerald-400" /> One-Click Unsubscribe
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Main 5-Column Navigation Grid */}
      <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 gap-8 md:grid-cols-3 lg:grid-cols-5">
          {/* Col 1: Brand Info & Local Contact */}
          <div className="col-span-2 md:col-span-3 lg:col-span-1 space-y-4">
            <Link href="/" className="inline-flex items-center gap-2.5 group">
              <Image
                src="/logo/appicon.png"
                alt="SheoMart Logo"
                width={40}
                height={40}
                className="h-10 w-10 rounded-full object-contain shadow-md shadow-emerald-500/20 transition-transform group-hover:scale-105"
                unoptimized
              />
              <div className="flex flex-col">
                <span className="text-2xl font-black tracking-tight text-stone-900 dark:text-white">
                  SheoMart
                </span>
                <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-emerald-700 dark:text-emerald-400">
                  Hyperlocal Market
                </span>
              </div>
            </Link>

            <p className="text-xs leading-relaxed text-stone-600 dark:text-stone-400">
              Sheopur's trusted neighborhood grocery and daily essentials marketplace. Connecting local families with verified kirana stores, fresh vegetable vendors, and artisan sellers.
            </p>

            <div className="space-y-2.5 pt-2 text-xs text-stone-600 dark:text-stone-400">
              <div className="flex items-center gap-2.5">
                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400">
                  <MapPin className="h-3.5 w-3.5" />
                </div>
                <span>Serving Sheopur City &amp; Surrounding Sectors</span>
              </div>

              <div className="flex items-center gap-2.5">
                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400">
                  <Phone className="h-3.5 w-3.5" />
                </div>
                <span>+91 98765 43210 (10 AM – 8 PM)</span>
              </div>

              <div className="flex items-center gap-2.5">
                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400">
                  <Mail className="h-3.5 w-3.5" />
                </div>
                <span>support@sheomart.com</span>
              </div>
            </div>

            {/* Social Links Strip */}
            <div className="pt-2">
              <p className="text-[11px] font-bold uppercase tracking-wider text-stone-500 dark:text-stone-400">
                Connect With Us
              </p>
              <div className="mt-2 flex items-center gap-2">
                {/* WhatsApp */}
                <a
                  href="https://wa.me/?text=Hello%20SheoMart%2C%20I%20have%20an%20inquiry."
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="SheoMart WhatsApp"
                  className="flex h-8 w-8 items-center justify-center rounded-xl border border-stone-200 bg-white text-stone-600 shadow-xs transition-all hover:border-emerald-400 hover:bg-emerald-50 hover:text-emerald-700 dark:border-stone-800 dark:bg-stone-900 dark:text-stone-400 dark:hover:border-emerald-500 dark:hover:bg-emerald-950/40 dark:hover:text-emerald-300"
                >
                  <svg className="h-4 w-4 fill-current" viewBox="0 0 24 24">
                    <path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.019 3.287l-.582 2.128 2.182-.573c.978.58 1.911.928 3.145.929 3.178 0 5.767-2.587 5.768-5.766.001-3.187-2.575-5.77-5.764-5.771zm3.392 8.244c-.144.405-.837.774-1.17.824-.312.045-.634.053-1.026-.062-.315-.093-.728-.242-1.306-.492-2.454-1.06-4.059-3.551-4.18-3.714-.124-.162-.991-1.32-.991-2.518 0-1.198.624-1.786.847-2.028.223-.242.484-.303.646-.303.162 0 .324.003.465.01.148.008.351-.057.55.419.202.484.69 1.682.75 1.803.061.121.101.263.02.424-.081.162-.121.263-.242.404-.121.142-.254.316-.364.425-.121.121-.247.253-.106.495.141.242.627 1.034 1.343 1.672.923.821 1.701 1.074 1.943 1.196.242.121.384.101.525-.061.142-.162.607-.707.768-.95.162-.243.324-.202.546-.121.222.081 1.414.667 1.657.788.242.121.404.182.465.283.061.101.061.586-.083.991zM12 2C6.477 2 2 6.477 2 12c0 1.89.525 3.66 1.438 5.168L2.344 21.656l4.636-1.054A9.957 9.957 0 0 0 12 22c5.523 0 10-4.477 10-10S17.523 2 12 2zm0 18c-1.637 0-3.155-.494-4.421-1.34l-.317-.212-2.735.622.637-2.668-.232-.338C4.015 14.773 3.5 13.435 3.5 12c0-4.687 3.813-8.5 8.5-8.5s8.5 3.813 8.5 8.5-3.813 8.5-8.5 8.5z"/>
                  </svg>
                </a>

                {/* Instagram */}
                <a
                  href="https://instagram.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="SheoMart Instagram"
                  className="flex h-8 w-8 items-center justify-center rounded-xl border border-stone-200 bg-white text-stone-600 shadow-xs transition-all hover:border-emerald-400 hover:bg-emerald-50 hover:text-emerald-700 dark:border-stone-800 dark:bg-stone-900 dark:text-stone-400 dark:hover:border-emerald-500 dark:hover:bg-emerald-950/40 dark:hover:text-emerald-300"
                >
                  <svg className="h-4 w-4 fill-current" viewBox="0 0 24 24">
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                  </svg>
                </a>

                {/* Twitter / X */}
                <a
                  href="https://x.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="SheoMart X"
                  className="flex h-8 w-8 items-center justify-center rounded-xl border border-stone-200 bg-white text-stone-600 shadow-xs transition-all hover:border-emerald-400 hover:bg-emerald-50 hover:text-emerald-700 dark:border-stone-800 dark:bg-stone-900 dark:text-stone-400 dark:hover:border-emerald-500 dark:hover:bg-emerald-950/40 dark:hover:text-emerald-300"
                >
                  <svg className="h-3.5 w-3.5 fill-current" viewBox="0 0 24 24">
                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                  </svg>
                </a>

                {/* Facebook */}
                <a
                  href="https://facebook.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="SheoMart Facebook"
                  className="flex h-8 w-8 items-center justify-center rounded-xl border border-stone-200 bg-white text-stone-600 shadow-xs transition-all hover:border-emerald-400 hover:bg-emerald-50 hover:text-emerald-700 dark:border-stone-800 dark:bg-stone-900 dark:text-stone-400 dark:hover:border-emerald-500 dark:hover:bg-emerald-950/40 dark:hover:text-emerald-300"
                >
                  <svg className="h-4 w-4 fill-current" viewBox="0 0 24 24">
                    <path d="M9 8H6v4h3v12h5V12h3.642L18 8h-4V6.333C14 5.374 14.5 5 15.6 5H18V0h-3.808C10.595 0 9 1.583 9 4.615V8z"/>
                  </svg>
                </a>
              </div>
            </div>
          </div>

          {/* Col 2: Shop Fresh Departments */}
          <div className="space-y-3.5">
            <p className="text-xs font-bold uppercase tracking-wider text-stone-900 dark:text-white">
              Fresh Departments
            </p>
            <ul className="space-y-2.5 text-xs text-stone-600 dark:text-stone-400">
              <li>
                <Link href="/explore?category=vegetables" className="hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors">
                  Fresh Vegetables &amp; Greens
                </Link>
              </li>
              <li>
                <Link href="/explore?category=fruits" className="hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors">
                  Seasonal &amp; Fresh Fruits
                </Link>
              </li>
              <li>
                <Link href="/explore?category=dairy" className="hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors">
                  Farm Dairy, Milk &amp; Paneer
                </Link>
              </li>
              <li>
                <Link href="/explore?category=staples" className="hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors">
                  Atta, Rice, Dal &amp; Spices
                </Link>
              </li>
              <li>
                <Link href="/explore?category=snacks" className="hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors">
                  Namkeen, Sweets &amp; Biscuits
                </Link>
              </li>
              <li>
                <Link href="/explore?category=beverages" className="hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors">
                  Cold Drinks, Juices &amp; Tea
                </Link>
              </li>
              <li>
                <Link href="/categories" className="inline-flex items-center gap-1 font-semibold text-emerald-700 dark:text-emerald-400 hover:underline">
                  All 12 Departments <ArrowRight className="h-3 w-3" />
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 3: Explore Marketplace */}
          <div className="space-y-3.5">
            <p className="text-xs font-bold uppercase tracking-wider text-stone-900 dark:text-white">
              Marketplace
            </p>
            <ul className="space-y-2.5 text-xs text-stone-600 dark:text-stone-400">
              <li>
                <Link href="/explore" className="hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors">
                  All Catalog Groceries
                </Link>
              </li>
              <li>
                <Link href="/stores" className="hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors flex items-center gap-1.5">
                  <ShieldCheck className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
                  Verified Stores
                </Link>
              </li>
              <li>
                <Link href="/stores" className="hover:text-amber-600 dark:hover:text-amber-400 transition-colors flex items-center gap-1.5">
                  <Crown className="h-3.5 w-3.5 text-amber-500" />
                  Royal Flagship Stores
                </Link>
              </li>
              <li>
                <Link href="/offers" className="hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors">
                  Flash Deals &amp; Discounts
                </Link>
              </li>
              <li>
                <Link href="/coupons" className="hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors">
                  Vouchers &amp; Coupon Wallet
                </Link>
              </li>
              <li>
                <Link href="/about" className="hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors">
                  Our Sheopur Story
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 4: For Merchants & Partners */}
          <div className="space-y-3.5">
            <p className="text-xs font-bold uppercase tracking-wider text-stone-900 dark:text-white">
              Merchant Hub
            </p>
            <ul className="space-y-2.5 text-xs text-stone-600 dark:text-stone-400">
              <li>
                <Link
                  href="/become-seller"
                  className="inline-flex items-center gap-1.5 font-bold text-emerald-700 hover:text-emerald-800 dark:text-emerald-400 dark:hover:text-emerald-300 transition-colors"
                >
                  <Store className="h-3.5 w-3.5" />
                  Register Your Store <ArrowRight className="h-3 w-3" />
                </Link>
              </li>
              <li>
                <Link href="/store" className="hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors">
                  Merchant Dashboard
                </Link>
              </li>
              <li>
                <Link href="/store/inventory" className="hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors">
                  POS &amp; Real-Time Inventory
                </Link>
              </li>
              <li>
                <Link href="/store/orders" className="hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors">
                  Order Management
                </Link>
              </li>
              <li>
                <Link href="/store/coupons" className="hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors">
                  Store Promo Codes
                </Link>
              </li>
              <li>
                <Link href="/about" className="hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors">
                  Seller Code of Excellence
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 5: Help & Policies */}
          <div className="space-y-3.5">
            <p className="text-xs font-bold uppercase tracking-wider text-stone-900 dark:text-white">
              Customer Care
            </p>
            <ul className="space-y-2.5 text-xs text-stone-600 dark:text-stone-400">
              <li>
                <Link href="/support" className="hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors font-medium">
                  Help &amp; Support Desk
                </Link>
              </li>
              <li>
                <Link href="/orders" className="hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors">
                  Track Your Orders
                </Link>
              </li>
              <li>
                <Link href="/addresses" className="hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors">
                  Manage Delivery Addresses
                </Link>
              </li>
              <li>
                <Link href="/privacy" className="hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/terms" className="hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors">
                  Terms of Service &amp; Refunds
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* 3. App Download & Payment Security Strip */}
        <div className="mt-14 flex flex-col gap-6 rounded-2xl border border-stone-200/90 bg-white/70 p-5 backdrop-blur-xs dark:border-stone-800/80 dark:bg-stone-900/40 lg:flex-row lg:items-center lg:justify-between">
          {/* App download link */}
          <div className="flex flex-wrap items-center gap-3">
            <span className="text-xs font-bold text-stone-800 dark:text-stone-200">
              Shop On Mobile:
            </span>
            <a
              href={ANDROID_APP.DOWNLOAD_PATH}
              download={`SheoMart-v${ANDROID_APP.VERSION}-beta.apk`}
              className="inline-flex items-center gap-2 rounded-xl border border-emerald-300 bg-emerald-50 px-3.5 py-1.5 text-xs font-bold text-emerald-900 shadow-xs transition hover:border-emerald-500 hover:bg-emerald-100 dark:border-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 dark:hover:bg-emerald-900/60"
            >
              <Smartphone className="h-4 w-4 text-emerald-700 dark:text-emerald-400" />
              Download Android APK (v{ANDROID_APP.VERSION})
            </a>
            <span className="rounded-xl border border-stone-200 bg-white/90 px-3 py-1.5 text-xs font-medium text-stone-500 shadow-2xs dark:border-stone-800 dark:bg-stone-900/70 dark:text-stone-400">
              Google Play • Verification in Progress
            </span>
          </div>

          {/* Payment Badges */}
          <div className="flex flex-wrap items-center gap-2.5 text-xs font-medium text-stone-600 dark:text-stone-400">
            <div className="flex items-center gap-1.5 rounded-lg border border-stone-200/80 bg-white px-2.5 py-1 text-[11px] shadow-2xs dark:border-stone-800 dark:bg-stone-900">
              <ShieldCheck className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
              <span>256-bit SSL Protected</span>
            </div>
            <div className="flex items-center gap-1.5 rounded-lg border border-stone-200/80 bg-white px-2.5 py-1 text-[11px] shadow-2xs dark:border-stone-800 dark:bg-stone-900">
              <Zap className="h-3.5 w-3.5 text-amber-500" />
              <span>Instant UPI &amp; Cards</span>
            </div>
            <div className="flex items-center gap-1.5 rounded-lg border border-stone-200/80 bg-white px-2.5 py-1 text-[11px] shadow-2xs dark:border-stone-800 dark:bg-stone-900">
              <span>Cash on Delivery</span>
            </div>
          </div>
        </div>

        {/* 4. Bottom Copyright & Back to Top */}
        <div className="mt-8 flex flex-col items-center justify-between gap-4 border-t border-stone-200/80 pt-6 text-xs text-stone-500 dark:border-stone-800/80 dark:text-stone-400 sm:flex-row">
          <p>© {new Date().getFullYear()} SheoMart Marketplace. All rights reserved.</p>

          <p className="flex items-center gap-1.5 font-medium">
            Crafted with <Heart className="h-3.5 w-3.5 fill-rose-500 text-rose-500" /> for Sheopur's neighborhood economy.
          </p>

          <button
            type="button"
            onClick={scrollToTop}
            className="inline-flex items-center gap-1.5 rounded-full border border-stone-200 bg-white px-3 py-1.5 text-xs font-semibold text-stone-700 shadow-2xs transition hover:border-emerald-300 hover:text-emerald-700 dark:border-stone-800 dark:bg-stone-900 dark:text-stone-300 dark:hover:border-emerald-600 dark:hover:text-emerald-300"
          >
            <span>Back to top</span>
            <ArrowUp className="h-3 w-3" />
          </button>
        </div>
      </div>
    </footer>
  );
}
