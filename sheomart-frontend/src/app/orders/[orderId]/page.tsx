"use client";

import Link from "next/link";
import { ArrowLeft, CircleHelp } from "lucide-react";
import { useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Container } from "@/components/layout/container";
import { PageWrapper } from "@/components/layout/page-wrapper";
import { Section } from "@/components/layout/section";
import { SectionHeading } from "@/components/marketplace/SectionHeading";
import { StatusBadge } from "@/components/dashboard/StatusBadge";
import { OrderItemsList } from "@/components/profile/OrderItemsList";
import { PaymentSummaryCard } from "@/components/profile/PaymentSummaryCard";
import { PickupInfoCard } from "@/components/profile/PickupInfoCard";
import { OrderStatusTimeline } from "@/components/profile/OrderStatusTimeline";
import { ErrorState } from "@/components/common/error-state";
import { EmptyState } from "@/components/common/empty-state";
import { LoadingSkeleton } from "@/components/dashboard/LoadingSkeleton";
import { useOrders } from "@/hooks/use-orders";
import type { OrderRecord } from "@/services/orders";

const statusLabel = (status?: string) => status === "PICKED_UP" ? "Picked Up" : status === "READY_FOR_PICKUP" ? "Ready for Pickup" : status === "PREPARING" ? "Preparing" : status === "CANCELLED" ? "Cancelled" : "Order Placed";
const paymentLabel = (status?: string) => status === "PAID" ? "Paid" : "Pending";
type LiveOrder = OrderRecord & { invoiceNumber?: string; storeName?: string; paymentMethod?: string };

export default function OrderDetailsPage() {
  const { orderId } = useParams<{ orderId: string }>();
  const ordersQuery = useOrders();
  const order = ordersQuery.data?.find((item) => item.orderId === orderId) as LiveOrder | undefined;

  if (ordersQuery.isLoading) return <PageWrapper><Section className="py-8"><Container><LoadingSkeleton rows={6} /></Container></Section></PageWrapper>;
  if (ordersQuery.isError) return <PageWrapper><Section className="space-y-4 py-8"><Container><ErrorState message={ordersQuery.error.message} /><Button type="button" variant="outline" onClick={() => ordersQuery.refetch()}>Retry</Button></Container></Section></PageWrapper>;
  if (!order) return <PageWrapper><Section className="space-y-6 py-8"><Container><Button asChild variant="outline"><Link href="/orders"><ArrowLeft className="mr-2 h-4 w-4" />Back to orders</Link></Button><EmptyState title="Order not found" description="This order is no longer available." /></Container></Section></PageWrapper>;

  return (
    <PageWrapper>
      <Section className="space-y-6 py-8 sm:py-10 lg:py-12">
        <Container className="space-y-6">
          <Button asChild variant="outline" className="h-fit">
            <Link href="/orders"><ArrowLeft className="mr-2 h-4 w-4" />Back to orders</Link>
          </Button>

          <SectionHeading eyebrow="Order Details" title={`Order ${order.orderId}`} description="Review your pickup order, payment summary, and store information." />

          <section className="rounded-[2rem] border border-stone-200 bg-white p-6 shadow-sm dark:border-stone-800 dark:bg-stone-900">
            <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <div><p className="text-xs font-semibold uppercase tracking-[0.16em] text-stone-500 dark:text-stone-400">Invoice Number</p><p className="mt-2 font-semibold text-stone-900 dark:text-stone-50">{order.invoiceNumber ?? "Not available"}</p></div>
                <div><p className="text-xs font-semibold uppercase tracking-[0.16em] text-stone-500 dark:text-stone-400">Order ID</p><p className="mt-2 font-semibold text-stone-900 dark:text-stone-50">{order.orderId}</p></div>
                <div><p className="text-xs font-semibold uppercase tracking-[0.16em] text-stone-500 dark:text-stone-400">Order Date</p><p className="mt-2 font-semibold text-stone-900 dark:text-stone-50">{order.createdAt ? new Date(order.createdAt).toLocaleDateString() : "Recently"}</p></div>
                <div><p className="text-xs font-semibold uppercase tracking-[0.16em] text-stone-500 dark:text-stone-400">Store Name</p><p className="mt-2 font-semibold text-stone-900 dark:text-stone-50">{order.store?.storeName ?? order.storeName ?? "Store details unavailable"}</p></div>
              </div>
              <div className="flex flex-wrap gap-2 lg:justify-end">
                <StatusBadge status={statusLabel(order.pickupStatus)} />
                <span className="inline-flex rounded-full bg-amber-100 px-2.5 py-1 text-xs font-semibold text-amber-700 dark:bg-amber-950/60 dark:text-amber-300">Payment: {order.paymentStatus === "PAID" ? "Payment Received" : "Pending (Pay at Shop)"}</span>
              </div>
            </div>
          </section>

          <div className="rounded-[1.5rem] border border-emerald-200 bg-emerald-50 p-4 text-sm font-semibold text-emerald-800 dark:border-emerald-900/70 dark:bg-emerald-950/30 dark:text-emerald-200">
            {order.pickupStatus === "PICKED_UP" ? "Your order has been completed." : order.pickupStatus === "READY_FOR_PICKUP" ? "Your order is ready for pickup. Bring your order ID when collecting it." : "Your order status is being updated."}
          </div>

          <OrderItemsList items={(order.orderItems ?? []).map((item) => ({ name: item.name ?? "Product", quantity: item.quantity ?? 0, price: `₹${item.discountPrice ?? item.price ?? 0}`, total: `₹${item.totalPrice ?? 0}` }))} />

          <div className="grid gap-6 lg:grid-cols-2">
            <PaymentSummaryCard subtotal={order.subtotal} discount={order.discount} deliveryCharge={order.deliveryCharge} platformFee={order.platformFee} grandTotal={order.grandTotal} amountPaid={order.amountPaid} remainingAmount={order.remainingAmount} paymentMethod={order.paymentMethod} paymentStatus={order.paymentStatus === "PAID" ? "Paid" : "Pending"} />
            <PickupInfoCard order={order} />
          </div>

          <div className="rounded-[2rem] border border-stone-200 bg-white p-6 shadow-sm dark:border-stone-800 dark:bg-stone-900"><p className="text-sm font-semibold uppercase tracking-[0.28em] text-emerald-600">Order timeline</p><div className="mt-5"><OrderStatusTimeline pickupStatus={order.pickupStatus} statusUpdatedAt={order.statusUpdatedAt} paymentStatus={order.paymentStatus} createdAt={order.createdAt} /></div></div>

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
