"use client";

import { ShieldCheck, Leaf, Clock3, CreditCard, Award, Users, ShoppingBag, Store } from "lucide-react";

export function TrustAndStatsSection() {
  const trustPillars = [
    {
      icon: Clock3,
      title: "15–30 Min Express Delivery",
      description: "Fast doorstep fulfillment powered by local riders who know every Sheopur street.",
    },
    {
      icon: ShieldCheck,
      title: "100% Verified Stores",
      description: "Only approved, quality-inspected local merchants and supermarkets.",
    },
    {
      icon: Leaf,
      title: "Freshness Guaranteed",
      description: "Crisp veggies, pure dairy, and fresh pantry picks inspected daily.",
    },
    {
      icon: CreditCard,
      title: "Secure UPI & COD",
      description: "Pay conveniently via Google Pay, PhonePe, Cards, or Cash on Delivery.",
    },
  ];

  const stats = [
    { label: "Approved Local Stores", value: "50+", icon: Store },
    { label: "Daily Fresh Products", value: "10,000+", icon: ShoppingBag },
    { label: "Happy Sheopur Families", value: "8,500+", icon: Users },
    { label: "On-Time Deliveries", value: "99.4%", icon: Award },
  ];

  return (
    <section className="space-y-8">
      {/* 4 Trust Pillars */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {trustPillars.map((item) => {
          const Icon = item.icon;
          return (
            <div
              key={item.title}
              className="flex flex-col justify-between rounded-3xl border border-stone-800/80 bg-stone-900/60 p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-emerald-500/30 hover:bg-stone-900"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-500/20 text-emerald-400 shadow-inner">
                <Icon className="h-6 w-6" />
              </div>
              <div className="mt-4">
                <h3 className="text-base font-bold text-white">{item.title}</h3>
                <p className="mt-1.5 text-xs leading-relaxed text-stone-400">{item.description}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Live Marketplace Statistics Banner */}
      <div className="relative overflow-hidden rounded-3xl border border-emerald-500/30 bg-gradient-to-r from-emerald-950/70 via-stone-900 to-emerald-950/70 p-6 sm:p-8 backdrop-blur-md">
        <div className="grid grid-cols-2 gap-6 md:grid-cols-4 text-center">
          {stats.map((stat) => {
            const Icon = stat.icon;
            return (
              <div key={stat.label} className="space-y-1.5">
                <div className="mx-auto flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-500/20 text-emerald-400">
                  <Icon className="h-5 w-5" />
                </div>
                <p className="text-2xl sm:text-3xl font-black tracking-tight text-white">{stat.value}</p>
                <p className="text-xs font-medium text-stone-300">{stat.label}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
