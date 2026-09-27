"use client";

import Link from "next/link";
import {
  ArrowRight,
  Headphones,
  MessageCircle,
  ShieldCheck,
  Package,
  Clock,
  Sparkles,
  LogIn,
  HelpCircle,
  Truck,
  CreditCard,
  PhoneCall,
  Mail,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Container } from "@/components/layout/container";
import { PageWrapper } from "@/components/layout/page-wrapper";
import { Section } from "@/components/layout/section";
import { SectionHeading } from "@/components/marketplace/SectionHeading";
import { CustomerSupportCenter } from "@/components/support/CustomerSupportCenter";
import { useAuthStore } from "@/store/auth-store";

const HELP_TOPICS = [
  {
    title: "Order issues & cancellations",
    description: "Track status, update delivery address, or resolve problems with your recent purchases.",
    icon: Package,
  },
  {
    title: "Fast delivery & rider tracking",
    description: "Real-time updates on local Sheopur delivery slots and runner assignments.",
    icon: Truck,
  },
  {
    title: "Payment, refunds & wallets",
    description: "Instant UPI and card refund tracking back to your original source account.",
    icon: CreditCard,
  },
  {
    title: "Account safety & login",
    description: "Manage phone OTP verification, delivery addresses, and signed-in devices.",
    icon: ShieldCheck,
  },
];

const FAQS = [
  {
    q: "How fast does SheoMart support respond?",
    a: "Our customer support team is active throughout the day with an average response time of under 15 minutes during operating hours.",
  },
  {
    q: "How do I request a refund for a damaged or missing item?",
    a: "Simply click 'New Ticket', choose 'Product Quality' or 'Refund Request', attach a photo of the item, and our team will process your refund immediately.",
  },
  {
    q: "Can I contact the seller directly?",
    a: "To ensure customer safety and fast resolution, all support inquiries are handled directly by SheoMart Platform Support. Sellers do not mediate disputes.",
  },
  {
    q: "What if my delivery is running late?",
    a: "Select your order in the support request modal and our delivery dispatcher will check the rider's live GPS route to provide an exact ETA.",
  },
];

export default function SupportPage() {
  const { isAuthenticated, user } = useAuthStore();

  return (
    <PageWrapper>
      <Section className="py-6 sm:py-8 lg:py-10">
        <Container className="space-y-8">
          {isAuthenticated && user?.userId ? (
            /* Authenticated: In-App Support Center & Chat */
            <div className="space-y-6">
              <div>
                <h1 className="text-2xl font-extrabold tracking-tight text-stone-900 dark:text-stone-50">
                  Customer Support Center
                </h1>
                <p className="mt-1 text-xs text-stone-500 dark:text-stone-400">
                  Live help desk, ticket tracking and direct communication with SheoMart Platform Support.
                </p>
              </div>

              <CustomerSupportCenter currentUserId={user.userId} />
            </div>
          ) : (
            /* Unauthenticated: Public Help & Sign-In Landing */
            <div className="space-y-10">
              {/* Hero Banner */}
              <div className="rounded-[2.5rem] border border-stone-200 bg-linear-to-br from-white via-emerald-50/20 to-teal-50/30 p-8 shadow-sm backdrop-blur dark:border-stone-800 dark:bg-linear-to-br dark:from-stone-900 dark:via-stone-900 dark:to-emerald-950/20 sm:p-12">
                <div className="max-w-2xl space-y-4">
                  <div className="inline-flex items-center gap-2 rounded-full bg-emerald-500/10 px-3.5 py-1 text-xs font-bold text-emerald-700 dark:text-emerald-300 border border-emerald-500/20">
                    <Sparkles className="h-3.5 w-3.5 text-emerald-500" />
                    SheoMart 24/7 Help Desk
                  </div>
                  <h1 className="text-3xl font-extrabold tracking-tight text-stone-900 sm:text-4xl dark:text-stone-50">
                    How can we help you today?
                  </h1>
                  <p className="text-sm leading-relaxed text-stone-600 dark:text-stone-300">
                    Sign in to chat live with our support specialists, track your refund tickets, or report missing items with instant photo attachments.
                  </p>

                  <div className="pt-2 flex flex-wrap gap-3">
                    <Button asChild size="lg" className="rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold gap-2 shadow-md">
                      <Link href="/login?redirect=/support">
                        <LogIn className="h-4 w-4" /> Sign In to Open Support Ticket
                      </Link>
                    </Button>
                    <Button asChild variant="outline" size="lg" className="rounded-xl font-bold gap-2">
                      <Link href="/orders">
                        <Package className="h-4 w-4" /> Track Recent Orders
                      </Link>
                    </Button>
                  </div>
                </div>
              </div>

              {/* Topics Grid */}
              <div>
                <SectionHeading
                  eyebrow="Help Topics"
                  title="Popular Support Categories"
                  description="Quick solutions and direct routing for your marketplace questions."
                />

                <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
                  {HELP_TOPICS.map((topic) => {
                    const Icon = topic.icon;
                    return (
                      <div
                        key={topic.title}
                        className="rounded-3xl border border-stone-200 bg-white p-6 shadow-xs dark:border-stone-800 dark:bg-stone-900 hover:shadow-md transition"
                      >
                        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 mb-4">
                          <Icon className="h-6 w-6" />
                        </div>
                        <h3 className="text-sm font-bold text-stone-900 dark:text-stone-50">
                          {topic.title}
                        </h3>
                        <p className="mt-1.5 text-xs leading-relaxed text-stone-600 dark:text-stone-400">
                          {topic.description}
                        </p>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* FAQs Accordion Cards */}
              <div className="rounded-3xl border border-stone-200 bg-white p-6 sm:p-8 dark:border-stone-800 dark:bg-stone-900">
                <div className="mb-6 flex items-center gap-2">
                  <HelpCircle className="h-5 w-5 text-emerald-600" />
                  <h3 className="text-lg font-bold text-stone-900 dark:text-stone-50">
                    Frequently Asked Questions
                  </h3>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  {FAQS.map((faq, i) => (
                    <div
                      key={i}
                      className="rounded-2xl border border-stone-100 bg-stone-50/60 p-4 dark:border-stone-800/60 dark:bg-stone-950/50"
                    >
                      <h4 className="text-xs font-bold text-stone-900 dark:text-stone-100 mb-1">
                        {faq.q}
                      </h4>
                      <p className="text-xs text-stone-600 dark:text-stone-400 leading-relaxed">
                        {faq.a}
                      </p>
                    </div>
                  ))}
                </div>

                <div className="mt-6 flex flex-wrap items-center justify-between gap-4 border-t border-stone-100 pt-6 dark:border-stone-800">
                  <div className="flex items-center gap-3">
                    <Mail className="h-4 w-4 text-stone-400" />
                    <span className="text-xs text-stone-600 dark:text-stone-400">
                      Need direct email? <a href="mailto:support@sheomart.com" className="font-semibold text-emerald-600 hover:underline">support@sheomart.com</a>
                    </span>
                  </div>

                  <Button asChild variant="outline" size="sm">
                    <Link href="/login?redirect=/support">
                      Chat with an agent <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
                    </Link>
                  </Button>
                </div>
              </div>
            </div>
          )}
        </Container>
      </Section>
    </PageWrapper>
  );
}
