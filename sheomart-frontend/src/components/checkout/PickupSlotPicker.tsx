"use client";

import { useMemo, useState, useEffect } from "react";
import { Clock, Calendar, CheckCircle2, AlertCircle } from "lucide-react";

function parseTimeToMinutes(timeStr?: string, fallback: number = 0): number {
  if (!timeStr || typeof timeStr !== "string") return fallback;
  const parts = timeStr.trim().split(":");
  if (parts.length < 2) return fallback;
  const hours = parseInt(parts[0], 10);
  const mins = parseInt(parts[1], 10);
  if (isNaN(hours) || isNaN(mins)) return fallback;
  return hours * 60 + mins;
}

function formatMinutesToTime(totalMinutes: number): string {
  const normalized = ((totalMinutes % 1440) + 1440) % 1440;
  const hours = Math.floor(normalized / 60);
  const mins = normalized % 60;
  const date = new Date(2000, 0, 1, hours, mins);
  return date.toLocaleTimeString("en-IN", { hour: "numeric", minute: "2-digit" });
}

export interface PickupSlotItem {
  id: string;
  label: string;
  startTime: string;
  endTime: string;
  startMinutes: number;
  endMinutes: number;
  isPast: boolean;
}

export function PickupSlotPicker({
  openingTime,
  closingTime,
  preparationTimeMinutes = 15,
  value,
  selectedDay = "Today",
  onChange,
}: {
  openingTime?: string;
  closingTime?: string;
  preparationTimeMinutes?: number;
  value?: string;
  selectedDay?: "Today" | "Tomorrow";
  onChange: (slot: string, day: "Today" | "Tomorrow") => void;
}) {
  // Safe opening / closing times with robust fallbacks
  const openMins = useMemo(() => parseTimeToMinutes(openingTime, 540), [openingTime]); // Default 09:00 AM
  const closeMins = useMemo(() => {
    const parsed = parseTimeToMinutes(closingTime, 1260); // Default 09:00 PM
    return parsed <= openMins ? openMins + 12 * 60 : parsed;
  }, [closingTime, openMins]);

  // Current time calculations
  const now = new Date();
  const currentMinutes = now.getHours() * 60 + now.getMinutes();
  const earliestAllowedMinutes = currentMinutes + Math.max(preparationTimeMinutes, 15);

  // Generate regular 30-min slots for the day
  const baseSlots = useMemo(() => {
    const list: { start: number; end: number; label: string; id: string }[] = [];
    for (let cursor = openMins; cursor + 30 <= closeMins; cursor += 30) {
      const end = cursor + 30;
      list.push({
        id: `slot-${cursor}`,
        start: cursor,
        end,
        label: `${formatMinutesToTime(cursor)} - ${formatMinutesToTime(end)}`,
      });
    }
    // Fallback if interval yielded nothing
    if (list.length === 0) {
      list.push({
        id: `slot-standard`,
        start: openMins,
        end: closeMins,
        label: `${formatMinutesToTime(openMins)} - ${formatMinutesToTime(closeMins)}`,
      });
    }
    return list;
  }, [openMins, closeMins]);

  // Today's slots with past/disabled states
  const todaySlots = useMemo<PickupSlotItem[]>(() => {
    return baseSlots.map((s) => ({
      id: `today-${s.id}`,
      label: s.label,
      startTime: formatMinutesToTime(s.start),
      endTime: formatMinutesToTime(s.end),
      startMinutes: s.start,
      endMinutes: s.end,
      isPast: s.end <= earliestAllowedMinutes,
    }));
  }, [baseSlots, earliestAllowedMinutes]);

  // Tomorrow's slots (all available)
  const tomorrowSlots = useMemo<PickupSlotItem[]>(() => {
    return baseSlots.map((s) => ({
      id: `tomorrow-${s.id}`,
      label: s.label,
      startTime: formatMinutesToTime(s.start),
      endTime: formatMinutesToTime(s.end),
      startMinutes: s.start,
      endMinutes: s.end,
      isPast: false,
    }));
  }, [baseSlots]);

  const todayAvailableSlots = useMemo(() => todaySlots.filter((s) => !s.isPast), [todaySlots]);
  const isTodayClosed = todayAvailableSlots.length === 0;

  // Active tab state: if today is closed, default to Tomorrow
  const [activeTab, setActiveTab] = useState<"Today" | "Tomorrow">(() => {
    if (selectedDay) return selectedDay;
    return isTodayClosed ? "Tomorrow" : "Today";
  });

  // Sync tab if today closed and currently on Today
  useEffect(() => {
    if (isTodayClosed && activeTab === "Today") {
      setActiveTab("Tomorrow");
    }
  }, [isTodayClosed, activeTab]);

  // Auto-select earliest available slot if none selected yet
  useEffect(() => {
    if (!value) {
      if (todayAvailableSlots.length > 0) {
        onChange(todayAvailableSlots[0].label, "Today");
      } else if (tomorrowSlots.length > 0) {
        onChange(tomorrowSlots[0].label, "Tomorrow");
      }
    }
  }, [value, todayAvailableSlots, tomorrowSlots, onChange]);

  const activeSlots = activeTab === "Today" ? todaySlots : tomorrowSlots;

  return (
    <section className="rounded-2xl border border-stone-200 bg-white p-5 shadow-sm dark:border-stone-800 dark:bg-stone-900 transition-colors">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-lg font-semibold flex items-center gap-2 text-stone-900 dark:text-white">
            <Clock className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
            Choose pickup time
          </h2>
          <p className="mt-1 text-xs text-stone-500 dark:text-stone-400">
            Store pickup hours: {formatMinutesToTime(openMins)} – {formatMinutesToTime(closeMins)} • Ready in ~{preparationTimeMinutes} mins
          </p>
        </div>

        {/* Day Selector Tabs */}
        <div className="flex rounded-xl bg-stone-100 p-1 dark:bg-stone-800/80 self-start sm:self-auto">
          <button
            type="button"
            onClick={() => {
              setActiveTab("Today");
              if (!isTodayClosed && todayAvailableSlots.length > 0) {
                if (!todayAvailableSlots.some((s) => s.label === value && selectedDay === "Today")) {
                  onChange(todayAvailableSlots[0].label, "Today");
                }
              }
            }}
            className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
              activeTab === "Today"
                ? "bg-white text-stone-900 shadow-xs dark:bg-stone-900 dark:text-white"
                : "text-stone-500 hover:text-stone-900 dark:text-stone-400 dark:hover:text-white"
            }`}
          >
            <Calendar className="h-3.5 w-3.5" />
            Today
            {isTodayClosed ? (
              <span className="rounded-md bg-stone-200/80 px-1.5 py-0.2 text-[10px] text-stone-600 dark:bg-stone-700 dark:text-stone-300">
                Closed
              </span>
            ) : (
              <span className="rounded-md bg-emerald-100 px-1.5 py-0.2 text-[10px] text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300">
                {todayAvailableSlots.length} left
              </span>
            )}
          </button>
          <button
            type="button"
            onClick={() => {
              setActiveTab("Tomorrow");
              if (tomorrowSlots.length > 0) {
                if (!tomorrowSlots.some((s) => s.label === value && selectedDay === "Tomorrow")) {
                  onChange(tomorrowSlots[0].label, "Tomorrow");
                }
              }
            }}
            className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
              activeTab === "Tomorrow"
                ? "bg-white text-stone-900 shadow-xs dark:bg-stone-900 dark:text-white"
                : "text-stone-500 hover:text-stone-900 dark:text-stone-400 dark:hover:text-white"
            }`}
          >
            <Calendar className="h-3.5 w-3.5" />
            Tomorrow
            <span className="rounded-md bg-stone-200/80 px-1.5 py-0.2 text-[10px] text-stone-600 dark:bg-stone-700 dark:text-stone-300">
              Open
            </span>
          </button>
        </div>
      </div>

      {/* Closed Notice for Today if activeTab is Today */}
      {activeTab === "Today" && isTodayClosed ? (
        <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50/70 p-4 dark:border-amber-900/60 dark:bg-amber-950/30">
          <div className="flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-amber-600 shrink-0 mt-0.5 dark:text-amber-400" />
            <div className="flex-1">
              <p className="text-sm font-semibold text-amber-900 dark:text-amber-200">
                Store is closed for pickup today
              </p>
              <p className="mt-1 text-xs text-amber-700 dark:text-amber-300">
                Today&apos;s pickup hours ended at {formatMinutesToTime(closeMins)}. Please select from tomorrow&apos;s available pickup slots below.
              </p>
              <button
                type="button"
                onClick={() => {
                  setActiveTab("Tomorrow");
                  if (tomorrowSlots.length > 0) {
                    onChange(tomorrowSlots[0].label, "Tomorrow");
                  }
                }}
                className="mt-3 inline-flex items-center gap-1.5 rounded-lg bg-amber-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-amber-700 transition shadow-xs"
              >
                View Tomorrow&apos;s Slots ({tomorrowSlots.length} available)
              </button>
            </div>
          </div>
        </div>
      ) : null}

      {/* Slots Grid */}
      {!(activeTab === "Today" && isTodayClosed) ? (
        <div className="mt-4 grid gap-2.5 sm:grid-cols-2 lg:grid-cols-3">
          {activeSlots.map((slot) => {
            const isSelected = value === slot.label && selectedDay === activeTab;
            return (
              <button
                key={slot.id}
                type="button"
                disabled={slot.isPast}
                onClick={() => onChange(slot.label, activeTab)}
                className={`relative flex items-center justify-between rounded-xl border p-3 text-left text-sm transition motion-reduce:transition-none disabled:cursor-not-allowed disabled:opacity-40 ${
                  isSelected
                    ? "border-emerald-600 bg-emerald-50 text-emerald-950 dark:border-emerald-500 dark:bg-emerald-500/10 dark:text-emerald-200 ring-2 ring-emerald-500/30 font-medium"
                    : "border-stone-200 bg-white hover:border-emerald-300 hover:bg-stone-50/50 text-stone-800 dark:border-stone-800 dark:bg-stone-900 dark:hover:border-stone-700 dark:text-stone-200"
                }`}
              >
                <div>
                  <span className="font-semibold block">{slot.label}</span>
                  <span className="text-xs text-stone-500 dark:text-stone-400 mt-0.5 block">
                    {slot.isPast ? "Passed" : `${activeTab} pickup`}
                  </span>
                </div>
                {isSelected ? (
                  <CheckCircle2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                ) : null}
              </button>
            );
          })}
        </div>
      ) : null}
    </section>
  );
}
