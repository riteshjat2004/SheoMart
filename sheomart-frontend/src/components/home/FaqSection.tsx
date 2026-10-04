"use client";

import { useState } from "react";
import { ChevronDown, HelpCircle } from "lucide-react";

interface FaqItem {
  question: string;
  answer: string;
  category: string;
}

const FAQS: FaqItem[] = [
  {
    category: "Delivery",
    question: "How fast is grocery delivery in Sheopur?",
    answer:
      "Most orders across Sheopur city center, Shivpuri Road, and Pali Road are delivered within 15 to 30 minutes! For outlying areas, estimated delivery time is clearly shown before you place your order.",
  },
  {
    category: "Orders",
    question: "How do you guarantee freshness for vegetables and dairy?",
    answer:
      "Our partner stores receive farm-fresh shipments and dairy early every morning. Before packing, each item is physically checked for freshness, unblemished skin, and appropriate weight.",
  },
  {
    category: "Payments",
    question: "What payment methods are supported?",
    answer:
      "You can pay seamlessly via UPI (Google Pay, PhonePe, Paytm, BHIM), all major Credit & Debit cards, Net Banking, and Cash on Delivery (COD).",
  },
  {
    category: "Stores",
    question: "Can I choose which store my groceries come from?",
    answer:
      "Yes, absolutely! SheoMart is a multi-store marketplace. You can pick your trusted neighborhood Kirana shop or explore all available stores based on proximity and reviews.",
  },
  {
    category: "Sellers",
    question: "How can a local store register on SheoMart?",
    answer:
      "Store owners can click 'Become a Seller' in the navigation bar to register their shop. Our local team conducts a quick physical verification, helps catalog your inventory, and gets you online within 24 hours.",
  },
];

export function FaqSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const toggle = (idx: number) => {
    setOpenIndex(openIndex === idx ? null : idx);
  };

  return (
    <section className="space-y-6">
      <div className="text-center max-w-2xl mx-auto space-y-2">
        <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/20 bg-emerald-50 px-3.5 py-1 text-xs font-semibold uppercase tracking-wider text-emerald-800 dark:border-emerald-500/30 dark:bg-emerald-950/40 dark:text-emerald-300">
          <HelpCircle className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
          Got Questions?
        </span>
        <h2 className="text-2xl sm:text-3xl font-extrabold text-stone-900 dark:text-white">
          Frequently asked questions
        </h2>
        <p className="text-sm text-stone-600 dark:text-stone-400">
          Everything you need to know about shopping with SheoMart in Sheopur.
        </p>
      </div>

      <div className="max-w-3xl mx-auto space-y-3">
        {FAQS.map((faq, idx) => {
          const isOpen = openIndex === idx;
          return (
            <div
              key={faq.question}
              className={`rounded-2xl border transition-all duration-200 overflow-hidden ${
                isOpen
                  ? "border-emerald-500/40 bg-white shadow-sm dark:border-emerald-500/50 dark:bg-stone-900/90 dark:shadow-md"
                  : "border-stone-200/90 bg-white/70 hover:border-emerald-200 hover:bg-white dark:border-stone-800 dark:bg-stone-900/50 dark:hover:border-stone-700 dark:hover:bg-stone-900/70"
              }`}
            >
              <button
                type="button"
                onClick={() => toggle(idx)}
                className="flex w-full items-center justify-between p-5 text-left transition-colors"
                aria-expanded={isOpen}
              >
                <div className="flex items-center gap-3">
                  <span className="rounded-lg bg-emerald-50 px-2 py-0.5 text-[11px] font-semibold text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400">
                    {faq.category}
                  </span>
                  <span className="text-sm sm:text-base font-semibold text-stone-900 dark:text-white">
                    {faq.question}
                  </span>
                </div>
                <ChevronDown
                  className={`h-4 w-4 text-emerald-600 dark:text-emerald-400 shrink-0 transition-transform duration-200 ${
                    isOpen ? "rotate-180" : ""
                  }`}
                />
              </button>

              {isOpen && (
                <div className="px-5 pb-5 pt-1 text-xs sm:text-sm leading-relaxed text-stone-600 border-t border-stone-100 dark:text-stone-300 dark:border-stone-800/60">
                  {faq.answer}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}
