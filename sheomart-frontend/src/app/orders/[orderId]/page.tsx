"use client";

import Link from "next/link";
import { useRouter, useParams } from "next/navigation";
import { useState } from "react";
import {
  ArrowLeft,
  CircleHelp,
  Printer,
  RotateCcw,
  XCircle,
  Truck,
  Store,
  CheckCircle2,
  Calendar,
  CreditCard,
  Package,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Container } from "@/components/layout/container";
import { PageWrapper } from "@/components/layout/page-wrapper";
import { Section } from "@/components/layout/section";
import { SectionHeading } from "@/components/marketplace/SectionHeading";
import { StatusBadge } from "@/components/dashboard/StatusBadge";
import { OrderItemsList } from "@/components/profile/OrderItemsList";
import { PaymentSummaryCard } from "@/components/profile/PaymentSummaryCard";
import { LiveDeliveryEtaCard } from "@/components/profile/LiveDeliveryEtaCard";
import { PickupInfoCard } from "@/components/profile/PickupInfoCard";
import { OrderStatusTimeline } from "@/components/profile/OrderStatusTimeline";
import { ErrorState } from "@/components/common/error-state";
import { EmptyState } from "@/components/common/empty-state";
import { LoadingSkeleton } from "@/components/dashboard/LoadingSkeleton";
import { useOrders, useCancelCustomerOrder } from "@/hooks/use-orders";
import { useAddCartItem } from "@/hooks/use-cart";
import type { OrderRecord } from "@/services/orders";

const statusLabel = (status?: string) =>
  ({
    ORDER_PLACED: "Order Placed",
    ACCEPTED: "Seller Accepted",
    PREPARING: "Packing Items",
    READY_FOR_PICKUP: "Ready for Pickup",
    READY_FOR_DISPATCH: "Ready for Dispatch",
    OUT_FOR_DELIVERY: "Out for Delivery",
    PICKED_UP: "Picked Up",
    DELIVERED: "Delivered",
    CANCELLED: "Cancelled",
  }[status ?? ""] ?? "Order Placed");

type LiveOrder = OrderRecord & {
  invoiceNumber?: string;
  storeName?: string;
  paymentMethod?: string;
};

export default function OrderDetailsPage() {
  const router = useRouter();
  const { orderId } = useParams<{ orderId: string }>();
  const ordersQuery = useOrders();
  const cancelOrderMutation = useCancelCustomerOrder();
  const addCartItem = useAddCartItem();

  const [feedback, setFeedback] = useState<string | null>(null);

  const order = ordersQuery.data?.find((item) => item.orderId === orderId) as LiveOrder | undefined;

  const rawStatus = (order?.pickupStatus || order?.status || "ORDER_PLACED").toUpperCase();
  const isCancellable = rawStatus === "ORDER_PLACED" || rawStatus === "CONFIRMED";
  const isDelivery = order?.fulfillmentType === "delivery" || order?.deliveryMethod === "delivery";

  const handleCancelOrder = () => {
    if (!order?.orderId) return;
    const confirmed = window.confirm("Are you sure you want to cancel this order?");
    if (!confirmed) return;

    setFeedback(null);
    cancelOrderMutation.mutate(
      { orderId: order.orderId, reason: "Cancelled by customer before acceptance" },
      {
        onSuccess: () => {
          setFeedback("Order cancelled successfully.");
        },
        onError: (err) => {
          setFeedback(err instanceof Error ? err.message : "Failed to cancel order.");
        },
      }
    );
  };

  const handleReorder = async () => {
    if (!order?.orderItems || order.orderItems.length === 0) return;
    setFeedback(null);

    let addedCount = 0;
    for (const item of order.orderItems) {
      if (item.productId) {
        try {
          await addCartItem.mutateAsync({
            productId: item.productId,
            quantity: item.quantity || 1,
          });
          addedCount++;
        } catch {
          // continue
        }
      }
    }

    if (addedCount > 0) {
      router.push("/cart");
    } else {
      setFeedback("Unable to reorder items at this moment.");
    }
  };

  const handlePrintInvoice = () => {
    window.print();
  };

  if (ordersQuery.isLoading)
    return (
      <PageWrapper>
        <Section className="py-8">
          <Container>
            <LoadingSkeleton rows={6} />
          </Container>
        </Section>
      </PageWrapper>
    );

  if (ordersQuery.isError)
    return (
      <PageWrapper>
        <Section className="space-y-4 py-8">
          <Container>
            <ErrorState message={ordersQuery.error.message} />
            <Button type="button" variant="outline" onClick={() => ordersQuery.refetch()}>
              Retry
            </Button>
          </Container>
        </Section>
      </PageWrapper>
    );

  if (!order)
    return (
      <PageWrapper>
        <Section className="space-y-6 py-8">
          <Container>
            <Button asChild variant="outline">
              <Link href="/orders">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to orders
              </Link>
            </Button>
            <EmptyState title="Order not found" description="This order is no longer available." />
          </Container>
        </Section>
      </PageWrapper>
    );

  return (
    <PageWrapper>
      <Section className="space-y-6 py-6 sm:py-8 lg:py-10">
        <Container className="space-y-6">
          {/* Top Actions */}
          <div className="flex flex-wrap items-center justify-between gap-3">
            <Button asChild variant="outline" size="sm">
              <Link href="/orders">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Orders
              </Link>
            </Button>

            <div className="flex flex-wrap items-center gap-2">
              <Button type="button" variant="outline" size="sm" onClick={handlePrintInvoice}>
                <Printer className="mr-1.5 h-4 w-4" />
                Print Invoice
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleReorder}
                className="text-emerald-700 hover:bg-emerald-50 dark:text-emerald-300 dark:hover:bg-emerald-950/40"
              >
                <RotateCcw className="mr-1.5 h-4 w-4" />
                Reorder Items
              </Button>
              {isCancellable && (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleCancelOrder}
                  disabled={cancelOrderMutation.isPending}
                  className="border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700 dark:border-red-900"
                >
                  <XCircle className="mr-1.5 h-4 w-4" />
                  Cancel Order
                </Button>
              )}
            </div>
          </div>

          {feedback && (
            <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-xs font-semibold text-emerald-800 dark:border-emerald-950 dark:bg-emerald-950/40 dark:text-emerald-300">
              {feedback}
            </div>
          )}

          {/* Heading */}
          <SectionHeading
            eyebrow="Order Tracking & Invoice"
            title={`Order #${order.orderId?.slice(-8).toUpperCase()}`}
            description={
              isDelivery
                ? "Review delivery progress, live updates, and payment breakdown."
                : "Review store pickup timing, status timeline, and payment information."
            }
          />

          {/* Meta card */}
          <section className="rounded-[2rem] border border-stone-200 bg-white p-6 shadow-sm dark:border-stone-800 dark:bg-stone-900">
            <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.16em] text-stone-500 dark:text-stone-400">
                    Invoice Number
                  </p>
                  <p className="mt-1 font-bold text-stone-900 dark:text-stone-50">
                    {order.invoiceNumber ?? `INV-${order.orderId?.slice(-6).toUpperCase()}`}
                  </p>
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.16em] text-stone-500 dark:text-stone-400">
                    Order ID
                  </p>
                  <p className="mt-1 font-bold text-stone-900 dark:text-stone-50">{order.orderId}</p>
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.16em] text-stone-500 dark:text-stone-400">
                    Order Date
                  </p>
                  <p className="mt-1 font-bold text-stone-900 dark:text-stone-50">
                    {order.createdAt
                      ? new Date(order.createdAt).toLocaleDateString("en-IN", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })
                      : "Recently"}
                  </p>
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.16em] text-stone-500 dark:text-stone-400">
                    Store Partner
                  </p>
                  <p className="mt-1 font-bold text-stone-900 dark:text-stone-50">
                    {order.store?.storeName ?? order.storeName ?? "SheoMart Neighborhood Store"}
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap gap-2 lg:justify-end">
                <StatusBadge status={statusLabel(order.pickupStatus || order.status)} />
                <span
                  className={`inline-flex rounded-full px-3 py-1 text-xs font-bold ${
                    (order.paymentStatus ?? "").toUpperCase() === "PAID"
                      ? "bg-emerald-50 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300"
                      : "bg-amber-50 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300"
                  }`}
                >
                  {(order.paymentStatus ?? "").toUpperCase() === "PAID"
                    ? `Payment Received${order.paymentReceivedMethod ? ` (${order.paymentReceivedMethod})` : ""}`
                    : isDelivery
                    ? "Pay on Delivery (Cash / UPI)"
                    : "Pay at Shop on Pickup"}
                </span>
              </div>
            </div>
          </section>

          {/* Delivery ETA if applicable */}
          {isDelivery && <LiveDeliveryEtaCard estimatedDeliveryAt={order.estimatedDeliveryAt} />}

          {/* Items breakdown */}
          <OrderItemsList
            items={(order.orderItems ?? []).map((item) => ({
              name: item.name ?? "Product",
              quantity: item.quantity ?? 0,
              price: `₹${item.discountPrice ?? item.price ?? 0}`,
              total: `₹${item.totalPrice ?? (item.price ?? 0) * (item.quantity ?? 1)}`,
            }))}
          />

          {/* Payment & Pickup / Delivery info */}
          <div className="grid gap-6 lg:grid-cols-2">
            <div>
              <PaymentSummaryCard
                subtotal={order.subtotal}
                discount={order.discount}
                deliveryCharge={order.deliveryCharge}
                platformFee={order.platformFee}
                grandTotal={order.grandTotal}
                amountPaid={order.amountPaid}
                remainingAmount={order.remainingAmount}
                paymentMethod={order.paymentMethod}
                paymentStatus={order.paymentStatus}
                fulfillmentType={order.fulfillmentType}
                paidAt={order.paidAt}
                paymentReceivedMethod={order.paymentReceivedMethod}
              />
            </div>
            <PickupInfoCard order={order} />
          </div>

          {/* Order Timeline */}
          <div className="rounded-[2rem] border border-stone-200 bg-white p-6 shadow-sm dark:border-stone-800 dark:bg-stone-900">
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-emerald-600">
              Live Order Milestones
            </p>
            <div className="mt-5">
              <OrderStatusTimeline
                pickupStatus={order.pickupStatus || order.status}
                statusUpdatedAt={order.statusUpdatedAt}
                paymentStatus={order.paymentStatus}
                createdAt={order.createdAt}
                fulfillmentType={order.fulfillmentType}
                acceptedAt={order.acceptedAt}
                preparingAt={order.preparingAt}
                readyForDispatchAt={order.readyForDispatchAt}
                readyForPickupAt={order.readyForPickupAt}
                outForDeliveryAt={order.outForDeliveryAt}
                deliveredAt={order.deliveredAt}
                pickedUpAt={order.pickedUpAt}
              />
            </div>
          </div>

          {/* Support helper */}
          <section className="flex flex-col gap-4 rounded-[2rem] border border-stone-200 bg-white p-6 shadow-sm sm:flex-row sm:items-center sm:justify-between dark:border-stone-800 dark:bg-stone-900">
            <div className="flex items-start gap-3">
              <CircleHelp className="mt-0.5 h-5 w-5 shrink-0 text-emerald-600 dark:text-emerald-400" />
              <div>
                <h2 className="font-semibold text-stone-900 dark:text-stone-50">
                  Have questions about this order?
                </h2>
                <p className="mt-0.5 text-xs text-stone-500">
                  Need to change address or delivery details? Contact customer support or store directly.
                </p>
              </div>
            </div>
            <Button asChild variant="outline">
              <Link href="/support">Customer Support</Link>
            </Button>
          </section>
        </Container>
      </Section>
    </PageWrapper>
  );
}
