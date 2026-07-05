"use client";

import { Container } from "@/components/layout/container";
import { PageWrapper } from "@/components/layout/page-wrapper";
import { Section } from "@/components/layout/section";
import { SectionHeading } from "@/components/marketplace/SectionHeading";

export default function PrivacyPage() {
  return (
    <PageWrapper>
      <Section className="py-8 sm:py-10 lg:py-12">
        <Container className="rounded-[2rem] border border-stone-200 bg-white/80 p-8 shadow-sm backdrop-blur dark:border-stone-800 dark:bg-stone-900/80 sm:p-10">
          <SectionHeading eyebrow="Privacy" title="Your data stays protected" description="We use your information only to provide a better shopping experience and support your orders." />
          <div className="mt-6 space-y-4 text-sm leading-7 text-stone-600 dark:text-stone-300">
            <p>SheoMart stores the minimum account and order information required to fulfill requests and keep your experience reliable.</p>
            <p>We do not share your personal details with third parties outside the normal delivery, payment, and support flow required to complete your orders.</p>
            <p>If you want to update or remove data associated with your account, contact support so we can assist you securely.</p>
          </div>
        </Container>
      </Section>
    </PageWrapper>
  );
}
