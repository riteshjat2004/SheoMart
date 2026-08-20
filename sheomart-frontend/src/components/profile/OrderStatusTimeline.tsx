import { Check, CircleCheck, Clock3, PackageCheck, Store, X } from "lucide-react";

interface OrderStatusTimelineProps {
  status?: string;
}

const steps = [
  { label: "Order Placed", icon: CircleCheck },
  { label: "Preparing", icon: Clock3 },
  { label: "Ready for Pickup", icon: Store },
  { label: "Picked Up", icon: PackageCheck },
];

const normalizeStatus = (status?: string): string => (status ?? "pending").toLowerCase().replace(/[_-]+/g, " ");

const getCurrentStep = (status?: string): number => {
  const normalized = normalizeStatus(status);
  if (normalized.includes("picked") || normalized.includes("completed")) return 3;
  if (normalized.includes("ready")) return 2;
  if (normalized.includes("prepar") || normalized.includes("confirm")) return 1;
  return 0;
};

export function OrderStatusTimeline({ status }: OrderStatusTimelineProps) {
  const normalizedStatus = normalizeStatus(status);
  const isCancelled = normalizedStatus.includes("cancel");
  const currentStep = getCurrentStep(status);

  return (
    <div aria-label="Order status timeline" className="space-y-0">
      {steps.map((step, index) => {
        const Icon = step.icon;
        const isCompleted = !isCancelled && index < currentStep;
        const isCurrent = !isCancelled && index === currentStep;
        return (
          <div key={step.label} className="relative flex gap-3 pb-5 last:pb-0">
            {index < steps.length - 1 ? (
              <span className={`absolute left-[0.6875rem] top-6 h-[calc(100%-0.5rem)] w-px ${isCompleted ? "bg-emerald-500" : "bg-stone-200 dark:bg-stone-700"}`} />
            ) : null}
            <span className={`relative z-10 flex h-6 w-6 shrink-0 items-center justify-center rounded-full border ${isCompleted || isCurrent ? "border-emerald-500 bg-emerald-500 text-white" : "border-stone-300 bg-white text-stone-400 dark:border-stone-700 dark:bg-stone-900"}`}>
              {isCompleted ? <Check className="h-3.5 w-3.5" /> : <Icon className="h-3.5 w-3.5" />}
            </span>
            <span className={`pt-0.5 text-sm ${isCurrent ? "font-semibold text-emerald-700 dark:text-emerald-300" : isCompleted ? "font-medium text-stone-700 dark:text-stone-200" : "text-stone-500 dark:text-stone-400"}`}>
              {step.label}
              {isCurrent ? <span className="ml-2 text-xs font-medium text-emerald-600 dark:text-emerald-400">Current</span> : null}
            </span>
          </div>
        );
      })}
      {isCancelled ? (
        <div className="flex gap-3">
          <span className="relative z-10 flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-red-500 bg-red-500 text-white">
            <X className="h-3.5 w-3.5" />
          </span>
          <span className="pt-0.5 text-sm font-semibold text-red-700 dark:text-red-300">Cancelled <span className="ml-2 text-xs font-medium">Current</span></span>
        </div>
      ) : null}
    </div>
  );
}
