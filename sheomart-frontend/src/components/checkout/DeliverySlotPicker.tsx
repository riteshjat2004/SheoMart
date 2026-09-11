import type { DeliverySlot } from "@/services/store";

const minutes = (value: string) => {
  const [hours, mins] = value.split(":").map(Number);
  return hours * 60 + mins;
};

const formatTime = (value: string) => {
  const [hours, mins] = value.split(":").map(Number);
  const date = new Date(2000, 0, 1, hours, mins);
  return date.toLocaleTimeString("en-IN", { hour: "numeric", minute: "2-digit" });
};

export function DeliverySlotPicker({ slots, value, preparationTimeMinutes, onChange }: { slots: DeliverySlot[]; value?: string; preparationTimeMinutes: number; onChange: (slot: DeliverySlot, day: "Today" | "Tomorrow") => void }) {
  const activeSlots = slots.filter((slot) => slot.isActive || slot.active === true);
  const now = new Date();
  const renderSlot = (slot: DeliverySlot, day: "Today" | "Tomorrow") => {
    const remainingCapacity = slot.remainingCapacity ?? slot.capacity;
    const isPast = day === "Today" && minutes(slot.endTime) <= now.getHours() * 60 + now.getMinutes();
    const isFull = remainingCapacity === 0;
    const disabled = isPast || isFull;
    return <button key={`${day}-${slot.slotId}`} type="button" disabled={disabled} onClick={() => onChange(slot, day)} className={`rounded-xl border p-3 text-left text-sm transition motion-reduce:transition-none disabled:cursor-not-allowed disabled:opacity-40 ${value === slot.slotId ? "border-emerald-500 bg-emerald-50 text-emerald-800 dark:bg-emerald-500/10 dark:text-emerald-200" : "border-stone-200 dark:border-stone-800"}`}><div className="flex items-center justify-between gap-2"><span className="font-semibold">{formatTime(slot.startTime)} - {formatTime(slot.endTime)}</span><span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[11px] font-semibold text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300">Active</span></div>{remainingCapacity !== undefined ? <span className="mt-2 block text-xs text-stone-500">{isFull ? "Full" : `${remainingCapacity} remaining`}</span> : null}<span className="mt-1 block text-xs text-stone-500">Estimated arrival: about {preparationTimeMinutes + 60} minutes after preparation</span></button>;
  };
  return <section className="rounded-2xl border border-stone-200 bg-white p-5 shadow-sm dark:border-stone-800 dark:bg-stone-900"><h2 className="text-lg font-semibold">Choose delivery slot</h2><div className="mt-4 space-y-4"><div><p className="text-sm font-semibold text-stone-500">Today</p><div className="mt-2 grid gap-2 sm:grid-cols-2">{activeSlots.map((slot) => renderSlot(slot, "Today"))}</div></div><div><p className="text-sm font-semibold text-stone-500">Tomorrow</p><div className="mt-2 grid gap-2 sm:grid-cols-2">{activeSlots.map((slot) => renderSlot(slot, "Tomorrow"))}</div></div></div>{activeSlots.length === 0 ? <p className="mt-4 text-sm text-stone-500">No seller delivery slots are currently available.</p> : null}</section>;
}
