import type { DeliverySlot } from "@/services/store";

function minutes(value: string) { const [hours, mins] = value.split(":").map(Number); return hours * 60 + mins; }
export function PickupSlotPicker({ openingTime, closingTime, preparationTimeMinutes, value, onChange }: { openingTime: string; closingTime: string; preparationTimeMinutes: number; value?: string; onChange: (slot: string) => void }) {
  const now = new Date();
  const start = Math.max(minutes(openingTime), now.getHours() * 60 + now.getMinutes() + preparationTimeMinutes);
  const slots: DeliverySlot[] = [];
  for (let cursor = Math.ceil(start / 30) * 30; cursor + 30 <= minutes(closingTime); cursor += 30) { const hour = Math.floor(cursor / 60); const minute = String(cursor % 60).padStart(2, "0"); const end = cursor + 30; slots.push({ slotId: `pickup-${cursor}`, label: `${hour}:${minute} - ${String(Math.floor(end / 60)).padStart(2, "0")}:${String(end % 60).padStart(2, "0")}`, startTime: `${hour}:${minute}`, endTime: `${Math.floor(end / 60)}:${String(end % 60).padStart(2, "0")}`, isActive: true }); }
  return <section className="rounded-2xl border border-stone-200 bg-white p-5 shadow-sm dark:border-stone-800 dark:bg-stone-900"><h2 className="text-lg font-semibold">Choose pickup time</h2><div className="mt-4 grid gap-2 sm:grid-cols-2">{slots.map((slot) => <button key={slot.slotId} type="button" onClick={() => onChange(slot.label)} className={`rounded-xl border p-3 text-left text-sm ${value === slot.label ? "border-emerald-500 bg-emerald-50 dark:bg-emerald-500/10" : "border-stone-200 dark:border-stone-800"}`}>{slot.label}</button>)}</div></section>;
}
