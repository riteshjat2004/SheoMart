"use client";

import { Container } from "@/components/layout/container";
import { PageWrapper } from "@/components/layout/page-wrapper";
import { Section } from "@/components/layout/section";
import { SectionHeading } from "@/components/marketplace/SectionHeading";

export default function TermsPage() {
  return (
    <PageWrapper>
      <Section className="py-8 sm:py-10 lg:py-12">
        <Container className="rounded-[2rem] border border-stone-200 bg-white/80 p-8 shadow-sm backdrop-blur dark:border-stone-800 dark:bg-stone-900/80 sm:p-10">
          <SectionHeading eyebrow="Terms" title="Shop responsibly" description="These terms outline the expected use of the SheoMart marketplace and support experience." />
          <div className="mt-6 space-y-4 text-sm leading-7 text-stone-600 dark:text-stone-300">
            <p>Users are responsible for providing accurate delivery details, maintaining account security, and using the platform for lawful shopping and support requests.</p>
            <p>Store owners and customers are expected to act respectfully and follow platform rules related to products, payments, and communications.</p>
            <p>SheoMart may revise these terms over time to reflect product improvements, policy updates, or operational needs.</p>
          </div>
        </Container>
      </Section>
    </PageWrapper>
  );
}
