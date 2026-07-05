"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Container } from "@/components/layout/container";
import { PageWrapper } from "@/components/layout/page-wrapper";
import { Section } from "@/components/layout/section";
import { SectionHeading } from "@/components/marketplace/SectionHeading";
import { ErrorState } from "@/components/common/error-state";
import { EmptyState } from "@/components/common/empty-state";
import { useOrders } from "@/hooks/use-orders";

export default function OrdersPage() {
  const ordersQuery = useOrders();
  const orders = Array.isArray(ordersQuery.data) ? ordersQuery.data : [];

  return (
    <PageWrapper>
      <Section className="space-y-6 py-8 sm:py-10 lg:py-12">
        <Container className="space-y-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <SectionHeading eyebrow="Orders" title="Your recent orders" description="Review active and completed purchases from the marketplace." />
            </div>
            <Button asChild variant="outline" className="h-fit">
              <Link href="/explore">Continue shopping</Link>
            </Button>
          </div>

          {ordersQuery.isLoading ? (
            <div className="rounded-[2rem] border border-stone-200 bg-white p-6 shadow-sm dark:border-stone-800 dark:bg-stone-900">
              <p className="text-sm text-stone-500">Loading orders …</p>
            </div>
          ) : ordersQuery.isError ? (
            <ErrorState message={ordersQuery.error instanceof Error ? ordersQuery.error.message : "Unable to load your orders."} />
          ) : orders.length ? (
            <div className="space-y-4">
              {orders.map((order) => (
                <div key={order.orderId} className="rounded-[1.5rem] border border-stone-200 bg-white p-5 shadow-sm dark:border-stone-800 dark:bg-stone-900">
                  <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                    <div>
                      <p className="text-sm font-semibold uppercase tracking-[0.24em] text-emerald-600">Order {order.orderId}</p>
                      <h3 className="mt-2 text-lg font-semibold text-stone-900 dark:text-stone-50">{order.status ?? "Draft"}</h3>
                      <p className="mt-2 text-sm text-stone-600 dark:text-stone-300">
                        Placed {order.createdAt ? new Date(order.createdAt).toLocaleDateString() : "recently"}
                      </p>
                    </div>
                    <div className="text-sm text-stone-600 dark:text-stone-300">
                      <p>Payment: {order.paymentStatus ?? "Pending"}</p>
                      <p className="mt-1 font-semibold text-stone-900 dark:text-stone-50">₹{order.grandTotal ?? 0}</p>
                    </div>
                  </div>
                  <div className="mt-4 space-y-2 rounded-[1.25rem] border border-stone-200 bg-stone-50 p-4 text-sm text-stone-600 dark:border-stone-800 dark:bg-stone-950/60 dark:text-stone-300">
                    {(order.orderItems ?? []).slice(0, 3).map((item) => (
                      <div key={item.orderItemId} className="flex items-center justify-between gap-3">
                        <span>{item.name ?? "Product"}</span>
                        <span>×{item.quantity ?? 1}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <EmptyState title="No orders yet" description="Place your first order from the marketplace to see it here." />
          )}
        </Container>
      </Section>
    </PageWrapper>
  );
}
