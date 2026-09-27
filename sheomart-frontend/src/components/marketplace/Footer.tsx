"use client";

import Link from "next/link";
import { useState } from "react";
import {
  Smartphone,
  Mail,
  MapPin,
  Phone,
  ShieldCheck,
  CheckCircle,
  ArrowRight,
  Heart,
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
    }, 3000);
  };

  return (
    <footer className="border-t border-stone-800 bg-stone-950 text-stone-300">
      {/* Newsletter & Community Updates Strip */}
      <div className="border-b border-stone-850 bg-stone-900/60 py-8 px-4 sm:px-6 lg:px-8">
        <div className="mx-auto flex max-w-7xl flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="max-w-xl">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">
              Stay in the loop
            </span>
            <h3 className="mt-1 text-xl sm:text-2xl font-bold text-white">
              Get fresh produce updates & seasonal deals in your inbox
            </h3>
            <p className="mt-1.5 text-xs text-stone-400">
              Zero spam. Only weekly specials, fresh harvest announcements, and exclusive discount codes.
            </p>
          </div>

          <form onSubmit={handleSubscribe} className="flex w-full max-w-md gap-2">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email address"
              className="w-full rounded-xl border border-stone-700 bg-stone-950 px-4 py-2.5 text-sm text-white placeholder-stone-400 focus:border-emerald-500 focus:outline-none"
            />
            <Button
              type="submit"
              className="shrink-0 rounded-xl bg-emerald-600 px-5 font-semibold text-white hover:bg-emerald-500"
            >
              {subscribed ? "Subscribed! ✨" : "Subscribe"}
            </Button>
          </form>
        </div>
      </div>

      {/* Main 5-Column Navigation Grid */}
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 gap-8 md:grid-cols-3 lg:grid-cols-5">
          {/* Col 1: Brand Info */}
          <div className="col-span-2 md:col-span-3 lg:col-span-1 space-y-4">
            <div className="flex items-center gap-2">
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-600 text-lg font-black text-white">
                S
              </span>
              <span className="text-xl font-extrabold tracking-tight text-white">
                SheoMart
              </span>
            </div>
            <p className="text-xs leading-relaxed text-stone-400">
              Sheopur’s own hyper-local grocery platform. Fresh groceries from your trusted local stores delivered to your doorstep in 15–30 minutes.
            </p>
            <div className="space-y-2 text-xs text-stone-400 pt-1">
              <div className="flex items-center gap-2">
                <MapPin className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
                <span>Sheopur, Madhya Pradesh • 476337</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
                <span>+91 98765 43210</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
                <span>support@sheomart.com</span>
              </div>
            </div>
          </div>

          {/* Col 2: Shop Categories */}
          <div className="space-y-3">
            <p className="text-xs font-bold uppercase tracking-wider text-white">Shop Categories</p>
            <ul className="space-y-2 text-xs text-stone-400">
              <li>
                <Link href="/explore?category=vegetables" className="hover:text-emerald-400 transition-colors">
                  Fresh Vegetables
                </Link>
              </li>
              <li>
                <Link href="/explore?category=fruits" className="hover:text-emerald-400 transition-colors">
                  Juicy Fruits
                </Link>
              </li>
              <li>
                <Link href="/explore?category=dairy" className="hover:text-emerald-400 transition-colors">
                  Dairy, Milk & Butter
                </Link>
              </li>
              <li>
                <Link href="/explore?category=staples" className="hover:text-emerald-400 transition-colors">
                  Atta, Rice & Dal
                </Link>
              </li>
              <li>
                <Link href="/explore?category=snacks" className="hover:text-emerald-400 transition-colors">
                  Namkeen & Biscuits
                </Link>
              </li>
              <li>
                <Link href="/explore?category=beverages" className="hover:text-emerald-400 transition-colors">
                  Cold Drinks & Juices
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 3: Explore */}
          <div className="space-y-3">
            <p className="text-xs font-bold uppercase tracking-wider text-white">Explore SheoMart</p>
            <ul className="space-y-2 text-xs text-stone-400">
              <li>
                <Link href="/explore" className="hover:text-emerald-400 transition-colors">
                  All Groceries
                </Link>
              </li>
              <li>
                <Link href="/stores" className="hover:text-emerald-400 transition-colors">
                  Neighborhood Stores
                </Link>
              </li>
              <li>
                <Link href="/offers" className="hover:text-emerald-400 transition-colors">
                  Festival Deals & Offers
                </Link>
              </li>
              <li>
                <Link href="/coupons" className="hover:text-emerald-400 transition-colors">
                  Discount Coupons
                </Link>
              </li>
              <li>
                <Link href="/about" className="hover:text-emerald-400 transition-colors">
                  About Our Story
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 4: For Sellers */}
          <div className="space-y-3">
            <p className="text-xs font-bold uppercase tracking-wider text-white">For Sellers</p>
            <ul className="space-y-2 text-xs text-stone-400">
              <li>
                <Link href="/become-seller" className="hover:text-emerald-400 transition-colors flex items-center gap-1 font-semibold text-emerald-400">
                  Become a Seller <ArrowRight className="h-3 w-3" />
                </Link>
              </li>
              <li>
                <Link href="/store" className="hover:text-emerald-400 transition-colors">
                  Seller Dashboard
                </Link>
              </li>
              <li>
                <Link href="/store/inventory" className="hover:text-emerald-400 transition-colors">
                  POS & Inventory
                </Link>
              </li>
              <li>
                <Link href="/about#sellers" className="hover:text-emerald-400 transition-colors">
                  Partner Code of Conduct
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 5: Help & Policies */}
          <div className="space-y-3">
            <p className="text-xs font-bold uppercase tracking-wider text-white">Help & Legal</p>
            <ul className="space-y-2 text-xs text-stone-400">
              <li>
                <Link href="/contact" className="hover:text-emerald-400 transition-colors">
                  Customer Support
                </Link>
              </li>
              <li>
                <Link href="/privacy" className="hover:text-emerald-400 transition-colors">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/terms" className="hover:text-emerald-400 transition-colors">
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link href="/refunds" className="hover:text-emerald-400 transition-colors">
                  Return & Refund Policy
                </Link>
              </li>
              <li>
                <Link href="/shipping" className="hover:text-emerald-400 transition-colors">
                  Delivery Guidelines
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* App Download & Payment Security Strip */}
        <div className="mt-12 flex flex-col gap-6 border-t border-stone-850 pt-8 sm:flex-row sm:items-center sm:justify-between">
          {/* App download link */}
          <div className="flex flex-wrap items-center gap-3">
            <span className="text-xs font-medium text-stone-400">Get the mobile experience:</span>
            <a
              href={ANDROID_APP.DOWNLOAD_PATH}
              download={`SheoMart-v${ANDROID_APP.VERSION}-beta.apk`}
              className="inline-flex items-center gap-2 rounded-xl border border-stone-700 bg-stone-900 px-3 py-1.5 text-xs font-semibold text-white transition hover:border-emerald-500 hover:text-emerald-300"
            >
              <Smartphone className="h-3.5 w-3.5 text-emerald-400" />
              Download Android APK (v{ANDROID_APP.VERSION})
            </a>
            <span className="rounded-xl border border-stone-800 bg-stone-900/60 px-3 py-1.5 text-xs text-stone-500">
              Google Play • Coming Soon
            </span>
          </div>

          {/* Payment Badges */}
          <div className="flex items-center gap-2 text-xs text-stone-400">
            <ShieldCheck className="h-4 w-4 text-emerald-400" />
            <span>Secure 256-bit Encrypted Checkout • UPI • Cards • COD</span>
          </div>
        </div>

        {/* Bottom copyright */}
        <div className="mt-8 border-t border-stone-850 pt-6 text-center text-xs text-stone-500 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p>© {new Date().getFullYear()} SheoMart Marketplace. All rights reserved.</p>
          <p className="flex items-center gap-1.5">
            Handcrafted with <Heart className="h-3.5 w-3.5 text-rose-500 fill-rose-500" /> for the people of Sheopur (MP).
          </p>
        </div>
      </div>
    </footer>
  );
}
