"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useQueryClient } from "@tanstack/react-query";
import { Container } from "@/components/layout/container";
import { PageWrapper } from "@/components/layout/page-wrapper";
import { Section } from "@/components/layout/section";
import { SectionHeading } from "@/components/marketplace/SectionHeading";
import { ErrorState } from "@/components/common/error-state";
import { EmptyState } from "@/components/common/empty-state";
import { OrderStatusTimeline } from "@/components/profile/OrderStatusTimeline";
import { useOrders } from "@/hooks/use-orders";
import type { OrderRecord } from "@/services/orders";
import { Clock3, MapPin, RefreshCw, Store } from "lucide-react";

const normalizeStatus = (status?: string): string => (status ?? "pending").toLowerCase().replace(/[_-]+/g, " ");

const getOrderStatusLabel = (status?: string): string => {
  const labels: Record<string, string> = {
    ORDER_PLACED: "Order Placed",
    PREPARING: "Preparing",
    READY_FOR_PICKUP: "Ready for Pickup",
    PICKED_UP: "Picked Up",
    CANCELLED: "Cancelled",
  };
  return labels[status ?? ""] ?? "Order Placed";
};

const getStatusClasses = (status: string): string => {
  if (status === "Picked Up" || status === "Paid") return "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900/70 dark:bg-emerald-950/30 dark:text-emerald-300";
  if (status === "Ready for Pickup") return "border-emerald-300 bg-emerald-100 text-emerald-800 dark:border-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-200";
  if (status === "Cancelled") return "border-red-200 bg-red-50 text-red-700 dark:border-red-900/70 dark:bg-red-950/30 dark:text-red-300";
  return "border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-900/70 dark:bg-amber-950/30 dark:text-amber-300";
};

const getPaymentStatusLabel = (status?: string): string => {
  const normalized = normalizeStatus(status);
  if (normalized.includes("partial")) return "Partially Paid";
  if (normalized.includes("paid")) return "Paid";
  if (normalized.includes("cancel")) return "Cancelled";
  return "Pending (Pay at Shop)";
};

type LiveOrder = OrderRecord & { storeName?: string };

export default function OrdersPage() {
  const queryClient = useQueryClient();
  const ordersQuery = useOrders();
  const orders = (Array.isArray(ordersQuery.data) ? ordersQuery.data : []) as LiveOrder[];

  return (
    <PageWrapper>
      <Section className="space-y-6 py-8 sm:py-10 lg:py-12">
        <Container className="space-y-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <SectionHeading eyebrow="Orders" title="Your recent orders" description="Review active and completed purchases from the marketplace." />
            </div>
            <div className="flex flex-wrap gap-2"><Button type="button" variant="outline" className="h-fit" onClick={() => void queryClient.invalidateQueries({ queryKey: ["customer-orders"] })}><RefreshCw className="mr-2 h-4 w-4" />Refresh orders</Button><Button asChild variant="outline" className="h-fit"><Link href="/explore">Continue shopping</Link></Button></div>
          </div>

          {ordersQuery.isLoading ? (
            <div className="rounded-[2rem] border border-stone-200 bg-white p-6 shadow-sm dark:border-stone-800 dark:bg-stone-900">
              <p className="text-sm text-stone-500">Loading orders …</p>
            </div>
          ) : ordersQuery.isError ? (
            <ErrorState message={ordersQuery.error instanceof Error ? ordersQuery.error.message : "Unable to load your orders."} />
          ) : orders.length ? (
            <div className="space-y-4">
              {orders.map((order) => {
                const orderStatus = getOrderStatusLabel(order.pickupStatus);
                const paymentStatus = getPaymentStatusLabel(order.paymentStatus);
                const isReadyForPickup = orderStatus === "Ready for Pickup";
                return (
                    <Link href={`/orders/${encodeURIComponent(order.orderId ?? "pending")}`} key={order.orderId} className="block rounded-[1.5rem] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500">
                  <article className={`rounded-[1.5rem] border bg-white p-5 shadow-sm dark:bg-stone-900 ${isReadyForPickup ? "border-emerald-400 bg-emerald-50/40 dark:border-emerald-700 dark:bg-emerald-950/20" : "border-stone-200 dark:border-stone-800"}`}>
                    {isReadyForPickup ? <div className="mb-5 rounded-[1.25rem] border border-emerald-200 bg-emerald-100 px-4 py-3 text-sm font-semibold text-emerald-800 dark:border-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-200">Your order is ready for pickup.</div> : null}

                    <div className="grid gap-5 lg:grid-cols-[minmax(0,1.5fr)_minmax(220px,0.8fr)]">
                      <div>
                        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                          <div>
                            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-emerald-600">Order {order.orderId ?? "Pending"}</p>
                            <p className="mt-2 text-sm text-stone-600 dark:text-stone-300">Order date: {order.createdAt ? new Date(order.createdAt).toLocaleDateString() : "Recently"}</p>
                          </div>
                          <div className="sm:text-right">
                            <p className="text-sm text-stone-600 dark:text-stone-300">Grand Total</p>
                            <p className="mt-1 text-xl font-semibold text-stone-900 dark:text-stone-50">₹{order.grandTotal ?? 0}</p>
                          </div>
                        </div>

                        <div className="mt-5 flex flex-wrap items-center gap-2">
                          <span className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-semibold ${getStatusClasses(orderStatus)}`}>Order Status: {orderStatus}</span>
                          <span className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-semibold ${getStatusClasses(paymentStatus)}`}>Payment Status: {paymentStatus}</span>
                        </div>

                        <div className="mt-5 flex items-center gap-3 rounded-[1.25rem] border border-stone-200 bg-stone-50 p-4 dark:border-stone-800 dark:bg-stone-950/60">
                          <Store className="h-5 w-5 shrink-0 text-emerald-600 dark:text-emerald-400" />
                          <div>
                            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-stone-500 dark:text-stone-400">Store Name</p>
                            <p className="mt-1 font-semibold text-stone-900 dark:text-stone-50">{order.storeName ?? "SheoMart Store"}</p>
                          </div>
                        </div>

                        <div className="mt-4 grid gap-3 sm:grid-cols-2">
                          <div className="rounded-[1.25rem] border border-stone-200 bg-stone-50 p-4 text-sm dark:border-stone-800 dark:bg-stone-950/60">
                            <p className="flex items-center gap-2 font-semibold text-stone-900 dark:text-stone-50"><MapPin className="h-4 w-4 text-emerald-600 dark:text-emerald-400" /> Pickup Address</p>
                            <p className="mt-2 text-stone-600 dark:text-stone-300">Main Market, Sheopur</p>
                          </div>
                          <div className="rounded-[1.25rem] border border-stone-200 bg-stone-50 p-4 text-sm dark:border-stone-800 dark:bg-stone-950/60">
                            <p className="flex items-center gap-2 font-semibold text-stone-900 dark:text-stone-50"><Clock3 className="h-4 w-4 text-emerald-600 dark:text-emerald-400" /> Pickup Hours</p>
                            <p className="mt-2 text-stone-600 dark:text-stone-300">10:00 AM - 8:00 PM</p>
                            <p className="mt-1 text-xs text-stone-500 dark:text-stone-400">Estimated pickup: 30 - 45 minutes</p>
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

                      <div className="rounded-[1.25rem] border border-stone-200 bg-stone-50 p-4 dark:border-stone-800 dark:bg-stone-950/60">
                        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-emerald-600">Order timeline</p>
                        <div className="mt-4"><OrderStatusTimeline pickupStatus={order.pickupStatus} statusUpdatedAt={order.statusUpdatedAt} /></div>
                      </div>
                    </div>
                  </article>
                  </Link>
                );
              })}
            </div>
          ) : (
            <EmptyState title="No pickup or marketplace orders yet." description="Place your first order from the marketplace to see pickup details and order progress here." />
          )}
        </Container>
      </Section>
    </PageWrapper>
  );
}
