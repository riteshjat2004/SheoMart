import { PickupSummary } from "./PickupSummary";
import { DeliverySummary } from "./DeliverySummary";

export function FulfillmentInfoCard({ type, store, address, preparationTimeMinutes, deliveryFee, freeDeliveryAbove, subtotal }: { type: "pickup" | "delivery"; store: { address?: string; city?: string; state?: string; pincode?: string } | null; address: string; preparationTimeMinutes: number; deliveryFee: number; freeDeliveryAbove: number; subtotal: number }) {
  return <section className="rounded-2xl border border-stone-200 bg-white p-5 shadow-sm dark:border-stone-800 dark:bg-stone-900">{type === "pickup" ? <PickupSummary store={store} preparationTimeMinutes={preparationTimeMinutes} /> : <DeliverySummary address={address} fee={deliveryFee} isFree={freeDeliveryAbove > 0 && subtotal >= freeDeliveryAbove} estimatedMinutes={preparationTimeMinutes + 60} />}</section>;
}
