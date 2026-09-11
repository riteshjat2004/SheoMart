"use client";

import { createPaymentOrder, verifyPayment } from "@/services/payment";
import { loadRazorpay } from "@/lib/loadRazorpay";
import { useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { FulfillmentSelector } from "@/components/checkout/FulfillmentSelector";
import { FulfillmentInfoCard } from "@/components/checkout/FulfillmentInfoCard";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Container } from "@/components/layout/container";
import { PageWrapper } from "@/components/layout/page-wrapper";
import { Section } from "@/components/layout/section";
import { SectionHeading } from "@/components/marketplace/SectionHeading";
import { EmptyState } from "@/components/common/empty-state";
import { ErrorState } from "@/components/common/error-state";
import { LoadingSkeleton } from "@/components/dashboard/LoadingSkeleton";
import { PaymentSelector, type CheckoutPaymentMethod } from "@/components/checkout/PaymentSelector";
import { MembershipBanner } from "@/components/checkout/MembershipBanner";
import { PaymentStatusCard } from "@/components/checkout/PaymentStatusCard";
import { PaymentValidationNotice } from "@/components/checkout/PaymentValidationNotice";
import { OrderSummaryCard } from "@/components/checkout/OrderSummaryCard";
import { useCart } from "@/hooks/use-cart";
import { useAddresses, useAddAddress, useRemoveAddress, useUpdateAddress } from "@/hooks/use-addresses";
import type { AddressItem, CreateAddressPayload } from "@/services/addresses";
import { AddressSelector } from "@/components/checkout/AddressSelector";
import { AddAddressSheet } from "@/components/checkout/AddAddressSheet";
import { DeliverySlotPicker } from "@/components/checkout/DeliverySlotPicker";
import { PickupSlotPicker } from "@/components/checkout/PickupSlotPicker";
import { DeliveryUnavailableCard } from "@/components/checkout/DeliveryUnavailableCard";
import { EstimatedArrivalCard } from "@/components/checkout/EstimatedArrivalCard";
import { PickupStoreCard } from "@/components/checkout/PickupStoreCard";
import { useStore } from "@/hooks/use-store";
import { useStoreCustomer } from "@/hooks/use-store-customer";
import { useAuthStore } from "@/store/auth-store";
import { createDraftOrder } from "@/services/orders";
import { fetchActiveOffers, validateCoupon, type CouponValidation } from "@/services/promotions";

export default function CheckoutPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const pickupRef = useRef<HTMLDivElement>(null);
  const user = useAuthStore((state) => state.user);
  const cartQuery = useCart();
  const addressesQuery = useAddresses();
  const addAddressMutation = useAddAddress();
  const updateAddressMutation = useUpdateAddress();
  const removeAddressMutation = useRemoveAddress();
  const [stage, setStage] = useState<1 | 2>(1);
  const [selectedAddressId, setSelectedAddressId] = useState("");
  const [addressSheetOpen, setAddressSheetOpen] = useState(false);
  const [editingAddress, setEditingAddress] = useState<AddressItem | null>(null);
  const [deliverySlotId, setDeliverySlotId] = useState("");
  const [deliverySlotLabel, setDeliverySlotLabel] = useState("");
  const [pickupSlot, setPickupSlot] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<CheckoutPaymentMethod>("ONLINE");
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
  const [retryPaymentPayload, setRetryPaymentPayload] = useState<Record<string, unknown> | null>(null);
  const [paymentSuccess, setPaymentSuccess] = useState<{ amount: number; paymentId: string; readyText: string } | null>(null);
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
  const effectiveAddressId = selectedAddressId || selectedAddress?.addressId || "";
  const isPlusCustomer =
    !customerQuery.isError &&
    Boolean(
      customerQuery.data?.isPlusCustomer ??
      customerQuery.data?.customer?.isPlusCustomer,
    );
  const paymentLabel = paymentMethod === "ONLINE" ? "Razorpay" : paymentMethod === "PAY_AT_PICKUP" ? "Pay During Pickup" : "Pay During Delivery";
  const paymentStatusPreview = paymentMethod === "ONLINE" ? "Pending Payment" : paymentMethod === "PAY_AT_PICKUP" ? "Pay on Pickup" : "Pay on Delivery";
  const paymentValid = isPlusCustomer || paymentMethod === "ONLINE";
  const pickupEnabled = store?.pickupEnabled !== false;
  const deliveryEnabled = store?.deliveryEnabled === true;
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
  const configuredDeliveryFee = store?.deliveryFee ?? 0;
  const freeDeliveryAbove = store?.freeDeliveryAbove ?? 0;
  const preparationTimeMinutes = store?.preparationTimeMinutes ?? 30;
  const addressDistance = selectedAddress && store ? (() => {
    if (selectedAddress.latitude === undefined || selectedAddress.longitude === undefined || store.latitude === undefined || store.longitude === undefined) return null;
    const toRadians = (value: number) => value * Math.PI / 180;
    const latitudeDelta = toRadians(selectedAddress.latitude - store.latitude);
    const longitudeDelta = toRadians(selectedAddress.longitude - store.longitude);
    const a = Math.sin(latitudeDelta / 2) ** 2 + Math.cos(toRadians(store.latitude)) * Math.cos(toRadians(selectedAddress.latitude)) * Math.sin(longitudeDelta / 2) ** 2;
    return 6371 * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  })() : null;
  const deliveryUnavailable = deliveryMethod === "delivery" && addressDistance !== null && (store?.deliveryRadiusKm ?? 0) > 0 && addressDistance > (store?.deliveryRadiusKm ?? 0);
  const deliveryFee = deliveryMethod === "delivery" && !(freeDeliveryAbove > 0 && totals.subtotal >= freeDeliveryAbove) ? configuredDeliveryFee : 0;
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
    if (deliveryMethod === "delivery" && !effectiveAddressId) {
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
      if (deliveryMethod === "delivery" && (!effectiveAddressId || deliveryUnavailable || !deliverySlotId)) {
        setDraftError("Select an available address and delivery slot before placing your order.");
        return;
      }
      if (deliveryMethod === "pickup" && !pickupSlot) {
        setDraftError("Select a pickup time before placing your order.");
        return;
      }
      setCreatingOrder(true);
      setDraftError(null);
      setOrderSuccess(null);
      const payload = {
        addressId: effectiveAddressId,
        selectedAddressId: effectiveAddressId,
        deliveryDate: new Date(Date.now() + 86400000)
          .toISOString()
          .slice(0, 10),
        deliverySlot: deliveryMethod === "delivery" ? deliverySlotLabel : pickupSlot,
        paymentMethod,
        paymentRequiredBeforeConfirmation: paymentMethod === "ONLINE",
        deliveryMethod,
        fulfillmentType: deliveryMethod,
        deliverySlotId: deliveryMethod === "delivery" ? deliverySlotId : undefined,
        pickupSlot: deliveryMethod === "pickup" ? pickupSlot : undefined,
        estimatedReadyTime: new Date(Date.now() + preparationTimeMinutes * 60000).toISOString(),
        estimatedDeliveryWindow: deliveryMethod === "delivery" ? deliverySlotLabel : undefined,
        storeId: storeId || "",
        ...(appliedCoupon?.code ? { couponCode: appliedCoupon.code } : {}),
      };
      if (paymentMethod === "ONLINE") {
        await handleOnlinePayment(payload);
      } else {
        const order = await createDraftOrder(payload);
        setDraftOrder(order);
        setOrderSuccess("Order created successfully.");
        window.setTimeout(() => router.push("/orders"), 500);
      }
    } catch (error) {
      setDraftError(
        error instanceof Error ? error.message : "Unable to create order.",
      );
    } finally {
      setCreatingOrder(false);
    }
  };
  const saveAddress = (payload: CreateAddressPayload) => {
    if (editingAddress?.addressId) {
      updateAddressMutation.mutate({ addressId: editingAddress.addressId, payload }, { onSuccess: (address) => { if (address?.addressId) setSelectedAddressId(address.addressId); setAddressSheetOpen(false); setEditingAddress(null); } });
    } else {
      addAddressMutation.mutate(payload, { onSuccess: (address) => { if (address?.addressId) setSelectedAddressId(address.addressId); setAddressSheetOpen(false); } });
    }
  };
  const handleOnlinePayment = async (payload: Record<string, unknown>) => {
    try {
      setPaying(true);
      setPaymentError(null);
      setRetryPaymentPayload(payload);
      const loaded = await loadRazorpay();
      if (!loaded) throw new Error("Unable to load Razorpay.");
      const payment = await createPaymentOrder(payload);
      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || payment.key,
        amount: payment.amount,
        currency: payment.currency,
        order_id: payment.razorpayOrderId,
        name: "SheoMart",
        description: "SheoMart checkout",
        prefill: {
          name: "SheoMart Customer",
          email: "customer@example.com",
          contact: "9999999999",
        },
        theme: { color: "#16a34a" },
        modal: { ondismiss: () => setPaymentError("Payment was cancelled. No order was created.") },
      };
      (options as Record<string, unknown>).handler = async (response: { razorpay_order_id: string; razorpay_payment_id: string; razorpay_signature: string }) => {
        try {
          await verifyPayment({ razorpayOrderId: response.razorpay_order_id, razorpayPaymentId: response.razorpay_payment_id, razorpaySignature: response.razorpay_signature, checkout: payload });
          await queryClient.invalidateQueries({ queryKey: ["cart"] });
          setPaymentSuccess({ amount: payment.amount / 100, paymentId: response.razorpay_payment_id, readyText: deliveryMethod === "pickup" ? (pickupSlot || `Ready in ${preparationTimeMinutes} minutes`) : deliverySlotLabel });
        } catch (error) {
          setPaymentError(error instanceof Error ? error.message : "Payment verification failed. No order was created.");
        }
      };
      const Razorpay = (
        window as typeof window & {
          Razorpay?: new (options: Record<string, unknown>) => {
            open: () => void;
          };
        }
      ).Razorpay;
      if (!Razorpay) throw new Error("Razorpay SDK not available.");
      const razorpayInstance = new Razorpay(options) as { open: () => void; on?: (event: string, callback: () => void) => void };
      razorpayInstance.on?.("payment.failed", () => setPaymentError("Payment failed. No order was created. You can retry payment."));
      razorpayInstance.open();
    } catch (error) {
      setPaymentError(
        error instanceof Error ? error.message : "Unable to start payment.",
      );
    } finally {
      setPaying(false);
    }
  };
  void paying;

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
              <FulfillmentSelector value={deliveryMethod} onChange={(value) => { setDeliveryMethod(value); setStage(1); }} pickupEnabled={pickupEnabled} deliveryEnabled={deliveryEnabled} deliveryFee={configuredDeliveryFee} freeDeliveryAbove={freeDeliveryAbove} preparationTimeMinutes={preparationTimeMinutes} subtotal={totals.subtotal} />
              {deliveryMethod === "delivery" ? <AddressSelector addresses={addresses} selectedAddressId={effectiveAddressId} onSelect={(address) => setSelectedAddressId(address.addressId ?? "")} onEdit={(address) => { setEditingAddress(address); setAddressSheetOpen(true); }} onDelete={(address) => address.addressId && removeAddressMutation.mutate(address.addressId)} onAdd={() => { setEditingAddress(null); setAddressSheetOpen(true); }} /> : <PickupStoreCard store={store ?? null} />}
              {deliveryMethod === "delivery" && deliveryUnavailable ? <DeliveryUnavailableCard onChangeAddress={() => document.querySelector("[aria-labelledby='fulfillment-heading']")?.scrollIntoView({ behavior: "smooth" })} onSwitchToPickup={() => setDeliveryMethod("pickup")} /> : null}
              {draftError ? <div role="alert" className="rounded-xl border border-rose-200 bg-rose-50 p-3 text-sm text-rose-700">{draftError}</div> : null}
              <Button type="button" onClick={continueToPickup} disabled={deliveryUnavailable}>{stage === 1 ? "Continue" : "Review order"}</Button>
              {addressSheetOpen ? <AddAddressSheet address={editingAddress} onClose={() => { setAddressSheetOpen(false); setEditingAddress(null); }} onSave={saveAddress} saving={addAddressMutation.isPending || updateAddressMutation.isPending} /> : null}
              {stage === 2 ? (
                <div
                  ref={pickupRef}
                  className="grid items-start gap-6 xl:grid-cols-[minmax(0,1.1fr)_minmax(20rem,0.9fr)]"
                >
                  <div className="space-y-6">
                    <FulfillmentInfoCard type={deliveryMethod} store={store ?? null} address={[selectedAddress?.house, selectedAddress?.street, selectedAddress?.city, selectedAddress?.state, selectedAddress?.pincode].filter(Boolean).join(", ")} preparationTimeMinutes={preparationTimeMinutes} deliveryFee={configuredDeliveryFee} freeDeliveryAbove={freeDeliveryAbove} subtotal={totals.subtotal} />
                    {deliveryMethod === "delivery" ? <DeliverySlotPicker slots={store?.deliverySlots ?? []} value={deliverySlotId} onChange={(slot) => { setDeliverySlotId(slot.slotId); setDeliverySlotLabel(`${slot.label} (${slot.startTime} - ${slot.endTime})`); }} /> : <PickupSlotPicker openingTime={store?.pickupOpeningTime ?? "10:00"} closingTime={store?.pickupClosingTime ?? "20:00"} preparationTimeMinutes={preparationTimeMinutes} value={pickupSlot} onChange={setPickupSlot} />}
                    <EstimatedArrivalCard type={deliveryMethod} text={deliveryMethod === "delivery" ? (deliverySlotLabel || "Choose a delivery window") : (pickupSlot ? `Today • ${pickupSlot}` : `Ready in ${preparationTimeMinutes} minutes`)} />
                    <MembershipBanner isPlusCustomer={isPlusCustomer} />
                    <PaymentSelector value={paymentMethod} onChange={setPaymentMethod} isPlusCustomer={isPlusCustomer} fulfillmentType={deliveryMethod} />
                    <PaymentValidationNotice isPlusCustomer={isPlusCustomer} method={paymentMethod} />
                    <PaymentStatusCard method={paymentMethod} />
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
                      paymentStatusPreview={paymentStatusPreview}
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
                      canPlaceOrder={paymentValid}
                    />
                    {orderSuccess ? (
                      <div
                        role="status"
                        className="rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-700"
                      >
                        {orderSuccess}
                      </div>
                    ) : null}
                    {paymentError ? <div role="alert" className="rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-800 dark:border-rose-900/60 dark:bg-rose-950/30 dark:text-rose-200"><p className="font-semibold">Payment could not be completed</p><p className="mt-1">{paymentError}</p>{retryPaymentPayload ? <button type="button" onClick={() => handleOnlinePayment(retryPaymentPayload)} className="mt-3 font-semibold underline">Retry payment</button> : null}</div> : null}
                    {paymentSuccess ? <div role="dialog" aria-modal="true" className="rounded-2xl border border-emerald-200 bg-emerald-50 p-5 text-emerald-900 dark:border-emerald-900/60 dark:bg-emerald-950/30 dark:text-emerald-100"><h2 className="text-lg font-semibold">Payment Successful</h2><p className="mt-2 text-sm">Amount paid: ₹{paymentSuccess.amount.toLocaleString("en-IN")}</p><p className="mt-1 text-sm">Payment ID: {paymentSuccess.paymentId}</p><p className="mt-1 text-sm">Estimated arrival: {paymentSuccess.readyText}</p><div className="mt-4 flex flex-wrap gap-3"><Button type="button" onClick={() => router.push("/orders")}>View Order</Button><Button type="button" variant="outline" onClick={() => router.push("/")}>Continue Shopping</Button></div></div> : null}
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
