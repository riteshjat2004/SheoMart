"use client";

import { createPaymentOrder, verifyPayment } from "@/services/payment";
import { loadRazorpay } from "@/lib/loadRazorpay";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
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
import { CheckCircle2, Clock3, MapPin, Store, Truck } from "lucide-react";

export default function CheckoutPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const cartQuery = useCart();
  const addressesQuery = useAddresses();
  const [draftOrder, setDraftOrder] = useState<Awaited<ReturnType<typeof createDraftOrder>> | null>(null);
  const [draftError, setDraftError] = useState<string | null>(null);

  const [paymentMethod, setPaymentMethod] =
    useState<"cod" | "online">("cod");
  const [paymentOption, setPaymentOption] = useState<"cash" | "upi" | "credit">("cash");
  const [deliveryMethod, setDeliveryMethod] = useState<"pickup" | "delivery">("pickup");

  const [selectedAddressId] = useState<string>("");
  const [creatingOrder, setCreatingOrder] = useState(false);
  const [paying, setPaying] = useState(false);
  const [paymentError, setPaymentError] = useState<string | null>(null);

  const cartData = cartQuery.data ?? { cartItems: [], summary: { totalItems: 0, subtotal: 0, totalProducts: 0, estimatedSavings: 0, hasUnavailableItems: false } };
  const cartItems = cartData.cartItems ?? [];
  const totals = cartData.summary ?? { totalItems: 0, subtotal: 0, totalProducts: 0, estimatedSavings: 0, hasUnavailableItems: false };
  const addresses = useMemo(
    () => (Array.isArray(addressesQuery.data) ? addressesQuery.data : []),
    [addressesQuery.data]
  );

  const defaultAddress = useMemo(
    () => addresses.find(a => a.isDefault) ?? addresses[0],
    [addresses]
  );

  const goBackToCart = () => router.push("/cart");

  const handleContinue = async () => {
      try {

          setCreatingOrder(true);

          const order = await createDraftOrder({

              addressId: selectedAddressId || defaultAddress?.addressId || "",

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

  const handlePayment = async () => {
    if (!draftOrder?.orderId) {
      setPaymentError("Create a draft order before paying.");
      return;
    }

    try {
      setPaying(true);
      setPaymentError(null);

      const loaded = await loadRazorpay();
      if (!loaded) {
        throw new Error("Unable to load Razorpay.");
      }

      const payment = await createPaymentOrder(draftOrder.orderId);

      const options = {
        key: payment.key,
        amount: payment.amount,
        currency: payment.currency,
        order_id: payment.razorpayOrderId,
        name: "SheoMart",
        description: `Order ${payment.orderId}`,
        handler: async (response: {
          razorpay_order_id: string;
          razorpay_payment_id: string;
          razorpay_signature: string;
        }) => {
          try {
            await verifyPayment({
              razorpayOrderId: response.razorpay_order_id,
              razorpayPaymentId: response.razorpay_payment_id,
              razorpaySignature: response.razorpay_signature,
            });

            await queryClient.invalidateQueries({ queryKey: ["cart"] });
            await queryClient.invalidateQueries({ queryKey: ["orders"] });
            await queryClient.invalidateQueries({ queryKey: ["checkout"] });
            router.push("/orders");
          } catch (error) {
            setPaymentError(error instanceof Error ? error.message : "Payment verification failed.");
          }
        },
        prefill: {
          name: "SheoMart Customer",
          email: "customer@example.com",
          contact: "9999999999",
        },
        theme: {
          color: "#16a34a",
        },
        modal: {
          ondismiss: () => {
            setPaymentError("Payment was cancelled.");
          },
        },
      };

      const razorpayWindow = window as typeof window & {
        Razorpay?: new (options: Record<string, unknown>) => { open: () => void };
      };

      const Razorpay = razorpayWindow.Razorpay;
      if (!Razorpay) {
        throw new Error("Razorpay SDK not available.");
      }

      const razorpayInstance = new Razorpay(options);
      razorpayInstance.open();
    } catch (error) {
      setPaymentError(error instanceof Error ? error.message : "Unable to start payment.");
    } finally {
      setPaying(false);
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
                  <h3 className="text-sm font-semibold uppercase tracking-[0.28em] text-emerald-600">Delivery method</h3>
                  <div className="mt-4 grid gap-3 sm:grid-cols-2">
                    {[
                      { id: "pickup" as const, title: "Store Pickup", description: "Collect your order from the store.", icon: Store },
                      { id: "delivery" as const, title: "Home Delivery", description: "Available only if this store supports delivery.", icon: Truck },
                    ].map((method) => {
                      const Icon = method.icon;
                      const isSelected = deliveryMethod === method.id;
                      return (
                        <button
                          key={method.id}
                          type="button"
                          onClick={() => setDeliveryMethod(method.id)}
                          className={`relative rounded-[1.5rem] border p-4 text-left transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 ${isSelected ? "border-emerald-500 bg-emerald-50/70 dark:border-emerald-400 dark:bg-emerald-500/10" : "border-stone-200 bg-stone-50 hover:border-emerald-300 dark:border-stone-800 dark:bg-stone-950/60 dark:hover:border-emerald-800"}`}
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div className="flex items-center gap-3">
                              <Icon className={`h-5 w-5 ${isSelected ? "text-emerald-600 dark:text-emerald-400" : "text-stone-500"}`} />
                              <span className="font-semibold text-stone-900 dark:text-stone-50">{method.title}</span>
                            </div>
                            {isSelected ? <CheckCircle2 className="h-5 w-5 text-emerald-600 dark:text-emerald-400" /> : null}
                          </div>
                          <p className="mt-3 text-sm leading-6 text-stone-600 dark:text-stone-300">{method.description}</p>
                          {method.id === "delivery" ? <span className="mt-3 inline-flex rounded-full bg-stone-200 px-2 py-1 text-xs font-medium text-stone-600 dark:bg-stone-800 dark:text-stone-300">Coming soon</span> : null}
                        </button>
                      );
                    })}
                  </div>
                </div>

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
                    <div className="flex items-center justify-between border-t border-stone-200 pt-3 font-medium text-emerald-700 dark:border-stone-800 dark:text-emerald-400">
                      <span>Payment Status</span>
                      <span>Pending (Pay at Shop)</span>
                    </div>
                  </div>
                </div>

                <div className="rounded-[2rem] border border-stone-200 bg-white p-6 shadow-sm dark:border-stone-800 dark:bg-stone-900">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h3 className="text-sm font-semibold uppercase tracking-[0.28em] text-emerald-600">Pickup information</h3>
                      <p className="mt-2 text-sm text-stone-600 dark:text-stone-300">Placeholder store details for your selected pickup.</p>
                    </div>
                    <MapPin className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                  </div>
                  <div className="mt-4 grid gap-3 sm:grid-cols-2">
                    <div className="rounded-[1.25rem] bg-stone-50 p-4 dark:bg-stone-950/60">
                      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-stone-500 dark:text-stone-400">Store Name</p>
                      <p className="mt-2 font-semibold text-stone-900 dark:text-stone-50">SheoMart Store</p>
                    </div>
                    <div className="rounded-[1.25rem] bg-stone-50 p-4 dark:bg-stone-950/60">
                      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-stone-500 dark:text-stone-400">Pickup Address</p>
                      <p className="mt-2 text-sm text-stone-700 dark:text-stone-200">Main Market, Sheopur</p>
                    </div>
                    <div className="rounded-[1.25rem] bg-stone-50 p-4 dark:bg-stone-950/60">
                      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-stone-500 dark:text-stone-400">Pickup Hours</p>
                      <p className="mt-2 text-sm text-stone-700 dark:text-stone-200">10:00 AM - 8:00 PM</p>
                    </div>
                    <div className="rounded-[1.25rem] bg-stone-50 p-4 dark:bg-stone-950/60">
                      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-stone-500 dark:text-stone-400">Estimated pickup time</p>
                      <p className="mt-2 flex items-center gap-2 text-sm text-stone-700 dark:text-stone-200"><Clock3 className="h-4 w-4 text-emerald-600 dark:text-emerald-400" /> 30 - 45 minutes</p>
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
                      disabled={!(selectedAddressId || defaultAddress?.addressId) || creatingOrder}
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
                <div className="rounded-[2rem] border border-stone-200 bg-white p-6 shadow-sm text-black">
                  <h3 className="text-sm font-semibold uppercase tracking-[0.28em] text-emerald-600">Payment Method</h3>
                  <div className="mt-4 space-y-3">
                    {[
                      { id: "cash" as const, label: "Cash at Shop", helper: "Pay when you collect your order." },
                      { id: "upi" as const, label: "UPI at Shop", helper: "Pay by UPI during pickup." },
                      { id: "credit" as const, label: "Credit", helper: "Pay at shop during pickup." },
                    ].map((option) => (
                      <label key={option.id} className="flex cursor-pointer items-center gap-3 rounded-[1.25rem] border border-stone-200 bg-stone-50 p-4 text-stone-700 transition has-[:checked]:border-emerald-500 has-[:checked]:bg-emerald-50/70 dark:border-stone-800 dark:bg-stone-950/60 dark:text-stone-200 dark:has-[:checked]:border-emerald-400 dark:has-[:checked]:bg-emerald-500/10">
                        <input
                          type="radio"
                          name="checkout-payment-method"
                          checked={paymentOption === option.id}
                          onChange={() => {
                            setPaymentOption(option.id);
                            setPaymentMethod("cod");
                          }}
                          className="accent-emerald-600"
                        />
                        <span className="flex-1">
                          <span className="block font-semibold">{option.label}</span>
                          <span className="mt-1 block text-sm text-stone-500 dark:text-stone-400">{option.helper}</span>
                        </span>
                      </label>
                    ))}
                  </div>
                  <p className="mt-4 text-xs text-stone-500 dark:text-stone-400">Online payments will be available in a future update.</p>
                  <div className="mt-5 rounded-[1.25rem] border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-800 dark:border-emerald-900/70 dark:bg-emerald-950/30 dark:text-emerald-300">
                    <p className="font-semibold">PLUS Customer</p>
                    <p className="mt-1">Plus customers can pay at the shop during pickup.</p>
                  </div>
                </div>

                <div className="rounded-[2rem] border border-stone-200 bg-white p-6 shadow-sm dark:border-stone-800 dark:bg-stone-900">
                  <h3 className="text-sm font-semibold uppercase tracking-[0.28em] text-emerald-600">Payment integration</h3>
                  <div className="mt-4 rounded-[1.5rem] border border-stone-200 bg-stone-50 p-4 text-sm text-stone-600 dark:border-stone-800 dark:bg-stone-950/60 dark:text-stone-300">
                    <p className="font-semibold text-stone-900 dark:text-stone-50">Payment Integration Coming Soon</p>
                    <p className="mt-2">A future release will add secure online payment support.</p>
                  </div>
                  {paymentError ? (
                    <div className="mt-4 rounded-[1.25rem] border border-amber-200 bg-amber-50 p-4 text-sm text-amber-700 dark:border-amber-900/70 dark:bg-amber-950/30 dark:text-amber-300">
                      {paymentError}
                    </div>
                  ) : null}
                  <Button
                      type="button"
                      className="mt-4 w-full"
                      disabled={!draftOrder || paying}
                      onClick={handlePayment}
                  >
                      {paying ? "Processing..." : "Pay Now"}
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
