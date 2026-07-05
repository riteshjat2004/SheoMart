import Link from "next/link";
import { ArrowRight, Package2, Heart, MapPin, LifeBuoy, ShoppingCart } from "lucide-react";
import { Button } from "@/components/ui/button";

const actions = [
  { title: "My Orders", description: "Track your recent purchases.", icon: Package2, href: "/orders" },
  { title: "Wishlist", description: "Save products you love.", icon: Heart, href: "/wishlist" },
  { title: "Saved Addresses", description: "Manage delivery locations.", icon: MapPin, href: "/addresses" },
  { title: "Shopping Cart", description: "Review items and continue to checkout.", icon: ShoppingCart, href: "/cart" },
  { title: "Support", description: "Get help with orders and delivery.", icon: LifeBuoy, href: "/support" },
];

export function QuickActionsCard() {
  return (
    <div className="grid gap-3 sm:grid-cols-2">
      {actions.map((action) => {
        const Icon = action.icon;
        return (
          <div key={action.title} className="rounded-[1.5rem] border border-stone-200 bg-stone-50/70 p-4 dark:border-stone-800 dark:bg-stone-950/50">
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="flex items-center gap-2 text-sm font-medium text-stone-700 dark:text-stone-200">
                  <Icon className="h-4 w-4" />
                  {action.title}
                </div>
                <p className="mt-2 text-sm text-stone-600 dark:text-stone-300">{action.description}</p>
              </div>
              <Button asChild variant="ghost" size="icon" aria-label={`Open ${action.title}`}>
                <Link href={action.href}>
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
            </div>
          </div>
        );
      })}
    </div>
  );
}
