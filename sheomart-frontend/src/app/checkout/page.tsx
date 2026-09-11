"use client";

import { createPaymentOrder, verifyPayment } from "@/services/payment";
import { loadRazorpay } from "@/lib/loadRazorpay";
import { useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Container } from "@/components/layout/container";
import { PageWrapper } from "@/components/layout/page-wrapper";
import { Section } from "@/components/layout/section";
import { SectionHeading } from "@/components/marketplace/SectionHeading";
import { EmptyState } from "@/components/common/empty-state";
import { ErrorState } from "@/components/common/error-state";
import { LoadingSkeleton } from "@/components/dashboard/LoadingSkeleton";
import { DeliveryMethodCard } from "@/components/checkout/DeliveryMethodCard";
import { PickupInfoCard } from "@/components/checkout/PickupInfoCard";
import { PaymentMethodCard } from "@/components/checkout/PaymentMethodCard";
import { OrderSummaryCard } from "@/components/checkout/OrderSummaryCard";
import { useCart } from "@/hooks/use-cart";
import { useAddresses } from "@/hooks/use-addresses";
import { useStore } from "@/hooks/use-store";
import { useStoreCustomer } from "@/hooks/use-store-customer";
import { useAuthStore } from "@/store/auth-store";
import { createDraftOrder } from "@/services/orders";
import { fetchActiveOffers, validateCoupon, type CouponValidation } from "@/services/promotions";

type PaymentOption = "online" | "cash" | "upi" | "credit";

export default function CheckoutPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const pickupRef = useRef<HTMLDivElement>(null);
  const user = useAuthStore((state) => state.user);
  const cartQuery = useCart();
  const addressesQuery = useAddresses();
  const [stage, setStage] = useState<1 | 2>(1);
  const [selectedAddressId, setSelectedAddressId] = useState("");
  const [paymentOption, setPaymentOption] = useState<PaymentOption>("online");
  const [deliveryMethod, setDeliveryMethod] = useState<"pickup" | "delivery">(
    "pickup",
  );
  const [creatingOrder, setCreatingOrder] = useState(false);
  const [draftError, setDraftError] = useState<string | null>(null);
  const [orderSuccess, setOrderSuccess] = useState<string | null>(null);
  const [draftOrder, setDraftOrder] = useState<Awaited<
    ReturnType<typeof createDraftOrder>
  > | null>(null);
  const [paying, setPaying] = useState(false);
  const [paymentError, setPaymentError] = useState<string | null>(null);
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [couponCode, setCouponCode] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState<CouponValidation | null>(null);
  const [couponMessage, setCouponMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const cartData = cartQuery.data ?? {
    cartItems: [],
    summary: {
      totalItems: 0,
      subtotal: 0,
      totalProducts: 0,
      estimatedSavings: 0,
      hasUnavailableItems: false,
    },
  };
  const cartItems = cartData.cartItems;
  const totals = cartData.summary;
  const storeIds = [
    ...new Set(
      cartItems
        .map((item) => item.product.storeId)
        .filter((value): value is string => Boolean(value)),
    ),
  ];
  const storeId = storeIds[0];
  const storeQuery = useStore(storeId);
  const activeOffersQuery = useQuery({ queryKey: ["active-offers"], queryFn: fetchActiveOffers, staleTime: 60000 });
  const customerQuery = useStoreCustomer(user?.userId ?? null, null, storeId);
  const store = storeQuery.data;
  const addresses = useMemo(
    () => (Array.isArray(addressesQuery.data) ? addressesQuery.data : []),
    [addressesQuery.data],
  );
  const selectedAddress =
    addresses.find((address) => address.addressId === selectedAddressId) ??
    addresses.find((address) => address.isDefault) ??
    addresses[0];
  const isPlusCustomer =
    !customerQuery.isError &&
    Boolean(
      customerQuery.data?.isPlusCustomer ??
      customerQuery.data?.customer?.isPlusCustomer,
    );
  const membershipFailed = customerQuery.isError;
  const paymentValue = isPlusCustomer
    ? paymentOption === "online"
      ? "cash"
      : paymentOption
    : "online";
  const paymentLabel =
    paymentValue === "online"
      ? "Online Payment"
      : paymentValue === "cash"
        ? "Cash at Shop"
        : paymentValue === "upi"
          ? "UPI at Shop"
          : "Credit";
  const deliveryEnabled = Boolean(
    (store as (typeof store & { deliveryEnabled?: boolean }) | null)
      ?.deliveryEnabled,
  );
  const loading =
    cartQuery.isLoading ||
    addressesQuery.isLoading ||
    Boolean(storeId && storeQuery.isLoading) ||
    Boolean(storeId && customerQuery.isLoading);
  const festivalSavings = useMemo(() => cartItems.reduce((total, item) => {
    const categoryId = item.product.categoryId ?? "";
    const offer = activeOffersQuery.data?.find((candidate) => candidate.categoryIds.length === 0 || candidate.categoryIds.includes(categoryId));
    if (!offer) return total;
    const price = item.product.discountPrice ?? item.product.price ?? 0;
    const raw = offer.discountType === "percentage" ? price * item.quantity * offer.discountValue / 100 : offer.discountValue * item.quantity;
    return total + Math.min(price * item.quantity, raw);
  }, 0), [activeOffersQuery.data, cartItems]);
  const deliveryFee = deliveryMethod === "delivery" ? 50 : 0;
  const platformFee = deliveryMethod === "delivery" ? 10 : 0;
  const deliverySavings = deliveryMethod === "pickup" ? 50 : 0;
  const finalPayable = Math.max(0, totals.subtotal - totals.estimatedSavings - festivalSavings - (appliedCoupon?.discount ?? 0) + deliveryFee + platformFee);

  const applyCoupon = async () => {
    if (!couponCode.trim()) return;
    try {
      setCouponMessage(null);
      const validation = await validateCoupon(couponCode, totals.subtotal);
      setAppliedCoupon(validation ?? null);
      setCouponMessage({ type: "success", text: `${validation?.code ?? couponCode.toUpperCase()} applied successfully.` });
    } catch (error) {
      setAppliedCoupon(null);
      setCouponMessage({ type: "error", text: error instanceof Error ? error.message : "Unable to apply coupon." });
    }
  };

  const continueToPickup = () => {
    if (!selectedAddress?.addressId) {
      setDraftError("Please select a delivery address before continuing.");
      return;
    }
    setDraftError(null);
    setStage(2);
    window.setTimeout(
      () =>
        pickupRef.current?.scrollIntoView({
          behavior: "smooth",
          block: "start",
        }),
      0,
    );
  };

  const placeOrder = async () => {
    try {
      if (!termsAccepted) {
        setDraftError("Please accept the terms before placing your order.");
        return;
      }
      setCreatingOrder(true);
      setDraftError(null);
      setOrderSuccess(null);
      const payload = {
        addressId: selectedAddress?.addressId || "",
        deliveryDate: new Date(Date.now() + 86400000)
          .toISOString()
          .slice(0, 10),
        deliverySlot: "10:00 AM - 12:00 PM",
        paymentMethod: (paymentValue === "online" ? "online" : "cod") as
          "cod" | "online",
        deliveryMethod,
        storeId: storeId || "",
        ...(appliedCoupon?.code ? { couponCode: appliedCoupon.code } : {}),
      };
      const order = await createDraftOrder(payload);
      setDraftOrder(order);
      setOrderSuccess("Order created successfully.");
      window.setTimeout(() => {
        window.alert(orderSuccess || "Order created successfully.");
        router.push("/orders");
      }, 500);
    } catch (error) {
      setDraftError(
        error instanceof Error ? error.message : "Unable to create order.",
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
      if (!loaded) throw new Error("Unable to load Razorpay.");
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
            await Promise.all([
              queryClient.invalidateQueries({ queryKey: ["cart"] }),
              queryClient.invalidateQueries({ queryKey: ["orders"] }),
              queryClient.invalidateQueries({ queryKey: ["checkout"] }),
            ]);
            router.push("/orders");
          } catch (error) {
            setPaymentError(
              error instanceof Error
                ? error.message
                : "Payment verification failed.",
            );
          }
        },
        prefill: {
          name: "SheoMart Customer",
          email: "customer@example.com",
          contact: "9999999999",
        },
        theme: { color: "#16a34a" },
        modal: { ondismiss: () => setPaymentError("Payment was cancelled.") },
      };
      const Razorpay = (
        window as typeof window & {
          Razorpay?: new (options: Record<string, unknown>) => {
            open: () => void;
          };
        }
      ).Razorpay;
      if (!Razorpay) throw new Error("Razorpay SDK not available.");
      new Razorpay(options).open();
    } catch (error) {
      setPaymentError(
        error instanceof Error ? error.message : "Unable to start payment.",
      );
    } finally {
      setPaying(false);
    }
  };
  void handlePayment;
  void paying;
  void paymentError;

  return (
    <PageWrapper>
      <Section className="space-y-6 py-8 sm:py-10 lg:py-12">
        <Container className="space-y-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <SectionHeading
              eyebrow="Checkout"
              title="Complete your order"
              description="Address, pickup, payment, then review your order."
            />
            <Button
              type="button"
              variant="outline"
              onClick={() => router.push("/cart")}
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to cart
            </Button>
          </div>
          {loading ? (
            <LoadingSkeleton rows={6} />
          ) : cartItems.length === 0 ? (
            <EmptyState
              title="Your cart is empty"
              description="Add products before you continue to checkout."
            />
          ) : storeIds.length > 1 ? (
            <ErrorState message="Checkout is available for one store at a time." />
          ) : totals.hasUnavailableItems ? (
            <ErrorState message="Please resolve unavailable items before continuing." />
          ) : (
            <div className="space-y-6">
              <section className="rounded-2xl border border-stone-200 bg-white p-6 shadow-sm dark:border-stone-800 dark:bg-stone-900">
                <h2 className="text-lg font-semibold">1. Delivery address</h2>
                <div className="mt-4 grid gap-3 sm:grid-cols-2">
                  {addresses.map((address) => (
                    <button
                      key={address.addressId}
                      type="button"
                      onClick={() =>
                        setSelectedAddressId(address.addressId ?? "")
                      }
                      className={`rounded-xl border p-4 text-left ${selectedAddress?.addressId === address.addressId ? "border-emerald-500 bg-emerald-50/70" : "border-stone-200"}`}
                    >
                      <p className="font-semibold">{address.fullName}</p>
                      <p className="mt-1 text-sm">
                        {[
                          address.house,
                          address.street,
                          address.city,
                          address.state,
                          address.pincode,
                        ]
                          .filter(Boolean)
                          .join(", ")}
                      </p>
                      <p className="mt-1 text-sm">{address.mobile}</p>
                    </button>
                  ))}
                </div>
                {draftError ? (
                  <div
                    role="alert"
                    className="mt-4 rounded-xl border border-rose-200 bg-rose-50 p-3 text-sm text-rose-700"
                  >
                    {draftError}
                  </div>
                ) : null}
                <Button
                  type="button"
                  className="mt-5"
                  onClick={continueToPickup}
                >
                  Continue
                </Button>
              </section>
              {stage === 2 ? (
                <div
                  ref={pickupRef}
                  className="grid items-start gap-6 xl:grid-cols-[minmax(0,1.1fr)_minmax(20rem,0.9fr)]"
                >
                  <div className="space-y-6">
                    <DeliveryMethodCard
                      value={deliveryMethod}
                      onChange={(value) =>
                        setDeliveryMethod(
                          deliveryEnabled || value === "pickup"
                            ? value
                            : "pickup",
                        )
                      }
                    />
                    <PickupInfoCard store={store ?? null} />
                    <PaymentMethodCard
                      value={paymentValue}
                      onChange={setPaymentOption}
                      isPlusCustomer={isPlusCustomer}
                      membershipFailed={membershipFailed}
                    />
                    <section className="rounded-2xl border border-stone-200 bg-white p-5 shadow-sm dark:border-stone-800 dark:bg-stone-900">
                      <h2 className="text-lg font-semibold">Apply coupon</h2>
                      <div className="mt-4 flex flex-col gap-2 sm:flex-row">
                        <input value={couponCode} onChange={(event) => setCouponCode(event.target.value.toUpperCase())} placeholder="Enter coupon code" className="min-h-11 flex-1 rounded-lg border border-stone-200 bg-white px-3 text-sm uppercase outline-none focus:border-emerald-500 dark:border-stone-700 dark:bg-stone-950" disabled={Boolean(appliedCoupon)} />
                        {appliedCoupon ? <Button type="button" variant="outline" onClick={() => { setAppliedCoupon(null); setCouponMessage(null); }}>Remove</Button> : <Button type="button" onClick={applyCoupon}>Apply Coupon</Button>}
                      </div>
                      {couponMessage ? <p role="status" className={`mt-3 rounded-lg border p-3 text-sm ${couponMessage.type === "success" ? "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900/70 dark:bg-emerald-950/40 dark:text-emerald-300" : "border-rose-200 bg-rose-50 text-rose-700 dark:border-rose-900/70 dark:bg-rose-950/40 dark:text-rose-300"}`}>{couponMessage.text}</p> : null}
                      {festivalSavings > 0 ? <p className="mt-3 text-sm text-emerald-700 dark:text-emerald-300">Festival offers applied: save ₹{festivalSavings.toLocaleString("en-IN")}</p> : null}
                    </section>
                    <OrderSummaryCard
                      totalItems={totals.totalItems}
                      estimatedPickup="30 - 45 minutes"
                      paymentMethod={paymentLabel}
                      deliveryMethod={
                        deliveryMethod === "pickup" ? "Pickup" : "Delivery"
                      }
                      address={[
                        selectedAddress?.house,
                        selectedAddress?.street,
                        selectedAddress?.city,
                        selectedAddress?.state,
                        selectedAddress?.pincode,
                      ]
                        .filter(Boolean)
                        .join(", ")}
                      storeName={store?.storeName ?? store?.name ?? "Store"}
                      subtotal={totals.subtotal}
                      deliveryFee={deliveryFee}
                      discount={totals.estimatedSavings}
                      festivalSavings={festivalSavings}
                      couponSavings={appliedCoupon?.discount ?? 0}
                      deliverySavings={deliverySavings}
                      platformFee={platformFee}
                      grandTotal={finalPayable}
                      isSubmitting={creatingOrder}
                      termsAccepted={termsAccepted}
                      onTermsChange={setTermsAccepted}
                      onPlaceOrder={placeOrder}
                    />
                    {orderSuccess ? (
                      <div
                        role="status"
                        className="rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-700"
                      >
                        {orderSuccess}
                      </div>
                    ) : null}
                  </div>
                  <div className="hidden xl:block" />
                </div>
              ) : null}
            </div>
          )}
        </Container>
      </Section>
    </PageWrapper>
  );
}
