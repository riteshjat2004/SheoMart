"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Container } from "@/components/layout/container";
import { PageWrapper } from "@/components/layout/page-wrapper";
import { Section } from "@/components/layout/section";
import { SectionHeading } from "@/components/marketplace/SectionHeading";
import { ErrorState } from "@/components/common/error-state";
import { EmptyState } from "@/components/common/empty-state";
import { useCart } from "@/hooks/use-cart";
import { useAddresses } from "@/hooks/use-addresses";
import { createDraftOrder } from "@/services/orders";

export default function CheckoutPage() {
  const router = useRouter();
  const cartQuery = useCart();
  const addressesQuery = useAddresses();
  const [draftOrder, setDraftOrder] = useState<Awaited<ReturnType<typeof createDraftOrder>> | null>(null);
  const [draftError, setDraftError] = useState<string | null>(null);

  const [paymentMethod, setPaymentMethod] =
    useState<"cod" | "online">("cod");

  const [selectedAddressId, setSelectedAddressId] = useState<string>("");
  const [creatingOrder, setCreatingOrder] = useState(false);

  const cartData = cartQuery.data ?? { cartItems: [], summary: { totalItems: 0, subtotal: 0, totalProducts: 0, estimatedSavings: 0, hasUnavailableItems: false } };
  const cartItems = cartData.cartItems ?? [];
  const totals = cartData.summary ?? { totalItems: 0, subtotal: 0, totalProducts: 0, estimatedSavings: 0, hasUnavailableItems: false };
  const addresses = Array.isArray(addressesQuery.data) ? addressesQuery.data : [];

  const defaultAddress = useMemo(
    () => addresses.find(a => a.isDefault) ?? addresses[0],
    [addresses]
  );

  useEffect(() => {
    if (defaultAddress && !selectedAddressId) {
      setSelectedAddressId(defaultAddress.addressId!);
    }
  }, [defaultAddress, selectedAddressId]);





  const goBackToCart = () => router.push("/cart");

  const handleContinue = async () => {
      try {

          setCreatingOrder(true);

          const order = await createDraftOrder({

              addressId: selectedAddressId,

              deliveryDate: new Date(
                  Date.now() + 86400000
              ).toISOString().slice(0,10),

              deliverySlot: "10:00 AM - 12:00 PM",

              paymentMethod,

          });

          setDraftOrder(order);

      } catch (error) {

          setDraftError(
              error instanceof Error
                  ? error.message
                  : "Unable to create order."
          );

      } finally {

          setCreatingOrder(false);

      }
  };

  return (
    <PageWrapper>
      <Section className="space-y-6 py-8 sm:py-10 lg:py-12">
        <Container className="space-y-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <SectionHeading eyebrow="Checkout" title="Review your order" description="A simple placeholder checkout flow for the current cart." />
            </div>
            <Button asChild variant="outline" className="h-fit">
              <button type="button" onClick={goBackToCart}>Back to cart</button>
            </Button>
          </div>

          {cartQuery.isLoading || addressesQuery.isLoading ? (
            <div className="rounded-[2rem] border border-stone-200 bg-white p-6 shadow-sm dark:border-stone-800 dark:bg-stone-900">
              <p className="text-sm text-stone-500">Preparing checkout…</p>
            </div>
          ) : cartItems.length === 0 ? (
            <EmptyState title="Your cart is empty" description="Add products before you continue to checkout." />
          ) : totals.hasUnavailableItems ? (
            <ErrorState message="Please resolve unavailable items before continuing." />
          ) : (
            <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
              <div className="space-y-6">
                <div className="rounded-[2rem] border border-stone-200 bg-white p-6 shadow-sm dark:border-stone-800 dark:bg-stone-900">
                  <h3 className="text-sm font-semibold uppercase tracking-[0.28em] text-emerald-600">Order summary</h3>
                  <div className="mt-4 space-y-3 text-sm text-stone-600 dark:text-stone-300">
                    <div className="flex items-center justify-between">
                      <span>Subtotal</span>
                      <span className="font-semibold text-stone-900 dark:text-stone-50">₹{totals.subtotal}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Estimated savings</span>
                      <span className="font-semibold text-emerald-700 dark:text-emerald-400">₹{totals.estimatedSavings}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Total</span>
                      <span className="font-semibold text-stone-900 dark:text-stone-50">₹{totals.subtotal}</span>
                    </div>
                  </div>
                </div>

                <div className="rounded-[2rem] border border-stone-200 bg-white p-6 shadow-sm dark:border-stone-800 dark:bg-stone-900">
                  <h3 className="text-sm font-semibold uppercase tracking-[0.28em] text-emerald-600">Shipping address</h3>
                  {defaultAddress ? (
                    <div className="mt-4 rounded-[1.5rem] border border-stone-200 bg-stone-50 p-4 text-sm text-stone-600 dark:border-stone-800 dark:bg-stone-950/60 dark:text-stone-300">
                      <p className="font-semibold text-stone-900 dark:text-stone-50">{defaultAddress.fullName}</p>
                      <p className="mt-1">{defaultAddress.house}, {defaultAddress.street}</p>
                      <p>{defaultAddress.city}, {defaultAddress.state} - {defaultAddress.pincode}</p>
                      <p className="mt-1">{defaultAddress.mobile}</p>
                    </div>
                  ) : (
                    <p className="mt-4 text-sm text-stone-500">No delivery address found.</p>
                  )}

                  <Button
                      className="mt-4 w-full"
                      onClick={handleContinue}
                      disabled={!selectedAddressId || creatingOrder}
                  >
                      {creatingOrder ? "Creating Order..." : "Continue"}
                  </Button>

                </div>

                <div className="rounded-[2rem] border border-stone-200 bg-white p-6 shadow-sm dark:border-stone-800 dark:bg-stone-900">
                  <h3 className="text-sm font-semibold uppercase tracking-[0.28em] text-emerald-600">Cart items</h3>
                  <div className="mt-4 space-y-3">
                    {cartItems.map((item) => (
                      <div key={item.cartItemId} className="flex items-center justify-between rounded-[1.25rem] border border-stone-200 bg-stone-50 p-3 text-sm dark:border-stone-800 dark:bg-stone-950/60">
                        <span>{item.product.name} × {item.quantity}</span>
                        <span className="font-semibold text-stone-900 dark:text-stone-50">₹{(item.product.discountPrice ?? item.product.price) * item.quantity}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="space-y-6">
                <div className="rounded-[2rem] border border-stone-200 bg-white p-6 shadow-sm">
                    <h3 className="font-semibold">
                        Payment Method
                    </h3>

                    <div className="mt-4 space-y-3">

                        <label className="flex items-center gap-3">
                            <input
                                type="radio"
                                checked={paymentMethod === "cod"}
                                onChange={() => setPaymentMethod("cod")}
                            />
                            Cash on Delivery
                        </label>

                        <label className="flex items-center gap-3">
                            <input
                                type="radio"
                                checked={paymentMethod === "online"}
                                onChange={() => setPaymentMethod("online")}
                            />
                            Online Payment
                        </label>

                    </div>
                </div>

                <div className="rounded-[2rem] border border-stone-200 bg-white p-6 shadow-sm dark:border-stone-800 dark:bg-stone-900">
                  <h3 className="text-sm font-semibold uppercase tracking-[0.28em] text-emerald-600">Payment integration</h3>
                  <div className="mt-4 rounded-[1.5rem] border border-stone-200 bg-stone-50 p-4 text-sm text-stone-600 dark:border-stone-800 dark:bg-stone-950/60 dark:text-stone-300">
                    <p className="font-semibold text-stone-900 dark:text-stone-50">Payment Integration Coming Soon</p>
                    <p className="mt-2">A future release will add secure online payment support.</p>
                  </div>
                  <Button type="button" className="mt-4 w-full" disabled>
                    Pay Now
                  </Button>
                </div>

                <div className="rounded-[2rem] border border-stone-200 bg-white p-6 shadow-sm dark:border-stone-800 dark:bg-stone-900">
                  <h3 className="text-sm font-semibold uppercase tracking-[0.28em] text-emerald-600">Order placeholder</h3>
                  {draftError ? (
                    <div className="mt-4 rounded-[1.25rem] border border-amber-200 bg-amber-50 p-4 text-sm text-amber-700 dark:border-amber-900/70 dark:bg-amber-950/30 dark:text-amber-300">
                      {draftError}
                    </div>
                  ) : draftOrder ? (
                    <div className="mt-4 space-y-2 text-sm text-stone-600 dark:text-stone-300">
                      <p className="font-semibold text-stone-900 dark:text-stone-50">Draft Order created</p>
                      <p>Order ID: {draftOrder.orderId}</p>
                      <p>Status: {draftOrder.status}</p>
                      <p>Total: ₹{draftOrder.grandTotal ?? totals.subtotal}</p>
                    </div>
                  ) : (
                    <p className="mt-4 text-sm text-stone-600 dark:text-stone-300">Order will be generated after payment integration.</p>
                  )}
                </div>
              </div>
            </div>
          )}
        </Container>
      </Section>
    </PageWrapper>
  );
}
