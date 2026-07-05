"use client";

import Link from "next/link";
import { ArrowRight, ShieldCheck, Truck, Sparkles, Store } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Container } from "@/components/layout/container";
import { PageWrapper } from "@/components/layout/page-wrapper";
import { Section } from "@/components/layout/section";
import { SectionHeading } from "@/components/marketplace/SectionHeading";

const pillars = [
  {
    title: "Trusted shopping",
    description: "Discover fresh essentials and verified local stores with clear product information.",
    icon: ShieldCheck,
  },
  {
    title: "Fast delivery",
    description: "Enjoy convenient delivery windows and a calm, dependable ordering experience.",
    icon: Truck,
  },
  {
    title: "Support for sellers",
    description: "Store owners can manage inventory, products, and reviews from one polished dashboard.",
    icon: Store,
  },
];

export default function AboutPage() {
  return (
    <PageWrapper>
      <Section className="py-8 sm:py-10 lg:py-12">
        <Container className="space-y-8">
          <div className="rounded-[2rem] border border-stone-200 bg-white/80 p-8 shadow-sm backdrop-blur dark:border-stone-800 dark:bg-stone-900/80 sm:p-10">
            <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
              <div className="max-w-2xl space-y-4">
                <div className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-sm font-medium text-emerald-700 dark:border-emerald-900/70 dark:bg-emerald-950/40 dark:text-emerald-300">
                  <Sparkles className="h-4 w-4" />
                  About SheoMart
                </div>
                <SectionHeading
                  eyebrow="Modern grocery shopping"
                  title="A thoughtful marketplace for everyday essentials"
                  description="SheoMart brings together trusted stores, curated products, and simple customer tools for discovery, ordering, and delivery planning."
                />
              </div>
              <Button asChild variant="secondary">
                <Link href="/explore">
                  Browse marketplace <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
          </div>

          <div className="grid gap-6 lg:grid-cols-3">
            {pillars.map((pillar) => {
              const Icon = pillar.icon;
              return (
                <div key={pillar.title} className="rounded-[1.75rem] border border-stone-200 bg-white p-6 shadow-sm dark:border-stone-800 dark:bg-stone-900">
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300">
                    <Icon className="h-5 w-5" />
                  </div>
                  <h3 className="mt-4 text-lg font-semibold text-stone-900 dark:text-stone-50">{pillar.title}</h3>
                  <p className="mt-2 text-sm leading-7 text-stone-600 dark:text-stone-300">{pillar.description}</p>
                </div>
              );
            })}
          </div>
        </Container>
      </Section>
    </PageWrapper>
  );
}
