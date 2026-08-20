import { Clock3, MapPin, Phone, Store } from "lucide-react";

export function PickupInfoCard() {
  return (
    <section className="rounded-[2rem] border border-stone-200 bg-white p-6 shadow-sm dark:border-stone-800 dark:bg-stone-900">
      <h2 className="text-sm font-semibold uppercase tracking-[0.28em] text-emerald-600">Pickup Information</h2>
      <div className="mt-5 space-y-4 text-sm">
        <div className="flex gap-3">
          <Store className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600 dark:text-emerald-400" />
          <div><p className="font-semibold text-stone-900 dark:text-stone-50">Store Name</p><p className="mt-1 text-stone-600 dark:text-stone-300">SheoMart Store</p></div>
        </div>
        <div className="flex gap-3">
          <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600 dark:text-emerald-400" />
          <div><p className="font-semibold text-stone-900 dark:text-stone-50">Pickup Address</p><p className="mt-1 text-stone-600 dark:text-stone-300">Main Market, Sheopur</p></div>
        </div>
        <div className="flex gap-3">
          <Clock3 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600 dark:text-emerald-400" />
          <div><p className="font-semibold text-stone-900 dark:text-stone-50">Pickup Hours</p><p className="mt-1 text-stone-600 dark:text-stone-300">10:00 AM - 8:00 PM</p><p className="mt-1 text-xs text-stone-500 dark:text-stone-400">Estimated pickup: 30 - 45 minutes</p></div>
        </div>
        <div className="flex gap-3">
          <Phone className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600 dark:text-emerald-400" />
          <div><p className="font-semibold text-stone-900 dark:text-stone-50">Store Phone</p><p className="mt-1 text-stone-600 dark:text-stone-300">+91 99999 99999</p></div>
        </div>
      </div>
    </section>
  );
}
