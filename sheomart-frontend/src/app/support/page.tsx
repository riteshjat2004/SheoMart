"use client";

import Link from "next/link";
import { ArrowRight, Headphones, MessageCircle, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Container } from "@/components/layout/container";
import { PageWrapper } from "@/components/layout/page-wrapper";
import { Section } from "@/components/layout/section";
import { SectionHeading } from "@/components/marketplace/SectionHeading";

const helpTopics = [
  { title: "Order issues", description: "Track, update, or resolve problems with your recent purchases.", icon: Headphones },
  { title: "Delivery questions", description: "Check delivery details, timing, and address changes.", icon: MessageCircle },
  { title: "Account safety", description: "Protect your profile, payment details, and signed-in sessions.", icon: ShieldCheck },
];

export default function SupportPage() {
  return (
    <PageWrapper>
      <Section className="py-8 sm:py-10 lg:py-12">
        <Container className="space-y-8">
          <div className="rounded-[2rem] border border-stone-200 bg-white/80 p-8 shadow-sm backdrop-blur dark:border-stone-800 dark:bg-stone-900/80 sm:p-10">
            <SectionHeading
              eyebrow="Support"
              title="We’re here to help"
              description="Reach us for order help, delivery questions, or account support whenever you need it."
            />
            <div className="mt-6 flex flex-wrap gap-3">
              <Button asChild variant="secondary">
                <Link href="mailto:support@sheomart.com">
                  Email support <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button asChild variant="outline">
                <Link href="/orders">View your orders</Link>
              </Button>
            </div>
          </div>

          <div className="grid gap-6 lg:grid-cols-3">
            {helpTopics.map((topic) => {
              const Icon = topic.icon;
              return (
                <div key={topic.title} className="rounded-[1.75rem] border border-stone-200 bg-white p-6 shadow-sm dark:border-stone-800 dark:bg-stone-900">
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300">
                    <Icon className="h-5 w-5" />
                  </div>
                  <h3 className="mt-4 text-lg font-semibold text-stone-900 dark:text-stone-50">{topic.title}</h3>
                  <p className="mt-2 text-sm leading-7 text-stone-600 dark:text-stone-300">{topic.description}</p>
                </div>
              );
            })}
          </div>
        </Container>
      </Section>
    </PageWrapper>
  );
}
