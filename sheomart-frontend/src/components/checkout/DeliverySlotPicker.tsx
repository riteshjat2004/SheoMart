"use client";

import type { DeliverySlot } from "@/services/store";
import { CheckCircle2, Clock } from "lucide-react";

const minutes = (value?: string) => {
  if (!value || typeof value !== "string") return 0;
  const parts = value.split(":");
  if (parts.length < 2) return 0;
  const hours = parseInt(parts[0], 10);
  const mins = parseInt(parts[1], 10);
  if (isNaN(hours) || isNaN(mins)) return 0;
  return hours * 60 + mins;
};

const formatTime = (value?: string) => {
  if (!value || typeof value !== "string") return "";
  const parts = value.split(":");
  if (parts.length < 2) return value;
  const hours = parseInt(parts[0], 10);
  const mins = parseInt(parts[1], 10);
  if (isNaN(hours) || isNaN(mins)) return value;
  const date = new Date(2000, 0, 1, hours, mins);
  return date.toLocaleTimeString("en-IN", { hour: "numeric", minute: "2-digit" });
};

export function DeliverySlotPicker({
  slots,
  value,
  selectedDay = "Today",
  preparationTimeMinutes,
  onChange,
}: {
  slots: DeliverySlot[];
  value?: string;
  selectedDay?: "Today" | "Tomorrow";
  preparationTimeMinutes: number;
  onChange: (slot: DeliverySlot, day: "Today" | "Tomorrow") => void;
}) {
  const activeSlots = slots.filter((slot) => slot.isActive || slot.active === true);
  const now = new Date();
  const currentMinutes = now.getHours() * 60 + now.getMinutes();

  const renderSlot = (slot: DeliverySlot, day: "Today" | "Tomorrow") => {
    const remainingCapacity = slot.remainingCapacity ?? slot.capacity;
    const isPast = day === "Today" && minutes(slot.endTime) <= currentMinutes;
    const isFull = remainingCapacity === 0;
    const disabled = isPast || isFull;
    const isSelected = value === slot.slotId && selectedDay === day;

    return (
      <button
        key={`${day}-${slot.slotId}`}
        type="button"
        disabled={disabled}
        onClick={() => onChange(slot, day)}
        className={`relative rounded-xl border p-3 text-left text-sm transition motion-reduce:transition-none disabled:cursor-not-allowed disabled:opacity-40 ${
          isSelected
            ? "border-emerald-600 bg-emerald-50 text-emerald-950 ring-2 ring-emerald-500/30 font-medium dark:border-emerald-500 dark:bg-emerald-500/10 dark:text-emerald-200"
            : "border-stone-200 bg-white hover:border-emerald-300 hover:bg-stone-50/50 text-stone-800 dark:border-stone-800 dark:bg-stone-900 dark:text-stone-200 dark:hover:border-stone-700"
        }`}
      >
        <div className="flex items-center justify-between gap-2">
          <span className="font-semibold">
            {formatTime(slot.startTime)} - {formatTime(slot.endTime)}
          </span>
          <div className="flex items-center gap-1.5">
            {isSelected ? (
              <CheckCircle2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
            ) : isPast ? (
              <span className="rounded-full bg-stone-100 px-2 py-0.5 text-[11px] font-semibold text-stone-500 dark:bg-stone-800 dark:text-stone-400">
                Passed
              </span>
            ) : isFull ? (
              <span className="rounded-full bg-rose-100 px-2 py-0.5 text-[11px] font-semibold text-rose-700 dark:bg-rose-950/60 dark:text-rose-300">
                Full
              </span>
            ) : (
              <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[11px] font-semibold text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300">
                Active
              </span>
            )}
          </div>
        </div>
        {remainingCapacity !== undefined ? (
          <span className="mt-2 block text-xs text-stone-500 dark:text-stone-400">
            {isFull ? "Full" : `${remainingCapacity} remaining`}
          </span>
        ) : null}
        <span className="mt-1 block text-xs text-stone-500 dark:text-stone-400">
          Estimated arrival: about {preparationTimeMinutes + 60} minutes after preparation
        </span>
      </button>
    );
  };

  return (
    <section className="rounded-2xl border border-stone-200 bg-white p-5 shadow-sm dark:border-stone-800 dark:bg-stone-900 transition-colors">
      <h2 className="text-lg font-semibold flex items-center gap-2 text-stone-900 dark:text-white">
        <Clock className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
        Choose delivery slot
      </h2>
      <div className="mt-4 space-y-4">
        <div>
          <p className="text-sm font-semibold text-stone-600 dark:text-stone-400 mb-2">Today</p>
          <div className="grid gap-2.5 sm:grid-cols-2">
            {activeSlots.map((slot) => renderSlot(slot, "Today"))}
          </div>
        </div>
        <div>
          <p className="text-sm font-semibold text-stone-600 dark:text-stone-400 mb-2">Tomorrow</p>
          <div className="grid gap-2.5 sm:grid-cols-2">
            {activeSlots.map((slot) => renderSlot(slot, "Tomorrow"))}
          </div>
        </div>
      </div>
      {activeSlots.length === 0 ? (
        <p className="mt-4 text-sm text-stone-500 dark:text-stone-400">
          No seller delivery slots are currently available.
        </p>
      ) : null}
    </section>
  );
}
