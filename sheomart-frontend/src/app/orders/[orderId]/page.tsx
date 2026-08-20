import Link from "next/link";
import { ArrowLeft, CircleHelp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Container } from "@/components/layout/container";
import { PageWrapper } from "@/components/layout/page-wrapper";
import { Section } from "@/components/layout/section";
import { SectionHeading } from "@/components/marketplace/SectionHeading";
import { StatusBadge } from "@/components/dashboard/StatusBadge";
import { OrderItemsList } from "@/components/profile/OrderItemsList";
import { PaymentSummaryCard } from "@/components/profile/PaymentSummaryCard";
import { PickupInfoCard } from "@/components/profile/PickupInfoCard";

interface OrderDetailsPageProps {
  params: Promise<{ orderId: string }>;
}

export default async function OrderDetailsPage({ params }: OrderDetailsPageProps) {
  const { orderId } = await params;
  const orderStatus = "Ready for Pickup";
  const paymentStatus = "Pending (Pay at Shop)";

  return (
    <PageWrapper>
      <Section className="space-y-6 py-8 sm:py-10 lg:py-12">
        <Container className="space-y-6">
          <Button asChild variant="outline" className="h-fit">
            <Link href="/orders"><ArrowLeft className="mr-2 h-4 w-4" />Back to orders</Link>
          </Button>

          <SectionHeading eyebrow="Order Details" title={`Order ${orderId}`} description="Review your pickup order, payment summary, and store information." />

          <section className="rounded-[2rem] border border-stone-200 bg-white p-6 shadow-sm dark:border-stone-800 dark:bg-stone-900">
            <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <div><p className="text-xs font-semibold uppercase tracking-[0.16em] text-stone-500 dark:text-stone-400">Invoice Number</p><p className="mt-2 font-semibold text-stone-900 dark:text-stone-50">INV-2026-0001</p></div>
                <div><p className="text-xs font-semibold uppercase tracking-[0.16em] text-stone-500 dark:text-stone-400">Order ID</p><p className="mt-2 font-semibold text-stone-900 dark:text-stone-50">{orderId}</p></div>
                <div><p className="text-xs font-semibold uppercase tracking-[0.16em] text-stone-500 dark:text-stone-400">Order Date</p><p className="mt-2 font-semibold text-stone-900 dark:text-stone-50">21 Aug 2026</p></div>
                <div><p className="text-xs font-semibold uppercase tracking-[0.16em] text-stone-500 dark:text-stone-400">Store Name</p><p className="mt-2 font-semibold text-stone-900 dark:text-stone-50">SheoMart Store</p></div>
              </div>
              <div className="flex flex-wrap gap-2 lg:justify-end">
                <StatusBadge status={orderStatus} />
                <span className="inline-flex rounded-full bg-amber-100 px-2.5 py-1 text-xs font-semibold text-amber-700 dark:bg-amber-950/60 dark:text-amber-300">Payment: {paymentStatus}</span>
              </div>
            </div>
          </section>

          <div className="rounded-[1.5rem] border border-emerald-200 bg-emerald-50 p-4 text-sm font-semibold text-emerald-800 dark:border-emerald-900/70 dark:bg-emerald-950/30 dark:text-emerald-200">
            Your order is ready for pickup.
          </div>

          <OrderItemsList
            items={[
              { name: "Fresh grocery essentials", quantity: 1, price: "₹0", total: "₹0" },
            ]}
          />

          <div className="grid gap-6 lg:grid-cols-2">
            <PaymentSummaryCard />
            <PickupInfoCard />
          </div>

          <section className="flex flex-col gap-4 rounded-[2rem] border border-stone-200 bg-white p-6 shadow-sm sm:flex-row sm:items-center sm:justify-between dark:border-stone-800 dark:bg-stone-900">
            <div className="flex items-start gap-3">
              <CircleHelp className="mt-0.5 h-5 w-5 shrink-0 text-emerald-600 dark:text-emerald-400" />
              <div><h2 className="font-semibold text-stone-900 dark:text-stone-50">Need help with this order?</h2><p className="mt-1 text-sm text-stone-600 dark:text-stone-300">Store support will be available here in a future update.</p></div>
            </div>
            <Button type="button" variant="outline" disabled>Contact Store</Button>
          </section>
        </Container>
      </Section>
    </PageWrapper>
  );
}
