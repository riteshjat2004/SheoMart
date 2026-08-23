import { Check, CircleCheck, Clock3, PackageCheck, Store, X } from "lucide-react";

interface OrderStatusTimelineProps {
  pickupStatus?: string;
  status?: string;
  statusUpdatedAt?: string;
  paymentStatus?: string;
  createdAt?: string;
}

const steps = [
  { label: "Order Placed", icon: CircleCheck },
  { label: "Preparing", icon: Clock3 },
  { label: "Ready for Pickup", icon: Store },
  { label: "Picked Up", icon: PackageCheck },
];

const getCurrentStep = (status?: string): number => {
  const stepsByStatus: Record<string, number> = {
    ORDER_PLACED: 0,
    PREPARING: 1,
    READY_FOR_PICKUP: 2,
    PICKED_UP: 3,
  };
  return stepsByStatus[status ?? ""] ?? 0;
};

export function OrderStatusTimeline({ pickupStatus, status, statusUpdatedAt, paymentStatus, createdAt }: OrderStatusTimelineProps) {
  const currentStatus = pickupStatus ?? status;
  const isCancelled = currentStatus === "CANCELLED";
  const currentStep = getCurrentStep(currentStatus);
  const activityLabels = steps.slice(0, currentStep + 1).map((step) => step.label);
  if (isCancelled) {
    activityLabels.push("Cancelled");
  }

  return (
    <div aria-label="Order status timeline" className="space-y-0">
      {steps.map((step, index) => {
        const Icon = step.icon;
        const isCompleted = !isCancelled && index <= currentStep;
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
      <div className="mt-2 border-t border-stone-200 pt-4 dark:border-stone-700">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-stone-500 dark:text-stone-400">Activity</p>
        <div className="mt-3 space-y-2">
          {paymentStatus === "PAID" ? (
            <div className="flex items-center justify-between gap-3 text-sm">
              <span className="font-medium text-emerald-700 dark:text-emerald-300">Payment received</span>
              {statusUpdatedAt ? <time className="shrink-0 text-xs text-stone-500 dark:text-stone-400" dateTime={statusUpdatedAt}>{new Date(statusUpdatedAt).toLocaleString()}</time> : null}
            </div>
          ) : null}
          {[...activityLabels].reverse().map((label, index) => (
            <div key={label} className="flex items-center justify-between gap-3 text-sm">
              <span className={`font-medium ${label === "Cancelled" ? "text-red-700 dark:text-red-300" : "text-stone-700 dark:text-stone-200"}`}>{label}</span>
              {index === 0 && (statusUpdatedAt || createdAt) ? (
                <time className="shrink-0 text-xs text-stone-500 dark:text-stone-400" dateTime={statusUpdatedAt ?? createdAt}>
                  {new Date(statusUpdatedAt ?? createdAt!).toLocaleString()}
                </time>
              ) : null}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
